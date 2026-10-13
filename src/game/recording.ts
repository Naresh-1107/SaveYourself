import { RecordedFrame } from './types';

export class TimeLoopRecorder {
  private currentFrames: RecordedFrame[] = [];
  private lastCompletedFrames: RecordedFrame[] | null = null;
  public readonly loopDuration = 90.0; // 90 seconds loop ensures generous puzzle-solving time

  public startNewLoop(): boolean {
    // Only overwrite lastCompletedFrames if the current loop has meaningful recorded data (> 0.2s of frames)
    if (this.currentFrames.length > 5) {
      this.lastCompletedFrames = [...this.currentFrames];
    }
    this.currentFrames = [];
    return this.hasEcho();
  }

  public recordFrame(frame: RecordedFrame) {
    this.currentFrames.push(frame);
  }

  public hasEcho(): boolean {
    return this.lastCompletedFrames !== null && this.lastCompletedFrames.length > 1;
  }

  public getEchoDuration(): number {
    if (!this.lastCompletedFrames || this.lastCompletedFrames.length === 0) return 0;
    return this.lastCompletedFrames[this.lastCompletedFrames.length - 1].time;
  }

  /**
   * Sample the echo at time t (in seconds).
   * Uses smooth interpolation between neighboring frames.
   */
  public sampleEcho(time: number): {
    x: number;
    y: number;
    z: number;
    rotationY: number;
    isMoving: boolean;
    isOnPlate: boolean;
    isActive: boolean;
  } | null {
    if (!this.lastCompletedFrames || this.lastCompletedFrames.length === 0) {
      return null;
    }

    const frames = this.lastCompletedFrames;
    const maxTime = frames[frames.length - 1].time;

    // If past recorded loop time, stay at the final recorded position
    if (time >= maxTime) {
      const last = frames[frames.length - 1];
      return {
        x: last.x,
        y: last.y,
        z: last.z,
        rotationY: last.rotationY,
        isMoving: false,
        isOnPlate: last.isOnPlate,
        isActive: true,
      };
    }

    // Binary search for surrounding frames
    let low = 0;
    let high = frames.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (frames[mid].time < time) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const idx1 = Math.max(0, low - 1);
    const idx2 = Math.min(frames.length - 1, low);

    const f1 = frames[idx1];
    const f2 = frames[idx2];

    if (idx1 === idx2 || f2.time === f1.time) {
      return {
        x: f1.x,
        y: f1.y,
        z: f1.z,
        rotationY: f1.rotationY,
        isMoving: f1.isMoving,
        isOnPlate: f1.isOnPlate,
        isActive: true,
      };
    }

    const alpha = (time - f1.time) / (f2.time - f1.time);
    const clampedAlpha = Math.max(0, Math.min(1, alpha));

    // Linear interpolation for position
    const x = f1.x + (f2.x - f1.x) * clampedAlpha;
    const y = f1.y + (f2.y - f1.y) * clampedAlpha;
    const z = f1.z + (f2.z - f1.z) * clampedAlpha;

    // Angular interpolation for Y rotation (handling wrap-around)
    let diff = f2.rotationY - f1.rotationY;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    const rotationY = f1.rotationY + diff * clampedAlpha;

    const isMoving = clampedAlpha > 0.5 ? f2.isMoving : f1.isMoving;
    const isOnPlate = clampedAlpha > 0.5 ? f2.isOnPlate : f1.isOnPlate;

    return {
      x,
      y,
      z,
      rotationY,
      isMoving,
      isOnPlate,
      isActive: true,
    };
  }

  public resetAll() {
    this.currentFrames = [];
    this.lastCompletedFrames = null;
  }
}
