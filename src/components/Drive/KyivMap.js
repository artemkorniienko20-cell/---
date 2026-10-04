import * as THREE from 'three';

/**
 * Builds the realistic 3D Capital City of Ukraine: KYIV (МІСТО КИЇВ):
 * - вул. Хрещатик (Головна вулиця столиці, 6 смуг, каштани, ЦУМ, Київрада)
 * - Майдан Незалежності (Стела Незалежності з Берегинею, фонтани, куполи «Глобусу»)
 * - Готель «Україна» на пагорбі над Майданом
 * - Європейська площа & Український дім
 * - Володимирський узвіз (Спуск до Подолу)
 * - Скляний міст (Пішохідний міст Кличка)
 * - Поштова площа & Річковий вокзал
 * - Набережно-Хрещатицька магістраль вздовж річки Дніпро
 * - Парковий міст на Труханів острів
 * - Золоті Ворота (Історична фортеця Ярослава Мудрого)
 * - Софійська площа & Велична дзвіниця Софійського собору
 * - Бессарабська площа (Бессарабський ринок)
 * - Монумент «Батьківщина-Мати» з Тризубом на пагорбах
 */
export function buildKyivCity(scene) {
  const colliders = [];

  // ================= 1. OPEN WORLD TERRAIN =================
  const terrainGeo = new THREE.PlaneGeometry(2800, 2800);
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.95,
    metalness: 0.05
  });
  const ground = new THREE.Mesh(terrainGeo, terrainMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Road Asphalt & Architectural Materials
  const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x181e2b, roughness: 0.82 });
  const highwayMat = new THREE.MeshStandardMaterial({ color: 0x111622, roughness: 0.75 });
  const whiteMarbleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.25, emissive: 0xca8a04, emissiveIntensity: 0.4 });
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65, roughness: 0.1 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.95 });

  // ================= 2. THE MIGHTY DNIPRO RIVER (ВЕЛИЧНИЙ ДНІПРО) =================
  // Dnipro River running along East Side (X: 110 to 360, Z: -450 to +450)
  const riverGeo = new THREE.PlaneGeometry(250, 1600);
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x0369a1,
    roughness: 0.12,
    metalness: 0.85,
    transparent: true,
    opacity: 0.88
  });
  const river = new THREE.Mesh(riverGeo, riverMat);
  river.rotation.x = -Math.PI / 2;
  river.position.set(235, 0.01, 0);
  scene.add(river);

  // Riverbank Granite Embankment Wall & Safety Railings
  for (let z = -360; z <= 300; z += 60) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 60), concreteMat);
    wall.position.set(110.6, 0.7, z);
    scene.add(wall);
    colliders.push({ type: 'box', x: 110.6, z, width: 1.5, depth: 60, name: 'Гранітний парапет Набережної Дніпра' });
  }

  // Trukhaniv Island (Острів Труханів) on the East side of river (X: 280, Z: -150 to +100)
  const island = new THREE.Mesh(
    new THREE.BoxGeometry(100, 1.2, 280),
    new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.95 })
  );
  island.position.set(285, 0.6, -20);
  island.receiveShadow = true;
  scene.add(island);

  // ================= 3. ВУЛИЦЯ ХРЕЩАТИК (KHRESHCHATYK BOULEVARD) =================
  // 6-Lane Grand Boulevard from European Square (Z: -160) to Bessarabska Square (Z: +180), X: 0
  const khreshchatykLength = 350;
  const khreshchatykRoad = new THREE.Mesh(new THREE.PlaneGeometry(18, khreshchatykLength), asphaltMat);
  khreshchatykRoad.rotation.x = -Math.PI / 2;
  khreshchatykRoad.position.set(0, 0.02, 10);
  khreshchatykRoad.receiveShadow = true;
  scene.add(khreshchatykRoad);
  addRoadCenterLine(scene, 0, 10, khreshchatykLength, false);

  // Left & Right Lane Divider Dashes
  addRoadDashedLane(scene, -4.5, 10, khreshchatykLength);
  addRoadDashedLane(scene, 4.5, 10, khreshchatykLength);

  // Khreshchatyk Wide Sidewalks (6m each side)
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
  for (let xSide of [-12, 12]) {
    const sidewalk = new THREE.Mesh(new THREE.PlaneGeometry(6, khreshchatykLength), sidewalkMat);
    sidewalk.rotation.x = -Math.PI / 2;
    sidewalk.position.set(xSide, 0.03, 10);
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);
  }

  // Kyiv Chestnut Trees (Київські каштани) along both sides of Khreshchatyk
  for (let z = -140; z <= 160; z += 25) {
    // Avoid blocking Maidan plaza (Z: -30 to +30)
    if (Math.abs(z) > 30) {
      addChestnutTree(scene, -13.5, z);
      addChestnutTree(scene, 13.5, z);
    }
  }

  // ================= 4. МАЙДАН НЕЗАЛЕЖНОСТІ (INDEPENDENCE SQUARE) =================
  const maidanGroup = new THREE.Group();
  maidanGroup.position.set(0, 0, 0);
  scene.add(maidanGroup);

  // Circular Granite Plaza on the East side (X: 30, Z: 0)
  const plazaGeo = new THREE.CylinderGeometry(28, 28, 0.2, 32);
  const plazaMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
  const plaza = new THREE.Mesh(plazaGeo, plazaMat);
  plaza.position.set(32, 0.1, 0);
  maidanGroup.add(plaza);

  // --- МОНУМЕНТ НЕЗАЛЕЖНОСТІ (STELLA OF INDEPENDENCE) ---
  const stellaBase = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 6.0, 3.5, 16), whiteMarbleMat);
  stellaBase.position.set(32, 1.75, 0);
  maidanGroup.add(stellaBase);

  // Fluted Classical Marble Column (38m tall)
  const column = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 32, 16), whiteMarbleMat);
  column.position.set(32, 19.5, 0);
  column.castShadow = true;
  maidanGroup.add(column);

  // Corinthian Capital & Globe
  const capital = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 1.6, 2.0, 16), goldMat);
  capital.position.set(32, 36.5, 0);
  maidanGroup.add(capital);

  const globe = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 16), goldMat);
  globe.position.set(32, 38.5, 0);
  maidanGroup.add(globe);

  // Golden Statue of Berehynia (Берегиня з калиновою гілкою)
  const berehynia = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.2, 0.8), goldMat);
  berehynia.position.set(32, 41.5, 0);
  maidanGroup.add(berehynia);

  // Berehynia Golden Wings / Halo & Guelder-rose branch
  const branch = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.25, 8, 16, Math.PI), goldMat);
  branch.rotation.x = Math.PI / 2;
  branch.position.set(32, 43.5, 0);
  maidanGroup.add(branch);

  // Blue & Yellow Spotlights illuminating Stella
  const blueLight = new THREE.PointLight(0x0284c7, 3.5, 45);
  blueLight.position.set(26, 4, 6);
  maidanGroup.add(blueLight);

  const yellowLight = new THREE.PointLight(0xfacc15, 3.5, 45);
  yellowLight.position.set(38, 4, -6);
  maidanGroup.add(yellowLight);

  colliders.push({ type: 'circle', x: 32, z: 0, radius: 6.5, name: 'Стела Монумента Незалежності' });

  // --- СКЛЯНІ КУПОЛИ ТРЦ «ГЛОБУС» (GLOBUS GLASS DOMES) ---
  for (let z of [-18, 18]) {
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(6.0, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      glassMat
    );
    dome.position.set(32, 0.1, z);
    maidanGroup.add(dome);

    const domeRim = new THREE.Mesh(new THREE.TorusGeometry(6.0, 0.25, 8, 32), goldMat);
    domeRim.rotation.x = -Math.PI / 2;
    domeRim.position.set(32, 0.1, z);
    maidanGroup.add(domeRim);

    colliders.push({ type: 'circle', x: 32, z, radius: 6.2, name: 'Скляний купол ТРЦ «Глобус»' });
  }

  // --- КАСКАДНІ ФОНТАНИ МАЙДАНУ (CASCADING FOUNTAINS) ---
  for (let z of [-28, 28]) {
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.0, 0.8, 24), stoneMat);
    pool.position.set(-25, 0.4, z);
    maidanGroup.add(pool);

    const water = new THREE.Mesh(new THREE.CircleGeometry(4.6, 24), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    water.rotation.x = -Math.PI / 2;
    water.position.set(-25, 0.75, z);
    maidanGroup.add(water);

    // Illuminated Center Jet
    const jet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.8, 3.2, 8),
      new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.85 })
    );
    jet.position.set(-25, 2.2, z);
    maidanGroup.add(jet);

    colliders.push({ type: 'circle', x: -25, z, radius: 5.2, name: 'Фонтан на Майдані Незалежності' });
  }

  // --- ГОТЕЛЬ «УКРАЇНА» (HOTEL UKRAINA ON INSTYTUTSKA HILL) ---
  // Stepped monumental building overlooking Maidan (X: 75, Z: 0)
  const hotelBase = new THREE.Mesh(new THREE.BoxGeometry(28, 12, 60), whiteMarbleMat);
  hotelBase.position.set(78, 6.0, 0);
  hotelBase.castShadow = true;
  maidanGroup.add(hotelBase);

  const hotelTower = new THREE.Mesh(new THREE.BoxGeometry(20, 24, 42), whiteMarbleMat);
  hotelTower.position.set(80, 24, 0);
  hotelTower.castShadow = true;
  maidanGroup.add(hotelTower);

  const hotelSpire = new THREE.Mesh(new THREE.ConeGeometry(2.0, 10, 8), goldMat);
  hotelSpire.position.set(80, 41, 0);
  maidanGroup.add(hotelSpire);

  colliders.push({ type: 'box', x: 78, z: 0, width: 30, depth: 64, name: 'Готель «Україна»' });

  // Neon sign on Hotel
  addCitySign(scene, 'ГОТЕЛЬ УКРАЇНА', 67, 36, 0, -Math.PI / 2);
  addCitySign(scene, 'МАЙДАН НЕЗАЛЕЖНОСТІ', 0, 5.0, 0, 0);

  // --- ГОЛОВПОШТАМТ (KYIV CENTRAL POST OFFICE) ---
  // Corner of Khreshchatyk & Maidan (X: -35, Z: -15)
  const postOffice = new THREE.Mesh(new THREE.BoxGeometry(24, 20, 28), whiteMarbleMat);
  postOffice.position.set(-36, 10, -15);
  postOffice.castShadow = true;
  scene.add(postOffice);
  colliders.push({ type: 'box', x: -36, z: -15, width: 26, depth: 30, name: 'Київський Головпоштамт' });
  addCitySign(scene, 'ГОЛОВПОШТАМТ 01001', -23, 8.5, -15, Math.PI / 2);

  // ================= 5. ЄВРОПЕЙСЬКА ПЛОЩА ТА УКРАЇНСЬКИЙ ДІМ =================
  // European Square at North end of Khreshchatyk (Z: -160, X: 0)
  const euroSquareMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const euroSquare = new THREE.Mesh(new THREE.CircleGeometry(26, 32), euroSquareMat);
  euroSquare.rotation.x = -Math.PI / 2;
  euroSquare.position.set(0, 0.03, -160);
  scene.add(euroSquare);

  // «Український дім» (Ukrainian House) at X: 35, Z: -180
  const ukrHouse = new THREE.Mesh(new THREE.CylinderGeometry(18, 20, 16, 24), whiteMarbleMat);
  ukrHouse.position.set(38, 8.0, -185);
  ukrHouse.castShadow = true;
  scene.add(ukrHouse);
  colliders.push({ type: 'circle', x: 38, z: -185, radius: 21, name: 'Український дім (Європейська площа)' });
  addCitySign(scene, 'ЄВРОПЕЙСЬКА ПЛОЩА • УКРАЇНСЬКИЙ ДІМ', 0, 5.0, -160, 0);

  // National Philharmonic (Національна Філармонія) at X: -35, Z: -175
  const philharmonic = new THREE.Mesh(new THREE.BoxGeometry(24, 15, 28), new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.8 }));
  philharmonic.position.set(-35, 7.5, -175);
  scene.add(philharmonic);
  colliders.push({ type: 'box', x: -35, z: -175, width: 26, depth: 30, name: 'Національна Філармонія України' });

  // ================= 6. ВОЛОДИМИРСЬКИЙ УЗВІЗ (VOLODYMYRSKYI DESCENT TO PODIL) =================
  // Road connecting European Square (0, -160) to Poshtova Square (90, -320)
  const volodymyrDescent1 = new THREE.Mesh(new THREE.PlaneGeometry(14, 100), asphaltMat);
  volodymyrDescent1.rotation.x = -Math.PI / 2;
  volodymyrDescent1.rotation.z = -0.4;
  volodymyrDescent1.position.set(22, 0.02, -210);
  scene.add(volodymyrDescent1);

  const volodymyrDescent2 = new THREE.Mesh(new THREE.PlaneGeometry(14, 100), asphaltMat);
  volodymyrDescent2.rotation.x = -Math.PI / 2;
  volodymyrDescent2.rotation.z = -0.55;
  volodymyrDescent2.position.set(65, 0.02, -275);
  scene.add(volodymyrDescent2);

  // Guardrail along Volodymyr descent
  for (let step = 0; step < 5; step++) {
    const zPos = -190 - step * 25;
    const xPos = 12 + step * 14;
    const rail = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 24), concreteMat);
    rail.position.set(xPos - 8, 0.5, zPos);
    scene.add(rail);
    colliders.push({ type: 'box', x: xPos - 8, z: zPos, width: 1.5, depth: 24, name: 'Перила Володимирського узвозу' });
  }

  // ================= 7. СКЛЯНИЙ МІСТ КЛИЧКА (GLASS PEDESTRIAN BRIDGE) =================
  // Curved suspension pedestrian bridge high above Volodymyr descent (Z: -210, from X: -10 to X: 60)
  const glassBridgeGroup = new THREE.Group();
  glassBridgeGroup.position.set(25, 12, -215);
  scene.add(glassBridgeGroup);

  const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(70, 0.8, 6), whiteMarbleMat);
  glassBridgeGroup.add(bridgeDeck);

  // Glass observation floor sections
  const glassFloor = new THREE.Mesh(new THREE.BoxGeometry(22, 0.1, 4.5), glassMat);
  glassFloor.position.y = 0.45;
  glassBridgeGroup.add(glassFloor);

  // Bridge piers supporting the structure
  for (let x of [-25, 25]) {
    const pier = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 12, 16), concreteMat);
    pier.position.set(x, -6, 0);
    glassBridgeGroup.add(pier);
  }

  // Cyan & White LED illumination along the railing
  for (let x = -32; x <= 32; x += 16) {
    const light = new THREE.PointLight(0x38bdf8, 2.0, 15);
    light.position.set(x, 1.5, 0);
    glassBridgeGroup.add(light);
  }
  colliders.push({ type: 'box', x: 25, z: -215, width: 72, depth: 7, name: 'Опори Скляного мосту' });

  // ================= 8. ПОШТОВА ПЛОЩА ТА РІЧКОВИЙ ВОКЗАЛ (POSHTOVA SQ & RIVER PORT) =================
  // Poshtova Square at X: 90, Z: -320
  const poshtovaPlaza = new THREE.Mesh(new THREE.PlaneGeometry(60, 50), euroSquareMat);
  poshtovaPlaza.rotation.x = -Math.PI / 2;
  poshtovaPlaza.position.set(85, 0.02, -325);
  scene.add(poshtovaPlaza);

  // Historic River Port Building (Річковий вокзал з вежею) at X: 110, Z: -350
  const portBase = new THREE.Mesh(new THREE.BoxGeometry(32, 10, 42), whiteMarbleMat);
  portBase.position.set(115, 5.0, -350);
  portBase.castShadow = true;
  scene.add(portBase);

  const portTower = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.5, 18, 16), whiteMarbleMat);
  portTower.position.set(115, 19, -350);
  scene.add(portTower);

  const portSpire = new THREE.Mesh(new THREE.ConeGeometry(0.8, 12, 8), goldMat);
  portSpire.position.set(115, 34, -350);
  scene.add(portSpire);

  colliders.push({ type: 'box', x: 115, z: -350, width: 34, depth: 44, name: 'Київський Річковий вокзал' });
  addCitySign(scene, 'ПОШТОВА ПЛОЩА • РІЧКОВИЙ ВОКЗАЛ', 85, 4.5, -305, 0);

  // River cruise passenger ship docked at Poshtova pier
  const ship = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 36), whiteMarbleMat);
  ship.position.set(145, 2.5, -340);
  scene.add(ship);
  const shipDeck = new THREE.Mesh(new THREE.BoxGeometry(7, 3.5, 22), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
  shipDeck.position.set(145, 6.5, -340);
  scene.add(shipDeck);

  // ================= 9. НАБЕРЕЖНО-ХРЕЩАТИЦЬКА МАГІСТРАЛЬ (DNIPRO HIGHWAY) =================
  // 4-Lane High-speed Highway along Dnipro Embankment (X: 100, Z: -380 to +300, length: 680)
  const highwayLength = 680;
  const highwayRoad = new THREE.Mesh(new THREE.PlaneGeometry(16, highwayLength), highwayMat);
  highwayRoad.rotation.x = -Math.PI / 2;
  highwayRoad.position.set(100, 0.02, -40);
  highwayRoad.receiveShadow = true;
  scene.add(highwayRoad);
  addRoadCenterLine(scene, 100, -40, highwayLength, false);
  addRoadDashedLane(scene, 96, -40, highwayLength);
  addRoadDashedLane(scene, 104, -40, highwayLength);

  // Link Road between Poshtova Square and Highway
  const poshtovaLink = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), asphaltMat);
  poshtovaLink.rotation.x = -Math.PI / 2;
  poshtovaLink.position.set(90, 0.02, -310);
  scene.add(poshtovaLink);

  // ================= 10. ПАРКОВИЙ ПІШОХІДНИЙ МІСТ НА ТРУХАНІВ ОСТРІВ =================
  // Suspension bridge spanning Dnipro River (Z: -20, from X: 110 to X: 240)
  const parkBridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(130, 0.6, 6), concreteMat);
  parkBridgeDeck.position.set(175, 7.5, -20);
  scene.add(parkBridgeDeck);

  // Pylons (Опори мосту)
  for (let x of [135, 215]) {
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(2.5, 24, 8), whiteMarbleMat);
    pylon.position.set(x, 12, -20);
    scene.add(pylon);
  }

  // Steel cables (Ванти)
  const cableMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  for (let x = 115; x <= 235; x += 15) {
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 12, 6), cableMat);
    cable.position.set(x, 12, -20);
    scene.add(cable);
  }
  colliders.push({ type: 'box', x: 135, z: -20, width: 3.5, depth: 9, name: 'Опора Паркового мосту на Труханів' });
  colliders.push({ type: 'box', x: 215, z: -20, width: 3.5, depth: 9, name: 'Опора Паркового мосту на Труханів' });

  // ================= 11. ЗОЛОТІ ВОРОТА (GOLDEN GATE XI CENTURY) =================
  // Historic Fortress Gate of Kyivan Rus (X: -90, Z: 40)
  const gateGroup = new THREE.Group();
  gateGroup.position.set(-90, 0, 40);
  scene.add(gateGroup);

  // Red Brick & Stone Wall Base
  const gateStone = new THREE.Mesh(new THREE.BoxGeometry(18, 12, 14), stoneMat);
  gateStone.position.y = 6.0;
  gateStone.castShadow = true;
  gateGroup.add(gateStone);

  // Timber Combat Tiers (Дерев'яні бойові кліті)
  const timberTier = new THREE.Mesh(new THREE.BoxGeometry(14, 6, 12), woodMat);
  timberTier.position.y = 15;
  gateGroup.add(timberTier);

  // Church of the Annunciation on top (Церква Благовіщення над брамою)
  const churchWall = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 8), whiteMarbleMat);
  churchWall.position.y = 20.5;
  gateGroup.add(churchWall);

  const churchDome = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 16), goldMat);
  churchDome.position.y = 24.5;
  gateGroup.add(churchDome);

  const cross = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.8, 0.8), goldMat);
  cross.position.y = 27;
  gateGroup.add(cross);

  // Bronze Monument to Yaroslav the Wise (Ярослав Мудрий з макетом Софії)
  const yaroslavBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.0, 2.4), stoneMat);
  yaroslavBase.position.set(0, 1.0, 11);
  gateGroup.add(yaroslavBase);

  const yaroslavStatue = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 1.0, 3.5, 12),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 })
  );
  yaroslavStatue.position.set(0, 3.75, 11);
  gateGroup.add(yaroslavStatue);

  colliders.push({ type: 'box', x: -90, z: 40, width: 20, depth: 16, name: 'Золоті Ворота (XI століття)' });
  colliders.push({ type: 'circle', x: -90, z: 51, radius: 2.2, name: 'Пам\'ятник Ярославу Мудрому' });
  addCitySign(scene, 'ЗОЛОТІ ВОРОТА • ЗАСНОВАНО 1037 Р.', -90, 4.0, 28, 0);

  // Road leading from Khreshchatyk (Z: 40) to Golden Gate (X: -90, Z: 40)
  const bhmelnytskySt = new THREE.Mesh(new THREE.PlaneGeometry(90, 14), asphaltMat);
  bhmelnytskySt.rotation.x = -Math.PI / 2;
  bhmelnytskySt.position.set(-45, 0.02, 40);
  bhmelnytskySt.receiveShadow = true;
  scene.add(bhmelnytskySt);
  addRoadCenterLine(scene, -45, 40, 90, true);

  // ================= 12. СОФІЙСЬКА ПЛОЩА ТА ДЗВІНИЦЯ СОФІЇ КИЇВСЬКОЇ =================
  // Saint Sophia Square at X: -90, Z: -60
  const sophiaPlaza = new THREE.Mesh(new THREE.CircleGeometry(32, 32), euroSquareMat);
  sophiaPlaza.rotation.x = -Math.PI / 2;
  sophiaPlaza.position.set(-90, 0.02, -60);
  scene.add(sophiaPlaza);

  // 4-Tier Ukrainian Baroque Bell Tower (Дзвіниця Софійського собору, 76m tall)
  const towerGroup = new THREE.Group();
  towerGroup.position.set(-110, 0, -60);
  scene.add(towerGroup);

  const t1 = new THREE.Mesh(new THREE.BoxGeometry(14, 16, 14), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 }));
  t1.position.y = 8;
  t1.castShadow = true;
  towerGroup.add(t1);

  const t2 = new THREE.Mesh(new THREE.BoxGeometry(11, 14, 11), whiteMarbleMat);
  t2.position.y = 23;
  towerGroup.add(t2);

  const t3 = new THREE.Mesh(new THREE.BoxGeometry(8, 12, 8), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 }));
  t3.position.y = 36;
  towerGroup.add(t3);

  // Magnificent Pear-shaped Golden Baroque Dome
  const tDome = new THREE.Mesh(new THREE.SphereGeometry(4.2, 24, 24), goldMat);
  tDome.scale.set(1.0, 1.4, 1.0);
  tDome.position.y = 46;
  towerGroup.add(tDome);

  const tSpire = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 8, 8), goldMat);
  tSpire.position.y = 54;
  towerGroup.add(tSpire);

  colliders.push({ type: 'box', x: -110, z: -60, width: 16, depth: 16, name: 'Дзвіниця Софії Київської' });

  // Equestrian Monument to Bohdan Khmelnytsky (Пам'ятник Богдану Хмельницькому)
  const khmelBase = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.8, 4.0, 12), stoneMat);
  khmelBase.position.set(-80, 2.0, -60);
  scene.add(khmelBase);

  const khmelHorse = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 4.2), new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.6 }));
  khmelHorse.position.set(-80, 5.2, -60);
  scene.add(khmelHorse);

  const mace = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.8, 0.2), goldMat);
  mace.rotation.x = Math.PI / 4;
  mace.position.set(-80, 6.8, -58.5);
  scene.add(mace);

  colliders.push({ type: 'circle', x: -80, z: -60, radius: 4.2, name: 'Пам\'ятник Богдану Хмельницькому' });
  addCitySign(scene, 'СОФІЙСЬКА ПЛОЩА • ДЗВІНИЦЯ СОФІЇ', -90, 4.0, -78, 0);

  // Street connecting Khreshchatyk / Maidan to Sophia Square
  const mykhailivskaSt = new THREE.Mesh(new THREE.PlaneGeometry(90, 12), asphaltMat);
  mykhailivskaSt.rotation.x = -Math.PI / 2;
  mykhailivskaSt.position.set(-45, 0.02, -60);
  mykhailivskaSt.receiveShadow = true;
  scene.add(mykhailivskaSt);
  addRoadCenterLine(scene, -45, -60, 90, true);

  // ================= 13. БЕССАРАБСЬКА ПЛОЩА ТА БЕССАРАБСЬКИЙ РИНОК =================
  // South end of Khreshchatyk (Z: +180, X: 0)
  const marketBase = new THREE.Mesh(new THREE.BoxGeometry(36, 12, 36), new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.85 }));
  marketBase.position.set(0, 6.0, 195);
  marketBase.castShadow = true;
  scene.add(marketBase);

  // Arched Glass Dome on top of Market Hall
  const marketDome = new THREE.Mesh(new THREE.SphereGeometry(14, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), glassMat);
  marketDome.position.set(0, 12, 195);
  scene.add(marketDome);

  colliders.push({ type: 'box', x: 0, z: 195, width: 38, depth: 38, name: 'Бессарабський ринок (1912)' });
  addCitySign(scene, 'БЕССАРАБСЬКИЙ РИНОК', 0, 4.5, 175, Math.PI);

  // ================= 14. МОНУМЕНТ «БАТЬКІВЩИНА-МАТИ» З ТРИЗУБОМ (PECHERSK SKYLINE) =================
  // Monumental Statue on Pechersk Hills (X: 85, Z: 260)
  const motherGroup = new THREE.Group();
  motherGroup.position.set(85, 0, 260);
  scene.add(motherGroup);

  // Conical Hill Pedestal
  const hillPedestal = new THREE.Mesh(new THREE.CylinderGeometry(8, 14, 18, 16), stoneMat);
  hillPedestal.position.y = 9;
  motherGroup.add(hillPedestal);

  // Stainless Steel Figure
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.25 });
  const motherFigure = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.8, 32, 12), steelMat);
  motherFigure.position.y = 34;
  motherGroup.add(motherFigure);

  // Head
  const motherHead = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 12), steelMat);
  motherHead.position.y = 51;
  motherGroup.add(motherHead);

  // Right Hand with Sword (16m sword raised to the sky)
  const sword = new THREE.Mesh(new THREE.BoxGeometry(0.6, 20, 1.2), steelMat);
  sword.position.set(-6, 56, 0);
  motherGroup.add(sword);

  // Left Hand with Shield bearing the Ukrainian Trident (Тризуб)
  const shield = new THREE.Mesh(new THREE.BoxGeometry(1.2, 12, 8), steelMat);
  shield.position.set(7, 44, 2);
  motherGroup.add(shield);

  // Golden Tryzub (Тризуб) on the Shield
  const tryzub = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.0, 3.5), goldMat);
  tryzub.position.set(7.8, 44, 2);
  motherGroup.add(tryzub);

  // Blue & Yellow Illumination
  const mBlue = new THREE.PointLight(0x0284c7, 4.0, 50);
  mBlue.position.set(-8, 30, 8);
  motherGroup.add(mBlue);

  const mYellow = new THREE.PointLight(0xfacc15, 4.0, 50);
  mYellow.position.set(8, 30, 8);
  motherGroup.add(mYellow);

  colliders.push({ type: 'circle', x: 85, z: 260, radius: 14, name: 'Монумент «Батьківщина-Мати»' });
  addCitySign(scene, 'МОНУМЕНТ «БАТЬКІВЩИНА-МАТИ» • ТРИЗУБ', 85, 5.0, 240, 0);

  // ================= 15. КИЇВСЬКА АРХІТЕКТУРА ВЗДОВЖ ХРЕЩАТИКА =================
  const facadeColors = [0xfef08a, 0xfde047, 0xf1f5f9, 0xe2e8f0, 0xd4d4d8, 0x94a3b8];

  // Buildings along East side of Khreshchatyk (X: 25)
  for (let i = 0; i < 6; i++) {
    const zPos = -135 + i * 55;
    // Don't obstruct Maidan plaza (Z: -35 to +35) or Housing (Z: -45)
    if (Math.abs(zPos) > 35 && Math.abs(zPos - (-45)) > 20) {
      const bHeight = 18 + (i % 3) * 6;
      const bWidth = 14;
      const bDepth = 36;
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(bWidth, bHeight, bDepth),
        new THREE.MeshStandardMaterial({ color: facadeColors[i % facadeColors.length], roughness: 0.7 })
      );
      building.position.set(25, bHeight / 2, zPos);
      building.castShadow = true;
      scene.add(building);
      colliders.push({ type: 'box', x: 25, z: zPos, width: bWidth + 2, depth: bDepth + 2, name: 'Будівля на вул. Хрещатик' });
    }
  }

  // Buildings along West side of Khreshchatyk (ЦУМ, Київрада, Пасаж) at X: -25
  // 1. ЦУМ Київ (Central Department Store) at X: -25, Z: 55
  const tsum = new THREE.Mesh(new THREE.BoxGeometry(16, 26, 38), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 }));
  tsum.position.set(-25, 13, 55);
  tsum.castShadow = true;
  scene.add(tsum);
  colliders.push({ type: 'box', x: -25, z: 55, width: 18, depth: 40, name: 'ЦУМ Київ (вул. Хрещатик, 38)' });
  addCitySign(scene, 'ЦУМ КИЇВ (1939)', -15, 18, 55, Math.PI / 2);

  // 2. Київрада / КМДА (Kyiv City State Administration) at X: -25, Z: 105
  const kmda = new THREE.Mesh(new THREE.BoxGeometry(16, 22, 38), whiteMarbleMat);
  kmda.position.set(-25, 11, 105);
  kmda.castShadow = true;
  scene.add(kmda);
  colliders.push({ type: 'box', x: -25, z: 105, width: 18, depth: 40, name: 'Київська міська рада (КМДА)' });
  addCitySign(scene, 'КИЇВСЬКА МІСЬКА РАДА (ХРЕЩАТИК 36)', -15, 16, 105, Math.PI / 2);

  // 3. Classical Facades North of Maidan (X: -25, Z: -105)
  const passage = new THREE.Mesh(new THREE.BoxGeometry(16, 20, 36), whiteMarbleMat);
  passage.position.set(-25, 10, -105);
  scene.add(passage);
  colliders.push({ type: 'box', x: -25, z: -105, width: 18, depth: 38, name: 'Історичний Пасаж на Хрещатику' });

  // ================= 16. СВІТЛОФОРИ ТА ПІШОХІДНІ ЗЕБРИ =================
  addTrafficLightPost(scene, -10, -150, 0); // Хрещатик / Європейська
  addTrafficLightPost(scene, 10, -145, Math.PI);
  addTrafficLightPost(scene, -10, -20, 0);  // Хрещатик / Майдан Північ
  addTrafficLightPost(scene, 10, -15, Math.PI);
  addTrafficLightPost(scene, -10, 20, 0);   // Хрещатик / Майдан Південь
  addTrafficLightPost(scene, 10, 25, Math.PI);
  addTrafficLightPost(scene, -10, 35, 0);   // Хрещатик / Б. Хмельницького
  addTrafficLightPost(scene, 10, 45, Math.PI);
  addTrafficLightPost(scene, -10, 165, 0);  // Хрещатик / Бессарабка
  addTrafficLightPost(scene, 10, 175, Math.PI);

  addZebraCrossing(scene, 0, -148, 18, true);
  addZebraCrossing(scene, 0, -18, 18, true);
  addZebraCrossing(scene, 0, 22, 18, true);
  addZebraCrossing(scene, 0, 170, 18, true);

  // ================= 17. ДОРОЖНІ ЗНАКИ СТОЛИЦІ =================
  addCitySign(scene, 'ВУЛИЦЯ ХРЕЩАТИК', 0, 5.5, -120, 0);
  addCitySign(scene, 'ВУЛИЦЯ ХРЕЩАТИК', 0, 5.5, 130, Math.PI);
  addCitySign(scene, 'НАБЕРЕЖНА ДНІПРА (120 КМ/ГОД)', 100, 5.0, -180, 0);
  addCitySign(scene, 'НАБЕРЕЖНА ДНІПРА (120 КМ/ГОД)', 100, 5.0, 120, Math.PI);

  return colliders;
}

// Helper: Chestnut Tree (Київський каштан)
function addChestnutTree(scene, x, z) {
  const treeGroup = new THREE.Group();
  treeGroup.position.set(x, 0, z);
  scene.add(treeGroup);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.45, 4.0, 8),
    new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 })
  );
  trunk.position.y = 2.0;
  treeGroup.add(trunk);

  // Lush chestnut crown
  const crown = new THREE.Mesh(
    new THREE.DodecahedronGeometry(2.4, 1),
    new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 })
  );
  crown.position.y = 5.2;
  crown.scale.set(1.2, 1.1, 1.2);
  treeGroup.add(crown);

  // Blooming chestnut candle (Квітуча свічка каштана)
  const candle = new THREE.Mesh(
    new THREE.ConeGeometry(0.25, 0.9, 6),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  candle.position.set(0.6, 6.8, 0.6);
  treeGroup.add(candle);
}

// Helper: Road center dashed lines
function addRoadCenterLine(scene, x, z, length, isHorizontal = false) {
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  const count = Math.floor(length / 6);
  for (let i = 0; i < count; i++) {
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

// Helper: Lane separator dashed line
function addRoadDashedLane(scene, x, z, length) {
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
  const count = Math.floor(length / 8);
  for (let i = 0; i < count; i++) {
    const offset = -length / 2 + i * 8 + 4;
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 2.0), lineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(x, 0.024, z + offset);
    scene.add(dash);
  }
}

// Helper: Zebra Crossing
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

// Helper: Traffic Light Post
function addTrafficLightPost(scene, x, z, rotY = 0) {
  const postGroup = new THREE.Group();
  postGroup.position.set(x, 0, z);
  postGroup.rotation.y = rotY;
  scene.add(postGroup);

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 4.5, 12),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
  );
  pole.position.y = 2.25;
  postGroup.add(pole);

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 1.2, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
  );
  box.position.set(0, 3.8, 0);
  postGroup.add(box);

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
  ctx.font = '900 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 256, 75);

  const texture = new THREE.CanvasTexture(canvas);
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 1.3),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
  );
  signMesh.position.set(x, y, z);
  signMesh.rotation.y = rotY;
  scene.add(signMesh);
}
