import * as THREE from 'three';

/**
 * Builds realistic Supermarkets (АТБ, Сільпо) & Dedicated Parking Lots
 * with marked parking bays, parking meters, glowing neon logos, and entrance portals.
 */

// Helper to create glowing canvas signs
function createStoreSign(text, bgColor = '#0f172a', textColor = '#ffffff', borderColor = '#ef4444') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 504, 120);

  ctx.fillStyle = textColor;
  ctx.font = '900 42px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);

  return new THREE.CanvasTexture(canvas);
}

// 1. Helper to build a realistic Supermarket (АТБ або Сільпо)
export function buildSupermarket(scene, config, colliders) {
  const { id, name, brand, x, z, rotY = 0 } = config;
  const storeGroup = new THREE.Group();
  storeGroup.position.set(x, 0, z);
  storeGroup.rotation.y = rotY;
  scene.add(storeGroup);

  const isATB = brand === 'atb';

  // Materials
  const wallMat = new THREE.MeshStandardMaterial({
    color: isATB ? 0x111827 : 0x1f2937,
    roughness: 0.7,
    metalness: 0.2
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.8,
    transparent: true,
    roughness: 0.1,
    metalness: 0.1
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: isATB ? 0xdc2626 : 0xf59e0b,
    roughness: 0.4
  });

  const width = 28;
  const depth = 22;
  const height = 7.5;

  // Main Building Box
  const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
  building.position.y = height / 2;
  building.castShadow = true;
  building.receiveShadow = true;
  storeGroup.add(building);

  // Add wall collider for physics
  colliders.push({
    type: 'box',
    x,
    z,
    width: width + 1,
    depth: depth + 1,
    name: name
  });

  // Front Fascia Trim Ribbon
  const fascia = new THREE.Mesh(new THREE.BoxGeometry(width + 0.4, 1.4, 0.4), trimMat);
  fascia.position.set(0, height - 0.7, depth / 2 + 0.2);
  storeGroup.add(fascia);

  // Big Glowing Store Logo Signboard
  const signTexture = createStoreSign(
    isATB ? '🔴 АТБ-МАРКЕТ 24/7' : '🍊 СІЛЬПО • СМАЧНО',
    isATB ? '#090d16' : '#14532d',
    '#ffffff',
    isATB ? '#dc2626' : '#f59e0b'
  );
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 2.8),
    new THREE.MeshBasicMaterial({ map: signTexture })
  );
  signMesh.position.set(0, height - 0.7, depth / 2 + 0.45);
  storeGroup.add(signMesh);

  // Glass Front Entrance & Windows
  const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.75, 4.0), glassMat);
  windowGlass.position.set(0, 2.2, depth / 2 + 0.1);
  storeGroup.add(windowGlass);

  // Illuminated Warm Interior Shop Light coming through windows
  const interiorLight = new THREE.PointLight(isATB ? 0xfef08a : 0xfde047, 4.5, 25);
  interiorLight.position.set(0, 3.5, depth / 2 - 2);
  storeGroup.add(interiorLight);

  // Sliding Glass Door with Green Neon "ВХІД" Sign
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 });
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.2, 0.2), doorMat);
  doorFrame.position.set(0, 1.6, depth / 2 + 0.15);
  storeGroup.add(doorFrame);

  const entranceSignTex = createStoreSign('ВХІД 🟢 OPEN', '#022c22', '#34d399', '#10b981');
  const entranceSign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 0.6),
    new THREE.MeshBasicMaterial({ map: entranceSignTex })
  );
  entranceSign.position.set(0, 3.4, depth / 2 + 0.3);
  storeGroup.add(entranceSign);

  // Glowing ground entrance trigger ring
  const ringGeo = new THREE.RingGeometry(1.2, 2.2, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: isATB ? 0xef4444 : 0xf59e0b,
    side: THREE.DoubleSide
  });
  const groundRing = new THREE.Mesh(ringGeo, ringMat);
  groundRing.rotation.x = -Math.PI / 2;
  groundRing.position.set(0, 0.05, depth / 2 + 2.0);
  storeGroup.add(groundRing);

  // Exterior Entrance Canopy Roof
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.25, 3.0), trimMat);
  canopy.position.set(0, 3.8, depth / 2 + 1.5);
  storeGroup.add(canopy);

  // Outside Shopping Carts Station (Візки для покупок)
  const cartMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
  for (let c = -2.2; c <= -0.8; c += 0.45) {
    const cart = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.85, 0.9), cartMat);
    cart.position.set(width / 2 - 2.5, 0.45, depth / 2 + 1.2 + c);
    storeGroup.add(cart);
  }

  // Calculate world entrance coordinates (for walking player trigger)
  const forwardX = Math.sin(rotY) * (depth / 2 + 2.5);
  const forwardZ = Math.cos(rotY) * (depth / 2 + 2.5);
  const entranceWorldX = x + forwardX;
  const entranceWorldZ = z + forwardZ;

  // Build Front Parking Lot attached to the store
  const parkingWorldX = x + Math.sin(rotY) * (depth / 2 + 12);
  const parkingWorldZ = z + Math.cos(rotY) * (depth / 2 + 12);
  buildParkingLot(scene, {
    name: `Паркінг «${isATB ? 'АТБ' : 'Сільпо'}»`,
    x: parkingWorldX,
    z: parkingWorldZ,
    width: 28,
    depth: 16,
    spacesCount: 10,
    rotY
  }, colliders);

  return {
    id,
    name,
    brand,
    x,
    z,
    entranceX: entranceWorldX,
    entranceZ: entranceWorldZ,
    radius: 7.0
  };
}

// 2. Helper to build Buyable Housing Properties (Квартири та Будинки за 100 грн)
export function buildHousingProperty(scene, config, colliders) {
  const { id, type, title, address, price = 100, desc, x, z, rotY = 0 } = config;

  const houseGroup = new THREE.Group();
  houseGroup.position.set(x, 0, z);
  houseGroup.rotation.y = rotY;
  scene.add(houseGroup);

  const isApartment = type === 'apartment';
  const width = isApartment ? 22 : 16;
  const depth = isApartment ? 18 : 14;
  const height = isApartment ? 24 : 8.5;

  if (isApartment) {
    // Multi-story Residential Complex (ЖК)
    const facadeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.2 });
    const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), facadeMat);
    building.position.y = height / 2;
    building.castShadow = true;
    building.receiveShadow = true;
    houseGroup.add(building);

    // Modern Balconies & Windows
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.7, roughness: 0.2 });
    for (let floor = 1; floor <= 4; floor++) {
      const balcony = new THREE.Mesh(new THREE.BoxGeometry(width * 0.7, 0.9, 1.2), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
      balcony.position.set(0, floor * 4.5, depth / 2 + 0.6);
      houseGroup.add(balcony);

      const balcGlass = new THREE.Mesh(new THREE.BoxGeometry(width * 0.68, 0.8, 0.05), glassMat);
      balcGlass.position.set(0, floor * 4.5 + 0.5, depth / 2 + 1.18);
      houseGroup.add(balcGlass);
    }

    // Entrance Canopy & Glass Intercom Door (Під'їзд)
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 });
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.3, 3.2), canopyMat);
    canopy.position.set(0, 3.6, depth / 2 + 1.6);
    houseGroup.add(canopy);

    const door = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.0, 0.2), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    door.position.set(0, 1.5, depth / 2 + 0.1);
    houseGroup.add(door);
  } else {
    // 2-Story Private House / Cottage with pitched roof & chimney
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 });
    const walls = new THREE.Mesh(new THREE.BoxGeometry(width, 5.5, depth), wallMat);
    walls.position.y = 2.75;
    walls.castShadow = true;
    walls.receiveShadow = true;
    houseGroup.add(walls);

    // Pitched Gable Roof (Двосхилий дах)
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.75, 4.2, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, 5.5 + 2.1, 0);
    roof.castShadow = true;
    houseGroup.add(roof);

    // Brick Chimney (Димар)
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.0, 3.5, 1.0), new THREE.MeshStandardMaterial({ color: 0x7f1d1d }));
    chimney.position.set(width * 0.25, 7.8, -depth * 0.15);
    houseGroup.add(chimney);

    // Wooden Porch (Ганок)
    const porch = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 2.8), new THREE.MeshStandardMaterial({ color: 0x78350f }));
    porch.position.set(0, 0.2, depth / 2 + 1.4);
    houseGroup.add(porch);

    // Cozy Front Fence with gate
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
    for (let side of [-1, 1]) {
      const fence = new THREE.Mesh(new THREE.BoxGeometry(width / 2 - 2.8, 1.1, 0.15), fenceMat);
      fence.position.set(side * (width / 4 + 1.8), 0.55, depth / 2 + 3.8);
      houseGroup.add(fence);
    }
  }

  // Add physics collider for the building
  colliders.push({
    type: 'box',
    x,
    z,
    width: width + 1,
    depth: depth + 1,
    name: title
  });

  // Glowing For Sale / Home Signboard
  const signText = `🏠 ${title.toUpperCase()} • ₴${price}`;
  const signTex = createStoreSign(signText, '#022c22', '#34d399', '#10b981');
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(10.5, 2.2),
    new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
  );
  signMesh.position.set(0, isApartment ? 5.2 : 4.6, depth / 2 + 0.35);
  houseGroup.add(signMesh);

  // Ground Glowing Ring Entrance Marker
  const ringGeo = new THREE.RingGeometry(1.2, 2.2, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
  const groundRing = new THREE.Mesh(ringGeo, ringMat);
  groundRing.rotation.x = -Math.PI / 2;
  groundRing.position.set(0, 0.05, depth / 2 + 2.0);
  houseGroup.add(groundRing);

  // Entrance world coordinates
  const forwardX = Math.sin(rotY) * (depth / 2 + 2.5);
  const forwardZ = Math.cos(rotY) * (depth / 2 + 2.5);
  const entranceWorldX = x + forwardX;
  const entranceWorldZ = z + forwardZ;

  // Attached Private Parking Spot for the owner
  const parkWorldX = x + Math.sin(rotY + Math.PI / 2) * (width / 2 + 3.5);
  const parkWorldZ = z + Math.cos(rotY + Math.PI / 2) * (width / 2 + 3.5);
  buildParkingLot(scene, {
    name: `Паркомісце: ${title}`,
    x: parkWorldX,
    z: parkWorldZ,
    width: 14,
    depth: 10,
    spacesCount: 4,
    rotY
  }, colliders);

  return {
    id,
    type,
    title,
    address,
    price,
    desc,
    x,
    z,
    entranceX: entranceWorldX,
    entranceZ: entranceWorldZ,
    parkingX: parkWorldX,
    parkingZ: parkWorldZ,
    radius: 6.5
  };
}

// 3. Helper to build a dedicated Parking Lot with marked bays, P signs, and parking meters
export function buildParkingLot(scene, config, colliders) {
  const { name, x, z, width = 24, depth = 14, spacesCount = 8, rotY = 0 } = config;

  const lotGroup = new THREE.Group();
  lotGroup.position.set(x, 0, z);
  lotGroup.rotation.y = rotY;
  scene.add(lotGroup);

  // Asphalt Ground Surface
  const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x111622, roughness: 0.88 });
  const surface = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), asphaltMat);
  surface.rotation.x = -Math.PI / 2;
  surface.position.y = 0.02;
  surface.receiveShadow = true;
  lotGroup.add(surface);

  // Parking Bays Markings (Yellow & White lines)
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const bayWidth = (width - 2) / (spacesCount / 2);

  // Top and bottom row of parking stalls
  for (let row = -1; row <= 1; row += 2) {
    const rowZ = row * (depth / 2 - 3.2);

    for (let i = 0; i <= spacesCount / 2; i++) {
      const lineX = -width / 2 + 1 + i * bayWidth;

      // Divider line between stalls
      const bayLine = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 5.5), lineMat);
      bayLine.rotation.x = -Math.PI / 2;
      bayLine.position.set(lineX, 0.025, rowZ);
      lotGroup.add(bayLine);

      // Rubber Tire Stopper / Wheel Stop Curb
      if (i < spacesCount / 2) {
        const stopper = new THREE.Mesh(
          new THREE.BoxGeometry(bayWidth * 0.75, 0.14, 0.25),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 })
        );
        stopper.position.set(lineX + bayWidth / 2, 0.07, row > 0 ? depth / 2 - 0.5 : -depth / 2 + 0.5);
        lotGroup.add(stopper);
      }
    }
  }

  // Curbs / Barriers along perimeter to prevent driving off
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
  for (let side of [-1, 1]) {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, depth), curbMat);
    curb.position.set(side * (width / 2 - 0.2), 0.15, 0);
    lotGroup.add(curb);
  }

  // Glowing Blue "🅿️ ПАРКОВКА" Post Sign
  const pSignGroup = new THREE.Group();
  pSignGroup.position.set(-width / 2 + 1.5, 0, depth / 2 - 1);
  lotGroup.add(pSignGroup);

  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.8, 12), curbMat);
  post.position.y = 1.9;
  pSignGroup.add(post);

  const pSignTex = createStoreSign('🅿️ ПАРКОВКА', '#1d4ed8', '#ffffff', '#60a5fa');
  const pSignMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 1.2),
    new THREE.MeshBasicMaterial({ map: pSignTex, side: THREE.DoubleSide })
  );
  pSignMesh.position.y = 3.6;
  pSignGroup.add(pSignMesh);

  // Modern Solar Parking Meter (Паркомат)
  const meterMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
  const meter = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.6, 0.35), meterMat);
  meter.position.set(width / 2 - 1.5, 0.8, depth / 2 - 1);
  lotGroup.add(meter);

  const meterScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.25, 0.2),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  meterScreen.position.set(width / 2 - 1.5, 1.2, depth / 2 - 0.82);
  lotGroup.add(meterScreen);

  return {
    name,
    x,
    z,
    width,
    depth
  };
}

// 4. Helper to build a realistic Police Department (Головне Управління Національної Поліції 102) & Police Car Spawn
export function buildPoliceStation(scene, config, colliders) {
  const { id, name, x, z, rotY = 0 } = config;
  const stationGroup = new THREE.Group();
  stationGroup.position.set(x, 0, z);
  stationGroup.rotation.y = rotY;
  scene.add(stationGroup);

  const width = 28;
  const depth = 22;
  const height = 9.5;

  // Materials
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.3 }); // Navy tactical stone
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transmission: 0.85, transparent: true, roughness: 0.1 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4, metalness: 0.6 }); // Police blue metal

  // Main Building Box
  const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
  building.position.y = height / 2;
  building.castShadow = true;
  building.receiveShadow = true;
  stationGroup.add(building);

  // Collider
  colliders.push({
    type: 'box',
    x,
    z,
    width: width + 1,
    depth: depth + 1,
    name
  });

  // Top Fascia with Police Colors
  const fascia = new THREE.Mesh(new THREE.BoxGeometry(width + 0.4, 1.4, 0.4), trimMat);
  fascia.position.set(0, height - 0.7, depth / 2 + 0.2);
  stationGroup.add(fascia);

  // Big Glowing Signboard
  const signTex = createStoreSign('🇺🇦 НАЦІОНАЛЬНА ПОЛІЦІЯ • 102', '#090d16', '#ffffff', '#2563eb');
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 2.6),
    new THREE.MeshBasicMaterial({ map: signTex })
  );
  signMesh.position.set(0, height - 0.7, depth / 2 + 0.45);
  stationGroup.add(signMesh);

  // Police Subtitle Sign: "СЛУЖИТИ ТА ЗАХИЩАТИ • ВІДДІЛОК 102"
  const subSignTex = createStoreSign('СЛУЖИТИ ТА ЗАХИЩАТИ • ВІДДІЛОК 102', '#0284c7', '#ffffff', '#38bdf8');
  const subSign = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 0.9),
    new THREE.MeshBasicMaterial({ map: subSignTex })
  );
  subSign.position.set(0, height - 2.4, depth / 2 + 0.3);
  stationGroup.add(subSign);

  // Blue glass windows
  const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.8, 4.0), glassMat);
  windowGlass.position.set(0, 3.2, depth / 2 + 0.1);
  stationGroup.add(windowGlass);

  // Rooftop Strobe Lightbars (Blue & Red)
  const strobeGroup = new THREE.Group();
  strobeGroup.position.set(0, height + 0.5, depth / 2 - 2);
  stationGroup.add(strobeGroup);

  const lightbarBox = new THREE.Mesh(
    new THREE.BoxGeometry(4.0, 0.3, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x18181b })
  );
  strobeGroup.add(lightbarBox);

  const blueStrobeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.35, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 1.5 })
  );
  blueStrobeMesh.position.set(1.0, 0.05, 0);
  strobeGroup.add(blueStrobeMesh);

  const redStrobeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.35, 0.42),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 1.5 })
  );
  redStrobeMesh.position.set(-1.0, 0.05, 0);
  strobeGroup.add(redStrobeMesh);

  // Ukrainian Flag pole on roof
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 5.0, 8),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
  );
  pole.position.set(width / 2 - 2, height + 2.5, 0);
  stationGroup.add(pole);

  const flagTop = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 0.6),
    new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide })
  );
  flagTop.position.set(width / 2 - 1.1, height + 4.6, 0);
  stationGroup.add(flagTop);

  const flagBottom = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 0.6),
    new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
  );
  flagBottom.position.set(width / 2 - 1.1, height + 4.0, 0);
  stationGroup.add(flagBottom);

  // Entrance door & Canopy
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.3, 3.0), trimMat);
  canopy.position.set(0, 3.8, depth / 2 + 1.5);
  stationGroup.add(canopy);

  // Entrance sign
  const entranceSignTex = createStoreSign('ЧЕРГОВА ЧАСТИНА • 24/7', '#0f172a', '#38bdf8', '#1d4ed8');
  const entranceSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 0.8),
    new THREE.MeshBasicMaterial({ map: entranceSignTex })
  );
  entranceSign.position.set(0, 3.5, depth / 2 + 0.3);
  stationGroup.add(entranceSign);

  // Glowing ground trigger ring for precinct
  const ringGeo = new THREE.RingGeometry(1.2, 2.4, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide
  });
  const groundRing = new THREE.Mesh(ringGeo, ringMat);
  groundRing.rotation.x = -Math.PI / 2;
  groundRing.position.set(0, 0.05, depth / 2 + 2.2);
  stationGroup.add(groundRing);

  // World coordinates of entrance
  const forwardX = Math.sin(rotY) * (depth / 2 + 2.5);
  const forwardZ = Math.cos(rotY) * (depth / 2 + 2.5);
  const entranceWorldX = x + forwardX;
  const entranceWorldZ = z + forwardZ;

  // ================= DEDICATED POLICE CAR SPAWN =================
  // Positioned beside the precinct on a marked police bay
  const carLocalX = -width / 2 - 6.5;
  const carLocalZ = depth / 2 - 3.5;
  const carWorldX = x + Math.cos(rotY) * carLocalX + Math.sin(rotY) * carLocalZ;
  const carWorldZ = z - Math.sin(rotY) * carLocalX + Math.cos(rotY) * carLocalZ;

  // Police Parking Bay Pad
  const bayPad = new THREE.Mesh(
    new THREE.PlaneGeometry(7.5, 4.5),
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85 })
  );
  bayPad.rotation.x = -Math.PI / 2;
  bayPad.position.set(carLocalX, 0.02, carLocalZ);
  stationGroup.add(bayPad);

  // Yellow/Blue Markings for Police Parking
  const bayMarkTex = createStoreSign('🚓 ПАТРУЛЬ 102 • СЛУЖБОВИЙ ТРАНСПОРТ', '#1d4ed8', '#facc15', '#facc15');
  const bayMarkMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(6.5, 1.2),
    new THREE.MeshBasicMaterial({ map: bayMarkTex })
  );
  bayMarkMesh.rotation.x = -Math.PI / 2;
  bayMarkMesh.position.set(carLocalX, 0.03, carLocalZ + 2.5);
  stationGroup.add(bayMarkMesh);

  // 3D Police Patrol Car Model (parked on the pad)
  const policeCarGroup = new THREE.Group();
  policeCarGroup.position.set(carLocalX, 0, carLocalZ);
  policeCarGroup.rotation.y = Math.PI / 2;
  stationGroup.add(policeCarGroup);

  // Police car body (aerodynamic white patrol sedan)
  const carBodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.1 });
  const carBlueStripeMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 });
  const carYellowStripeMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
  const carWindowMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, roughness: 0.1, transmission: 0.6, transparent: true });

  const carChassis = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.7, 4.4), carBodyMat);
  carChassis.position.y = 0.55;
  carChassis.castShadow = true;
  policeCarGroup.add(carChassis);

  // Blue Side Stripes (National Police livery)
  const leftStripe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 4.2), carBlueStripeMat);
  leftStripe.position.set(0.96, 0.55, 0);
  policeCarGroup.add(leftStripe);

  const rightStripe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 4.2), carBlueStripeMat);
  rightStripe.position.set(-0.96, 0.55, 0);
  policeCarGroup.add(rightStripe);

  const yellowStripeL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 4.0), carYellowStripeMat);
  yellowStripeL.position.set(0.965, 0.42, 0);
  policeCarGroup.add(yellowStripeL);

  const yellowStripeR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 4.0), carYellowStripeMat);
  yellowStripeR.position.set(-0.965, 0.42, 0);
  policeCarGroup.add(yellowStripeR);

  // Cabin & Roof
  const carCabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.65, 2.3), carWindowMat);
  carCabin.position.set(0, 1.15, -0.15);
  carCabin.castShadow = true;
  policeCarGroup.add(carCabin);

  const carRoof = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.08, 1.9), carBodyMat);
  carRoof.position.set(0, 1.5, -0.15);
  policeCarGroup.add(carRoof);

  // Wheels
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.2 });
  [
    [-0.95, 0.32, 1.3],
    [0.95, 0.32, 1.3],
    [-0.95, 0.32, -1.3],
    [0.95, 0.32, -1.3]
  ].forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.24, 16), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;
    policeCarGroup.add(wheel);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.25, 12), rimMat);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(wx, wy, wz);
    policeCarGroup.add(rim);
  });

  // Rooftop Police Strobe Lightbar on Car
  const carLightbar = new THREE.Group();
  carLightbar.position.set(0, 1.62, -0.15);
  policeCarGroup.add(carLightbar);

  const barMount = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.25), new THREE.MeshStandardMaterial({ color: 0x18181b }));
  carLightbar.add(barMount);

  const carBlueLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.16, 0.26),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 2.0 })
  );
  carBlueLight.position.set(0.35, 0.08, 0);
  carLightbar.add(carBlueLight);

  const carRedLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.16, 0.26),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 2.0 })
  );
  carRedLight.position.set(-0.35, 0.08, 0);
  carLightbar.add(carRedLight);

  // Ground glowing indicator ring around police car
  const carRing = new THREE.Mesh(
    new THREE.RingGeometry(2.4, 3.2, 24),
    new THREE.MeshBasicMaterial({ color: 0x3b82f6, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
  );
  carRing.rotation.x = -Math.PI / 2;
  carRing.position.set(carLocalX, 0.05, carLocalZ);
  stationGroup.add(carRing);

  // Return full police station & car details
  return {
    id,
    name,
    entranceX: entranceWorldX,
    entranceZ: entranceWorldZ,
    radius: 3.8,
    policeCar: {
      x: carWorldX,
      z: carWorldZ,
      yaw: rotY + Math.PI / 2,
      radius: 4.8,
      name: 'Патрульне авто Національної Поліції (102)'
    }
  };
}

// 5. Helper to build a Tactical Gun & Weapon Shop (Магазин Зброї «КАЛІБР»)
export function buildGunShop(scene, config, colliders) {
  const { id, name, x, z, rotY = 0 } = config;
  const shopGroup = new THREE.Group();
  shopGroup.position.set(x, 0, z);
  shopGroup.rotation.y = rotY;
  scene.add(shopGroup);

  const width = 18;
  const depth = 14;
  const height = 7.0;

  // Materials
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7, metalness: 0.3 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4, metalness: 0.5 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x1e1b4b, transmission: 0.8, transparent: true, roughness: 0.1 });

  // Main Building Box
  const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
  building.position.y = height / 2;
  building.castShadow = true;
  building.receiveShadow = true;
  shopGroup.add(building);

  // Collider
  colliders.push({
    type: 'box',
    x,
    z,
    width: width + 1,
    depth: depth + 1,
    name
  });

  // Top Fascia with Red Trim
  const fascia = new THREE.Mesh(new THREE.BoxGeometry(width + 0.4, 1.2, 0.4), trimMat);
  fascia.position.set(0, height - 0.6, depth / 2 + 0.2);
  shopGroup.add(fascia);

  // Neon Store Signboard
  const signTex = createStoreSign('🔫 ЗБРОЯ • GUN SHOP 24/7', '#450a0a', '#ef4444', '#f87171');
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(12.0, 2.2),
    new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
  );
  signMesh.position.set(0, height + 1.2, depth / 2 + 0.2);
  shopGroup.add(signMesh);

  // Large Armored Display Window
  const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(10.0, 3.2), glassMat);
  windowMesh.position.set(0, 2.8, depth / 2 + 0.05);
  shopGroup.add(windowMesh);

  // Entrance Canopy
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.25, 2.4), trimMat);
  canopy.position.set(0, 3.4, depth / 2 + 1.2);
  shopGroup.add(canopy);

  // Glowing ground trigger ring (Red neon)
  const ringGeo = new THREE.RingGeometry(1.2, 2.2, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
  const groundRing = new THREE.Mesh(ringGeo, ringMat);
  groundRing.rotation.x = -Math.PI / 2;
  groundRing.position.set(0, 0.05, depth / 2 + 1.8);
  shopGroup.add(groundRing);

  // World coordinates of entrance
  const forwardX = Math.sin(rotY) * (depth / 2 + 2.0);
  const forwardZ = Math.cos(rotY) * (depth / 2 + 2.0);

  return {
    id,
    name,
    entranceX: x + forwardX,
    entranceZ: z + forwardZ,
    radius: 4.2
  };
}

// 6. Helper to build a State Emergency Service Station (ДСНС України 101)
export function buildDsnsStation(scene, config, colliders) {
  const { id, name, x, z, rotY = 0 } = config;
  const dsnsGroup = new THREE.Group();
  dsnsGroup.position.set(x, 0, z);
  dsnsGroup.rotation.y = rotY;
  scene.add(dsnsGroup);

  const width = 24;
  const depth = 18;
  const height = 8.5;

  // Materials
  const brickMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.85 }); // Red brick
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
  const doorMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 }); // Fire engine red

  // Station Main Building
  const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), brickMat);
  building.position.y = height / 2;
  building.castShadow = true;
  building.receiveShadow = true;
  dsnsGroup.add(building);

  // Collider
  colliders.push({
    type: 'box',
    x,
    z,
    width: width + 1,
    depth: depth + 1,
    name
  });

  // Roll-up Fire Engine Garage Doors
  for (let gx of [-5.5, 5.5]) {
    const garageDoor = new THREE.Mesh(new THREE.BoxGeometry(7.0, 5.2, 0.2), doorMat);
    garageDoor.position.set(gx, 2.6, depth / 2 + 0.1);
    dsnsGroup.add(garageDoor);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.3, 0.3), whiteMat);
    frame.position.set(gx, 5.3, depth / 2 + 0.15);
    dsnsGroup.add(frame);
  }

  // Station Fascia Signboard
  const signTex = createStoreSign('🚒 ДСНС УКРАЇНИ • РЯТУВАЛЬНА ЧАСТИНА 101', '#7f1d1d', '#facc15', '#ef4444');
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(16.0, 2.2),
    new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
  );
  signMesh.position.set(0, height + 1.2, depth / 2 + 0.2);
  dsnsGroup.add(signMesh);

  // Flashing Emergency Strobe Beacon atop DSNS Station
  const beaconGroup = new THREE.Group();
  beaconGroup.position.set(0, height + 2.5, depth / 2);
  dsnsGroup.add(beaconGroup);

  const beaconLight = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.8, 16),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 2.0 })
  );
  beaconGroup.add(beaconLight);

  // Glowing ground trigger ring
  const ringGeo = new THREE.RingGeometry(1.5, 2.8, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
  const groundRing = new THREE.Mesh(ringGeo, ringMat);
  groundRing.rotation.x = -Math.PI / 2;
  groundRing.position.set(0, 0.05, depth / 2 + 2.2);
  dsnsGroup.add(groundRing);

  // World coordinates of entrance
  const forwardX = Math.sin(rotY) * (depth / 2 + 2.5);
  const forwardZ = Math.cos(rotY) * (depth / 2 + 2.5);

  return {
    id,
    name,
    entranceX: x + forwardX,
    entranceZ: z + forwardZ,
    radius: 4.6
  };
}

// 7. Helper to build Armed Forces of Ukraine (ЗСУ) Military Base & Frontline Checkpoint
export function buildMilitaryBase(scene, config, colliders) {
  const { id, name, x, z, rotY = 0 } = config;
  const baseGroup = new THREE.Group();
  baseGroup.position.set(x, 0, z);
  baseGroup.rotation.y = rotY;
  scene.add(baseGroup);

  const width = 28;
  const depth = 22;
  const height = 7.5;

  // Materials
  const camoWallMat = new THREE.MeshStandardMaterial({ color: 0x2e3828, roughness: 0.85 }); // Tactical military olive
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.9 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.6 });

  // 1. HQ Main Building (Bunker / Command Post)
  const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), camoWallMat);
  building.position.y = height / 2;
  building.castShadow = true;
  building.receiveShadow = true;
  baseGroup.add(building);

  colliders.push({
    type: 'box',
    x,
    z,
    width: width + 1,
    depth: depth + 1,
    name
  });

  // 2. Camouflage Roof Watchtower & Ukrainian Flag
  const tower = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 6), concreteMat);
  tower.position.set(0, height + 2, 0);
  baseGroup.add(tower);

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 6.0, 8),
    new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8 })
  );
  pole.position.set(0, height + 7.0, 0);
  baseGroup.add(pole);

  const flagTop = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 0.75),
    new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide })
  );
  flagTop.position.set(1.2, height + 9.6, 0);
  baseGroup.add(flagTop);

  const flagBottom = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 0.75),
    new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
  );
  flagBottom.position.set(1.2, height + 8.85, 0);
  baseGroup.add(flagBottom);

  // 3. HQ Signboard
  const signTex = createStoreSign('🪖 ЗБРОЙНІ СИЛИ УКРАЇНИ • ШТАБ ППО ТА ТРО', '#1c2419', '#4ade80', '#22c55e');
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(16.0, 2.2),
    new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
  );
  signMesh.position.set(0, height - 0.5, depth / 2 + 0.2);
  baseGroup.add(signMesh);

  // 4. Entrance door & canopy
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.3, 2.5), trimMat);
  canopy.position.set(0, 3.8, depth / 2 + 1.25);
  baseGroup.add(canopy);

  // Entrance trigger ring (Emerald green)
  const ringGeo = new THREE.RingGeometry(1.4, 2.6, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide });
  const groundRing = new THREE.Mesh(ringGeo, ringMat);
  groundRing.rotation.x = -Math.PI / 2;
  groundRing.position.set(0, 0.05, depth / 2 + 2.2);
  baseGroup.add(groundRing);

  // 5. FRONTLINE CHECKPOINT & FORTIFICATIONS (Блокпост передової)
  // Sandbags along entrance and perimeter
  const sandbagMat = new THREE.MeshStandardMaterial({ color: 0xa18249, roughness: 0.9 });
  for (let sx of [-6, -4, 4, 6]) {
    const bag1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.8), sandbagMat);
    bag1.position.set(sx, 0.25, depth / 2 + 3.0);
    baseGroup.add(bag1);
    const bag2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 0.7), sandbagMat);
    bag2.position.set(sx, 0.7, depth / 2 + 3.0);
    baseGroup.add(bag2);
  }

  // Anti-tank hedgehogs (Протитанкові їжаки)
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.85, roughness: 0.4 });
  const spawnHedgehog = (hx, hz) => {
    const hhGroup = new THREE.Group();
    hhGroup.position.set(hx, 0.7, hz);
    for (let rot of [0, Math.PI / 3, -Math.PI / 3]) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.12), steelMat);
      beam.rotation.x = rot;
      beam.rotation.z = rot;
      hhGroup.add(beam);
    }
    baseGroup.add(hhGroup);
  };
  spawnHedgehog(-9, depth / 2 + 5);
  spawnHedgehog(-13, depth / 2 + 5);
  spawnHedgehog(9, depth / 2 + 5);
  spawnHedgehog(13, depth / 2 + 5);

  // Concrete road barrier (Блок ФБС)
  const fbsMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
  const fbsBarrier = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.1, 0.8), fbsMat);
  fbsBarrier.position.set(8.5, 0.55, depth / 2 + 4.0);
  baseGroup.add(fbsBarrier);

  // ================= 6. ZSU MAIN BATTLE TANK T-64BV =================
  const tankLocalX = -width / 2 - 8.5;
  const tankLocalZ = depth / 2 - 2.0;
  const tankWorldX = x + Math.cos(rotY) * tankLocalX + Math.sin(rotY) * tankLocalZ;
  const tankWorldZ = z - Math.sin(rotY) * tankLocalX + Math.cos(rotY) * tankLocalZ;

  // Tank Parking Pad
  const tankPad = new THREE.Mesh(
    new THREE.PlaneGeometry(9.0, 5.5),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 })
  );
  tankPad.rotation.x = -Math.PI / 2;
  tankPad.position.set(tankLocalX, 0.02, tankLocalZ);
  baseGroup.add(tankPad);

  const tankSignTex = createStoreSign('🛡️ ТАНК ЗСУ Т-64БВ • ТІЛЬКИ ДЛЯ АРМІЇ', '#1e293b', '#fbbf24', '#f59e0b');
  const tankSignMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(8.0, 1.2),
    new THREE.MeshBasicMaterial({ map: tankSignTex })
  );
  tankSignMesh.rotation.x = -Math.PI / 2;
  tankSignMesh.position.set(tankLocalX, 0.03, tankLocalZ + 3.0);
  baseGroup.add(tankSignMesh);

  // 3D Model: T-64BV Tank
  const tankGroup = new THREE.Group();
  tankGroup.position.set(tankLocalX, 0, tankLocalZ);
  tankGroup.rotation.y = Math.PI / 2;
  baseGroup.add(tankGroup);

  const tankArmorMat = new THREE.MeshStandardMaterial({ color: 0x36452f, roughness: 0.75, metalness: 0.3 }); // Olive camo
  const tankTrackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85, metalness: 0.5 }); // Dark steel tracks
  const whiteDecalMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // ZSU Cross

  // Hull
  const tankHull = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.95, 6.2), tankArmorMat);
  tankHull.position.y = 0.85;
  tankHull.castShadow = true;
  tankGroup.add(tankHull);

  // Glacis slope
  const glacis = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 1.8), tankArmorMat);
  glacis.position.set(0, 0.9, 2.4);
  glacis.rotation.x = -0.35;
  tankGroup.add(glacis);

  // Left & Right Tracks
  for (let trackX of [-1.55, 1.55]) {
    const track = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 6.4), tankTrackMat);
    track.position.set(trackX, 0.42, 0);
    tankGroup.add(track);

    // Road wheels
    for (let wz = -2.4; wz <= 2.4; wz += 0.96) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.58, 12), tankArmorMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(trackX, 0.38, wz);
      tankGroup.add(wheel);
    }
  }

  // Turret (Low-profile dome turret with ERA)
  const turret = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.6, 0.75, 12), tankArmorMat);
  turret.position.set(0, 1.65, -0.2);
  turret.castShadow = true;
  tankGroup.add(turret);

  // 125mm Smoothbore Cannon Barrel (2A46)
  const cannonBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 4.4, 12), tankArmorMat);
  cannonBarrel.rotation.x = Math.PI / 2;
  cannonBarrel.position.set(0, 1.7, 2.5);
  tankGroup.add(cannonBarrel);

  // Thermal sleeve / bore evacuator (ежектор гармати)
  const evacuator = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.7, 12), tankArmorMat);
  evacuator.rotation.x = Math.PI / 2;
  evacuator.position.set(0, 1.7, 2.2);
  tankGroup.add(evacuator);

  // ZSU White Cross on Turret
  const crossH = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.14), whiteDecalMat);
  crossH.position.set(1.4, 1.75, -0.2);
  crossH.rotation.y = Math.PI / 2;
  tankGroup.add(crossH);
  const crossV = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.5), whiteDecalMat);
  crossV.position.set(1.4, 1.75, -0.2);
  crossV.rotation.y = Math.PI / 2;
  tankGroup.add(crossV);

  // Commander machine gun (NSVT 12.7mm on cupola)
  const mg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), tankTrackMat);
  mg.rotation.x = Math.PI / 2;
  mg.position.set(0.65, 2.2, -0.1);
  tankGroup.add(mg);

  // ================= 7. ZSU ARMORED COMBAT VEHICLE «KOZAK-2M» =================
  const carLocalX = width / 2 + 8.5;
  const carLocalZ = depth / 2 - 2.0;
  const carWorldX = x + Math.cos(rotY) * carLocalX + Math.sin(rotY) * carLocalZ;
  const carWorldZ = z - Math.sin(rotY) * carLocalX + Math.cos(rotY) * carLocalZ;

  // Vehicle Parking Pad
  const carPad = new THREE.Mesh(
    new THREE.PlaneGeometry(8.0, 5.0),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 })
  );
  carPad.rotation.x = -Math.PI / 2;
  carPad.position.set(carLocalX, 0.02, carLocalZ);
  baseGroup.add(carPad);

  const carSignTex = createStoreSign('⚡ БРОНЕВИК ППО «КОЗАК-2М» • ТІЛЬКИ ЗСУ', '#1e293b', '#38bdf8', '#0284c7');
  const carSignMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(7.5, 1.2),
    new THREE.MeshBasicMaterial({ map: carSignTex })
  );
  carSignMesh.rotation.x = -Math.PI / 2;
  carSignMesh.position.set(carLocalX, 0.03, carLocalZ + 2.8);
  baseGroup.add(carSignMesh);

  // 3D Model: Kozak-2M Combat Armor
  const kozakGroup = new THREE.Group();
  kozakGroup.position.set(carLocalX, 0, carLocalZ);
  kozakGroup.rotation.y = -Math.PI / 2;
  baseGroup.add(kozakGroup);

  const kozakArmorMat = new THREE.MeshStandardMaterial({ color: 0x33442d, roughness: 0.7 });
  const kozakWindowMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, roughness: 0.1, transmission: 0.5, transparent: true });

  // High V-hull armored chassis
  const kozakHull = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.3, 5.2), kozakArmorMat);
  kozakHull.position.y = 1.15;
  kozakGroup.add(kozakHull);

  // Armored windshield
  const kozakGlass = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.55, 0.1), kozakWindowMat);
  kozakGlass.position.set(0, 1.45, 1.4);
  kozakGlass.rotation.x = -0.3;
  kozakGroup.add(kozakGlass);

  // 4 Big All-Terrain Military Wheels
  for (let wx of [-1.15, 1.15]) {
    for (let wz of [-1.5, 1.5]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.42, 14), tankTrackMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, 0.48, wz);
      kozakGroup.add(w);
    }
  }

  // Roof Anti-Air Gun Turret (ДШК / Зенітний кулемет)
  const turretBase = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.35, 12), tankTrackMat);
  turretBase.position.set(0, 1.95, -0.4);
  kozakGroup.add(turretBase);

  const aaGuns = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 1.8), tankTrackMat);
  aaGuns.position.set(0, 2.2, 0.2);
  aaGuns.rotation.x = -0.25; // Aimed up at sky
  kozakGroup.add(aaGuns);

  // White ZSU Cross on Doors
  const kozakCross = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.45), whiteDecalMat);
  kozakCross.position.set(1.16, 1.15, 0);
  kozakCross.rotation.y = Math.PI / 2;
  kozakGroup.add(kozakCross);

  // World coordinates of Base entrance
  const forwardX = Math.sin(rotY) * (depth / 2 + 2.5);
  const forwardZ = Math.cos(rotY) * (depth / 2 + 2.5);

  return {
    id,
    name,
    entranceX: x + forwardX,
    entranceZ: z + forwardZ,
    radius: 12.0,
    tank: {
      x: tankWorldX,
      z: tankWorldZ,
      yaw: rotY + Math.PI / 2,
      radius: 8.0,
      group: tankGroup
    },
    militaryCar: {
      x: carWorldX,
      z: carWorldZ,
      yaw: rotY - Math.PI / 2,
      radius: 8.0,
      group: kozakGroup
    }
  };
}

/**
 * Initializes and populates supermarkets, major parking hubs, buyable housing,
 * police department, gun shops, DSNS emergency stations and Military Base for city maps.
 */
export function setupCityAmenities(scene, cityId, colliders) {
  const supermarkets = [];
  const parkingHubs = [];
  const housingProperties = [];
  const gunShops = [];
  const dsnsStations = [];
  let policeStation = null;
  let militaryBase = null;

  if (cityId === 'kyiv') {
    // 1. Сільпо at Maidan Nezalezhnosti (ТРЦ «Глобус»)
    supermarkets.push(buildSupermarket(scene, {
      id: 'silpo_kyiv_maidan',
      name: '«Сільпо» (Майдан Незалежності • ТРЦ Globus)',
      brand: 'silpo',
      x: -28,
      z: 15,
      rotY: Math.PI / 2
    }, colliders));

    // 2. АТБ-Маркет on Podil (Поштова площа)
    supermarkets.push(buildSupermarket(scene, {
      id: 'atb_kyiv_podil',
      name: '«АТБ-Маркет» (Поділ • Поштова площа)',
      brand: 'atb',
      x: 62,
      z: -300,
      rotY: 0
    }, colliders));

    // 3. 🏢 Квартира «Хрещатик Гранд Люкс» (Центр Києва, вид на Майдан) - ₴100
    housingProperties.push(buildHousingProperty(scene, {
      id: 'kyiv_apartment',
      type: 'apartment',
      title: 'Квартира «Хрещатик Гранд Люкс»',
      address: 'вул. Хрещатик, 24 (вид на Майдан)',
      price: 100,
      desc: 'Преміальні апартаменти в історичному центрі столиці. Панорамні вікна на Майдан Незалежності, класичні високі стелі, мармуровий під\'їзд, консьєрж.',
      x: 28,
      z: -45,
      rotY: -Math.PI / 2
    }, colliders));

    // 4. 🏡 Маєток «Подільська Резиденція» (Приватний будинок) - ₴100
    housingProperties.push(buildHousingProperty(scene, {
      id: 'kyiv_estate',
      type: 'house',
      title: 'Маєток «Подільська Резиденція»',
      address: 'Поділ • вул. Воздвиженська, 1',
      price: 100,
      desc: 'Розкішна двоповерхова міська садиба в колоритному історичному стилі Подолу біля Андріївського узвозу. Власне затишне подвір\'я, тераса та гараж.',
      x: 45,
      z: -260,
      rotY: 0
    }, colliders));

    // 5. Police Station in Kyiv (вул. Володимирська, 15 біля Софійської площі)
    policeStation = buildPoliceStation(scene, {
      id: 'police_station_kyiv',
      name: 'Головне Управління Національної Поліції у місті Києві',
      x: -65,
      z: -90,
      rotY: Math.PI / 2
    }, colliders);

    // 6. Central Parking at Maidan Nezalezhnosti
    parkingHubs.push(buildParkingLot(scene, {
      name: 'Центральний паркінг «Майдан Незалежності»',
      x: 28,
      z: -15,
      width: 28,
      depth: 16,
      spacesCount: 10,
      rotY: 0
    }, colliders));

    // 7. Parking at Poshtova Square / River Port
    parkingHubs.push(buildParkingLot(scene, {
      name: 'Паркінг «Поштова площа • Річковий вокзал»',
      x: 85,
      z: -345,
      width: 32,
      depth: 18,
      spacesCount: 12,
      rotY: 0
    }, colliders));

    // 8. Tactical Gun & Weapon Shop in Kyiv (вул. Хрещатик)
    gunShops.push(buildGunShop(scene, {
      id: 'gun_shop_kyiv',
      name: 'Магазин Зброї «ЗБРОЯ КИЇВ» (вул. Хрещатик)',
      x: -28,
      z: 85,
      rotY: Math.PI / 2
    }, colliders));

    // 9. DSNS Emergency Rescue Station 101 in Kyiv (Поділ)
    dsnsStations.push(buildDsnsStation(scene, {
      id: 'dsns_kyiv',
      name: '1-ша Державна пожежно-рятувальна частина ДСНС м. Києва',
      x: 75,
      z: -220,
      rotY: -Math.PI / 2
    }, colliders));

    // 10. Armed Forces of Ukraine (ЗСУ) Military Base & Frontline Checkpoint (Київ)
    militaryBase = buildMilitaryBase(scene, {
      id: 'military_base_kyiv',
      name: 'Штаб ЗСУ • Оборонний рубіж столиці',
      x: -110,
      z: -160,
      rotY: Math.PI / 2
    }, colliders);
  } else if (cityId === 'zaporizhzhia') {
    // 1. АТБ-Маркет on Soborny Avenue near Festivalska Square (X: 148, Z: -35)
    supermarkets.push(buildSupermarket(scene, {
      id: 'atb_soborny',
      name: '«АТБ-Маркет» (просп. Соборний)',
      brand: 'atb',
      x: 148,
      z: -35,
      rotY: -Math.PI / 2
    }, colliders));

    // 2. Сільпо on Shevchenko Boulevard near Lovers' Clock (X: 75, Z: 40)
    supermarkets.push(buildSupermarket(scene, {
      id: 'silpo_shevchenko',
      name: '«Сільпо» (Бульвар Шевченка)',
      brand: 'silpo',
      x: 75,
      z: 40,
      rotY: 0
    }, colliders));

    // 3. 🏢 Квартира «Дніпровська Панорама» (просп. Соборний) - ₴100
    housingProperties.push(buildHousingProperty(scene, {
      id: 'zaporizhzhia_apartment',
      type: 'apartment',
      title: 'Квартира «Дніпровська Панорама»',
      address: 'просп. Соборний, 142',
      price: 100,
      desc: 'Преміальні апартаменти в новобудові в центрі Запоріжжя. Панорамний балкон з видом на проспект та Дніпро, дизайнерський ремонт, швидкісний інтернет.',
      x: 148,
      z: 120,
      rotY: -Math.PI / 2
    }, colliders));

    // 4. 🏡 Козацький Маєток на Хортиці (Приватний будинок) - ₴100
    housingProperties.push(buildHousingProperty(scene, {
      id: 'zaporizhzhia_estate',
      type: 'house',
      title: 'Козацький Маєток на Хортиці',
      address: 'Острів Хортиця • біля Запорозької Січі, 1',
      price: 100,
      desc: 'Двоповерхова дерев\'яна садиба в заповідному куточку острова Хортиця. Власне подвір\'я, тераса, зона барбекю, тиша та свіже дніпровське повітря.',
      x: -55,
      z: 75,
      rotY: 0
    }, colliders));

    // 5. Police Station in Zaporizhzhia (Soborny Avenue East side • 100% dry land)
    policeStation = buildPoliceStation(scene, {
      id: 'police_station_zaporizhzhia',
      name: 'Головне Управління Національної Поліції в Запорізькій області',
      x: 148,
      z: 25,
      rotY: -Math.PI / 2
    }, colliders);

    // 6. Huge Tourist Parking Lot at Zaporozhian Sich (Хортиця)
    parkingHubs.push(buildParkingLot(scene, {
      name: 'Туристичний паркінг «Запорозька Січ»',
      x: -85,
      z: 75,
      width: 32,
      depth: 18,
      spacesCount: 12,
      rotY: 0
    }, colliders));

    // 7. Central Parking Lot at Festivalska Square
    parkingHubs.push(buildParkingLot(scene, {
      name: 'Центральний паркінг «Площа Фестивальна»',
      x: 155,
      z: -140,
      width: 36,
      depth: 20,
      spacesCount: 14,
      rotY: 0
    }, colliders));

    // 8. Tactical Gun & Weapon Shop in Zaporizhzhia (просп. Соборний)
    gunShops.push(buildGunShop(scene, {
      id: 'gun_shop_zaporizhzhia',
      name: 'Магазин Зброї «КАЛІБР» (просп. Соборний)',
      x: 148,
      z: -75,
      rotY: -Math.PI / 2
    }, colliders));

    // 9. DSNS Emergency Rescue Station 101 in Zaporizhzhia (просп. Соборний)
    dsnsStations.push(buildDsnsStation(scene, {
      id: 'dsns_zaporizhzhia',
      name: '1-ша Державна пожежно-рятувальна частина ДСНС України',
      x: 148,
      z: 90,
      rotY: -Math.PI / 2
    }, colliders));

    // 10. Armed Forces of Ukraine (ЗСУ) Military Base & Frontline Checkpoint (Запоріжжя)
    militaryBase = buildMilitaryBase(scene, {
      id: 'military_base_zaporizhzhia',
      name: 'Штаб ЗСУ • Оборонний сектор Запоріжжя',
      x: 148,
      z: -180,
      rotY: -Math.PI / 2
    }, colliders);
  } else if (cityId === 'tokmak') {
    // Tokmak Amenities (Місто Токмак, Запорізька область)
    // 1. АТБ-Маркет near City Center
    supermarkets.push(buildSupermarket(scene, {
      id: 'atb_tokmak_center',
      name: '«АТБ-Маркет» (Центральний • Токмак)',
      brand: 'atb',
      x: 88,
      z: 35,
      rotY: -Math.PI / 2
    }, colliders));

    // 2. 🏡 Затишний Будинок «Токмацька Садиба» - ₴100
    housingProperties.push(buildHousingProperty(scene, {
      id: 'tokmak_estate',
      type: 'house',
      title: 'Садиба «Токмацький Затишок»',
      address: 'вул. Привокзальна, 12 • Токмак',
      price: 100,
      desc: 'Затишний цегляний будинок у мальовничому Токмаку біля річки. Просторі кімнати, яблуневий сад, гараж для авто та тихе подвір\'я.',
      x: 88,
      z: -70,
      rotY: -Math.PI / 2
    }, colliders));

    // 3. Police Station in Tokmak
    policeStation = buildPoliceStation(scene, {
      id: 'police_station_tokmak',
      name: 'Токмацьке відділення поліції ГУНП в Запорізькій області',
      x: 25,
      z: 60,
      rotY: Math.PI / 2
    }, colliders);

    // 4. Armed Forces of Ukraine (ЗСУ) Base / Штаб Оборони Токмака
    militaryBase = buildMilitaryBase(scene, {
      id: 'military_base_tokmak',
      name: 'Штаб Оборони Токмака • ЗСУ',
      x: -180,
      z: -45,
      rotY: 0
    }, colliders);

    // 5. Central Parking Lot at City Hall
    parkingHubs.push(buildParkingLot(scene, {
      name: 'Центральний паркінг (Міськрада Токмака)',
      x: 60,
      z: 25,
      width: 32,
      depth: 18,
      spacesCount: 12,
      rotY: 0
    }, colliders));

    // 6. Railway Station Parking Lot
    parkingHubs.push(buildParkingLot(scene, {
      name: 'Паркінг «Вокзал Великий Токмак»',
      x: 140,
      z: -75,
      width: 34,
      depth: 18,
      spacesCount: 12,
      rotY: 0
    }, colliders));
  } else {
    // Vinnytsia Amenities
    // 1. АТБ-Маркет near European Square (X: 35, Z: -38)
    supermarkets.push(buildSupermarket(scene, {
      id: 'atb_vinnytsia_center',
      name: '«АТБ-Маркет» (Центральний)',
      brand: 'atb',
      x: 35,
      z: -38,
      rotY: -Math.PI / 2
    }, colliders));

    // 2. Сільпо on Prospekt Kotsyubynskoho / Zamostya (X: 35, Z: 80)
    supermarkets.push(buildSupermarket(scene, {
      id: 'silpo_vinnytsia_waterfront',
      name: '«Сільпо» (Замостя • просп. Коцюбинського)',
      brand: 'silpo',
      x: 35,
      z: 80,
      rotY: -Math.PI / 2
    }, colliders));

    // 3. 🏢 Квартира «Вінницький Люкс» (Центр, Європейська площа) - ₴100
    housingProperties.push(buildHousingProperty(scene, {
      id: 'vinnytsia_apartment',
      type: 'apartment',
      title: 'Квартира «Вінницький Люкс»',
      address: 'Європейська площа • вул. Соборна, 4',
      price: 100,
      desc: '2-кімнатні апартаменти в престижному ЖК біля Вежі Артинова. Панорамні вікна з видом на центр міста, затишна спальня, індивідуальне опалення.',
      x: -35,
      z: -45,
      rotY: Math.PI / 2
    }, colliders));

    // 4. 🏡 Котедж «Садиба над Бугом» (Приватний будинок) - ₴100
    housingProperties.push(buildHousingProperty(scene, {
      id: 'vinnytsia_cottage',
      type: 'house',
      title: 'Котедж «Садиба над Бугом»',
      address: 'Набережна Південного Бугу, 12',
      price: 100,
      desc: 'Затишний двоповерховий котедж з каміном на набережній річки Південний Буг. Особистий сад, паркан, гараж/паркомісце та неймовірний краєвид на фонтан.',
      x: 65,
      z: -15,
      rotY: 0
    }, colliders));

    // 5. Police Station in Vinnytsia (вул. Театральна, 10 • Central district on solid dry land)
    policeStation = buildPoliceStation(scene, {
      id: 'police_station_vinnytsia',
      name: 'Головне Управління Національної Поліції у Вінницькій області',
      x: 110,
      z: -35,
      rotY: 0
    }, colliders);

    // 6. Central Parking at European Square near Vinnytsia Tower
    parkingHubs.push(buildParkingLot(scene, {
      name: 'Паркінг «Європейська площа • Вежа»',
      x: -18,
      z: -32,
      width: 26,
      depth: 14,
      spacesCount: 8,
      rotY: 0
    }, colliders));

    // 7. Parking at Roshen Fountain Quay
    parkingHubs.push(buildParkingLot(scene, {
      name: 'Паркінг «Фонтан Roshen»',
      x: 35,
      z: 32,
      width: 30,
      depth: 16,
      spacesCount: 10,
      rotY: 0
    }, colliders));

    // 8. Tactical Gun & Weapon Shop in Vinnytsia (вул. Театральна)
    gunShops.push(buildGunShop(scene, {
      id: 'gun_shop_vinnytsia',
      name: 'Магазин Зброї «КАЛІБР» (вул. Театральна)',
      x: 65,
      z: -35,
      rotY: 0
    }, colliders));

    // 9. DSNS Emergency Rescue Station 101 in Vinnytsia (вул. Київська • Замостя)
    dsnsStations.push(buildDsnsStation(scene, {
      id: 'dsns_vinnytsia',
      name: '2-га Державна пожежно-рятувальна частина ДСНС України (вул. Київська)',
      x: -60,
      z: 80,
      rotY: Math.PI
    }, colliders));

    // 10. Armed Forces of Ukraine (ЗСУ) Military Base & Frontline Checkpoint (Вінниця)
    militaryBase = buildMilitaryBase(scene, {
      id: 'military_base_vinnytsia',
      name: 'Штаб ЗСУ • Оборонний сектор Вінниці',
      x: 110,
      z: 80,
      rotY: 0
    }, colliders);
  }

  return {
    supermarkets,
    parkingHubs,
    housingProperties,
    policeStation,
    gunShops,
    dsnsStations,
    militaryBase
  };
}
