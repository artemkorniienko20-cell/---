import * as THREE from 'three';
import { ThreeCarBuilder } from '../Visualizer/ThreeCarBuilder';
import { HumanCharacter } from './HumanCharacter';

/**
 * Creates dynamic 2D canvas texture for in-game 3D Billboard Nameplate above player
 */
function createPlayerNameplateTexture(nickname, role, hp = 100, chatText = null) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 256);

  // 1. Draw Speech Bubble if there is recent chat message
  if (chatText) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;

    // Rounded bubble box
    const bx = 30, by = 10, bw = 452, bh = 75, r = 16;
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + bw - r, by);
    ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
    ctx.lineTo(bx + bw, by + bh - r);
    ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
    // Bubble pointer down
    ctx.lineTo(256 + 15, by + bh);
    ctx.lineTo(256, by + bh + 16);
    ctx.lineTo(256 - 15, by + bh);
    ctx.lineTo(bx + r, by + bh);
    ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
    ctx.lineTo(bx, by + r);
    ctx.quadraticCurveTo(bx, by, bx + r, by);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text in speech bubble
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const truncatedText = chatText.length > 28 ? chatText.slice(0, 26) + '...' : chatText;
    ctx.fillText(`💬 ${truncatedText}`, 256, by + bh / 2);
    ctx.restore();
  }

  // 2. Draw Nameplate Card
  const py = 120;
  ctx.save();
  ctx.fillStyle = 'rgba(5, 7, 14, 0.88)';
  ctx.strokeStyle = role === 'army' ? '#eab308' : role === 'police' ? '#3b82f6' : '#06b6d4';
  ctx.lineWidth = 4;

  const nx = 40, nw = 432, nh = 100, nr = 20;
  ctx.beginPath();
  ctx.roundRect(nx, py, nw, nh, nr);
  ctx.fill();
  ctx.stroke();

  // Role Badge Color & Icon
  let roleIcon = '👤';
  let roleTitle = 'ЦИВІЛЬНИЙ';
  let badgeBg = '#334155';
  let badgeColor = '#94a3b8';

  if (role === 'army') {
    roleIcon = '🪖';
    roleTitle = 'ЗСУ • ППО';
    badgeBg = '#14532d';
    badgeColor = '#facc15';
  } else if (role === 'police') {
    roleIcon = '👮';
    roleTitle = 'ПОЛІЦІЯ 102';
    badgeBg = '#1e3a8a';
    badgeColor = '#60a5fa';
  }

  // Role pill
  ctx.fillStyle = badgeBg;
  ctx.beginPath();
  ctx.roundRect(nx + 16, py + 12, 140, 32, 10);
  ctx.fill();

  ctx.fillStyle = badgeColor;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${roleIcon} ${roleTitle}`, nx + 86, py + 28);

  // Nickname
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(nickname, nx + 170, py + 28);

  // Health Bar
  const hx = nx + 16;
  const hy = py + 56;
  const hw = nw - 32;
  const hh = 16;

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(hx, hy, hw, hh, 8);
  ctx.fill();

  const currentHp = Math.max(0, Math.min(100, hp));
  const hpWidth = (hw * currentHp) / 100;
  ctx.fillStyle = currentHp > 50 ? '#10b981' : currentHp > 25 ? '#f59e0b' : '#ef4444';
  if (hpWidth > 0) {
    ctx.beginPath();
    ctx.roundRect(hx, hy, hpWidth, hh, 8);
    ctx.fill();
  }

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Builds standalone 3D Tank mesh for remote players
 */
function createRemoteTankModel() {
  const tank = new THREE.Group();

  // Hull
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x3a4837, roughness: 0.75, metalness: 0.35 });
  const hull = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.25, 6.8), hullMat);
  hull.position.y = 1.0;
  tank.add(hull);

  // Turret
  const turret = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.75, 0.9, 14), hullMat);
  turret.position.set(0, 1.9, 0.2);
  tank.add(turret);

  // 125mm Gun barrel
  const gunMat = new THREE.MeshStandardMaterial({ color: 0x273325, metalness: 0.6, roughness: 0.4 });
  const gun = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 5.8, 12), gunMat);
  gun.rotation.x = Math.PI / 2;
  gun.position.set(0, 1.95, 3.8);
  tank.add(gun);

  // White ZSU Cross
  const crossMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const cV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.05), crossMat);
  cV.position.set(1.55, 1.9, 0.2);
  cV.rotation.y = Math.PI / 2;
  tank.add(cV);
  const cH = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.05), crossMat);
  cH.position.set(1.55, 1.9, 0.2);
  cH.rotation.y = Math.PI / 2;
  tank.add(cH);

  return tank;
}

/**
 * Builds standalone 3D Kozak-2M Combat Armor mesh for remote players
 */
function createRemoteKozakModel() {
  const kozak = new THREE.Group();
  const armorMat = new THREE.MeshStandardMaterial({ color: 0x3d4b3b, roughness: 0.7, metalness: 0.3 });

  // Main body
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.8, 5.4), armorMat);
  body.position.y = 1.35;
  kozak.add(body);

  // AA Turret on top
  const turretMat = new THREE.MeshStandardMaterial({ color: 0x1f291e, metalness: 0.7, roughness: 0.3 });
  const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.6, 12), turretMat);
  turret.position.set(0, 2.5, 0);
  kozak.add(turret);

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8), turretMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 2.65, 1.4);
  kozak.add(barrel);

  return kozak;
}

/**
 * RemotePlayerEntity
 * Represents a single connected multiplayer player in the 3D scene
 */
class RemotePlayerEntity {
  constructor(id, scene, initialData) {
    this.id = id;
    this.scene = scene;
    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.nickname = initialData.nickname || 'Гравець';
    this.role = initialData.role || 'civilian';
    this.hp = initialData.hp || 100;
    this.isHumanOnFoot = !!initialData.isHumanOnFoot;
    this.isDrivingTank = !!initialData.isDrivingTank;
    this.isDrivingMilitaryCar = !!initialData.isDrivingMilitaryCar;
    this.carConfig = initialData.carConfig || { modelId: 'cybertruck', paintColor: '#38bdf8' };

    // Interpolation targets
    this.targetPos = new THREE.Vector3(initialData.x || 0, 0, initialData.z || 0);
    this.targetYaw = initialData.yaw || 0;
    this.currentPos = new THREE.Vector3().copy(this.targetPos);
    this.currentYaw = this.targetYaw;
    this.speedKmh = 0;

    // Sub-components
    this.carBuilder = null;
    this.humanCharacter = null;
    this.tankMesh = null;
    this.kozakMesh = null;

    // Billboard Sprite
    this.nameplateSprite = null;
    this.lastChatText = null;
    this.chatExpireTime = 0;

    this.initVisuals();
    this.updateNameplate();
  }

  initVisuals() {
    // 1. Build Car
    this.carBuilder = new ThreeCarBuilder(this.root);
    try {
      this.carBuilder.buildCar(this.carConfig);
    } catch (e) {
      console.warn('Failed to build car for remote player:', e);
    }

    // 2. Build Human
    this.humanCharacter = new HumanCharacter(this.root);
    this.humanCharacter.setProfession(this.role);
    this.humanCharacter.setEquippedWeapon('fists');
    this.humanCharacter.despawn();

    // 3. Tank & Kozak models
    this.tankMesh = createRemoteTankModel();
    this.tankMesh.visible = false;
    this.root.add(this.tankMesh);

    this.kozakMesh = createRemoteKozakModel();
    this.kozakMesh.visible = false;
    this.root.add(this.kozakMesh);

    // 4. Nameplate Sprite
    const spriteMat = new THREE.SpriteMaterial({
      transparent: true,
      depthTest: false
    });
    this.nameplateSprite = new THREE.Sprite(spriteMat);
    this.nameplateSprite.scale.set(4.2, 2.1, 1);
    this.nameplateSprite.position.set(0, 2.9, 0);
    this.root.add(this.nameplateSprite);

    this.syncVisibility();
  }

  syncVisibility() {
    if (this.isHumanOnFoot) {
      if (this.carBuilder?.carGroup) this.carBuilder.carGroup.visible = false;
      if (this.tankMesh) this.tankMesh.visible = false;
      if (this.kozakMesh) this.kozakMesh.visible = false;
      if (this.humanCharacter) {
        this.humanCharacter.spawn(0, 0, 0);
        this.humanCharacter.group.visible = true;
      }
      this.nameplateSprite.position.set(0, 2.5, 0);
    } else if (this.isDrivingTank) {
      if (this.carBuilder?.carGroup) this.carBuilder.carGroup.visible = false;
      if (this.humanCharacter?.group) this.humanCharacter.group.visible = false;
      if (this.kozakMesh) this.kozakMesh.visible = false;
      if (this.tankMesh) this.tankMesh.visible = true;
      this.nameplateSprite.position.set(0, 3.8, 0);
    } else if (this.isDrivingMilitaryCar) {
      if (this.carBuilder?.carGroup) this.carBuilder.carGroup.visible = false;
      if (this.humanCharacter?.group) this.humanCharacter.group.visible = false;
      if (this.tankMesh) this.tankMesh.visible = false;
      if (this.kozakMesh) this.kozakMesh.visible = true;
      this.nameplateSprite.position.set(0, 3.4, 0);
    } else {
      // Standard Player Car
      if (this.carBuilder?.carGroup) this.carBuilder.carGroup.visible = true;
      if (this.humanCharacter?.group) this.humanCharacter.group.visible = false;
      if (this.tankMesh) this.tankMesh.visible = false;
      if (this.kozakMesh) this.kozakMesh.visible = false;
      this.nameplateSprite.position.set(0, 2.7, 0);
    }
  }

  updateData(data) {
    if (data.x !== undefined && data.z !== undefined) {
      this.targetPos.set(data.x, data.y || 0, data.z);
    }
    if (data.yaw !== undefined) {
      this.targetYaw = data.yaw;
    }
    if (data.speedKmh !== undefined) {
      this.speedKmh = data.speedKmh;
    }
    if (data.hp !== undefined && data.hp !== this.hp) {
      this.hp = data.hp;
      this.updateNameplate();
    }
    if (data.nickname && data.nickname !== this.nickname) {
      this.nickname = data.nickname;
      this.updateNameplate();
    }

    const stateChanged =
      data.isHumanOnFoot !== this.isHumanOnFoot ||
      data.isDrivingTank !== this.isDrivingTank ||
      data.isDrivingMilitaryCar !== this.isDrivingMilitaryCar ||
      data.role !== this.role;

    if (stateChanged) {
      this.isHumanOnFoot = !!data.isHumanOnFoot;
      this.isDrivingTank = !!data.isDrivingTank;
      this.isDrivingMilitaryCar = !!data.isDrivingMilitaryCar;
      this.role = data.role || this.role;

      if (this.humanCharacter) {
        this.humanCharacter.setProfession(this.role);
        if (data.equippedWeapon) {
          this.humanCharacter.setEquippedWeapon(data.equippedWeapon);
        }
      }

      this.syncVisibility();
      this.updateNameplate();
    }
  }

  showChatMessage(text) {
    this.lastChatText = text;
    this.chatExpireTime = Date.now() + 5500;
    this.updateNameplate();
  }

  updateNameplate() {
    const isChatActive = this.lastChatText && Date.now() < this.chatExpireTime;
    const chatDisplay = isChatActive ? this.lastChatText : null;

    if (this.nameplateSprite) {
      const oldTexture = this.nameplateSprite.material.map;
      const newTexture = createPlayerNameplateTexture(this.nickname, this.role, this.hp, chatDisplay);
      this.nameplateSprite.material.map = newTexture;
      this.nameplateSprite.material.needsUpdate = true;
      if (oldTexture) oldTexture.dispose();
    }
  }

  update(dt, currentCity = null) {
    if (currentCity && this.city && this.city !== currentCity) {
      this.root.visible = false;
      return;
    }
    this.root.visible = true;

    // 1. Smooth position interpolation (Lerp)
    this.currentPos.lerp(this.targetPos, Math.min(1.0, dt * 14));
    this.root.position.copy(this.currentPos);

    // 2. Smooth shortest-arc yaw rotation interpolation
    let diff = this.targetYaw - this.currentYaw;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.currentYaw += diff * Math.min(1.0, dt * 14);
    this.root.rotation.y = this.currentYaw;

    // 3. Wheels rotation animation if in car
    if (!this.isHumanOnFoot && this.carBuilder?.wheels) {
      const rollSpeed = this.speedKmh * 0.05;
      this.carBuilder.wheels.forEach(w => {
        if (w.children[0]) {
          w.children[0].rotation.x += rollSpeed;
        }
      });
    }

    // 4. Human animation if on foot
    if (this.isHumanOnFoot && this.humanCharacter) {
      const isMoving = this.speedKmh > 1.5;
      this.humanCharacter.update({ throttle: isMoving, brake: false, steerLeft: false, steerRight: false }, dt, []);
    }

    // 5. Expire speech bubble after timeout
    if (this.lastChatText && Date.now() > this.chatExpireTime) {
      this.lastChatText = null;
      this.updateNameplate();
    }
  }

  destroy() {
    if (this.nameplateSprite?.material?.map) {
      this.nameplateSprite.material.map.dispose();
    }
    this.scene.remove(this.root);
  }
}

/**
 * RemotePlayerRenderer
 * Coordinates all remote players in the 3D world across all cities
 */
export class RemotePlayerRenderer {
  constructor(scene) {
    this.scene = scene;
    this.players = new Map(); // id -> RemotePlayerEntity
    this.currentCity = 'kyiv';
  }

  syncPlayers(remotePlayersMap, currentCity = null) {
    if (currentCity) this.currentCity = currentCity;
    const currentIds = new Set(remotePlayersMap.keys());

    // 1. Remove disconnected players
    this.players.forEach((entity, id) => {
      if (!currentIds.has(id)) {
        entity.destroy();
        this.players.delete(id);
      }
    });

    // 2. Add or update existing players
    remotePlayersMap.forEach((playerData, id) => {
      let entity = this.players.get(id);
      if (!entity) {
        entity = new RemotePlayerEntity(id, this.scene, playerData);
        this.players.set(id, entity);
      } else {
        entity.updateData(playerData);
      }
      if (playerData.city) {
        entity.city = playerData.city;
      }
    });
  }

  showChatBubble(senderId, text) {
    const entity = this.players.get(senderId);
    if (entity) {
      entity.showChatMessage(text);
    }
  }

  update(dt, currentCity = null) {
    const city = currentCity || this.currentCity;
    this.players.forEach(entity => {
      entity.update(dt, city);
    });
  }

  destroy() {
    this.players.forEach(entity => entity.destroy());
    this.players.clear();
  }
}
