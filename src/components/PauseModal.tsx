import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Shield, RefreshCw } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onResetLoop: () => void;
  onFullRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onResetLoop,
  onFullRestart,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              SIMULATION PAUSED
            </h2>
          </div>
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Simulation [ESC]</span>
          </button>

          <button
            onClick={onResetLoop}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Restart Current Loop [R]</span>
          </button>

          <button
            onClick={onFullRestart}
            className="w-full py-2.5 bg-slate-800 hover:bg-rose-950/50 hover:border-rose-800 text-slate-300 hover:text-rose-200 font-semibold text-sm rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Restart from Beginning</span>
          </button>
        </div>

        {/* Quick Controls Reminder */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex flex-col gap-1.5">
          <span className="font-semibold text-slate-300">Quick Controls:</span>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <div><span className="text-slate-200 font-mono">WASD</span>: Movement</div>
            <div><span className="text-slate-200 font-mono">Mouse</span>: Orbit Look</div>
            <div><span className="text-slate-200 font-mono">E</span>: Terminal Interact</div>
            <div><span className="text-slate-200 font-mono">R</span>: Loop Rewind</div>
          </div>
        </div>
      </div>
    </div>
  );
};
