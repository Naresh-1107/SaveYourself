export interface Box3D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export class PhysicsEngine {
  private obstacles: Box3D[] = [];
  public readonly playerRadius = 0.45;
  private currentLevel: 1 | 2 = 1;

  constructor() {
    this.setLevel(1);
  }

  public setLevel(level: 1 | 2) {
    this.currentLevel = level;
    this.obstacles = [];

    // Outer boundary walls: Room dimensions X: -10 to +10, Z: -12 to +12
    // North wall / cliff line (leaving exit gateway open between -2.2 and 2.2)
    this.obstacles.push({ minX: -11.5, maxX: -2.2, minZ: -12.6, maxZ: -11.4 });
    this.obstacles.push({ minX: 2.2, maxX: 11.5, minZ: -12.6, maxZ: -11.4 });

    // Exit corridor outer barrier walls (past door opening)
    this.obstacles.push({ minX: -11.5, maxX: -2.3, minZ: -18.0, maxZ: -12.4 });
    this.obstacles.push({ minX: 2.3, maxX: 11.5, minZ: -18.0, maxZ: -12.4 });

    // South wall / entrance cliff
    this.obstacles.push({ minX: -11.5, maxX: 11.5, minZ: 11.4, maxZ: 12.6 });

    // West perimeter
    this.obstacles.push({ minX: -10.8, maxX: -9.4, minZ: -13.0, maxZ: 12.6 });

    // East perimeter
    this.obstacles.push({ minX: 9.4, maxX: 10.8, minZ: -13.0, maxZ: 12.6 });

    if (level === 1) {
      // Level 1: Cyber-industrial lab stations (kept off central lane so exit is clearly visible)
      // Left testing rig (IS-2925 Helmet Impact Tower)
      this.obstacles.push({ minX: -7.5, maxX: -5.0, minZ: -7.0, maxZ: -4.5 });

      // Right testing bench (IS-9890 Valve Chamber)
      this.obstacles.push({ minX: 5.0, maxX: 7.5, minZ: 3.5, maxZ: 6.0 });

      // Columns flanking the room (wide enough apart so center view to exit is wide open)
      this.obstacles.push({ minX: -5.0, maxX: -4.0, minZ: -1.0, maxZ: 0.2 });
      this.obstacles.push({ minX: 4.0, maxX: 5.0, minZ: -1.0, maxZ: 0.2 });

      // Inspection Terminal desk base (interactive from front at z ~ -2.2)
      this.obstacles.push({ minX: 4.8, maxX: 7.4, minZ: -4.6, maxZ: -2.8 });
    } else {
      // Level 2: Natural Sanctuary landscape props (boulders and timber research desk)
      // Left side ancient mossy boulders
      this.obstacles.push({ minX: -7.5, maxX: -5.2, minZ: -7.5, maxZ: -5.0 });
      this.obstacles.push({ minX: -7.8, maxX: -6.0, minZ: 4.0, maxZ: 6.0 });

      // Right side rock formations
      this.obstacles.push({ minX: 5.5, maxX: 7.5, minZ: 3.5, maxZ: 5.5 });
      this.obstacles.push({ minX: 6.0, maxX: 8.0, minZ: -7.5, maxZ: -5.5 });

      // Nature Research Desk / Solar Calibration console on right
      this.obstacles.push({ minX: 4.8, maxX: 7.4, minZ: -4.6, maxZ: -2.8 });
    }
  }

  /**
   * Check if a position collides with static obstacles or closed exit door.
   */
  public isColliding(x: number, z: number, isDoorUnlocked: boolean): boolean {
    const r = this.playerRadius;

    // Check closed door collision (X: -2.2 to 2.2, Z: -12.3 to -11.5)
    if (!isDoorUnlocked) {
      if (x + r > -2.2 && x - r < 2.2 && z + r > -12.4 && z - r < -11.5) {
        return true;
      }
    }

    // Room outer safety limits
    if (x - r < -9.4 || x + r > 9.4 || z + r > 11.4) {
      return true;
    }
    // North corridor depth limit
    if (z - r < -17.0) {
      return true;
    }

    for (const box of this.obstacles) {
      if (
        x + r > box.minX &&
        x - r < box.maxX &&
        z + r > box.minZ &&
        z - r < box.maxZ
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Resolves player movement using continuous axis sliding.
   */
  public resolveMovement(
    currentX: number,
    currentZ: number,
    targetX: number,
    targetZ: number,
    isDoorUnlocked: boolean
  ): { x: number; z: number } {
    let nextX = currentX;
    let nextZ = currentZ;

    // Try X movement first
    if (!this.isColliding(targetX, currentZ, isDoorUnlocked)) {
      nextX = targetX;
    }

    // Try Z movement with updated X
    if (!this.isColliding(nextX, targetZ, isDoorUnlocked)) {
      nextZ = targetZ;
    }

    return { x: nextX, z: nextZ };
  }

  /**
   * Check if point is inside the pressure plate / solar relay pad region.
   * Plate center: (-6.0, 0, 1.5), radius ~1.75
   */
  public isInsidePlate(x: number, z: number): boolean {
    const dx = x - (-6.0);
    const dz = z - 1.5;
    return dx * dx + dz * dz <= 1.75 * 1.75;
  }

  /**
   * Check if player is in proximity to the inspection / math terminal.
   * Terminal interaction point in front of console: (6.0, 0, -2.2)
   */
  public isNearTerminal(x: number, z: number): boolean {
    const dx = x - 6.0;
    const dz = z - (-2.2);
    return dx * dx + dz * dz <= 2.6 * 2.6;
  }

  /**
   * Check if player is in proximity to the exit door.
   * Exit door location: (0.0, 0, -11.8)
   */
  public isNearExitDoor(x: number, z: number): boolean {
    const dx = x;
    const dz = z - (-11.6);
    return Math.abs(dx) <= 2.6 && Math.abs(dz) <= 2.4;
  }

  /**
   * Check if player has stepped past the exit threshold to win or transition.
   */
  public isInsideExitZone(x: number, z: number, isDoorUnlocked: boolean): boolean {
    if (!isDoorUnlocked) return false;
    return Math.abs(x) < 2.8 && z < -11.2;
  }
}
