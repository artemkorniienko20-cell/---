import * as THREE from 'three';
import { playHornSound } from '../../utils/audioSynthesizer';

/**
 * Autonomous AI City Traffic System (Боти які їздять):
 * - Spawns and controls diverse NPC vehicles (Yellow Taxi, SUV, Sedans, Delivery Van, Hatchbacks)
 * - Multi-lane waypoints following city roads in Vinnytsia and Zaporizhzhia
 * - Front vehicle & pedestrian detection (brakes & honks)
 * - Two-way crash physics interactions with player car and player on foot
 */
export class TrafficSystem {
  constructor(scene, cityId = 'vinnytsia') {
    this.scene = scene;
    this.cityId = cityId;
    this.trafficGroup = new THREE.Group();
    this.scene.add(this.trafficGroup);

    this.bots = [];
    this.lastHonkTime = 0;

    this.setupRoutes(cityId);
    this.spawnTrafficBots();
  }

  setupRoutes(cityId) {
    if (cityId === 'kyiv') {
      this.routes = [
        // 1. Khreshchatyk Northbound (Lane 1: X: 4.5)
        [
          { x: 4.5, z: 170 },
          { x: 4.5, z: 80 },
          { x: 4.5, z: 0 },
          { x: 4.5, z: -80 },
          { x: 4.5, z: -150 }
        ],
        // 2. Khreshchatyk Southbound (Lane 2: X: -4.5)
        [
          { x: -4.5, z: -150 },
          { x: -4.5, z: -80 },
          { x: -4.5, z: 0 },
          { x: -4.5, z: 80 },
          { x: -4.5, z: 170 }
        ],
        // 3. Khreshchatyk ➔ Volodymyr Descent ➔ Poshtova Sq ➔ Dnipro Highway Loop
        [
          { x: 4.5, z: -80 },
          { x: 4.5, z: -150 },
          { x: 25, z: -215 },
          { x: 85, z: -310 },
          { x: 102, z: -340 },
          { x: 102, z: -150 },
          { x: 102, z: 0 },
          { x: 102, z: 180 },
          { x: 40, z: 180 },
          { x: -4.5, z: 170 },
          { x: -4.5, z: 0 },
          { x: -4.5, z: -80 }
        ],
        // 4. Dnipro Embankment Highway Northbound (Lane X: 103)
        [
          { x: 103, z: 280 },
          { x: 103, z: 120 },
          { x: 103, z: -40 },
          { x: 103, z: -200 },
          { x: 103, z: -360 }
        ],
        // 5. Dnipro Embankment Highway Southbound (Lane X: 97)
        [
          { x: 97, z: -360 },
          { x: 97, z: -200 },
          { x: 97, z: -40 },
          { x: 97, z: 120 },
          { x: 97, z: 280 }
        ]
      ];
    } else if (cityId === 'zaporizhzhia') {
      this.routes = [
        // 1. Soborny Avenue Northbound (Lane 1 & 2: X: 123.5)
        [
          { x: 123.5, z: -320 },
          { x: 123.5, z: -150 },
          { x: 123.5, z: -20 },
          { x: 123.5, z: 120 },
          { x: 123.5, z: 320 }
        ],
        // 2. Soborny Avenue Southbound (Lane 3 & 4: X: 116.5)
        [
          { x: 116.5, z: 320 },
          { x: 116.5, z: 120 },
          { x: 116.5, z: -20 },
          { x: 116.5, z: -150 },
          { x: 116.5, z: -320 }
        ],
        // 3. DniproHES Dam & Khortytsia Loop
        [
          { x: 72, z: -22 },
          { x: -52, z: -22 },
          { x: -130, z: -22 },
          { x: -85, z: 55 },
          { x: -85, z: 120 },
          { x: -37.5, z: 52 },
          { x: 75, z: 38 },
          { x: 116.5, z: 38 },
          { x: 116.5, z: -20 },
          { x: 72, z: -22 }
        ],
        // 4. Reverse DniproHES Dam lane
        [
          { x: -130, z: -18 },
          { x: -52, z: -18 },
          { x: 72, z: -18 },
          { x: 123.5, z: -18 },
          { x: 123.5, z: 40 },
          { x: 75, z: 42 },
          { x: -37.5, z: 48 },
          { x: -85, z: 80 },
          { x: -85, z: 55 },
          { x: -130, z: -18 }
        ]
      ];
    } else if (cityId === 'moscow') {
      this.routes = [
        // 1. Garden Ring Avenue Northbound (Lane X: 5.5)
        [
          { x: 5.5, z: 240 },
          { x: 5.5, z: 120 },
          { x: 5.5, z: 0 },
          { x: 5.5, z: -120 },
          { x: 5.5, z: -240 }
        ],
        // 2. Garden Ring Avenue Southbound (Lane X: -5.5)
        [
          { x: -5.5, z: -240 },
          { x: -5.5, z: -120 },
          { x: -5.5, z: 0 },
          { x: -5.5, z: 120 },
          { x: -5.5, z: 240 }
        ],
        // 3. Cross Avenue Eastbound (Lane Z: 4.5)
        [
          { x: -220, z: 4.5 },
          { x: -100, z: 4.5 },
          { x: 0, z: 4.5 },
          { x: 100, z: 4.5 },
          { x: 220, z: 4.5 }
        ],
        // 4. Cross Avenue Westbound (Lane Z: -4.5)
        [
          { x: 220, z: -4.5 },
          { x: 100, z: -4.5 },
          { x: 0, z: -4.5 },
          { x: -100, z: -4.5 },
          { x: -220, z: -4.5 }
        ]
      ];
    } else if (cityId === 'frontline') {
      this.routes = [
        // Military supply convoy through central frontline road
        [
          { x: 3.5, z: 140 },
          { x: 3.5, z: 60 },
          { x: 3.5, z: 0 },
          { x: 3.5, z: -60 },
          { x: 3.5, z: -160 }
        ],
        [
          { x: -3.5, z: -160 },
          { x: -3.5, z: -60 },
          { x: -3.5, z: 0 },
          { x: -3.5, z: 60 },
          { x: -3.5, z: 140 }
        ]
      ];
    } else if (cityId === 'tokmak') {
      this.routes = [
        // 1. Eastbound P37 highway across Tokmachka bridge (Lane Z: -3.5)
        [
          { x: -280, z: -3.5 },
          { x: -140, z: -3.5 },
          { x: -60, z: -3.5 },
          { x: 0, z: -3.5 },
          { x: 60, z: -3.5 },
          { x: 200, z: -3.5 },
          { x: 280, z: -3.5 }
        ],
        // 2. Westbound P37 highway (Lane Z: 3.5)
        [
          { x: 280, z: 3.5 },
          { x: 200, z: 3.5 },
          { x: 60, z: 3.5 },
          { x: 0, z: 3.5 },
          { x: -60, z: 3.5 },
          { x: -140, z: 3.5 },
          { x: -280, z: 3.5 }
        ],
        // 3. Central Street North-South (Lane X: 63.5)
        [
          { x: 63.5, z: -250 },
          { x: 63.5, z: -100 },
          { x: 63.5, z: 0 },
          { x: 63.5, z: 100 },
          { x: 63.5, z: 250 }
        ],
        // 4. Central Street South-North (Lane X: 56.5)
        [
          { x: 56.5, z: 250 },
          { x: 56.5, z: 100 },
          { x: 56.5, z: 0 },
          { x: 56.5, z: -100 },
          { x: 56.5, z: -250 }
        ]
      ];
    } else {
      // Vinnytsia Traffic Routes
      this.routes = [
        // 1. Soborna ➔ Central Bridge ➔ Kotsyubynsky ➔ Kyivska Loop (Eastbound)
        [
          { x: 2.8, z: -110 },
          { x: 2.8, z: -15 },
          { x: 2.5, z: 30 },
          { x: 2.8, z: 55 },
          { x: 45, z: 55 },
          { x: 120, z: 55 },
          { x: 120, z: 25 },
          { x: 45, z: 25 },
          { x: 2.8, z: 25 },
          { x: 2.8, z: -110 }
        ],
        // 2. Kotsyubynsky ➔ Central Bridge ➔ Soborna (Westbound return)
        [
          { x: 120, z: 28 },
          { x: 45, z: 28 },
          { x: -2.8, z: 28 },
          { x: -2.5, z: 30 },
          { x: -2.8, z: -15 },
          { x: -2.8, z: -110 },
          { x: -25, z: -15 },
          { x: -2.8, z: 14 },
          { x: 45, z: 52 },
          { x: 120, z: 28 }
        ],
        // 3. Khmelnytske Shose Westbound
        [
          { x: -25, z: -48 },
          { x: -110, z: -48 },
          { x: -220, z: -48 },
          { x: -280, z: -48 },
          { x: -280, z: -52 },
          { x: -220, z: -52 },
          { x: -110, z: -52 },
          { x: -25, z: -52 }
        ],
        // 4. Pirogov Avenue Loop
        [
          { x: -28, z: -55 },
          { x: -75, z: -120 },
          { x: -140, z: -200 },
          { x: -144, z: -200 },
          { x: -78, z: -120 },
          { x: -32, z: -55 }
        ]
      ];
    }
  }

  spawnTrafficBots() {
    const carTypes = [
      { name: 'Таксі Жовте', bodyColor: 0xfacc15, isTaxi: true, length: 4.2, width: 1.8, height: 1.4, speed: 12 },
      { name: 'Кросовер RAV4', bodyColor: 0x0284c7, isTaxi: false, length: 4.5, width: 1.85, height: 1.6, speed: 13.5 },
      { name: 'Червоний Golf', bodyColor: 0xdc2626, isTaxi: false, length: 3.9, width: 1.75, height: 1.35, speed: 14 },
      { name: 'Сріблястий Седан', bodyColor: 0x94a3b8, isTaxi: false, length: 4.4, width: 1.8, height: 1.38, speed: 13 },
      { name: 'Бус «Нова Пошта»', bodyColor: 0xdc2626, isVan: true, length: 5.2, width: 2.0, height: 2.1, speed: 11 },
      { name: 'Чорний Позашляховик', bodyColor: 0x090d16, isTaxi: false, length: 4.8, width: 1.95, height: 1.75, speed: 14.5 },
      { name: 'Смарагдовий Седан', bodyColor: 0x059669, isTaxi: false, length: 4.3, width: 1.78, height: 1.4, speed: 12.5 },
      { name: 'Таксі Біле', bodyColor: 0xf8fafc, isTaxi: true, length: 4.2, width: 1.8, height: 1.4, speed: 13 }
    ];

    carTypes.forEach((cfg, idx) => {
      const route = this.routes[idx % this.routes.length];
      const botMesh = this.buildBotMesh(cfg);
      this.trafficGroup.add(botMesh);

      // Start position offset along route
      const startWaypoint = Math.floor((idx / carTypes.length) * route.length) % route.length;
      const wp = route[startWaypoint];

      botMesh.position.set(wp.x, 0, wp.z);

      this.bots.push({
        id: `bot_${idx}`,
        name: cfg.name,
        mesh: botMesh,
        cfg,
        route,
        currentWpIdx: startWaypoint,
        nextWpIdx: (startWaypoint + 1) % route.length,
        x: wp.x,
        z: wp.z,
        yaw: 0,
        speed: cfg.speed,
        baseSpeed: cfg.speed,
        wheels: botMesh.userData.wheels || []
      });
    });
  }

  buildBotMesh(cfg) {
    const group = new THREE.Group();

    // Body material
    const bodyMat = new THREE.MeshStandardMaterial({
      color: cfg.bodyColor,
      roughness: 0.35,
      metalness: 0.5
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.6,
      transparent: true
    });
    const blackTrimMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });

    // Lower chassis
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(cfg.width, cfg.height * 0.45, cfg.length),
      bodyMat
    );
    body.position.y = cfg.height * 0.35;
    body.castShadow = true;
    group.add(body);

    // Cabin & Roof
    const cabinLength = cfg.isVan ? cfg.length * 0.75 : cfg.length * 0.55;
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(cfg.width * 0.92, cfg.height * 0.48, cabinLength),
      glassMat
    );
    cabin.position.set(0, cfg.height * 0.68, cfg.isVan ? -cfg.length * 0.05 : -cfg.length * 0.08);
    cabin.castShadow = true;
    group.add(cabin);

    // Roof Top
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(cfg.width * 0.9, 0.06, cabinLength * 0.95),
      bodyMat
    );
    roof.position.set(0, cfg.height * 0.92, cabin.position.z);
    group.add(roof);

    // Taxi Checker Sign on Roof
    if (cfg.isTaxi) {
      const taxiSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.14, 0.2),
        new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 0.8 })
      );
      taxiSign.position.set(0, cfg.height * 0.98, cabin.position.z);
      group.add(taxiSign);
    }

    // Headlights
    for (let x of [-cfg.width * 0.38, cfg.width * 0.38]) {
      const hl = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.12, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf8fafc, emissiveIntensity: 2.2 })
      );
      hl.position.set(x, cfg.height * 0.36, cfg.length * 0.505);
      group.add(hl);
    }

    // Taillights
    for (let x of [-cfg.width * 0.38, cfg.width * 0.38]) {
      const tl = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.1, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2.5 })
      );
      tl.position.set(x, cfg.height * 0.38, -cfg.length * 0.505);
      group.add(tl);
    }

    // Bumpers
    const fBump = new THREE.Mesh(new THREE.BoxGeometry(cfg.width * 1.02, 0.18, 0.12), blackTrimMat);
    fBump.position.set(0, cfg.height * 0.22, cfg.length * 0.51);
    group.add(fBump);

    const rBump = new THREE.Mesh(new THREE.BoxGeometry(cfg.width * 1.02, 0.18, 0.12), blackTrimMat);
    rBump.position.set(0, cfg.height * 0.22, -cfg.length * 0.51);
    group.add(rBump);

    // 4 Wheels
    const wheels = [];
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.8, roughness: 0.2 });
    const wheelRadius = cfg.isVan ? 0.38 : 0.32;

    const wheelOffsets = [
      { x: -cfg.width * 0.48, z: cfg.length * 0.32 },
      { x: cfg.width * 0.48, z: cfg.length * 0.32 },
      { x: -cfg.width * 0.48, z: -cfg.length * 0.32 },
      { x: cfg.width * 0.48, z: -cfg.length * 0.32 }
    ];

    wheelOffsets.forEach(pos => {
      const wg = new THREE.Group();
      wg.position.set(pos.x, wheelRadius, pos.z);
      group.add(wg);

      const tire = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.22, 16), wheelMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wg.add(tire);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius * 0.55, wheelRadius * 0.55, 0.23, 12), rimMat);
      hub.rotation.z = Math.PI / 2;
      wg.add(hub);

      wheels.push(tire);
    });

    group.userData.wheels = wheels;
    return group;
  }

  update(dt, playerCarPos, playerHumanPos, isHumanOnFoot) {
    let trafficCrashEvent = null;
    let hitHumanEvent = null;

    const now = performance.now();

    this.bots.forEach(bot => {
      const targetWp = bot.route[bot.nextWpIdx];
      const dx = targetWp.x - bot.x;
      const dz = targetWp.z - bot.z;
      const distToWp = Math.hypot(dx, dz);

      // Target heading
      const targetYaw = Math.atan2(dx, dz);
      // Smooth yaw rotation
      let diffYaw = targetYaw - bot.yaw;
      while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
      while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
      bot.yaw += diffYaw * Math.min(1, 4.0 * dt);

      // Check distance to Player Car
      const dxPlayer = playerCarPos.x - bot.x;
      const dzPlayer = playerCarPos.z - bot.z;
      const distToPlayerCar = Math.hypot(dxPlayer, dzPlayer);

      // Check distance to Player on foot
      const dxHuman = playerHumanPos.x - bot.x;
      const dzHuman = playerHumanPos.z - bot.z;
      const distToHuman = Math.hypot(dxHuman, dzHuman);

      let brakeFactor = 1.0;

      // 1. Slow down / stop if Player Car is right ahead
      if (distToPlayerCar < 11.0) {
        const dotAhead = (dxPlayer * Math.sin(bot.yaw) + dzPlayer * Math.cos(bot.yaw)) / distToPlayerCar;
        if (dotAhead > 0.6) {
          brakeFactor = Math.max(0, (distToPlayerCar - 4.5) / 6.5);
          if (distToPlayerCar < 6.5 && now - this.lastHonkTime > 2500) {
            playHornSound();
            this.lastHonkTime = now;
          }
        }
      }

      // 2. Stop immediately if pedestrian / player human is ahead!
      if (isHumanOnFoot && distToHuman < 9.0) {
        const dotAheadHuman = (dxHuman * Math.sin(bot.yaw) + dzHuman * Math.cos(bot.yaw)) / distToHuman;
        if (dotAheadHuman > 0.5) {
          brakeFactor = Math.max(0, (distToHuman - 2.5) / 6.5);
          if (distToHuman < 5.0 && now - this.lastHonkTime > 2000) {
            playHornSound();
            this.lastHonkTime = now;
          }
        }
      }

      // 3. Collision with Player Car
      const carCollisionDist = 3.2;
      if (distToPlayerCar < carCollisionDist) {
        const impactSpeed = Math.abs(bot.speed) + Math.abs(playerCarPos.speedKmh / 3.6);
        trafficCrashEvent = {
          botName: bot.name,
          force: Math.round(impactSpeed * 2.2) + 8,
          x: bot.x,
          z: bot.z
        };
        // Push bot away
        bot.x -= Math.sin(bot.yaw) * 1.5;
        bot.z -= Math.cos(bot.yaw) * 1.5;
        brakeFactor = 0;
      }

      // 4. Collision with Player Human on foot!
      if (isHumanOnFoot && distToHuman < 1.6) {
        const impactForce = Math.round(bot.speed * 2.5) + 12;
        hitHumanEvent = {
          botName: bot.name,
          damage: Math.min(60, Math.round(impactForce * 1.2)),
          force: impactForce
        };
        // Knock player human back
        brakeFactor = 0;
      }

      // Stopped by DPS Inspector check
      if (bot.stoppedTimer > 0) {
        bot.stoppedTimer -= dt;
        brakeFactor = 0;
      }

      // Move bot forward
      const effectiveSpeed = bot.baseSpeed * brakeFactor;
      bot.x += Math.sin(bot.yaw) * effectiveSpeed * dt;
      bot.z += Math.cos(bot.yaw) * effectiveSpeed * dt;
      bot.mesh.position.set(bot.x, 0, bot.z);
      bot.mesh.rotation.y = bot.yaw;

      // Spin wheels
      bot.wheels.forEach(w => {
        w.rotation.x += (effectiveSpeed / 0.32) * dt;
      });

      // Advance waypoint
      if (distToWp < 4.0) {
        bot.currentWpIdx = bot.nextWpIdx;
        bot.nextWpIdx = (bot.nextWpIdx + 1) % bot.route.length;
      }
    });

    return {
      trafficCrashEvent,
      hitHumanEvent
    };
  }

  stopNearestVehicle(inspectorPos, range = 35.0) {
    let closestBot = null;
    let minDist = range;

    this.bots.forEach(bot => {
      const dist = Math.hypot(bot.x - inspectorPos.x, bot.z - inspectorPos.z);
      if (dist < minDist) {
        minDist = dist;
        closestBot = bot;
      }
    });

    if (closestBot) {
      closestBot.speed = 0;
      closestBot.stoppedTimer = 8.0; // Stop car for 8 seconds
      return {
        stopped: true,
        carName: closestBot.name,
        speed: Math.round(22 + Math.random() * 45)
      };
    }
    return null;
  }

  destroy() {
    while (this.trafficGroup.children.length > 0) {
      this.trafficGroup.remove(this.trafficGroup.children[0]);
    }
    this.scene.remove(this.trafficGroup);
    this.bots = [];
  }
}
