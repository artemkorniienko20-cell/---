import * as THREE from 'three';
import {
  playPunchImpactSound,
  playPunchSwingSound,
  playNpcHurtSound,
  playNpcKnockoutSound,
  playCashSound,
  playTaserSound,
  playGunshotSound,
  playHandcuffsSound,
  playPoliceRadioSound
} from '../../utils/audioSynthesizer';

/**
 * 3D NPC Pedestrian System with Melee Street Fight Combat & Police Law Enforcement:
 * - Walking pedestrians and patrolling Police Officers
 * - Crime tracking: brawling/aggressive NPCs flagged as lawbreakers
 * - Full Police enforcement: Taser electrical paralysis, Pistol gunshots, Handcuff arrests with bounties
 * - Police NPC intervention when civilians fight
 * - Cash loot drops on knockout
 */

const NPC_NAMES = [
  { name: 'Лейтенант Коваль', title: 'Патрульна поліція 102', type: 'police', hp: 160 },
  { name: 'Сержант Кравченко', title: 'Патрульна поліція 102', type: 'police', hp: 150 },
  { name: 'Капрал Бондар', title: 'Патрульна поліція 102', type: 'police', hp: 140 },
  { name: 'Богдан', title: 'Вуличний боксер', type: 'fighter', hp: 110 },
  { name: 'Олег', title: 'Хлопець з району', type: 'fighter', hp: 95 },
  { name: 'Макс', title: 'Охоронець АТБ', type: 'fighter', hp: 120 },
  { name: 'Сергій', title: 'Місцевий спортсмен', type: 'fighter', hp: 105 },
  { name: 'Дмитро', title: 'Гопник (Хуліган)', type: 'fighter', hp: 90 },
  { name: 'Андрій', title: 'Бізнесмен', type: 'neutral', hp: 80 },
  { name: 'Тарас', title: 'Студент', type: 'civilian', hp: 75 },
  { name: 'Василь', title: 'Перехожий', type: 'civilian', hp: 80 },
  { name: 'Ігор', title: 'Турист', type: 'civilian', hp: 70 },
  { name: 'Юрій', title: 'Міський мешканець', type: 'neutral', hp: 85 }
];

const CLOTHING_COLORS = [
  0xef4444, // Red hoodie
  0x3b82f6, // Blue sport jacket
  0x10b981, // Emerald green tee
  0xf59e0b, // Amber jacket
  0x8b5cf6, // Purple sweater
  0x1e293b, // Dark urban jacket
  0x64748b, // Grey hoodie
  0x0284c7  // Cyan jacket
];

const PANTS_COLORS = [
  0x1e293b, // Dark jeans
  0x334155, // Blue denim
  0x475569, // Slate pants
  0x0f172a  // Black trousers
];

// Sidewalk routes for Vinnytsia
const VINNYTSIA_SIDEWALKS = [
  // European Square & Tower
  { x: 5, z: -18 }, { x: 18, z: -18 }, { x: 15, z: -28 }, { x: -8, z: -25 }, { x: -5, z: -14 },
  // Soborna Street East Sidewalk
  { x: 9.5, z: -60 }, { x: 9.5, z: -20 }, { x: 9.5, z: 10 }, { x: 9.5, z: 45 }, { x: 9.5, z: 80 },
  // Soborna Street West Sidewalk
  { x: -9.5, z: -60 }, { x: -9.5, z: -20 }, { x: -9.5, z: 10 }, { x: -9.5, z: 45 }, { x: -9.5, z: 80 },
  // Bridge pedestrian walkway
  { x: 7, z: 20 }, { x: 7, z: 35 }, { x: 7, z: 50 }, { x: -7, z: 50 }, { x: -7, z: 35 }, { x: -7, z: 20 },
  // Roshen Fountain Embankment
  { x: 22, z: 12 }, { x: 32, z: 14 }, { x: 40, z: 18 }, { x: 28, z: 8 }, { x: 16, z: 10 },
  // ATB / Silpo Plazas
  { x: 24, z: -40 }, { x: 30, z: -35 }, { x: 24, z: -28 }, { x: -25, z: 65 }, { x: -32, z: 75 },
  // Vinnytsia Police Department (вул. Театральна, 10)
  { x: 100, z: -21 }, { x: 110, z: -21 }, { x: 115, z: -25 }, { x: 92, z: -25 }
];

// Sidewalk routes for Zaporizhzhia
const ZAPORIZHZHIA_SIDEWALKS = [
  // Soborny Avenue East Sidewalk
  { x: 128, z: -160 }, { x: 128, z: -100 }, { x: 128, z: -40 }, { x: 128, z: 20 }, { x: 128, z: 90 }, { x: 128, z: 170 },
  // Zaporizhzhia Police Department on Soborny Ave
  { x: 133, z: 20 }, { x: 135, z: 25 }, { x: 133, z: 30 }, { x: 140, z: 6 },
  // Soborny Avenue West Sidewalk
  { x: 112, z: -160 }, { x: 112, z: -100 }, { x: 112, z: -40 }, { x: 112, z: 20 }, { x: 112, z: 90 }, { x: 112, z: 170 },
  // Festival Square Plaza
  { x: 135, z: -110 }, { x: 145, z: -100 }, { x: 140, z: -85 }, { x: 115, z: -85 }, { x: 105, z: -100 },
  // Khortytsia / Sich tourist paths
  { x: -85, z: 75 }, { x: -85, z: 95 }, { x: -75, z: 110 }, { x: -95, z: 110 }, { x: -85, z: 130 },
  // DniproHES viewing terrace
  { x: -50, z: -14 }, { x: -70, z: -14 }, { x: -90, z: -14 }, { x: -110, z: -14 }
];

// Sidewalk routes for Kyiv
const KYIV_SIDEWALKS = [
  // Khreshchatyk East Sidewalk (Promenade)
  { x: 12, z: -140 }, { x: 12, z: -80 }, { x: 12, z: -35 }, { x: 12, z: 35 }, { x: 12, z: 90 }, { x: 12, z: 150 },
  // Khreshchatyk West Sidewalk (ЦУМ, КМДА, Пасаж)
  { x: -12, z: -140 }, { x: -12, z: -80 }, { x: -12, z: -35 }, { x: -12, z: 35 }, { x: -12, z: 90 }, { x: -12, z: 150 },
  // Maidan Nezalezhnosti Plaza & Stella
  { x: 26, z: 0 }, { x: 38, z: 0 }, { x: 32, z: 12 }, { x: 32, z: -12 }, { x: -25, z: 15 }, { x: -25, z: -15 },
  // European Square & Ukrainian House
  { x: 15, z: -160 }, { x: -15, z: -160 }, { x: 25, z: -180 }, { x: -25, z: -175 },
  // Golden Gate & Sophia Square
  { x: -85, z: 38 }, { x: -95, z: 42 }, { x: -85, z: -60 }, { x: -95, z: -60 },
  // Kyiv Police Department HQ (вул. Володимирська, 15)
  { x: -62, z: -90 }, { x: -70, z: -90 }, { x: -65, z: -80 },
  // Poshtova Square & River Port promenade
  { x: 80, z: -320 }, { x: 90, z: -320 }, { x: 100, z: -330 }, { x: 70, z: -300 }
];

// Sidewalk routes for Moscow
const MOSCOW_SIDEWALKS = [
  // Red Square Promenade
  { x: -110, z: -40 }, { x: -110, z: 0 }, { x: -110, z: 40 }, { x: -90, z: 20 }, { x: -90, z: -20 },
  // Spasskaya Tower approach
  { x: -150, z: -20 }, { x: -150, z: 20 },
  // Garden Ring Sidewalks
  { x: 14, z: -180 }, { x: 14, z: -60 }, { x: 14, z: 60 }, { x: 14, z: 180 },
  { x: -14, z: -180 }, { x: -14, z: -60 }, { x: -14, z: 60 }, { x: -14, z: 180 },
  // DPS Station
  { x: 30, z: 32 }, { x: 35, z: 42 }, { x: 45, z: 35 },
  // Kyiv Railway Station
  { x: -65, z: -90 }, { x: -75, z: -90 }, { x: -55, z: -90 }
];

// Sidewalk routes for Tokmak
const TOKMAK_SIDEWALKS = [
  // Central Street Sidewalks
  { x: 55, z: -100 }, { x: 55, z: -50 }, { x: 55, z: 0 }, { x: 55, z: 50 }, { x: 55, z: 100 },
  { x: 65, z: -100 }, { x: 65, z: -50 }, { x: 65, z: 0 }, { x: 65, z: 50 }, { x: 65, z: 100 },
  // Main Highway Sidewalk
  { x: -10, z: -9 }, { x: 30, z: -9 }, { x: 90, z: -9 }, { x: 150, z: -9 },
  { x: -10, z: 9 }, { x: 30, z: 9 }, { x: 90, z: 9 }, { x: 150, z: 9 },
  // City Hall Plaza
  { x: 50, z: 45 }, { x: 70, z: 45 }, { x: 60, z: 75 },
  // Station Platform & Entrance
  { x: 130, z: -105 }, { x: 140, z: -105 }, { x: 150, z: -105 }
];

// Sidewalk routes for Frontline
const FRONTLINE_SIDEWALKS = [
  // ZSU Trenches & Bunkers
  { x: -35, z: 100 }, { x: -25, z: 90 }, { x: 0, z: 80 }, { x: 25, z: 90 }, { x: 35, z: 100 },
  { x: -20, z: 120 }, { x: 0, z: 120 }, { x: 20, z: 120 }
];

export class PedestrianSystem {
  constructor(scene, cityId = 'vinnytsia') {
    this.scene = scene;
    this.cityId = cityId;
    this.pedestrians = [];
    this.cashPickups = [];
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Hit sparks particle pool
    this.initHitEffects();

    // Spawn initial pedestrians
    this.spawnPedestrians(18);
  }

  initHitEffects() {
    this.sparkGeo = new THREE.BufferGeometry();
    const count = 40;
    const positions = new Float32Array(count * 3);
    this.sparkGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.sparkMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.22,
      transparent: true,
      opacity: 0
    });
    this.sparks = new THREE.Points(this.sparkGeo, this.sparkMat);
    this.group.add(this.sparks);
    this.sparkTimer = 0;
  }

  spawnPedestrians(count = 18) {
    const waypoints =
      this.cityId === 'kyiv'
        ? KYIV_SIDEWALKS
        : this.cityId === 'zaporizhzhia'
        ? ZAPORIZHZHIA_SIDEWALKS
        : this.cityId === 'tokmak'
        ? TOKMAK_SIDEWALKS
        : this.cityId === 'moscow'
        ? MOSCOW_SIDEWALKS
        : this.cityId === 'frontline'
        ? FRONTLINE_SIDEWALKS
        : VINNYTSIA_SIDEWALKS;

    for (let i = 0; i < count; i++) {
      const profile = NPC_NAMES[i % NPC_NAMES.length];
      const startWp = waypoints[i % waypoints.length];
      const nextWp = waypoints[(i + 1) % waypoints.length];

      // Slight random offset
      const posX = startWp.x + (Math.random() - 0.5) * 2.5;
      const posZ = startWp.z + (Math.random() - 0.5) * 2.5;

      const ped = this.createPedestrianMesh(profile, i);
      ped.group.position.set(posX, 0, posZ);

      const dx = nextWp.x - posX;
      const dz = nextWp.z - posZ;
      ped.yaw = Math.atan2(dx, dz);
      ped.group.rotation.y = ped.yaw;

      ped.x = posX;
      ped.z = posZ;
      ped.targetWp = nextWp;
      ped.wpIdx = (i + 1) % waypoints.length;
      ped.waypoints = waypoints;

      this.group.add(ped.group);
      this.pedestrians.push(ped);
    }
  }

  createPedestrianMesh(profile, index) {
    const group = new THREE.Group();
    const isPolice = profile.type === 'police';

    const skinColor = Math.random() > 0.5 ? 0xfbcfe8 : 0xfcd34d;
    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6 });
    const jacketColor = isPolice ? 0x0f172a : CLOTHING_COLORS[index % CLOTHING_COLORS.length];
    const jacketMat = new THREE.MeshStandardMaterial({ color: jacketColor, roughness: 0.5 });
    const pantsColor = isPolice ? 0x090d16 : PANTS_COLORS[index % PANTS_COLORS.length];
    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });
    const shoesMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });

    // Torso
    const torso = new THREE.Group();
    torso.position.y = 0.95;
    group.add(torso);

    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.54, 0.25), jacketMat);
    chest.castShadow = true;
    torso.add(chest);

    // If Police Officer, add gold police badge on chest
    if (isPolice) {
      const badgeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.03), badgeMat);
      badge.position.set(-0.11, 0.12, 0.14);
      torso.add(badge);
    }

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), skinMat);
    head.position.y = 0.42;
    head.castShadow = true;
    torso.add(head);

    // Stylish Cap / Hair
    if (isPolice) {
      const policeCap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.07, 14), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      policeCap.position.y = 0.52;
      torso.add(policeCap);
      const cockade = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 10), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
      cockade.rotation.x = Math.PI / 2;
      cockade.position.set(0, 0.53, 0.15);
      torso.add(cockade);
    } else {
      const hairColor = index % 3 === 0 ? 0x0f172a : index % 3 === 1 ? 0x78350f : 0xd97706;
      const hair = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 14), new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8 }));
      hair.position.y = 0.51;
      torso.add(hair);
    }

    // Arms
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.27, 0.22, 0);
    torso.add(leftArmPivot);
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.46, 0.11), jacketMat);
    leftArm.position.y = -0.21;
    leftArmPivot.add(leftArm);
    const leftFist = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), skinMat);
    leftFist.position.y = -0.46;
    leftArmPivot.add(leftFist);

    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.27, 0.22, 0);
    torso.add(rightArmPivot);
    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.46, 0.11), jacketMat);
    rightArm.position.y = -0.21;
    rightArmPivot.add(rightArm);
    const rightFist = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), skinMat);
    rightFist.position.y = -0.46;
    rightArmPivot.add(rightFist);

    // Legs
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.13, 0.68, 0);
    group.add(leftLegPivot);
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.54, 0.14), pantsMat);
    leftLeg.position.y = -0.27;
    leftLegPivot.add(leftLeg);
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.22), shoesMat);
    leftShoe.position.set(0, -0.56, 0.04);
    leftLegPivot.add(leftShoe);

    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0.13, 0.68, 0);
    group.add(rightLegPivot);
    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.54, 0.14), pantsMat);
    rightLeg.position.y = -0.27;
    rightLegPivot.add(rightLeg);
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.22), shoesMat);
    rightShoe.position.set(0, -0.56, 0.04);
    rightLegPivot.add(rightShoe);

    // Overhead 3D Health Bar and Combat UI
    const hpBarGroup = new THREE.Group();
    hpBarGroup.position.set(0, 1.85, 0);
    group.add(hpBarGroup);

    // Red background bar
    const hpBg = new THREE.Mesh(
      new THREE.PlaneGeometry(0.65, 0.09),
      new THREE.MeshBasicMaterial({ color: isPolice ? 0x1e3a8a : 0x450a0a, side: THREE.DoubleSide })
    );
    hpBarGroup.add(hpBg);

    // Green dynamic health fill
    const hpFill = new THREE.Mesh(
      new THREE.PlaneGeometry(0.63, 0.07),
      new THREE.MeshBasicMaterial({ color: isPolice ? 0x38bdf8 : 0x22c55e, side: THREE.DoubleSide })
    );
    hpFill.position.z = 0.005;
    hpBarGroup.add(hpFill);
    hpBarGroup.visible = false; // appears when damaged or close in fight

    return {
      group,
      torso,
      leftArmPivot,
      rightArmPivot,
      leftLegPivot,
      rightLegPivot,
      hpBarGroup,
      hpFill,
      name: profile.name,
      title: profile.title,
      type: profile.type,
      maxHp: profile.hp,
      hp: profile.hp,
      state: 'WALK', // 'WALK' | 'COMBAT' | 'FLEE' | 'ARRESTED' | 'KNOCKED_OUT'
      speed: 1.8 + Math.random() * 0.8,
      walkCycle: Math.random() * Math.PI * 2,
      attackCooldown: 0,
      staggerTimer: 0,
      knockoutTimer: 0,
      isKnockedOut: false,
      lootGiven: false,
      isStunned: false,
      stunTimer: 0,
      isHandcuffed: false,
      isBrawler: profile.type === 'fighter',
      policeCooldown: 0
    };
  }

  // Spawn visual cash stack dropped by knocked out NPC
  dropCashPickup(x, z, amount) {
    const pickupGroup = new THREE.Group();
    pickupGroup.position.set(x, 0.15, z);

    // 3D Dollar Bill bundle
    const billGeo = new THREE.BoxGeometry(0.4, 0.08, 0.25);
    const billMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.4,
      emissive: 0x059669,
      emissiveIntensity: 0.6
    });
    const mesh = new THREE.Mesh(billGeo, billMat);
    pickupGroup.add(mesh);

    // Glowing green ring on floor
    const ringGeo = new THREE.RingGeometry(0.3, 0.55, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    pickupGroup.add(ring);

    this.group.add(pickupGroup);

    this.cashPickups.push({
      group: pickupGroup,
      mesh,
      x,
      z,
      amount,
      collected: false,
      spawnTime: performance.now()
    });
  }

  triggerHitSparks(x, y, z) {
    this.sparkMat.opacity = 1.0;
    this.sparkTimer = 0.18;
    const pos = this.sparkGeo.attributes.position.array;
    for (let i = 0; i < 40; i++) {
      pos[i * 3] = x + (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 1] = y + (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 2] = z + (Math.random() - 0.5) * 0.4;
    }
    this.sparkGeo.attributes.position.needsUpdate = true;
  }

  // Main system update loop
  update(dt, playerHuman, playerVehicle, isHumanOnFoot = true, camera = null, weaponAction = null, isPlayerPolice = false) {
    const events = [];

    // Fade hit sparks
    if (this.sparkTimer > 0) {
      this.sparkTimer -= dt;
      if (this.sparkTimer <= 0) {
        this.sparkMat.opacity = 0;
      }
    }

    const playerX = isHumanOnFoot && playerHuman ? playerHuman.x : playerVehicle.x;
    const playerZ = isHumanOnFoot && playerHuman ? playerHuman.z : playerVehicle.z;

    // Check cash pickups
    for (let i = this.cashPickups.length - 1; i >= 0; i--) {
      const cp = this.cashPickups[i];
      if (cp.collected) continue;

      // Spin pickup
      cp.mesh.rotation.y += dt * 3.5;

      const distToPlayer = Math.hypot(playerX - cp.x, playerZ - cp.z);
      if (distToPlayer < 1.9) {
        cp.collected = true;
        playCashSound();
        events.push({
          type: 'picked_up_cash',
          amount: cp.amount
        });
        this.group.remove(cp.group);
        this.cashPickups.splice(i, 1);
      }
    }

    // Process weapon actions from player (Taser, Pistol, Handcuffs)
    if (isHumanOnFoot && playerHuman && weaponAction) {
      if (weaponAction.type === 'taser') {
        let bestTarget = null;
        let bestDist = weaponAction.range || 9.5;
        this.pedestrians.forEach(ped => {
          if (ped.isKnockedOut || ped.isHandcuffed) return;
          const d = Math.hypot(ped.x - playerHuman.x, ped.z - playerHuman.z);
          if (d < bestDist) {
            const toYaw = Math.atan2(ped.x - playerHuman.x, ped.z - playerHuman.z);
            let diff = Math.abs(toYaw - playerHuman.yaw);
            while (diff > Math.PI) diff -= Math.PI * 2;
            if (Math.abs(diff) < 1.45) {
              bestDist = d;
              bestTarget = ped;
            }
          }
        });

        if (bestTarget) {
          bestTarget.isStunned = true;
          bestTarget.stunTimer = weaponAction.stunDuration || 4.0;
          bestTarget.isBrawler = true;
          bestTarget.state = 'COMBAT';
          this.triggerHitSparks(bestTarget.x, 1.2, bestTarget.z);
          events.push({
            type: 'player_tasered_npc',
            npcName: `${bestTarget.name} (${bestTarget.title})`,
            npcHp: bestTarget.hp
          });
        }
      } else if (weaponAction.type === 'pistol') {
        let bestTarget = null;
        let bestDist = weaponAction.range || 28.0;
        this.pedestrians.forEach(ped => {
          if (ped.isKnockedOut || ped.isHandcuffed) return;
          const d = Math.hypot(ped.x - playerHuman.x, ped.z - playerHuman.z);
          if (d < bestDist) {
            const toYaw = Math.atan2(ped.x - playerHuman.x, ped.z - playerHuman.z);
            let diff = Math.abs(toYaw - playerHuman.yaw);
            while (diff > Math.PI) diff -= Math.PI * 2;
            if (Math.abs(diff) < 1.3) {
              bestDist = d;
              bestTarget = ped;
            }
          }
        });

        if (bestTarget) {
          const dmg = weaponAction.damage || 65;
          bestTarget.hp = Math.max(0, bestTarget.hp - dmg);
          bestTarget.isBrawler = true;
          bestTarget.staggerTimer = 0.45;
          playNpcHurtSound();
          this.triggerHitSparks(bestTarget.x, 1.2, bestTarget.z);
          events.push({
            type: 'player_shot_npc',
            npcName: `${bestTarget.name} (${bestTarget.title})`,
            damage: dmg,
            npcHp: bestTarget.hp
          });
          if (bestTarget.hp <= 0 && !bestTarget.isKnockedOut) {
            this.handleKnockout(bestTarget, events);
          }
        }
      } else if (weaponAction.type === 'handcuffs') {
        let bestTarget = null;
        let bestDist = weaponAction.range || 2.8;
        this.pedestrians.forEach(ped => {
          if (ped.isHandcuffed) return;
          const d = Math.hypot(ped.x - playerHuman.x, ped.z - playerHuman.z);
          if (d < bestDist) {
            bestDist = d;
            bestTarget = ped;
          }
        });

        if (bestTarget) {
          if (bestTarget.isStunned || bestTarget.isKnockedOut || bestTarget.state === 'COMBAT' || bestTarget.type === 'fighter' || bestTarget.isBrawler) {
            bestTarget.isHandcuffed = true;
            bestTarget.state = 'ARRESTED';
            bestTarget.isKnockedOut = false;
            bestTarget.group.rotation.z = 0;
            bestTarget.group.position.y = 0;
            bestTarget.hpBarGroup.visible = true;
            bestTarget.hpFill.material.color.setHex(0x38bdf8); // Cyan arrested indicator
            const reward = 350 + Math.floor(Math.random() * 150); // ₴350 - ₴500 bounty
            events.push({
              type: 'player_arrested_npc',
              npcName: `${bestTarget.name} (${bestTarget.title})`,
              reward
            });
          } else {
            events.push({
              type: 'cannot_arrest_innocent',
              npcName: bestTarget.name
            });
          }
        }
      } else if (weaponAction.type === 'spray') {
        let bestTarget = null;
        let bestDist = weaponAction.range || 4.8;
        this.pedestrians.forEach(ped => {
          if (ped.isKnockedOut || ped.isHandcuffed) return;
          const d = Math.hypot(ped.x - playerHuman.x, ped.z - playerHuman.z);
          if (d < bestDist) {
            bestDist = d;
            bestTarget = ped;
          }
        });

        if (bestTarget) {
          bestTarget.isStunned = true;
          bestTarget.stunTimer = weaponAction.stunDuration || 5.0;
          bestTarget.isBrawler = true;
          bestTarget.state = 'COMBAT';
          this.triggerHitSparks(bestTarget.x, 1.2, bestTarget.z);
          events.push({
            type: 'player_sprayed_npc',
            npcName: `${bestTarget.name} (${bestTarget.title})`,
            npcHp: bestTarget.hp
          });
        }
      } else if (weaponAction.type === 'baton') {
        let bestTarget = null;
        let bestDist = weaponAction.range || 2.6;
        this.pedestrians.forEach(ped => {
          if (ped.isKnockedOut || ped.isHandcuffed) return;
          const d = Math.hypot(ped.x - playerHuman.x, ped.z - playerHuman.z);
          if (d < bestDist) {
            bestDist = d;
            bestTarget = ped;
          }
        });

        if (bestTarget) {
          const dmg = weaponAction.damage || 50;
          bestTarget.hp = Math.max(0, bestTarget.hp - dmg);
          bestTarget.isBrawler = true;
          bestTarget.staggerTimer = 0.4;
          playNpcHurtSound();
          this.triggerHitSparks(bestTarget.x, 1.2, bestTarget.z);
          events.push({
            type: 'player_batoned_npc',
            npcName: `${bestTarget.name} (${bestTarget.title})`,
            damage: dmg,
            npcHp: bestTarget.hp
          });
          if (bestTarget.hp <= 0 && !bestTarget.isKnockedOut) {
            this.handleKnockout(bestTarget, events);
          }
        }
      } else if (weaponAction.type === 'shotgun') {
        let bestTarget = null;
        let bestDist = weaponAction.range || 24.0;
        this.pedestrians.forEach(ped => {
          if (ped.isKnockedOut || ped.isHandcuffed) return;
          const d = Math.hypot(ped.x - playerHuman.x, ped.z - playerHuman.z);
          if (d < bestDist) {
            const toYaw = Math.atan2(ped.x - playerHuman.x, ped.z - playerHuman.z);
            let diff = Math.abs(toYaw - playerHuman.yaw);
            while (diff > Math.PI) diff -= Math.PI * 2;
            if (Math.abs(diff) < 1.4) {
              bestDist = d;
              bestTarget = ped;
            }
          }
        });

        if (bestTarget) {
          const dmg = weaponAction.damage || 120;
          bestTarget.hp = Math.max(0, bestTarget.hp - dmg);
          bestTarget.isBrawler = true;
          bestTarget.staggerTimer = 0.6;
          // Big knockback from shotgun blast
          bestTarget.x += Math.sin(playerHuman.yaw) * 1.8;
          bestTarget.z += Math.cos(playerHuman.yaw) * 1.8;
          bestTarget.group.position.set(bestTarget.x, 0, bestTarget.z);
          playNpcHurtSound();
          this.triggerHitSparks(bestTarget.x, 1.2, bestTarget.z);
          events.push({
            type: 'player_shotgunned_npc',
            npcName: `${bestTarget.name} (${bestTarget.title})`,
            damage: dmg,
            npcHp: bestTarget.hp
          });
          if (bestTarget.hp <= 0 && !bestTarget.isKnockedOut) {
            this.handleKnockout(bestTarget, events);
          }
        }
      }
    }

    // Process each NPC
    this.pedestrians.forEach(ped => {
      // Rotate health bar to billboard facing camera
      if (camera && ped.hpBarGroup.visible) {
        ped.hpBarGroup.quaternion.copy(camera.quaternion);
      }

      // 0. HANDCUFFED / ARRESTED STATE
      if (ped.isHandcuffed) {
        ped.leftArmPivot.rotation.x = 0.75;
        ped.rightArmPivot.rotation.x = 0.75;
        ped.torso.rotation.x = 0.15;
        ped.hpBarGroup.visible = true;
        ped.hpFill.scale.x = 1.0;
        ped.hpFill.material.color.setHex(0x38bdf8);
        return;
      }

      // 0.5 STUNNED STATE (Taser)
      if (ped.isStunned) {
        ped.stunTimer -= dt;
        ped.torso.rotation.z = (Math.random() - 0.5) * 0.35;
        ped.hpBarGroup.visible = true;
        ped.hpFill.material.color.setHex(0xfacc15);
        if (ped.stunTimer <= 0) {
          ped.isStunned = false;
          ped.torso.rotation.z = 0;
          ped.hpFill.material.color.setHex(0xef4444);
        }
        return;
      }

      // 1. KNOCKED OUT STATE
      if (ped.isKnockedOut) {
        ped.knockoutTimer += dt;
        // Revive after 35 seconds
        if (ped.knockoutTimer > 35) {
          ped.isKnockedOut = false;
          ped.hp = ped.maxHp;
          ped.state = 'WALK';
          ped.lootGiven = false;
          ped.group.rotation.z = 0;
          ped.group.position.y = 0;
          ped.hpBarGroup.visible = false;
        }
        return;
      }

      const distToPlayer = Math.hypot(playerX - ped.x, playerZ - ped.z);

      // Show HP bar when in fight range or damaged
      if (ped.hp < ped.maxHp || (distToPlayer < 6.0 && isHumanOnFoot)) {
        ped.hpBarGroup.visible = true;
        const hpPercent = Math.max(0, ped.hp / ped.maxHp);
        ped.hpFill.scale.x = hpPercent;
        ped.hpFill.position.x = -(1 - hpPercent) * 0.31;
      } else {
        ped.hpBarGroup.visible = false;
      }

      // 2. CHECK CAR HIT ON NPC
      if (!isHumanOnFoot && Math.abs(playerVehicle.speedKmh) > 15) {
        if (distToPlayer < 2.4) {
          const impactDmg = Math.round(Math.abs(playerVehicle.speedKmh) * 1.5);
          ped.hp = Math.max(0, ped.hp - impactDmg);
          playPunchImpactSound();
          playNpcHurtSound();
          this.triggerHitSparks(ped.x, 1.0, ped.z);

          // Knockback from car
          ped.x += Math.sin(playerVehicle.yaw) * 3.5;
          ped.z += Math.cos(playerVehicle.yaw) * 3.5;
          ped.group.position.set(ped.x, 0, ped.z);

          if (ped.hp <= 0 && !ped.isKnockedOut) {
            this.handleKnockout(ped, events);
          }
        }
      }

      // 3. CHECK PLAYER PUNCH ON NPC
      if (isHumanOnFoot && playerHuman && playerHuman.isPunching && playerHuman.punchJustHit) {
        if (distToPlayer < 2.2) {
          // Angle check: is player facing the NPC?
          const toNpcYaw = Math.atan2(ped.x - playerHuman.x, ped.z - playerHuman.z);
          let angleDiff = Math.abs(toNpcYaw - playerHuman.yaw);
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          angleDiff = Math.abs(angleDiff);

          if (angleDiff < 1.6) {
            // Player hit NPC!
            const punchDamage = 28 + Math.floor(Math.random() * 12);
            ped.hp = Math.max(0, ped.hp - punchDamage);
            ped.isBrawler = true;

            playPunchImpactSound();
            playNpcHurtSound();
            this.triggerHitSparks(ped.x, 1.2, ped.z);

            // Knockback NPC
            ped.x += Math.sin(playerHuman.yaw) * 0.6;
            ped.z += Math.cos(playerHuman.yaw) * 0.6;
            ped.group.position.set(ped.x, 0, ped.z);

            ped.staggerTimer = 0.35;

            // Retaliation: if aggressive or neutral, enter COMBAT mode!
            if (ped.type === 'fighter' || ped.type === 'neutral' || ped.type === 'police') {
              ped.state = 'COMBAT';
            } else {
              ped.state = 'FLEE';
            }

            events.push({
              type: 'player_punched_npc',
              npcName: `${ped.name} (${ped.title})`,
              damage: punchDamage,
              npcHp: ped.hp
            });

            if (ped.hp <= 0 && !ped.isKnockedOut) {
              this.handleKnockout(ped, events);
            }
          }
        }
      }

      // POLICE NPC INTERVENTION IF CIVILIAN PLAYER BRAWLS
      if (ped.type === 'police' && !isPlayerPolice && isHumanOnFoot) {
        if (ped.policeCooldown > 0) ped.policeCooldown -= dt;
        if (distToPlayer < 22 && (playerHuman.isPunching || ped.state === 'COMBAT')) {
          ped.state = 'COMBAT';
          const dx = playerX - ped.x;
          const dz = playerZ - ped.z;
          ped.yaw = Math.atan2(dx, dz);
          ped.group.rotation.y = ped.yaw;

          if (distToPlayer > 4.5) {
            const runSpeed = 4.2;
            ped.x += Math.sin(ped.yaw) * runSpeed * dt;
            ped.z += Math.cos(ped.yaw) * runSpeed * dt;
            ped.group.position.set(ped.x, 0, ped.z);

            ped.walkCycle += 16 * dt;
            ped.leftLegPivot.rotation.x = Math.sin(ped.walkCycle) * 0.7;
            ped.rightLegPivot.rotation.x = -Math.sin(ped.walkCycle) * 0.7;
          } else if (ped.policeCooldown <= 0) {
            ped.policeCooldown = 4.0;
            playTaserSound();
            this.triggerHitSparks(playerX, 1.2, playerZ);
            events.push({
              type: 'police_tasered_player',
              officerName: ped.name,
              damage: 15
            });
          }
          return;
        }
      }

      // 4. NPC BEHAVIOR STATE MACHINE
      if (ped.staggerTimer > 0) {
        ped.staggerTimer -= dt;
        ped.torso.rotation.x = 0.3; // recoil back
        return;
      } else {
        ped.torso.rotation.x = 0;
      }

      if (ped.state === 'COMBAT' && isHumanOnFoot) {
        // Face player
        const dx = playerX - ped.x;
        const dz = playerZ - ped.z;
        ped.yaw = Math.atan2(dx, dz);
        ped.group.rotation.y = ped.yaw;

        // Boxing stance: raise arms
        ped.leftArmPivot.rotation.x = -1.2;
        ped.leftArmPivot.rotation.y = 0.4;
        ped.rightArmPivot.rotation.x = -1.2;
        ped.rightArmPivot.rotation.y = -0.4;

        if (distToPlayer > 1.4) {
          // Approach player
          const runSpeed = 3.6;
          ped.x += Math.sin(ped.yaw) * runSpeed * dt;
          ped.z += Math.cos(ped.yaw) * runSpeed * dt;
          ped.group.position.set(ped.x, 0, ped.z);

          // Step animation
          ped.walkCycle += 14 * dt;
          ped.leftLegPivot.rotation.x = Math.sin(ped.walkCycle) * 0.6;
          ped.rightLegPivot.rotation.x = -Math.sin(ped.walkCycle) * 0.6;
        } else {
          // In melee range! Attack player!
          ped.attackCooldown -= dt;
          if (ped.attackCooldown <= 0) {
            ped.attackCooldown = 0.95 + Math.random() * 0.6; // punch interval

            // Punch animation
            ped.rightArmPivot.rotation.x = -1.7;
            playPunchSwingSound();

            setTimeout(() => {
              if (Math.hypot(playerX - ped.x, playerZ - ped.z) < 1.8) {
                const npcDmg = 8 + Math.floor(Math.random() * 8);
                playPunchImpactSound();
                events.push({
                  type: 'npc_hit_player',
                  npcName: `${ped.name} (${ped.title})`,
                  damage: npcDmg
                });
              }
            }, 120);
          }
        }
      } else if (ped.state === 'FLEE' && isHumanOnFoot) {
        // Run away from player
        const fleeYaw = Math.atan2(ped.x - playerX, ped.z - playerZ);
        ped.yaw = fleeYaw;
        ped.group.rotation.y = ped.yaw;

        const fleeSpeed = 4.8;
        ped.x += Math.sin(ped.yaw) * fleeSpeed * dt;
        ped.z += Math.cos(ped.yaw) * fleeSpeed * dt;
        ped.group.position.set(ped.x, 0, ped.z);

        ped.walkCycle += 18 * dt;
        ped.leftLegPivot.rotation.x = Math.sin(ped.walkCycle) * 0.8;
        ped.rightLegPivot.rotation.x = -Math.sin(ped.walkCycle) * 0.8;
        ped.leftArmPivot.rotation.x = -Math.sin(ped.walkCycle) * 0.6;
        ped.rightArmPivot.rotation.x = Math.sin(ped.walkCycle) * 0.6;

        if (distToPlayer > 18) {
          ped.state = 'WALK';
        }
      } else {
        // NORMAL WALK ON SIDEWALKS
        const target = ped.targetWp;
        const dx = target.x - ped.x;
        const dz = target.z - ped.z;
        const distToWp = Math.hypot(dx, dz);

        if (distToWp < 2.0) {
          ped.wpIdx = (ped.wpIdx + 1) % ped.waypoints.length;
          ped.targetWp = ped.waypoints[ped.wpIdx];
        }

        const targetYaw = Math.atan2(dx, dz);
        ped.yaw += (targetYaw - ped.yaw) * 5 * dt;
        ped.group.rotation.y = ped.yaw;

        ped.x += Math.sin(ped.yaw) * ped.speed * dt;
        ped.z += Math.cos(ped.yaw) * ped.speed * dt;
        ped.group.position.set(ped.x, 0, ped.z);

        // Walk animation
        ped.walkCycle += 8 * dt;
        ped.leftLegPivot.rotation.x = Math.sin(ped.walkCycle) * 0.5;
        ped.rightLegPivot.rotation.x = -Math.sin(ped.walkCycle) * 0.5;
        ped.leftArmPivot.rotation.x = -Math.sin(ped.walkCycle) * 0.45;
        ped.rightArmPivot.rotation.x = Math.sin(ped.walkCycle) * 0.45;
      }
    });

    return events;
  }

  handleKnockout(ped, events) {
    ped.isKnockedOut = true;
    ped.knockoutTimer = 0;
    ped.hpBarGroup.visible = false;

    // Fall down flat on pavement
    ped.group.position.y = 0.15;
    ped.group.rotation.z = Math.PI / 2;

    playNpcKnockoutSound();

    if (!ped.lootGiven) {
      ped.lootGiven = true;
      const lootAmount = 35 + Math.floor(Math.random() * 85); // ₴35 - ₴120
      this.dropCashPickup(ped.x, ped.z, lootAmount);

      events.push({
        type: 'npc_knocked_out',
        npcName: `${ped.name} (${ped.title})`,
        lootAmount
      });
    }
  }

  destroy() {
    if (this.group && this.group.parent) {
      this.group.parent.remove(this.group);
    }
    this.pedestrians = [];
    this.cashPickups = [];
  }
}
