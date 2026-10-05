import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createSurajCharacter, CharacterAnimState } from '../characters/SurajCharacter3D';
import {
  createCoinMesh,
  createObstacleMesh,
  createPowerUpMesh,
  createRoadsideProp,
  LANE_POSITIONS,
  ObstacleKind,
  SpawnedCoin,
  SpawnedObstacle,
  SpawnedPowerUp,
} from '../environments/IndianWorldBuilder';
import {
  ENVIRONMENT_SECTIONS,
  EnvironmentSectionId,
  GraphicsQuality,
  PowerUpType,
  ScreenState,
} from '../scripts/GameState';
import { soundEngine } from '../audio/SoundEngine';

export interface ActivePowerUpHUD {
  type: PowerUpType;
  remaining: number;
  duration: number;
}

interface RunnerCanvas3DProps {
  screenState: ScreenState;
  shirtColor: string;
  shoesColor: string;
  trailColor: string;
  graphics: GraphicsQuality;
  baseMultiplier: number;
  powerUpDurationBonus: number;
  characterRotationY?: number;
  onHUDUpdate: (
    score: number,
    coins: number,
    distance: number,
    sectionId: EnvironmentSectionId,
    activePowerUps: ActivePowerUpHUD[],
    nearMissAlert: boolean
  ) => void;
  onGameOver: (finalScore: number, runCoins: number, runDistance: number, runJumps: number, runPowerUps: number) => void;
  controlSignalRef: React.MutableRefObject<{ action: 'LEFT' | 'RIGHT' | 'JUMP' | 'SLIDE' | null }>;
}

export const RunnerCanvas3D: React.FC<RunnerCanvas3DProps> = ({
  screenState,
  shirtColor,
  shoesColor,
  trailColor,
  graphics,
  baseMultiplier,
  powerUpDurationBonus,
  characterRotationY = 0,
  onHUDUpdate,
  onGameOver,
  controlSignalRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for latest props inside requestAnimationFrame
  const stateRef = useRef(screenState);
  stateRef.current = screenState;

  const colorsRef = useRef({ shirtColor, shoesColor, trailColor });
  colorsRef.current = { shirtColor, shoesColor, trailColor };

  const charRotRef = useRef(characterRotationY);
  charRotRef.current = characterRotationY;

  const multRef = useRef(baseMultiplier);
  multRef.current = baseMultiplier;

  const bonusRef = useRef(powerUpDurationBonus);
  bonusRef.current = powerUpDurationBonus;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. SCENE, CAMERA & RENDERER
    const scene = new THREE.Scene();
    const initialSection = ENVIRONMENT_SECTIONS[0];
    scene.background = new THREE.Color(initialSection.skyColor);
    scene.fog = new THREE.FogExp2(initialSection.fogColor, 0.015);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      140
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: graphics !== 'LOW',
      powerPreference: 'high-performance',
    });
    const pixelRatio =
      graphics === 'LOW' ? 1 : graphics === 'MEDIUM' ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = graphics === 'HIGH';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. THREE-POINT LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.35);
    sunLight.position.set(12, 24, 15);
    sunLight.castShadow = graphics === 'HIGH';
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 0.45);
    rimLight.position.set(-10, 8, -12);
    scene.add(rimLight);

    // 3. GROUND & 3-LANE INDIAN ROAD
    const groundMat = new THREE.MeshStandardMaterial({
      color: initialSection.groundColor,
      roughness: 0.9,
    });
    const groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(180, 260), groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.set(0, -0.02, -80);
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    const roadMat = new THREE.MeshStandardMaterial({
      color: initialSection.roadColor,
      roughness: 0.75,
    });
    const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 260), roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, -80);
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);

    // Road shoulders & lane dividers
    const shoulderMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 });
    const leftShoulder = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 260), shoulderMat);
    leftShoulder.position.set(-4.7, 0.06, -80);
    const rightShoulder = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 260), shoulderMat);
    rightShoulder.position.set(4.7, 0.06, -80);
    scene.add(leftShoulder, rightShoulder);

    const dashGroup = new THREE.Group();
    scene.add(dashGroup);
    const dashGeo = new THREE.PlaneGeometry(0.14, 3.2);
    dashGeo.rotateX(-Math.PI / 2);
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const roadDashes: THREE.Mesh[] = [];
    for (let z = 10; z > -130; z -= 7) {
      [-1.25, 1.25].forEach((xPos) => {
        const d = new THREE.Mesh(dashGeo, dashMat);
        d.position.set(xPos, 0.015, z);
        dashGroup.add(d);
        roadDashes.push(d);
      });
    }

    // 4. SURAJ 3D CHARACTER
    const suraj = createSurajCharacter(
      colorsRef.current.shirtColor,
      colorsRef.current.shoesColor,
      colorsRef.current.trailColor
    );
    scene.add(suraj.root);

    // 5. PARTICLE BURST SYSTEM (For Coin & Power-Up Collection)
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 36;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: THREE.Vector3[] = [];
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = 0;
      particlePositions[i * 3 + 1] = -100;
      particlePositions[i * 3 + 2] = 0;
      particleVelocities.push(new THREE.Vector3());
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.28,
      transparent: true,
      opacity: 0.9,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);
    let particleLife = 0;

    const triggerParticleBurst = (origin: THREE.Vector3, hexColor: number) => {
      particleMat.color.setHex(hexColor);
      particleLife = 0.45;
      const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        posAttr.setXYZ(i, origin.x, origin.y + 0.9, origin.z);
        particleVelocities[i].set(
          (Math.random() - 0.5) * 7,
          Math.random() * 5 + 1.5,
          (Math.random() - 0.5) * 7
        );
      }
      posAttr.needsUpdate = true;
    };

    // 6. GAMEPLAY STATE VARIABLES
    let currentLane = 1; // 0 = Left, 1 = Center, 2 = Right
    let playerX = 0;
    let playerY = 0;
    let velocityY = 0;
    let isJumping = false;
    let isSliding = false;
    let slideTimer = 0;
    let isCrashed = false;
    let crashTimer = 0;

    let forwardSpeed = 19;
    let distanceRun = 0;
    let score = 0;
    let runCoins = 0;
    let runJumps = 0;
    let runPowerUps = 0;
    let currentSectionId: EnvironmentSectionId = 1;
    let footstepTimer = 0;
    let spawnZCursor = -28;

    const activePowerUps = new Map<PowerUpType, { remaining: number; duration: number }>();
    const obstacles: SpawnedObstacle[] = [];
    const coins: SpawnedCoin[] = [];
    const powerUps: SpawnedPowerUp[] = [];
    const roadsideProps: THREE.Group[] = [];

    // Seed initial roadside props
    for (let z = 5; z > -125; z -= 14) {
      const leftProp = createRoadsideProp(1, -1);
      leftProp.position.z = z;
      const rightProp = createRoadsideProp(1, 1);
      rightProp.position.z = z - 6;
      scene.add(leftProp, rightProp);
      roadsideProps.push(leftProp, rightProp);
    }

    const clearWorldEntities = () => {
      obstacles.forEach((o) => scene.remove(o.mesh));
      obstacles.length = 0;
      coins.forEach((c) => scene.remove(c.mesh));
      coins.length = 0;
      powerUps.forEach((p) => scene.remove(p.mesh));
      powerUps.length = 0;
      activePowerUps.clear();
    };

    const resetRun = () => {
      clearWorldEntities();
      currentLane = 1;
      playerX = 0;
      playerY = 0;
      velocityY = 0;
      isJumping = false;
      isSliding = false;
      slideTimer = 0;
      isCrashed = false;
      crashTimer = 0;
      forwardSpeed = 19;
      distanceRun = 0;
      score = 0;
      runCoins = 0;
      runJumps = 0;
      runPowerUps = 0;
      currentSectionId = 1;
      spawnZCursor = -32;

      const sec = ENVIRONMENT_SECTIONS[0];
      scene.background = new THREE.Color(sec.skyColor);
      scene.fog = new THREE.FogExp2(sec.fogColor, 0.015);
      groundMat.color.set(sec.groundColor);
      roadMat.color.set(sec.roadColor);
    };

    // Spawn procedural track wave (obstacles, coin patterns, power-ups)
    const spawnWaveAt = (zPos: number) => {
      const allKinds: ObstacleKind[] = [
        'LOW_BARRIER',
        'OVERHEAD_BARRIER',
        'AUTO_RICKSHAW',
        'INDIAN_TRUCK',
        'CITY_BUS',
        'TRAFFIC_CONES',
        'WOODEN_CRATES',
        'RAIL_CROSSING',
      ];

      // Pick 1 or 2 lanes to have obstacles (never block all 3 with unjumpable full vehicles)
      const numObstacles = Math.random() < 0.48 && distanceRun > 120 ? 2 : 1;
      const availableLanes = [0, 1, 2];
      const occupiedLanes: number[] = [];

      for (let i = 0; i < numObstacles; i++) {
        const laneIdx = availableLanes.splice(Math.floor(Math.random() * availableLanes.length), 1)[0];
        occupiedLanes.push(laneIdx);
        const kind = allKinds[Math.floor(Math.random() * allKinds.length)];
        const created = createObstacleMesh(kind);
        created.mesh.position.set(LANE_POSITIONS[laneIdx], 0, zPos);
        scene.add(created.mesh);
        obstacles.push({
          mesh: created.mesh,
          lane: laneIdx,
          z: zPos,
          kind,
          requiresJump: created.requiresJump,
          requiresSlide: created.requiresSlide,
          isFullBlock: created.isFullBlock,
          movingSpeed: created.movingSpeed,
          height: created.height,
          passed: false,
        });
      }

      // Coin Patterns in open lane or jump arc over low obstacle
      const freeLane = availableLanes[Math.floor(Math.random() * availableLanes.length)] ?? 1;
      const patternRoll = Math.random();

      if (patternRoll < 0.45) {
        // Straight line of 5 coins
        for (let c = 0; c < 5; c++) {
          const coinMesh = createCoinMesh();
          const cz = zPos + 4 - c * 2.2;
          coinMesh.position.set(LANE_POSITIONS[freeLane], 0.85, cz);
          scene.add(coinMesh);
          coins.push({
            mesh: coinMesh,
            lane: freeLane,
            x: LANE_POSITIONS[freeLane],
            y: 0.85,
            z: cz,
            collected: false,
          });
        }
      } else if (patternRoll < 0.75) {
        // High-air jump arc pattern
        for (let c = -2; c <= 2; c++) {
          const coinMesh = createCoinMesh();
          const cz = zPos + c * 2.0;
          const cy = 0.85 + (4 - c * c) * 0.42;
          coinMesh.position.set(LANE_POSITIONS[freeLane], cy, cz);
          scene.add(coinMesh);
          coins.push({
            mesh: coinMesh,
            lane: freeLane,
            x: LANE_POSITIONS[freeLane],
            y: cy,
            z: cz,
            collected: false,
          });
        }
      } else {
        // Zig-zag coin pattern across lanes
        const zigLanes = [0, 1, 2, 1, 0];
        zigLanes.forEach((lIdx, step) => {
          const coinMesh = createCoinMesh();
          const cz = zPos - 5 - step * 2.3;
          coinMesh.position.set(LANE_POSITIONS[lIdx], 0.85, cz);
          scene.add(coinMesh);
          coins.push({
            mesh: coinMesh,
            lane: lIdx,
            x: LANE_POSITIONS[lIdx],
            y: 0.85,
            z: cz,
            collected: false,
          });
        });
      }

      // 18% chance to spawn a Power-Up
      if (Math.random() < 0.18) {
        const types: PowerUpType[] = [
          'MAGNET',
          'SHIELD',
          'DOUBLE_SCORE',
          'SPEED_BOOST',
          'COIN_MULTIPLIER',
        ];
        const pType = types[Math.floor(Math.random() * types.length)];
        const pMesh = createPowerUpMesh(pType);
        const pz = zPos - 9;
        pMesh.position.set(LANE_POSITIONS[freeLane], 1.1, pz);
        scene.add(pMesh);
        powerUps.push({
          mesh: pMesh,
          lane: freeLane,
          x: LANE_POSITIONS[freeLane],
          y: 1.1,
          z: pz,
          type: pType,
          collected: false,
        });
      }
    };

    // 7. INPUT HANDLING (Keyboard + Touch Swipe + On-Screen Control Signal)
    const executeAction = (action: 'LEFT' | 'RIGHT' | 'JUMP' | 'SLIDE') => {
      if (stateRef.current !== 'PLAYING' || isCrashed) return;

      if (action === 'LEFT' && currentLane > 0) {
        currentLane--;
        soundEngine.playLaneSwitch();
      } else if (action === 'RIGHT' && currentLane < 2) {
        currentLane++;
        soundEngine.playLaneSwitch();
      } else if (action === 'JUMP' && !isJumping) {
        isJumping = true;
        isSliding = false;
        velocityY = 12.2;
        runJumps++;
        soundEngine.playJump();
      } else if (action === 'SLIDE') {
        if (isJumping) {
          // Fast-fall slam into slide
          velocityY = -20;
        }
        isSliding = true;
        slideTimer = 0.68;
        soundEngine.playSlide();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (stateRef.current !== 'PLAYING') return;
      const key = e.key.toLowerCase();
      if (key === 'a' || e.key === 'ArrowLeft') {
        e.preventDefault();
        executeAction('LEFT');
      } else if (key === 'd' || e.key === 'ArrowRight') {
        e.preventDefault();
        executeAction('RIGHT');
      } else if (key === 'w' || e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        executeAction('JUMP');
      } else if (key === 's' || e.key === 'ArrowDown') {
        e.preventDefault();
        executeAction('SLIDE');
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchActive = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchActive = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchActive || stateRef.current !== 'PLAYING' || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      const threshold = 28;

      if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
        if (Math.abs(dx) > Math.abs(dy)) {
          executeAction(dx > 0 ? 'RIGHT' : 'LEFT');
        } else {
          executeAction(dy < 0 ? 'JUMP' : 'SLIDE');
        }
        touchActive = false;
      }
    };

    const handleTouchEnd = () => {
      touchActive = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Track previous screenState to reset when transitioning into PLAYING
    let prevScreenState: ScreenState = stateRef.current;
    let lastTime = performance.now();
    let hudEmitTimer = 0;
    let animFrameId = 0;

    // 8. MAIN GAME LOOP
    const animate = (now: number) => {
      animFrameId = requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const elapsedSec = now / 1000;

      // Sync customized colors onto Suraj rig
      suraj.setColors(
        colorsRef.current.shirtColor,
        colorsRef.current.shoesColor,
        colorsRef.current.trailColor
      );

      // Detect start of new game run
      if (stateRef.current === 'PLAYING' && prevScreenState !== 'PLAYING' && prevScreenState !== 'PAUSED') {
        resetRun();
      }
      prevScreenState = stateRef.current;

      // Consume any on-screen button signal
      if (controlSignalRef.current.action) {
        executeAction(controlSignalRef.current.action);
        controlSignalRef.current.action = null;
      }

      // Showcase / Menu camera vs Gameplay chase camera
      if (stateRef.current === 'HOME' || stateRef.current === 'CHARACTERS' || stateRef.current === 'SHOP' || stateRef.current === 'ABOUT_DEV') {
        suraj.root.position.set(0, 0, 0);
        // Face camera in showcase mode
        const targetRotY =
          stateRef.current === 'CHARACTERS' ? charRotRef.current : Math.sin(elapsedSec * 0.8) * 0.35;
        suraj.root.rotation.y = THREE.MathUtils.lerp(suraj.root.rotation.y, targetRotY, 0.12);
        suraj.updateAnimation('IDLE', elapsedSec, 1, 0, false);

        camera.position.lerp(new THREE.Vector3(0, 1.55, 3.65), 0.1);
        camera.lookAt(0, 1.15, 0);

        // Gently scroll road dashes in background for lively menu feel
        roadDashes.forEach((d) => {
          d.position.z += 6 * dt;
          if (d.position.z > 10) d.position.z -= 140;
        });

        renderer.render(scene, camera);
        return;
      }

      if (stateRef.current === 'PAUSED') {
        renderer.render(scene, camera);
        return;
      }

      if (stateRef.current === 'PLAYING') {
        // Face forward down the track (-Z)
        suraj.root.rotation.y = THREE.MathUtils.lerp(suraj.root.rotation.y, Math.PI, 0.2);

        if (isCrashed) {
          crashTimer -= dt;
          suraj.updateAnimation('FALL', elapsedSec, 0, 0, false);
          camera.position.x = (Math.random() - 0.5) * 0.25;
          if (crashTimer <= 0) {
            onGameOver(
              Math.floor(score),
              runCoins,
              Math.floor(distanceRun),
              runJumps,
              runPowerUps
            );
          }
          renderer.render(scene, camera);
          return;
        }

        // Update active power-ups timers
        for (const [pKey, val] of activePowerUps.entries()) {
          val.remaining -= dt;
          if (val.remaining <= 0) {
            activePowerUps.delete(pKey);
          }
        }

        const hasSpeedBoost = activePowerUps.has('SPEED_BOOST');
        const hasShield = activePowerUps.has('SHIELD');
        const hasMagnet = activePowerUps.has('MAGNET');
        const hasDoubleScore = activePowerUps.has('DOUBLE_SCORE');
        const hasCoinMult = activePowerUps.has('COIN_MULTIPLIER');

        // Smoothly increase base speed with distance
        const targetBaseSpeed = Math.min(36, 19 + distanceRun * 0.0045);
        forwardSpeed = hasSpeedBoost ? targetBaseSpeed * 1.45 : targetBaseSpeed;

        // Dynamic FOV for speed sensation
        const targetFov = hasSpeedBoost ? 72 : 60 + (forwardSpeed - 19) * 0.35;
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.1);
        camera.updateProjectionMatrix();

        const moveDelta = forwardSpeed * dt;
        distanceRun += moveDelta * 0.45;

        const scoreMult = multRef.current * (hasDoubleScore ? 2 : 1);
        score += moveDelta * 1.2 * scoreMult;

        // Check Environment Section Transition every 350m
        const computedSectionIdx = (Math.floor(distanceRun / 350) % ENVIRONMENT_SECTIONS.length);
        const newSection = ENVIRONMENT_SECTIONS[computedSectionIdx];
        if (newSection.id !== currentSectionId) {
          currentSectionId = newSection.id;
          scene.background = new THREE.Color(newSection.skyColor);
          scene.fog = new THREE.FogExp2(newSection.fogColor, 0.015);
          groundMat.color.set(newSection.groundColor);
          roadMat.color.set(newSection.roadColor);
        }

        // Horizontal lane interpolation
        const targetX = LANE_POSITIONS[currentLane];
        const dx = targetX - playerX;
        playerX = THREE.MathUtils.lerp(playerX, targetX, Math.min(1, dt * 14));
        const laneTilt = -dx * 0.14;

        // Vertical jump physics
        if (isJumping) {
          playerY += velocityY * dt;
          velocityY -= 30 * dt; // Gravity
          if (playerY <= 0) {
            playerY = 0;
            velocityY = 0;
            isJumping = false;
          }
        }

        // Slide timer
        if (isSliding) {
          slideTimer -= dt;
          if (slideTimer <= 0) {
            isSliding = false;
          }
        }

        // Footstep sound cadence
        if (!isJumping && !isSliding) {
          footstepTimer -= dt;
          if (footstepTimer <= 0) {
            soundEngine.playFootstep();
            footstepTimer = Math.max(0.18, 0.34 - (forwardSpeed - 19) * 0.006);
          }
        }

        suraj.root.position.set(playerX, playerY, 0);
        const animState: CharacterAnimState = isJumping ? 'JUMP' : isSliding ? 'SLIDE' : 'RUN';
        suraj.updateAnimation(
          animState,
          elapsedSec,
          (forwardSpeed - 19) / 18,
          laneTilt,
          hasShield || hasSpeedBoost
        );

        // Chase Camera tracking
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerX * 0.55, 0.12);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 3.35 + playerY * 0.3, 0.12);
        camera.position.z = 5.8;
        camera.lookAt(playerX * 0.3, 1.2 + playerY * 0.2, -6);

        // Move road dashes
        roadDashes.forEach((d) => {
          d.position.z += moveDelta;
          if (d.position.z > 10) d.position.z -= 140;
        });

        // Move & recycle roadside environment props
        roadsideProps.forEach((prop, idx) => {
          prop.position.z += moveDelta;
          if (prop.position.z > 12) {
            scene.remove(prop);
            const side = idx % 2 === 0 ? -1 : 1;
            const replacement = createRoadsideProp(currentSectionId, side);
            replacement.position.z = -128 - Math.random() * 8;
            scene.add(replacement);
            roadsideProps[idx] = replacement;
          }
        });

        // Spawn new waves ahead
        spawnZCursor += moveDelta;
        const waveSpacing = Math.max(19, 27 - (forwardSpeed - 19) * 0.35);
        while (spawnZCursor > -115) {
          spawnZCursor -= waveSpacing;
          spawnWaveAt(spawnZCursor);
        }

        // Update Coins & Magnet attraction
        for (let i = coins.length - 1; i >= 0; i--) {
          const c = coins[i];
          c.z += moveDelta;
          c.mesh.rotation.y += 3.5 * dt;

          if (hasMagnet && !c.collected && c.z > -18 && c.z < 3) {
            c.x = THREE.MathUtils.lerp(c.x, playerX, dt * 9);
            c.y = THREE.MathUtils.lerp(c.y, playerY + 0.9, dt * 9);
          }

          c.mesh.position.set(c.x, c.y, c.z);

          // Check collection
          if (
            !c.collected &&
            Math.abs(c.z) < 1.15 &&
            Math.abs(c.x - playerX) < 1.05 &&
            Math.abs(c.y - (playerY + 0.85)) < 1.25
          ) {
            c.collected = true;
            const coinGain = hasCoinMult ? 2 : 1;
            runCoins += coinGain;
            score += 15 * coinGain * scoreMult;
            soundEngine.playCoin();
            triggerParticleBurst(c.mesh.position, 0xfacc15);
            scene.remove(c.mesh);
            coins.splice(i, 1);
            continue;
          }

          if (c.z > 10) {
            scene.remove(c.mesh);
            coins.splice(i, 1);
          }
        }

        // Update Power-Ups
        for (let i = powerUps.length - 1; i >= 0; i--) {
          const p = powerUps[i];
          p.z += moveDelta;
          p.mesh.position.set(p.x, p.y + Math.sin(elapsedSec * 5) * 0.15, p.z);
          p.mesh.rotation.y += 2.5 * dt;

          if (
            !p.collected &&
            Math.abs(p.z) < 1.25 &&
            Math.abs(p.x - playerX) < 1.1
          ) {
            p.collected = true;
            runPowerUps++;
            const totalDuration = 8 + bonusRef.current;
            activePowerUps.set(p.type, {
              remaining: totalDuration,
              duration: totalDuration,
            });
            soundEngine.playPowerUp();
            triggerParticleBurst(p.mesh.position, 0x38bdf8);
            scene.remove(p.mesh);
            powerUps.splice(i, 1);
            continue;
          }

          if (p.z > 10) {
            scene.remove(p.mesh);
            powerUps.splice(i, 1);
          }
        }

        // Update Obstacles & Check Collisions
        let nearMissTriggered = false;
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.z += (forwardSpeed + obs.movingSpeed) * dt;
          obs.mesh.position.z = obs.z;

          const obsX = LANE_POSITIONS[obs.lane];
          const inZRange = obs.z > -1.05 && obs.z < 0.95;
          const inXRange = Math.abs(obsX - playerX) < 0.92;

          if (inZRange && inXRange) {
            let hit = false;
            if (obs.requiresJump) {
              // Cleared if playerY > 0.82
              if (playerY < 0.82) hit = true;
            } else if (obs.requiresSlide) {
              // Cleared if sliding
              if (!isSliding) hit = true;
            } else if (obs.isFullBlock) {
              hit = true;
            }

            if (hit) {
              if (hasShield || hasSpeedBoost) {
                // Smash obstacle cleanly with Shield or Speed Boost!
                activePowerUps.delete('SHIELD');
                soundEngine.playShieldBreak();
                triggerParticleBurst(obs.mesh.position, 0xef4444);
                scene.remove(obs.mesh);
                obstacles.splice(i, 1);
                continue;
              } else {
                isCrashed = true;
                crashTimer = 0.85;
                soundEngine.playCrash();
                break;
              }
            }
          }

          // Near-miss bonus check
          if (!obs.passed && obs.z > 1.0) {
            obs.passed = true;
            if (Math.abs(obsX - playerX) < 1.45) {
              score += 25 * scoreMult;
              nearMissTriggered = true;
            }
          }

          if (obs.z > 12) {
            scene.remove(obs.mesh);
            obstacles.splice(i, 1);
          }
        }

        // Update Particle Burst
        if (particleLife > 0) {
          particleLife -= dt;
          const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
          for (let i = 0; i < particleCount; i++) {
            const vx = particleVelocities[i].x;
            const vy = particleVelocities[i].y;
            const vz = particleVelocities[i].z;
            posAttr.setXYZ(
              i,
              posAttr.getX(i) + vx * dt,
              posAttr.getY(i) + vy * dt,
              posAttr.getZ(i) + vz * dt
            );
            particleVelocities[i].y -= 12 * dt;
          }
          posAttr.needsUpdate = true;
        }

        // Emit HUD updates at ~15fps to avoid unnecessary React re-renders
        hudEmitTimer += dt;
        if (hudEmitTimer >= 0.065 || nearMissTriggered) {
          hudEmitTimer = 0;
          const powerUpList: ActivePowerUpHUD[] = [];
          activePowerUps.forEach((v, k) => {
            powerUpList.push({ type: k, remaining: v.remaining, duration: v.duration });
          });
          onHUDUpdate(
            Math.floor(score),
            runCoins,
            Math.floor(distanceRun),
            currentSectionId,
            powerUpList,
            nearMissTriggered
          );
        }
      }

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      renderer.dispose();
    };
  }, [graphics]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-slate-950"
      aria-label="5TAR RUNNER 3D Game Canvas"
    />
  );
};
