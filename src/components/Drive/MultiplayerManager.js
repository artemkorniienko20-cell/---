import { Peer } from 'peerjs';

/**
 * MultiplayerManager
 * Handles real-time WebRTC Peer-to-Peer communication (via PeerJS)
 * with automatic BroadcastChannel fallback for instant same-machine multi-tab play.
 */
export class MultiplayerManager {
  constructor() {
    this.playerId = 'p_' + Math.random().toString(36).substring(2, 9);
    this.nickname = this.loadNickname();
    this.isHost = false;
    this.roomCode = null;
    this.status = 'offline'; // 'offline' | 'connecting' | 'connected' | 'hosting'

    // PeerJS instances
    this.peer = null;
    this.connections = new Map(); // peerId -> DataConnection
    this.hostConnection = null;   // DataConnection to host (if client)

    // BroadcastChannel for local/multi-tab synchronization
    this.localChannel = null;
    this.initBroadcastChannel();

    // Callbacks
    this.onPlayersUpdate = null; // (playersMap) => {}
    this.onChatMessage = null;   // (msgObj) => {}
    this.onActionEvent = null;   // (actionObj) => {}
    this.onStatusChange = null;  // (status, details) => {}

    // Connected players state cache
    this.remotePlayers = new Map(); // id -> { id, nickname, role, carConfig, x, y, z, yaw, ... }

    // Heartbeat & Sync Timers
    this.syncInterval = null;
    this.cleanupInterval = setInterval(() => this.cleanupStalePlayers(), 4000);
  }

  loadNickname() {
    try {
      const saved = localStorage.getItem('pr5_player_nickname');
      if (saved && saved.trim()) return saved.trim();
    } catch {}
    const suffixes = ['Київ', 'Козак', 'Сокіл', 'Гепард', 'Драйвер', 'Воїн', 'Байрактар', 'Орел'];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    const generated = `${randomSuffix}_${num}`;
    try {
      localStorage.setItem('pr5_player_nickname', generated);
    } catch {}
    return generated;
  }

  setNickname(name) {
    if (!name || !name.trim()) return;
    this.nickname = name.trim();
    try {
      localStorage.setItem('pr5_player_nickname', this.nickname);
    } catch {}
    this.broadcastState({ nickname: this.nickname });
  }

  initBroadcastChannel() {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;
    try {
      this.localChannel = new BroadcastChannel('pr5_city_multiplayer_channel');
      this.localChannel.onmessage = (e) => {
        const msg = e.data;
        if (!msg || msg.senderId === this.playerId) return;
        this.handleIncomingMessage(msg);
      };
    } catch (err) {
      console.warn('BroadcastChannel initialization error:', err);
    }
  }

  setStatus(newStatus, details = null) {
    this.status = newStatus;
    if (this.onStatusChange) {
      this.onStatusChange(this.status, details);
    }
  }

  /**
   * Host a room with a given room code (or auto-generated)
   */
  async hostRoom(desiredCode = null, city = 'kyiv') {
    this.disconnect();
    const code = (desiredCode || 'UA-' + Math.floor(1000 + Math.random() * 9000)).toUpperCase().trim();
    this.roomCode = code;
    this.isHost = true;
    this.setStatus('connecting', `Створення сервера «${code}»...`);

    const peerId = `pr5-room-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    try {
      this.peer = new Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        this.setStatus('hosting', `Сервер «${code}» онлайн. Очікування гравців...`);
        // Broadcast discovery locally
        this.sendLocal({
          type: 'HOST_ANNOUNCEMENT',
          roomCode: this.roomCode,
          hostId: this.playerId,
          city
        });
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('Peer host error:', err);
        // Fallback: If PeerJS ID taken or offline, still maintain local broadcast hosting!
        this.setStatus('hosting', `Локальний сервер «${code}» активний`);
      });
    } catch (err) {
      console.warn('PeerJS init failed, falling back to local BroadcastChannel:', err);
      this.setStatus('hosting', `Локальний сервер «${code}» (Мережа відкрита)`);
    }

    return code;
  }

  /**
   * Join an existing room code
   */
  async joinRoom(code) {
    if (!code) return false;
    this.disconnect();
    const formattedCode = code.toUpperCase().trim();
    this.roomCode = formattedCode;
    this.isHost = false;
    this.setStatus('connecting', `Підключення до кімнати «${formattedCode}»...`);

    const hostPeerId = `pr5-room-${formattedCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const myClientPeerId = `pr5-client-${this.playerId}`;

    try {
      this.peer = new Peer(myClientPeerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', () => {
        const conn = this.peer.connect(hostPeerId, { reliable: true });
        this.setupConnection(conn, true);
      });

      this.peer.on('error', (err) => {
        console.warn('Peer join error:', err);
        // Still try to connect over local BroadcastChannel
        this.sendLocal({
          type: 'CLIENT_HELLO',
          roomCode: formattedCode,
          playerId: this.playerId,
          nickname: this.nickname
        });
        this.setStatus('connected', `Підключено локально до «${formattedCode}»`);
      });
    } catch (err) {
      console.warn('Peer connect error:', err);
      this.setStatus('connected', `Підключено локально до «${formattedCode}»`);
    }

    // Ping on local channel too
    this.sendLocal({
      type: 'CLIENT_HELLO',
      roomCode: formattedCode,
      playerId: this.playerId,
      nickname: this.nickname
    });

    return true;
  }

  setupConnection(conn, isHostConn = false) {
    conn.on('open', () => {
      if (isHostConn) {
        this.hostConnection = conn;
        this.setStatus('connected', `Успішно підключено до «${this.roomCode}»!`);
      } else {
        this.connections.set(conn.peer, conn);
        this.setStatus('hosting', `Гравців у кімнаті: ${this.connections.size + 1}`);
      }

      // Send initial handshake
      conn.send({
        type: 'HANDSHAKE',
        senderId: this.playerId,
        nickname: this.nickname,
        roomCode: this.roomCode
      });
    });

    conn.on('data', (data) => {
      this.handleIncomingMessage(data);
      // If we are host, relay data to other clients (P2P mesh star topology)
      if (this.isHost && data.type !== 'HANDSHAKE') {
        this.connections.forEach((c) => {
          if (c !== conn && c.open) {
            c.send(data);
          }
        });
      }
    });

    conn.on('close', () => {
      if (isHostConn) {
        this.hostConnection = null;
        this.setStatus('offline', 'Зв\'язок із сервером втрачено');
      } else {
        this.connections.delete(conn.peer);
        this.setStatus('hosting', `Гравців у кімнаті: ${this.connections.size + 1}`);
      }
    });
  }

  /**
   * Handle incoming network message from PeerJS or BroadcastChannel
   */
  handleIncomingMessage(msg) {
    if (!msg || msg.senderId === this.playerId) return;

    if (msg.type === 'PLAYER_STATE') {
      const pId = msg.senderId;
      const prev = this.remotePlayers.get(pId) || {};
      const updated = {
        ...prev,
        ...msg.state,
        id: pId,
        nickname: msg.nickname || prev.nickname || 'Невідомий',
        lastSeen: Date.now()
      };
      this.remotePlayers.set(pId, updated);
      if (this.onPlayersUpdate) {
        this.onPlayersUpdate(new Map(this.remotePlayers));
      }
    } else if (msg.type === 'CHAT_MSG') {
      if (this.onChatMessage) {
        this.onChatMessage(msg.payload);
      }
    } else if (msg.type === 'ACTION_EVENT') {
      if (this.onActionEvent) {
        this.onActionEvent(msg.payload);
      }
    } else if (msg.type === 'PLAYER_LEAVE') {
      this.remotePlayers.delete(msg.senderId);
      if (this.onPlayersUpdate) {
        this.onPlayersUpdate(new Map(this.remotePlayers));
      }
    } else if (msg.type === 'HANDSHAKE' || msg.type === 'CLIENT_HELLO') {
      // Respond with our own state
      this.broadcastState({});
    }
  }

  /**
   * Broadcast player's state (coords, vehicle, weapon, appearance) to all peers
   */
  broadcastState(state) {
    if (this.status === 'offline') {
      // Even in offline mode, broadcast to local tabs so players can test easily!
    }

    const payload = {
      type: 'PLAYER_STATE',
      senderId: this.playerId,
      nickname: this.nickname,
      roomCode: this.roomCode,
      state: {
        ...state,
        timestamp: Date.now()
      }
    };

    // 1. Send via PeerJS WebRTC
    if (this.isHost) {
      this.connections.forEach(conn => {
        if (conn.open) conn.send(payload);
      });
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(payload);
    }

    // 2. Send via BroadcastChannel for multi-tab
    this.sendLocal(payload);
  }

  /**
   * Send a public in-game chat message
   */
  sendChatMessage(text, role = 'civilian') {
    if (!text || !text.trim()) return null;
    const cleanText = text.trim().slice(0, 160);

    const chatPayload = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      senderId: this.playerId,
      nickname: this.nickname,
      text: cleanText,
      role: role, // 'civilian' | 'police' | 'army'
      timestamp: Date.now()
    };

    const msg = {
      type: 'CHAT_MSG',
      senderId: this.playerId,
      payload: chatPayload
    };

    // Deliver locally
    if (this.onChatMessage) {
      this.onChatMessage(chatPayload);
    }

    // Broadcast WebRTC
    if (this.isHost) {
      this.connections.forEach(conn => {
        if (conn.open) conn.send(msg);
      });
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(msg);
    }

    // Broadcast local tabs
    this.sendLocal(msg);

    return chatPayload;
  }

  /**
   * Send tactical action event (e.g. Tank Cannon fired, Air Alarm triggered, Shahed destroyed)
   */
  sendActionEvent(actionType, actionData = {}) {
    const actionObj = {
      id: 'act_' + Math.random().toString(36).substring(2, 9),
      senderId: this.playerId,
      nickname: this.nickname,
      actionType,
      actionData,
      timestamp: Date.now()
    };

    const msg = {
      type: 'ACTION_EVENT',
      senderId: this.playerId,
      payload: actionObj
    };

    if (this.isHost) {
      this.connections.forEach(conn => {
        if (conn.open) conn.send(msg);
      });
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(msg);
    }

    this.sendLocal(msg);
  }

  sendLocal(data) {
    if (this.localChannel) {
      try {
        this.localChannel.postMessage(data);
      } catch (err) {
        console.warn('Local postMessage error:', err);
      }
    }
  }

  cleanupStalePlayers() {
    const now = Date.now();
    let hasChanges = false;
    this.remotePlayers.forEach((p, id) => {
      if (now - (p.lastSeen || 0) > 8000) {
        this.remotePlayers.delete(id);
        hasChanges = true;
      }
    });
    if (hasChanges && this.onPlayersUpdate) {
      this.onPlayersUpdate(new Map(this.remotePlayers));
    }
  }

  disconnect() {
    if (this.connections.size > 0 || this.hostConnection || this.localChannel) {
      const leaveMsg = {
        type: 'PLAYER_LEAVE',
        senderId: this.playerId
      };
      this.sendLocal(leaveMsg);
      if (this.isHost) {
        this.connections.forEach(conn => {
          if (conn.open) conn.send(leaveMsg);
        });
      } else if (this.hostConnection && this.hostConnection.open) {
        this.hostConnection.send(leaveMsg);
      }
    }

    this.connections.forEach(conn => conn.close());
    this.connections.clear();
    if (this.hostConnection) {
      this.hostConnection.close();
      this.hostConnection = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }

    this.remotePlayers.clear();
    this.isHost = false;
    this.roomCode = null;
    this.setStatus('offline');
  }

  destroy() {
    this.disconnect();
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    if (this.localChannel) {
      try {
        this.localChannel.close();
      } catch {}
      this.localChannel = null;
    }
  }
}
