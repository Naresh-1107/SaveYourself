import React, { useState } from 'react';
import { PRODUCT_RECORDS, BIS_EDUCATIONAL_STATEMENT } from '../game/puzzleData';
import { ProductRecord } from '../game/types';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, ArrowRight, X, Info } from 'lucide-react';
import { soundManager } from '../game/audio';

interface TerminalModalProps {
  onVerified: () => void;
  onClose: () => void;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({
  onVerified,
  onClose,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(PRODUCT_RECORDS[0].id);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isUnlocked, setIsUnlocked] = useState(false);

  const currentRecord = PRODUCT_RECORDS.find((r) => r.id === selectedRecordId)!;

  const handleFlagDiscrepancy = (record: ProductRecord) => {
    if (record.hasDiscrepancy) {
      soundManager.playSuccessVerification();
      setFeedback({
        type: 'success',
        message: record.explanation,
      });
      setIsUnlocked(true);
    } else {
      soundManager.playWrongSelection();
      setFeedback({
        type: 'error',
        message: `Evaluation Inconclusive: ${record.name} is verified compliant. ${record.explanation} Review the other records for standard deviations.`,
      });
    }
  };

  const handleConfirmAndUnlock = () => {
    onVerified();
  };

  return (
    <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="max-w-3xl w-full bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col my-auto text-slate-100 overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                LABORATORY VERIFICATION TERMINAL
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  ONLINE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspect simulated batch test data against standard safety requirements.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Exit Terminal (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 pt-2 gap-2 overflow-x-auto">
          {PRODUCT_RECORDS.map((record, index) => {
            const isSelected = record.id === selectedRecordId;
            return (
              <button
                key={record.id}
                onClick={() => {
                  setSelectedRecordId(record.id);
                  setFeedback({ type: null, message: '' });
                }}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-cyan-300 border-t-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <span>Sample 0{index + 1}: {record.sampleCode}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 flex flex-col gap-5 max-h-[60vh] overflow-y-auto">
          {/* Record Overview */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-white">
                {currentRecord.name}
              </h3>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 px-2.5 py-1 rounded border border-cyan-900">
                {currentRecord.category}
              </span>
            </div>

            <div className="text-xs text-slate-300 font-mono flex items-center gap-2 mt-1">
              <span className="text-slate-400">Applicable Standard:</span>
              <span className="text-amber-300 font-semibold">{currentRecord.standardSpec}</span>
            </div>
          </div>

          {/* Side-by-Side: Standard Specs vs Laboratory Observations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Required Specs */}
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Required Standard Specifications
              </h4>
              <ul className="text-xs text-slate-300 flex flex-col gap-2 mt-1">
                {currentRecord.requiredParameters.map((spec, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-cyan-400 font-mono mt-0.5">•</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Test Observations */}
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Observed Laboratory Test Results
              </h4>
              <ul className="text-xs text-slate-300 flex flex-col gap-2 mt-1">
                {currentRecord.actualTestObservations.map((obs, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-400 font-mono mt-0.5">•</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feedback Banner */}
          {feedback.type && (
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/60 text-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col gap-1">
                <span className="font-bold text-sm">
                  {feedback.type === 'success' ? 'Discrepancy Confirmed' : 'Inspection Inconclusive'}
                </span>
                <span>{feedback.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 text-center sm:text-left">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{BIS_EDUCATIONAL_STATEMENT}</span>
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isUnlocked ? (
              <button
                onClick={() => handleFlagDiscrepancy(currentRecord)}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 fill-current" />
                <span>Flag Sample for Verification</span>
              </button>
            ) : (
              <button
                onClick={handleConfirmAndUnlock}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer animate-pulse"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Inspection & Unlock Exit Blast Door</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
