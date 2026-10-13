import React, { useState } from 'react';
import { MATH_PROBLEMS, BIS_EDUCATIONAL_STATEMENT } from '../game/puzzleData';
import { Calculator, CheckCircle2, XCircle, X, Info, Zap } from 'lucide-react';
import { soundManager } from '../game/audio';

interface MathModalProps {
  onVerified: () => void;
  onClose: () => void;
}

export const MathModal: React.FC<MathModalProps> = ({
  onVerified,
  onClose,
}) => {
  const problem = MATH_PROBLEMS[0]; // Primary math calibration problem
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleSelectOption = (value: number) => {
    setSelectedAnswer(value);
    if (value === problem.correctAnswer) {
      soundManager.playSuccessVerification();
      setFeedback({
        type: 'success',
        message: problem.explanation,
      });
      setIsUnlocked(true);
    } else {
      soundManager.playWrongSelection();
      setFeedback({
        type: 'error',
        message: `Incorrect calculation (${value} ${problem.unit}). Review the division: 360 ÷ 4 = 90. Please try again.`,
      });
      setIsUnlocked(false);
    }
  };

  const handleConfirm = () => {
    onVerified();
  };

  return (
    <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border border-sky-400/50 rounded-2xl shadow-2xl flex flex-col my-auto text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  LEVEL 2: CALIBRATION MATH VERIFICATION
                </h2>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Solve the safety calibration equation to unlock the final perimeter exit.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          {/* Scenario Card */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              {problem.title}
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {problem.scenario}
            </p>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center text-base md:text-lg font-mono font-bold text-sky-300">
              {problem.formula}
            </div>
          </div>

          {/* Multiple Choice Options */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Select Verified Answer:
            </span>
            <div className="grid grid-cols-2 gap-3">
              {problem.options.map((opt) => {
                const isSelected = selectedAnswer === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelectOption(opt.value)}
                    className={`py-3 px-4 rounded-xl border font-mono text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? opt.value === problem.correctAnswer
                          ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-500/20'
                          : 'bg-rose-950/80 border-rose-400 text-rose-200'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && opt.value === problem.correctAnswer && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {isSelected && opt.value !== problem.correctAnswer && (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Banner */}
          {feedback.type && (
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                  : 'bg-rose-950/70 border-rose-500/60 text-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm">
                  {feedback.type === 'success' ? 'Calibration Verified' : 'Calculation Error'}
                </span>
                <span>{feedback.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 text-center sm:text-left">
            <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>{BIS_EDUCATIONAL_STATEMENT}</span>
          </p>

          <div>
            {isUnlocked ? (
              <button
                onClick={handleConfirm}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer animate-pulse"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Calculation & Unlock Final Exit Gate</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel / Return to Pavilion
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
