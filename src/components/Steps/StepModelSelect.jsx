import React, { useState } from 'react';
import { CAR_MODELS } from '../../types/car';
import { playClickSound } from '../../utils/audioSynthesizer';
import { Zap, CheckCircle2, Shield, Flame, Gauge, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'Всі марки (14)' },
  { id: 'retro', label: '🇺🇦 Українська Легенда (ЗАЗ)' },
  { id: 'hypercar', label: '👑 Гіперкари' },
  { id: 'supercar', label: '🏎️ Суперкари' },
  { id: 'muscle', label: '🦅 American Muscle' },
  { id: 'jdm', label: '🇯🇵 JDM Легенди' },
  { id: 'suv', label: '🚙 Позашляховик' },
  { id: 'coupe', label: '🏁 Спорт & RS' },
  { id: 'electric', label: '⚡ Електрокари & Hyper-EV' },
  { id: 'van', label: '🚐 Кемпер Bulli' }
];

export default function StepModelSelect({ carConfig, updateCarConfig, onNext }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSelectModel = (modelId) => {
    playClickSound();
    const model = CAR_MODELS[modelId];
    updateCarConfig({
      modelId,
      colorHex: model.defaultColors[0].hex,
      colorFinish: model.defaultColors[0].finish,
      secondaryColorHex: model.defaultColors[0].secondaryHex || '#f8fafc',
      carName: `${model.brand} ${model.name}`,
    });
  };

  const filteredModels = Object.values(CAR_MODELS).filter((model) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'coupe') return model.category === 'coupe' || model.category === 'wagon';
    return model.category === selectedCategory;
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="text-cyan-400" size={22} />
            Оберіть платформу та марку автомобіля
          </h2>
          <p className="text-xs text-slate-400">
            14 автомобільних шедеврів: від української легенди ЗАЗ-968М "Запорожець", гіперкарів Bugatti, Ferrari та Zeekr 001 FR до Lamborghini, Nissan GT-R, Shelby GT500, Mercedes, BMW, Audi, Porsche та Tesla
          </p>
        </div>

        <div className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          {filteredModels.length} з 14 доступно
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-2 border-b border-slate-800/80">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                playClickSound();
                setSelectedCategory(cat.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredModels.map((model) => {
          const isSelected = carConfig.modelId === model.id;

          return (
            <div
              key={model.id}
              onClick={() => handleSelectModel(model.id)}
              className={`group cursor-pointer relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950/40 border-cyan-500 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-500/50'
                  : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                        {model.brand}
                      </span>
                      {model.country && (
                        <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                          {model.country}
                        </span>
                      )}
                      {model.categoryName && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                          {model.categoryName}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mt-1">
                      {model.name}
                    </h3>
                  </div>

                  {isSelected && (
                    <div className="text-cyan-400 flex items-center gap-1 bg-cyan-950 px-2.5 py-1 rounded-full text-xs font-bold border border-cyan-500/40 shrink-0">
                      <CheckCircle2 size={14} /> Обрано
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">
                  "{model.tagline}"
                </p>

                {/* Specs Pill Badges */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
                      <Flame size={10} className="text-amber-400" /> Потужність
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">{model.specs.power}</div>
                  </div>
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
                      <Gauge size={10} className="text-cyan-400" /> 0-100 км/г
                    </div>
                    <div className="text-xs font-mono font-bold text-cyan-400 mt-0.5">{model.specs.accel}</div>
                  </div>
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
                      <Shield size={10} className="text-indigo-400" /> Привід
                    </div>
                    <div className="text-[11px] font-mono font-bold text-slate-200 truncate mt-0.5" title={model.specs.drive}>
                      {model.specs.drive}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-800/80">
                <span className="text-xs text-slate-400">Базова вартість:</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  ${model.basePrice.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mt-2">
        <button
          onClick={onNext}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 group"
        >
          <span>Перейти до стелі</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
