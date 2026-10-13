import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { GameState, PuzzleState } from '../game/types';

interface GameCanvasProps {
  onEngineReady: (engine: GameEngine) => void;
  onStateChange: (state: GameState, puzzle: PuzzleState) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onEngineReady,
  onStateChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(containerRef.current, (state, puzzle) => {
      onStateChange(state, puzzle);
    });
    engineRef.current = engine;
    onEngineReady(engine);

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden outline-none"
      tabIndex={0}
    />
  );
};
