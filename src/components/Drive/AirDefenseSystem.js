import * as THREE from 'three';
import {
  startAirRaidSiren,
  stopAirRaidSiren,
  startShahedMotorSound,
  stopShahedMotorSound,
  playExplosionSound,
  startDroneFlightSound,
  stopDroneFlightSound
} from '../../utils/audioSynthesizer';

/**
 * AirDefenseSystem:
 * - Manages Air Raid Sirens across Ukrainian cities
 * - Spawns incoming hostile kamikaze UAVs «Shahed-136» («Герань-2») with delta wings and sound
 * - Flight trajectory towards city infrastructure targets (АТБ, Сільпо, Поліція, ЖК)
 * - Anti-Air interception mechanics (AK-74 bullets, Stinger MANPADS, Tank cannon shells)
 * - Mid-air explosions with debris, or building impact explosions with fire and smoke
 * - FPV Kamikaze Drone deployment & flight control for Army operators
 */
export class AirDefenseSystem {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.shaheds = [];
    this.explosions = [];
    this.smokePillars = [];
    this.missiles = [];

    // FPV Drone State
    this.fpvDrone = null;
    this.isFpvActive = false;

    // Siren & alert state
    this.isAirAlarm = false;
    this.alarmTimer = 0;
    this.nextWaveTimer = 180; // Automatic alarm every ~3 mins
  }

  // Helper: Create 3D Shahed-136 Delta-Wing Mesh
  createShahedMesh() {
    const droneGroup = new THREE.Group();

    // 1. Delta-wing body (Dark radar-absorbent matte carbon)
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.65,
      metalness: 0.2
    });

    // Triangular delta wing (shape geometry)
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 1.8);        // Nose tip
    wingShape.lineTo(1.6, -1.6);     // Right wing tip
    wingShape.lineTo(0.3, -1.3);     // Right fuselage notch
    wingShape.lineTo(-0.3, -1.3);    // Left fuselage notch
    wingShape.lineTo(-1.6, -1.6);    // Left wing tip
    wingShape.closePath();

    const extrudeSettings = { depth: 0.16, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    wingGeo.rotateX(Math.PI / 2);
    const wingMesh = new THREE.Mesh(wingGeo, wingMat);
    droneGroup.add(wingMesh);

    // 2. Central fuselage spine
    const spineGeo = new THREE.BoxGeometry(0.42, 0.24, 2.8);
    const spineMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 });
    const spine = new THREE.Mesh(spineGeo, spineMat);
    spine.position.set(0, 0.05, 0);
    droneGroup.add(spine);

    // 3. Wingtip vertical stabilizers (fins)
    const finMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const finGeo = new THREE.BoxGeometry(0.04, 0.55, 0.7);

    const leftFin = new THREE.Mesh(finGeo, finMat);
    leftFin.position.set(-1.58, 0.25, -1.3);
    droneGroup.add(leftFin);

    const rightFin = new THREE.Mesh(finGeo, finMat);
    rightFin.position.set(1.58, 0.25, -1.3);
    droneGroup.add(rightFin);

    // 4. White stencil markings on wing ("136")
    const stencilCanvas = document.createElement('canvas');
    stencilCanvas.width = 128;
    stencilCanvas.height = 64;
    const sCtx = stencilCanvas.getContext('2d');
    sCtx.fillStyle = '#0f172a';
    sCtx.fillRect(0, 0, 128, 64);
    sCtx.fillStyle = '#e2e8f0';
    sCtx.font = 'bold 36px monospace';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.fillText('136', 64, 32);
    const stencilTex = new THREE.CanvasTexture(stencilCanvas);
    const stencilMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.4),
      new THREE.MeshBasicMaterial({ map: stencilTex })
    );
    stencilMesh.rotation.x = -Math.PI / 2;
    stencilMesh.position.set(0.65, 0.12, -0.6);
    droneGroup.add(stencilMesh);

    // 5. Rear engine block & spinning pusher propeller
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.8 });
    const engineBlock = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.35, 12), engineMat);
    engineBlock.rotation.x = Math.PI / 2;
    engineBlock.position.set(0, 0.05, -1.45);
    droneGroup.add(engineBlock);

    const propGroup = new THREE.Group();
    propGroup.position.set(0, 0.05, -1.65);
    const propBlade = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.03, 0.02),
      new THREE.MeshBasicMaterial({ color: 0x27272a })
    );
    propGroup.add(propBlade);
    droneGroup.add(propGroup);

    // 6. Blinking Red Navigation LED on wing tips
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const led1 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), ledMat);
    led1.position.set(-1.6, 0.1, -1.6);
    droneGroup.add(led1);

    const led2 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), ledMat);
    led2.position.set(1.6, 0.1, -1.6);
    droneGroup.add(led2);

    return {
      mesh: droneGroup,
      propeller: propGroup
    };
  }

  // Start Air Raid Alert and spawn wave of Shaheds
  triggerAirAlarm(cityTargets = []) {
    if (this.isAirAlarm) return;
    this.isAirAlarm = true;
    this.alarmTimer = 90; // 90 seconds alarm duration
    startAirRaidSiren();
    startShahedMotorSound();

    // Default target if none provided
    const defaultTargets = cityTargets.length > 0 ? cityTargets : [
      { name: 'Міський супермаркет', x: 30, z: -35 },
      { name: 'Поліцейський відділок', x: 80, z: 20 },
      { name: 'Житловий квартал', x: -40, z: 40 }
    ];

    // Spawn 1 to 2 incoming Shahed drones from different vector angles
    const count = Math.random() > 0.4 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const chosenTarget = defaultTargets[Math.floor(Math.random() * defaultTargets.length)];
      this.spawnShahed(chosenTarget, i * 8.0); // slight delay between spawns
    }
  }

  // Stop Air Raid Alert
  cancelAirAlarm() {
    this.isAirAlarm = false;
    stopAirRaidSiren();
    if (this.shaheds.length === 0) {
      stopShahedMotorSound();
    }
  }

  // Spawn an individual Shahed towards a target
  spawnShahed(target, delay = 0) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 260 + Math.random() * 60; // 260-320m away from city
    const spawnX = target.x + Math.cos(angle) * distance;
    const spawnZ = target.z + Math.sin(angle) * distance;
    const altitude = 28 + Math.random() * 8; // altitude 28-36m

    const shahedData = this.createShahedMesh();
    shahedData.mesh.position.set(spawnX, altitude, spawnZ);
    this.group.add(shahedData.mesh);

    const shahedObj = {
      mesh: shahedData.mesh,
      propeller: shahedData.propeller,
      x: spawnX,
      y: altitude,
      z: spawnZ,
      speed: 21.0, // ~75 km/h
      hp: 300, // 300 HP: ~2 bursts of AK-74 or 1 Stinger/tank shot
      target: target,
      delay: delay,
      isDiving: false,
      destroyed: false,
      hitRadius: 2.6
    };

    this.shaheds.push(shahedObj);
  }

  // Intercept Shahed with AK-74, Stinger, or Tank Cannon
  checkWeaponHit(playerPos, aimDir, weaponAction) {
    if (!weaponAction || this.shaheds.length === 0) return null;

    const pX = playerPos.x;
    const pY = (playerPos.y || 0) + 1.5;
    const pZ = playerPos.z;

    const range = weaponAction.range || 170.0;
    const damage = weaponAction.damage || 150;
    const isAntiAir = weaponAction.isAntiAir || false;

    // Filter alive shaheds
    for (let i = 0; i < this.shaheds.length; i++) {
      const sh = this.shaheds[i];
      if (sh.destroyed || sh.delay > 0) continue;

      // Vector from player to shahed
      const toShahedX = sh.x - pX;
      const toShahedY = sh.y - pY;
      const toShahedZ = sh.z - pZ;
      const dist = Math.hypot(toShahedX, toShahedY, toShahedZ);

      if (dist > range) continue;

      // Normalize toShahed vector
      const normX = toShahedX / dist;
      const normY = toShahedY / dist;
      const normZ = toShahedZ / dist;

      // Dot product with player's forward aim direction
      const dot = normX * aimDir.x + normY * aimDir.y + normZ * aimDir.z;

      // Stinger MANPADS has wider lock-on cone (dot > 0.82), AK-74 has precision cone (dot > 0.90)
      const threshold = weaponAction.isMissile ? 0.82 : 0.89;

      if (dot > threshold || (weaponAction.type === 'tank' && dot > 0.80)) {
        // Hit detected!
        sh.hp -= damage;

        // Visual bullet/rocket hit sparks
        this.createHitSparks(sh.x, sh.y, sh.z);

        if (sh.hp <= 0) {
          // Shahed destroyed in mid-air!
          sh.destroyed = true;
          this.triggerMidAirExplosion(sh.x, sh.y, sh.z);
          this.group.remove(sh.mesh);

          return {
            type: 'destroyed',
            weapon: weaponAction.type,
            reward: 500,
            x: sh.x,
            y: sh.y,
            z: sh.z
          };
        } else {
          return {
            type: 'hit',
            weapon: weaponAction.type,
            remainingHp: sh.hp
          };
        }
      }
    }

    return null;
  }

  // Create mid-air explosion when shot down
  triggerMidAirExplosion(x, y, z) {
    playExplosionSound();

    const expGroup = new THREE.Group();
    expGroup.position.set(x, y, z);
    this.group.add(expGroup);

    // Glowing fireball
    const fireGeo = new THREE.SphereGeometry(3.5, 12, 12);
    const fireMat = new THREE.MeshBasicMaterial({
      color: 0xff7700,
      transparent: true,
      opacity: 0.95
    });
    const fireball = new THREE.Mesh(fireGeo, fireMat);
    expGroup.add(fireball);

    // Flying debris pieces (dark fragments falling down)
    const debrisList = [];
    const debrisMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    for (let i = 0; i < 12; i++) {
      const piece = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), debrisMat);
      expGroup.add(piece);
      debrisList.push({
        mesh: piece,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.2) * 14,
        vz: (Math.random() - 0.5) * 16,
        rotVx: Math.random() * 10,
        rotVy: Math.random() * 10
      });
    }

    this.explosions.push({
      group: expGroup,
      fireball,
      debris: debrisList,
      life: 2.2,
      maxLife: 2.2
    });
  }

  // Create building impact explosion & ground smoke pillar
  triggerBuildingImpact(sh) {
    playExplosionSound();

    const impactX = sh.x;
    const impactY = Math.max(0.5, sh.y);
    const impactZ = sh.z;

    this.triggerMidAirExplosion(impactX, impactY, impactZ);

    // Create burning smoke pillar on target building
    const smokeGroup = new THREE.Group();
    smokeGroup.position.set(impactX, 0.5, impactZ);
    this.group.add(smokeGroup);

    // Flame core
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(2.5, 5.0, 8), flameMat);
    flame.position.y = 2.5;
    smokeGroup.add(flame);

    // Dark smoke clouds rising
    const clouds = [];
    const smokeMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      transparent: true,
      opacity: 0.75,
      roughness: 0.9
    });

    for (let i = 0; i < 4; i++) {
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(1.8 + i * 0.4, 8, 8), smokeMat);
      cloud.position.set((Math.random() - 0.5) * 1.5, 3.5 + i * 2.2, (Math.random() - 0.5) * 1.5);
      smokeGroup.add(cloud);
      clouds.push(cloud);
    }

    this.smokePillars.push({
      group: smokeGroup,
      flame,
      clouds,
      duration: 35.0 // Burns for 35 seconds
    });
  }

  // Visual sparks on bullet impact
  createHitSparks(x, y, z) {
    const sparkGeo = new THREE.SphereGeometry(0.5, 6, 6);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const spark = new THREE.Mesh(sparkGeo, sparkMat);
    spark.position.set(x, y, z);
    this.group.add(spark);
    setTimeout(() => this.group.remove(spark), 120);
  }

  // Deploy FPV Kamikaze Drone
  deployFpvDrone(playerPos, playerYaw) {
    if (this.fpvDrone) return;

    const droneMesh = new THREE.Group();

    // Carbon quadcopter frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
    const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.03, 0.04), frameMat);
    arm1.rotation.y = Math.PI / 4;
    const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.03, 0.04), frameMat);
    arm2.rotation.y = -Math.PI / 4;
    droneMesh.add(arm1);
    droneMesh.add(arm2);

    // Central pod with FPV camera
    const podMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 }); // Orange FPV camera TPU mount
    const pod = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.28), podMat);
    droneMesh.add(pod);

    // 4 Rotors
    const rotorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const rotors = [];
    const rotorOffsets = [
      [0.26, 0.04, 0.26],
      [-0.26, 0.04, 0.26],
      [0.26, 0.04, -0.26],
      [-0.26, 0.04, -0.26]
    ];
    rotorOffsets.forEach(([rx, ry, rz]) => {
      const rot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.015, 8), rotorMat);
      rot.position.set(rx, ry, rz);
      droneMesh.add(rot);
      rotors.push(rot);
    });

    const spawnDist = 2.5;
    const startX = playerPos.x - Math.sin(playerYaw) * spawnDist;
    const startY = (playerPos.y || 0) + 2.0;
    const startZ = playerPos.z - Math.cos(playerYaw) * spawnDist;

    droneMesh.position.set(startX, startY, startZ);
    this.group.add(droneMesh);

    this.fpvDrone = {
      mesh: droneMesh,
      rotors,
      x: startX,
      y: startY,
      z: startZ,
      yaw: playerYaw,
      pitch: 0,
      roll: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      speed: 26.0,
      battery: 100
    };

    this.isFpvActive = true;
    startDroneFlightSound();
  }

  // Exit FPV Drone
  exitFpvDrone() {
    if (!this.fpvDrone) return;
    this.group.remove(this.fpvDrone.mesh);
    this.fpvDrone = null;
    this.isFpvActive = false;
    stopDroneFlightSound();
  }

  // Update loop for all aerial elements
  update(dt, keys, playerPos) {
    const events = [];

    // 1. Alarm countdown & Auto-wave timer
    this.nextWaveTimer -= dt;
    if (this.nextWaveTimer <= 0) {
      this.nextWaveTimer = 210 + Math.random() * 60; // Every 3.5 - 4.5 mins
      this.triggerAirAlarm();
      events.push({ type: 'alarm_started' });
    }

    if (this.isAirAlarm) {
      this.alarmTimer -= dt;
      if (this.alarmTimer <= 0 && this.shaheds.length === 0) {
        this.cancelAirAlarm();
        events.push({ type: 'alarm_ended' });
      }
    }

    // 2. Update Shahed UAVs
    for (let i = this.shaheds.length - 1; i >= 0; i--) {
      const sh = this.shaheds[i];
      if (sh.destroyed) {
        this.shaheds.splice(i, 1);
        continue;
      }

      if (sh.delay > 0) {
        sh.delay -= dt;
        continue;
      }

      // Rotate pusher propeller rapidly
      if (sh.propeller) {
        sh.propeller.rotation.z += dt * 55;
      }

      // Fly towards target
      const targetX = sh.target.x;
      const targetZ = sh.target.z;
      const dx = targetX - sh.x;
      const dz = targetZ - sh.z;
      const distHoriz = Math.hypot(dx, dz);

      // Orientation yaw towards target
      const targetYaw = Math.atan2(dx, dz);
      sh.mesh.rotation.y = targetYaw;

      // When within 50m of target, enter dive dive mode
      if (distHoriz < 50) {
        sh.isDiving = true;
        sh.speed = 28.0; // accelerate on dive
        sh.mesh.rotation.x = 0.55; // nose down dive
        sh.y = Math.max(1.0, sh.y - 12.0 * dt);
      } else {
        sh.mesh.rotation.x = 0.05;
      }

      // Move forward
      sh.x += Math.sin(targetYaw) * sh.speed * dt;
      sh.z += Math.cos(targetYaw) * sh.speed * dt;
      sh.mesh.position.set(sh.x, sh.y, sh.z);

      // Check impact with ground or target building
      if ((sh.isDiving && sh.y <= 2.5) || distHoriz < 5.0) {
        sh.destroyed = true;
        this.group.remove(sh.mesh);
        this.triggerBuildingImpact(sh);

        events.push({
          type: 'building_impact',
          targetName: sh.target.name,
          x: sh.x,
          z: sh.z
        });

        this.shaheds.splice(i, 1);
        if (this.shaheds.length === 0 && !this.isAirAlarm) {
          stopShahedMotorSound();
        }
      }
    }

    // 3. Update FPV Drone (if active)
    if (this.isFpvActive && this.fpvDrone) {
      const drone = this.fpvDrone;

      // Drain battery
      drone.battery = Math.max(0, drone.battery - 0.6 * dt);
      if (drone.battery <= 0) {
        this.exitFpvDrone();
        events.push({ type: 'fpv_battery_dead' });
      } else {
        // Spin rotors
        drone.rotors.forEach(r => {
          r.rotation.y += dt * 70;
        });

        // Controls: W/S forward/back, A/D turn yaw, Space climb, Shift descend
        let moveX = 0;
        let moveZ = 0;
        let moveY = 0;

        if (keys.throttle) moveZ += 1;
        if (keys.brake) moveZ -= 1;
        if (keys.steerLeft) drone.yaw += 2.0 * dt;
        if (keys.steerRight) drone.yaw -= 2.0 * dt;
        if (keys.handbrake) moveY += 1; // climb with Space

        // Calculate world velocity
        const speed = drone.speed;
        drone.vx = (Math.sin(drone.yaw) * moveZ) * speed;
        drone.vz = (Math.cos(drone.yaw) * moveZ) * speed;
        drone.vy = moveY * 12.0;

        drone.x += drone.vx * dt;
        drone.z += drone.vz * dt;
        drone.y = Math.max(1.0, Math.min(80.0, drone.y + drone.vy * dt));

        drone.mesh.position.set(drone.x, drone.y, drone.z);
        drone.mesh.rotation.y = drone.yaw;
        drone.mesh.rotation.x = moveZ * 0.25;
        drone.mesh.rotation.z = (keys.steerLeft ? 0.25 : keys.steerRight ? -0.25 : 0);

        // Check FPV ramming interception into Shahed
        for (let i = 0; i < this.shaheds.length; i++) {
          const sh = this.shaheds[i];
          if (sh.destroyed || sh.delay > 0) continue;

          const distToShahed = Math.hypot(drone.x - sh.x, drone.y - sh.y, drone.z - sh.z);
          if (distToShahed < 3.8) {
            // Kamikaze direct hit!
            sh.destroyed = true;
            this.triggerMidAirExplosion(sh.x, sh.y, sh.z);
            this.group.remove(sh.mesh);

            this.exitFpvDrone();

            events.push({
              type: 'fpv_interception_kill',
              reward: 500,
              x: sh.x,
              y: sh.y,
              z: sh.z
            });
            break;
          }
        }
      }
    }

    // 4. Update Explosions
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.life -= dt;

      // Expand fireball and fade
      const progress = 1 - (exp.life / exp.maxLife);
      const scale = 1 + progress * 3.5;
      exp.fireball.scale.set(scale, scale, scale);
      exp.fireball.material.opacity = Math.max(0, 1 - progress);

      // Move debris
      exp.debris.forEach(d => {
        d.mesh.position.x += d.vx * dt;
        d.mesh.position.y += d.vy * dt;
        d.mesh.position.z += d.vz * dt;
        d.vy -= 9.8 * dt; // Gravity
        d.mesh.rotation.x += d.rotVx * dt;
        d.mesh.rotation.y += d.rotVy * dt;
      });

      if (exp.life <= 0) {
        this.group.remove(exp.group);
        this.explosions.splice(i, 1);
      }
    }

    // 5. Update Smoke Pillars on buildings
    for (let i = this.smokePillars.length - 1; i >= 0; i--) {
      const sp = this.smokePillars[i];
      sp.duration -= dt;

      // Gentle cloud billow
      sp.clouds.forEach((c, idx) => {
        c.rotation.y += dt * 0.4 * (idx % 2 === 0 ? 1 : -1);
      });

      if (sp.duration <= 0) {
        this.group.remove(sp.group);
        this.smokePillars.splice(i, 1);
      }
    }

    return events;
  }

  destroy() {
    this.cancelAirAlarm();
    this.exitFpvDrone();
    this.shaheds.forEach(s => this.group.remove(s.mesh));
    this.explosions.forEach(e => this.group.remove(e.group));
    this.smokePillars.forEach(p => this.group.remove(p.group));
    this.scene.remove(this.group);
  }
}
