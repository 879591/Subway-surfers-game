import * as THREE from 'three';

export type CharacterAnimState = 'IDLE' | 'RUN' | 'JUMP' | 'SLIDE' | 'FALL' | 'POWERUP';

export interface SurajRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  torsoMesh: THREE.Mesh;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  leftShoeMesh: THREE.Mesh;
  rightShoeMesh: THREE.Mesh;
  shieldBubble: THREE.Mesh;
  auraRing: THREE.Mesh;
  setColors: (shirtHex: string, shoesHex: string, trailHex: string) => void;
  updateAnimation: (state: CharacterAnimState, time: number, speedFactor: number, laneTilt: number, shieldActive: boolean) => void;
}

export function createSurajCharacter(
  initialShirtHex = '#FACC15',
  initialShoesHex = '#EF4444',
  initialTrailHex = '#FACC15'
): SurajRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd9824c, roughness: 0.55 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x141418, roughness: 0.75 });
  const tilakMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0x991b1b,
    emissiveIntensity: 0.4,
    roughness: 0.3,
  });
  const shirtMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialShirtHex),
    roughness: 0.45,
  });
  const jeansMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.65,
  });
  const shoesMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialShoesHex),
    roughness: 0.35,
  });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.2 });

  // 1. HEAD GROUP (Young Indian Male + Curly/Wavy Black Hair + Red Tilak + Friendly Smile)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.56, 0);
  bodyGroup.add(headGroup);

  // Face / Skull
  const headGeo = new THREE.BoxGeometry(0.46, 0.48, 0.46);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Neck
  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.16, 10), skinMat);
  neckMesh.position.set(0, -0.26, 0);
  headGroup.add(neckMesh);

  // Ears
  const earGeo = new THREE.BoxGeometry(0.07, 0.14, 0.09);
  const leftEar = new THREE.Mesh(earGeo, skinMat);
  leftEar.position.set(-0.25, 0, 0);
  const rightEar = new THREE.Mesh(earGeo, skinMat);
  rightEar.position.set(0.25, 0, 0);
  headGroup.add(leftEar, rightEar);

  // Curly/Wavy Black Hair Volume (Multiple stylized curls around crown, forehead, and back)
  const hairGroup = new THREE.Group();
  headGroup.add(hairGroup);

  const topHairBase = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.18, 0.52), hairMat);
  topHairBase.position.set(0, 0.23, -0.01);
  hairGroup.add(topHairBase);

  const backHair = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.38, 0.16), hairMat);
  backHair.position.set(0, 0.06, -0.21);
  hairGroup.add(backHair);

  // Stylized curls across top and front wave
  const curlPositions: [number, number, number, number][] = [
    [-0.16, 0.31, 0.16, 0.12],
    [0.0, 0.33, 0.19, 0.13],
    [0.16, 0.31, 0.16, 0.12],
    [-0.22, 0.24, 0.06, 0.11],
    [0.22, 0.24, 0.06, 0.11],
    [-0.11, 0.35, 0.0, 0.13],
    [0.11, 0.35, 0.0, 0.13],
    [0.0, 0.34, -0.14, 0.13],
    [-0.24, 0.14, -0.05, 0.1],
    [0.24, 0.14, -0.05, 0.1],
  ];
  curlPositions.forEach(([cx, cy, cz, r]) => {
    const curl = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), hairMat);
    curl.position.set(cx, cy, cz);
    hairGroup.add(curl);
  });

  // RED TILAK ON FOREHEAD (Distinctive vertical sacred tilak mark visible from front and 3/4 view)
  const tilakMesh = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.13, 0.03), tilakMat);
  tilakMesh.position.set(0, 0.11, 0.235);
  headGroup.add(tilakMesh);

  // Eyes & Eyebrows (Friendly adventurous expression)
  const eyeGeo = new THREE.BoxGeometry(0.075, 0.075, 0.02);
  const leftEye = new THREE.Mesh(eyeGeo, darkMat);
  leftEye.position.set(-0.1, 0.02, 0.232);
  const rightEye = new THREE.Mesh(eyeGeo, darkMat);
  rightEye.position.set(0.1, 0.02, 0.232);

  const browGeo = new THREE.BoxGeometry(0.11, 0.03, 0.025);
  const leftBrow = new THREE.Mesh(browGeo, hairMat);
  leftBrow.position.set(-0.1, 0.09, 0.235);
  leftBrow.rotation.z = 0.08;
  const rightBrow = new THREE.Mesh(browGeo, hairMat);
  rightBrow.position.set(0.1, 0.09, 0.235);
  rightBrow.rotation.z = -0.08;

  // Friendly Smile
  const smileMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.02), whiteMat);
  smileMesh.position.set(0, -0.11, 0.232);

  headGroup.add(leftEye, rightEye, leftBrow, rightBrow, smileMesh);

  // 2. TORSO (Bright Yellow Button Shirt inspired by the reference photo)
  const torsoGeo = new THREE.BoxGeometry(0.56, 0.68, 0.32);
  const torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
  torsoMesh.position.set(0, 1.0, 0);
  torsoMesh.castShadow = true;
  bodyGroup.add(torsoMesh);

  // Shirt Collar & Front Placket Detail
  const collarLeft = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.34), shirtMat);
  collarLeft.position.set(-0.11, 1.32, 0.01);
  collarLeft.rotation.z = -0.25;
  const collarRight = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.34), shirtMat);
  collarRight.position.set(0.11, 1.32, 0.01);
  collarRight.rotation.z = 0.25;
  bodyGroup.add(collarLeft, collarRight);

  // Star Badge on Back of Shirt (So the player sees a cool 5TAR emblem while running)
  const backBadge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.02, 5),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.3 })
  );
  backBadge.rotation.x = Math.PI / 2;
  backBadge.position.set(0, 1.05, -0.165);
  bodyGroup.add(backBadge);

  // 3. ARMS (Yellow short sleeves + forearm + hands)
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.36, 1.26, 0);
  bodyGroup.add(leftArmPivot);

  const leftSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.26, 0.2), shirtMat);
  leftSleeve.position.set(0, -0.1, 0);
  leftSleeve.castShadow = true;
  const leftForearm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.32, 0.14), skinMat);
  leftForearm.position.set(0, -0.34, 0);
  leftForearm.castShadow = true;
  leftArmPivot.add(leftSleeve, leftForearm);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.36, 1.26, 0);
  bodyGroup.add(rightArmPivot);

  const rightSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.26, 0.2), shirtMat);
  rightSleeve.position.set(0, -0.1, 0);
  rightSleeve.castShadow = true;
  const rightForearm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.32, 0.14), skinMat);
  rightForearm.position.set(0, -0.34, 0);
  rightForearm.castShadow = true;
  rightArmPivot.add(rightSleeve, rightForearm);

  // 4. LEGS & RUNNING SNEAKERS
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.15, 0.66, 0);
  bodyGroup.add(leftLegPivot);

  const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.54, 0.24), jeansMat);
  leftLegMesh.position.set(0, -0.27, 0);
  leftLegMesh.castShadow = true;
  const leftShoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.36), shoesMat);
  leftShoeMesh.position.set(0, -0.58, 0.05);
  leftShoeMesh.castShadow = true;
  const leftSole = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.38), whiteMat);
  leftSole.position.set(0, -0.64, 0.05);
  leftLegPivot.add(leftLegMesh, leftShoeMesh, leftSole);

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.15, 0.66, 0);
  bodyGroup.add(rightLegPivot);

  const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.54, 0.24), jeansMat);
  rightLegMesh.position.set(0, -0.27, 0);
  rightLegMesh.castShadow = true;
  const rightShoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.36), shoesMat);
  rightShoeMesh.position.set(0, -0.58, 0.05);
  rightShoeMesh.castShadow = true;
  const rightSole = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.38), whiteMat);
  rightSole.position.set(0, -0.64, 0.05);
  rightLegPivot.add(rightLegMesh, rightShoeMesh, rightSole);

  // 5. POWER-UP SHIELD BUBBLE & TRAIL AURA RING
  const shieldGeo = new THREE.SphereGeometry(1.18, 20, 20);
  const shieldMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.28,
    wireframe: false,
  });
  const shieldBubble = new THREE.Mesh(shieldGeo, shieldMat);
  shieldBubble.position.set(0, 1.0, 0);
  shieldBubble.visible = false;
  root.add(shieldBubble);

  const auraGeo = new THREE.RingGeometry(0.45, 0.68, 24);
  const auraMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initialTrailHex),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.55,
  });
  const auraRing = new THREE.Mesh(auraGeo, auraMat);
  auraRing.rotation.x = -Math.PI / 2;
  auraRing.position.set(0, 0.04, 0);
  root.add(auraRing);

  const setColors = (shirtHex: string, shoesHex: string, trailHex: string) => {
    shirtMat.color.set(shirtHex);
    collarLeft.material = shirtMat;
    collarRight.material = shirtMat;
    shoesMat.color.set(shoesHex);
    auraMat.color.set(trailHex);
  };

  const updateAnimation = (
    state: CharacterAnimState,
    time: number,
    speedFactor: number,
    laneTilt: number,
    shieldActive: boolean
  ) => {
    shieldBubble.visible = shieldActive;
    if (shieldActive) {
      shieldBubble.rotation.y = time * 2.5;
      const pulse = 1 + Math.sin(time * 8) * 0.04;
      shieldBubble.scale.set(pulse, pulse, pulse);
    }

    auraRing.scale.setScalar(1 + Math.sin(time * 10) * 0.08);

    // Smooth lane banking tilt
    bodyGroup.rotation.z = THREE.MathUtils.lerp(bodyGroup.rotation.z, laneTilt, 0.2);

    if (state === 'IDLE') {
      bodyGroup.position.y = Math.sin(time * 3.5) * 0.04;
      bodyGroup.rotation.x = 0;
      bodyGroup.scale.set(1, 1, 1);
      headGroup.rotation.y = Math.sin(time * 1.6) * 0.18;
      leftArmPivot.rotation.x = Math.sin(time * 3.5) * 0.12;
      rightArmPivot.rotation.x = -Math.sin(time * 3.5) * 0.12;
      leftLegPivot.rotation.x = 0;
      rightLegPivot.rotation.x = 0;
    } else if (state === 'RUN') {
      const cycle = time * (11 + speedFactor * 6);
      bodyGroup.position.y = Math.abs(Math.sin(cycle)) * 0.12;
      bodyGroup.rotation.x = 0.14; // Forward sprint lean
      bodyGroup.scale.set(1, 1, 1);
      headGroup.rotation.y = Math.sin(cycle * 0.5) * 0.06;

      leftArmPivot.rotation.x = Math.sin(cycle) * 0.95;
      rightArmPivot.rotation.x = -Math.sin(cycle) * 0.95;
      leftLegPivot.rotation.x = -Math.sin(cycle) * 1.05;
      rightLegPivot.rotation.x = Math.sin(cycle) * 1.05;
    } else if (state === 'JUMP') {
      bodyGroup.rotation.x = -0.08;
      bodyGroup.scale.set(1, 1, 1);
      leftArmPivot.rotation.x = -2.2;
      rightArmPivot.rotation.x = -2.2;
      leftLegPivot.rotation.x = 0.45;
      rightLegPivot.rotation.x = -0.35;
    } else if (state === 'SLIDE') {
      bodyGroup.position.y = -0.35;
      bodyGroup.rotation.x = -0.75;
      bodyGroup.scale.set(1.05, 0.58, 1.05);
      leftArmPivot.rotation.x = 0.6;
      rightArmPivot.rotation.x = 0.6;
      leftLegPivot.rotation.x = -0.9;
      rightLegPivot.rotation.x = -0.9;
    } else if (state === 'FALL') {
      bodyGroup.position.y = 0.18;
      bodyGroup.rotation.x = -1.35;
      bodyGroup.scale.set(1, 1, 1);
      leftArmPivot.rotation.x = -1.2;
      rightArmPivot.rotation.x = -1.2;
      leftLegPivot.rotation.x = 0.3;
      rightLegPivot.rotation.x = 0.3;
    }
  };

  return {
    root,
    bodyGroup,
    headGroup,
    torsoMesh,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot,
    leftShoeMesh,
    rightShoeMesh,
    shieldBubble,
    auraRing,
    setColors,
    updateAnimation,
  };
}
