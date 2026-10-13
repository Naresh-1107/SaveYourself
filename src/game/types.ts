export type GameState =
  | 'MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'LOOP_RESET'
  | 'TERMINAL'
  | 'MATH_TERMINAL'
  | 'LEVEL_TRANSITION'
  | 'WON';

export interface RecordedFrame {
  time: number; // seconds from loop start
  x: number;
  y: number;
  z: number;
  rotationY: number;
  isMoving: boolean;
  isOnPlate: boolean;
}

export interface ProductRecord {
  id: string;
  name: string;
  sampleCode: string;
  category: string;
  standardSpec: string;
  requiredParameters: string[];
  actualTestObservations: string[];
  hasDiscrepancy: boolean;
  explanation: string;
}

export interface MathProblem {
  id: string;
  title: string;
  scenario: string;
  formula: string;
  options: { label: string; value: number }[];
  correctAnswer: number;
  unit: string;
  explanation: string;
}

export interface PuzzleState {
  currentLevel: 1 | 2;
  platePressedByPlayer: boolean;
  platePressedByEcho: boolean;
  isPlateActive: boolean;
  terminalPowered: boolean;
  inspectionVerified: boolean;
  mathSolved: boolean;
  doorUnlocked: boolean;
  loopNumber: number;
  loopTime: number; // 0 to loopDuration
  loopDuration: number; // default 90s
  timerPaused: boolean; // if true, loop does not auto-restart
  exitDistance: number; // meters from player to exit door
  hasEcho: boolean;
  activeObjective: string;
  interactionPrompt: string | null;
  interactionType: 'TERMINAL' | 'PLATE' | 'DOOR' | null;
  totalTimeElapsed: number;
}
