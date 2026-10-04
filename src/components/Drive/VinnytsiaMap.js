import * as THREE from 'three';

/**
 * Builds the realistic 3D City of Vinnytsia with an expanded street network:
 * - вул. Соборна (Головна вулиця Центру)
 * - Центральний міст через річку Південний Буг
 * - Проспект Коцюбинського (Замостя)
 * - Вулиця Київська (Північна Набережна)
 * - Вулиця Театральна & Театр ім. Садовського
 * - Хмельницьке шосе (Швидкісний проспект на захід)
 * - Вулиця Пирогова (Паркова зона)
 * - Набережна «Рошен» та плавучий фонтан Roshen
 * - Вежа Артинова на Європейській площі (1912)
 * - Світлофори, пішохідні переходи «Зебра», дорожні знаки та трамвай Mirage
 */
export function buildVinnytsiaCity(scene) {
  const colliders = [];

  // ================= 1. INFINITE OPEN WORLD TERRAIN =================
  const terrainGeo = new THREE.PlaneGeometry(2400, 2400);
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.95,
    metalness: 0.05
  });
  const ground = new THREE.Mesh(terrainGeo, terrainMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Road Asphalt Materials
  const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x181e2b, roughness: 0.82 });
  const highwayMat = new THREE.MeshStandardMaterial({ color: 0x131722, roughness: 0.78 });
  const whitePaintMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  const yellowPaintMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

  // ================= 2. STREET NETWORK =================

  // --- Street 1: Вулиця Соборна (Z: -120 to 15, X: 0, width: 14) ---
  const soborna = new THREE.Mesh(new THREE.PlaneGeometry(14, 135), asphaltMat);
  soborna.rotation.x = -Math.PI / 2;
  soborna.position.set(0, 0.02, -52.5);
  soborna.receiveShadow = true;
  scene.add(soborna);
  addRoadCenterLine(scene, 0, -52.5, 135, false);

  // --- Street 2: Центральний міст (Z: 15 to 45, X: 0, width: 12) ---
  const bridgeRoad = new THREE.Mesh(new THREE.BoxGeometry(12, 0.6, 32), asphaltMat);
  bridgeRoad.position.set(0, 0.35, 30);
  bridgeRoad.receiveShadow = true;
  scene.add(bridgeRoad);

  // Bridge railings & illumination arches
  const railMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.3 });
  for (let x of [-5.9, 5.9]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 32), railMat);
    rail.position.set(x, 0.8, 30);
    scene.add(rail);
    colliders.push({ type: 'box', x, z: 30, width: 0.6, depth: 32, name: 'Перила Центрального мосту' });
  }
  for (let z of [20, 30, 40]) {
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(6.2, 0.15, 16, 32, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 })
    );
    arch.rotation.y = Math.PI / 2;
    arch.position.set(0, 0.35, z);
    scene.add(arch);
  }

  // --- Street 3: Проспект Коцюбинського (Замостя) (Z: 45 to 300, X: 0, width: 14) ---
  const kotsyubynsky = new THREE.Mesh(new THREE.PlaneGeometry(14, 255), asphaltMat);
  kotsyubynsky.rotation.x = -Math.PI / 2;
  kotsyubynsky.position.set(0, 0.02, 172.5);
  kotsyubynsky.receiveShadow = true;
  scene.add(kotsyubynsky);
  addRoadCenterLine(scene, 0, 172.5, 255, false);

  // --- Street 4: Вулиця Київська (Північна Набережна) (Z: 55, X: -300 to +300, width: 12) ---
  const kyivska = new THREE.Mesh(new THREE.PlaneGeometry(600, 12), asphaltMat);
  kyivska.rotation.x = -Math.PI / 2;
  kyivska.position.set(0, 0.02, 55);
  kyivska.receiveShadow = true;
  scene.add(kyivska);
  addRoadCenterLine(scene, 0, 55, 600, true);

  // --- Street 5: Вулиця Театральна / Артинова (Z: -15, X: -250 to +250, width: 12) ---
  const teatralna = new THREE.Mesh(new THREE.PlaneGeometry(500, 12), asphaltMat);
  teatralna.rotation.x = -Math.PI / 2;
  teatralna.position.set(0, 0.02, -15);
  teatralna.receiveShadow = true;
  scene.add(teatralna);
  addRoadCenterLine(scene, 0, -15, 500, true);

  // --- Street 6: Хмельницьке шосе (Швидкісний проспект) (Z: -50, X: -40 to -550, width: 16) ---
  const khmelnytske = new THREE.Mesh(new THREE.PlaneGeometry(510, 16), highwayMat);
  khmelnytske.rotation.x = -Math.PI / 2;
  khmelnytske.position.set(-295, 0.02, -50);
  khmelnytske.receiveShadow = true;
  scene.add(khmelnytske);
  addRoadCenterLine(scene, -295, -50, 510, true, yellowPaintMat);

  // Green central divider on Khmelnytske Shose
  const dividerMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.9 });
  const divider = new THREE.Mesh(new THREE.BoxGeometry(490, 0.15, 1.2), dividerMat);
  divider.position.set(-295, 0.08, -50);
  scene.add(divider);

  // --- Street 7: Вулиця Пирогова (Паркова зона) (Diagonal: from (-30, -50) to (-200, -320), width: 12) ---
  const pirogovRoad = new THREE.Mesh(new THREE.PlaneGeometry(12, 330), asphaltMat);
  pirogovRoad.rotation.x = -Math.PI / 2;
  pirogovRoad.rotation.z = Math.PI / 6; // 30 deg angle
  pirogovRoad.position.set(-115, 0.02, -185);
  pirogovRoad.receiveShadow = true;
  scene.add(pirogovRoad);

  // --- Street 8: Набережна «Рошен» (Z: 12, X: 6 to 260, width: 10) ---
  const roshenPromenade = new THREE.Mesh(new THREE.PlaneGeometry(254, 10), asphaltMat);
  roshenPromenade.rotation.x = -Math.PI / 2;
  roshenPromenade.position.set(133, 0.02, 12);
  roshenPromenade.receiveShadow = true;
  scene.add(roshenPromenade);

  // ================= 3. PIVDENNYI BUH RIVER & EMBANKMENTS =================
  const river = new THREE.Mesh(
    new THREE.PlaneGeometry(2400, 30),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.15, metalness: 0.85, transparent: true, opacity: 0.88 })
  );
  river.rotation.x = -Math.PI / 2;
  river.position.set(0, 0.05, 30);
  scene.add(river);

  // Stone embankments leaving bridge open (X: -6.5 to +6.5)
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
  // West Banks
  const bankNW = new THREE.Mesh(new THREE.BoxGeometry(1193, 0.4, 1.0), stoneMat);
  bankNW.position.set(-603.5, 0.2, 14.5);
  scene.add(bankNW);
  colliders.push({ type: 'box', x: -603.5, z: 14.5, width: 1193, depth: 1.0, name: 'Набережна (Захід)' });

  const bankSW = new THREE.Mesh(new THREE.BoxGeometry(1193, 0.4, 1.0), stoneMat);
  bankSW.position.set(-603.5, 0.2, 45.5);
  scene.add(bankSW);
  colliders.push({ type: 'box', x: -603.5, z: 45.5, width: 1193, depth: 1.0, name: 'Набережна (Захід)' });

  // East Banks
  const bankNE = new THREE.Mesh(new THREE.BoxGeometry(1193, 0.4, 1.0), stoneMat);
  bankNE.position.set(603.5, 0.2, 14.5);
  scene.add(bankNE);
  colliders.push({ type: 'box', x: 603.5, z: 14.5, width: 1193, depth: 1.0, name: 'Набережна (Схід)' });

  const bankSE = new THREE.Mesh(new THREE.BoxGeometry(1193, 0.4, 1.0), stoneMat);
  bankSE.position.set(603.5, 0.2, 45.5);
  scene.add(bankSE);
  colliders.push({ type: 'box', x: 603.5, z: 45.5, width: 1193, depth: 1.0, name: 'Набережна (Схід)' });

  // ================= 4. ROSHEN FLOATING FOUNTAIN =================
  const fountainBase = new THREE.Mesh(new THREE.BoxGeometry(18, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 }));
  fountainBase.position.set(22, 0.2, 30);
  scene.add(fountainBase);
  colliders.push({ type: 'box', x: 22, z: 30, width: 18, depth: 6, name: 'Платформа Фонтану Roshen' });

  const jetMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
  const jetMat2 = new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.85 });
  for (let i = -7; i <= 7; i += 2.2) {
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.25, 5.0 + Math.abs(i) * 0.4, 16), i % 2 === 0 ? jetMat1 : jetMat2);
    spout.position.set(22 + i, 2.7, 30);
    scene.add(spout);
  }
  addCitySign(scene, 'ФОНТАН ROSHEN', 12, 1.2, 16, 0);

  // ================= 5. VINNYTSIA WATER TOWER (ВЕЖА АРТИНОВА) =================
  const towerGroup = new THREE.Group();
  towerGroup.position.set(0, 0, -18);
  scene.add(towerGroup);

  const brickMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.85 });
  const whiteCorniceMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });

  const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.8, 6, 8), brickMat);
  tier1.position.y = 3;
  tier1.castShadow = true;
  towerGroup.add(tier1);

  const cornice1 = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.4, 8), whiteCorniceMat);
  cornice1.position.y = 6.2;
  towerGroup.add(cornice1);

  const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.2, 8, 8), brickMat);
  tier2.position.y = 10.4;
  tier2.castShadow = true;
  towerGroup.add(tier2);

  const clockTier = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 3.5, 8), brickMat);
  clockTier.position.y = 16;
  towerGroup.add(clockTier);

  // 4 Working Clock Faces
  const clockMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfef08a, emissiveIntensity: 0.5 });
  for (let rot of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const clock = new THREE.Mesh(new THREE.CircleGeometry(1.0, 24), clockMat);
    clock.rotation.y = rot;
    clock.position.set(Math.sin(rot) * 3.65, 16, Math.cos(rot) * 3.65);
    towerGroup.add(clock);
  }

  const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(4.0, 6.0, 8), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.5 }));
  towerRoof.position.y = 20.8;
  towerGroup.add(towerRoof);

  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.15, 3.5, 16), new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9 }));
  spire.position.y = 24.5;
  towerGroup.add(spire);

  colliders.push({ type: 'circle', x: 0, z: -18, radius: 4.8, name: 'Вінницька Вежа Артинова' });
  addCitySign(scene, 'ВЕЖА АРТИНОВА 1912', 0, 1.2, -11, 0);

  // ================= 6. VADYM SADOVSKY THEATRE (ВІННИЦЬКИЙ ТЕАТР) =================
  const theatreGroup = new THREE.Group();
  theatreGroup.position.set(-28, 0, -15);
  scene.add(theatreGroup);

  // Theatre Main Building
  const theatreMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 });
  const tBuilding = new THREE.Mesh(new THREE.BoxGeometry(16, 9, 20), theatreMat);
  tBuilding.position.y = 4.5;
  tBuilding.castShadow = true;
  theatreGroup.add(tBuilding);

  // Colonnade Portico
  const colMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  for (let z of [-6, -2.4, 1.2, 4.8]) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 7, 16), colMat);
    column.position.set(8.5, 3.5, z);
    theatreGroup.add(column);
  }

  // Pediment triangle on roof
  const pediment = new THREE.Mesh(new THREE.ConeGeometry(7, 2.5, 4), colMat);
  pediment.rotation.y = Math.PI / 4;
  pediment.position.set(8.5, 8.2, 0);
  theatreGroup.add(pediment);

  colliders.push({ type: 'box', x: -28, z: -15, width: 17, depth: 21, name: 'Театр ім. Садовського' });
  addCitySign(scene, 'ТЕАТР ІМ. САДОВСЬКОГО', -18, 2.8, -15, Math.PI / 2);

  // ================= 7. VINNYTSIA CITY HALL (МІСЬКА РАДА / МЕРІЯ) =================
  const hallGroup = new THREE.Group();
  hallGroup.position.set(24, 0, -5);
  scene.add(hallGroup);

  const hallMesh = new THREE.Mesh(
    new THREE.BoxGeometry(14, 10, 18),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
  );
  hallMesh.position.y = 5.0;
  hallMesh.castShadow = true;
  hallGroup.add(hallMesh);
  colliders.push({ type: 'box', x: 24, z: -5, width: 15, depth: 19, name: 'Вінницька міська рада' });
  addCitySign(scene, 'ВІННИЦЬКА МІСЬКА РАДА', 16, 3.2, -5, -Math.PI / 2);

  // ================= 8. SWISS MIRAGE TRAM & RAILS =================
  const tramGroup = new THREE.Group();
  tramGroup.position.set(-7.5, 0, -2);
  scene.add(tramGroup);

  const tramLower = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 12), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 }));
  tramLower.position.y = 1.0;
  tramLower.castShadow = true;
  tramGroup.add(tramLower);

  const tramUpper = new THREE.Mesh(new THREE.BoxGeometry(2.35, 1.2, 11.8), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }));
  tramUpper.position.y = 2.3;
  tramGroup.add(tramUpper);

  colliders.push({ type: 'box', x: -7.5, z: -2, width: 2.8, depth: 12.5, name: 'Вінницький трамвай Mirage' });

  // Tram Steel Rails along Soborna
  const railMatSteel = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95 });
  for (let x of [-8.2, -6.8]) {
    const railLine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 140), railMatSteel);
    railLine.position.set(x, 0.025, -15);
    scene.add(railLine);
  }

  // ================= 9. TRAFFIC LIGHTS AT INTERSECTIONS =================
  addTrafficLightPost(scene, -7.5, -13.5, 0); // Соборна / Театральна
  addTrafficLightPost(scene, 7.5, -16.5, Math.PI);
  addTrafficLightPost(scene, -7.5, 53.5, 0); // Коцюбинського / Київська
  addTrafficLightPost(scene, 7.5, 56.5, Math.PI);
  addTrafficLightPost(scene, -15, -48, Math.PI / 2); // Соборна / Хмельницьке шосе

  // ================= 10. ZEBRA PEDESTRIAN CROSSINGS =================
  addZebraCrossing(scene, 0, -13, 14, true); // На Соборній біля Вежі
  addZebraCrossing(scene, 0, -22, 14, true);
  addZebraCrossing(scene, 0, 13, 14, true); // Перед в'їздом на міст
  addZebraCrossing(scene, 0, 52, 14, true); // Замостя
  addZebraCrossing(scene, -18, -15, 12, false); // На вул. Театральній
  addZebraCrossing(scene, 18, -15, 12, false);
  addZebraCrossing(scene, -22, -50, 16, false); // Хмельницьке шосе

  // ================= 11. STREET SIGNS POSTS =================
  addCitySign(scene, 'ВУЛ. СОБОРНА', 0, 4.5, 5, 0);
  addCitySign(scene, 'ВУЛ. ТЕАТРАЛЬНА', -12, 3.5, -15, 0);
  addCitySign(scene, 'ХМЕЛЬНИЦЬКЕ ШОСЕ', -50, 4.5, -50, Math.PI / 2);
  addCitySign(scene, 'ВУЛ. ПИРОГОВА', -35, 4.0, -65, Math.PI / 3);
  addCitySign(scene, 'ПРОСП. КОЦЮБИНСЬКОГО', 0, 4.5, 75, 0);
  addCitySign(scene, 'ВУЛ. КИЇВСЬКА', 40, 4.0, 55, Math.PI / 2);
  addCitySign(scene, 'НАБЕРЕЖНА ROSHEN', 35, 3.5, 12, 0);

  // ================= 12. CITY BUILDINGS ALONG STREETS =================
  const buildingColors = [0xd97706, 0xb45309, 0x0284c7, 0x475569, 0x059669, 0x64748b, 0x7c3aed];
  // Buildings Left of Soborna (South)
  for (let i = 0; i < 4; i++) {
    const zPos = -45 + i * 16;
    if (zPos === -45) continue; // Clear dedicated space for «Вінницький Люкс» Luxury Housing
    const bMesh = new THREE.Mesh(
      new THREE.BoxGeometry(10, 8 + (i % 2) * 3, 14),
      new THREE.MeshStandardMaterial({ color: buildingColors[i % buildingColors.length], roughness: 0.8 })
    );
    bMesh.position.set(-22, 5, zPos);
    bMesh.castShadow = true;
    scene.add(bMesh);
    colliders.push({ type: 'box', x: -22, z: zPos, width: 10, depth: 14, name: 'Будинок на вул. Соборній' });
  }

  // Buildings Right of Soborna (South)
  for (let i = 0; i < 4; i++) {
    const zPos = -45 + i * 16;
    if (zPos === -45 || zPos === -29) continue; // Clear dedicated commercial plot for «АТБ-Маркет»
    const bMesh = new THREE.Mesh(
      new THREE.BoxGeometry(10, 9 + (i % 3) * 2, 14),
      new THREE.MeshStandardMaterial({ color: buildingColors[(i + 3) % buildingColors.length], roughness: 0.8 })
    );
    bMesh.position.set(22, 5.5, zPos);
    bMesh.castShadow = true;
    scene.add(bMesh);
    colliders.push({ type: 'box', x: 22, z: zPos, width: 10, depth: 14, name: 'Будинок на вул. Соборній' });
  }

  // Buildings along Prospekt Kotsyubynskoho (North / Zamostya)
  for (let i = 0; i < 5; i++) {
    for (let x of [-18, 18]) {
      const zPos = 70 + i * 18;
      if (x === 18 && (zPos === 70 || zPos === 88)) continue; // Clear dedicated space for «Сільпо» Supermarket
      const bHeight = 8 + (i % 3) * 3;
      const bMesh = new THREE.Mesh(
        new THREE.BoxGeometry(10, bHeight, 14),
        new THREE.MeshStandardMaterial({ color: buildingColors[(i + (x > 0 ? 1 : 4)) % buildingColors.length], roughness: 0.85 })
      );
      bMesh.position.set(x, bHeight / 2, zPos);
      bMesh.castShadow = true;
      scene.add(bMesh);
      colliders.push({ type: 'box', x, z: zPos, width: 10, depth: 14, name: 'Будинок на просп. Коцюбинського' });
    }
  }

  // Park Trees along Soborna & European square
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
  for (let pos of [
    [-11, -30], [-11, -42], [-11, -54],
    [11, -30], [11, -42], [11, -54],
    [-40, -15], [-60, -15], [40, -15], [60, -15],
    [-70, -60], [-110, -60], [-150, -60]
  ]) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 2.5, 12), trunkMat);
    trunk.position.set(pos[0], 1.25, pos[1]);
    scene.add(trunk);

    const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 16), leavesMat);
    leaves.position.set(pos[0], 3.2, pos[1]);
    scene.add(leaves);

    colliders.push({ type: 'circle', x: pos[0], z: pos[1], radius: 0.6, name: 'Дерево' });
  }

  return colliders;
}

// Helper: Road Dashed Center line
function addRoadCenterLine(scene, x, z, length, isHorizontal = false, customMat = null) {
  const lineMat = customMat || new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  const dashCount = Math.floor(length / 6);
  for (let i = 0; i < dashCount; i++) {
    const offset = -length / 2 + i * 6 + 3;
    const dash = new THREE.Mesh(
      new THREE.PlaneGeometry(isHorizontal ? 2.5 : 0.25, isHorizontal ? 0.25 : 2.5),
      lineMat
    );
    dash.rotation.x = -Math.PI / 2;
    if (isHorizontal) {
      dash.position.set(x + offset, 0.025, z);
    } else {
      dash.position.set(x, 0.025, z + offset);
    }
    scene.add(dash);
  }
}

// Helper: Zebra Pedestrian Crossing
function addZebraCrossing(scene, x, z, roadWidth, isCrossingX = true) {
  const white = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  const numStripes = Math.floor(roadWidth / 1.2);
  for (let i = 0; i < numStripes; i++) {
    if (i % 2 === 0) {
      const offset = -roadWidth / 2 + i * 1.2 + 0.6;
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(isCrossingX ? 0.7 : 3.0, isCrossingX ? 3.0 : 0.7),
        white
      );
      stripe.rotation.x = -Math.PI / 2;
      if (isCrossingX) {
        stripe.position.set(x + offset, 0.026, z);
      } else {
        stripe.position.set(x, 0.026, z + offset);
      }
      scene.add(stripe);
    }
  }
}

// Helper: Traffic Light Post (Світлофор)
function addTrafficLightPost(scene, x, z, rotY = 0) {
  const postGroup = new THREE.Group();
  postGroup.position.set(x, 0, z);
  postGroup.rotation.y = rotY;
  scene.add(postGroup);

  // Pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 4.5, 12),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
  );
  pole.position.y = 2.25;
  postGroup.add(pole);

  // Housing Box
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 1.2, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
  );
  box.position.set(0, 3.8, 0);
  postGroup.add(box);

  // Red, Yellow, Green Lamps
  const redLamp = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  redLamp.position.set(0, 4.15, 0.18);
  postGroup.add(redLamp);

  const yellowLamp = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), new THREE.MeshBasicMaterial({ color: 0xeab308 }));
  yellowLamp.position.set(0, 3.8, 0.18);
  postGroup.add(yellowLamp);

  const greenLamp = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
  greenLamp.position.set(0, 3.45, 0.18);
  postGroup.add(greenLamp);
}

// Helper: City Text Signs
function addCitySign(scene, text, x, y, z, rotY = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 504, 120);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 256, 75);

  const texture = new THREE.CanvasTexture(canvas);
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 1.05),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
  );
  signMesh.position.set(x, y, z);
  signMesh.rotation.y = rotY;
  scene.add(signMesh);
}
