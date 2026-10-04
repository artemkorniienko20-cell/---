import * as THREE from 'three';

/**
 * Builds the realistic 3D City of Tokmak (Місто Токмак, Запорізька область):
 * - В'їзна стела «ТОКМАК» з прапором України та гербом
 * - Річка Токмачка з автомобільним мостом
 * - Залізнична станція «Великий Токмак» з коліями, пероном та потягом
 * - Токмацький машинобудівний дизельний завод («Південдизельмаш»)
 * - Токмацький зерновий елеватор (високі циліндричні силоси)
 * - СЕС «Tokmak Solar Energy» (поле сонячних панелей)
 * - Центральна площа та міська рада Токмака
 * - Південні степові автотраси Р37 та Т-04-01
 * - Блокпости та захисні споруди
 */
export function buildTokmakCity(scene) {
  const colliders = [];

  // ================= 1. OPEN WORLD TERRAIN & STEPPE FIELDS =================
  const terrainGeo = new THREE.PlaneGeometry(2800, 2800);
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x142017, // Steppe meadow dark olive green
    roughness: 0.95,
    metalness: 0.05
  });
  const ground = new THREE.Mesh(terrainGeo, terrainMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Materials
  const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
  const brickMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.85 });
  const industrialMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.3 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });
  const solarPanelMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 });
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0369a1,
    roughness: 0.15,
    metalness: 0.8,
    transparent: true,
    opacity: 0.85
  });
  const yellowFieldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 }); // Wheat / Sunflower field

  // Steppe Wheat & Sunflower patches on city outskirts
  for (let fx of [-280, 280]) {
    const field = new THREE.Mesh(new THREE.PlaneGeometry(350, 600), yellowFieldMat);
    field.rotation.x = -Math.PI / 2;
    field.position.set(fx, 0.015, -150);
    scene.add(field);
  }

  // ================= 2. TOKMACHKA RIVER & HIGHWAY BRIDGE =================
  // Winding river channel (Z: -600 to +600, around X: -60)
  const riverGeo = new THREE.PlaneGeometry(36, 1200);
  const river = new THREE.Mesh(riverGeo, waterMat);
  river.rotation.x = -Math.PI / 2;
  river.position.set(-60, 0.02, 0);
  scene.add(river);

  // Highway Bridge across River Tokmachka at Z: 0
  const bridgeGroup = new THREE.Group();
  bridgeGroup.position.set(-60, 0, 0);
  scene.add(bridgeGroup);

  const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(44, 1.2, 16), concreteMat);
  bridgeDeck.position.y = 1.8;
  bridgeDeck.receiveShadow = true;
  bridgeGroup.add(bridgeDeck);

  // Bridge Guardrails
  for (let bz of [-7.6, 7.6]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(44, 1.1, 0.35), steelMat);
    rail.position.set(0, 2.7, bz);
    bridgeGroup.add(rail);
    colliders.push({ type: 'box', x: -60, z: bz, width: 44, depth: 0.5, name: 'Перила мосту через р. Токмачка' });
  }

  // Bridge concrete piers
  for (let px of [-12, 12]) {
    const pier = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 4.0, 10), concreteMat);
    pier.position.set(px, 0.8, 0);
    bridgeGroup.add(pier);
  }

  // ================= 3. MAIN ROAD NETWORK (ТРАСА Р37 ТА ЦЕНТРАЛЬНИЙ ПРОСПЕКТ) =================
  // East-West Main Avenue (через міст): Z: 0, from X: -350 to +350
  const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(700, 15), asphaltMat);
  mainRoad.rotation.x = -Math.PI / 2;
  mainRoad.position.set(0, 0.03, 0);
  mainRoad.receiveShadow = true;
  scene.add(mainRoad);

  // North-South Central Street (вул. Шевченка / Центральна): X: 60, from Z: -350 to +350
  const centralStreet = new THREE.Mesh(new THREE.PlaneGeometry(14, 700), asphaltMat);
  centralStreet.rotation.x = -Math.PI / 2;
  centralStreet.position.set(60, 0.031, 0);
  centralStreet.receiveShadow = true;
  scene.add(centralStreet);

  // Sidewalks
  for (let sz of [-9, 9]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(700, 3.0), concreteMat);
    sw.rotation.x = -Math.PI / 2;
    sw.position.set(0, 0.035, sz);
    scene.add(sw);
  }

  // ================= 4. В'ЇЗНА СТЕЛА «ТОКМАК» ТА ПРАПОР УКРАЇНИ =================
  // Location: X: -180, Z: 18 (на в'їзді в місто)
  const stelaGroup = new THREE.Group();
  stelaGroup.position.set(-180, 0, 16);
  scene.add(stelaGroup);

  // Concrete pedestal
  const stelaBase = new THREE.Mesh(new THREE.BoxGeometry(14, 1.6, 4.0), concreteMat);
  stelaBase.position.y = 0.8;
  stelaGroup.add(stelaBase);

  // Monumental Letters / Monument
  const stelaPillar = new THREE.Mesh(new THREE.BoxGeometry(12, 5.0, 1.5), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 }));
  stelaPillar.position.set(0, 3.8, 0);
  stelaPillar.castShadow = true;
  stelaGroup.add(stelaPillar);

  // Yellow trim
  const yellowTrim = new THREE.Mesh(new THREE.BoxGeometry(12.2, 1.0, 1.6), new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }));
  yellowTrim.position.set(0, 5.8, 0);
  stelaGroup.add(yellowTrim);

  // Flagpole with Ukrainian Flag
  const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 14, 8), steelMat);
  flagPole.position.set(7.5, 7.0, 0);
  stelaGroup.add(flagPole);

  const flagBlue = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 0.05), new THREE.MeshBasicMaterial({ color: 0x2563eb }));
  flagBlue.position.set(9.4, 12.8, 0);
  stelaGroup.add(flagBlue);

  const flagYellow = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 0.05), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
  flagYellow.position.set(9.4, 11.6, 0);
  stelaGroup.add(flagYellow);

  colliders.push({ type: 'box', x: -180, z: 16, width: 15, depth: 5, name: 'В\'їзна стела «ТОКМАК»' });

  // ================= 5. ЗАЛІЗНИЧНИЙ ВОКЗАЛ «ВЕЛИКИЙ ТОКМАК» =================
  // Location: X: 140, Z: -120
  const stationGroup = new THREE.Group();
  stationGroup.position.set(140, 0, -120);
  scene.add(stationGroup);

  // Main Railway Station Building (Класична двоповерхова будівля вокзалу)
  const stationMain = new THREE.Mesh(
    new THREE.BoxGeometry(38, 9.5, 18),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.8 }) // Sunny yellow facade
  );
  stationMain.position.y = 4.75;
  stationMain.castShadow = true;
  stationGroup.add(stationMain);

  // Roof & Center pediment
  const stationRoof = new THREE.Mesh(
    new THREE.ConeGeometry(8.0, 4.0, 4),
    new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 })
  );
  stationRoof.position.set(0, 11.5, 0);
  stationRoof.rotation.y = Math.PI / 4;
  stationGroup.add(stationRoof);

  // Station Signboard: "СТАНЦІЯ ВЕЛИКИЙ ТОКМАК"
  const stSign = new THREE.Mesh(
    new THREE.BoxGeometry(22, 1.8, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.3 })
  );
  stSign.position.set(0, 7.8, 9.2);
  stationGroup.add(stSign);

  // Railway Platform (Перон)
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(90, 0.8, 12),
    concreteMat
  );
  platform.position.set(0, 0.4, -15);
  stationGroup.add(platform);

  // Railway Tracks (Колії)
  for (let tz of [-25, -31]) {
    // Ballast gravel
    const ballast = new THREE.Mesh(new THREE.PlaneGeometry(160, 4.5), new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 }));
    ballast.rotation.x = -Math.PI / 2;
    ballast.position.set(0, 0.04, tz);
    stationGroup.add(ballast);

    // Steel rails
    for (let rx of [-0.9, 0.9]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(160, 0.15, 0.12), steelMat);
      rail.position.set(0, 0.12, tz + rx);
      stationGroup.add(rail);
    }
  }

  // Locomotive 2TE116 on track
  const trainGroup = new THREE.Group();
  trainGroup.position.set(-25, 0, -25);
  stationGroup.add(trainGroup);

  const locoBody = new THREE.Mesh(new THREE.BoxGeometry(18, 3.8, 3.2), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 })); // Green locomotive
  locoBody.position.y = 2.4;
  trainGroup.add(locoBody);

  const locoCab = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.2, 3.0), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
  locoCab.position.set(7.0, 3.6, 0);
  trainGroup.add(locoCab);

  colliders.push({ type: 'box', x: 140, z: -120, width: 40, depth: 20, name: 'Вокзал «Великий Токмак»' });
  colliders.push({ type: 'box', x: 115, z: -145, width: 20, depth: 4.5, name: 'Потяг 2ТЕ116' });

  // ================= 6. ТОКМАЦЬКИЙ ДИЗЕЛЕБУДІВНИЙ ЗАВОД («ПІВДЕНДИЗЕЛЬМАШ») =================
  // Location: X: -140, Z: -150
  const factoryGroup = new THREE.Group();
  factoryGroup.position.set(-140, 0, -150);
  scene.add(factoryGroup);

  // Giant Industrial Workshop 1
  const workshop1 = new THREE.Mesh(new THREE.BoxGeometry(55, 14, 38), industrialMat);
  workshop1.position.y = 7.0;
  workshop1.castShadow = true;
  factoryGroup.add(workshop1);

  // Giant Industrial Workshop 2
  const workshop2 = new THREE.Mesh(new THREE.BoxGeometry(42, 11, 30), brickMat);
  workshop2.position.set(45, 5.5, -8);
  workshop2.castShadow = true;
  factoryGroup.add(workshop2);

  // Factory Chimney (Труба заводу - 36м)
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.8, 36, 12), brickMat);
  chimney.position.set(-24, 18, -15);
  factoryGroup.add(chimney);

  // Factory Signboard
  const factorySign = new THREE.Mesh(
    new THREE.BoxGeometry(26, 2.2, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.3 })
  );
  factorySign.position.set(0, 11.5, 19.2);
  factoryGroup.add(factorySign);

  colliders.push({ type: 'box', x: -140, z: -150, width: 58, depth: 40, name: 'Токмацький Дизелебудівний Завод' });
  colliders.push({ type: 'box', x: -95, z: -158, width: 44, depth: 32, name: 'Цех №2 Дизельмашу' });

  // ================= 7. ТОКМАЦЬКИЙ ЕЛЕВАТОР (СИЛОСИ ЗЕРНОСХОВИЩА) =================
  // Location: X: 160, Z: 120
  const elevatorGroup = new THREE.Group();
  elevatorGroup.position.set(160, 0, 120);
  scene.add(elevatorGroup);

  // 6 Giant Grain Silos (Сріблясті зерносховища)
  for (let row = -1; row <= 1; row++) {
    for (let col = -1; col <= 0; col++) {
      const silo = new THREE.Mesh(
        new THREE.CylinderGeometry(6.5, 6.5, 24, 18),
        steelMat
      );
      silo.position.set(row * 15, 12, col * 15);
      silo.castShadow = true;
      elevatorGroup.add(silo);

      // Silo cone roof
      const siloRoof = new THREE.Mesh(new THREE.ConeGeometry(6.6, 3.5, 18), steelMat);
      siloRoof.position.set(row * 15, 25.75, col * 15);
      elevatorGroup.add(siloRoof);

      colliders.push({ type: 'circle', x: 160 + row * 15, z: 120 + col * 15, radius: 6.8, name: 'Силос елеватора' });
    }
  }

  // Overhead Grain Conveyor Gallery (Транспортерна галерея)
  const conveyor = new THREE.Mesh(new THREE.BoxGeometry(38, 2.5, 3.5), steelMat);
  conveyor.position.set(0, 24.5, -7.5);
  elevatorGroup.add(conveyor);

  // ================= 8. СОНЯЧНА ЕЛЕКТРОСТАНЦІЯ «TOKMAK SOLAR ENERGY» =================
  // Location: X: -150, Z: 130
  const solarGroup = new THREE.Group();
  solarGroup.position.set(-150, 0, 130);
  scene.add(solarGroup);

  // 6 Rows of Solar Panels tilted towards sun
  for (let rz = -35; rz <= 35; rz += 14) {
    for (let rx = -40; rx <= 40; rx += 20) {
      const panelGroup = new THREE.Group();
      panelGroup.position.set(rx, 0, rz);
      solarGroup.add(panelGroup);

      // Steel stand legs
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 6), steelMat);
      leg.position.y = 0.9;
      panelGroup.add(leg);

      // Photovoltaic panel array
      const panel = new THREE.Mesh(new THREE.BoxGeometry(16, 0.1, 4.5), solarPanelMat);
      panel.position.y = 1.6;
      panel.rotation.x = 0.35; // optimal solar angle
      panelGroup.add(panel);
    }
  }

  // Perimeter Fence around Solar Farm
  colliders.push({ type: 'box', x: -150, z: 130, width: 100, depth: 90, name: 'СЕС «Tokmak Solar Energy»' });

  // ================= 9. ЦЕНТРАЛЬНА ПЛОЩА ТА МІСЬКА РАДА ТОКМАКА =================
  // Location: X: 60, Z: 60
  const cityHallGroup = new THREE.Group();
  cityHallGroup.position.set(60, 0, 60);
  scene.add(cityHallGroup);

  // City Hall Building (Мерія Токмака)
  const cityHall = new THREE.Mesh(
    new THREE.BoxGeometry(32, 10.5, 20),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 })
  );
  cityHall.position.y = 5.25;
  cityHall.castShadow = true;
  cityHallGroup.add(cityHall);

  // Front Portico with 4 columns
  for (let cx of [-8, -3, 3, 8]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 9.5, 10), concreteMat);
    col.position.set(cx, 4.75, 11);
    cityHallGroup.add(col);
  }

  // Ukrainian Flag on City Hall Roof
  const chFlagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 6.0, 8), steelMat);
  chFlagPole.position.set(0, 13.5, 0);
  cityHallGroup.add(chFlagPole);

  const chFlagBlue = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 0.04), new THREE.MeshBasicMaterial({ color: 0x2563eb }));
  chFlagBlue.position.set(1.1, 15.5, 0);
  cityHallGroup.add(chFlagBlue);

  const chFlagYellow = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 0.04), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
  chFlagYellow.position.set(1.1, 14.9, 0);
  cityHallGroup.add(chFlagYellow);

  colliders.push({ type: 'box', x: 60, z: 60, width: 34, depth: 24, name: 'Міська рада Токмака' });

  // ================= 10. БЛОКПОСТ ПРИ В'ЇЗДІ =================
  // Location: X: -240, Z: 0
  const checkpointGroup = new THREE.Group();
  checkpointGroup.position.set(-240, 0, 0);
  scene.add(checkpointGroup);

  // Sandbag bunkers on both road sides
  for (let bz of [-8.5, 8.5]) {
    const bunker = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.4, 2.5), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 }));
    bunker.position.set(0, 0.7, bz);
    checkpointGroup.add(bunker);
    colliders.push({ type: 'box', x: -240, z: bz, width: 5.0, depth: 3.0, name: 'Оборонний блокпост Токмака' });
  }

  // Road barrier
  const barrier = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 12, 8), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
  barrier.rotation.z = Math.PI / 2;
  barrier.position.set(0, 1.2, 0);
  checkpointGroup.add(barrier);

  return colliders;
}
