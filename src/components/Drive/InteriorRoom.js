import * as THREE from 'three';
import { playTvClickSound, playEatingSound, playRepairSound, playDoorSound } from '../../utils/audioSynthesizer';

/**
 * 3D Enterable Interior Room System:
 * - Detailed 3D furnished apartment / cottage living space
 * - Bedroom with bed (sleep to restore 100% HP & hunger)
 * - Kitchen with refrigerator (free snack)
 * - Living room with sofa and interactive TV with channels
 * - Front door to walk back onto the city streets
 */

export const INTERIOR_ORIGIN = { x: 0, y: 300, z: 0 };

const TV_CHANNELS = [
  { name: '📺 «Єдині Новини» (Інформаційний телемарафон)', color: 0x1d4ed8, emissive: 0x2563eb },
  { name: '🏎️ «Тюнінг & Дрифт Шоу» (Автомобільний канал)', color: 0xb45309, emissive: 0xf59e0b },
  { name: '🎵 «Музичний телеканал M1» (Хіти України)', color: 0x7c3aed, emissive: 0x8b5cf6 },
  { name: '⚽ «Спорт Футбол» (Українська Прем\'єр-ліга)', color: 0x047857, emissive: 0x10b981 }
];

export class InteriorRoom {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(INTERIOR_ORIGIN.x, INTERIOR_ORIGIN.y, INTERIOR_ORIGIN.z);
    this.group.visible = false;
    this.scene.add(this.group);

    this.tvChannelIdx = 0;
    this.currentProperty = null;
    this.colliders = [];

    this.buildInterior();
  }

  buildInterior() {
    // 1. Lighting inside the room
    const ambient = new THREE.AmbientLight(0xffedd5, 1.2);
    this.group.add(ambient);

    const warmCeilingLight = new THREE.PointLight(0xfef08a, 2.5, 18);
    warmCeilingLight.position.set(0, 2.8, 0);
    this.group.add(warmCeilingLight);

    // Bedside lamp light
    const lampLight = new THREE.PointLight(0xfbbf24, 1.5, 8);
    lampLight.position.set(4.8, 1.6, 2.5);
    this.group.add(lampLight);

    // 2. Room Shell (Floor, Ceiling, Walls)
    // Floor - Warm wooden parquet
    const floorGeo = new THREE.BoxGeometry(13, 0.3, 13);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.45,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.15;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Ceiling - Smooth off-white
    const ceilingGeo = new THREE.BoxGeometry(13, 0.3, 13);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.y = 3.15;
    this.group.add(ceiling);

    // Wall Material
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 }); // Dark modern slate
    const accentWallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });

    // Back Wall (Z = 6) with panoramic window
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(13, 3.2, 0.3), accentWallMat);
    backWall.position.set(0, 1.5, 6.15);
    this.group.add(backWall);

    // Panoramic Window in back wall
    const windowFrame = new THREE.Mesh(
      new THREE.BoxGeometry(7, 2.2, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    );
    windowFrame.position.set(0, 1.6, 6.0);
    this.group.add(windowFrame);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.9,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1
    });
    const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 1.9), glassMat);
    windowGlass.position.set(0, 1.6, 5.96);
    this.group.add(windowGlass);

    // Front Wall (Z = -6) with entrance door
    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.2, 0.3), wallMat);
    frontWallLeft.position.set(-3.6, 1.5, -6.15);
    this.group.add(frontWallLeft);

    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.2, 0.3), wallMat);
    frontWallRight.position.set(3.6, 1.5, -6.15);
    this.group.add(frontWallRight);

    const frontWallTop = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.8, 0.3), wallMat);
    frontWallTop.position.set(0, 2.7, -6.15);
    this.group.add(frontWallTop);

    // Entrance / Exit Door
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 }); // Oak door
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.3, 0.15), doorMat);
    door.position.set(0, 1.15, -6.1);
    this.group.add(door);

    // Door Handle
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.2 })
    );
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0.65, 1.15, -5.98);
    this.group.add(handle);

    // Left Wall (X = -6)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 13), wallMat);
    leftWall.position.set(-6.15, 1.5, 0);
    this.group.add(leftWall);

    // Right Wall (X = 6)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 13), wallMat);
    rightWall.position.set(6.15, 1.5, 0);
    this.group.add(rightWall);

    // 3. BEDROOM ZONE (Right Side: X ≈ 4, Z ≈ 2)
    // Double Bed Frame
    const bedFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.45, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.6 })
    );
    bedFrame.position.set(4.3, 0.22, 2.8);
    this.group.add(bedFrame);

    // Mattress
    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.35, 2.6),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 })
    );
    mattress.position.set(4.3, 0.55, 2.8);
    this.group.add(mattress);

    // Cozy Blanket
    const blanket = new THREE.Mesh(
      new THREE.BoxGeometry(2.25, 0.08, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.8 }) // Deep cyan blanket
    );
    blanket.position.set(4.3, 0.72, 3.2);
    this.group.add(blanket);

    // Pillows
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.5), pillowMat);
    pillow1.position.set(3.7, 0.75, 1.8);
    this.group.add(pillow1);
    const pillow2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.5), pillowMat);
    pillow2.position.set(4.9, 0.75, 1.8);
    this.group.add(pillow2);

    // Nightstand
    const nightstand = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.6, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x1f2937 })
    );
    nightstand.position.set(4.8, 0.3, 1.2);
    this.group.add(nightstand);

    // Bed target glowing indicator on floor
    this.bedTargetRing = this.createInteractiveFloorMarker(4.3, 1.0, 0x10b981);

    // 4. KITCHEN ZONE (Left Side: X ≈ -4, Z ≈ -2)
    // Modern Refrigerator
    const fridgeGeo = new THREE.BoxGeometry(1.2, 2.2, 1.0);
    const fridgeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.7,
      roughness: 0.25
    });
    const fridge = new THREE.Mesh(fridgeGeo, fridgeMat);
    fridge.position.set(-4.8, 1.1, -2.5);
    this.group.add(fridge);

    // Fridge handle
    const fridgeHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
    );
    fridgeHandle.position.set(-4.18, 1.2, -2.2);
    this.group.add(fridgeHandle);

    // Kitchen Counter with Sink
    const counterGeo = new THREE.BoxGeometry(1.3, 0.95, 2.4);
    const counterMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const counter = new THREE.Mesh(counterGeo, counterMat);
    counter.position.set(-4.8, 0.48, -0.6);
    this.group.add(counter);

    // Microwave on counter
    const microwave = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.4, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
    );
    microwave.position.set(-4.8, 1.15, -0.6);
    this.group.add(microwave);

    // Fridge target glowing indicator on floor
    this.fridgeTargetRing = this.createInteractiveFloorMarker(-3.8, -2.2, 0xf59e0b);

    // 5. LIVING ROOM & ENTERTAINMENT ZONE (Center / Sofa & TV)
    // Modern L-Sofa
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.45, 1.2), sofaMat);
    sofaBase.position.set(0, 0.22, 1.2);
    this.group.add(sofaBase);

    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.7, 0.35), sofaMat);
    sofaBack.position.set(0, 0.75, 0.75);
    this.group.add(sofaBack);

    // Coffee Table
    const tableGeo = new THREE.BoxGeometry(1.8, 0.4, 0.9);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.4, roughness: 0.3 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 0.2, 2.6);
    this.group.add(table);

    // Cozy Living Room Rug
    const rug = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.02, 3.0),
      new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.9 })
    );
    rug.position.set(0, 0.01, 2.0);
    this.group.add(rug);

    // 4K Smart TV Wall Unit (Z = 5.9, mounted high)
    const tvFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.8, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.2, metalness: 0.9 })
    );
    tvFrame.position.set(0, 1.8, 5.85);
    this.group.add(tvFrame);

    // Dynamic TV Screen
    const tvScreenGeo = new THREE.PlaneGeometry(3.0, 1.6);
    this.tvScreenMat = new THREE.MeshBasicMaterial({
      color: TV_CHANNELS[0].color,
      side: THREE.DoubleSide
    });
    this.tvScreen = new THREE.Mesh(tvScreenGeo, this.tvScreenMat);
    this.tvScreen.position.set(0, 1.8, 5.78);
    this.tvScreen.rotation.y = Math.PI;
    this.group.add(this.tvScreen);

    // TV Glow Light in room
    this.tvLight = new THREE.PointLight(TV_CHANNELS[0].emissive, 1.8, 7);
    this.tvLight.position.set(0, 1.8, 4.8);
    this.group.add(this.tvLight);

    // TV target glowing indicator on floor
    this.tvTargetRing = this.createInteractiveFloorMarker(0, 3.6, 0x8b5cf6);

    // 6. Exit Door target indicator on floor
    this.exitTargetRing = this.createInteractiveFloorMarker(0, -5.0, 0x38bdf8);

    // Wall Art Posters
    const poster = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 1.4),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    );
    poster.position.set(3.8, 1.8, -6.0);
    this.group.add(poster);

    // Interior Colliders (Bounding boxes relative to world when positioned)
    this.initColliders();
  }

  createInteractiveFloorMarker(localX, localZ, hexColor) {
    const ringGeo = new THREE.RingGeometry(0.65, 0.95, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: hexColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(localX, 0.03, localZ);
    this.group.add(ring);
    return ring;
  }

  initColliders() {
    const Y = INTERIOR_ORIGIN.y;
    // Room boundary walls (box colliders)
    this.colliders = [
      // Left Wall
      { type: 'box', x: -6.0, z: 0, width: 0.4, depth: 13 },
      // Right Wall
      { type: 'box', x: 6.0, z: 0, width: 0.4, depth: 13 },
      // Back Wall
      { type: 'box', x: 0, z: 6.0, width: 13, depth: 0.4 },
      // Front Left Wall
      { type: 'box', x: -3.5, z: -6.0, width: 5.5, depth: 0.4 },
      // Front Right Wall
      { type: 'box', x: 3.5, z: -6.0, width: 5.5, depth: 0.4 },
      // Bed
      { type: 'box', x: 4.3, z: 2.8, width: 2.5, depth: 2.9 },
      // Kitchen Counter & Fridge
      { type: 'box', x: -4.8, z: -1.5, width: 1.5, depth: 3.2 },
      // Sofa
      { type: 'box', x: 0, z: 1.0, width: 3.4, depth: 1.4 },
      // Coffee table
      { type: 'box', x: 0, z: 2.6, width: 1.9, depth: 1.0 }
    ];
  }

  cycleTvChannel() {
    this.tvChannelIdx = (this.tvChannelIdx + 1) % TV_CHANNELS.length;
    const ch = TV_CHANNELS[this.tvChannelIdx];
    this.tvScreenMat.color.setHex(ch.color);
    this.tvLight.color.setHex(ch.emissive);
    playTvClickSound();
    return ch;
  }

  getColliders() {
    return this.colliders;
  }

  // Check what interactive object the player is standing next to inside the room
  checkInteractions(humanX, humanZ) {
    // Human coordinates are local to room when inside
    const distToBed = Math.hypot(humanX - 4.3, humanZ - 1.0);
    const distToFridge = Math.hypot(humanX - (-3.8), humanZ - (-2.2));
    const distToTv = Math.hypot(humanX - 0, humanZ - 3.6);
    const distToExit = Math.hypot(humanX - 0, humanZ - (-5.0));

    if (distToExit < 1.7) {
      return {
        type: 'exit',
        name: 'Вихід на вулицю',
        prompt: 'Натисніть [E] або [ENTER], щоб вийти назад на вулицю міста'
      };
    }
    if (distToBed < 1.8) {
      return {
        type: 'bed',
        name: 'Затишне ліжко',
        prompt: 'Натисніть [E] або [ENTER], щоб поспати (відновлює 100% ❤️ та 100% 🍗)'
      };
    }
    if (distToFridge < 1.8) {
      return {
        type: 'fridge',
        name: 'Холодильник з продуктами',
        prompt: 'Натисніть [E] або [ENTER], щоб перекусити (+35% ситості, +10% здоров\'я)'
      };
    }
    if (distToTv < 2.0) {
      const curCh = TV_CHANNELS[this.tvChannelIdx];
      return {
        type: 'tv',
        name: curCh.name,
        prompt: 'Натисніть [E] або [ENTER], щоб перемкнути телеканал'
      };
    }
    return null;
  }

  enter(property) {
    this.currentProperty = property;
    this.group.visible = true;
    return {
      spawnX: 0,
      spawnZ: -4.5,
      spawnYaw: 0
    };
  }

  exit() {
    this.group.visible = false;
    const prop = this.currentProperty;
    this.currentProperty = null;
    return prop;
  }

  destroy() {
    if (this.group && this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
