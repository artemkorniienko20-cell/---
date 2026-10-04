import * as THREE from 'three';
import {
  playAk47BurstSound,
  playNpcHurtSound,
  playNpcKnockoutSound,
  playCashSound
} from '../../utils/audioSynthesizer';

/**
 * 3D Frontline Enemy Soldiers AI & Combat System:
 * - Spawns armed Russian occupation forces on fortified frontline positions
 * - Combat AI: patrols trenches, aims and fires automatic rifle bursts at the player
 * - Hit detection for player weapons (AK-74, Stinger, FPV drone, Tank cannon, vehicle ramming)
 * - Trophies, cash rewards (+₴300-500) and combat feedback
 */
export class FrontlineEnemies {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.spawnEnemies();
  }

  spawnEnemies() {
    // Enemy spawn positions along the Russian frontline (Z: -70 to -170)
    const positions = [
      { x: -15, z: -85, role: 'Стрілець-автоматник' },
      { x: 18, z: -88, role: 'Кулеметник ДОТу' },
      { x: -35, z: -110, role: 'Окупант у траншеї' },
      { x: 42, z: -115, role: 'Снайпер позиції' },
      { x: -8, z: -140, role: 'Патрульний кордону' },
      { x: 25, z: -145, role: 'Вартовий КПП' },
      { x: -28, z: -170, role: 'Прикордонний караул' },
      { x: 15, z: -175, role: 'Черговий застави' }
    ];

    positions.forEach((p, idx) => {
      const enemy = this.createEnemyMesh(p.x, p.z, p.role, idx);
      this.enemies.push(enemy);
      this.group.add(enemy.group);
    });
  }

  createEnemyMesh(x, z, role, idx) {
    const enemyGroup = new THREE.Group();
    enemyGroup.position.set(x, 0, z);

    // Uniform Materials (Russian Flora / Dark Swamp Olive)
    const uniformMat = new THREE.MeshStandardMaterial({ color: 0x273623, roughness: 0.85 });
    const vestMat = new THREE.MeshStandardMaterial({ color: 0x1f291e, roughness: 0.8 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.6 });
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0x1a2417, roughness: 0.7 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.4 });

    // Torso & Body Armor
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.55, 0.28), uniformMat);
    torso.position.y = 0.95;
    torso.castShadow = true;
    enemyGroup.add(torso);

    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.42, 0.32), vestMat);
    vest.position.y = 0.96;
    enemyGroup.add(vest);

    // Head & Combat Helmet
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), skinMat);
    head.position.y = 1.38;
    enemyGroup.add(head);

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), helmetMat);
    helmet.position.y = 1.42;
    enemyGroup.add(helmet);

    // Legs
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.65, 0.16), uniformMat);
    leftLeg.position.set(-0.12, 0.35, 0);
    enemyGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.65, 0.16), uniformMat);
    rightLeg.position.set(0.12, 0.35, 0);
    enemyGroup.add(rightLeg);

    // Boots
    for (let bx of [-0.12, 0.12]) {
      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.24), bootMat);
      boot.position.set(bx, 0.08, 0.04);
      enemyGroup.add(boot);
    }

    // Assault Rifle in Hands (AK-12 / AK-74)
    const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.75), gunMat);
    rifle.position.set(0.16, 1.0, 0.28);
    enemyGroup.add(rifle);

    // Overhead Red Threat Indicator / Health Bar (Billboard Canvas)
    const nameCanvas = document.createElement('canvas');
    nameCanvas.width = 256;
    nameCanvas.height = 64;
    const ctx = nameCanvas.getContext('2d');
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(10, 10, 236, 44);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔴 Ворог: ' + role, 128, 38);

    const nameTex = new THREE.CanvasTexture(nameCanvas);
    const nameMat = new THREE.SpriteMaterial({ map: nameTex });
    const nameSprite = new THREE.Sprite(nameMat);
    nameSprite.position.set(0, 1.85, 0);
    nameSprite.scale.set(1.8, 0.45, 1);
    enemyGroup.add(nameSprite);

    return {
      id: 'enemy_' + idx,
      role,
      x,
      z,
      yaw: 0,
      hp: 120,
      maxHp: 120,
      isAlive: true,
      shootCooldown: Math.random() * 2.0,
      group: enemyGroup,
      originX: x,
      originZ: z,
      nameSprite
    };
  }

  update(dt, playerPos, weaponAction = null) {
    const events = [];

    this.enemies.forEach(enemy => {
      if (!enemy.isAlive) return;

      const dx = playerPos.x - enemy.x;
      const dz = playerPos.z - enemy.z;
      const distToPlayer = Math.hypot(dx, dz);

      // 1. Aim towards player when within engagement range (55 meters)
      if (distToPlayer < 55.0) {
        enemy.yaw = Math.atan2(dx, dz);
        enemy.group.rotation.y = enemy.yaw;

        // Shoot bursts at player
        enemy.shootCooldown -= dt;
        if (enemy.shootCooldown <= 0) {
          enemy.shootCooldown = 1.8 + Math.random() * 1.4;
          playAk47BurstSound();

          // Damage to player (if player is not too far and not protected)
          if (distToPlayer < 45.0) {
            const hitDamage = Math.round(7 + Math.random() * 8);
            events.push({
              type: 'player_hit_by_enemy',
              enemyRole: enemy.role,
              damage: hitDamage
            });
          }
        }
      } else {
        // Subtle idle wander
        enemy.group.rotation.y += Math.sin(Date.now() * 0.001) * 0.01;
      }

      // 2. Check if player attack hits this enemy
      if (weaponAction) {
        const canHit =
          (weaponAction.type === 'ak74' && distToPlayer < 120) ||
          (weaponAction.type === 'stinger' && distToPlayer < 180) ||
          (weaponAction.type === 'shotgun' && distToPlayer < 25) ||
          (weaponAction.type === 'tank' && distToPlayer < 250) ||
          (weaponAction.type === 'kozak' && distToPlayer < 150) ||
          (weaponAction.type === 'fists' && distToPlayer < 3.2);

        if (canHit) {
          const dmg = weaponAction.damage || (weaponAction.type === 'tank' ? 300 : 80);
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

            const reward = 300 + Math.floor(Math.random() * 200);
            events.push({
              type: 'enemy_eliminated',
              role: enemy.role,
              reward
            });
          }
        }
      }
    });

    return events;
  }

  destroy() {
    if (this.group && this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
