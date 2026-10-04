import * as THREE from 'three';

/**
 * Builds the realistic 3D City of Zaporizhzhia (Запоріжжя):
 * - ДніпроГЕС (Дніпровська Гідроелектростанція з проїжджою частиною по греблі)
 * - Острів Хортиця та Історико-культурний комплекс «Запорозька Січ»
 * - Мости Преображенського (Двоярусні аркові мости над Дніпром)
 * - Проспект Соборний (Один з найдовших проспектів Європи, 6 смуг для 300+ км/год)
 * - Площа Фестивальна (Центральний майдан міста з фонтаном та готелем)
 * - Бульвар Шевченка та Годинник Закоханих
 * - Велична річка Дніпро з гранітними скелями порогів
 */
export function buildZaporizhzhiaCity(scene) {
  const colliders = [];

  // ================= 1. OPEN WORLD TERRAIN =================
  const terrainGeo = new THREE.PlaneGeometry(2600, 2600);
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.95,
    metalness: 0.05
  });
  const ground = new THREE.Mesh(terrainGeo, terrainMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Materials
  const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x181e2b, roughness: 0.82 });
  const highwayMat = new THREE.MeshStandardMaterial({ color: 0x0f141e, roughness: 0.75 });
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8, metalness: 0.2 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const graniteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95 });

  // ================= 2. THE MIGHTY DNIPRO RIVER (РІЧКА ДНІПРО) =================
  // River Channel (X: -140 to +30, Z: -600 to +600)
  const riverGeo = new THREE.PlaneGeometry(280, 1600);
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.12,
    metalness: 0.85,
    transparent: true,
    opacity: 0.88
  });
  const river = new THREE.Mesh(riverGeo, riverMat);
  river.rotation.x = -Math.PI / 2;
  river.position.set(-60, 0.01, 0);
  scene.add(river);

  // River Banks Granite Rocks (Гранітні скелі порогів)
  for (let z = -250; z <= 250; z += 50) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(6 + (Math.abs(z) % 4) * 1.5, 1),
      graniteMat
    );
    rock.position.set(-165 + (Math.sin(z) * 6), 1.5, z);
    rock.scale.set(1.4, 0.7, 1.2);
    scene.add(rock);
    colliders.push({ type: 'circle', x: -165, z, radius: 6.5, name: 'Гранітні скелі Дніпра' });
  }

  // ================= 3. ДНІПРОГЕС (ДНІПРОВСЬКА ГЕС) =================
  // Monumental Hydroelectric Dam spanning Dnipro (Z: -20, from X: -130 to +25)
  const damGroup = new THREE.Group();
  damGroup.position.set(-52, 0, -20);
  scene.add(damGroup);

  // Dam Concrete Foundation & Curved Spillways
  const damBase = new THREE.Mesh(new THREE.BoxGeometry(165, 8.0, 24), concreteMat);
  damBase.position.set(0, 4.0, 0);
  damBase.castShadow = true;
  damGroup.add(damBase);
  // Dam Safety Guardrails (North & South of the 14m wide highway)
  colliders.push({ type: 'box', x: -52, z: -27.5, width: 165, depth: 1.0, name: 'Північні перила ДніпроГЕС' });
  colliders.push({ type: 'box', x: -52, z: -12.5, width: 165, depth: 1.0, name: 'Південні перила ДніпроГЕС' });

  // 16 Spillway Piers & Sluice Gates (Водозливні бички та затвори)
  for (let i = -7; i <= 7; i++) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(3.5, 7.5, 28), concreteMat);
    pier.position.set(i * 10, 4.5, 0);
    damGroup.add(pier);

    // Churning turbulent water / foam below dam (Піна водозливу ГЕС)
    const foam = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 0.5, 12),
      new THREE.MeshBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.9 })
    );
    foam.position.set(i * 10, 0.4, 16);
    damGroup.add(foam);
  }

  // Roadway running right on top of DniproHES Dam (4-Lane Highway)
  const damRoad = new THREE.Mesh(new THREE.BoxGeometry(165, 0.4, 14), asphaltMat);
  damRoad.position.set(0, 8.2, 0);
  damGroup.add(damRoad);

  // Approach ramps to the dam
  const rampWest = new THREE.Mesh(new THREE.BoxGeometry(40, 0.4, 14), asphaltMat);
  rampWest.rotation.z = 0.2;
  rampWest.position.set(-95, 4.1, 0);
  damGroup.add(rampWest);

  const rampEast = new THREE.Mesh(new THREE.BoxGeometry(40, 0.4, 14), asphaltMat);
  rampEast.rotation.z = -0.2;
  rampEast.position.set(95, 4.1, 0);
  damGroup.add(rampEast);

  // Overhead Illumination Gantry Arches with Ukrainian Blue & Yellow LED
  const archMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.2 });
  const yellowArchMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 1.2 });

  for (let x = -70; x <= 70; x += 20) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.2, 16, 24, Math.PI), x % 40 === 0 ? yellowArchMat : archMat);
    arch.rotation.y = Math.PI / 2;
    arch.position.set(x, 8.4, 0);
    damGroup.add(arch);
  }

  // Safety railings along dam road
  for (let z of [-6.8, 6.8]) {
    const damRail = new THREE.Mesh(new THREE.BoxGeometry(165, 1.1, 0.3), concreteMat);
    damRail.position.set(0, 9.0, z);
    damGroup.add(damRail);
  }

  // Powerhouse (Машинний зал ДніпроГЕС-1) on Right Bank
  const powerhouse = new THREE.Mesh(
    new THREE.BoxGeometry(32, 14, 45),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 })
  );
  powerhouse.position.set(-145, 7.0, -20);
  powerhouse.castShadow = true;
  scene.add(powerhouse);
  colliders.push({ type: 'box', x: -145, z: -20, width: 34, depth: 47, name: 'Машинний зал ДніпроГЕС-1' });

  // High-Voltage Electrical Transformers & Pylons (Опори ЛЕП)
  for (let i = 0; i < 3; i++) {
    const pylon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 1.4, 22, 4),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
    );
    pylon.position.set(-170 - i * 15, 11, -20 + i * 12);
    scene.add(pylon);
  }

  addCitySign(scene, 'ДНІПРОГЕС • ЗАСНОВАНО 1932', -52, 10.5, -9, 0);

  // ================= 4. KHORTYTSIA ISLAND & SICH (ОСТРІВ ХОРТИЦЯ • СІЧ) =================
  // Elevated Island Landmass (X: -140 to -30, Z: 50 to 220)
  const islandGeo = new THREE.BoxGeometry(120, 1.8, 180);
  const islandMat = new THREE.MeshStandardMaterial({ color: 0x1e3a1f, roughness: 0.95 });
  const island = new THREE.Mesh(islandGeo, islandMat);
  island.position.set(-85, 0.9, 135);
  island.receiveShadow = true;
  scene.add(island);

  // --- Historic Cossack Fortress: «ЗАПОРОЗЬКА СІЧ» (X: -85, Z: 100) ---
  const sichGroup = new THREE.Group();
  sichGroup.position.set(-85, 1.8, 100);
  scene.add(sichGroup);

  // Timber Log Palisade Wall (Частокіл)
  const palisadeMat = new THREE.MeshStandardMaterial({ color: 0x543210, roughness: 0.9 });
  for (let i = 0; i < 4; i++) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(i % 2 === 0 ? 36 : 2.0, 3.5, i % 2 === 0 ? 2.0 : 36), palisadeMat);
    wall.position.set(i === 1 ? -18 : i === 3 ? 18 : 0, 1.75, i === 0 ? -18 : i === 2 ? 18 : 0);
    sichGroup.add(wall);
  }
  colliders.push({ type: 'box', x: -85, z: 100, width: 38, depth: 38, name: 'Фортеця «Запорозька Січ»' });

  // Main Wooden Entrance Gate Watchtower (В'їзна вежа Січі з брамою)
  const gateTower = new THREE.Mesh(new THREE.BoxGeometry(6, 9, 6), woodMat);
  gateTower.position.set(0, 4.5, -18);
  sichGroup.add(gateTower);

  const gateRoof = new THREE.Mesh(new THREE.ConeGeometry(4.8, 4.0, 4), new THREE.MeshStandardMaterial({ color: 0x3e2723 }));
  gateRoof.rotation.y = Math.PI / 4;
  gateRoof.position.set(0, 11, -18);
  sichGroup.add(gateRoof);

  // Bell Tower (Дзвіниця Січі)
  const bellTower = new THREE.Mesh(new THREE.BoxGeometry(5, 12, 5), woodMat);
  bellTower.position.set(-12, 6.0, -12);
  sichGroup.add(bellTower);

  const bellRoof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 4.5, 4), new THREE.MeshStandardMaterial({ color: 0x1b5e20 }));
  bellRoof.rotation.y = Math.PI / 4;
  bellRoof.position.set(-12, 14, -12);
  sichGroup.add(bellRoof);

  // Wooden Cossack Church of Intercession (Церква Покрови Пресвятої Богородиці)
  const churchBase = new THREE.Mesh(new THREE.BoxGeometry(10, 8, 14), woodMat);
  churchBase.position.set(0, 4.0, 0);
  sichGroup.add(churchBase);

  // Three Wooden Domes with Golden Crosses
  for (let z of [-4, 0, 4]) {
    const domeTier = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.0, 4, 8), woodMat);
    domeTier.position.set(0, 9.8, z);
    sichGroup.add(domeTier);

    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 16), new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.5 }));
    dome.position.set(0, 12.2, z);
    sichGroup.add(dome);

    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.6), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9 }));
    cross.position.set(0, 14.0, z);
    sichGroup.add(cross);
  }

  // Cossack Barracks (Курені)
  for (let x of [-10, 10]) {
    const kuren = new THREE.Mesh(new THREE.BoxGeometry(7, 3.5, 12), woodMat);
    kuren.position.set(x, 1.75, 4);
    sichGroup.add(kuren);
  }

  // Historic Bronze Cossack Cannons (Козацькі гармати)
  for (let x of [-6, 6]) {
    const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 2.2, 16), new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 }));
    cannon.rotation.x = Math.PI / 2.3;
    cannon.position.set(x, 1.2, -19.5);
    sichGroup.add(cannon);
  }

  addCitySign(scene, 'ЗАПОРОЗЬКА СІЧ • ОСТРІВ ХОРТИЦЯ', -85, 3.8, 80, 0);

  // Road on Khortytsia Island
  const khortytsiaRoad = new THREE.Mesh(new THREE.PlaneGeometry(12, 140), asphaltMat);
  khortytsiaRoad.rotation.x = -Math.PI / 2;
  khortytsiaRoad.position.set(-85, 1.82, 110);
  scene.add(khortytsiaRoad);
  addRoadCenterLine(scene, -85, 110, 140, false);

  // ================= 5. МОСТИ ПРЕОБРАЖЕНСЬКОГО (PREOBRAZHENSKY ARCH BRIDGES) =================
  // Two-Tier Concrete Arch Bridge connecting City (X: 10) with Khortytsia (X: -85) at Z: 50
  const bridgeRoad = new THREE.Mesh(new THREE.BoxGeometry(95, 0.6, 14), asphaltMat);
  bridgeRoad.position.set(-37.5, 4.5, 50);
  scene.add(bridgeRoad);

  // Concrete Arch Spans underneath Bridge
  for (let x of [-65, -37.5, -10]) {
    const archUnder = new THREE.Mesh(
      new THREE.TorusGeometry(12, 0.6, 16, 24, Math.PI),
      concreteMat
    );
    archUnder.position.set(x, 2.2, 50);
    scene.add(archUnder);
  }

  // Upper Truss Arches
  for (let x of [-65, -37.5, -10]) {
    for (let z of [43.5, 56.5]) {
      const archOver = new THREE.Mesh(
        new THREE.TorusGeometry(12, 0.4, 16, 24, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85 })
      );
      archOver.position.set(x, 4.5, z);
      scene.add(archOver);
    }
  }

  // Bridge safety barriers
  for (let z of [43.2, 56.8]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(95, 1.0, 0.3), concreteMat);
    rail.position.set(-37.5, 5.2, z);
    scene.add(rail);
    colliders.push({ type: 'box', x: -37.5, z, width: 95, depth: 0.5, name: 'Перила Мосту Преображенського' });
  }

  addCitySign(scene, 'МОСТИ ПРЕОБРАЖЕНСЬКОГО', -37.5, 7.2, 43, 0);

  // ================= 6. ПРОСПЕКТ СОБОРНИЙ (SOBORNY AVENUE - 6 LANES) =================
  // Main City Artery: One of Europe's longest avenues (X: 120, Z: -350 to +350, Width: 22m)
  const sobornyAvenue = new THREE.Mesh(new THREE.PlaneGeometry(22, 700), highwayMat);
  sobornyAvenue.rotation.x = -Math.PI / 2;
  sobornyAvenue.position.set(120, 0.02, 0);
  sobornyAvenue.receiveShadow = true;
  scene.add(sobornyAvenue);

  // Central Green Divider / Median with Streetlights
  const medianGeo = new THREE.BoxGeometry(2.0, 0.25, 700);
  const medianMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.9 });
  const median = new THREE.Mesh(medianGeo, medianMat);
  median.position.set(120, 0.12, 0);
  scene.add(median);
  colliders.push({ type: 'box', x: 120, z: 0, width: 2.2, depth: 700, name: 'Розділювач Проспекту Соборного' });

  // Lane marking lines for 6 lanes
  for (let laneOffset of [-6.0, -3.0, 3.0, 6.0]) {
    addRoadCenterLine(scene, 120 + laneOffset, 0, 700, false);
  }

  // Modern LED Streetlights along Soborny Avenue
  for (let z = -320; z <= 320; z += 40) {
    const lampPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.14, 8, 12),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85 })
    );
    lampPost.position.set(120, 4.0, z);
    scene.add(lampPost);

    const luminaire = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.2, 0.4),
      new THREE.MeshBasicMaterial({ color: 0xe0f2fe })
    );
    luminaire.position.set(120, 8.0, z);
    scene.add(luminaire);
  }

  // ================= 7. ПЛОЩА ФЕСТИВАЛЬНА (FESTIVALSKA SQUARE) =================
  // Main Central Square at X: 120, Z: -100
  const squareGroup = new THREE.Group();
  squareGroup.position.set(155, 0, -100);
  scene.add(squareGroup);

  // Paved Plaza Area
  const plaza = new THREE.Mesh(
    new THREE.BoxGeometry(50, 0.15, 60),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 })
  );
  plaza.position.y = 0.08;
  squareGroup.add(plaza);

  // Multi-Jet Light Fountain on Festivalska
  const fountainRing = new THREE.Mesh(
    new THREE.CylinderGeometry(9, 9.5, 0.6, 32),
    concreteMat
  );
  fountainRing.position.y = 0.4;
  squareGroup.add(fountainRing);

  for (let a = 0; a < 8; a++) {
    const jet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.3, 4.5, 12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
    );
    jet.position.set(Math.sin((a * Math.PI) / 4) * 5, 2.5, Math.cos((a * Math.PI) / 4) * 5);
    squareGroup.add(jet);
  }

  // Hotel "Zaporizhzhia" (Багатоповерховий готель «Запоріжжя»)
  const hotel = new THREE.Mesh(
    new THREE.BoxGeometry(22, 28, 40),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.3 })
  );
  hotel.position.set(28, 14, 0);
  hotel.castShadow = true;
  squareGroup.add(hotel);
  colliders.push({ type: 'box', x: 183, z: -100, width: 24, depth: 42, name: 'Готель «Запоріжжя»' });

  // Neon sign atop Hotel
  const hotelSign = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 2.2, 18),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  hotelSign.position.set(28, 29, 0);
  squareGroup.add(hotelSign);

  addCitySign(scene, 'ПЛОЩА ФЕСТИВАЛЬНА', 135, 1.8, -100, -Math.PI / 2);

  // ================= 8. БУЛЬВАР ШЕВЧЕНКА & ГОДИННИК ЗАКОХАНИХ =================
  // Pedestrian Boulevard branching west from Soborny to Dnipro (Z: 40, from X: 120 to X: 30)
  const shevchenkoBlvd = new THREE.Mesh(new THREE.PlaneGeometry(90, 16), asphaltMat);
  shevchenkoBlvd.rotation.x = -Math.PI / 2;
  shevchenkoBlvd.position.set(75, 0.02, 40);
  scene.add(shevchenkoBlvd);
  addRoadCenterLine(scene, 75, 40, 90, true);

  // Lovers' Clock Tower (Годинник Закоханих) at X: 85, Z: 40
  const clockGroup = new THREE.Group();
  clockGroup.position.set(85, 0, 40);
  scene.add(clockGroup);

  const clockBase = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 1.0, 16), concreteMat);
  clockBase.position.y = 0.5;
  clockGroup.add(clockBase);

  const clockPillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 6.5, 1.2), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 }));
  clockPillar.position.y = 4.0;
  clockGroup.add(clockPillar);

  // 4 Working Clock Dials
  for (let rot of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const dial = new THREE.Mesh(
      new THREE.CircleGeometry(0.8, 24),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfef08a, emissiveIntensity: 0.6 })
    );
    dial.rotation.y = rot;
    dial.position.set(Math.sin(rot) * 0.65, 6.2, Math.cos(rot) * 0.65);
    clockGroup.add(dial);
  }

  // Golden Musical Bells on Top
  const bells = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.5, 8), new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9 }));
  bells.position.y = 8.0;
  clockGroup.add(bells);

  colliders.push({ type: 'circle', x: 85, z: 40, radius: 2.2, name: 'Годинник Закоханих' });
  addCitySign(scene, 'ГОДИННИК ЗАКОХАНИХ • БУЛЬВАР ШЕВЧЕНКА', 85, 1.6, 48, 0);

  // ================= 9. CONNECTING ROADS =================
  // Road 1: Soborny Avenue to DniproHES Dam Ramp (from X: 120, Z: -20 to X: 25, Z: -20)
  const damLinkRoad = new THREE.Mesh(new THREE.PlaneGeometry(95, 14), asphaltMat);
  damLinkRoad.rotation.x = -Math.PI / 2;
  damLinkRoad.position.set(72.5, 0.02, -20);
  scene.add(damLinkRoad);
  addRoadCenterLine(scene, 72.5, -20, 95, true);

  // Road 2: Khortytsia Island to Preobrazhensky Bridge Ramp
  const sichLinkRoad = new THREE.Mesh(new THREE.PlaneGeometry(12, 50), asphaltMat);
  sichLinkRoad.rotation.x = -Math.PI / 2;
  sichLinkRoad.position.set(-85, 1.82, 55);
  scene.add(sichLinkRoad);

  // ================= 10. CITY ARCHITECTURE & APARTMENTS =================
  const modernColors = [0x0f172a, 0x1e293b, 0x334155, 0x475569, 0xd97706, 0x059669];
  // High-rise Buildings along East of Soborny Avenue
  for (let i = 0; i < 7; i++) {
    const zPos = -280 + i * 85;
    // Don't block Festivalska plaza, АТБ-Маркет (Z: -35), or Квартира на Соборному (Z: 120)
    if (Math.abs(zPos - (-100)) > 30 && Math.abs(zPos - (-35)) > 35 && Math.abs(zPos - 120) > 35) {
      const bHeight = 14 + (i % 3) * 6;
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(16, bHeight, 28),
        new THREE.MeshStandardMaterial({ color: modernColors[i % modernColors.length], roughness: 0.65 })
      );
      building.position.set(145, bHeight / 2, zPos);
      building.castShadow = true;
      scene.add(building);
      colliders.push({ type: 'box', x: 145, z: zPos, width: 18, depth: 30, name: 'Житловий комплекс на пр. Соборному' });
    }
  }

  // Buildings along West of Soborny Avenue
  for (let i = 0; i < 7; i++) {
    const zPos = -280 + i * 85;
    // Don't block DniproHES ramp, Shevchenko blvd, or «Сільпо» Supermarket (Z: 95)
    if (Math.abs(zPos - (-20)) > 25 && Math.abs(zPos - 40) > 25 && Math.abs(zPos - 95) > 35) {
      const bHeight = 12 + (i % 2) * 5;
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(14, bHeight, 26),
        new THREE.MeshStandardMaterial({ color: modernColors[(i + 2) % modernColors.length], roughness: 0.7 })
      );
      building.position.set(95, bHeight / 2, zPos);
      building.castShadow = true;
      scene.add(building);
      colliders.push({ type: 'box', x: 95, z: zPos, width: 16, depth: 28, name: 'Будівля на пр. Соборному' });
    }
  }

  // ================= 11. TRAFFIC LIGHTS & CROSSINGS =================
  addTrafficLightPost(scene, 107, -25, 0); // Соборний / ДніпроГЕС
  addTrafficLightPost(scene, 133, -15, Math.PI);
  addTrafficLightPost(scene, 107, 35, 0); // Соборний / Шевченка
  addTrafficLightPost(scene, 133, 45, Math.PI);
  addTrafficLightPost(scene, 107, -95, 0); // Соборний / Фестивальна
  addTrafficLightPost(scene, 133, -105, Math.PI);

  addZebraCrossing(scene, 120, -22, 22, true);
  addZebraCrossing(scene, 120, 38, 22, true);
  addZebraCrossing(scene, 120, -98, 22, true);

  // ================= 12. STREET SIGNS =================
  addCitySign(scene, 'ПРОСПЕКТ СОБОРНИЙ', 120, 5.0, -180, 0);
  addCitySign(scene, 'ПРОСПЕКТ СОБОРНИЙ', 120, 5.0, 180, Math.PI);
  addCitySign(scene, 'ВИЇЗД НА ДНІПРОГЕС', 95, 3.8, -20, Math.PI / 2);
  addCitySign(scene, 'БУЛЬВАР ШЕВЧЕНКА', 95, 3.8, 40, Math.PI / 2);

  return colliders;
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
    new THREE.PlaneGeometry(4.8, 1.2),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
  );
  signMesh.position.set(x, y, z);
  signMesh.rotation.y = rotY;
  scene.add(signMesh);
}
