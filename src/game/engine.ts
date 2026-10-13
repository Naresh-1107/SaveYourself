import * as THREE from 'three';
import { GameState, PuzzleState } from './types';
import { PhysicsEngine } from './physics';
import { TimeLoopRecorder } from './recording';
import { createCharacter, CharacterRig } from './character';
import { buildLaboratory, LabSceneObjects } from './sceneBuilder';
import { soundManager } from './audio';

export class GameEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private physics: PhysicsEngine;
  private recorder: TimeLoopRecorder;

  private playerRig: CharacterRig;
  private echoRig: CharacterRig;
  private labObjects: LabSceneObjects;

  // Player State
  private playerPos = new THREE.Vector3(0, 0, 8);
  private playerRotation = 0; // angle in radians facing -Z
  private playerSpeed = 4.8;
  private isMoving = false;

  // Camera Third-Person Orbit
  private cameraYaw = 0; // horizontal angle in radians
  private cameraPitch = 0.16; // Eye-level perspective looking directly forward at the exit door
  private cameraDistance = 4.8;
  private isDraggingMouse = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  // Keys tracking
  private keys: Record<string, boolean> = {};

  // Loop & Puzzle State
  public puzzleState: PuzzleState = {
    currentLevel: 1,
    platePressedByPlayer: false,
    platePressedByEcho: false,
    isPlateActive: false,
    terminalPowered: false,
    inspectionVerified: false,
    mathSolved: false,
    doorUnlocked: false,
    loopNumber: 1,
    loopTime: 0,
    loopDuration: 90.0, // 90s loop duration gives generous time to solve and move
    timerPaused: false,
    exitDistance: 19.8,
    hasEcho: false,
    activeObjective: 'Walk to the pressure plate on the left to prepare auxiliary power, then press [R] to record your echo.',
    interactionPrompt: null,
    interactionType: null,
    totalTimeElapsed: 0,
  };

  private lastBirdChirpTime = 0;

  public gameState: GameState = 'MENU';
  private onStateChange: (state: GameState, puzzle: PuzzleState) => void;

  // Animation frame
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private isDisposed = false;

  constructor(
    container: HTMLElement,
    onStateChange: (state: GameState, puzzle: PuzzleState) => void
  ) {
    this.container = container;
    this.onStateChange = onStateChange;

    this.physics = new PhysicsEngine();
    this.recorder = new TimeLoopRecorder();

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b111e);

    // Camera
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 100);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Build Environment (default Level 1)
    this.labObjects = buildLaboratory(this.scene, 1);

    // Create Player
    this.playerRig = createCharacter(false);
    this.scene.add(this.playerRig.group);
    this.playerRig.group.position.copy(this.playerPos);

    // Create Echo
    this.echoRig = createCharacter(true);
    this.echoRig.group.visible = false;
    this.scene.add(this.echoRig.group);

    // Bind event listeners
    this.bindEvents();

    // Start loop
    this.lastTime = performance.now();
    this.tick(this.lastTime);
  }

  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    window.addEventListener('resize', this.handleResize);

    const canvas = this.renderer.domElement;
    canvas.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);

    // Context loss recovery
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    });
    canvas.addEventListener('webglcontextrestored', () => {
      this.lastTime = performance.now();
      this.tick(this.lastTime);
    });
  }

  public clearAllKeys() {
    this.keys = {};
    this.isMoving = false;
    this.isDraggingMouse = false;
  }

  private handleBlur = () => {
    this.clearAllKeys();
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    // Do not intercept if user is typing in UI inputs
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }

    // Prevent default scroll behavior for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    // Ignore key repeat for single-press actions
    if (e.repeat) {
      if (['r', 'R', 'e', 'E', 'Escape'].includes(e.key)) {
        return;
      }
    }

    this.keys[e.key.toLowerCase()] = true;
    this.keys[e.code] = true;

    // Handle ESC for Pause / Resume
    if (e.key === 'Escape') {
      if (this.gameState === 'PLAYING') {
        this.clearAllKeys();
        this.setGameState('PAUSED');
      } else if (this.gameState === 'PAUSED') {
        this.resumeGame();
      } else if (this.gameState === 'TERMINAL' || this.gameState === 'MATH_TERMINAL') {
        this.resumeGame();
      }
      return;
    }

    // Handle R for Restart Loop
    if ((e.key === 'r' || e.key === 'R') && this.gameState === 'PLAYING') {
      this.triggerLoopRestart();
      return;
    }

    // Handle E for Interaction
    if ((e.key === 'e' || e.key === 'E') && this.gameState === 'PLAYING') {
      this.handleInteract();
      return;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
    this.keys[e.code] = false;
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (this.gameState !== 'PLAYING') return;
    this.isDraggingMouse = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
  };

  private handleMouseUp = () => {
    this.isDraggingMouse = false;
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (this.gameState !== 'PLAYING') return;

    if (this.isDraggingMouse) {
      const deltaX = e.clientX - this.lastMouseX;
      const deltaY = e.clientY - this.lastMouseY;

      this.cameraYaw -= deltaX * 0.005;
      this.cameraPitch = Math.max(0.1, Math.min(1.1, this.cameraPitch + deltaY * 0.005));

      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }
  };

  private handleResize = () => {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public setGameState(state: GameState) {
    this.gameState = state;
    this.clearAllKeys();
    this.onStateChange(this.gameState, { ...this.puzzleState });
  }

  public startGame() {
    this.loadLevel(1);
    soundManager.startAmbience();
    this.lastTime = performance.now();
    this.setGameState('PLAYING');
  }

  public resumeGame() {
    this.clearAllKeys();
    this.lastTime = performance.now();
    this.setGameState('PLAYING');
  }

  public toggleTimerPause() {
    this.puzzleState.timerPaused = !this.puzzleState.timerPaused;
    this.onStateChange(this.gameState, { ...this.puzzleState });
  }

  public loadLevel(level: 1 | 2) {
    this.clearAllKeys();
    this.recorder.resetAll();

    // Rebuild scene for specified level
    this.labObjects.cleanUp();
    this.labObjects = buildLaboratory(this.scene, level);

    // Update collision boundaries for level
    this.physics.setLevel(level);

    // Update ambient sound synthesizer for level
    soundManager.setLevelAudio(level);

    // Reset player position and camera - pitch 0.14 frames the illuminated exit marquee right in the center upper screen
    this.playerPos.set(0, 0, 8);
    this.playerRotation = 0;
    this.cameraYaw = 0;
    this.cameraPitch = 0.14; // Eye level facing directly at illuminated exit
    this.cameraDistance = 4.8;
    this.playerRig.group.position.copy(this.playerPos);
    this.playerRig.group.rotation.y = 0;
    this.playerRig.animate(false, 0);
    this.echoRig.group.visible = false;

    this.puzzleState = {
      currentLevel: level,
      platePressedByPlayer: false,
      platePressedByEcho: false,
      isPlateActive: false,
      terminalPowered: false,
      inspectionVerified: level === 2,
      mathSolved: false,
      doorUnlocked: false,
      loopNumber: 1,
      loopTime: 0,
      loopDuration: 90.0,
      timerPaused: false,
      exitDistance: 19.8,
      hasEcho: false,
      activeObjective:
        level === 1
          ? 'Walk to the pressure plate on the left, then press [R] to record your echo.'
          : 'Step onto the ancient solar relay pad on the left, press [R] to record your echo, then solve the math equation at the research desk.',
      interactionPrompt: null,
      interactionType: null,
      totalTimeElapsed: this.puzzleState.totalTimeElapsed,
    };

    this.lastTime = performance.now();
    this.setGameState('PLAYING');
  }

  public triggerLoopRestart() {
    if (this.gameState !== 'PLAYING' && this.gameState !== 'TERMINAL' && this.gameState !== 'MATH_TERMINAL') return;

    soundManager.playTimeRewind();

    // Finish current recording and check if echo exists
    const hasEcho = this.recorder.startNewLoop();
    this.puzzleState.hasEcho = hasEcho;
    this.puzzleState.loopNumber += 1;
    this.puzzleState.loopTime = 0;

    // Reset player position to start spawn
    this.playerPos.set(0, 0, 8);
    this.playerRotation = 0;
    this.playerRig.group.position.copy(this.playerPos);
    this.playerRig.group.rotation.y = this.playerRotation;
    this.playerRig.animate(false, 0);

    this.clearAllKeys();

    if (hasEcho) {
      this.echoRig.group.visible = true;
    } else {
      this.echoRig.group.visible = false;
    }

    // If modal terminal was open, safely return to PLAYING state
    if (this.gameState === 'TERMINAL' || this.gameState === 'MATH_TERMINAL') {
      this.setGameState('PLAYING');
    } else {
      this.onStateChange(this.gameState, { ...this.puzzleState });
    }
  }

  public handleInteract() {
    if (this.gameState !== 'PLAYING') return;

    if (this.puzzleState.interactionType === 'TERMINAL') {
      if (this.puzzleState.terminalPowered) {
        soundManager.playTerminalBeep();
        this.clearAllKeys();
        if (this.puzzleState.currentLevel === 1) {
          this.setGameState('TERMINAL');
        } else {
          this.setGameState('MATH_TERMINAL');
        }
      } else {
        soundManager.playWrongSelection();
      }
    }
  }

  /**
   * Called when player confirms the correct inspection record discrepancy in Level 1
   */
  public verifyInspectionSuccess() {
    this.puzzleState.inspectionVerified = true;
    this.puzzleState.doorUnlocked = true;
    soundManager.playSuccessVerification();
    soundManager.playDoorUnlock();
    this.resumeGame();
  }

  /**
   * Called when player confirms the correct math calculation in Level 2
   */
  public verifyMathSuccess() {
    this.puzzleState.mathSolved = true;
    this.puzzleState.doorUnlocked = true;
    soundManager.playSuccessVerification();
    soundManager.playDoorUnlock();
    this.resumeGame();
  }

  public resetAll() {
    this.clearAllKeys();
    this.recorder.resetAll();
    this.loadLevel(1);
    this.puzzleState.totalTimeElapsed = 0;
    this.onStateChange(this.gameState, { ...this.puzzleState });
  }

  private tick = (timestamp: number) => {
    if (this.isDisposed) return;
    this.animationFrameId = requestAnimationFrame(this.tick);

    const delta = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    if (this.gameState === 'PLAYING') {
      this.updateGameplay(delta);
    }

    // Always update visual environmental animations & camera
    this.updateEnvironment(delta);
    this.updateCamera(delta);

    this.renderer.render(this.scene, this.camera);
  };

  private updateGameplay(delta: number) {
    this.puzzleState.totalTimeElapsed += delta;

    // Calculate real-time distance from player to exit doorway (Z = -11.8)
    this.puzzleState.exitDistance = Math.hypot(this.playerPos.x, this.playerPos.z - (-11.8));

    // Only tick loop countdown and auto-restart if exit door is STILL LOCKED and timer is NOT paused!
    // When the exit door is unlocked, lockdown is disengaged: no auto-restart so player can freely escape!
    if (!this.puzzleState.doorUnlocked && !this.puzzleState.timerPaused) {
      this.puzzleState.loopTime += delta;
      if (this.puzzleState.loopTime >= this.puzzleState.loopDuration) {
        this.triggerLoopRestart();
        return;
      }
    }

    // Natural outdoor environment ambient effects in Level 2
    if (this.puzzleState.currentLevel === 2) {
      const now = performance.now();
      if (now - this.lastBirdChirpTime > 11000) {
        this.lastBirdChirpTime = now;
        soundManager.playBirdChirp();
      }
    }

    // Camera rotation keys (Arrow keys strictly for camera rotation)
    if (this.keys['arrowleft']) {
      this.cameraYaw += 2.4 * delta;
    }
    if (this.keys['arrowright']) {
      this.cameraYaw -= 2.4 * delta;
    }
    if (this.keys['arrowup']) {
      this.cameraPitch = Math.min(1.1, this.cameraPitch + 1.8 * delta);
    }
    if (this.keys['arrowdown']) {
      this.cameraPitch = Math.max(0.1, this.cameraPitch - 1.8 * delta);
    }

    // 1. Player Movement relative to camera angle (W/A/S/D strictly)
    let inputForward = 0;
    let inputRight = 0;

    if (this.keys['w'] || this.keys['keyw']) inputForward += 1;
    if (this.keys['s'] || this.keys['keys']) inputForward -= 1;
    if (this.keys['a'] || this.keys['keya']) inputRight -= 1;
    if (this.keys['d'] || this.keys['keyd']) inputRight += 1;

    const inputLen = Math.hypot(inputRight, inputForward);
    this.isMoving = inputLen > 0.01;

    if (this.isMoving) {
      // Normalize diagonal movement so speed is strictly 1.0 in all directions
      const normRight = inputRight / inputLen;
      const normForward = inputForward / inputLen;

      const worldMoveX = normRight * Math.cos(this.cameraYaw) + normForward * (-Math.sin(this.cameraYaw));
      const worldMoveZ = normRight * (-Math.sin(this.cameraYaw)) + normForward * (-Math.cos(this.cameraYaw));

      const targetX = this.playerPos.x + worldMoveX * this.playerSpeed * delta;
      const targetZ = this.playerPos.z + worldMoveZ * this.playerSpeed * delta;

      // Physics collision sliding resolution
      const resolved = this.physics.resolveMovement(
        this.playerPos.x,
        this.playerPos.z,
        targetX,
        targetZ,
        this.puzzleState.doorUnlocked
      );

      this.playerPos.x = resolved.x;
      this.playerPos.z = resolved.z;

      // Face movement direction
      const targetAngle = Math.atan2(worldMoveX, worldMoveZ);
      let angleDiff = targetAngle - this.playerRotation;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      this.playerRotation += angleDiff * Math.min(1, delta * 15);

      soundManager.playFootstep();
    }

    // Sync player mesh
    this.playerRig.group.position.copy(this.playerPos);
    this.playerRig.group.rotation.y = this.playerRotation;
    this.playerRig.animate(this.isMoving, delta);

    // 2. Check Player on Pressure Plate
    const playerOnPlate = this.physics.isInsidePlate(this.playerPos.x, this.playerPos.z);
    this.puzzleState.platePressedByPlayer = playerOnPlate;

    // 3. Record Frame
    this.recorder.recordFrame({
      time: this.puzzleState.loopTime,
      x: this.playerPos.x,
      y: this.playerPos.y,
      z: this.playerPos.z,
      rotationY: this.playerRotation,
      isMoving: this.isMoving,
      isOnPlate: playerOnPlate,
    });

    // 4. Sample Echo and check Echo on Pressure Plate
    let echoOnPlate = false;
    if (this.puzzleState.hasEcho) {
      const echoSample = this.recorder.sampleEcho(this.puzzleState.loopTime);
      if (echoSample) {
        this.echoRig.group.visible = true;
        this.echoRig.group.position.set(echoSample.x, echoSample.y, echoSample.z);
        this.echoRig.group.rotation.y = echoSample.rotationY;
        this.echoRig.animate(echoSample.isMoving, delta);

        echoOnPlate = this.physics.isInsidePlate(echoSample.x, echoSample.z);
      }
    } else {
      this.echoRig.group.visible = false;
    }
    this.puzzleState.platePressedByEcho = echoOnPlate;

    // 5. Evaluate Circuit & Plate State
    const wasActive = this.puzzleState.isPlateActive;
    const isNowActive = playerOnPlate || echoOnPlate;
    this.puzzleState.isPlateActive = isNowActive;
    this.puzzleState.terminalPowered = isNowActive;

    if (isNowActive !== wasActive) {
      soundManager.playPlateClick(isNowActive);
    }

    // 6. Interaction Prompts based on nearest interactive object
    const nearTerminal = this.physics.isNearTerminal(this.playerPos.x, this.playerPos.z);
    const nearPlate = this.physics.isInsidePlate(this.playerPos.x, this.playerPos.z);
    const nearExit = this.physics.isNearExitDoor(this.playerPos.x, this.playerPos.z);

    if (nearTerminal) {
      this.puzzleState.interactionType = 'TERMINAL';
      if (this.puzzleState.terminalPowered) {
        this.puzzleState.interactionPrompt =
          this.puzzleState.currentLevel === 1
            ? '[E] ACCESS INSPECTION TERMINAL (AUX POWER ACTIVE)'
            : '[E] ACCESS MATH CALIBRATION CONSOLE (SOLAR POWER ACTIVE)';
      } else {
        this.puzzleState.interactionPrompt = 'TERMINAL OFFLINE — AUX POWER REQUIRED FROM RELAY PAD';
      }
    } else if (nearPlate) {
      this.puzzleState.interactionType = 'PLATE';
      this.puzzleState.interactionPrompt = 'RELAY PAD ENGAGED — AUXILIARY TERMINAL CONDUIT ENERGIZED';
    } else if (nearExit) {
      this.puzzleState.interactionType = 'DOOR';
      if (this.puzzleState.doorUnlocked) {
        this.puzzleState.interactionPrompt =
          this.puzzleState.currentLevel === 1
            ? 'EXIT BLAST DOOR UNLOCKED — STEP THROUGH TO ADVANCE TO LEVEL 2'
            : 'PERIMETER EXIT GATE UNLOCKED — STEP THROUGH TO FULLY ESCAPE';
      } else {
        this.puzzleState.interactionPrompt = 'EXIT SEALED — SOLVE TERMINAL REQUIREMENTS TO UNLOCK';
      }
    } else {
      this.puzzleState.interactionType = null;
      this.puzzleState.interactionPrompt = null;
    }

    // 7. Dynamic Objective Progression
    if (this.puzzleState.currentLevel === 1) {
      if (this.puzzleState.doorUnlocked) {
        this.puzzleState.activeObjective = 'Lockdown disengaged! Follow the illuminated guide path to the Exit Blast Door.';
      } else if (this.puzzleState.terminalPowered && nearTerminal) {
        this.puzzleState.activeObjective = 'Press [E] at the terminal to inspect product test records and flag discrepancy.';
      } else if (this.puzzleState.terminalPowered) {
        this.puzzleState.activeObjective = 'Plate energized! Rush to the inspection terminal on the right and press [E].';
      } else if (this.puzzleState.hasEcho) {
        this.puzzleState.activeObjective = 'Your past echo is replaying! Wait for echo to hold the plate, then access the terminal.';
      } else if (playerOnPlate) {
        this.puzzleState.activeObjective = 'Plate engaged! Press [R] now to record this loop and spawn your cooperative echo.';
      } else {
        this.puzzleState.activeObjective = 'Walk to the pressure plate on the left, then press [R] to record your loop.';
      }
    } else {
      // Level 2 (Bright Calibration Pavilion)
      if (this.puzzleState.doorUnlocked) {
        this.puzzleState.activeObjective = 'Perimeter gate unlocked! Step through the sunlit exit corridor to fully escape!';
      } else if (this.puzzleState.terminalPowered && nearTerminal) {
        this.puzzleState.activeObjective = 'Press [E] at the terminal to solve the load distribution calibration math equation.';
      } else if (this.puzzleState.terminalPowered) {
        this.puzzleState.activeObjective = 'Solar relay active! Rush to the math terminal and press [E].';
      } else if (this.puzzleState.hasEcho) {
        this.puzzleState.activeObjective = 'Echo is replaying! Wait for echo to hold the relay pad, then use the math terminal.';
      } else if (playerOnPlate) {
        this.puzzleState.activeObjective = 'Relay pad engaged! Press [R] to record your echo on the pad.';
      } else {
        this.puzzleState.activeObjective = 'Step onto the solar relay pad on the left, then press [R] to record your echo.';
      }
    }

    // 8. Exit / Level Completion Trigger
    if (this.puzzleState.doorUnlocked) {
      if (this.physics.isInsideExitZone(this.playerPos.x, this.playerPos.z, true)) {
        if (this.puzzleState.currentLevel === 1) {
          // Level 1 complete -> Transition to Level 2
          soundManager.playDoorUnlock();
          this.clearAllKeys();
          this.setGameState('LEVEL_TRANSITION');
          return;
        } else {
          // Level 2 complete -> Full victory!
          soundManager.playVictoryFanfare();
          this.clearAllKeys();
          this.setGameState('WON');
          return;
        }
      }
    }

    // Sync state with UI
    this.onStateChange(this.gameState, { ...this.puzzleState });
  }

  private updateEnvironment(delta: number) {
    const time = performance.now() * 0.001;
    this.labObjects.updatePlate(this.puzzleState.isPlateActive, delta);
    this.labObjects.updateConduits(this.puzzleState.terminalPowered, time);
    this.labObjects.updateDoor(this.puzzleState.doorUnlocked, delta);
    this.labObjects.updateWaypoint(this.puzzleState.doorUnlocked, time);
    if (this.labObjects.updateLevelEffects) {
      this.labObjects.updateLevelEffects(time, delta);
    }
  }

  private updateCamera(delta: number) {
    const targetLookAt = new THREE.Vector3(
      this.playerPos.x,
      this.playerPos.y + 1.2,
      this.playerPos.z
    );

    let cx = targetLookAt.x + this.cameraDistance * Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch);
    let cy = targetLookAt.y + this.cameraDistance * Math.sin(this.cameraPitch);
    let cz = targetLookAt.z + this.cameraDistance * Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch);

    cx = Math.max(-8.8, Math.min(8.8, cx));
    cy = Math.max(0.6, Math.min(4.5, cy));

    if (this.playerPos.z > -11.0) {
      cz = Math.max(-11.2, Math.min(10.8, cz));
    } else {
      cz = Math.max(-14.2, Math.min(10.8, cz));
    }

    const desiredCamPos = new THREE.Vector3(cx, cy, cz);

    this.camera.position.lerp(desiredCamPos, Math.min(1, delta * 12));
    this.camera.lookAt(targetLookAt);
  }

  public dispose() {
    this.isDisposed = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
