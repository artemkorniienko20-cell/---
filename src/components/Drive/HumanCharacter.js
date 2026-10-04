import * as THREE from 'three';
import {
  playFootstepSound,
  playPunchSwingSound,
  playTaserSound,
  playGunshotSound,
  playHandcuffsSound,
  playExtinguisherSound,
  playGunCockSound,
  playAk47BurstSound
} from '../../utils/audioSynthesizer';

/**
 * 3D Human Character Controller:
 * - Procedural stylish humanoid model (head, torso, animated arms & legs)
 * - Walk, run, turn and collision physics
 * - Smooth step animation, footsteps audio, and punch combat moves
 * - Police profession outfit & equipped weapons (Taser, Pistol, Handcuffs)
 */
export class HumanCharacter {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.visible = false;
    this.scene.add(this.group);

    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.yaw = 0;
    this.speed = 0;
    this.walkCycle = 0;
    this.isMoving = false;
    this.isRunning = false;

    // Profession state ('civilian' | 'police')
    this.profession = 'civilian';

    // Combat & Weapon state ('fists' | 'taser' | 'pistol' | 'handcuffs')
    this.equippedWeapon = 'fists';
    this.isPunching = false;
    this.punchTimer = 0;
    this.punchHand = 'right';
    this.actionCooldown = 0;

    this.radius = 0.45; // collision cylinder radius

    this.buildCharacterMesh();
  }

  buildCharacterMesh() {
    // Materials
    this.skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.6 });
    this.jacketMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }); // Dark urban jacket
    this.shirtMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 }); // Cyan accent t-shirt
    this.pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }); // Denim jeans
    this.shoesMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 }); // White sneakers
    this.capMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.5 });

    // 1. Torso & Jacket
    this.torso = new THREE.Group();
    this.torso.position.y = 0.95;
    this.group.add(this.torso);

    this.chest = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.55, 0.26), this.jacketMat);
    this.chest.castShadow = true;
    this.torso.add(this.chest);

    this.shirt = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.27), this.shirtMat);
    this.shirt.position.y = 0.05;
    this.torso.add(this.shirt);

    // Police Badge (gold shield on chest)
    this.badgeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.3
    });
    this.policeBadge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.03), this.badgeMat);
    this.policeBadge.position.set(-0.12, 0.14, 0.14);
    this.policeBadge.visible = false;
    this.torso.add(this.policeBadge);

    // Police Chevrons / Shoulder Patches
    const patchMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    this.leftPatch = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.08), patchMat);
    this.leftPatch.position.set(-0.23, 0.18, 0);
    this.leftPatch.visible = false;
    this.torso.add(this.leftPatch);

    this.rightPatch = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.08), patchMat);
    this.rightPatch.position.set(0.23, 0.18, 0);
    this.rightPatch.visible = false;
    this.torso.add(this.rightPatch);

    // 2. Head & Cap
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), this.skinMat);
    head.position.y = 0.42;
    head.castShadow = true;
    this.torso.add(head);

    // Stylish Cap
    this.cap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.07, 16), this.capMat);
    this.cap.position.set(0, 0.52, 0);
    this.torso.add(this.cap);

    this.visor = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.12), this.capMat);
    this.visor.position.set(0, 0.50, 0.14);
    this.torso.add(this.visor);

    // Police Cockade on Cap
    this.policeCockade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 })
    );
    this.policeCockade.rotation.x = Math.PI / 2;
    this.policeCockade.position.set(0, 0.53, 0.15);
    this.policeCockade.visible = false;
    this.torso.add(this.policeCockade);

    // 3. Left & Right Arm Pivots
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.28, 0.22, 0);
    this.torso.add(this.leftArmPivot);

    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.48, 0.12), this.jacketMat);
    leftArm.position.y = -0.22;
    leftArm.castShadow = true;
    this.leftArmPivot.add(leftArm);

    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), this.skinMat);
    leftHand.position.y = -0.48;
    this.leftArmPivot.add(leftHand);

    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.28, 0.22, 0);
    this.torso.add(this.rightArmPivot);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.48, 0.12), this.jacketMat);
    rightArm.position.y = -0.22;
    rightArm.castShadow = true;
    this.rightArmPivot.add(rightArm);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), this.skinMat);
    rightHand.position.y = -0.48;
    this.rightArmPivot.add(rightHand);

    // Attach Weapons to Right Hand
    this.buildWeapons(rightHand);

    // 4. Left & Right Leg Pivots
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.13, 0.68, 0);
    this.group.add(this.leftLegPivot);

    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 0.15), this.pantsMat);
    leftLeg.position.y = -0.28;
    leftLeg.castShadow = true;
    this.leftLegPivot.add(leftLeg);

    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.22), this.shoesMat);
    leftShoe.position.set(0, -0.62, 0.03);
    leftShoe.castShadow = true;
    this.leftLegPivot.add(leftShoe);

    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.13, 0.68, 0);
    this.group.add(this.rightLegPivot);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 0.15), this.pantsMat);
    rightLeg.position.y = -0.28;
    rightLeg.castShadow = true;
    this.rightLegPivot.add(rightLeg);

    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.22), this.shoesMat);
    rightShoe.position.set(0, -0.62, 0.03);
    rightShoe.castShadow = true;
    this.rightLegPivot.add(rightShoe);
  }

  buildWeapons(handMesh) {
    // 1. Taser (yellow/black stun gun)
    this.taserGroup = new THREE.Group();
    const taserBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.10, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }) // Bright yellow
    );
    const taserGrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.08, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 })
    );
    taserGrip.position.set(0, -0.07, -0.04);
    const taserProngs = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.03, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 })
    );
    taserProngs.position.set(0, 0.02, 0.10);
    this.taserGroup.add(taserBody);
    this.taserGroup.add(taserGrip);
    this.taserGroup.add(taserProngs);
    this.taserGroup.position.set(0, -0.03, 0.1);
    this.taserGroup.visible = false;
    handMesh.add(this.taserGroup);

    // 2. Pistol (9mm black police handgun)
    this.pistolGroup = new THREE.Group();
    const pistolSlide = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.07, 0.20),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.2 })
    );
    const pistolGrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.10, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 })
    );
    pistolGrip.position.set(0, -0.07, -0.05);
    this.pistolGroup.add(pistolSlide);
    this.pistolGroup.add(pistolGrip);
    this.pistolGroup.position.set(0, -0.03, 0.1);
    this.pistolGroup.visible = false;
    handMesh.add(this.pistolGroup);

    // 3. Handcuffs (metallic dual cuffs)
    this.handcuffsGroup = new THREE.Group();
    const cuffMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.1 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 16), cuffMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 16), cuffMat);
    ring2.position.set(0, -0.06, 0.04);
    ring2.rotation.x = 0.5;
    this.handcuffsGroup.add(ring1);
    this.handcuffsGroup.add(ring2);
    this.handcuffsGroup.position.set(0, -0.05, 0.08);
    this.handcuffsGroup.visible = false;
    handMesh.add(this.handcuffsGroup);

    // 4. Pepper Spray canister (Терен-4М)
    this.sprayGroup = new THREE.Group();
    const sprayCan = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.12, 12),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 }) // Red can
    );
    const sprayCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.03, 12),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 })
    );
    sprayCap.position.y = 0.07;
    this.sprayGroup.add(sprayCan);
    this.sprayGroup.add(sprayCap);
    this.sprayGroup.position.set(0, -0.04, 0.09);
    this.sprayGroup.visible = false;
    handMesh.add(this.sprayGroup);

    // 5. Rubber Baton (ПР-73)
    this.batonGroup = new THREE.Group();
    const batonShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.022, 0.45, 12),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 })
    );
    const batonHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.12, 12),
      new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.9 })
    );
    batonHandle.rotation.z = Math.PI / 2;
    batonHandle.position.set(0.06, -0.12, 0);
    this.batonGroup.add(batonShaft);
    this.batonGroup.add(batonHandle);
    this.batonGroup.position.set(0, -0.08, 0.12);
    this.batonGroup.rotation.x = Math.PI / 4;
    this.batonGroup.visible = false;
    handMesh.add(this.batonGroup);

    // 6. Pump-Action Shotgun (Hatsan Escort)
    this.shotgunGroup = new THREE.Group();
    const shotgunBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.55, 12),
      new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.85, roughness: 0.25 })
    );
    shotgunBarrel.rotation.x = Math.PI / 2;
    shotgunBarrel.position.set(0, 0, 0.2);
    const shotgunStock = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.10, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 }) // Wooden stock
    );
    shotgunStock.position.set(0, -0.05, -0.12);
    const shotgunPump = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, 0.14, 12),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 })
    );
    shotgunPump.rotation.x = Math.PI / 2;
    shotgunPump.position.set(0, -0.02, 0.16);
    this.shotgunGroup.add(shotgunBarrel);
    this.shotgunGroup.add(shotgunStock);
    this.shotgunGroup.add(shotgunPump);
    this.shotgunGroup.position.set(0, -0.05, 0.14);
    this.shotgunGroup.visible = false;
    handMesh.add(this.shotgunGroup);

    // 7. Military AK-74 Assault Rifle (Калашников 5.45мм ЗСУ)
    this.ak74Group = new THREE.Group();
    const akBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.65, 12),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.85, roughness: 0.25 })
    );
    akBarrel.rotation.x = Math.PI / 2;
    akBarrel.position.set(0, 0.02, 0.25);

    const akReceiver = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.08, 0.32),
      new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.7, roughness: 0.3 })
    );
    akReceiver.position.set(0, 0, 0);

    const akHandguard = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.07, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x54260d, roughness: 0.6 }) // Bakelite / plum handguard
    );
    akHandguard.position.set(0, 0.01, 0.18);

    const akStock = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.11, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x54260d, roughness: 0.6 })
    );
    akStock.position.set(0, -0.04, -0.22);

    const akGrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.11, 0.055),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
    );
    akGrip.position.set(0, -0.08, -0.04);
    akGrip.rotation.x = 0.25;

    // Curved orange-brown Bakelite magazine (Ріжок 5.45)
    const akMag = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.18, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.5 })
    );
    akMag.position.set(0, -0.12, 0.08);
    akMag.rotation.x = -0.3;

    // Muzzle brake (Дульне гальмо-компенсатор)
    const akMuzzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.08, 10),
      new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.9 })
    );
    akMuzzle.rotation.x = Math.PI / 2;
    akMuzzle.position.set(0, 0.02, 0.6);

    this.ak74Group.add(akBarrel);
    this.ak74Group.add(akReceiver);
    this.ak74Group.add(akHandguard);
    this.ak74Group.add(akStock);
    this.ak74Group.add(akGrip);
    this.ak74Group.add(akMag);
    this.ak74Group.add(akMuzzle);
    this.ak74Group.position.set(0, -0.05, 0.16);
    this.ak74Group.visible = false;
    handMesh.add(this.ak74Group);

    // 8. MANPADS Stinger / Igla PZRK (ПЗРК ППО для збиття шахедів)
    this.stingerGroup = new THREE.Group();
    const stingerTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.95, 14),
      new THREE.MeshStandardMaterial({ color: 0x365314, roughness: 0.6 }) // Tactical olive green tube
    );
    stingerTube.rotation.x = Math.PI / 2;
    stingerTube.position.set(0, 0.08, 0.22);

    const stingerSight = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.11, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4 })
    );
    stingerSight.position.set(-0.05, 0.14, 0.28);

    const stingerGrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.14, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 })
    );
    stingerGrip.position.set(0, -0.05, 0.06);

    this.stingerGroup.add(stingerTube);
    this.stingerGroup.add(stingerSight);
    this.stingerGroup.add(stingerGrip);
    this.stingerGroup.position.set(0, -0.04, 0.12);
    this.stingerGroup.visible = false;
    handMesh.add(this.stingerGroup);

    // 9. FPV Drone Remote Controller (Пульт FPV з антеною)
    this.droneControllerGroup = new THREE.Group();
    const remoteBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.04, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 })
    );
    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.12, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    );
    screenMesh.rotation.x = -Math.PI / 2;
    screenMesh.position.set(0, 0.021, 0);

    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.18, 8),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 })
    );
    antenna.position.set(0.06, 0.08, 0.06);
    antenna.rotation.z = -0.2;

    this.droneControllerGroup.add(remoteBody);
    this.droneControllerGroup.add(screenMesh);
    this.droneControllerGroup.add(antenna);
    this.droneControllerGroup.position.set(0, -0.02, 0.12);
    this.droneControllerGroup.visible = false;
    handMesh.add(this.droneControllerGroup);
  }

  setProfession(profession) {
    this.profession = profession;
    if (profession === 'police') {
      // Police Uniform Colors: dark navy blue jacket & tactical pants
      this.jacketMat.color.setHex(0x0f172a);
      this.shirtMat.color.setHex(0x1e3a8a);
      this.pantsMat.color.setHex(0x090d16);
      this.capMat.color.setHex(0x0f172a);
      this.shoesMat.color.setHex(0x090d16);
      this.policeBadge.visible = true;
      this.leftPatch.visible = true;
      this.rightPatch.visible = true;
      this.policeCockade.visible = true;
    } else if (profession === 'army') {
      // Armed Forces of Ukraine (ЗСУ) Pixel Camouflage MM-14
      this.jacketMat.color.setHex(0x3a4d39); // Tactical olive pixel
      this.shirtMat.color.setHex(0x283621);
      this.pantsMat.color.setHex(0x35432c);
      this.capMat.color.setHex(0x2a3824);
      this.shoesMat.color.setHex(0x18181b); // Tactical combat boots
      this.policeBadge.visible = false;
      this.leftPatch.visible = true; // Ukrainian Chevron Flag
      this.rightPatch.visible = true; // Ukrainian Chevron Flag
      this.policeCockade.visible = false;
    } else {
      // Civilian Urban Colors
      this.jacketMat.color.setHex(0x1e293b);
      this.shirtMat.color.setHex(0x0284c7);
      this.pantsMat.color.setHex(0x334155);
      this.capMat.color.setHex(0x090d16);
      this.shoesMat.color.setHex(0xf8fafc);
      this.policeBadge.visible = false;
      this.leftPatch.visible = false;
      this.rightPatch.visible = false;
      this.policeCockade.visible = false;
      this.setEquippedWeapon('fists');
    }
  }

  setEquippedWeapon(weapon) {
    this.equippedWeapon = weapon;
    if (this.taserGroup) this.taserGroup.visible = weapon === 'taser';
    if (this.pistolGroup) this.pistolGroup.visible = weapon === 'pistol';
    if (this.handcuffsGroup) this.handcuffsGroup.visible = weapon === 'handcuffs';
    if (this.sprayGroup) this.sprayGroup.visible = weapon === 'spray';
    if (this.batonGroup) this.batonGroup.visible = weapon === 'baton';
    if (this.shotgunGroup) this.shotgunGroup.visible = weapon === 'shotgun';
    if (this.ak74Group) this.ak74Group.visible = weapon === 'ak74';
    if (this.stingerGroup) this.stingerGroup.visible = weapon === 'stinger';
    if (this.droneControllerGroup) this.droneControllerGroup.visible = weapon === 'drone';
  }

  triggerWeaponAction() {
    if (this.actionCooldown > 0) return null;

    if (this.equippedWeapon === 'fists') {
      const punchSuccess = this.triggerPunch();
      return punchSuccess ? { type: 'fists', range: 2.2, damage: 25 } : null;
    } else if (this.equippedWeapon === 'taser') {
      playTaserSound();
      this.actionCooldown = 0.55;
      this.isPunching = true;
      this.punchTimer = 0.28;
      this.punchHand = 'right';
      return { type: 'taser', range: 9.5, stunDuration: 4.0 };
    } else if (this.equippedWeapon === 'pistol') {
      playGunshotSound();
      this.actionCooldown = 0.45;
      this.isPunching = true;
      this.punchTimer = 0.25;
      this.punchHand = 'right';
      return { type: 'pistol', range: 35.0, damage: 65 };
    } else if (this.equippedWeapon === 'handcuffs') {
      playHandcuffsSound();
      this.actionCooldown = 0.6;
      this.isPunching = true;
      this.punchTimer = 0.28;
      this.punchHand = 'right';
      return { type: 'handcuffs', range: 2.8 };
    } else if (this.equippedWeapon === 'spray') {
      playExtinguisherSound();
      this.actionCooldown = 0.55;
      this.isPunching = true;
      this.punchTimer = 0.28;
      this.punchHand = 'right';
      return { type: 'spray', range: 4.8, stunDuration: 5.0 };
    } else if (this.equippedWeapon === 'baton') {
      playPunchSwingSound();
      this.actionCooldown = 0.35;
      this.isPunching = true;
      this.punchTimer = 0.22;
      this.punchHand = 'right';
      return { type: 'baton', range: 2.6, damage: 50 };
    } else if (this.equippedWeapon === 'shotgun') {
      playGunshotSound();
      this.actionCooldown = 0.8;
      this.isPunching = true;
      this.punchTimer = 0.32;
      this.punchHand = 'right';
      return { type: 'shotgun', range: 28.0, damage: 120 };
    } else if (this.equippedWeapon === 'ak74') {
      playAk47BurstSound();
      this.actionCooldown = 0.35;
      this.isPunching = true;
      this.punchTimer = 0.22;
      this.punchHand = 'right';
      return { type: 'ak74', range: 175.0, damage: 190, isAntiAir: true };
    } else if (this.equippedWeapon === 'stinger') {
      playGunshotSound();
      this.actionCooldown = 1.2;
      this.isPunching = true;
      this.punchTimer = 0.35;
      this.punchHand = 'right';
      return { type: 'stinger', range: 280.0, damage: 600, isAntiAir: true, isMissile: true };
    } else if (this.equippedWeapon === 'drone') {
      this.actionCooldown = 0.6;
      return { type: 'drone' };
    }
    return null;
  }

  spawn(x, z, yaw = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.yaw = yaw;
    this.speed = 0;
    this.walkCycle = 0;
    this.group.position.set(x, y, z);
    this.group.rotation.y = yaw;
    this.group.visible = true;
  }

  despawn() {
    this.group.visible = false;
  }

  triggerPunch() {
    if (this.punchTimer > 0.08) return false;
    this.isPunching = true;
    this.punchTimer = 0.25;
    this.punchHand = this.punchHand === 'right' ? 'left' : 'right';
    playPunchSwingSound();
    return true;
  }

  update(keys, dt, colliders = []) {
    if (!this.group.visible) return null;

    if (this.actionCooldown > 0) this.actionCooldown -= dt;

    // 1. Steering & Rotation
    const turnSpeed = 3.6;
    if (keys.steerLeft) {
      this.yaw += turnSpeed * dt;
    }
    if (keys.steerRight) {
      this.yaw -= turnSpeed * dt;
    }

    // 2. Movement direction
    let moveForward = 0;
    if (keys.throttle) moveForward += 1;
    if (keys.brake) moveForward -= 0.6; // walk backward slower

    this.isRunning = keys.handbrake; // Space or Shift to sprint
    const baseWalkSpeed = 4.8; // ~17 km/h
    const sprintSpeed = 8.5; // ~30 km/h
    const targetSpeed = moveForward * (this.isRunning ? sprintSpeed : baseWalkSpeed);

    // Smooth acceleration
    this.speed += (targetSpeed - this.speed) * 10 * dt;
    if (Math.abs(this.speed) < 0.05) this.speed = 0;

    this.isMoving = Math.abs(this.speed) > 0.1;

    // 3. Position update
    let nextX = this.x + Math.sin(this.yaw) * this.speed * dt;
    let nextZ = this.z + Math.cos(this.yaw) * this.speed * dt;

    // 4. Collision with world colliders
    for (let c of colliders) {
      if (c.type === 'circle') {
        const dx = nextX - c.x;
        const dz = nextZ - c.z;
        const dist = Math.hypot(dx, dz);
        const minDist = c.radius + this.radius;
        if (dist < minDist && dist > 0.0001) {
          const overlap = minDist - dist;
          nextX += (dx / dist) * overlap;
          nextZ += (dz / dist) * overlap;
        }
      } else if (c.type === 'box') {
        const halfW = c.width / 2;
        const halfD = c.depth / 2;
        const closestX = Math.max(c.x - halfW, Math.min(c.x + halfW, nextX));
        const closestZ = Math.max(c.z - halfD, Math.min(c.z + halfD, nextZ));
        const dx = nextX - closestX;
        const dz = nextZ - closestZ;
        const distSq = dx * dx + dz * dz;

        if (distSq < this.radius * this.radius && distSq > 0.00001) {
          const dist = Math.sqrt(distSq);
          const push = this.radius - dist;
          nextX += (dx / dist) * push;
          nextZ += (dz / dist) * push;
        }
      }
    }

    this.x = nextX;
    this.z = nextZ;

    this.group.position.set(this.x, this.y, this.z);
    this.group.rotation.y = this.yaw;

    // 5. Procedural Walking & Arm Swing Animation
    if (this.isMoving) {
      const stepRate = (this.isRunning ? 16 : 10) * (this.speed > 0 ? 1 : -0.7);
      this.walkCycle += stepRate * dt;

      const legAngle = Math.sin(this.walkCycle) * (this.isRunning ? 0.8 : 0.55);
      this.leftLegPivot.rotation.x = legAngle;
      this.rightLegPivot.rotation.x = -legAngle;

      if (!this.isPunching) {
        this.leftArmPivot.rotation.x = -legAngle * 0.75;
        this.rightArmPivot.rotation.x = legAngle * 0.75;
      }

      // Slight vertical bob
      this.torso.position.y = 0.95 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.04;

      // Footstep sound tick
      if (Math.sin(this.walkCycle) > 0.92) {
        playFootstepSound();
      }
    } else {
      // Idle pose
      this.leftLegPivot.rotation.x *= 0.85;
      this.rightLegPivot.rotation.x *= 0.85;
      if (!this.isPunching) {
        this.leftArmPivot.rotation.x *= 0.85;
        this.rightArmPivot.rotation.x *= 0.85;
        this.leftArmPivot.rotation.y = 0;
        this.rightArmPivot.rotation.y = 0;
        this.torso.rotation.y = 0;
      }
      this.torso.position.y = 0.95;
    }

    // 6. Punch attack animation
    let punchJustHit = false;
    if (this.isPunching) {
      const prevTimer = this.punchTimer;
      this.punchTimer -= dt;
      if (prevTimer >= 0.12 && this.punchTimer < 0.12) {
        punchJustHit = true; // mid-swing impact frame
      }
      if (this.punchTimer <= 0) {
        this.isPunching = false;
        this.punchTimer = 0;
        this.leftArmPivot.rotation.y = 0;
        this.rightArmPivot.rotation.y = 0;
        this.torso.rotation.y = 0;
      } else {
        const progress = 1 - (this.punchTimer / 0.25);
        const swing = Math.sin(progress * Math.PI);
        if (this.punchHand === 'right') {
          this.rightArmPivot.rotation.x = -Math.PI / 2 + swing * 0.4;
          this.rightArmPivot.rotation.y = -0.35 * swing;
          this.torso.rotation.y = -0.28 * swing;
        } else {
          this.leftArmPivot.rotation.x = -Math.PI / 2 + swing * 0.4;
          this.leftArmPivot.rotation.y = 0.35 * swing;
          this.torso.rotation.y = 0.28 * swing;
        }
      }
    }

    return {
      x: this.x,
      y: this.y,
      z: this.z,
      yaw: this.yaw,
      speedKmh: Math.round(Math.abs(this.speed) * 3.6),
      isMoving: this.isMoving,
      isRunning: this.isRunning,
      isPunching: this.isPunching,
      punchJustHit
    };
  }

  destroy() {
    if (this.group && this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
