import * as THREE from 'three';

/**
 * Procedural 3D Frontline / Battleground Map (Локація «Фронт» • Тільки для ЗСУ):
 * - Тільки для армії: зона бойових дій на передовій
 * - Окопи, траншеї, бліндажі ЗСУ з українським прапором
 * - «Сіра зона»: вирви від снарядів, вогонь, дим, мінні поля, протитанкові їжаки
 * - Спалені ворожі танки Т-72 та БМП з літерами Z
 * - Ворожі позиції РФ з блокпостами та колючим дротом
 * - Прикордонний перехід / прорив: «🛣️ ТРАСА НА МОСКВУ (РФ) [F]»
 * - Точка евакуації / повернення: «🇺🇦 ПОВЕРНЕННЯ В КИЇВ [F]»
 */
export function buildFrontlineMap(scene) {
  const colliders = [];

  // ================= 1. BATTLEFIELD TERRAIN =================
  const terrainGeo = new THREE.PlaneGeometry(3000, 3000);
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917, // Dark mud & scarred earth
    roughness: 0.98,
    metalness: 0.05
  });
  const ground = new THREE.Mesh(terrainGeo, terrainMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Materials
  const trenchMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.95 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
  const sandbagMat = new THREE.MeshStandardMaterial({ color: 0xa18249, roughness: 0.9 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, metalness: 0.8, roughness: 0.4 });
  const burntMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95 });
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.9 });
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.9, roughness: 0.3 });

  // Central Military Road (Траса постачання ЗСУ - Фронт - Кордон)
  const roadGeo = new THREE.PlaneGeometry(16, 500);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.02, 0);
  road.receiveShadow = true;
  scene.add(road);

  // ================= 2. ZSU FORWARD DEFENSE SECTOR (Z: 60 to 180) =================
  // Main Command Bunker "Скеля" (Штаб передової)
  const bunkerGroup = new THREE.Group();
  bunkerGroup.position.set(-35, 0, 110);
  scene.add(bunkerGroup);

  const bunkerMesh = new THREE.Mesh(new THREE.BoxGeometry(22, 4.5, 16), concreteMat);
  bunkerMesh.position.y = 2.25;
  bunkerMesh.castShadow = true;
  bunkerGroup.add(bunkerMesh);
  colliders.push({ type: 'box', x: -35, z: 110, width: 23, depth: 17, name: 'Командний бункер ЗСУ' });

  // Wooden log roof & camouflage
  const logRoof = new THREE.Mesh(new THREE.BoxGeometry(24, 0.8, 18), woodMat);
  logRoof.position.y = 4.8;
  bunkerGroup.add(logRoof);

  // Big Ukrainian Flag on the Bunker
  const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 8, 8), steelMat);
  flagPole.position.set(0, 8.5, 0);
  bunkerGroup.add(flagPole);

  const flagTop = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.0), new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide }));
  flagTop.position.set(1.6, 11.5, 0);
  bunkerGroup.add(flagTop);

  const flagBottom = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.0), new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide }));
  flagBottom.position.set(1.6, 10.5, 0);
  bunkerGroup.add(flagBottom);

  // Sandbag walls along ZSU trenches
  for (let x = -80; x <= 80; x += 8) {
    if (Math.abs(x) < 12) continue; // Road passage
    for (let layer = 0; layer < 3; layer++) {
      const bag = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.45, 1.2), sandbagMat);
      bag.position.set(x, 0.25 + layer * 0.42, 75);
      bag.castShadow = true;
      scene.add(bag);
    }
    colliders.push({ type: 'box', x, z: 75, width: 4.6, depth: 1.5, name: 'Окопний бруствер ЗСУ' });
  }

  // Trench network (Дерев'яні траншеї)
  for (let z of [85, 125]) {
    const trenchFloor = new THREE.Mesh(new THREE.PlaneGeometry(160, 4.5), woodMat);
    trenchFloor.rotation.x = -Math.PI / 2;
    trenchFloor.position.set(0, 0.05, z);
    scene.add(trenchFloor);
  }

  // ================= 3. NO MAN'S LAND & DESTROYED ENEMY ARMOR (Z: -40 to +40) =================
  // Artillery Craters with Fire & Smoke
  const craterPositions = [
    { x: -25, z: 15, r: 6.5 },
    { x: 30, z: -10, r: 8.0 },
    { x: -45, z: -25, r: 5.5 },
    { x: 50, z: 20, r: 7.0 },
    { x: 5, z: -35, r: 6.0 }
  ];

  craterPositions.forEach(cr => {
    // Crater rim
    const rim = new THREE.Mesh(
      new THREE.RingGeometry(cr.r * 0.6, cr.r, 16),
      new THREE.MeshStandardMaterial({ color: 0x0c0a09, roughness: 1.0 })
    );
    rim.rotation.x = -Math.PI / 2;
    rim.position.set(cr.x, 0.08, cr.z);
    scene.add(rim);

    // Glowing embers inside crater
    const fire = new THREE.Mesh(
      new THREE.CircleGeometry(cr.r * 0.45, 12),
      new THREE.MeshBasicMaterial({ color: 0xe11d48 })
    );
    fire.rotation.x = -Math.PI / 2;
    fire.position.set(cr.x, 0.1, cr.z);
    scene.add(fire);
  });

  // Anti-Tank Hedgehogs (Протитанкові їжаки)
  const spawnHedgehog = (hx, hz) => {
    const hhGroup = new THREE.Group();
    hhGroup.position.set(hx, 0.8, hz);
    for (let rot of [0, Math.PI / 3, -Math.PI / 3]) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.0, 0.18), steelMat);
      beam.rotation.x = rot;
      beam.rotation.z = rot;
      hhGroup.add(beam);
    }
    scene.add(hhGroup);
    colliders.push({ type: 'circle', x: hx, z: hz, radius: 1.2, name: 'Протитанковий їжак' });
  };

  for (let x = -70; x <= 70; x += 14) {
    if (Math.abs(x) < 10) continue;
    spawnHedgehog(x, 25);
    spawnHedgehog(x + 5, -15);
  }

  // Destroyed Burnt Russian Tank T-72 with "Z" marking
  const wreckGroup = new THREE.Group();
  wreckGroup.position.set(28, 0, 5);
  wreckGroup.rotation.y = 0.45;
  scene.add(wreckGroup);

  const tankHull = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.1, 6.8), burntMat);
  tankHull.position.y = 0.8;
  wreckGroup.add(tankHull);

  // Turret blown off to the side on the ground
  const blownTurret = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.9, 12), burntMat);
  blownTurret.position.set(3.2, 0.45, -1.8);
  blownTurret.rotation.z = 0.35;
  wreckGroup.add(blownTurret);

  const cannonBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.2, 8), burntMat);
  cannonBarrel.position.set(4.8, 0.5, -3.2);
  cannonBarrel.rotation.x = Math.PI / 2 - 0.2;
  wreckGroup.add(cannonBarrel);

  // White "Z" marking on wrecked tank
  const zSign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 1.4),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  );
  zSign.position.set(1.78, 0.85, 0);
  zSign.rotation.y = Math.PI / 2;
  wreckGroup.add(zSign);

  colliders.push({ type: 'box', x: 28, z: 5, width: 8.0, depth: 7.0, name: 'Знищений танк окупантів Т-72' });

  // Burnt BMP-2 Vehicle
  const bmpGroup = new THREE.Group();
  bmpGroup.position.set(-32, 0, -5);
  bmpGroup.rotation.y = -0.3;
  scene.add(bmpGroup);

  const bmpHull = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 6.0), burntMat);
  bmpHull.position.y = 0.75;
  bmpGroup.add(bmpHull);

  colliders.push({ type: 'box', x: -32, z: -5, width: 4.0, depth: 6.5, name: 'Спалена БМП окупантів' });

  // Minefield warning signs (Мінні поля)
  const spawnMineSign = (mx, mz) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6), woodMat);
    post.position.set(mx, 0.75, mz);
    scene.add(post);

    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.6, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 })
    );
    signBoard.position.set(mx, 1.25, mz);
    scene.add(signBoard);
  };
  spawnMineSign(-18, 40);
  spawnMineSign(18, 40);
  spawnMineSign(-18, -30);
  spawnMineSign(18, -30);

  // ================= 4. ENEMY RUSSIAN POSITIONS (Z: -80 to -180) =================
  // Enemy Bunker & Fortified Checkpoint
  const enemyBunker = new THREE.Mesh(new THREE.BoxGeometry(24, 4.2, 14), concreteMat);
  enemyBunker.position.set(35, 2.1, -120);
  enemyBunker.castShadow = true;
  scene.add(enemyBunker);
  colliders.push({ type: 'box', x: 35, z: -120, width: 25, depth: 15, name: 'Укріплений ДОТ окупантів' });

  // Enemy Sandbags & Barbed Wire
  for (let x = -80; x <= 80; x += 10) {
    if (Math.abs(x) < 14) continue;
    const bag = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.2, 1.4), sandbagMat);
    bag.position.set(x, 0.6, -95);
    scene.add(bag);
    colliders.push({ type: 'box', x, z: -95, width: 5.6, depth: 1.6, name: 'Ворожі барикади' });
  }

  // ================= 5. BORDER BREACH GATEWAY TO MOSCOW (Z: -200) =================
  // Massive Border Gateway & Road Signs leading into Russia / Moscow
  const gateGroup = new THREE.Group();
  gateGroup.position.set(0, 0, -200);
  scene.add(gateGroup);

  // Left & Right Concrete Gate Pillars
  for (let gx of [-10, 10]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(2.5, 7.0, 2.5), concreteMat);
    pillar.position.set(gx, 3.5, 0);
    gateGroup.add(pillar);
    colliders.push({ type: 'box', x: gx, z: -200, width: 2.8, depth: 2.8, name: 'Прикордонний КПП' });
  }

  // Overhead Crossbeam Arch
  const crossbeam = new THREE.Mesh(new THREE.BoxGeometry(22, 1.4, 2.0), steelMat);
  crossbeam.position.set(0, 6.3, 0);
  gateGroup.add(crossbeam);

  // Highway Signboard: "ТРАСА М3 • НА МОСКВУ"
  const signMesh = new THREE.Mesh(
    new THREE.BoxGeometry(16, 2.2, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4 })
  );
  signMesh.position.set(0, 6.3, 1.1);
  gateGroup.add(signMesh);

  // Glowing Gateway Portal Circle (Cyan / Violet Portal effect)
  const portalRing = new THREE.Mesh(
    new THREE.RingGeometry(2.5, 5.5, 24),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
  );
  portalRing.position.set(0, 3.2, 0);
  gateGroup.add(portalRing);

  // ================= 6. EVACUATION / RETURN TO KYIV POINT (Z: +160) =================
  const returnGroup = new THREE.Group();
  returnGroup.position.set(0, 0, 160);
  scene.add(returnGroup);

  const returnSign = new THREE.Mesh(
    new THREE.BoxGeometry(16, 2.2, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
  );
  returnSign.position.set(0, 4.0, 0);
  returnGroup.add(returnSign);

  const returnRing = new THREE.Mesh(
    new THREE.RingGeometry(2.2, 4.8, 24),
    new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
  );
  returnRing.position.set(0, 2.8, 0);
  returnGroup.add(returnRing);

  return {
    colliders,
    // Waypoints and interactive trigger points
    gateToMoscow: { x: 0, z: -200, radius: 14.0 },
    returnToKyiv: { x: 0, z: 160, radius: 14.0 },
    zsuBase: { x: -35, z: 110, radius: 18.0 }
  };
}
