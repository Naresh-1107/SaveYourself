import React from 'react';
import { Play, Volume2, VolumeX, Shield, Clock, AlertCircle } from 'lucide-react';
import { BIS_DISCLAIMER, BIS_EDUCATIONAL_STATEMENT } from '../game/puzzleData';

interface StartScreenProps {
  onStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 my-auto text-slate-100">
        {/* Header */}
        <div className="flex flex-col gap-1 border-b border-slate-800 pb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              BIS-Inspired Innovation Challenge
            </span>
            <button
              onClick={onToggleMute}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isMuted ? 'Muted' : 'Audio On'}</span>
            </button>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            STANDARD SHIFT — ECHO PROTOCOL
          </h1>
          <p className="text-sm font-medium text-cyan-300/90 italic">
            "Your past holds the key to a safer future."
          </p>
        </div>

        {/* Narrative & Problem Statement */}
        <div className="flex flex-col gap-2.5 text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <AlertCircle className="w-4 h-4" />
            Situation: Emergency Facility Lockdown &amp; Time Loop
          </div>
          <p>
            You are a trainee quality inspector trapped inside a sealed product-testing laboratory. 
            The exit door is locked, and the inspection terminal requires continuous auxiliary power from a remote pressure plate.
          </p>
          <p>
            Using the laboratory's <strong className="text-cyan-400">Echo Protocol</strong>, you can reset time while your past translucent echo repeats your exact recorded movements. Cooperate with your echo across two connected sectors:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs pt-1">
            <div className="p-3 bg-slate-900/90 rounded-xl border border-cyan-500/30">
              <span className="font-bold text-cyan-300 block text-sm">Level 1: Testing Lab</span>
              <p className="text-slate-300 mt-1">Power the terminal with your echo, identify the non-conforming relief valve discrepancy, and follow the illuminated runway to the bright Exit Blast Door.</p>
            </div>
            <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-500/30">
              <span className="font-bold text-emerald-300 block text-sm">Level 2: Natural Sanctuary</span>
              <p className="text-slate-300 mt-1">Step into the bright sunlit outdoor meadow with trees, streams, and birdsong. Energize the ancient sunstone pad, solve the load distribution math problem, and escape through the mountain pass!</p>
            </div>
          </div>
        </div>

        {/* Mission Objectives Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col gap-1.5 text-xs text-slate-300">
            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              1. Record Your Past (Echo Protocol)
            </div>
            <p className="text-slate-400">
              Step onto the pressure plate on the left and press <kbd className="px-1 py-0.5 bg-slate-700 rounded text-slate-200">R</kbd> to record your loop. You have 90 seconds (or you can use the Hold Timer button in the HUD).
            </p>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col gap-1.5 text-xs text-slate-300">
            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              2. Inspect &amp; Escape
            </div>
            <p className="text-slate-400">
              While your echo stands on the plate, run to the terminal on the right (<kbd className="px-1 py-0.5 bg-slate-700 rounded text-slate-200">E</kbd>) to solve the requirements. The exit door unlocks and remains open permanently!
            </p>
          </div>
        </div>

        {/* Controls Guide */}
        <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <span className="font-semibold text-slate-200">Controls:</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">WASD</kbd>
            <span>Move</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Mouse Drag / Arrows</span>
            <span>Camera</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">E</kbd>
            <span>Interact</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">R</kbd>
            <span>Record / Reset Loop</span>
          </div>
        </div>

        {/* Start Button & Educational Message */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={onStart}
            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Enter Laboratory (Start Game)</span>
          </button>

          <p className="text-center text-[11px] text-slate-400">
            {BIS_EDUCATIONAL_STATEMENT}
          </p>
          <p className="text-center text-[10px] text-slate-500">
            {BIS_DISCLAIMER}
          </p>
        </div>
      </div>
    </div>
  );
};
