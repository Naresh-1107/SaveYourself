import React from 'react';
import { PuzzleState } from '../game/types';
import { Volume2, VolumeX, Pause, RefreshCw, Zap, Lock, Unlock, Compass, MousePointer, Clock, Play } from 'lucide-react';

interface HUDProps {
  puzzle: PuzzleState;
  onPause: () => void;
  onRestartLoop: () => void;
  onInteract?: () => void;
  onToggleTimerPause?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  puzzle,
  onPause,
  onRestartLoop,
  onInteract,
  onToggleTimerPause,
  isMuted,
  onToggleMute,
}) => {
  const remainingTime = Math.max(0, puzzle.loopDuration - puzzle.loopTime);
  const progressPercent = (puzzle.loopTime / puzzle.loopDuration) * 100;
  const isLevel2 = puzzle.currentLevel === 2;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-6 font-sans select-none overflow-hidden">
      {/* TOP ROW: Loop Status, Exit Locator & Quick Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-start justify-between gap-3 w-full">
        {/* Left: Loop Timer, Echo State & Relaxed Timer Toggle */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl flex flex-col gap-2 min-w-[240px]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className={`font-bold tracking-wider ${isLevel2 ? 'text-amber-400' : 'text-cyan-400'}`}>
              {isLevel2 ? 'LVL 2: NATURAL SANCTUARY' : 'LVL 1: TESTING LAB'} · LOOP #{puzzle.loopNumber}
            </span>
            <span
              className={`tabular-nums font-bold ${
                puzzle.doorUnlocked
                  ? 'text-emerald-400'
                  : puzzle.timerPaused
                  ? 'text-amber-300'
                  : remainingTime < 15
                  ? 'text-rose-400 animate-pulse'
                  : 'text-slate-100'
              }`}
            >
              {puzzle.doorUnlocked
                ? 'TIMER SUSPENDED'
                : puzzle.timerPaused
                ? 'TIMER HELD'
                : `${remainingTime.toFixed(1)}s / ${puzzle.loopDuration.toFixed(0)}s`}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className={`h-full transition-all duration-75 ${
                puzzle.doorUnlocked
                  ? 'bg-emerald-400 w-full'
                  : puzzle.timerPaused
                  ? 'bg-amber-400 w-full'
                  : remainingTime < 15
                  ? 'bg-rose-500 animate-pulse'
                  : isLevel2
                  ? 'bg-emerald-400'
                  : 'bg-cyan-500'
              }`}
              style={{ width: puzzle.doorUnlocked || puzzle.timerPaused ? '100%' : `${progressPercent}%` }}
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  puzzle.hasEcho ? 'bg-cyan-400 ring-2 ring-cyan-400/40 animate-pulse' : 'bg-slate-600'
                }`}
              />
              <span>{puzzle.hasEcho ? 'Echo Replaying' : 'Recording Loop'}</span>
            </div>

            <div className="flex items-center gap-1.5 font-medium">
              <Zap
                className={`w-3.5 h-3.5 ${
                  puzzle.terminalPowered
                    ? isLevel2
                      ? 'text-amber-400 animate-pulse'
                      : 'text-cyan-400 animate-pulse'
                    : 'text-slate-500'
                }`}
              />
              <span className={puzzle.terminalPowered ? 'text-amber-300 font-semibold' : 'text-slate-400'}>
                {puzzle.terminalPowered ? 'Aux Power Active' : 'No Aux Power'}
              </span>
            </div>
          </div>

          {/* Loop Timer Control: Toggle Relaxed Mode (Fixes "restarting solve this") */}
          {!puzzle.doorUnlocked && onToggleTimerPause && (
            <button
              onClick={onToggleTimerPause}
              className={`mt-1 py-1 px-2.5 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                puzzle.timerPaused
                  ? 'bg-amber-950/80 border-amber-500 text-amber-200 hover:bg-amber-900/80'
                  : 'bg-slate-800/90 hover:bg-slate-750 border-slate-700 text-slate-300'
              }`}
              title="Toggle Relaxed Mode: prevents loop from automatically resetting"
            >
              {puzzle.timerPaused ? (
                <>
                  <Play className="w-3 h-3 text-amber-400" />
                  <span>Timer Held (No Auto-Reset) · Click to Resume</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>Auto-Reset Active · Click to Hold Timer</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Center: Mission Objective & Ultra-Visible Exit Locator */}
        <div className="pointer-events-auto flex flex-col gap-1.5 max-w-xl mx-auto md:mx-0 w-full md:w-auto">
          {/* Mission Objective */}
          <div className="bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 rounded-xl px-4 py-2 shadow-2xl flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
              <Compass className="w-3.5 h-3.5" />
              Current Mission Objective
            </div>
            <div className="text-xs md:text-sm font-semibold text-slate-100 tracking-tight mt-0.5 leading-snug">
              {puzzle.activeObjective}
            </div>
          </div>

          {/* HIGH-VISIBILITY EXIT LOCATOR RADAR (Requirement: Exit system clearly visible) */}
          <div
            className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2.5 shadow-xl backdrop-blur-md transition-all ${
              puzzle.doorUnlocked
                ? 'bg-emerald-950/95 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/30 animate-pulse'
                : 'bg-slate-950/90 border-amber-500/70 text-amber-300'
            }`}
          >
            {puzzle.doorUnlocked ? (
              <span className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  ▲ {isLevel2 ? 'ALPINE MOUNTAIN PASS EXIT' : 'EMERGENCY EXIT BLAST DOOR'}:{' '}
                  <strong className="text-white underline">
                    {puzzle.exitDistance.toFixed(1)}m STRAIGHT AHEAD (NORTH)
                  </strong>{' '}
                  — UNLOCKED! STEP THROUGH TO {isLevel2 ? 'FULLY ESCAPE!' : 'ADVANCE!'}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  ▲ {isLevel2 ? 'ALPINE MOUNTAIN PASS EXIT' : 'EMERGENCY EXIT BLAST DOOR'}:{' '}
                  <strong className="text-white">{puzzle.exitDistance.toFixed(1)}m STRAIGHT AHEAD (NORTH)</strong> —
                  LOCKED (POWER &amp; TERMINAL REQUIRED)
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="pointer-events-auto flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onRestartLoop}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 rounded-lg text-xs font-semibold shadow-lg transition-colors cursor-pointer"
            title="Restart Loop (R) to record actions"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Loop [R]</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 rounded-lg text-xs shadow-lg transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={onPause}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 rounded-lg text-xs shadow-lg transition-colors cursor-pointer"
            title="Pause Simulation (ESC)"
          >
            <Pause className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* BOTTOM ROW: Interaction Prompts, Camera Instruction & Controls */}
      <div className="flex flex-col items-center gap-2.5 w-full">
        {/* Interaction Prompt (Prominent Context Badge) */}
        {puzzle.interactionPrompt && (
          <div
            onClick={onInteract}
            className={`pointer-events-auto animate-bounce border-2 px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold tracking-wide shadow-2xl flex items-center gap-2.5 backdrop-blur-md cursor-pointer transition-colors ${
              isLevel2
                ? 'bg-amber-950/95 border-amber-400 text-amber-100 hover:bg-amber-900/90'
                : 'bg-cyan-950/95 border-cyan-400 text-cyan-100 hover:bg-cyan-900/90'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full animate-ping shrink-0 ${
                isLevel2 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
            />
            <span>{puzzle.interactionPrompt}</span>
          </div>
        )}

        {/* Clear Camera Instruction */}
        <div className="pointer-events-auto bg-slate-950/75 backdrop-blur-sm border border-slate-800/80 rounded-lg px-3 py-1 flex items-center gap-2 text-[11px] text-slate-400">
          <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Click &amp; drag mouse or use <kbd className="px-1 py-0.2 bg-slate-800 text-slate-200 rounded font-mono">Arrow Keys</kbd> to rotate camera
          </span>
        </div>

        {/* Bottom Control Bar */}
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-mono text-[11px] border border-slate-700">W</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-mono text-[11px] border border-slate-700">A</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-mono text-[11px] border border-slate-700">S</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-mono text-[11px] border border-slate-700">D</kbd>
            <span>Move</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-mono text-[11px] border border-slate-700">E</kbd>
            <span>Interact</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-mono text-[11px] border border-slate-700">R</kbd>
            <span>Restart Loop</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            {puzzle.doorUnlocked ? (
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <Unlock className="w-3.5 h-3.5" /> Exit Unlocked — Head North!
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 font-semibold">
                <Lock className="w-3.5 h-3.5" /> Exit Locked
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
