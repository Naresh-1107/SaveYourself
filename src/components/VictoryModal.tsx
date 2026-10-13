import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, CheckCircle2, Clock, RefreshCw, Sun, Shield } from 'lucide-react';
import { BIS_DISCLAIMER, BIS_EDUCATIONAL_STATEMENT } from '../game/puzzleData';

interface VictoryModalProps {
  loopNumber: number;
  totalTime: number;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  loopNumber,
  totalTime,
  onRestart,
}) => {
  useEffect(() => {
    // Fire celebratory confetti bursts
    const end = Date.now() + 3.0 * 1000;
    const colors = ['#00e5ff', '#10b981', '#f59e0b', '#38bdf8', '#fbbf24'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-xl w-full bg-slate-900 border border-emerald-500/50 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-5 text-slate-100 my-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2 border-b border-slate-800 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Award className="w-8 h-8" />
          </div>

          <span className="text-xs font-mono tracking-widest text-emerald-400 font-bold uppercase mt-1">
            All Levels Completed · Full Facility Escape
          </span>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            FULL ESCAPE SUCCESSFUL
          </h1>

          <p className="text-sm text-slate-300 max-w-md">
            You successfully navigated the time-loop protocol, verified simulated product safety compliance, and solved the calibration equation to fully exit the facility!
          </p>
        </div>

        {/* Level Summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col gap-1.5">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Level 1: Testing Lab
            </span>
            <p className="text-slate-300">
              Identified non-conforming relief valve SMPL-TRV-419 (failed burst pressure limit).
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col gap-1.5">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5" /> Level 2: Calibration Deck
            </span>
            <p className="text-slate-300">
              Calculated standard equal load distribution: 360 kg ÷ 4 = 90 kg per anchor cable.
            </p>
          </div>
        </div>

        {/* Overall Performance Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col gap-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Total Time Elapsed
            </span>
            <span className="text-xl font-bold text-white font-mono">
              {formatTime(totalTime)}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col gap-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              Total Loops Executed
            </span>
            <span className="text-xl font-bold text-white font-mono">
              {loopNumber} {loopNumber === 1 ? 'Loop' : 'Loops'}
            </span>
          </div>
        </div>

        {/* Educational Messages */}
        <div className="flex flex-col gap-1.5 text-center pt-1">
          <p className="text-xs text-cyan-300/90 font-medium">
            {BIS_EDUCATIONAL_STATEMENT}
          </p>
          <p className="text-[10px] text-slate-400">
            {BIS_DISCLAIMER}
          </p>
        </div>

        {/* Play Again Button */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Replay From Level 1</span>
        </button>
      </div>
    </div>
  );
};
