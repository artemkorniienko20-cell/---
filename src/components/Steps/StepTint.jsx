import React from 'react';
import { TINT_OPTIONS } from '../../types/car';
import { playClickSound } from '../../utils/audioSynthesizer';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function StepTint({ carConfig, updateCarConfig, onNext, onPrev }) {
  const handleSelectTint = (tintId) => {
    playClickSound();
    updateCarConfig({ tintId });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            Крок 4 з 6
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
            <ShieldCheck className="text-cyan-400" size={22} />
            Оберіть рівень тонування скла
          </h2>
          <p className="text-xs text-slate-400">
            Захистіть салон від сонця та сторонніх очей: від заводської прозорості до повного "бункера" 5% або хамелеону
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {TINT_OPTIONS.map((tint) => {
          const isSelected = carConfig.tintId === tint.id;

          return (
            <div
              key={tint.id}
              onClick={() => handleSelectTint(tint.id)}
              className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950/50 border-cyan-500 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/60 hover:bg-slate-800/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  {/* Visual glass tint preview orb */}
                  <div
                    className="w-10 h-10 rounded-xl border border-slate-600 shadow-inner flex items-center justify-center relative overflow-hidden"
                    style={{
                      backgroundColor: tint.tintColor,
                      boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/40" />
                    <span className="text-[10px] font-mono font-bold text-white z-10 drop-shadow">
                      {Math.round((1 - tint.opacity) * 100)}%
                    </span>
                  </div>

                  {isSelected && (
                    <span className="text-cyan-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Обрано
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mt-3 group-hover:text-cyan-300 transition-colors">
                  {tint.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {tint.description}
                </p>

                <div className="mt-3 inline-block bg-slate-950 px-2 py-0.5 rounded text-[11px] font-mono text-cyan-400 border border-slate-800">
                  {tint.legal}
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Ціна плівки:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {tint.price === 0 ? 'Базово (Включено)' : `+$${tint.price.toLocaleString()}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
        <button
          onClick={onPrev}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all"
        >
          ← Назад (Руль)
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
        >
          Далі до кольору →
        </button>
      </div>
    </div>
  );
}
