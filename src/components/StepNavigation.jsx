import React from 'react';
import { STEPS } from '../types/car';
import { playClickSound } from '../utils/audioSynthesizer';
import { Check } from 'lucide-react';

export default function StepNavigation({ currentStepIndex, setCurrentStepIndex }) {
  const handleStepClick = (index) => {
    playClickSound();
    setCurrentStepIndex(index);
  };

  return (
    <div className="w-full overflow-x-auto pb-2 select-none">
      <div className="flex items-center justify-between min-w-[650px] gap-2 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isPassed = idx < currentStepIndex;

          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(idx)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 scale-[1.02]'
                  : isPassed
                  ? 'bg-slate-800/80 text-emerald-400 hover:bg-slate-700/80'
                  : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  isActive
                    ? 'bg-white text-blue-700 font-black'
                    : isPassed
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isPassed ? <Check size={12} strokeWidth={3} /> : step.num}
              </span>
              <span className="whitespace-nowrap tracking-wide">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
