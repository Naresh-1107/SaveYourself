import * as THREE from 'three';

export interface LabSceneObjects {
  scene: THREE.Scene;
  pressurePlateGroup: THREE.Group;
  pressurePlatePad: THREE.Mesh;
  pressurePlateRing: THREE.Mesh;
  plateLight: THREE.PointLight;
  conduitLights: THREE.Mesh[];
  terminalConsole: THREE.Group;
  terminalScreen: THREE.Mesh;
  terminalBeacon: THREE.Mesh;
  terminalLight: THREE.PointLight;
  doorLeft: THREE.Mesh;
  doorRight: THREE.Mesh;
  doorLight: THREE.PointLight;
  doorStatusBeacon: THREE.Mesh;
  exitWaypointMarker: THREE.Group;
  cleanUp: () => void;
  updateConduits: (isPowered: boolean, time: number) => void;
  updateDoor: (isOpen: boolean, delta: number) => void;
  updatePlate: (isPressed: boolean, delta: number) => void;
  updateWaypoint: (doorUnlocked: boolean, time: number) => void;
  updateLevelEffects?: (time: number, delta: number) => void;
}

function createSignTexture(
  mainText: string,
  subText: string,
  bgColor: string,
  textColor: string,
  borderColor: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 1024, 256);

  // High-visibility hazard striped outer border
  ctx.lineWidth = 14;
  ctx.strokeStyle = borderColor;
  ctx.strokeRect(7, 7, 1010, 242);

  // Chevron symbols
  ctx.fillStyle = borderColor;
  ctx.font = 'bold 54px monospace';
  ctx.fillText('◄◄◄', 40, 145);
  ctx.fillText('►►►', 860, 145);

  // Main Headline
  ctx.font = 'bold 72px sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(mainText, 512, 100);

  // Subtext status
  ctx.font = 'bold 36px monospace';
  ctx.fillStyle = textColor;
  ctx.fillText(subText, 512, 185);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Procedural Tree Generator for Level 2 Natural Environment
function createTree(scale: number = 1.0, isPine: boolean = true): THREE.Group {
  const group = new THREE.Group();

  // Bark trunk
  const trunkGeo = new THREE.CylinderGeometry(0.18 * scale, 0.32 * scale, 2.2 * scale, 8);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x5c3317,
    roughness: 0.9,
    metalness: 0.1,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.1 * scale;
  trunk.castShadow = true;
  group.add(trunk);

  if (isPine) {
    // Layered Pine needles
    const pineColors = [0x15803d, 0x166534, 0x14532d];
    for (let i = 0; i < 3; i++) {
      const coneGeo = new THREE.ConeGeometry((1.4 - i * 0.3) * scale, (1.6 - i * 0.2) * scale, 8);
      const coneMat = new THREE.MeshStandardMaterial({
        color: pineColors[i],
        roughness: 0.8,
        flatShading: true,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = (2.2 + i * 0.9) * scale;
      cone.castShadow = true;
      group.add(cone);
    }
  } else {
    // Deciduous lush leafy canopy
    const leafGeo = new THREE.DodecahedronGeometry(1.3 * scale, 1);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.8,
      flatShading: true,
    });
    const foliage = new THREE.Mesh(leafGeo, leafMat);
    foliage.position.y = 2.8 * scale;
    foliage.castShadow = true;
    group.add(foliage);
  }

  return group;
}

// Procedural Boulder Generator for Level 2
function createBoulder(scale: number = 1.0): THREE.Mesh {
  const geo = new THREE.DodecahedronGeometry(0.8 * scale, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.85,
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.4 * scale;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function buildLaboratory(scene: THREE.Scene, level: 1 | 2 = 1): LabSceneObjects {
  const createdObjects: THREE.Object3D[] = [];
  const isLevel2 = level === 2;

  // 1. ATMOSPHERE, SKY & LIGHTING
  let cloudsGroup: THREE.Group | null = null;

  if (isLevel2) {
    // LEVEL 2: BRILLIANT NATURAL SUNLIT MEADOW & ALPINE SANCTUARY
    scene.background = new THREE.Color(0x38bdf8); // Vivid azure blue sky
    scene.fog = new THREE.Fog(0x93c5fd, 25, 70); // Gentle morning horizon haze

    // Radiant natural sun
    const sunLight = new THREE.DirectionalLight(0xffedd5, 2.6);
    sunLight.position.set(10, 20, 12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 45;
    sunLight.shadow.camera.left = -16;
    sunLight.shadow.camera.right = 16;
    sunLight.shadow.camera.top = 16;
    sunLight.shadow.camera.bottom = -16;
    scene.add(sunLight);
    createdObjects.push(sunLight);

    // Natural Sky & Green Grass bounce light
    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x15803d, 1.6);
    scene.add(hemiLight);
    createdObjects.push(hemiLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    createdObjects.push(ambientLight);

    // Soft drifting procedural 3D clouds overhead
    cloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      transparent: true,
      opacity: 0.85,
    });
    for (let c = 0; c < 8; c++) {
      const cloud = new THREE.Group();
      const numPuffs = 3 + Math.floor(Math.random() * 3);
      for (let p = 0; p < numPuffs; p++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(1.2 + Math.random() * 0.8, 8, 8), cloudMat);
        puff.position.set(p * 1.4 - 2.0, Math.random() * 0.4, (Math.random() - 0.5) * 1.5);
        puff.scale.set(1.4, 0.7, 1.1);
        cloud.add(puff);
      }
      cloud.position.set(
        (Math.random() - 0.5) * 36,
        14 + Math.random() * 4,
        (Math.random() - 0.5) * 36
      );
      cloudsGroup.add(cloud);
    }
    scene.add(cloudsGroup);
    createdObjects.push(cloudsGroup);

  } else {
    // LEVEL 1: HIGH-TECH LAB WITH CLEAR CRISP VISIBILITY
    scene.background = new THREE.Color(0x0b111e);
    // Use soft linear fog instead of heavy exponential fog so exit is crystal clear from spawn
    scene.fog = new THREE.Fog(0x0b111e, 22, 60);

    const mainLight = new THREE.DirectionalLight(0xdbeafe, 1.8);
    mainLight.position.set(6, 14, 8);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 35;
    mainLight.shadow.camera.left = -14;
    mainLight.shadow.camera.right = 14;
    mainLight.shadow.camera.top = 16;
    mainLight.shadow.camera.bottom = -16;
    scene.add(mainLight);
    createdObjects.push(mainLight);

    const ambientLight = new THREE.AmbientLight(0x334155, 1.5);
    scene.add(ambientLight);
    createdObjects.push(ambientLight);

    const fillLight = new THREE.DirectionalLight(0x0284c7, 1.1);
    fillLight.position.set(-8, 8, -4);
    scene.add(fillLight);
    createdObjects.push(fillLight);
  }

  // 2. GROUND & TERRAIN
  if (isLevel2) {
    // Vibrant lush green natural meadow
    const meadowGeo = new THREE.PlaneGeometry(32, 38);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a, // Fresh spring emerald grass
      roughness: 0.85,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(meadowGeo, grassMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
    createdObjects.push(floorMesh);

    // Natural stone flagstone pathway leading straight to the exit
    const pathGeo = new THREE.PlaneGeometry(3.2, 24);
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Natural river stone pavers
      roughness: 0.75,
      metalness: 0.1,
    });
    const stonePath = new THREE.Mesh(pathGeo, pathMat);
    stonePath.rotation.x = -Math.PI / 2;
    stonePath.position.set(0, 0.008, -1.5);
    stonePath.receiveShadow = true;
    scene.add(stonePath);
    createdObjects.push(stonePath);

    // Lateral stone stepping path from center to pressure plate
    const platePath = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 2.0), pathMat);
    platePath.rotation.x = -Math.PI / 2;
    platePath.position.set(-3.2, 0.007, 1.5);
    scene.add(platePath);
    createdObjects.push(platePath);

    // Lateral stone stepping path from center to research console
    const terminalPath = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 2.0), pathMat);
    terminalPath.rotation.x = -Math.PI / 2;
    terminalPath.position.set(3.2, 0.007, -2.5);
    scene.add(terminalPath);
    createdObjects.push(terminalPath);

    // A sparkling babbling brook / stream flowing along eastern border (X ~ 7.5 to 8.5)
    const streamGeo = new THREE.PlaneGeometry(2.4, 26);
    const streamMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.7,
      transparent: true,
      opacity: 0.8,
    });
    const stream = new THREE.Mesh(streamGeo, streamMat);
    stream.rotation.x = -Math.PI / 2;
    stream.position.set(8.2, 0.015, 0);
    scene.add(stream);
    createdObjects.push(stream);

    // Wildflowers scattered along the meadow
    const flowerColors = [0xef4444, 0x38bdf8, 0xfacc15, 0xc084fc, 0xffffff];
    for (let f = 0; f < 36; f++) {
      const fx = (Math.random() - 0.5) * 16;
      const fz = (Math.random() - 0.5) * 20;
      if (Math.abs(fx) < 1.8 && fz < 7.0 && fz > -11.0) continue; // keep main walkway clear

      const flGeo = new THREE.SphereGeometry(0.12, 6, 6);
      const flMat = new THREE.MeshStandardMaterial({
        color: flowerColors[f % flowerColors.length],
        roughness: 0.5,
      });
      const flower = new THREE.Mesh(flGeo, flMat);
      flower.position.set(fx, 0.12, fz);
      scene.add(flower);
      createdObjects.push(flower);
    }

  } else {
    // LEVEL 1: Reflective high-tech industrial laboratory floor
    const floorGeo = new THREE.PlaneGeometry(22, 28);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep slate navy
      roughness: 0.35,
      metalness: 0.55,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
    createdObjects.push(floorMesh);

    // Grid lines
    const gridHelper = new THREE.GridHelper(24, 24, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);
    createdObjects.push(gridHelper);
  }

  // 3. HIGH-VISIBILITY FLOOR RUNWAY ILLUMINATION POINTING STRAIGHT TO THE EXIT
  // A glowing center navigation strip from spawn (Z = 7) straight down to the exit (Z = -11.5)
  for (let z = 6.0; z >= -10.5; z -= 2.0) {
    const chevGeo = new THREE.ConeGeometry(0.55, 0.85, 3);
    const chevMat = new THREE.MeshBasicMaterial({
      color: isLevel2 ? 0x0284c7 : 0x00ffff,
    });
    const chev = new THREE.Mesh(chevGeo, chevMat);
    chev.rotation.x = -Math.PI / 2;
    chev.rotation.z = Math.PI; // point north (-Z) towards exit
    chev.position.set(0, 0.02, z);
    scene.add(chev);
    createdObjects.push(chev);

    // Flanking guide lights
    const sideLampGeo = new THREE.BoxGeometry(0.15, 0.04, 0.8);
    const sideLampMat = new THREE.MeshBasicMaterial({
      color: isLevel2 ? 0x38bdf8 : 0x00e5ff,
    });
    const leftLamp = new THREE.Mesh(sideLampGeo, sideLampMat);
    leftLamp.position.set(-1.6, 0.02, z);
    scene.add(leftLamp);
    createdObjects.push(leftLamp);

    const rightLamp = new THREE.Mesh(sideLampGeo, sideLampMat);
    rightLamp.position.set(1.6, 0.02, z);
    scene.add(rightLamp);
    createdObjects.push(rightLamp);
  }

  // 4. BOUNDARIES & ARCHITECTURE
  if (isLevel2) {
    // LEVEL 2 NATURAL FOREST & STONE PERIMETER
    const stoneWallMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.85,
      metalness: 0.1,
    });

    // North rock ridge (leaving central exit open)
    const leftRidge = new THREE.Mesh(new THREE.BoxGeometry(8, 4.0, 1.2), stoneWallMat);
    leftRidge.position.set(-6, 2.0, -12);
    leftRidge.castShadow = true;
    scene.add(leftRidge);
    createdObjects.push(leftRidge);

    const rightRidge = new THREE.Mesh(new THREE.BoxGeometry(8, 4.0, 1.2), stoneWallMat);
    rightRidge.position.set(6, 2.0, -12);
    rightRidge.castShadow = true;
    scene.add(rightRidge);
    createdObjects.push(rightRidge);

    // Natural trees densely lining the northern perimeter
    for (let x = -9.5; x <= 9.5; x += 1.8) {
      if (Math.abs(x) > 2.6) {
        const tree = createTree(1.2 + Math.random() * 0.4, true);
        tree.position.set(x, 0, -12.6);
        scene.add(tree);
        createdObjects.push(tree);
      }
    }
    // Trees lining southern perimeter
    for (let x = -9.0; x <= 9.0; x += 2.2) {
      const tree = createTree(1.0 + Math.random() * 0.3, false);
      tree.position.set(x, 0, 11.6);
      scene.add(tree);
      createdObjects.push(tree);
    }
    // Trees along East and West forest edges
    for (let z = -10.0; z <= 10.0; z += 2.2) {
      const treeL = createTree(1.1 + Math.random() * 0.4, z % 4 === 0);
      treeL.position.set(-10.6, 0, z);
      scene.add(treeL);
      createdObjects.push(treeL);

      const treeR = createTree(1.1 + Math.random() * 0.4, z % 4 !== 0);
      treeR.position.set(10.6, 0, z);
      scene.add(treeR);
      createdObjects.push(treeR);
    }

    // Natural mossy boulders scattered (kept clear of central path)
    const boulderCoords = [
      [-6.2, -6.5], [6.5, -6.5], [-6.5, 4.5], [6.5, 4.5],
      [-8.5, -1.0], [8.5, -1.0], [-7.5, 8.0], [7.5, 8.0]
    ];
    boulderCoords.forEach(([bx, bz]) => {
      const boulder = createBoulder(1.3 + Math.random() * 0.5);
      boulder.position.set(bx, 0, bz);
      scene.add(boulder);
      createdObjects.push(boulder);
    });

  } else {
    // LEVEL 1: High-Tech Industrial Lab Walls (Left and Right of exit)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.55,
      metalness: 0.45,
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.25,
      metalness: 0.85,
    });

    const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 0.6), wallMat);
    wallLeft.position.set(-6, 2.5, -12);
    wallLeft.castShadow = true;
    scene.add(wallLeft);
    createdObjects.push(wallLeft);

    const wallRight = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 0.6), wallMat);
    wallRight.position.set(6, 2.5, -12);
    wallRight.castShadow = true;
    scene.add(wallRight);
    createdObjects.push(wallRight);

    const southWall = new THREE.Mesh(new THREE.BoxGeometry(20.4, 5, 0.6), wallMat);
    southWall.position.set(0, 2.5, 12);
    scene.add(southWall);
    createdObjects.push(southWall);

    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5, 24.6), wallMat);
    eastWall.position.set(10.2, 2.5, 0);
    scene.add(eastWall);
    createdObjects.push(eastWall);

    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5, 24.6), wallMat);
    westWall.position.set(-10.2, 2.5, 0);
    scene.add(westWall);
    createdObjects.push(westWall);

    // Columns moved well to the sides so central line of sight to exit is 100% open
    const columnPositions = [
      [-5.2, -0.6], [5.2, -0.6], [-7.5, -7.5], [7.5, -7.5],
    ];
    columnPositions.forEach(([cx, cz]) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5, 0.8), steelMat);
      col.position.set(cx, 2.5, cz);
      col.castShadow = true;
      scene.add(col);
      createdObjects.push(col);
    });

    // Left testing rig (IS-2925 Helmet Impact Tower)
    const rigBase = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 2.0), steelMat);
    rigBase.position.set(-6.2, 0.3, -5.8);
    scene.add(rigBase);
    createdObjects.push(rigBase);

    const rigTower = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.2, 0.4), steelMat);
    rigTower.position.set(-6.2, 2.4, -5.8);
    scene.add(rigTower);
    createdObjects.push(rigTower);

    // Right testing bench (IS-9890 Valve Chamber)
    const benchMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 2.0), steelMat);
    benchMesh.position.set(6.2, 0.6, 4.8);
    scene.add(benchMesh);
    createdObjects.push(benchMesh);
  }

  // 5. PRESSURE PLATE / ANCIENT SUNSTONE SOLAR RELAY PAD (-6.0, 0, 1.5)
  const pressurePlateGroup = new THREE.Group();
  pressurePlateGroup.position.set(-6.0, 0, 1.5);

  const baseGeo = new THREE.CylinderGeometry(1.65, 1.75, 0.14, 28);
  const baseMat = new THREE.MeshStandardMaterial({
    color: isLevel2 ? 0x475569 : 0x334155,
    roughness: isLevel2 ? 0.85 : 0.35,
  });
  const plateBase = new THREE.Mesh(baseGeo, baseMat);
  plateBase.position.y = 0.07;
  plateBase.receiveShadow = true;
  pressurePlateGroup.add(plateBase);

  const ringGeo = new THREE.RingGeometry(1.3, 1.6, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: isLevel2 ? 0x0284c7 : 0x00ffff,
    side: THREE.DoubleSide,
  });
  const pressurePlateRing = new THREE.Mesh(ringGeo, ringMat);
  pressurePlateRing.rotation.x = -Math.PI / 2;
  pressurePlateRing.position.y = 0.13;
  pressurePlateGroup.add(pressurePlateRing);

  const padGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.16, 28);
  const padMat = new THREE.MeshStandardMaterial({
    color: isLevel2 ? 0xfef08a : 0x1e293b,
    roughness: isLevel2 ? 0.3 : 0.4,
    metalness: isLevel2 ? 0.2 : 0.8,
    emissive: isLevel2 ? 0xeab308 : 0x0284c7,
    emissiveIntensity: 0.3,
  });
  const pressurePlatePad = new THREE.Mesh(padGeo, padMat);
  pressurePlatePad.position.y = 0.14;
  pressurePlatePad.receiveShadow = true;
  pressurePlateGroup.add(pressurePlatePad);

  const plateLight = new THREE.PointLight(isLevel2 ? 0xeab308 : 0x00ffff, 2.2, 7);
  plateLight.position.set(0, 2.2, 0);
  pressurePlateGroup.add(plateLight);

  scene.add(pressurePlateGroup);
  createdObjects.push(pressurePlateGroup);

  // 6. POWER CONDUITS / BIO-LUMINESCENT VINES
  const conduitSegments: THREE.Mesh[] = [];
  const conduitWaypoints: [number, number][] = [
    [-4.5, 1.5],
    [-2.0, 1.5],
    [0.0, 0.5],
    [2.5, -1.0],
    [5.0, -2.5],
    [6.0, -3.0],
  ];

  for (let i = 0; i < conduitWaypoints.length - 1; i++) {
    const p1 = conduitWaypoints[i];
    const p2 = conduitWaypoints[i + 1];
    const dx = p2[0] - p1[0];
    const dz = p2[1] - p1[1];
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);

    const cableGeo = new THREE.BoxGeometry(0.25, 0.06, len);
    const cableMat = new THREE.MeshStandardMaterial({
      color: isLevel2 ? 0x3f6212 : 0x1e293b,
      metalness: isLevel2 ? 0.2 : 0.8,
      roughness: 0.6,
    });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.position.set((p1[0] + p2[0]) / 2, 0.03, (p1[1] + p2[1]) / 2);
    cable.rotation.y = angle;
    scene.add(cable);
    createdObjects.push(cable);

    const stripGeo = new THREE.BoxGeometry(0.12, 0.08, len * 0.96);
    const stripMat = new THREE.MeshStandardMaterial({
      color: isLevel2 ? 0xeab308 : 0x00ffff,
      emissive: isLevel2 ? 0xeab308 : 0x00ffff,
      emissiveIntensity: 0.3,
      roughness: 0.2,
    });
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.position.set((p1[0] + p2[0]) / 2, 0.045, (p1[1] + p2[1]) / 2);
    strip.rotation.y = angle;
    scene.add(strip);
    createdObjects.push(strip);
    conduitSegments.push(strip);
  }

  // 7. INSPECTION / NATURAL RESEARCH CONSOLE (6.0, 0, -3.5)
  const terminalConsole = new THREE.Group();
  terminalConsole.position.set(6.0, 0, -3.5);
  terminalConsole.rotation.y = -Math.PI / 4;

  const deskMat = new THREE.MeshStandardMaterial({
    color: isLevel2 ? 0x78350f : 0x334155, // Cedar timber or steel
    roughness: isLevel2 ? 0.75 : 0.3,
  });

  const consoleBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 1.2), deskMat);
  consoleBase.position.y = 0.55;
  consoleBase.castShadow = true;
  terminalConsole.add(consoleBase);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.6), deskMat);
  deck.position.set(0, 1.05, 0.2);
  terminalConsole.add(deck);

  const frameMat = new THREE.MeshStandardMaterial({
    color: isLevel2 ? 0x475569 : 0x0f172a,
    roughness: 0.3,
  });
  const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.95, 0.08), frameMat);
  screenFrame.position.set(0, 1.6, -0.15);
  screenFrame.rotation.x = -0.22;
  terminalConsole.add(screenFrame);

  const screenGeo = new THREE.PlaneGeometry(1.35, 0.8);
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x0369a1,
    emissive: 0x0369a1,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.8,
  });
  const terminalScreen = new THREE.Mesh(screenGeo, screenMat);
  terminalScreen.position.set(0, 1.6, -0.10);
  terminalScreen.rotation.x = -0.22;
  terminalConsole.add(terminalScreen);

  const beaconGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const terminalBeacon = new THREE.Mesh(beaconGeo, beaconMat);
  terminalBeacon.position.set(0, 2.15, -0.25);
  terminalConsole.add(terminalBeacon);

  const terminalLight = new THREE.PointLight(0xf59e0b, 1.8, 6);
  terminalLight.position.set(0, 1.8, 0.3);
  terminalConsole.add(terminalLight);

  scene.add(terminalConsole);
  createdObjects.push(terminalConsole);

  // 8. THE MAIN EXIT SYSTEM (0, 0, -12.0) — ULTRA HIGH-VISIBILITY
  // Door Panels: high contrast, bright, distinct from the wall
  const doorWidth = 2.0;
  const doorHeight = 3.6;
  const doorGeo = new THREE.BoxGeometry(doorWidth, doorHeight, 0.3);
  
  // High contrast door material: Silver alloy in Lab, rich carved timber in Sanctuary
  const doorMat = new THREE.MeshStandardMaterial({
    color: isLevel2 ? 0x78350f : 0xe2e8f0, // Silver alloy vs carved cedar timber
    roughness: isLevel2 ? 0.65 : 0.2,
    metalness: isLevel2 ? 0.1 : 0.85,
  });

  const doorLeft = new THREE.Mesh(doorGeo, doorMat);
  doorLeft.position.set(-1.0, 1.8, -12.0);
  doorLeft.castShadow = true;
  doorLeft.receiveShadow = true;
  scene.add(doorLeft);
  createdObjects.push(doorLeft);

  const doorRight = new THREE.Mesh(doorGeo, doorMat);
  doorRight.position.set(1.0, 1.8, -12.0);
  doorRight.castShadow = true;
  doorRight.receiveShadow = true;
  scene.add(doorRight);
  createdObjects.push(doorRight);

  // High-contrast Warning Chevrons on door panels
  const doorChevronsMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.2,
  });
  const leftChev = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.6, 0.05), doorChevronsMat);
  leftChev.position.set(-0.25, 1.8, -11.82);
  scene.add(leftChev);
  createdObjects.push(leftChev);

  const rightChev = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.6, 0.05), doorChevronsMat);
  rightChev.position.set(0.25, 1.8, -11.82);
  scene.add(rightChev);
  createdObjects.push(rightChev);

  // MASSIVE GLOWING ARCHWAY SURROUNDING THE EXIT
  const archwayMat = new THREE.MeshStandardMaterial({
    color: isLevel2 ? 0x38bdf8 : 0x00ffff,
    emissive: isLevel2 ? 0x0284c7 : 0x00e5ff,
    emissiveIntensity: 1.8,
    roughness: 0.1,
  });
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.35, 0.5), archwayMat);
  archTop.position.set(0, 3.8, -11.95);
  scene.add(archTop);
  createdObjects.push(archTop);

  const archLeft = new THREE.Mesh(new THREE.BoxGeometry(0.35, doorHeight + 0.4, 0.5), archwayMat);
  archLeft.position.set(-2.5, 1.85, -11.95);
  scene.add(archLeft);
  createdObjects.push(archLeft);

  const archRight = new THREE.Mesh(new THREE.BoxGeometry(0.35, doorHeight + 0.4, 0.5), archwayMat);
  archRight.position.set(2.5, 1.85, -11.95);
  scene.add(archRight);
  createdObjects.push(archRight);

  // DUAL TALL VERTICAL BEACON TOWERS FLANKING GATE
  const pillarGeo = new THREE.CylinderGeometry(0.18, 0.18, 5.0, 16);
  const beaconPillarMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.8,
  });
  const pillarLeft = new THREE.Mesh(pillarGeo, beaconPillarMat);
  pillarLeft.position.set(-2.9, 2.5, -11.85);
  scene.add(pillarLeft);
  createdObjects.push(pillarLeft);

  const pillarRight = new THREE.Mesh(pillarGeo, beaconPillarMat);
  pillarRight.position.set(2.9, 2.5, -11.85);
  scene.add(pillarRight);
  createdObjects.push(pillarRight);

  // HIGH-RESOLUTION PROCEDURAL TEXTURED SIGN BOARD
  const lockedSignTex = createSignTexture(
    isLevel2 ? 'SANCTUARY PERIMETER EXIT' : 'EMERGENCY EXIT BLAST DOOR',
    '⛔ LOCKED · COMPLETE TERMINAL INSPECTION ⛔',
    '#1a0f02',
    '#fbbf24',
    '#f59e0b'
  );
  const unlockedSignTex = createSignTexture(
    isLevel2 ? 'SANCTUARY PERIMETER EXIT' : 'EMERGENCY EXIT BLAST DOOR',
    '✔ UNLOCKED · WALK THROUGH TO ESCAPE ✔',
    '#022c22',
    '#34d399',
    '#10b981'
  );

  const signBoardGeo = new THREE.BoxGeometry(4.8, 1.25, 0.15);
  const signBoardMat = new THREE.MeshStandardMaterial({
    color: 0x020617,
    roughness: 0.3,
    metalness: 0.9,
  });
  const signBoard = new THREE.Mesh(signBoardGeo, signBoardMat);
  signBoard.position.set(0, 4.6, -11.85);
  scene.add(signBoard);
  createdObjects.push(signBoard);

  const signFaceGeo = new THREE.PlaneGeometry(4.6, 1.15);
  const signFaceMat = new THREE.MeshStandardMaterial({
    map: lockedSignTex,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.2,
    roughness: 0.2,
  });
  const signFace = new THREE.Mesh(signFaceGeo, signFaceMat);
  signFace.position.set(0, 4.6, -11.75);
  scene.add(signFace);
  createdObjects.push(signFace);

  const doorBeaconGeo = new THREE.BoxGeometry(3.6, 0.28, 0.18);
  const doorStatusMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.8,
  });
  const doorStatusBeacon = new THREE.Mesh(doorBeaconGeo, doorStatusMat);
  doorStatusBeacon.position.set(0, 3.8, -11.82);
  scene.add(doorStatusBeacon);
  createdObjects.push(doorStatusBeacon);

  const doorLight = new THREE.PointLight(0xf59e0b, 3.5, 14);
  doorLight.position.set(0, 3.6, -11.2);
  scene.add(doorLight);
  createdObjects.push(doorLight);

  // ULTRA HIGH INTENSITY SPOTLIGHTS AIMED SPECIFICALLY AT THE EXIT BLAST DOOR
  const exitSpotLight = new THREE.SpotLight(0xffffff, 4.5, 32, Math.PI / 4, 0.3);
  exitSpotLight.position.set(0, 8.0, -3.0);
  exitSpotLight.target = signBoard;
  scene.add(exitSpotLight);
  createdObjects.push(exitSpotLight);

  // VERTICAL SKY BEACON / LIGHT COLUMN (visible from anywhere in the world)
  const skyPillarGeo = new THREE.CylinderGeometry(0.3, 0.3, 16, 16);
  const skyPillarMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  const skyPillar = new THREE.Mesh(skyPillarGeo, skyPillarMat);
  skyPillar.position.set(0, 8.0, -11.9);
  scene.add(skyPillar);
  createdObjects.push(skyPillar);

  // EYE-LEVEL 3D WAYPOINT MARKER (Y = 2.0, Z = -11.0)
  const exitWaypointMarker = new THREE.Group();
  exitWaypointMarker.position.set(0, 2.2, -10.8);

  const diamondGeo = new THREE.OctahedronGeometry(0.45, 0);
  const waypointMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.8,
    roughness: 0.1,
  });
  const diamondMesh = new THREE.Mesh(diamondGeo, waypointMat);
  exitWaypointMarker.add(diamondMesh);

  const wayRingGeo = new THREE.RingGeometry(0.65, 0.8, 28);
  const wayRingMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const wayRing = new THREE.Mesh(wayRingGeo, wayRingMat);
  wayRing.rotation.x = -Math.PI / 2;
  exitWaypointMarker.add(wayRing);

  const arrowGeo = new THREE.ConeGeometry(0.24, 0.6, 12);
  const arrowMesh = new THREE.Mesh(arrowGeo, waypointMat);
  arrowMesh.rotation.x = Math.PI;
  arrowMesh.position.y = -0.65;
  exitWaypointMarker.add(arrowMesh);

  scene.add(exitWaypointMarker);
  createdObjects.push(exitWaypointMarker);

  // Corridor beyond door (Bright Open Sunlit Meadow path)
  const corridorFloorGeo = new THREE.PlaneGeometry(4.6, 10);
  const corridorFloorMat = new THREE.MeshStandardMaterial({
    color: isLevel2 ? 0x22c55e : 0x059669,
    roughness: 0.7,
  });
  const corridorFloor = new THREE.Mesh(corridorFloorGeo, corridorFloorMat);
  corridorFloor.rotation.x = -Math.PI / 2;
  corridorFloor.position.set(0, 0.01, -16.5);
  scene.add(corridorFloor);
  createdObjects.push(corridorFloor);

  const corridorLight = new THREE.PointLight(isLevel2 ? 0x22c55e : 0x10b981, 3.0, 16);
  corridorLight.position.set(0, 3.5, -15.5);
  scene.add(corridorLight);
  createdObjects.push(corridorLight);

  // Dynamic animation hooks
  let doorSlideProgress = 0;
  const updateDoor = (isOpen: boolean, delta: number) => {
    const targetProgress = isOpen ? 1 : 0;
    doorSlideProgress = THREE.MathUtils.lerp(doorSlideProgress, targetProgress, delta * 3.5);
    doorLeft.position.x = -1.0 - doorSlideProgress * 1.8;
    doorRight.position.x = 1.0 + doorSlideProgress * 1.8;
    leftChev.position.x = -0.25 - doorSlideProgress * 1.8;
    rightChev.position.x = 0.25 + doorSlideProgress * 1.8;

    if (isOpen) {
      signFaceMat.map = unlockedSignTex;
      signFaceMat.emissive.setHex(0x10b981);
      doorStatusMat.color.setHex(0x10b981);
      doorStatusMat.emissive.setHex(0x10b981);
      doorLight.color.setHex(0x10b981);
      beaconPillarMat.color.setHex(0x10b981);
      beaconPillarMat.emissive.setHex(0x10b981);
      doorChevronsMat.color.setHex(0x10b981);
      doorChevronsMat.emissive.setHex(0x10b981);
      skyPillarMat.color.setHex(0x10b981);
    } else {
      signFaceMat.map = lockedSignTex;
      signFaceMat.emissive.setHex(0xf59e0b);
      doorStatusMat.color.setHex(0xf59e0b);
      doorStatusMat.emissive.setHex(0xf59e0b);
      doorLight.color.setHex(0xf59e0b);
      beaconPillarMat.color.setHex(0xf59e0b);
      beaconPillarMat.emissive.setHex(0xf59e0b);
      doorChevronsMat.color.setHex(0xf59e0b);
      doorChevronsMat.emissive.setHex(0xf59e0b);
      skyPillarMat.color.setHex(0xf59e0b);
    }
  };

  let padY = 0.14;
  const updatePlate = (isPressed: boolean, delta: number) => {
    const targetY = isPressed ? 0.04 : 0.14;
    padY = THREE.MathUtils.lerp(padY, targetY, delta * 12);
    pressurePlatePad.position.y = padY;

    if (isPressed) {
      ringMat.color.setHex(isLevel2 ? 0xfacc15 : 0x00ffff);
      plateLight.color.setHex(isLevel2 ? 0xfacc15 : 0x00ffff);
      plateLight.intensity = 3.0;
    } else {
      ringMat.color.setHex(isLevel2 ? 0x0284c7 : 0x00ffff);
      plateLight.color.setHex(isLevel2 ? 0xeab308 : 0x00ffff);
      plateLight.intensity = 1.4;
    }
  };

  const updateConduits = (isPowered: boolean, time: number) => {
    conduitSegments.forEach((seg, idx) => {
      const mat = seg.material as THREE.MeshStandardMaterial;
      if (isPowered) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 8 - idx * 0.8);
        mat.emissive.setHex(isLevel2 ? 0xfacc15 : 0x00ffff);
        mat.emissiveIntensity = 0.6 + pulse * 1.4;
      } else {
        mat.emissive.setHex(isLevel2 ? 0xeab308 : 0x0284c7);
        mat.emissiveIntensity = 0.2;
      }
    });

    const tScreenMat = terminalScreen.material as THREE.MeshStandardMaterial;
    const tBeaconMat = terminalBeacon.material as THREE.MeshBasicMaterial;

    if (isPowered) {
      tScreenMat.emissive.setHex(isLevel2 ? 0x38bdf8 : 0x00ffff);
      tScreenMat.emissiveIntensity = 0.9 + 0.2 * Math.sin(time * 6);
      tBeaconMat.color.setHex(isLevel2 ? 0x38bdf8 : 0x00ffff);
      terminalLight.color.setHex(isLevel2 ? 0x38bdf8 : 0x00ffff);
      terminalLight.intensity = 2.4;
    } else {
      tScreenMat.emissive.setHex(0x0369a1);
      tScreenMat.emissiveIntensity = 0.25;
      tBeaconMat.color.setHex(0xf59e0b);
      terminalLight.color.setHex(0xf59e0b);
      terminalLight.intensity = 0.9;
    }
  };

  const updateWaypoint = (doorUnlocked: boolean, time: number) => {
    exitWaypointMarker.position.y = 2.2 + Math.sin(time * 3.5) * 0.15;
    diamondMesh.rotation.y = time * 2.2;
    diamondMesh.rotation.x = Math.sin(time * 1.5) * 0.2;
    wayRing.rotation.z = time * 1.4;

    const ringScale = 1.0 + Math.sin(time * 4) * 0.15;
    wayRing.scale.set(ringScale, ringScale, 1.0);

    if (doorUnlocked) {
      waypointMat.color.setHex(0x10b981);
      waypointMat.emissive.setHex(0x10b981);
      wayRingMat.color.setHex(0x10b981);
    } else {
      waypointMat.color.setHex(0xf59e0b);
      waypointMat.emissive.setHex(0xf59e0b);
      wayRingMat.color.setHex(0xf59e0b);
    }
  };

  const updateLevelEffects = (time: number, delta: number) => {
    // Slowly drift clouds across Level 2 sky
    if (cloudsGroup) {
      cloudsGroup.children.forEach((cloud) => {
        cloud.position.x += delta * 0.4;
        if (cloud.position.x > 22) {
          cloud.position.x = -22;
        }
      });
    }
  };

  const cleanUp = () => {
    lockedSignTex.dispose();
    unlockedSignTex.dispose();
    createdObjects.forEach((obj) => {
      scene.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  };

  return {
    scene,
    pressurePlateGroup,
    pressurePlatePad,
    pressurePlateRing,
    plateLight,
    conduitLights: conduitSegments,
    terminalConsole,
    terminalScreen,
    terminalBeacon,
    terminalLight,
    doorLeft,
    doorRight,
    doorLight,
    doorStatusBeacon,
    exitWaypointMarker,
    cleanUp,
    updateConduits,
    updateDoor,
    updatePlate,
    updateWaypoint,
    updateLevelEffects,
  };
}
