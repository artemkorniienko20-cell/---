import React from 'react';
import { STEERING_WHEEL_OPTIONS } from '../../types/car';
import { playClickSound, playHornSound } from '../../utils/audioSynthesizer';
import { Cpu, Activity, Gem, Disc, Zap, CheckCircle2, Sparkles } from 'lucide-react';

const ICON_MAP = {
  Cpu: Cpu,
  Activity: Activity,
  Gem: Gem,
  Disc: Disc,
  Zap: Zap
};

export default function StepSteeringWheel({ carConfig, updateCarConfig, onNext, onPrev }) {
  const handleSelectWheel = (wheelId) => {
    playClickSound();
    // Switch to interior view to admire the wheel
    updateCarConfig({ wheelId, viewMode: 'interior' });
  };

  const handleTestHorn = (e) => {
    e.stopPropagation();
    playHornSound();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            Крок 3 з 6
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
            <Activity className="text-cyan-400" size={22} />
            Оберіть форму та стиль руля (керма)
          </h2>
          <p className="text-xs text-slate-400">
            Головний орган керування: авіаційний штурвал, трековий алькантаровий M Sport, розкішне дерево чи болідний F1
          </p>
        </div>

        {/* Interior notice pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/80 border border-cyan-800 rounded-xl text-xs text-cyan-300">
          <Sparkles size={14} />
          Огляд салону ввімкнено автоматично
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {STEERING_WHEEL_OPTIONS.map((wheel) => {
          const isSelected = carConfig.wheelId === wheel.id;
          const IconComponent = ICON_MAP[wheel.icon] || Cpu;

          return (
            <div
              key={wheel.id}
              onClick={() => handleSelectWheel(wheel.id)}
              className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950/50 border-cyan-500 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/60 hover:bg-slate-800/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}>
                    <IconComponent size={20} />
                  </div>
                  {isSelected && (
                    <span className="text-cyan-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Встановлено
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mt-3 group-hover:text-cyan-300 transition-colors">
                  {wheel.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {wheel.description}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-block bg-slate-950 px-2 py-0.5 rounded text-[11px] font-mono text-cyan-400 border border-slate-800">
                    {wheel.styleTag}
                  </span>
                  
                  {isSelected && (
                    <button
                      onClick={handleTestHorn}
                      className="text-[11px] text-amber-300 bg-amber-950/70 border border-amber-800/80 px-2 py-0.5 rounded hover:bg-amber-900 transition-colors"
                      title="Сигнал"
                    >
                      📢 Сигнал
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Вартість керма:</span>
                <span className="font-mono font-bold text-emerald-400">
                  +${wheel.price.toLocaleString()}
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
          ← Назад (Двері)
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
        >
          Далі до тонування →
        </button>
      </div>
    </div>
  );
}
