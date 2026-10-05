import * as THREE from 'three';
import { EnvironmentSectionId, PowerUpType } from '../scripts/GameState';

export type ObstacleKind =
  | 'LOW_BARRIER'
  | 'OVERHEAD_BARRIER'
  | 'AUTO_RICKSHAW'
  | 'INDIAN_TRUCK'
  | 'CITY_BUS'
  | 'TRAFFIC_CONES'
  | 'WOODEN_CRATES'
  | 'RAIL_CROSSING';

export interface SpawnedObstacle {
  mesh: THREE.Group;
  lane: number; // -1, 0, 1
  z: number;
  kind: ObstacleKind;
  requiresJump: boolean;
  requiresSlide: boolean;
  isFullBlock: boolean;
  movingSpeed: number; // > 0 for oncoming vehicles
  height: number;
  passed: boolean;
}

export interface SpawnedCoin {
  mesh: THREE.Mesh;
  lane: number;
  x: number;
  y: number;
  z: number;
  collected: boolean;
}

export interface SpawnedPowerUp {
  mesh: THREE.Group;
  lane: number;
  x: number;
  y: number;
  z: number;
  type: PowerUpType;
  collected: boolean;
}

export const LANE_WIDTH = 2.5;
export const LANE_POSITIONS = [-LANE_WIDTH, 0, LANE_WIDTH];

export function createObstacleMesh(kind: ObstacleKind): {
  mesh: THREE.Group;
  requiresJump: boolean;
  requiresSlide: boolean;
  isFullBlock: boolean;
  movingSpeed: number;
  height: number;
} {
  const group = new THREE.Group();

  if (kind === 'LOW_BARRIER') {
    // Indian PWD Yellow/Black Striped Road Barrier (Jumpable)
    const barMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
    const postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });

    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.95, 0.18), postMat);
    leftPost.position.set(-0.85, 0.475, 0);
    const rightPost = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.95, 0.18), postMat);
    rightPost.position.set(0.85, 0.475, 0);

    const mainPlank = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.42, 0.22), barMat);
    mainPlank.position.set(0, 0.68, 0);
    mainPlank.castShadow = true;

    const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.43, 0.24), stripeMat);
    stripe1.position.set(-0.5, 0.68, 0);
    const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.43, 0.24), stripeMat);
    stripe2.position.set(0.5, 0.68, 0);

    group.add(leftPost, rightPost, mainPlank, stripe1, stripe2);
    return { mesh: group, requiresJump: true, requiresSlide: false, isFullBlock: false, movingSpeed: 0, height: 1.0 };
  }

  if (kind === 'TRAFFIC_CONES') {
    // 3 Bright Orange Reflective Cones (Jumpable)
    const coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.35 });
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.2 });

    [-0.65, 0, 0.65].forEach((offsetX) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.85, 12), coneMat);
      cone.position.set(offsetX, 0.425, 0);
      cone.castShadow = true;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.18, 12), bandMat);
      band.position.set(offsetX, 0.48, 0);
      group.add(cone, band);
    });
    return { mesh: group, requiresJump: true, requiresSlide: false, isFullBlock: false, movingSpeed: 0, height: 0.9 };
  }

  if (kind === 'WOODEN_CRATES') {
    // Market Wooden Mango/Chai Crates (Jumpable)
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.75 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });

    const crate1 = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.88, 0.95), woodMat);
    crate1.position.set(-0.45, 0.44, 0);
    crate1.castShadow = true;
    const crate2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.82, 0.9), trimMat);
    crate2.position.set(0.48, 0.41, 0.08);
    crate2.castShadow = true;

    group.add(crate1, crate2);
    return { mesh: group, requiresJump: true, requiresSlide: false, isFullBlock: false, movingSpeed: 0, height: 0.92 };
  }

  if (kind === 'OVERHEAD_BARRIER') {
    // High Overhead Street Sign / Festoon Gate (Requires Slide Under)
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
    const signMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4 });
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });

    const leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.7, 10), pillarMat);
    leftPillar.position.set(-1.05, 1.35, 0);
    const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.7, 10), pillarMat);
    rightPillar.position.set(1.05, 1.35, 0);

    // Overhead beam starts at y = 1.15 up to 2.55 (Standing character hits it, Sliding passes underneath!)
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.25, 0.28), signMat);
    signBoard.position.set(0, 1.9, 0);
    signBoard.castShadow = true;

    const bottomTrim = new THREE.Mesh(new THREE.BoxGeometry(2.34, 0.18, 0.32), borderMat);
    bottomTrim.position.set(0, 1.28, 0);

    group.add(leftPillar, rightPillar, signBoard, bottomTrim);
    return { mesh: group, requiresJump: false, requiresSlide: true, isFullBlock: false, movingSpeed: 0, height: 2.6 };
  }

  if (kind === 'RAIL_CROSSING') {
    // Railway Boom Barrier at chest/head height (Requires Slide or Jump)
    const postMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
    const boomMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });

    const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.8, 0.28), postMat);
    post.position.set(-1.05, 0.9, 0);
    const boom = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.35, 0.25), boomMat);
    boom.position.set(0, 1.45, 0);
    boom.castShadow = true;

    group.add(post, boom);
    return { mesh: group, requiresJump: false, requiresSlide: true, isFullBlock: false, movingSpeed: 0, height: 1.8 };
  }

  if (kind === 'AUTO_RICKSHAW') {
    // Classic Indian Green & Yellow Auto-Rickshaw (3-Wheeler)
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.45 });
    const yellowTopMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.15, metalness: 0.5 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });

    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.9, 2.5), greenMat);
    lowerBody.position.set(0, 0.6, 0);
    lowerBody.castShadow = true;

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.85, 2.2), yellowTopMat);
    canopy.position.set(0, 1.45, -0.05);
    canopy.castShadow = true;

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.58, 0.08), glassMat);
    windshield.position.set(0, 1.35, 1.08);

    const headlight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.1, 12),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 0.8 })
    );
    headlight.rotation.x = Math.PI / 2;
    headlight.position.set(0, 0.65, 1.28);

    const frontWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 12), wheelMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.28, 1.0);

    group.add(lowerBody, canopy, windshield, headlight, frontWheel);
    return {
      mesh: group,
      requiresJump: false,
      requiresSlide: false,
      isFullBlock: true,
      movingSpeed: 6.5,
      height: 1.95,
    };
  }

  if (kind === 'CITY_BUS') {
    // Indian State Transport Red/Cream Bus
    const busBodyMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.2 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.05, 2.35, 5.2), busBodyMat);
    body.position.set(0, 1.35, 0);
    body.castShadow = true;

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.08, 0.35, 5.22), stripeMat);
    stripe.position.set(0, 1.1, 0);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.82, 0.1), glassMat);
    windshield.position.set(0, 1.75, 2.58);

    group.add(body, stripe, windshield);
    return {
      mesh: group,
      requiresJump: false,
      requiresSlide: false,
      isFullBlock: true,
      movingSpeed: 8.5,
      height: 2.5,
    };
  }

  // Default: INDIAN_TRUCK (Colorful Painted Highway Goods Carrier)
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.45 });
  const cargoMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.55 });
  const crownMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 });

  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.2, 1.8), cabMat);
  cab.position.set(0, 1.25, 1.5);
  cab.castShadow = true;

  const crown = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.48, 0.4), crownMat);
  crown.position.set(0, 2.5, 2.15);

  const cargo = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.6, 3.6), cargoMat);
  cargo.position.set(0, 1.45, -1.1);
  cargo.castShadow = true;

  group.add(cab, crown, cargo);
  return {
    mesh: group,
    requiresJump: false,
    requiresSlide: false,
    isFullBlock: true,
    movingSpeed: 5.0,
    height: 2.75,
  };
}

export function createCoinMesh(): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 16);
  geo.rotateX(Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    metalness: 0.7,
    roughness: 0.2,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

export function createPowerUpMesh(type: PowerUpType): THREE.Group {
  const group = new THREE.Group();
  const colorMap: Record<PowerUpType, number> = {
    MAGNET: 0xef4444,
    SHIELD: 0x38bdf8,
    DOUBLE_SCORE: 0xa855f7,
    SPEED_BOOST: 0xf97316,
    COIN_MULTIPLIER: 0x10b981,
  };

  const mainColor = colorMap[type];
  const coreMat = new THREE.MeshStandardMaterial({
    color: mainColor,
    emissive: mainColor,
    emissiveIntensity: 0.55,
    roughness: 0.2,
    metalness: 0.4,
  });

  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.52, 0), coreMat);
  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.06, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  group.add(core, outerRing);
  return group;
}

// Create roadside Indian environment props per section
export function createRoadsideProp(sectionId: EnvironmentSectionId, side: -1 | 1): THREE.Group {
  const group = new THREE.Group();
  const xBase = side * (6.2 + Math.random() * 2.5);

  if (sectionId === 1) {
    // Village Road: Banyan/Mango Trees & Mud-Brick Hut
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.4, 2.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 })
    );
    trunk.position.set(xBase, 1.1, 0);
    const foliage = new THREE.Mesh(
      new THREE.SphereGeometry(1.65, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 })
    );
    foliage.position.set(xBase, 2.9, 0);
    group.add(trunk, foliage);
  } else if (sectionId === 2) {
    // Small Indian Town: Colorful 2-Storey Shop Building
    const colors = [0xf97316, 0x38bdf8, 0xfacc15, 0xec4899];
    const bldgColor = colors[Math.floor(Math.random() * colors.length)];
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 4.2, 3.2),
      new THREE.MeshStandardMaterial({ color: bldgColor, roughness: 0.65 })
    );
    building.position.set(xBase + side * 0.8, 2.1, 0);
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.25, 3.4),
      new THREE.MeshStandardMaterial({ color: 0xdc2626 })
    );
    awning.position.set(xBase + side * 0.5, 1.5, 0);
    group.add(building, awning);
  } else if (sectionId === 3) {
    // Market Road: Festive Canopy Stalls & Pillars
    const stall = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 2.6, 2.6),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 })
    );
    stall.position.set(xBase, 1.3, 0);
    const tentTop = new THREE.Mesh(
      new THREE.ConeGeometry(2.1, 1.2, 4),
      new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.4 })
    );
    tentTop.position.set(xBase, 3.2, 0);
    tentTop.rotation.y = Math.PI / 4;
    group.add(stall, tentTop);
  } else if (sectionId === 4) {
    // Railway Area: Overhead Steel Gantry & Signal Posts
    const mast = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 5.2, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 })
    );
    mast.position.set(xBase * 0.82, 2.6, 0);
    const signalLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    signalLight.position.set(xBase * 0.82, 3.8, 0.25);
    group.add(mast, signalLight);
  } else if (sectionId === 5) {
    // Golden Highway: Tall Palm Trees & Highway Streetlights
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 5.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5 })
    );
    pole.position.set(xBase * 0.85, 2.75, 0);
    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.16, 0.35),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    lamp.position.set(xBase * 0.75, 5.4, 0);
    group.add(pole, lamp);
  } else {
    // Section 6: Temple / Festival Area: Gopuram Spire & Glowing Diyas
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 2.5, 2.8),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5 })
    );
    base.position.set(xBase + side * 0.6, 1.25, 0);
    const spire = new THREE.Mesh(
      new THREE.ConeGeometry(1.9, 3.8, 4),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0x7c2d12, emissiveIntensity: 0.35 })
    );
    spire.position.set(xBase + side * 0.6, 4.4, 0);
    spire.rotation.y = Math.PI / 4;
    group.add(base, spire);
  }

  return group;
}
