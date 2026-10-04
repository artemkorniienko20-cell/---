import * as THREE from 'three';

/**
 * Builds the 3D City of Moscow (Локація «Москва»):
 * - Красна площа (Red Square): бруківка, кремлівська зубчаста стіна
 * - Спаська вежа з курантами та червоною зіркою на шпилі
 * - Мавзолей та собор Василя Блаженного (куполи-цибулини)
 * - Хмарочоси «Москва-Сіті» на горизонті (вежа Федерація, Еволюція, Меркурій)
 * - Садове кільце / Проспект
 * - Пост ДПС (Державна автоінспекція • Служба в ДПС, службове авто з мигалками)
 * - Київський вокзал / Евакуаційний коридор: «🇺🇦 ПОВЕРНЕННЯ В УКРАЇНУ (КИЇВ) [F]»
 */
export function buildMoscowCity(scene) {
  const colliders = [];

  // ================= 1. OPEN WORLD TERRAIN =================
  const terrainGeo = new THREE.PlaneGeometry(2800, 2800);
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.95,
    metalness: 0.05
  });
  const ground = new THREE.Mesh(terrainGeo, terrainMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Materials
  const redBrickMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.85 }); // Kremlin Red Brick
  const darkRedMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.8 });
  const cobbleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 }); // Red Square Cobblestone
  const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const graniteMat = new THREE.MeshStandardMaterial({ color: 0x450a0a, roughness: 0.6 }); // Dark Red Granite (Mausoleum)
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2, emissive: 0xa16207, emissiveIntensity: 0.4 });
  const rubyStarMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xef4444, emissiveIntensity: 3.5 });
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
  const glassCityMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.85, roughness: 0.1, transparent: true, opacity: 0.85 });
  const goldGlassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });

  // ================= 2. GRAND AVENUE / GARDEN RING (САДОВЕ КІЛЬЦЕ) =================
  // 6-Lane Ring Road from Z: -250 to +250, X: 0
  const avenueLength = 600;
  const avenueRoad = new THREE.Mesh(new THREE.PlaneGeometry(22, avenueLength), asphaltMat);
  avenueRoad.rotation.x = -Math.PI / 2;
  avenueRoad.position.set(0, 0.02, 0);
  avenueRoad.receiveShadow = true;
  scene.add(avenueRoad);

  // Cross Avenue (Z: 0, X: -250 to +250)
  const crossRoad = new THREE.Mesh(new THREE.PlaneGeometry(avenueLength, 18), asphaltMat);
  crossRoad.rotation.x = -Math.PI / 2;
  crossRoad.position.set(0, 0.021, 0);
  crossRoad.receiveShadow = true;
  scene.add(crossRoad);

  // Sidewalks
  for (let sx of [-14, 14]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(6, avenueLength), concreteMat);
    sw.rotation.x = -Math.PI / 2;
    sw.position.set(sx, 0.03, 0);
    scene.add(sw);
  }

  // ================= 3. RED SQUARE & KREMLIN WALL (КРАСНА ПЛОЩА ТА КРЕМЛЬ) =================
  // Cobblestone Square (X: -60 to -160, Z: -70 to +70)
  const squareMesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 140), cobbleMat);
  squareMesh.rotation.x = -Math.PI / 2;
  squareMesh.position.set(-110, 0.04, 0);
  squareMesh.receiveShadow = true;
  scene.add(squareMesh);

  // Kremlin Wall (Довга червона цегляна стіна з зубцями)
  const wallGroup = new THREE.Group();
  wallGroup.position.set(-165, 0, 0);
  scene.add(wallGroup);

  const mainWall = new THREE.Mesh(new THREE.BoxGeometry(4.5, 9.5, 160), redBrickMat);
  mainWall.position.y = 4.75;
  mainWall.castShadow = true;
  wallGroup.add(mainWall);
  colliders.push({ type: 'box', x: -165, z: 0, width: 5.5, depth: 162, name: 'Кремлівська стіна' });

  // Swallowtail battlements (Зубці «ластівчин хвіст»)
  for (let bz = -75; bz <= 75; bz += 4) {
    const battlement = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 2.0), redBrickMat);
    battlement.position.set(1.6, 10.2, bz);
    wallGroup.add(battlement);
  }

  // Spasskaya Tower (Спаська вежа з курантами та зіркою)
  const spasskayaGroup = new THREE.Group();
  spasskayaGroup.position.set(-165, 0, 0);
  scene.add(spasskayaGroup);

  // Base tier
  const tier1 = new THREE.Mesh(new THREE.BoxGeometry(14, 18, 14), redBrickMat);
  tier1.position.y = 9;
  tier1.castShadow = true;
  spasskayaGroup.add(tier1);

  // Clock tier (Куранти)
  const tier2 = new THREE.Mesh(new THREE.BoxGeometry(10, 14, 10), darkRedMat);
  tier2.position.y = 25;
  spasskayaGroup.add(tier2);

  // Huge Clock faces on 4 sides
  for (let rot of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const clockFace = new THREE.Mesh(
      new THREE.CircleGeometry(2.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3 })
    );
    clockFace.position.set(Math.sin(rot) * 5.05, 25, Math.cos(rot) * 5.05);
    clockFace.rotation.y = rot;
    spasskayaGroup.add(clockFace);

    // Clock Gold Rim
    const rim = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.9, 16), goldMat);
    rim.position.set(Math.sin(rot) * 5.06, 25, Math.cos(rot) * 5.06);
    rim.rotation.y = rot;
    spasskayaGroup.add(rim);
  }

  // Octagonal Gothic Spire
  const spireBase = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.8, 8, 8), darkRedMat);
  spireBase.position.y = 36;
  spasskayaGroup.add(spireBase);

  const spireCone = new THREE.Mesh(new THREE.ConeGeometry(3.0, 16, 8), new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.6 })); // Green copper spire
  spireCone.position.y = 48;
  spasskayaGroup.add(spireCone);

  // Ruby Glowing Star on Top of Spire
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(1.6, 0), rubyStarMat);
  star.position.set(0, 57.5, 0);
  spasskayaGroup.add(star);

  const starLight = new THREE.PointLight(0xef4444, 2.5, 40);
  starLight.position.set(0, 58, 0);
  spasskayaGroup.add(starLight);

  colliders.push({ type: 'box', x: -165, z: 0, width: 16, depth: 16, name: 'Спаська вежа Кремля' });

  // Mausoleum (Мавзолей)
  const mauGroup = new THREE.Group();
  mauGroup.position.set(-150, 0, 0);
  scene.add(mauGroup);

  const step1 = new THREE.Mesh(new THREE.BoxGeometry(18, 2.5, 24), graniteMat);
  step1.position.y = 1.25;
  mauGroup.add(step1);

  const step2 = new THREE.Mesh(new THREE.BoxGeometry(13, 2.5, 17), graniteMat);
  step2.position.y = 3.75;
  mauGroup.add(step2);

  const step3 = new THREE.Mesh(new THREE.BoxGeometry(9, 2.0, 12), graniteMat);
  step3.position.y = 6.0;
  mauGroup.add(step3);

  colliders.push({ type: 'box', x: -150, z: 0, width: 20, depth: 26, name: 'Мавзолей' });

  // Saint Basil's Cathedral (Собор Василя Блаженного)
  const cathedralGroup = new THREE.Group();
  cathedralGroup.position.set(-110, 0, 55);
  scene.add(cathedralGroup);

  const catBase = new THREE.Mesh(new THREE.BoxGeometry(26, 8, 26), redBrickMat);
  catBase.position.y = 4;
  cathedralGroup.add(catBase);

  // Central Gold Dome
  const centralTower = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.0, 16, 12), redBrickMat);
  centralTower.position.y = 16;
  cathedralGroup.add(centralTower);

  const centralDome = new THREE.Mesh(new THREE.SphereGeometry(4.2, 14, 14), goldMat);
  centralDome.position.y = 26;
  centralDome.scale.set(1, 1.4, 1);
  cathedralGroup.add(centralDome);

  // 4 Colorful Onion Domes
  const domeColors = [0x3b82f6, 0x10b981, 0xef4444, 0xf59e0b];
  const domeOffsets = [
    { x: -7, z: -7 }, { x: 7, z: -7 }, { x: -7, z: 7 }, { x: 7, z: 7 }
  ];

  domeOffsets.forEach((off, idx) => {
    const subTower = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 10, 10), redBrickMat);
    subTower.position.set(off.x, 12, off.z);
    cathedralGroup.add(subTower);

    const onion = new THREE.Mesh(
      new THREE.SphereGeometry(2.8, 12, 12),
      new THREE.MeshStandardMaterial({ color: domeColors[idx], roughness: 0.3 })
    );
    onion.position.set(off.x, 18.5, off.z);
    onion.scale.set(1, 1.35, 1);
    cathedralGroup.add(onion);
  });

  colliders.push({ type: 'box', x: -110, z: 55, width: 28, depth: 28, name: 'Собор Василя Блаженного' });

  // ================= 4. MOSCOW CITY SKYSCRAPERS (ХМАРОЧОСИ «МОСКВА-СІТІ») =================
  const moscowCityGroup = new THREE.Group();
  moscowCityGroup.position.set(150, 0, -60);
  scene.add(moscowCityGroup);

  // Tower 1: Federation Tower (Вежа Федерація - 95м)
  const fedTower = new THREE.Mesh(new THREE.BoxGeometry(26, 95, 26), glassCityMat);
  fedTower.position.set(0, 47.5, 0);
  fedTower.castShadow = true;
  moscowCityGroup.add(fedTower);
  colliders.push({ type: 'box', x: 150, z: -60, width: 28, depth: 28, name: 'Вежа «Федерація» Москва-Сіті' });

  // Tower 2: Evolution Tower (Вежа Еволюція зі спіральними гранями - 75м)
  const evoTower = new THREE.Mesh(new THREE.CylinderGeometry(9, 11, 75, 8), glassCityMat);
  evoTower.position.set(-35, 37.5, 20);
  evoTower.rotation.y = 0.6;
  moscowCityGroup.add(evoTower);
  colliders.push({ type: 'box', x: 115, z: -40, width: 22, depth: 22, name: 'Вежа «Еволюція»' });

  // Tower 3: Mercury Tower (Золота вежа «Меркурій» - 85м)
  const mercuryTower = new THREE.Mesh(new THREE.BoxGeometry(22, 85, 22), goldGlassMat);
  mercuryTower.position.set(35, 42.5, 30);
  moscowCityGroup.add(mercuryTower);
  colliders.push({ type: 'box', x: 185, z: -30, width: 24, depth: 24, name: 'Вежа «Меркурій Сіті»' });

  // ================= 5. DPS POST & POLICE PRECINCT (ПОСТ ДПС • РОБОТА В ДПС) =================
  const dpsGroup = new THREE.Group();
  dpsGroup.position.set(35, 0, 35);
  scene.add(dpsGroup);

  // Main DPS Station Building
  const dpsBuilding = new THREE.Mesh(
    new THREE.BoxGeometry(20, 6.0, 14),
    new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6 })
  );
  dpsBuilding.position.y = 3.0;
  dpsBuilding.castShadow = true;
  dpsGroup.add(dpsBuilding);

  // DPS Signboard ("🚨 ВІДДІЛ ДПС • ДОРОЖНЬО-ПАТРУЛЬНА СЛУЖБА 🚨")
  const signMesh = new THREE.Mesh(
    new THREE.BoxGeometry(16, 2.4, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.2, emissive: 0x1e40af, emissiveIntensity: 0.6 })
  );
  signMesh.position.set(0, 5.5, 7.2);
  dpsGroup.add(signMesh);

  // Giant 3D Light Beacon Tower (Високий маяк, який видно з будь-якої точки карти)
  const beaconPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.5, 26, 12),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 })
  );
  beaconPole.position.set(0, 16, 0);
  dpsGroup.add(beaconPole);

  // Glowing Police Blue & Red Rings on Beacon
  const blueBeaconRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.4, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  blueBeaconRing.position.set(0, 24, 0);
  blueBeaconRing.rotation.x = Math.PI / 2;
  dpsGroup.add(blueBeaconRing);

  const redBeaconRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.0, 0.4, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  redBeaconRing.position.set(0, 26, 0);
  redBeaconRing.rotation.x = Math.PI / 2;
  dpsGroup.add(redBeaconRing);

  // Vertical Light Beam pointing straight up into the sky
  const skyBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 3.5, 90, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    })
  );
  skyBeam.position.set(0, 52, 0);
  dpsGroup.add(skyBeam);

  // Big 3D Glowing Pointer Arrow pointing DOWN at the entrance
  const arrowCone = new THREE.Mesh(
    new THREE.ConeGeometry(2.2, 4.0, 8),
    new THREE.MeshBasicMaterial({ color: 0xfacc15 })
  );
  arrowCone.rotation.x = Math.PI; // point downwards
  arrowCone.position.set(0, 11, 7.5);
  dpsGroup.add(arrowCone);

  // Strobe Lights on Beacon
  const blueStrobe = new THREE.PointLight(0x0284c7, 4.0, 50);
  blueStrobe.position.set(0, 24, 0);
  dpsGroup.add(blueStrobe);

  const redStrobe = new THREE.PointLight(0xdc2626, 4.0, 50);
  redStrobe.position.set(0, 26, 0);
  dpsGroup.add(redStrobe);

  // Glass observation booth (Стакан ДПС)
  const booth = new THREE.Mesh(
    new THREE.CylinderGeometry(2.0, 2.0, 3.8, 12),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
  );
  booth.position.set(-12, 1.9, 8);
  dpsGroup.add(booth);

  // Traffic Barrier & Checkpoint gate
  const gateArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 7.0, 8),
    new THREE.MeshStandardMaterial({ color: 0xdc2626 }) // Red & white barrier arm
  );
  gateArm.rotation.z = Math.PI / 2;
  gateArm.position.set(-15, 1.1, 0);
  dpsGroup.add(gateArm);

  // DPS Parking Pad
  const dpsPad = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 12),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
  );
  dpsPad.rotation.x = -Math.PI / 2;
  dpsPad.position.set(0, 0.03, -12);
  dpsGroup.add(dpsPad);

  colliders.push({ type: 'box', x: 35, z: 35, width: 22, depth: 16, name: 'Головний Пост ДПС' });

  // 3D Model: Dedicated DPS Patrol Car parked at the station
  const dpsCarGroup = new THREE.Group();
  dpsCarGroup.position.set(35, 0, 23);
  scene.add(dpsCarGroup);

  const carBodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }); // White DPS Sedan
  const dpsStripeMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4 }); // Blue DPS Stripe

  const carBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.8, 4.6), carBodyMat);
  carBody.position.y = 0.65;
  dpsCarGroup.add(carBody);

  const carCabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 2.4), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 }));
  carCabin.position.set(0, 1.25, -0.2);
  dpsCarGroup.add(carCabin);

  // Blue Side Stripes with "ДПС"
  for (let sx of [-1.06, 1.06]) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22, 3.8), dpsStripeMat);
    stripe.position.set(sx, 0.65, 0);
    dpsCarGroup.add(stripe);
  }

  // Roof DPS Strobe Lightbar
  const roofBar = new THREE.Group();
  roofBar.position.set(0, 1.62, -0.2);
  dpsCarGroup.add(roofBar);

  const strobeBlue = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.18), new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x2563eb, emissiveIntensity: 2.0 }));
  strobeBlue.position.x = 0.25;
  roofBar.add(strobeBlue);

  const strobeRed = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.18), new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xdc2626, emissiveIntensity: 2.0 }));
  strobeRed.position.x = -0.25;
  roofBar.add(strobeRed);

  // Wheels
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
  for (let wx of [-1.02, 1.02]) {
    for (let wz of [-1.3, 1.3]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.26, 12), wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, 0.34, wz);
      dpsCarGroup.add(w);
    }
  }

  colliders.push({ type: 'box', x: 35, z: 23, width: 2.4, depth: 4.8, name: 'Службовий автомобіль ДПС' });

  // ================= 6. KYIV RAILWAY TERMINAL / EVACUATION POINT (ПОВЕРНЕННЯ В КИЇВ) =================
  const kyivStationGroup = new THREE.Group();
  kyivStationGroup.position.set(-65, 0, -110);
  scene.add(kyivStationGroup);

  // Neoclassical Station Building
  const terminalMain = new THREE.Mesh(
    new THREE.BoxGeometry(36, 12, 22),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 })
  );
  terminalMain.position.y = 6.0;
  terminalMain.castShadow = true;
  kyivStationGroup.add(terminalMain);

  // Big Sign: "КИЇВСЬКИЙ ВОКЗАЛ • НАПРЯМОК НА КИЇВ (УКРАЇНА)"
  const stationSign = new THREE.Mesh(
    new THREE.BoxGeometry(26, 2.2, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
  );
  stationSign.position.set(0, 10.5, 11.2);
  kyivStationGroup.add(stationSign);

  // Glowing Return Portal Ring (Yellow & Blue Ukrainian flag glow)
  const returnPortal = new THREE.Mesh(
    new THREE.RingGeometry(2.5, 5.2, 24),
    new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
  );
  returnPortal.position.set(0, 3.2, 12.5);
  kyivStationGroup.add(returnPortal);

  colliders.push({ type: 'box', x: -65, z: -110, width: 38, depth: 24, name: 'Київський вокзал (Повернення в Київ)' });

  return {
    colliders,
    // Interactive trigger coordinates
    dpsPost: { x: 35, z: 35, radius: 24.0 },
    dpsCar: { x: 35, z: 23, radius: 12.0 },
    returnToKyiv: { x: -65, z: -98, radius: 18.0 }
  };
}
