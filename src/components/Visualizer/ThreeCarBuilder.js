import * as THREE from 'three';
import {
  createCarbonTexture,
  createStarlightTexture,
  createLicensePlateTexture,
  createStudioEnvTexture,
  createBrakeRotorTexture,
  createTireSidewallTexture,
  createDashboardScreenTexture
} from '../../utils/textureGenerators';
import { TINT_OPTIONS, UNDERGLOW_COLORS } from '../../types/car';

/**
 * Builds and updates a photorealistic 3D car in Three.js with realistic automotive geometry
 */
export class ThreeCarBuilder {
  constructor(scene) {
    this.scene = scene;
    this.carGroup = new THREE.Group();
    this.scene.add(this.carGroup);

    // Dynamic elements
    this.bodyMeshes = [];
    this.secondaryBodyMeshes = [];
    this.glassMeshes = [];
    this.doorLeftPivot = null;
    this.doorRightPivot = null;
    this.headlightSpots = [];
    this.wheels = [];
    this.licensePlates = [];
    this.underglowLight = null;

    // Reusable Textures
    this.carbonTexture = createCarbonTexture();
    this.starlightTexture = createStarlightTexture();
    this.brakeRotorTexture = createBrakeRotorTexture();
    this.tireSidewallTexture = createTireSidewallTexture();
    this.dashboardTexture = createDashboardScreenTexture();
    this.envTexture = createStudioEnvTexture('neon');

    // Reusable Materials
    this.tireMaterial = new THREE.MeshStandardMaterial({
      color: 0x14161a,
      roughness: 0.9,
      metalness: 0.05
    });

    this.tireSidewallMaterial = new THREE.MeshStandardMaterial({
      color: 0x181a1f,
      map: this.tireSidewallTexture,
      roughness: 0.75,
      metalness: 0.1
    });

    this.rimMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd4d4d8,
      roughness: 0.18,
      metalness: 0.92,
      clearcoat: 0.8,
      envMap: this.envTexture
    });

    this.brakeRotorMaterial = new THREE.MeshStandardMaterial({
      map: this.brakeRotorTexture,
      roughness: 0.25,
      metalness: 0.9,
      envMap: this.envTexture
    });

    this.caliperMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdc2626,
      roughness: 0.2,
      metalness: 0.6,
      clearcoat: 1.0,
      envMap: this.envTexture
    });

    this.interiorAlcantara = new THREE.MeshStandardMaterial({
      color: 0x11141c,
      roughness: 0.85,
      metalness: 0.1
    });

    this.chromeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.08,
      metalness: 0.98,
      clearcoat: 1.0,
      envMap: this.envTexture
    });
  }

  setTheme(theme) {
    this.envTexture = createStudioEnvTexture(theme);
    this.rimMaterial.envMap = this.envTexture;
    this.brakeRotorMaterial.envMap = this.envTexture;
    this.chromeMaterial.envMap = this.envTexture;
    if (this.currentConfig) {
      this.updateMaterials(this.currentConfig);
    }
  }

  buildCar(carConfig) {
    this.currentConfig = carConfig;

    while (this.carGroup.children.length > 0) {
      const obj = this.carGroup.children[0];
      this.carGroup.remove(obj);
    }

    this.bodyMeshes = [];
    this.secondaryBodyMeshes = [];
    this.glassMeshes = [];
    this.wheels = [];
    this.headlightSpots = [];
    this.licensePlates = [];

    const { modelId } = carConfig;

    if (modelId === 'bus') {
      this.buildBus(carConfig);
    } else if (modelId === 'cybertruck') {
      this.buildCybertruck(carConfig);
    } else if (modelId === 'tesla') {
      this.buildTesla(carConfig);
    } else if (modelId === 'gwagon') {
      this.buildGWagon(carConfig);
    } else if (modelId === 'audi_rs6') {
      this.buildAudiRS6(carConfig);
    } else if (modelId === 'porsche') {
      this.buildPorsche(carConfig);
    } else if (modelId === 'lambo') {
      this.buildLamborghini(carConfig);
    } else if (modelId === 'ferrari') {
      this.buildFerrari(carConfig);
    } else if (modelId === 'gtr') {
      this.buildGTR(carConfig);
    } else if (modelId === 'mustang') {
      this.buildMustang(carConfig);
    } else if (modelId === 'bugatti') {
      this.buildBugatti(carConfig);
    } else if (modelId === 'zeekr') {
      this.buildZeekr(carConfig);
    } else if (modelId === 'zaporozhets') {
      this.buildZaporozhets(carConfig);
    } else if (modelId === 'supercar') {
      this.buildSupercar(carConfig);
    } else {
      this.buildBMW(carConfig);
    }

    // Underglow lighting
    this.setupUnderglow(carConfig.underglowId);

    // Apply finishes & colors
    this.updateMaterials(carConfig);

    // Apply door mechanisms
    this.updateDoors(carConfig.doorId, carConfig.doorsOpen);

    // Update headlights
    this.updateHeadlights(carConfig.headlightsOn);
  }

  // ===================== BMW M4 COMPETITION =====================
  buildBMW(carConfig) {
    const car = new THREE.Group();
    this.carGroup.add(car);
    const bodyMat = this.createBodyMaterial(carConfig);

    // 1. Lower Sculpted Chassis with Flared Fenders
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.45, 4.5), bodyMat);
    lowerBody.position.y = 0.52;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    car.add(lowerBody);
    this.bodyMeshes.push(lowerBody);

    // Flared Front Wheel Arches
    for (let x of [-1.02, 1.02]) {
      const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.52, 0.16, 24, 1, false, 0, Math.PI), bodyMat);
      arch.rotation.z = Math.PI / 2;
      arch.position.set(x, 0.45, 1.4);
      car.add(arch);
      this.bodyMeshes.push(arch);

      // Flared Rear Wheel Arches (Widebody Haunches)
      const rearArch = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.54, 0.18, 24, 1, false, 0, Math.PI), bodyMat);
      rearArch.rotation.z = Math.PI / 2;
      rearArch.position.set(x, 0.46, -1.4);
      car.add(rearArch);
      this.bodyMeshes.push(rearArch);
    }

    // 2. Hood with sculpted aerodynamic power-dome
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.14, 1.6), bodyMat);
    hood.position.set(0, 0.74, 1.35);
    hood.rotation.x = -0.06;
    car.add(hood);
    this.bodyMeshes.push(hood);

    // Power-dome ridge lines
    for (let x of [-0.3, 0.3]) {
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 1.3), bodyMat);
      ridge.position.set(x, 0.81, 1.35);
      ridge.rotation.x = -0.06;
      car.add(ridge);
      this.bodyMeshes.push(ridge);
    }

    // 3. Front M-Bumper, Splitter & Famous Twin Vertical Kidney Grilles
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.38, 0.5), bodyMat);
    bumper.position.set(0, 0.38, 2.2);
    car.add(bumper);
    this.bodyMeshes.push(bumper);

    // Carbon fiber front splitter
    const splitter = new THREE.Mesh(
      new THREE.BoxGeometry(1.96, 0.04, 0.4),
      new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.3, metalness: 0.4 })
    );
    splitter.position.set(0, 0.2, 2.3);
    car.add(splitter);

    // Iconic Twin Vertical Kidney Grilles with horizontal slats
    const grilleFrameMat = new THREE.MeshPhysicalMaterial({ color: 0x090d16, roughness: 0.2, metalness: 0.8, clearcoat: 0.8 });
    for (let x of [-0.2, 0.2]) {
      const grille = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.46, 0.06), grilleFrameMat);
      grille.position.set(x, 0.46, 2.46);
      car.add(grille);

      // Slats inside grille
      for (let y = -0.16; y <= 0.16; y += 0.07) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.015, 0.04), this.chromeMaterial);
        slat.position.set(x, 0.46 + y, 2.48);
        car.add(slat);
      }
    }

    // 4. Rear Trunk Lid & Integrated Lip Spoiler
    const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.15, 0.85), bodyMat);
    trunk.position.set(0, 0.74, -1.8);
    car.add(trunk);
    this.bodyMeshes.push(trunk);

    const spoiler = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.04, 0.12),
      new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.3 })
    );
    spoiler.position.set(0, 0.83, -2.2);
    car.add(spoiler);

    // 5. Rear Diffuser & Quad Exhaust Pipes
    const diffuser = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.22, 0.35),
      new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.4 })
    );
    diffuser.position.set(0, 0.28, -2.18);
    car.add(diffuser);

    for (let x of [-0.65, -0.48, 0.48, 0.65]) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.22, 24), this.chromeMaterial);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(x, 0.28, -2.35);
      car.add(pipe);
    }

    // 6. Cabin, Windows, Doors & Roof
    this.buildCockpitAndDoors(car, carConfig, {
      width: 1.68,
      height: 0.68,
      length: 2.15,
      yPos: 1.05,
      zPos: -0.2,
      windshieldSlope: 0.48,
      rearSlope: -0.48
    });

    // 7. Advanced Headlights & Taillights
    this.addDetailedHeadlights(car, [
      { x: -0.74, y: 0.58, z: 2.3 },
      { x: 0.74, y: 0.58, z: 2.3 }
    ], 'bmw');

    this.addDetailedTaillights(car, [
      { x: -0.76, y: 0.66, z: -2.24 },
      { x: 0.76, y: 0.66, z: -2.24 }
    ], 'bmw');

    // 8. Wheels & Brakes
    this.addSportWheels(car, 0.98, 1.4, -1.4, 0.38, 'bmw');

    // 9. License Plates
    this.addLicensePlates(car, carConfig.licensePlate, 2.46, -2.36, 0.4);
  }

  // ===================== TESLA CYBER / MODEL S =====================
  buildTesla(carConfig) {
    const car = new THREE.Group();
    this.carGroup.add(car);
    const bodyMat = this.createBodyMaterial(carConfig);

    // Sleek continuous aerodynamic bullet chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.46, 4.7), bodyMat);
    chassis.position.y = 0.5;
    chassis.castShadow = true;
    car.add(chassis);
    this.bodyMeshes.push(chassis);

    // Minimalist sloping front nose
    const nose = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.18, 1.5), bodyMat);
    nose.position.set(0, 0.65, 1.65);
    nose.rotation.x = -0.12;
    car.add(nose);
    this.bodyMeshes.push(nose);

    // Front full-width Cyber LED Lightbar
    const lightbar = new THREE.Mesh(
      new THREE.BoxGeometry(1.88, 0.04, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x93c5fd, emissiveIntensity: 2.0 })
    );
    lightbar.position.set(0, 0.62, 2.38);
    car.add(lightbar);

    // Rear Full-width LED Lightbar
    const rearBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.82, 0.04, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2.2 })
    );
    rearBar.position.set(0, 0.68, -2.36);
    car.add(rearBar);

    // Cabin
    this.buildCockpitAndDoors(car, carConfig, {
      width: 1.62,
      height: 0.68,
      length: 2.45,
      yPos: 1.02,
      zPos: -0.1,
      windshieldSlope: 0.58,
      rearSlope: -0.42
    });

    this.addDetailedHeadlights(car, [
      { x: -0.72, y: 0.58, z: 2.36 },
      { x: 0.72, y: 0.58, z: 2.36 }
    ], 'tesla');

    this.addSportWheels(car, 0.98, 1.45, -1.45, 0.38, 'tesla');
    this.addLicensePlates(car, carConfig.licensePlate, 2.4, -2.37, 0.4);
  }

  // ===================== TESLA CYBERTRUCK CYBERBEAST =====================
  buildCybertruck(carConfig) {
    const car = new THREE.Group();
    this.carGroup.add(car);
    const bodyMat = this.createBodyMaterial(carConfig);

    // 1. Angular Stainless Steel Exoskeleton Lower Body
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.58, 5.2), bodyMat);
    lowerBody.position.y = 0.58;
    lowerBody.castShadow = true;
    car.add(lowerBody);
    this.bodyMeshes.push(lowerBody);

    // Angular Trapezoidal Wheel Well Cladding (Black trim)
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    for (let x of [-1.08, 1.08]) {
      for (let z of [1.6, -1.6]) {
        const arch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 1.15), trimMat);
        arch.position.set(x, 0.65, z);
        car.add(arch);
      }
    }

    // 2. Cyber Front Facets & Hood
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.36, 0.45), trimMat);
    frontBumper.position.set(0, 0.32, 2.45);
    car.add(frontBumper);

    // Sloping front hood from nose to windshield
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.1, 1.4), bodyMat);
    hood.position.set(0, 0.82, 1.8);
    hood.rotation.x = -0.22;
    car.add(hood);
    this.bodyMeshes.push(hood);

    // Front Razor Blade Full-Width LED Lightbar
    const frontLightbar = new THREE.Mesh(
      new THREE.BoxGeometry(2.04, 0.05, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xe0f2fe, emissiveIntensity: 2.8 })
    );
    frontLightbar.position.set(0, 0.88, 2.48);
    car.add(frontLightbar);

    // 3. Iconic Triangular Peak & Greenhouse (Origami Exoskeleton)
    const glassMat = this.createGlassMaterial(carConfig);

    // Steep front windshield rising to peak at Y = 1.76, Z = -0.1
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.04, 1.95), glassMat);
    windshield.position.set(0, 1.34, 0.72);
    windshield.rotation.x = 0.48;
    car.add(windshield);
    this.glassMeshes.push(windshield);

    // Roof Peak Crossbar
    const roofPeak = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.06, 0.15), bodyMat);
    roofPeak.position.set(0, 1.76, -0.1);
    car.add(roofPeak);
    this.bodyMeshes.push(roofPeak);

    // Sloping rear vault cover from peak to tailgate
    const vault = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.06, 2.55), bodyMat);
    vault.position.set(0, 1.35, -1.3);
    vault.rotation.x = -0.32;
    car.add(vault);
    this.bodyMeshes.push(vault);

    // Bed Tonneau cover (ribbed motorized cover)
    const tonneauMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 });
    const tonneau = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.05, 2.45), tonneauMat);
    tonneau.position.set(0, 0.94, -1.35);
    car.add(tonneau);

    // Triangular Cantilever Sail Panels (Left & Right)
    for (let x of [-0.98, 0.98]) {
      const sail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 2.4), bodyMat);
      sail.position.set(x, 1.25, -1.25);
      sail.rotation.x = -0.28;
      car.add(sail);
      this.bodyMeshes.push(sail);
    }

    // 4. Tailgate & Full-width Red Blade Taillight Bar
    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.42, 0.35), trimMat);
    rearBumper.position.set(0, 0.38, -2.55);
    car.add(rearBumper);

    const rearLightbar = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.04, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2.6 })
    );
    rearLightbar.position.set(0, 0.98, -2.58);
    car.add(rearLightbar);

    // 5. Angular Cyber Mirrors
    for (let x of [-1.15, 1.15]) {
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.16), trimMat);
      mirror.position.set(x, 1.05, 1.35);
      car.add(mirror);
    }

    // 6. Cyber Cockpit Interior
    this.buildCockpitAndDoors(car, carConfig, {
      width: 1.82,
      height: 0.82,
      length: 2.5,
      yPos: 1.2,
      zPos: 0.2,
      windshieldSlope: 0.48,
      rearSlope: -0.32
    });

    // 7. Wheels & Brakes
    this.addSportWheels(car, 1.06, 1.6, -1.6, 0.44, 'cybertruck');

    // 8. License Plate
    this.addLicensePlates(car, carConfig.licensePlate, 2.52, -2.58, 0.42);
  }

  // ===================== BOBER CAMPER BULLI VAN =====================
  buildBus(carConfig) {
    const car = new THREE.Group();
    this.carGroup.add(car);

    const lowerMat = this.createBodyMaterial(carConfig);
    const upperMat = this.createSecondaryBodyMaterial(carConfig);

    // Lower Van body
    const lower = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.75, 4.45), lowerMat);
    lower.position.y = 0.65;
    lower.castShadow = true;
    car.add(lower);
    this.bodyMeshes.push(lower);

    // Rounded retro nose
    const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.97, 0.97, 0.75, 24, 1, false, -Math.PI / 2, Math.PI), lowerMat);
    nose.rotation.y = Math.PI / 2;
    nose.position.set(0, 0.65, 2.22);
    car.add(nose);
    this.bodyMeshes.push(nose);

    // Upper two-tone body
    const upper = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.82, 4.3), upperMat);
    upper.position.set(0, 1.42, -0.05);
    upper.castShadow = true;
    car.add(upper);
    this.secondaryBodyMeshes.push(upper);

    // Polished Chrome Beltline Divider
    const belt = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.05, 4.5), this.chromeMaterial);
    belt.position.y = 1.04;
    car.add(belt);

    // Classic Chrome Bulli V-shape Front Nose Grille & Badge
    const vTrim = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.03, 0.08), this.chromeMaterial);
    vTrim.position.set(0, 0.88, 2.26);
    car.add(vTrim);

    const logo = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 32), this.chromeMaterial);
    logo.rotation.x = Math.PI / 2;
    logo.position.set(0, 0.8, 2.28);
    car.add(logo);

    // Cabin & Large windows
    this.buildCockpitAndDoors(car, carConfig, {
      width: 1.88,
      height: 0.78,
      length: 4.2,
      yPos: 1.48,
      zPos: -0.05,
      windshieldSlope: 0.16,
      rearSlope: -0.08,
      isBus: true
    });

    // Retro Round Headlights
    this.addDetailedHeadlights(car, [
      { x: -0.68, y: 0.76, z: 2.25 },
      { x: 0.68, y: 0.76, z: 2.25 }
    ], 'bus');

    this.addDetailedTaillights(car, [
      { x: -0.85, y: 0.78, z: -2.25 },
      { x: 0.85, y: 0.78, z: -2.25 }
    ], 'bus');

    this.addSportWheels(car, 0.98, 1.3, -1.3, 0.38, 'bus');
    this.addLicensePlates(car, carConfig.licensePlate, 2.26, -2.26, 0.36);
  }

  // ===================== MERCEDES-AMG G 63 (G-WAGON) =====================
  buildGWagon(carConfig) {
    const car = new THREE.Group();
    this.carGroup.add(car);
    const bodyMat = this.createBodyMaterial(carConfig);

    // 1. Elevated Heavy Rugged Chassis (Ground Clearance)
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.74, 4.6), bodyMat);
    lowerBody.position.y = 0.82;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    car.add(lowerBody);
    this.bodyMeshes.push(lowerBody);

    // Iconic G-Class Horizontal Black Protective Side Strips
    const stripMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    for (let x of [-1.04, 1.04]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 4.5), stripMat);
      strip.position.set(x, 0.88, 0);
      car.add(strip);
    }

    // Wide Flared Boxy Wheel Arches
    for (let x of [-1.08, 1.08]) {
      const archFront = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.44, 0.95), bodyMat);
      archFront.position.set(x, 0.72, 1.55);
      car.add(archFront);
      this.bodyMeshes.push(archFront);

      const archRear = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.44, 0.95), bodyMat);
      archRear.position.set(x, 0.72, -1.55);
      car.add(archRear);
      this.bodyMeshes.push(archRear);
    }

    // Metallic Running Boards (Side Steps)
    for (let x of [-1.12, 1.12]) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 2.3), this.chromeMaterial);
      step.position.set(x, 0.46, 0);
      car.add(step);
    }

    // Dual Chrome Side Exhaust Tips on Both Sides (exiting before rear wheels)
    for (let x of [-1.08, 1.08]) {
      for (let z of [-0.68, -0.84]) {
        const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 16), this.chromeMaterial);
        exhaust.rotation.z = Math.PI / 2;
        exhaust.position.set(x, 0.42, z);
        car.add(exhaust);
      }
    }

    // 2. Muscular G-Class Hood with Raised Power-center
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.14, 1.48), bodyMat);
    hood.position.set(0, 1.22, 1.45);
    car.add(hood);
    this.bodyMeshes.push(hood);

    // Iconic Fender-Top Amber Turn Signals (Blister Indicators)
    const amberMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });
    for (let x of [-0.85, 0.85]) {
      const turnSignal = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.22), amberMat);
      turnSignal.position.set(x, 1.28, 1.7);
      car.add(turnSignal);
    }

    // 3. AMG Panamericana Front Grille & Mercedes Star
    const grilleFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.52, 0.08), new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4 }));
    grilleFrame.position.set(0, 0.85, 2.32);
    car.add(grilleFrame);

    // Vertical Panamericana chrome slats
    for (let x = -0.56; x <= 0.56; x += 0.1) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.46, 0.04), this.chromeMaterial);
      slat.position.set(x, 0.85, 2.36);
      car.add(slat);
    }

    // Center Mercedes Star Emblem Ring
    const starRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 16, 24), this.chromeMaterial);
    starRing.position.set(0, 0.85, 2.38);
    car.add(starRing);

    // Front Bumper & Steel Bullbar Skid Plate
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.35, 0.35), bodyMat);
    frontBumper.position.set(0, 0.52, 2.36);
    car.add(frontBumper);
    this.bodyMeshes.push(frontBumper);

    // 4. Rear Full-size External Spare Wheel with Stainless Steel Ring
    const spareTire = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.22, 32), this.tireMaterial);
    spareTire.rotation.x = Math.PI / 2;
    spareTire.position.set(0, 0.95, -2.44);
    car.add(spareTire);

    const spareCover = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.23, 32), this.chromeMaterial);
    spareCover.rotation.x = Math.PI / 2;
    spareCover.position.set(0, 0.95, -2.45);
    car.add(spareCover);

    const starRingSpare = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 16, 24), this.chromeMaterial);
    starRingSpare.position.set(0, 0.95, -2.57);
    car.add(starRingSpare);

    // 5. Upright Boxy Cabin, Windshield & Roof
    this.buildCockpitAndDoors(car, carConfig, {
      width: 1.78,
      height: 0.82,
      length: 2.35,
      yPos: 1.55,
      zPos: -0.1,
      windshieldSlope: 0.2, // Near vertical iconic windshield
      rearSlope: -0.05
    });

    // Circular AMG Halo Headlights
    this.addDetailedHeadlights(car, [
      { x: -0.76, y: 0.86, z: 2.34 },
      { x: 0.76, y: 0.86, z: 2.34 }
    ], 'gwagon');

    // Horizontal Low-mounted LED Taillights
    this.addDetailedTaillights(car, [
      { x: -0.84, y: 0.62, z: -2.34 },
      { x: 0.84, y: 0.62, z: -2.34 }
    ], 'gwagon');

    // Massive 22" AMG Forged Wheels
    this.addSportWheels(car, 1.08, 1.55, -1.55, 0.46, 'gwagon');
    this.addLicensePlates(car, carConfig.licensePlate, 2.52, -2.32, 0.45);
  }

  // ===================== AUDI RS6 AVANT PERFORMANCE =====================
  buildAudiRS6(carConfig) {
    const car = new THREE.Group();
    this.carGroup.add(car);
    const bodyMat = this.createBodyMaterial(carConfig);

    // 1. Lower Sculpted Avant Body with Flared Quattro Blisters
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.45, 4.88), bodyMat);
    lowerBody.position.y = 0.52;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    car.add(lowerBody);
    this.bodyMeshes.push(lowerBody);

    // Flared Boxy Quattro Wheel Arches (+40mm per side)
    for (let x of [-1.06, 1.06]) {
      const archFront = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.51, 0.16, 24, 1, false, 0, Math.PI), bodyMat);
      archFront.rotation.z = Math.PI / 2;
      archFront.position.set(x, 0.46, 1.52);
      car.add(archFront);
      this.bodyMeshes.push(archFront);

      const archRear = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.53, 0.18, 24, 1, false, 0, Math.PI), bodyMat);
      archRear.rotation.z = Math.PI / 2;
      archRear.position.set(x, 0.46, -1.52);
      car.add(archRear);
      this.bodyMeshes.push(archRear);
    }

    // 2. Sculpted Hood with Dual Power-creases
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.14, 1.7), bodyMat);
    hood.position.set(0, 0.74, 1.45);
    hood.rotation.x = -0.06;
    car.add(hood);
    this.bodyMeshes.push(hood);

    // 3. Iconic Audi Singleframe Hexagonal Grille & Rings
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3, metalness: 0.8 });
    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.52, 0.08), grilleMat);
    grille.position.set(0, 0.48, 2.45);
    car.add(grille);

    // Audi Four Rings Emblem
    for (let i = -1.5; i <= 1.5; i += 1.0) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.01, 16, 24), this.chromeMaterial);
      ring.position.set(i * 0.07, 0.62, 2.5);
      car.add(ring);
    }

    // Front Bumper Side Air Inlets with Vertical Aero Blades
    for (let x of [-0.75, 0.75]) {
      const inlet = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.08), grilleMat);
      inlet.position.set(x, 0.44, 2.44);
      car.add(inlet);

      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.42, 0.12), this.chromeMaterial);
      blade.position.set(x, 0.44, 2.48);
      car.add(blade);
    }

    // 4. Extended Avant Roofline with Aluminum Roof Rails
    const roofRailMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    for (let x of [-0.68, 0.68]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 2.4), roofRailMat);
      rail.position.set(x, 1.42, -0.2);
      car.add(rail);
    }

    // Rear Roof Aerodynamic Avant Spoiler
    const roofSpoiler = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.05, 0.35), bodyMat);
    roofSpoiler.position.set(0, 1.4, -2.15);
    car.add(roofSpoiler);
    this.bodyMeshes.push(roofSpoiler);

    // 5. Rear RS Diffuser & Dual Giant Oval Chrome Exhaust Pipes
    const diffuser = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.22, 0.35),
      new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.3 })
    );
    diffuser.position.set(0, 0.28, -2.4);
    car.add(diffuser);

    // Dual Giant Oval RS Exhausts
    for (let x of [-0.68, 0.68]) {
      const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.22, 24), this.chromeMaterial);
      exhaust.rotation.x = Math.PI / 2;
      exhaust.scale.set(1.4, 1.0, 0.8);
      exhaust.position.set(x, 0.28, -2.52);
      car.add(exhaust);
    }

    // 6. Cabin, Windows & Doors (Long Avant Estate profile)
    this.buildCockpitAndDoors(car, carConfig, {
      width: 1.68,
      height: 0.66,
      length: 2.65,
      yPos: 1.05,
      zPos: -0.25,
      windshieldSlope: 0.46,
      rearSlope: -0.62
    });

    // Sharp Dynamic HD Matrix LED Headlights
    this.addDetailedHeadlights(car, [
      { x: -0.74, y: 0.58, z: 2.42 },
      { x: 0.74, y: 0.58, z: 2.42 }
    ], 'audi');

    // Dynamic Stepped RS LED Taillights
    this.addDetailedTaillights(car, [
      { x: -0.78, y: 0.64, z: -2.44 },
      { x: 0.78, y: 0.64, z: -2.44 }
    ], 'audi');

    this.addSportWheels(car, 1.04, 1.52, -1.52, 0.41, 'audi_rs6');
    this.addLicensePlates(car, carConfig.licensePlate, 2.5, -2.46, 0.38);
  }

  // ===================== PORSCHE 911 GT3 RS WEISSACH =====================
  buildPorsche(carConfig) {
    const car = new THREE.Group();
    this.carGroup.add(car);
    const bodyMat = this.createBodyMaterial(carConfig);

    // 1. Sleek Teardrop Chassis with Muscular Rear Haunches
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.4, 4.45), bodyMat);
    lowerBody.position.y = 0.48;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    car.add(lowerBody);
    this.bodyMeshes.push(lowerBody);

    // Rounded Front Fender Bulges (Iconic 911 Eyes)
    for (let x of [-0.72, 0.72]) {
      const fender = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), bodyMat);
      fender.position.set(x, 0.64, 1.6);
      car.add(fender);
      this.bodyMeshes.push(fender);

      // Fender Top Louvers (Carbon Aerodynamic Extraction Gills)
      const louverMat = new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.3 });
      const louver = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.4), louverMat);
      louver.position.set(x, 0.78, 1.35);
      car.add(louver);
    }

    // Wide Muscular Rear Haunches (Widebody GT3 RS)
    for (let x of [-0.98, 0.98]) {
      const haunch = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.54, 0.22, 24, 1, false, 0, Math.PI), bodyMat);
      haunch.rotation.z = Math.PI / 2;
      haunch.position.set(x, 0.45, -1.35);
      car.add(haunch);
      this.bodyMeshes.push(haunch);
    }

    // 2. Front Hood with Dual Massive Carbon Air Extractors
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 1.45), bodyMat);
    hood.position.set(0, 0.65, 1.4);
    hood.rotation.x = -0.12;
    car.add(hood);
    this.bodyMeshes.push(hood);

    // Dual Deep Carbon Hood Vents
    const ventMat = new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.3 });
    for (let x of [-0.32, 0.32]) {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.65), ventMat);
      vent.position.set(x, 0.71, 1.35);
      vent.rotation.x = -0.12;
      car.add(vent);
    }

    // 3. Massive Dual-Element Swan-Neck GT3 RS Rear Wing with DRS
    const wingMat = new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.25 });
    // Upper active wing blade
    const mainBlade = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.04, 0.42), wingMat);
    mainBlade.position.set(0, 1.42, -1.9);
    mainBlade.rotation.x = 0.08;
    car.add(mainBlade);

    // Lower secondary wing element
    const secBlade = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.03, 0.2), wingMat);
    secBlade.position.set(0, 1.28, -1.82);
    car.add(secBlade);

    // Vertical Swan-Neck Pylons (Hanging from above!)
    for (let x of [-0.48, 0.48]) {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.62, 0.24), this.chromeMaterial);
      pylon.position.set(x, 1.15, -1.85);
      car.add(pylon);
    }

    // Side Endplates with "GT3 RS" detailing
    for (let x of [-1.01, 1.01]) {
      const endplate = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.35, 0.5), wingMat);
      endplate.position.set(x, 1.38, -1.9);
      car.add(endplate);
    }

    // 4. Central Dual Titanium Exhausts & Diffuser
    const diffuser = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.24, 0.38), wingMat);
    diffuser.position.set(0, 0.26, -2.18);
    car.add(diffuser);

    for (let x of [-0.08, 0.08]) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.22, 24), this.chromeMaterial);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(x, 0.32, -2.35);
      car.add(pipe);
    }

    // 5. Teardrop Cabin, Windows & Doors
    this.buildCockpitAndDoors(car, carConfig, {
      width: 1.55,
      height: 0.62,
      length: 1.95,
      yPos: 0.96,
      zPos: -0.15,
      windshieldSlope: 0.52,
      rearSlope: -0.58
    });

    // 911 Oval Headlights with 4-Point LED DRLs
    this.addDetailedHeadlights(car, [
      { x: -0.72, y: 0.68, z: 2.05 },
      { x: 0.72, y: 0.68, z: 2.05 }
    ], 'porsche');

    // Full-width continuous thin LED light bar
    const lightBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.68, 0.04, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2.8 })
    );
    lightBar.position.set(0, 0.72, -2.22);
    car.add(lightBar);

    this.addSportWheels(car, 1.02, 1.42, -1.42, 0.40, 'porsche');
    this.addLicensePlates(car, carConfig.licensePlate, 2.28, -2.24, 0.34);
  }

  // ===================== LAMBORGHINI REVUELTO V12 =====================
  buildLamborghini(carConfig) {
    const car = new THREE.Group();
    this.carGroup.add(car);
    const bodyMat = this.createBodyMaterial(carConfig);

    // 1. Ultra-Low Razor-Sharp Wedge Chassis
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.36, 4.82), bodyMat);
    lowerBody.position.y = 0.42;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    car.add(lowerBody);
    this.bodyMeshes.push(lowerBody);

    // Steeply Sloped Low Wedge Nose & Carbon Front Splitter
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.1, 1.7), bodyMat);
    hood.position.set(0, 0.52, 1.5);
    hood.rotation.x = -0.18;
    car.add(hood);
    this.bodyMeshes.push(hood);

    const splitter = new THREE.Mesh(
      new THREE.BoxGeometry(2.12, 0.04, 0.55),
      new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.25 })
    );
    splitter.position.set(0, 0.16, 2.45);
    car.add(splitter);

    // Iconic Y-Shaped LED Daytime Running Lights (Signature Revuelto DRLs)
    const yMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let x of [-0.78, 0.78]) {
      const stem = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.3), yMat);
      stem.position.set(x, 0.48, 2.3);
      car.add(stem);

      const branch1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.03), yMat);
      branch1.rotation.y = x > 0 ? 0.6 : -0.6;
      branch1.position.set(x + (x > 0 ? 0.08 : -0.08), 0.52, 2.42);
      car.add(branch1);

      const branch2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.03), yMat);
      branch2.rotation.y = x > 0 ? -0.6 : 0.6;
      branch2.position.set(x + (x > 0 ? 0.08 : -0.08), 0.44, 2.42);
      car.add(branch2);
    }

    // 2. High-Mounted Hexagonal V12 Dual Exhaust Outlets
    const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.95, roughness: 0.2 });
    for (let x of [-0.18, 0.18]) {
      const hexPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.25, 6), exhaustMat);
      hexPipe.rotation.x = Math.PI / 2;
      hexPipe.position.set(x, 0.74, -2.42);
      car.add(hexPipe);
    }

    // Massive Active Aerodynamic Rear Carbon Diffuser with Vertical Frakes
    const diffuser = new THREE.Mesh(
      new THREE.BoxGeometry(1.95, 0.28, 0.6),
      new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.3 })
    );
    diffuser.position.set(0, 0.25, -2.25);
    car.add(diffuser);

    for (let x of [-0.7, -0.35, 0.35, 0.7]) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.32, 0.5), this.chromeMaterial);
      fin.position.set(x, 0.22, -2.35);
      car.add(fin);
    }

    // 3. Faceted Fighter-Jet Cockpit & Double-Bubble Roof
    this.buildCockpitAndDoors(car, carConfig, {
      width: 1.54,
      height: 0.56,
      length: 1.95,
      yPos: 0.88,
      zPos: -0.15,
      windshieldSlope: 0.68,
      rearSlope: -0.56
    });

    // Horizontal Y-Shaped Taillights
    for (let x of [-0.72, 0.72]) {
      const tail = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.06, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2.5 })
      );
      tail.position.set(x, 0.68, -2.38);
      car.add(tail);
    }

    this.addDetailedHeadlights(car, [
      { x: -0.78, y: 0.44, z: 2.38 },
      { x: 0.78, y: 0.44, z: 2.38 }
    ], 'lambo');

    this.addSportWheels(car, 1.06, 1.52, -1.52, 0.40, 'lambo');
    this.addLicensePlates(car, carConfig.licensePlate, 2.45, -2.35, 0.32);
  }

  // ===================== FERRARI SF90 STRADALE =====================
  buildFerrari(carConfig) {
    const car = new THREE.Group();
    this.carGroup.add(car);
    const bodyMat = this.createBodyMaterial(carConfig);

    // 1. Aerodynamic Italian Hypercar Body
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.04, 0.38, 4.71), bodyMat);
    lowerBody.position.y = 0.44;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    car.add(lowerBody);
    this.bodyMeshes.push(lowerBody);

    // Front Nose & Carbon Splitter
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.12, 1.6), bodyMat);
    hood.position.set(0, 0.54, 1.45);
    hood.rotation.x = -0.16;
    car.add(hood);
    this.bodyMeshes.push(hood);

    const splitter = new THREE.Mesh(
      new THREE.BoxGeometry(2.06, 0.04, 0.45),
      new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.25 })
    );
    splitter.position.set(0, 0.16, 2.4);
    car.add(splitter);

    // 2. Mid-Engine Glass Cover with V8 Engine Bay Glimpse
    const engineGlass = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.02, 1.2),
      new THREE.MeshPhysicalMaterial({ color: 0x111827, transmission: 0.85, transparent: true, roughness: 0.1 })
    );
    engineGlass.position.set(0, 0.76, -1.1);
    engineGlass.rotation.x = 0.12;
    car.add(engineGlass);

    // Red Ferrari Twin-Turbo V8 Cylinder Heads visible under glass
    for (let x of [-0.22, 0.22]) {
      const cylinderBank = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.08, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.8, roughness: 0.3 })
      );
      cylinderBank.position.set(x, 0.68, -1.1);
      car.add(cylinderBank);
    }

    // 3. Dual High-Mounted Central Exhaust Outlets
    for (let x of [-0.14, 0.14]) {
      const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.22, 24), this.chromeMaterial);
      exhaust.rotation.x = Math.PI / 2;
      exhaust.position.set(x, 0.64, -2.38);
      car.add(exhaust);
    }

    // Active Aero Diffuser with vertical fins
    const diffuser = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.24, 0.45),
      new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.3 })
    );
    diffuser.position.set(0, 0.24, -2.25);
    car.add(diffuser);

    // 4. Compact Tear-drop Cockpit
    this.buildCockpitAndDoors(car, carConfig, {
      width: 1.54,
      height: 0.58,
      length: 1.95,
      yPos: 0.92,
      zPos: -0.15,
      windshieldSlope: 0.62,
      rearSlope: -0.52
    });

    // Horizontal Slit Matrix LED Headlights
    this.addDetailedHeadlights(car, [
      { x: -0.74, y: 0.48, z: 2.32 },
      { x: 0.74, y: 0.48, z: 2.32 }
    ], 'ferrari');

    // Quad Horizontal Pill Taillights
    for (let x of [-0.72, -0.46, 0.46, 0.72]) {
      const tail = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.06, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2.5 })
      );
      tail.position.set(x, 0.66, -2.36);
      car.add(tail);
    }

    this.addSportWheels(car, 1.05, 1.48, -1.48, 0.40, 'ferrari');
    this.addLicensePlates(car, carConfig.licensePlate, 2.4, -2.32, 0.32);
  }

  // ===================== NISSAN GT-R NISMO (GODZILLA) =====================
  buildGTR(carConfig) {
    const car = new THREE.Group();
    this.carGroup.add(car);
    const bodyMat = this.createBodyMaterial(carConfig);

    // 1. Muscular JDM Widebody Silhouette
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.46, 4.7), bodyMat);
    lowerBody.position.y = 0.52;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    car.add(lowerBody);
    this.bodyMeshes.push(lowerBody);

    // Nismo Signature Red Bottom Accent Trim Pinstripe
    const nismoRedMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 });
    for (let x of [-1.02, 1.02]) {
      const sideStripe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 3.2), nismoRedMat);
      sideStripe.position.set(x, 0.22, 0);
      car.add(sideStripe);
    }
    const frontStripe = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.03, 0.04), nismoRedMat);
    frontStripe.position.set(0, 0.2, 2.42);
    car.add(frontStripe);

    // Vented Carbon Hood with Dual NACA Ducts
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.14, 1.6), bodyMat);
    hood.position.set(0, 0.74, 1.4);
    hood.rotation.x = -0.06;
    car.add(hood);
    this.bodyMeshes.push(hood);

    // Dual NACA air intake triangles on hood
    for (let x of [-0.3, 0.3]) {
      const duct = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.35), new THREE.MeshStandardMaterial({ map: this.carbonTexture }));
      duct.position.set(x, 0.81, 1.45);
      duct.rotation.x = -0.06;
      car.add(duct);
    }

    // 2. High-Mount Carbon Fiber GT Rear Wing
    const wingMat = new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.25 });
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.05, 0.42), wingMat);
    wing.position.set(0, 1.25, -1.9);
    car.add(wing);

    for (let x of [-0.5, 0.5]) {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.22), this.chromeMaterial);
      pylon.position.set(x, 1.05, -1.86);
      car.add(pylon);
    }

    // 3. Quad Burnt-Titanium Exhaust Pipes
    const titaniumMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.95, roughness: 0.2 });
    for (let x of [-0.7, -0.54, 0.54, 0.7]) {
      const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 24), titaniumMat);
      exhaust.rotation.x = Math.PI / 2;
      exhaust.position.set(x, 0.28, -2.38);
      car.add(exhaust);
    }

    // 4. Iconic GT-R Quad Round Afterburner Taillights (Double round eyes!)
    for (let x of [-0.74, -0.5, 0.5, 0.74]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.07, 0.02, 16, 24),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      ring.position.set(x, 0.62, -2.36);
      car.add(ring);
    }

    // 5. Cabin & Cockpit
    this.buildCockpitAndDoors(car, carConfig, {
      width: 1.65,
      height: 0.66,
      length: 2.1,
      yPos: 1.05,
      zPos: -0.2,
      windshieldSlope: 0.48,
      rearSlope: -0.55
    });

    // Lightning Bolt Angular LED Headlights
    this.addDetailedHeadlights(car, [
      { x: -0.74, y: 0.56, z: 2.38 },
      { x: 0.74, y: 0.56, z: 2.38 }
    ], 'gtr');

    this.addSportWheels(car, 1.04, 1.48, -1.48, 0.41, 'gtr');
    this.addLicensePlates(car, carConfig.licensePlate, 2.42, -2.36, 0.36);
  }

  // ===================== FORD MUSTANG SHELBY GT500 =====================
  buildMustang(carConfig) {
    const car = new THREE.Group();
    this.carGroup.add(car);
    const bodyMat = this.createBodyMaterial(carConfig);

    // 1. Muscular Muscle Car Body with Long Aggressive Hood
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.48, 4.8), bodyMat);
    lowerBody.position.y = 0.54;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    car.add(lowerBody);
    this.bodyMeshes.push(lowerBody);

    // Front Gaping Black Hexagonal Shelby Grille & Cobra Snake Emblem
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3 });
    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.46, 0.08), grilleMat);
    grille.position.set(0, 0.54, 2.42);
    car.add(grille);

    // Shelby Cobra Snake Emblem
    const cobra = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.02), this.chromeMaterial);
    cobra.position.set(0.35, 0.56, 2.47);
    car.add(cobra);

    // Aggressive Hood with Giant Center Heat Extractor Louvers
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.14, 1.8), bodyMat);
    hood.position.set(0, 0.78, 1.45);
    hood.rotation.x = -0.05;
    car.add(hood);
    this.bodyMeshes.push(hood);

    // Black Hood Louver Center Plate
    const ventPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.03, 0.85),
      new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.3 })
    );
    ventPlate.position.set(0, 0.86, 1.45);
    ventPlate.rotation.x = -0.05;
    car.add(ventPlate);

    // 2. Le Mans Twin Racing Stripes
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    for (let x of [-0.18, 0.18]) {
      const stripeHood = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.01, 1.8), stripeMat);
      stripeHood.position.set(x, 0.86, 1.45);
      stripeHood.rotation.x = -0.05;
      car.add(stripeHood);
    }

    // 3. Fastback Cabin
    this.buildCockpitAndDoors(car, carConfig, {
      width: 1.66,
      height: 0.68,
      length: 2.15,
      yPos: 1.08,
      zPos: -0.22,
      windshieldSlope: 0.46,
      rearSlope: -0.58
    });

    // 4. Iconic Tri-Bar Vertical Sequential LED Taillights (3 vertical bars per side)
    for (let side of [-1, 1]) {
      for (let bar = 0; bar < 3; bar++) {
        const tailBar = new THREE.Mesh(
          new THREE.BoxGeometry(0.03, 0.16, 0.04),
          new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2.5 })
        );
        tailBar.position.set(side * (0.62 + bar * 0.08), 0.64, -2.41);
        car.add(tailBar);
      }
    }

    // Quad Chrome Exhausts
    for (let x of [-0.66, -0.5, 0.5, 0.66]) {
      const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.22, 24), this.chromeMaterial);
      exhaust.rotation.x = Math.PI / 2;
      exhaust.position.set(x, 0.28, -2.42);
      car.add(exhaust);
    }

    // Tri-Bar Daytime Running Lights inside front headlights
    this.addDetailedHeadlights(car, [
      { x: -0.76, y: 0.6, z: 2.38 },
      { x: 0.76, y: 0.6, z: 2.38 }
    ], 'mustang');

    this.addSportWheels(car, 1.04, 1.5, -1.5, 0.42, 'mustang');
    this.addLicensePlates(car, carConfig.licensePlate, 2.45, -2.42, 0.38);
  }

  // ===================== BUGATTI CHIRON SUPER SPORT =====================
  buildBugatti(carConfig) {
    const car = new THREE.Group();
    this.carGroup.add(car);
    const bodyMat = this.createBodyMaterial(carConfig);

    // 1. Muscular Aerodynamic Hypercar Body
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.08, 0.42, 4.85), bodyMat);
    lowerBody.position.y = 0.48;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    car.add(lowerBody);
    this.bodyMeshes.push(lowerBody);

    // Iconic Bugatti Horseshoe Radiator Grille
    const horseshoeGeo = new THREE.TorusGeometry(0.24, 0.04, 16, 24, Math.PI);
    const horseshoe = new THREE.Mesh(horseshoeGeo, this.chromeMaterial);
    horseshoe.rotation.z = Math.PI;
    horseshoe.position.set(0, 0.58, 2.46);
    car.add(horseshoe);

    const grilleMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.06, 24),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3 })
    );
    grilleMesh.rotation.x = Math.PI / 2;
    grilleMesh.position.set(0, 0.46, 2.44);
    car.add(grilleMesh);

    // 2. Iconic Bugatti "C-Line" Side Curve
    for (let x of [-1.05, 1.05]) {
      const cLine = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.035, 16, 32, Math.PI * 1.3), this.chromeMaterial);
      cLine.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
      cLine.position.set(x, 0.95, -0.3);
      car.add(cLine);
    }

    // 3. Central Stacked Dual Dual-Exhausts (Stacked Quad Titanium Tailpipes)
    for (let x of [-0.08, 0.08]) {
      for (let y of [0.42, 0.56]) {
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.24, 24), this.chromeMaterial);
        pipe.rotation.x = Math.PI / 2;
        pipe.position.set(x, y, -2.45);
        car.add(pipe);
      }
    }

    // 4. Continuous 1.6m Slim Red Taillight Bar
    const tailBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 0.035, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 3.0 })
    );
    tailBar.position.set(0, 0.68, -2.44);
    car.add(tailBar);

    // 5. Cabin & Double-Bubble Aerodynamic Roof
    this.buildCockpitAndDoors(car, carConfig, {
      width: 1.58,
      height: 0.6,
      length: 2.1,
      yPos: 0.95,
      zPos: -0.18,
      windshieldSlope: 0.58,
      rearSlope: -0.5
    });

    // Quad Horizontal Jewel-Eye LED Headlights
    this.addDetailedHeadlights(car, [
      { x: -0.74, y: 0.52, z: 2.4 },
      { x: 0.74, y: 0.52, z: 2.4 }
    ], 'bugatti');

    this.addSportWheels(car, 1.06, 1.52, -1.52, 0.42, 'bugatti');
    this.addLicensePlates(car, carConfig.licensePlate, 2.48, -2.42, 0.34);
  }

  // ===================== ZEEKR 001 FR HYPER-EV =====================
  buildZeekr(carConfig) {
    const car = new THREE.Group();
    this.carGroup.add(car);
    const bodyMat = this.createBodyMaterial(carConfig);

    // 1. Sleek Shooting Brake Performance Body
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.44, 4.8), bodyMat);
    lowerBody.position.y = 0.5;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    car.add(lowerBody);
    this.bodyMeshes.push(lowerBody);

    // Front Hood with sculpted aerodynamic power lines
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.1, 1.45), bodyMat);
    hood.position.set(0, 0.73, 1.4);
    hood.rotation.x = -0.06;
    car.add(hood);
    this.bodyMeshes.push(hood);

    // 2. Iconic Zeekr Claw / Twin-Strip Vertical LED DRLs on top of fenders
    const drlMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
    for (let x of [-0.74, 0.74]) {
      for (let offset of [-0.05, 0.05]) {
        const claw = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.05, 0.3), drlMat);
        claw.position.set(x + offset, 0.81, 1.88);
        claw.rotation.x = -0.08;
        car.add(claw);
      }
    }

    // 3. Lower Front Horizontal Dark Bar with Matrix Headlights
    const frontBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.12, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.2 })
    );
    frontBar.position.set(0, 0.48, 2.38);
    car.add(frontBar);

    // 4. Aggressive Carbon Fiber FR Aerokit with Laser Orange Front Lip
    const splitter = new THREE.Mesh(
      new THREE.BoxGeometry(1.98, 0.04, 0.45),
      new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.35, metalness: 0.3 })
    );
    splitter.position.set(0, 0.24, 2.25);
    car.add(splitter);

    const orangeLip = new THREE.Mesh(
      new THREE.BoxGeometry(1.98, 0.025, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xea580c, emissive: 0xea580c, emissiveIntensity: 0.6 })
    );
    orangeLip.position.set(0, 0.23, 2.47);
    car.add(orangeLip);

    // Carbon Side Skirts with Orange Accent Strip
    const orangeSkirtMat = new THREE.MeshStandardMaterial({ color: 0xea580c, emissive: 0xea580c, emissiveIntensity: 0.5 });
    for (let x of [-1.03, 1.03]) {
      const skirt = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 0.05, 2.7),
        new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.4 })
      );
      skirt.position.set(x, 0.24, 0);
      car.add(skirt);

      const pinstripe = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 2.7), orangeSkirtMat);
      pinstripe.position.set(x > 0 ? x + 0.04 : x - 0.04, 0.25, 0);
      car.add(pinstripe);
    }

    // 5. Rear Carbon Diffuser with Vertical Aero Fins & Orange Trim
    const diffuser = new THREE.Mesh(
      new THREE.BoxGeometry(1.92, 0.25, 0.4),
      new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.4 })
    );
    diffuser.position.set(0, 0.32, -2.25);
    car.add(diffuser);

    for (let x of [-0.55, -0.2, 0.2, 0.55]) {
      const fin = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.18, 0.3),
        new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.3 })
      );
      fin.position.set(x, 0.25, -2.35);
      car.add(fin);
    }

    const rearOrangeStrip = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.025, 0.04), orangeSkirtMat);
    rearOrangeStrip.position.set(0, 0.22, -2.44);
    car.add(rearOrangeStrip);

    // 6. Dual Rear Spoilers: Top Roof Wing & Ducktail
    const roofWing = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.04, 0.3),
      new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.3 })
    );
    roofWing.position.set(0, 1.28, -1.25);
    car.add(roofWing);

    const ducktail = new THREE.Mesh(
      new THREE.BoxGeometry(1.58, 0.05, 0.14),
      new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.3 })
    );
    ducktail.position.set(0, 0.82, -2.15);
    car.add(ducktail);

    // 7. Full-Width Slim Matrix LED Rear Light Bar with illuminated "ZEEKR" Badge
    const tailBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.84, 0.04, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2.8 })
    );
    tailBar.position.set(0, 0.72, -2.42);
    car.add(tailBar);

    const zeekrBadge = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.03, 0.04),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    zeekrBadge.position.set(0, 0.72, -2.44);
    car.add(zeekrBadge);

    // 8. High-Tech Roof LiDAR Pod for NZP Autopilot
    const lidarPod = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.08, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.2, metalness: 0.8 })
    );
    lidarPod.position.set(0, 1.3, 0.65);
    car.add(lidarPod);

    const lidarLens = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.04, 0.03),
      new THREE.MeshPhysicalMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 1.5, roughness: 0.1 })
    );
    lidarLens.position.set(0, 1.29, 0.76);
    car.add(lidarLens);

    // 9. Cabin & Shooting Brake Glasshouse
    this.buildCockpitAndDoors(car, carConfig, {
      width: 1.62,
      height: 0.62,
      length: 2.35,
      yPos: 0.98,
      zPos: 0.0,
      windshieldSlope: 0.56,
      rearSlope: -0.42
    });

    // 10. Headlights, Wheels & Plates
    this.addDetailedHeadlights(car, [
      { x: -0.65, y: 0.48, z: 2.36 },
      { x: 0.65, y: 0.48, z: 2.36 }
    ], 'zeekr');

    this.addSportWheels(car, 1.04, 1.54, -1.54, 0.42, 'zeekr');
    this.addLicensePlates(car, carConfig.licensePlate, 2.45, -2.43, 0.35);
  }

  // ===================== APEX GT SUPERCAR =====================
  buildSupercar(carConfig) {
    const car = new THREE.Group();
    this.carGroup.add(car);
    const bodyMat = this.createBodyMaterial(carConfig);

    // Ultra-low track chassis
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.08, 0.4, 4.6), bodyMat);
    body.position.y = 0.42;
    body.castShadow = true;
    car.add(body);
    this.bodyMeshes.push(body);

    // Sloped nose & front aerodynamic air extractors
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.12, 1.6), bodyMat);
    hood.position.set(0, 0.58, 1.4);
    hood.rotation.x = -0.14;
    car.add(hood);
    this.bodyMeshes.push(hood);

    // Massive GT Swan-Neck Carbon Wing
    const wingMat = new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.25 });
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.05, 0.45), wingMat);
    wing.position.set(0, 1.25, -1.85);
    car.add(wing);

    for (let x of [-0.55, 0.55]) {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.22), this.chromeMaterial);
      pylon.position.set(x, 1.05, -1.8);
      car.add(pylon);
    }

    // Cabin
    this.buildCockpitAndDoors(car, carConfig, {
      width: 1.55,
      height: 0.62,
      length: 1.95,
      yPos: 0.92,
      zPos: -0.15,
      windshieldSlope: 0.62,
      rearSlope: -0.52
    });

    this.addDetailedHeadlights(car, [
      { x: -0.78, y: 0.5, z: 2.22 },
      { x: 0.78, y: 0.5, z: 2.22 }
    ], 'supercar');

    this.addDetailedTaillights(car, [
      { x: -0.78, y: 0.56, z: -2.26 },
      { x: 0.78, y: 0.56, z: -2.26 }
    ], 'supercar');

    this.addSportWheels(car, 1.04, 1.4, -1.4, 0.38, 'supercar');
    this.addLicensePlates(car, carConfig.licensePlate, 2.35, -2.3, 0.35);
  }

  // ===================== ЗАЗ-968М "ЗАПОРОЖЕЦЬ" =====================
  buildZaporozhets(carConfig) {
    const car = new THREE.Group();
    this.carGroup.add(car);

    const bodyMat = this.createBodyMaterial(carConfig);

    // 1. Main Retro Tub / Body Chassis
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.46, 3.65), bodyMat);
    lowerBody.position.y = 0.54;
    lowerBody.castShadow = true;
    car.add(lowerBody);
    this.bodyMeshes.push(lowerBody);

    // 2. Front Hood / Nose (Smooth rounded retro front without grille)
    const frontNose = new THREE.Mesh(
      new THREE.CylinderGeometry(0.81, 0.81, 0.46, 24, 1, false, -Math.PI / 2, Math.PI),
      bodyMat
    );
    frontNose.rotation.y = Math.PI / 2;
    frontNose.position.set(0, 0.54, 1.82);
    frontNose.castShadow = true;
    car.add(frontNose);
    this.bodyMeshes.push(frontNose);

    // Front Luggage Hood Lid (Trunk in the front!)
    const hoodLid = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.06, 1.2), bodyMat);
    hoodLid.position.set(0, 0.77, 1.22);
    hoodLid.rotation.x = 0.04;
    hoodLid.castShadow = true;
    car.add(hoodLid);
    this.bodyMeshes.push(hoodLid);

    // 3. Vintage ЗАЗ Front Horizontal Chrome Trim Bar ("Вуса") & Red Emblem
    const chromeBar = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.04, 0.06), this.chromeMaterial);
    chromeBar.position.set(0, 0.58, 1.88);
    car.add(chromeBar);

    const zazEmblem = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.06, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.6 })
    );
    zazEmblem.position.set(0, 0.58, 1.90);
    car.add(zazEmblem);

    // 4. Front Chrome Bumper with Rubber Fangs (Ікла)
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.08, 0.09), this.chromeMaterial);
    frontBumper.position.set(0, 0.36, 1.90);
    car.add(frontBumper);

    for (let bx of [-0.42, 0.42]) {
      const fang = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.16, 0.11),
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 })
      );
      fang.position.set(bx, 0.38, 1.91);
      car.add(fang);
    }

    // 5. Classic Round Headlights with Chrome Bezels & Amber Indicators
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.88,
      transparent: true,
      roughness: 0.1,
      clearcoat: 1.0,
      envMap: this.envTexture
    });

    for (let hx of [-0.56, 0.56]) {
      // Chrome Ring Bezel
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.02, 16, 24), this.chromeMaterial);
      ring.position.set(hx, 0.62, 1.86);
      car.add(ring);

      // Convex Glass Lens
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 24), lensMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(hx, 0.62, 1.86);
      car.add(lens);

      // Headlight Reflector
      const reflector = new THREE.Mesh(
        new THREE.CircleGeometry(0.11, 24),
        new THREE.MeshBasicMaterial({ color: 0xfffbeb })
      );
      reflector.position.set(hx, 0.62, 1.84);
      car.add(reflector);

      // Spotlight on road
      const spot = new THREE.SpotLight(0xfef08a, 12, 18, Math.PI / 5, 0.4, 1.2);
      spot.position.set(hx, 0.62, 1.86);
      spot.target.position.set(hx, 0.05, 12);
      spot.castShadow = true;
      car.add(spot);
      car.add(spot.target);
      this.headlightSpots.push(spot);

      // Amber Turn Signal Below Headlight
      const turnSignal = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.05, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 1.5 })
      );
      turnSignal.position.set(hx, 0.45, 1.87);
      car.add(turnSignal);
    }

    // 6. THE FAMOUS REAR SIDE AIR INTAKE SCOOPS ("ВУХА" / Повітрозабірники)
    for (let side of [-1, 1]) {
      const ventBox = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.55), bodyMat);
      ventBox.position.set(side * 0.83, 0.65, -0.75);
      car.add(ventBox);
      this.bodyMeshes.push(ventBox);

      // Black Louver Slats inside intake
      for (let s = -0.2; s <= 0.2; s += 0.08) {
        const slat = new THREE.Mesh(
          new THREE.BoxGeometry(0.03, 0.015, 0.06),
          new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 })
        );
        slat.position.set(side * 0.87, 0.65, -0.75 + s);
        car.add(slat);
      }
    }

    // 7. Rear Engine Deck & Cooling Louvers (Задній капот двигуна МеМЗ)
    const rearDeck = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.06, 1.05), bodyMat);
    rearDeck.position.set(0, 0.77, -1.3);
    rearDeck.castShadow = true;
    car.add(rearDeck);
    this.bodyMeshes.push(rearDeck);

    // Engine lid cooling slots
    for (let rz of [-0.95, -1.12, -1.3, -1.48, -1.65]) {
      const louver = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.018, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.95 })
      );
      louver.position.set(0, 0.81, rz);
      car.add(louver);
    }

    // 8. Rear Chrome Bumper & Exhaust Pipe
    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.08, 0.09), this.chromeMaterial);
    rearBumper.position.set(0, 0.36, -1.86);
    car.add(rearBumper);

    for (let bx of [-0.42, 0.42]) {
      const fang = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.16, 0.11),
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 })
      );
      fang.position.set(bx, 0.38, -1.87);
      car.add(fang);
    }

    // Authentic retro single tailpipe
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.22, 16), this.chromeMaterial);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(0.48, 0.26, -1.94);
    car.add(exhaust);

    // 9. Rear Taillights (Rectangular 968M style)
    for (let tx of [-0.58, 0.58]) {
      const amberSection = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.055, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.8 })
      );
      amberSection.position.set(tx, 0.62, -1.84);
      car.add(amberSection);

      const redSection = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.055, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2.2 })
      );
      redSection.position.set(tx, 0.55, -1.84);
      car.add(redSection);

      const tailChrome = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.15, 0.02), this.chromeMaterial);
      tailChrome.position.set(tx, 0.585, -1.83);
      car.add(tailChrome);
    }

    // 10. Cabin Cockpit & Windows
    this.buildCockpitAndDoors(car, carConfig, {
      width: 1.48,
      height: 0.62,
      length: 2.05,
      yPos: 1.05,
      zPos: -0.05,
      windshieldSlope: 0.34,
      rearSlope: -0.34
    });

    // 11. Retro Wheels with Chrome Hubcaps (Ковпаки)
    this.addSportWheels(car, 0.82, 1.15, -1.15, 0.34, 'zaporozhets');

    // 12. Ukrainian License Plates
    this.addLicensePlates(car, carConfig.licensePlate, 1.92, -1.88, 0.36);
  }

  // ===================== REALISTIC COCKPIT & DOORS =====================
  buildCockpitAndDoors(car, carConfig, dims) {
    const { width, height, length, yPos, zPos, windshieldSlope, rearSlope, isBus } = dims;

    // 1. Interior Dashboard with glowing digital cluster screen
    const dash = new THREE.Mesh(new THREE.BoxGeometry(width * 0.92, 0.22, 0.55), this.interiorAlcantara);
    dash.position.set(0, yPos - height * 0.15, zPos + length * 0.28);
    car.add(dash);

    const cluster = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.16, 0.02),
      new THREE.MeshBasicMaterial({ map: this.dashboardTexture })
    );
    cluster.position.set(-0.38, yPos - height * 0.05, zPos + length * 0.18);
    cluster.rotation.x = -0.2;
    car.add(cluster);

    // 2. High-support Sport Bucket Seats
    for (let x of [-0.4, 0.4]) {
      const seatBottom = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.14, 0.52), this.interiorAlcantara);
      seatBottom.position.set(x, yPos - height * 0.35, zPos - 0.1);
      car.add(seatBottom);

      const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.58, 0.14), this.interiorAlcantara);
      seatBack.rotation.x = -0.18;
      seatBack.position.set(x, yPos - height * 0.02, zPos - 0.35);
      car.add(seatBack);

      const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.18, 0.1), this.interiorAlcantara);
      headrest.position.set(x, yPos + height * 0.32, zPos - 0.42);
      car.add(headrest);
    }

    // 3. Realistic 3D Steering Wheel
    this.buildSteeringWheel(car, carConfig.wheelId, -0.38, yPos - height * 0.05, zPos + length * 0.15);

    // 4. Curved Glass Canopy (Windshield & Rear Window)
    const glassMat = this.createGlassMaterial(carConfig);

    const windGeo = new THREE.BoxGeometry(width * 0.94, 0.03, length * 0.45);
    const windshield = new THREE.Mesh(windGeo, glassMat);
    windshield.rotation.x = windshieldSlope;
    windshield.position.set(0, yPos + height * 0.18, zPos + length * 0.32);
    car.add(windshield);
    this.glassMeshes.push(windshield);

    const rearGlass = new THREE.Mesh(windGeo, glassMat);
    rearGlass.rotation.x = rearSlope;
    rearGlass.position.set(0, yPos + height * 0.18, zPos - length * 0.32);
    car.add(rearGlass);
    this.glassMeshes.push(rearGlass);

    // 5. Left & Right Hinged Doors
    this.doorLeftPivot = new THREE.Group();
    this.doorLeftPivot.position.set(-width * 0.5, yPos - height * 0.1, zPos + length * 0.22);
    car.add(this.doorLeftPivot);

    this.doorRightPivot = new THREE.Group();
    this.doorRightPivot.position.set(width * 0.5, yPos - height * 0.1, zPos + length * 0.22);
    car.add(this.doorRightPivot);

    const doorGeo = new THREE.BoxGeometry(0.08, height * 0.85, length * 0.5);
    const doorMat = this.createBodyMaterial(carConfig);

    const doorL = new THREE.Mesh(doorGeo, doorMat);
    doorL.position.set(0, 0, -length * 0.25);
    doorL.castShadow = true;
    this.doorLeftPivot.add(doorL);
    this.bodyMeshes.push(doorL);

    const doorR = new THREE.Mesh(doorGeo, doorMat);
    doorR.position.set(0, 0, -length * 0.25);
    doorR.castShadow = true;
    this.doorRightPivot.add(doorR);
    this.bodyMeshes.push(doorR);

    // Side window glasses
    const sideGlassGeo = new THREE.BoxGeometry(0.03, height * 0.48, length * 0.48);
    const sideGL = new THREE.Mesh(sideGlassGeo, glassMat);
    sideGL.position.set(0, height * 0.3, -length * 0.25);
    this.doorLeftPivot.add(sideGL);
    this.glassMeshes.push(sideGL);

    const sideGR = new THREE.Mesh(sideGlassGeo, glassMat);
    sideGR.position.set(0, height * 0.3, -length * 0.25);
    this.doorRightPivot.add(sideGR);
    this.glassMeshes.push(sideGR);

    // Flush Chrome Door Handles
    for (let p of [this.doorLeftPivot, this.doorRightPivot]) {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.16), this.chromeMaterial);
      handle.position.set(p === this.doorLeftPivot ? -0.05 : 0.05, 0.05, -length * 0.42);
      p.add(handle);
    }

    // 6. Roof Module
    this.buildRoofModule(car, carConfig, {
      width,
      length: length * 0.65,
      yPos: yPos + height * 0.48,
      zPos: zPos - 0.05
    });
  }

  // ===================== ROOF MODULE =====================
  buildRoofModule(car, carConfig, { width, length, yPos, zPos }) {
    const roofGroup = new THREE.Group();
    roofGroup.position.set(0, yPos, zPos);
    car.add(roofGroup);

    const { roofId } = carConfig;

    if (roofId === 'panoramic') {
      // High-end panoramic glass with black ceramic frit border
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x090d16,
        transmission: 0.88,
        transparent: true,
        roughness: 0.04,
        metalness: 0.1,
        clearcoat: 1.0,
        envMap: this.envTexture
      });
      const pano = new THREE.Mesh(new THREE.BoxGeometry(width * 0.86, 0.04, length * 0.92), glassMat);
      roofGroup.add(pano);

      // Body painted side roof arches
      const archMat = this.createBodyMaterial(carConfig);
      for (let x of [-width * 0.46, width * 0.46]) {
        const arch = new THREE.Mesh(new THREE.BoxGeometry(width * 0.08, 0.05, length), archMat);
        arch.position.x = x;
        roofGroup.add(arch);
        this.bodyMeshes.push(arch);
      }
    } else if (roofId === 'carbon') {
      // 2x2 Twill Weave Carbon Fiber Roof with high clearcoat gloss
      const carbonMat = new THREE.MeshPhysicalMaterial({
        color: 0x181a1f,
        map: this.carbonTexture,
        roughness: 0.18,
        metalness: 0.45,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        envMap: this.envTexture
      });
      const carbon = new THREE.Mesh(new THREE.BoxGeometry(width * 0.98, 0.05, length), carbonMat);
      roofGroup.add(carbon);
    } else if (roofId === 'starlight') {
      // Starlight Headliner (Dark exterior, glowing optical fiber stars inside cabin)
      const starlightMat = new THREE.MeshStandardMaterial({
        map: this.starlightTexture,
        roughness: 0.5
      });
      const starlight = new THREE.Mesh(new THREE.BoxGeometry(width * 0.98, 0.05, length), starlightMat);
      roofGroup.add(starlight);
    } else if (roofId === 'roof_rack') {
      // Base roof
      const base = new THREE.Mesh(new THREE.BoxGeometry(width * 0.98, 0.05, length), this.createBodyMaterial(carConfig));
      roofGroup.add(base);
      this.bodyMeshes.push(base);

      // Black anodized aluminum aerodynamic roof bars
      const railMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
      for (let z of [-length * 0.35, length * 0.35]) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(width * 0.92, 0.04, 0.08), railMat);
        bar.position.set(0, 0.08, z);
        roofGroup.add(bar);
      }

      // Sculpted Thule-style Overland Aerodynamic Cargo Carrier
      const boxMat = new THREE.MeshPhysicalMaterial({ color: 0x090d16, roughness: 0.2, metalness: 0.6, clearcoat: 0.8, envMap: this.envTexture });
      const box = new THREE.Mesh(new THREE.BoxGeometry(width * 0.58, 0.28, length * 0.88), boxMat);
      box.position.set(0, 0.24, 0);
      box.castShadow = true;
      roofGroup.add(box);
    } else if (roofId === 'cabrio') {
      // Soft-top textile cabriolet
      const cabrioMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95, metalness: 0.02 });
      const cabrio = new THREE.Mesh(new THREE.BoxGeometry(width * 0.94, 0.07, length * 0.92), cabrioMat);
      roofGroup.add(cabrio);
    } else {
      // Solid Metal Body Roof
      const solid = new THREE.Mesh(new THREE.BoxGeometry(width * 0.98, 0.05, length), this.createBodyMaterial(carConfig));
      roofGroup.add(solid);
      this.bodyMeshes.push(solid);
    }
  }

  // ===================== STEERING WHEELS =====================
  buildSteeringWheel(car, wheelId, x, y, z) {
    const wg = new THREE.Group();
    wg.position.set(x, y, z);
    wg.rotation.x = -0.32;
    car.add(wg);

    if (wheelId === 'yoke') {
      // Tesla Cyber Yoke
      const m = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4, metalness: 0.3 });
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.03), m);
      wg.add(bar);
      for (let s of [-0.15, 0.15]) {
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.04), m);
        grip.position.set(s, 0.07, 0);
        wg.add(grip);
      }
    } else if (wheelId === 'classic_wood') {
      // Vintage Mahogany Wood Wheel
      const wood = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.2, metalness: 0.1 });
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 16, 32), wood);
      wg.add(rim);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 24), this.chromeMaterial);
      hub.rotation.x = Math.PI / 2;
      wg.add(hub);
      for (let a of [0, Math.PI * 0.65, Math.PI * 1.35]) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.02, 0.01), this.chromeMaterial);
        spoke.rotation.z = a;
        wg.add(spoke);
      }
    } else if (wheelId === 'f1_carbon') {
      // F1 Carbon Racing Wheel with LED Shift Lights
      const f1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.03), new THREE.MeshStandardMaterial({ map: this.carbonTexture, roughness: 0.3 }));
      wg.add(f1);
      const leds = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.015, 0.02), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
      leds.position.set(0, 0.07, 0.02);
      wg.add(leds);
    } else if (wheelId === 'retro_bus') {
      // Vintage Bulli Van Wheel
      const white = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.1 });
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.016, 16, 32), white);
      wg.add(rim);
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.02, 0.015), white);
      wg.add(spoke);
    } else {
      // BMW M Sport with Red 12 O'Clock Stripe & M Badges
      const leather = new THREE.MeshStandardMaterial({ color: 0x1e2128, roughness: 0.6, metalness: 0.2 });
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.024, 16, 32), leather);
      wg.add(rim);

      const redStripe = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.04), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      redStripe.position.set(0, 0.16, 0);
      wg.add(redStripe);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 24), leather);
      hub.rotation.x = Math.PI / 2;
      wg.add(hub);

      const spkH = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.02), leather);
      wg.add(spkH);
      const spkV = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.02), leather);
      spkV.position.set(0, -0.08, 0);
      wg.add(spkV);
    }
  }

  // ===================== REALISTIC WHEELS & BRAKES =====================
  addSportWheels(car, xDist, zFront, zRear, radius, modelId) {
    const isBus = modelId === 'bus' || modelId === 'zaporozhets';
    const isTesla = modelId === 'tesla';
    const isCybertruck = modelId === 'cybertruck';

    const wheelPositions = [
      { x: -xDist, z: zFront, isLeft: true },
      { x: xDist, z: zFront, isLeft: false },
      { x: -xDist, z: zRear, isLeft: true },
      { x: xDist, z: zRear, isLeft: false }
    ];

    wheelPositions.forEach(pos => {
      const wg = new THREE.Group();
      wg.position.set(pos.x, radius, pos.z);
      car.add(wg);

      // 1. Rubber Tire Tread
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.26, 36), this.tireMaterial);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wg.add(tire);

      // 2. Realistic Tire Sidewall with embossed lettering
      const sidewall = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.98, radius * 0.98, 0.27, 36), this.tireSidewallMaterial);
      sidewall.rotation.z = Math.PI / 2;
      wg.add(sidewall);

      // 3. Realistic Drilled Brake Disc & Brembo Caliper
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.62, radius * 0.62, 0.04, 32), this.brakeRotorMaterial);
      disc.rotation.z = Math.PI / 2;
      disc.position.x = pos.isLeft ? -0.06 : 0.06;
      wg.add(disc);

      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.1, radius * 0.42, 0.16), this.caliperMaterial);
      caliper.position.set(pos.isLeft ? -0.08 : 0.08, radius * 0.28, 0);
      wg.add(caliper);

      // 4. Concave Alloy Wheel Rims
      const rimLip = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.74, radius * 0.74, 0.28, 32), this.rimMaterial);
      rimLip.rotation.z = Math.PI / 2;
      wg.add(rimLip);

      if (isBus) {
        // Classic Chrome Hubcaps
        const cap = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.46, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5), this.chromeMaterial);
        cap.rotation.z = pos.isLeft ? -Math.PI / 2 : Math.PI / 2;
        cap.position.x = pos.isLeft ? -0.14 : 0.14;
        wg.add(cap);
      } else if (isCybertruck) {
        // Cyber Aero Disc Wheel Cover (angular 7-sided futuristic plate)
        const aeroMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85, metalness: 0.2 });
        const aero = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.72, radius * 0.72, 0.04, 7), aeroMat);
        aero.rotation.z = Math.PI / 2;
        aero.position.x = pos.isLeft ? -0.13 : 0.13;
        wg.add(aero);

        const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16), this.chromeMaterial);
        dot.rotation.z = Math.PI / 2;
        dot.position.x = pos.isLeft ? -0.16 : 0.16;
        wg.add(dot);
      } else if (!isTesla) {
        // Deep concave twin 5-spoke sport alloys
        for (let a = 0; a < 5; a++) {
          const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.045, radius * 1.35, 0.04), this.rimMaterial);
          spoke.rotation.x = (a * Math.PI) / 2.5;
          spoke.position.x = pos.isLeft ? -0.12 : 0.12;
          wg.add(spoke);
        }

        // Center Wheel Hub with lug nuts
        const centerHub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 24), this.chromeMaterial);
        centerHub.rotation.z = Math.PI / 2;
        centerHub.position.x = pos.isLeft ? -0.13 : 0.13;
        wg.add(centerHub);
      }

      this.wheels.push(wg);
    });
  }

  // ===================== DETAILED HEADLIGHTS & TAILLIGHTS =====================
  addDetailedHeadlights(car, positions, type = 'bmw') {
    positions.forEach(pos => {
      // Clear Polycarbonate Headlight Lens
      const lensMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.9,
        transparent: true,
        roughness: 0.05,
        clearcoat: 1.0,
        envMap: this.envTexture
      });
      const lens = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.08), lensMat);
      lens.position.set(pos.x, pos.y, pos.z);
      car.add(lens);

      // Inner LED Projector Halos (Daytime Running Lights)
      const drlColor = type === 'bmw' ? 0x60a5fa : 0xffffff;
      const drl = new THREE.Mesh(
        new THREE.TorusGeometry(0.06, 0.015, 16, 24),
        new THREE.MeshBasicMaterial({ color: drlColor })
      );
      drl.position.set(pos.x, pos.y, pos.z - 0.02);
      car.add(drl);

      // Realistic 3D Projector Spotlight illuminating the road
      const spot = new THREE.SpotLight(0xf8fafc, 14, 18, Math.PI / 5, 0.35, 1.2);
      spot.position.set(pos.x, pos.y, pos.z);
      spot.target.position.set(pos.x, 0.05, pos.z + 10);
      spot.castShadow = true;
      car.add(spot);
      car.add(spot.target);
      this.headlightSpots.push(spot);
    });
  }

  addDetailedTaillights(car, positions, type = 'bmw') {
    positions.forEach(pos => {
      const tail = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.1, 0.06),
        new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xef4444,
          emissiveIntensity: 2.2,
          roughness: 0.2
        })
      );
      tail.position.set(pos.x, pos.y, pos.z);
      car.add(tail);
    });
  }

  // ===================== LICENSE PLATES =====================
  addLicensePlates(car, text, zFront, zRear, yPos) {
    const plateTexture = createLicensePlateTexture(text);
    const plateMat = new THREE.MeshBasicMaterial({ map: plateTexture });
    const plateGeo = new THREE.PlaneGeometry(0.5, 0.13);

    const fp = new THREE.Mesh(plateGeo, plateMat);
    fp.position.set(0, yPos, zFront);
    car.add(fp);
    this.licensePlates.push(fp);

    const rp = new THREE.Mesh(plateGeo, plateMat);
    rp.position.set(0, yPos, zRear);
    rp.rotation.y = Math.PI;
    car.add(rp);
    this.licensePlates.push(rp);
  }

  // ===================== UNDERGLOW =====================
  setupUnderglow(underglowId) {
    if (this.underglowLight) {
      this.carGroup.remove(this.underglowLight);
      this.underglowLight = null;
    }

    const underglow = UNDERGLOW_COLORS.find(u => u.id === underglowId) || UNDERGLOW_COLORS[0];
    if (underglow.hex !== 'transparent') {
      const color = new THREE.Color(underglow.hex);
      this.underglowLight = new THREE.PointLight(color, 8.0, 4.0, 1.2);
      this.underglowLight.position.set(0, 0.15, 0);
      this.carGroup.add(this.underglowLight);
    }
  }

  // ===================== REALISTIC MATERIALS =====================
  createBodyMaterial(carConfig) {
    const { colorHex, colorFinish } = carConfig;
    const color = new THREE.Color(colorHex);

    if (colorFinish === 'matte') {
      return new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.7,
        metalness: 0.05,
        clearcoat: 0.0,
        envMap: this.envTexture
      });
    }

    if (colorFinish === 'metallic') {
      return new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.22,
        metalness: 0.88,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        envMap: this.envTexture
      });
    }

    if (colorFinish === 'chameleon') {
      return new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.14,
        metalness: 0.6,
        clearcoat: 1.0,
        iridescence: 1.0,
        iridescenceIOR: 1.35,
        envMap: this.envTexture
      });
    }

    // High Gloss Automotive Clearcoat
    return new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.12,
      metalness: 0.3,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      envMap: this.envTexture
    });
  }

  createSecondaryBodyMaterial(carConfig) {
    const color = new THREE.Color(carConfig.secondaryColorHex || '#f8fafc');
    return new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.15,
      metalness: 0.2,
      clearcoat: 0.95,
      envMap: this.envTexture
    });
  }

  createGlassMaterial(carConfig) {
    const tint = TINT_OPTIONS.find(t => t.id === carConfig.tintId) || TINT_OPTIONS[0];

    let tintColorHex = 0xffffff;
    let transmission = 0.88;
    let opacity = 0.55;
    let iridescence = 0.0;

    if (tint.id === 'smoke50') {
      tintColorHex = 0x334155;
      transmission = 0.55;
      opacity = 0.72;
    } else if (tint.id === 'smoke35') {
      tintColorHex = 0x1e293b;
      transmission = 0.32;
      opacity = 0.85;
    } else if (tint.id === 'dark5') {
      tintColorHex = 0x020617;
      transmission = 0.05;
      opacity = 0.97;
    } else if (tint.id === 'chameleon') {
      tintColorHex = 0x6366f1;
      transmission = 0.48;
      opacity = 0.78;
      iridescence = 1.0;
    } else if (tint.id === 'gold_mirror') {
      tintColorHex = 0xd97706;
      transmission = 0.4;
      opacity = 0.82;
    }

    return new THREE.MeshPhysicalMaterial({
      color: tintColorHex,
      transmission,
      opacity,
      transparent: true,
      roughness: 0.04,
      metalness: 0.12,
      clearcoat: 1.0,
      iridescence,
      envMap: this.envTexture
    });
  }

  updateMaterials(carConfig) {
    const bodyMat = this.createBodyMaterial(carConfig);
    this.bodyMeshes.forEach(m => {
      m.material = bodyMat;
    });

    if (this.secondaryBodyMeshes.length > 0) {
      const secMat = this.createSecondaryBodyMaterial(carConfig);
      this.secondaryBodyMeshes.forEach(m => {
        m.material = secMat;
      });
    }

    const glassMat = this.createGlassMaterial(carConfig);
    this.glassMeshes.forEach(m => {
      m.material = glassMat;
    });
  }

  updateDoors(doorId, isOpen) {
    if (!this.doorLeftPivot || !this.doorRightPivot) return;

    if (!isOpen) {
      this.doorLeftPivot.rotation.set(0, 0, 0);
      this.doorRightPivot.rotation.set(0, 0, 0);
      this.doorLeftPivot.position.z = 0.22;
      return;
    }

    if (doorId === 'scissor') {
      // Lambo Doors lift up 72 deg
      this.doorLeftPivot.rotation.set(0, 0, 1.25);
      this.doorRightPivot.rotation.set(0, 0, -1.25);
    } else if (doorId === 'falcon') {
      // Falcon Wings lift up high
      this.doorLeftPivot.rotation.set(0, 0, 1.6);
      this.doorRightPivot.rotation.set(0, 0, -1.6);
    } else if (doorId === 'sliding') {
      // Sliding Door for Bus
      this.doorLeftPivot.position.z = -0.7;
    } else if (doorId === 'suicide') {
      // Suicide doors open backwards
      this.doorLeftPivot.rotation.set(0, -0.9, 0);
      this.doorRightPivot.rotation.set(0, 0.9, 0);
    } else {
      // Standard Door swing
      this.doorLeftPivot.rotation.set(0, 0.85, 0);
      this.doorRightPivot.rotation.set(0, -0.85, 0);
    }
  }

  updateHeadlights(isOn) {
    this.headlightSpots.forEach(s => {
      s.intensity = isOn ? 14 : 0;
    });
  }
}
