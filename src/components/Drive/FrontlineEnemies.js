import * as THREE from 'three';
import {
  playAk47BurstSound,
  playNpcHurtSound,
  playNpcKnockoutSound,
  playCashSound,
  playCrashSound
} from '../../utils/audioSynthesizer';

/**
 * 3D Frontline Enemy Soldiers AI & Combat System:
 * - Spawns 28+ armed Russian occupation soldiers across 4 echelons of defense
 * - Roles: Штурмовики Z, Кулеметники ПКМ, Снайпери СВД, Гранатометники РПГ-7, Командири, ФСБ
 * - White armbands / Z identification markers
 * - Combat AI: targeting, automatic rifle fire bursts, bullet tracers
 * - Vehicle ramming / Roadkill (Танк Т-64БВ & Броневик Козак-2М)
 * - Dynamic reinforcements waves when enemy ranks are thinned
 * - Trophies, cash rewards (+₴350-1,200) and kill counters
 */
export class FrontlineEnemies {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.bulletTracers = [];
    this.totalKills = 0;
    this.reinforcementTimer = 0;

    this.spawnAllEnemies();
  }

  spawnAllEnemies() {
    // 28 Initial fortified positions across the front line (Z: -30 to -195)
    const initialPositions = [
      // 1. ПЕРЕДОВИЙ ЕШЕЛОН & СІРА ЗОНА (Z: -30 to -60)
      { x: -12, z: -35, role: 'Передовий дозор Z', hp: 120, maxHp: 120, reward: 350, type: 'rifle' },
      { x: 15, z: -40, role: 'Стрілець секрету', hp: 120, maxHp: 120, reward: 360, type: 'rifle' },
      { x: -28, z: -50, role: 'Розвідник у вирві', hp: 110, maxHp: 110, reward: 380, type: 'rifle' },
      { x: 26, z: -55, role: 'Штурмовик «Шторм-Z»', hp: 130, maxHp: 130, reward: 400, type: 'assault' },
      { x: -2, z: -58, role: 'Стрілець завалу', hp: 120, maxHp: 120, reward: 360, type: 'rifle' },

      // 2. ГОЛОВНА ЛІНІЯ ТРАНШЕЙ ТА ОПОРНИЙ ПУНКТ (Z: -65 to -95)
      { x: -22, z: -70, role: 'Кулеметник ПКМ', hp: 180, maxHp: 180, reward: 520, type: 'mg' },
      { x: 0, z: -75, role: 'Стрілець траншеї', hp: 120, maxHp: 120, reward: 360, type: 'rifle' },
      { x: 20, z: -78, role: 'Гранатометник РПГ-7', hp: 150, maxHp: 150, reward: 500, type: 'rpg' },
      { x: -38, z: -85, role: 'Снайпер СВД у бліндажі', hp: 110, maxHp: 110, reward: 580, type: 'sniper' },
      { x: -10, z: -90, role: 'Окупант у шанці', hp: 125, maxHp: 125, reward: 370, type: 'rifle' },
      { x: 14, z: -92, role: 'Піхотинець РФ', hp: 120, maxHp: 120, reward: 350, type: 'rifle' },
      { x: 36, z: -95, role: 'Кулеметник флангу', hp: 175, maxHp: 175, reward: 510, type: 'mg' },

      // 3. ЦЕНТРАЛЬНИЙ УКРІПРАЙОН ТА СПАЛЕНА БРОНЕГРУПА (Z: -100 to -135)
      { x: -45, z: -105, role: 'Снайпер пагорба', hp: 115, maxHp: 115, reward: 590, type: 'sniper' },
      { x: -18, z: -110, role: 'Екіпаж спаленого БМП', hp: 135, maxHp: 135, reward: 420, type: 'assault' },
      { x: 8, z: -112, role: 'Оператор БПЛА РФ', hp: 110, maxHp: 110, reward: 480, type: 'rifle' },
      { x: 28, z: -115, role: 'Охоронець капоніра', hp: 140, maxHp: 140, reward: 430, type: 'rifle' },
      { x: -25, z: -125, role: 'Стрілець укриття', hp: 120, maxHp: 120, reward: 370, type: 'rifle' },
      { x: 18, z: -128, role: 'Кулеметник ДОТу «Зубр»', hp: 190, maxHp: 190, reward: 550, type: 'mg' },
      { x: -6, z: -132, role: 'Штурмовик прикриття', hp: 135, maxHp: 135, reward: 410, type: 'assault' },
      { x: 38, z: -135, role: 'Вартовий арсеналу', hp: 145, maxHp: 145, reward: 440, type: 'rifle' },

      // 4. ДРУГА ЛІНІЯ ОБОРОНИ ТА КОМАНДНИЙ ВУЗОЛ (Z: -140 to -165)
      { x: -30, z: -142, role: 'Командир взводу окупантів', hp: 260, maxHp: 260, reward: 950, type: 'officer' },
      { x: -12, z: -148, role: 'Зв\'язківець штабу РФ', hp: 120, maxHp: 120, reward: 460, type: 'rifle' },
      { x: 16, z: -150, role: 'Гвардійський стрілець', hp: 145, maxHp: 145, reward: 430, type: 'rifle' },
      { x: 32, z: -155, role: 'Охоронець генератора', hp: 130, maxHp: 130, reward: 400, type: 'rifle' },
      { x: -22, z: -162, role: 'Патрульний тилу', hp: 125, maxHp: 125, reward: 380, type: 'rifle' },

      // 5. ПРИКОРДОННИЙ БЛОКПОСТ КПП НА МОСКВУ (Z: -170 to -195)
      { x: -16, z: -172, role: 'Прикордонник ФСБ РФ', hp: 160, maxHp: 160, reward: 580, type: 'officer' },
      { x: 14, z: -175, role: 'Вартовий шлагбаума КПП', hp: 135, maxHp: 135, reward: 420, type: 'rifle' },
      { x: -8, z: -185, role: 'Комендант застави РФ', hp: 220, maxHp: 220, reward: 850, type: 'officer' },
      { x: 18, z: -190, role: 'Черговий прикордонного рубежу', hp: 140, maxHp: 140, reward: 450, type: 'rifle' }
    ];

    initialPositions.forEach((p, idx) => {
      const enemy = this.createEnemyMesh(p.x, p.z, p.role, idx, p.hp, p.reward, p.type);
      this.enemies.push(enemy);
      this.group.add(enemy.group);
    });
  }

  createEnemyMesh(x, z, role, idx, hp = 120, reward = 350, type = 'rifle') {
    const enemyGroup = new THREE.Group();
    enemyGroup.position.set(x, 0, z);

    // Uniform Materials (Russian Flora / Dark Swamp Olive)
    const uniformMat = new THREE.MeshStandardMaterial({
      color: type === 'officer' ? 0x1f2e1a : 0x273623,
      roughness: 0.85
    });
    const vestMat = new THREE.MeshStandardMaterial({
      color: type === 'officer' ? 0x111827 : 0x1f291e,
      roughness: 0.8
    });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.6 });
    const helmetMat = new THREE.MeshStandardMaterial({
      color: type === 'sniper' ? 0x3f3f46 : 0x1a2417,
      roughness: 0.7
    });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.3 });
    // Russian white identification armbands
    const whiteArmbandMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });

    // Torso & Heavy Body Armor (6Б45)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.55, 0.28), uniformMat);
    torso.position.y = 0.95;
    torso.castShadow = true;
    enemyGroup.add(torso);

    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.44, 0.34), vestMat);
    vest.position.y = 0.96;
    enemyGroup.add(vest);

    // White Armbands on sleeves
    for (let ax of [-0.23, 0.23]) {
      const armband = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.2), whiteArmbandMat);
      armband.position.set(ax, 1.0, 0);
      enemyGroup.add(armband);
    }

    // Head & Combat Helmet
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), skinMat);
    head.position.y = 1.38;
    enemyGroup.add(head);

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.165, 12, 12), helmetMat);
    helmet.position.y = 1.42;
    enemyGroup.add(helmet);

    // Legs
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.65, 0.16), uniformMat);
    leftLeg.position.set(-0.12, 0.35, 0);
    enemyGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.65, 0.16), uniformMat);
    rightLeg.position.set(0.12, 0.35, 0);
    enemyGroup.add(rightLeg);

    // White band on right leg
    const legBand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.18), whiteArmbandMat);
    legBand.position.set(0.12, 0.38, 0);
    enemyGroup.add(legBand);

    // Boots
    for (let bx of [-0.12, 0.12]) {
      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.24), bootMat);
      boot.position.set(bx, 0.08, 0.04);
      enemyGroup.add(boot);
    }

    // Weapon representation based on role
    let weaponLen = 0.75;
    let weaponThickness = 0.08;
    if (type === 'mg') {
      weaponLen = 0.95;
      weaponThickness = 0.11;
    } else if (type === 'sniper') {
      weaponLen = 1.1;
      weaponThickness = 0.07;
    } else if (type === 'rpg') {
      weaponLen = 0.9;
      weaponThickness = 0.12;
    }

    const rifle = new THREE.Mesh(
      new THREE.BoxGeometry(weaponThickness, 0.12, weaponLen),
      gunMat
    );
    rifle.position.set(0.16, 1.0, 0.32);
    enemyGroup.add(rifle);

    // Muzzle flash point
    const muzzleLight = new THREE.PointLight(0xf59e0b, 0, 15);
    muzzleLight.position.set(0.16, 1.0, 0.32 + weaponLen * 0.5);
    enemyGroup.add(muzzleLight);

    // Overhead Red Threat Indicator / Health Bar (Billboard Canvas)
    const nameCanvas = document.createElement('canvas');
    nameCanvas.width = 256;
    nameCanvas.height = 64;
    const ctx = nameCanvas.getContext('2d');
    ctx.fillStyle = type === 'officer' ? '#7f1d1d' : '#dc2626';
    ctx.fillRect(8, 8, 240, 48);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, 240, 48);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔴 ' + role, 128, 38);

    const nameTex = new THREE.CanvasTexture(nameCanvas);
    const nameMat = new THREE.SpriteMaterial({ map: nameTex });
    const nameSprite = new THREE.Sprite(nameMat);
    nameSprite.position.set(0, 1.9, 0);
    nameSprite.scale.set(1.9, 0.48, 1);
    enemyGroup.add(nameSprite);

    return {
      id: 'enemy_' + idx,
      role,
      type,
      x,
      z,
      yaw: 0,
      hp,
      maxHp: hp,
      reward,
      isAlive: true,
      shootCooldown: Math.random() * 2.0,
      flashTimer: 0,
      group: enemyGroup,
      originX: x,
      originZ: z,
      muzzleLight,
      nameSprite
    };
  }

  spawnReinforcementWave() {
    const waveCount = 5;
    const spawnZ = -175 - Math.random() * 15;
    for (let i = 0; i < waveCount; i++) {
      const x = -30 + Math.random() * 60;
      const z = spawnZ + (Math.random() - 0.5) * 10;
      const roles = [
        { role: 'Підкріплення: Штурмовик Z', type: 'assault', hp: 130, reward: 400 },
        { role: 'Підкріплення: Кулеметник ПКМ', type: 'mg', hp: 175, reward: 520 },
        { role: 'Підкріплення: Стрілець резерву', type: 'rifle', hp: 120, reward: 360 }
      ];
      const pick = roles[Math.floor(Math.random() * roles.length)];
      const idx = this.enemies.length;
      const enemy = this.createEnemyMesh(x, z, pick.role, idx, pick.hp, pick.reward, pick.type);
      this.enemies.push(enemy);
      this.group.add(enemy.group);
    }
  }

  createBulletTracer(startPos, endPos) {
    const dir = new THREE.Vector3().subVectors(endPos, startPos);
    const length = dir.length();
    if (length < 1) return;

    const geo = new THREE.CylinderGeometry(0.04, 0.04, length, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const tracer = new THREE.Mesh(geo, mat);

    // Align cylinder to vector
    const mid = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
    tracer.position.copy(mid);
    tracer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());

    this.scene.add(tracer);
    this.bulletTracers.push({ mesh: tracer, ttl: 0.12 });
  }

  update(dt, playerPos, weaponAction = null, vehicleState = null) {
    const events = [];

    // Clean up temporary bullet tracers
    for (let i = this.bulletTracers.length - 1; i >= 0; i--) {
      const tr = this.bulletTracers[i];
      tr.ttl -= dt;
      if (tr.ttl <= 0) {
        this.scene.remove(tr.mesh);
        tr.mesh.geometry.dispose();
        tr.mesh.material.dispose();
        this.bulletTracers.splice(i, 1);
      }
    }

    let aliveCount = 0;

    this.enemies.forEach(enemy => {
      if (!enemy.isAlive) return;
      aliveCount++;

      // Handle muzzle flash fade
      if (enemy.flashTimer > 0) {
        enemy.flashTimer -= dt;
        if (enemy.flashTimer <= 0) {
          enemy.muzzleLight.intensity = 0;
        }
      }

      const dx = playerPos.x - enemy.x;
      const dz = playerPos.z - enemy.z;
      const distToPlayer = Math.hypot(dx, dz);

      // 1. Vehicle Ramming / Roadkill (Танк Т-64БВ або Броневик Козак-2М на швидкості)
      if (vehicleState && vehicleState.isDriving && vehicleState.speedKmh > 14) {
        if (distToPlayer < 3.2) {
          enemy.isAlive = false;
          enemy.hp = 0;
          enemy.group.rotation.x = Math.PI / 2;
          enemy.group.position.y = 0.15;
          enemy.nameSprite.visible = false;

          playCrashSound?.();
          playNpcKnockoutSound();
          playCashSound();

          this.totalKills++;
          events.push({
            type: 'enemy_eliminated',
            role: enemy.role + ' (Роздавлено бронетехнікою)',
            reward: enemy.reward + 100
          });
          return;
        }
      }

      // 2. Aim towards player when within engagement range (60 meters)
      if (distToPlayer < 60.0) {
        enemy.yaw = Math.atan2(dx, dz);
        enemy.group.rotation.y = enemy.yaw;

        // Shoot bursts at player
        enemy.shootCooldown -= dt;
        if (enemy.shootCooldown <= 0) {
          const isMg = enemy.type === 'mg';
          const isSniper = enemy.type === 'sniper';

          enemy.shootCooldown = isMg
            ? 1.2 + Math.random() * 0.9
            : isSniper
            ? 3.2 + Math.random() * 1.5
            : 1.8 + Math.random() * 1.4;

          playAk47BurstSound();

          // Flash & Tracer
          enemy.muzzleLight.intensity = 3.5;
          enemy.flashTimer = 0.08;

          const startPos = new THREE.Vector3(enemy.x, 1.0, enemy.z);
          const endPos = new THREE.Vector3(playerPos.x, 0.9, playerPos.z);
          this.createBulletTracer(startPos, endPos);

          // Damage to player (if player is within range)
          if (distToPlayer < 52.0) {
            let baseDamage = 7 + Math.random() * 8;
            if (isSniper) baseDamage = 18 + Math.random() * 12;
            if (isMg) baseDamage = 10 + Math.random() * 10;
            if (enemy.type === 'rpg') baseDamage = 22 + Math.random() * 14;

            events.push({
              type: 'player_hit_by_enemy',
              enemyRole: enemy.role,
              damage: Math.round(baseDamage)
            });
          }
        }
      } else {
        // Subtle idle scan
        enemy.group.rotation.y += Math.sin(Date.now() * 0.001 + enemy.x) * 0.008;
      }

      // 3. Check if player attack hits this enemy
      if (weaponAction) {
        const canHit =
          (weaponAction.type === 'ak74' && distToPlayer < 130) ||
          (weaponAction.type === 'stinger' && distToPlayer < 190) ||
          (weaponAction.type === 'shotgun' && distToPlayer < 28) ||
          (weaponAction.type === 'tank' && distToPlayer < 260) ||
          (weaponAction.type === 'kozak' && distToPlayer < 160) ||
          (weaponAction.type === 'fists' && distToPlayer < 3.2);

        if (canHit) {
          const dmg =
            weaponAction.damage ||
            (weaponAction.type === 'tank' ? 320 : weaponAction.type === 'kozak' ? 140 : 85);

          enemy.hp -= dmg;
          playNpcHurtSound();

          if (enemy.hp <= 0) {
            enemy.isAlive = false;
            enemy.hp = 0;
            enemy.group.rotation.x = Math.PI / 2; // Fall to ground
            enemy.group.position.y = 0.2;
            enemy.nameSprite.visible = false;

            playNpcKnockoutSound();
            playCashSound();

            this.totalKills++;
            events.push({
              type: 'enemy_eliminated',
              role: enemy.role,
              reward: enemy.reward
            });
          }
        }
      }
    });

    // 4. Wave Reinforcement logic: if living count falls low (< 7), spawn reinforcements
    if (aliveCount < 8) {
      this.reinforcementTimer += dt;
      if (this.reinforcementTimer > 25.0) {
        this.reinforcementTimer = 0;
        this.spawnReinforcementWave();
        events.push({
          type: 'reinforcements_arrived',
          count: 5
        });
      }
    }

    return events;
  }

  getCombatStats() {
    const aliveCount = this.enemies.filter(e => e.isAlive).length;
    return {
      aliveCount,
      totalKills: this.totalKills,
      totalCount: this.enemies.length
    };
  }

  destroy() {
    this.bulletTracers.forEach(tr => {
      this.scene.remove(tr.mesh);
      tr.mesh.geometry.dispose();
      tr.mesh.material.dispose();
    });
    this.bulletTracers = [];

    if (this.group && this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
