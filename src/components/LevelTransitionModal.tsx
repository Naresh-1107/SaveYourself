import React from 'react';
import { ArrowRight, CheckCircle2, Trees, Sparkles } from 'lucide-react';

interface LevelTransitionModalProps {
  onContinue: () => void;
}

export const LevelTransitionModal: React.FC<LevelTransitionModalProps> = ({
  onContinue,
}) => {
  return (
    <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900 border border-emerald-500/60 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 text-slate-100 text-center my-auto">
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Trees className="w-8 h-8 text-emerald-400" />
          </div>

          <span className="text-xs font-mono tracking-widest text-emerald-400 font-bold uppercase mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Level 1 Complete · Facility Cleared
          </span>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            ENTERING LEVEL 2: NATURAL SANCTUARY
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-md mt-1">
            You've stepped out of the lockdown laboratory into the <strong className="text-emerald-300">bright, sunlit alpine meadow</strong> with fresh breezes, flowing brooks, and wildflowers.
          </p>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-left text-xs text-slate-300 flex flex-col gap-2.5">
          <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Level 2 Mission Protocol:
          </div>
          <ol className="list-decimal list-inside flex flex-col gap-2 text-slate-300">
            <li>Walk onto the <strong className="text-amber-300">Ancient Sunstone Relay Pad</strong> on the left and reset time (<kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono">R</kbd>).</li>
            <li>While your past echo powers the circuit, approach the <strong className="text-sky-300">Wooden Field Research Desk</strong> on the right (<kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono">E</kbd>).</li>
            <li>Solve the standard safety load distribution math problem (<span className="text-emerald-300 font-mono">360 kg ÷ 4</span>).</li>
            <li>Follow the stone path to the towering <strong className="text-emerald-300">Alpine Mountain Pass Exit</strong> to complete your final escape!</li>
          </ol>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <span>Begin Level 2 (Natural Sanctuary)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
