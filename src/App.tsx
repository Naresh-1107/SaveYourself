/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { TerminalModal } from './components/TerminalModal';
import { MathModal } from './components/MathModal';
import { LevelTransitionModal } from './components/LevelTransitionModal';
import { PauseModal } from './components/PauseModal';
import { VictoryModal } from './components/VictoryModal';
import { GameEngine } from './game/engine';
import { GameState, PuzzleState } from './game/types';
import { soundManager } from './game/audio';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [puzzleState, setPuzzleState] = useState<PuzzleState>({
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
    loopDuration: 90.0,
    timerPaused: false,
    exitDistance: 19.8,
    hasEcho: false,
    activeObjective: 'Walk to the pressure plate on the left, then press [R] to record your echo.',
    interactionPrompt: null,
    interactionType: null,
    totalTimeElapsed: 0,
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());
  const engineRef = useRef<GameEngine | null>(null);

  const handleEngineReady = useCallback((engine: GameEngine) => {
    engineRef.current = engine;
  }, []);

  const handleStateChange = useCallback((newState: GameState, newPuzzle: PuzzleState) => {
    setGameState(newState);
    setPuzzleState(newPuzzle);
  }, []);

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handlePause = () => {
    if (engineRef.current && gameState === 'PLAYING') {
      engineRef.current.clearAllKeys();
      engineRef.current.setGameState('PAUSED');
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.resumeGame();
    }
  };

  const handleRestartLoop = () => {
    if (engineRef.current) {
      engineRef.current.triggerLoopRestart();
    }
  };

  const handleFullRestart = () => {
    if (engineRef.current) {
      engineRef.current.resetAll();
      engineRef.current.startGame();
    }
  };

  const handleInteract = () => {
    if (engineRef.current && gameState === 'PLAYING') {
      engineRef.current.handleInteract();
    }
  };

  const handleVerifiedInspection = () => {
    if (engineRef.current) {
      engineRef.current.verifyInspectionSuccess();
    }
  };

  const handleCloseTerminal = () => {
    if (engineRef.current) {
      engineRef.current.resumeGame();
    }
  };

  const handleStartLevel2 = () => {
    if (engineRef.current) {
      engineRef.current.loadLevel(2);
    }
  };

  const handleVerifyMath = () => {
    if (engineRef.current) {
      engineRef.current.verifyMathSuccess();
    }
  };

  const handleCloseMathTerminal = () => {
    if (engineRef.current) {
      engineRef.current.resumeGame();
    }
  };

  const handleToggleTimerPause = () => {
    if (engineRef.current) {
      engineRef.current.toggleTimerPause();
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden select-none">
      {/* 3D Game Canvas Viewport */}
      <GameCanvas
        onEngineReady={handleEngineReady}
        onStateChange={handleStateChange}
      />

      {/* Floating HUD during active gameplay */}
      {gameState === 'PLAYING' && (
        <HUD
          puzzle={puzzleState}
          onPause={handlePause}
          onRestartLoop={handleRestartLoop}
          onInteract={handleInteract}
          onToggleTimerPause={handleToggleTimerPause}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Start Screen Menu */}
      {gameState === 'MENU' && (
        <StartScreen
          onStart={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Level 1: Inspection Terminal Interactive Modal */}
      {gameState === 'TERMINAL' && (
        <TerminalModal
          onVerified={handleVerifiedInspection}
          onClose={handleCloseTerminal}
        />
      )}

      {/* Level Transition Modal */}
      {gameState === 'LEVEL_TRANSITION' && (
        <LevelTransitionModal
          onContinue={handleStartLevel2}
        />
      )}

      {/* Level 2: Math Calibration Modal */}
      {gameState === 'MATH_TERMINAL' && (
        <MathModal
          onVerified={handleVerifyMath}
          onClose={handleCloseMathTerminal}
        />
      )}

      {/* Pause Menu */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onResetLoop={handleRestartLoop}
          onFullRestart={handleFullRestart}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Full Game Victory Celebration Screen */}
      {gameState === 'WON' && (
        <VictoryModal
          loopNumber={puzzleState.loopNumber}
          totalTime={puzzleState.totalTimeElapsed}
          onRestart={handleFullRestart}
        />
      )}
    </div>
  );
}
