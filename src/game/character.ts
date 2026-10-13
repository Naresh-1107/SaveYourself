import * as THREE from 'three';

export interface CharacterRig {
  group: THREE.Group;
  head: THREE.Mesh;
  visor: THREE.Mesh;
  body: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  backpack: THREE.Mesh;
  animate: (isMoving: boolean, deltaTime: number) => void;
  setEmissiveIntensity?: (intensity: number) => void;
}

export function createCharacter(isEcho: boolean = false): CharacterRig {
  const group = new THREE.Group();

  // Materials
  const baseColor = isEcho ? 0x00d4ff : 0x222a36; // Slate graphite or electric cyan
  const accentColor = isEcho ? 0x00e5ff : 0xf59e0b; // Amber warning stripes on player
  const visorColor = isEcho ? 0x80f3ff : 0x00e5ff; // Cyan glowing visor
  const metalColor = isEcho ? 0x0099cc : 0x64748b;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: isEcho ? 0.2 : 0.45,
    metalness: isEcho ? 0.7 : 0.6,
    transparent: isEcho,
    opacity: isEcho ? 0.55 : 1.0,
    emissive: isEcho ? 0x004466 : 0x05070a,
    emissiveIntensity: isEcho ? 0.8 : 0.2,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.3,
    metalness: 0.5,
    transparent: isEcho,
    opacity: isEcho ? 0.6 : 1.0,
    emissive: accentColor,
    emissiveIntensity: isEcho ? 0.9 : 0.4,
  });

  const visorMat = new THREE.MeshStandardMaterial({
    color: visorColor,
    roughness: 0.1,
    metalness: 0.9,
    emissive: visorColor,
    emissiveIntensity: isEcho ? 1.4 : 0.8,
    transparent: isEcho,
    opacity: isEcho ? 0.75 : 1.0,
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: metalColor,
    roughness: 0.35,
    metalness: 0.8,
    transparent: isEcho,
    opacity: isEcho ? 0.5 : 1.0,
  });

  // Torso
  const torsoGeo = new THREE.BoxGeometry(0.5, 0.65, 0.32);
  const body = new THREE.Mesh(torsoGeo, bodyMat);
  body.position.y = 0.95;
  body.castShadow = !isEcho;
  body.receiveShadow = !isEcho;
  group.add(body);

  // Inspector Badge / Chest Stripe
  const stripeGeo = new THREE.BoxGeometry(0.32, 0.1, 0.34);
  const stripe = new THREE.Mesh(stripeGeo, accentMat);
  stripe.position.set(0, 0.1, 0);
  body.add(stripe);

  // Backpack / Atmospheric Unit
  const packGeo = new THREE.BoxGeometry(0.36, 0.45, 0.18);
  const backpack = new THREE.Mesh(packGeo, metalMat);
  backpack.position.set(0, 0.05, -0.22);
  body.add(backpack);

  // Backpack Status LED
  const ledGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const ledMat = new THREE.MeshBasicMaterial({ color: isEcho ? 0x00ffff : 0x10b981 });
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.position.set(0.1, 0.15, -0.1);
  backpack.add(led);

  // Head & Helmet
  const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.position.y = 1.48;
  head.castShadow = !isEcho;
  group.add(head);

  // Visor
  const visorGeo = new THREE.BoxGeometry(0.26, 0.14, 0.18);
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 0, 0.15);
  head.add(visor);

  // Left Arm
  const armGeo = new THREE.BoxGeometry(0.14, 0.52, 0.16);
  const leftArm = new THREE.Mesh(armGeo, bodyMat);
  leftArm.position.set(-0.35, 0.88, 0);
  leftArm.castShadow = !isEcho;
  group.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Mesh(armGeo, bodyMat);
  rightArm.position.set(0.35, 0.88, 0);
  rightArm.castShadow = !isEcho;
  group.add(rightArm);

  // Left Leg
  const legGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
  const leftLeg = new THREE.Mesh(legGeo, metalMat);
  leftLeg.position.set(-0.16, 0.35, 0);
  leftLeg.castShadow = !isEcho;
  group.add(leftLeg);

  // Right Leg
  const rightLeg = new THREE.Mesh(legGeo, metalMat);
  rightLeg.position.set(0.16, 0.35, 0);
  rightLeg.castShadow = !isEcho;
  group.add(rightLeg);

  // Echo special effect: subtle pulsing outer aura ring
  if (isEcho) {
    const ringGeo = new THREE.RingGeometry(0.4, 0.65, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    group.add(ring);
  }

  // Animation controller
  let walkPhase = 0;
  const animate = (isMoving: boolean, deltaTime: number) => {
    if (isMoving) {
      walkPhase += deltaTime * 9.5;
      const swing = Math.sin(walkPhase) * 0.45;
      leftLeg.rotation.x = swing;
      rightLeg.rotation.x = -swing;
      leftArm.rotation.x = -swing * 0.8;
      rightArm.rotation.x = swing * 0.8;
      body.position.y = 0.95 + Math.abs(Math.sin(walkPhase * 2)) * 0.04;
      head.position.y = 1.48 + Math.abs(Math.sin(walkPhase * 2)) * 0.04;
    } else {
      // Return to resting idle
      walkPhase = 0;
      leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, 0.2);
      rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, 0.2);
      leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0, 0.2);
      rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0, 0.2);
      body.position.y = THREE.MathUtils.lerp(body.position.y, 0.95, 0.2);
      head.position.y = THREE.MathUtils.lerp(head.position.y, 1.48, 0.2);
    }
  };

  return {
    group,
    head,
    visor,
    body,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    backpack,
    animate,
  };
}
