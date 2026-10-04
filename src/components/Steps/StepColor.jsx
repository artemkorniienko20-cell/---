import React from 'react';
import { CAR_MODELS, PAINT_FINISHES, POPULAR_COLORS } from '../../types/car';
import { playClickSound } from '../../utils/audioSynthesizer';
import { Palette, Sparkles, Check } from 'lucide-react';

export default function StepColor({ carConfig, updateCarConfig, onNext, onPrev }) {
  const currentModel = CAR_MODELS[carConfig.modelId] || CAR_MODELS.bmw;
  const isBus = carConfig.modelId === 'bus';

  const handleSelectColor = (hex, finish = carConfig.colorFinish) => {
    playClickSound();
    updateCarConfig({ colorHex: hex, colorFinish: finish });
  };

  const handleSelectFinish = (finish) => {
    playClickSound();
    updateCarConfig({ colorFinish: finish });
  };

  const handleSelectSecondaryColor = (hex) => {
    playClickSound();
    updateCarConfig({ secondaryColorHex: hex });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
          Крок 5 з 6
        </span>
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
          <Palette className="text-cyan-400" size={22} />
          Колір кузова та тип лакофарбового покриття
        </h2>
        <p className="text-xs text-slate-400">
          Оберіть тип фінішу (глянець, матовий сатин, металік, хамелеон) та палітру кольорів або власний HEX-відтінок
        </p>
      </div>

      {/* Paint Finish Selector */}
      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 block flex items-center gap-1.5">
          <Sparkles size={14} className="text-cyan-400" />
          Тип покриття (Лак):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PAINT_FINISHES.map((finish) => {
            const isSelected = carConfig.colorFinish === finish.id;

            return (
              <button
                key={finish.id}
                onClick={() => handleSelectFinish(finish.id)}
                className={`py-2.5 px-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-950 to-blue-950 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-white">{finish.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{finish.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Specific Signature Colors */}
      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 block">
          Фірмова палітра для {currentModel.name}:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {currentModel.defaultColors.map((colorItem) => {
            const isSelected = carConfig.colorHex.toLowerCase() === colorItem.hex.toLowerCase();

            return (
              <button
                key={colorItem.name}
                onClick={() => handleSelectColor(colorItem.hex, colorItem.finish)}
                className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg shadow-md border border-white/20 flex items-center justify-center shrink-0"
                  style={{ backgroundColor: colorItem.hex }}
                >
                  {isSelected && <Check size={14} className="text-white drop-shadow" strokeWidth={3} />}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-200 truncate">{colorItem.name}</div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">{colorItem.hex}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Color for Bus (Two-Tone Vintage Camper) */}
      {isBus && (
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-orange-500/30">
          <label className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2 block">
            🚐 Колір верхньої половини кузова (Ретро-двоколірний стиль):
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { name: 'Кремовий білий', hex: '#f8fafc' },
              { name: 'Вінтажний беж', hex: '#fef08a' },
              { name: 'Сонцезахисний сірий', hex: '#94a3b8' },
              { name: 'Сяючий хром', hex: '#e2e8f0' }
            ].map(sec => (
              <button
                key={sec.hex}
                onClick={() => handleSelectSecondaryColor(sec.hex)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  carConfig.secondaryColorHex === sec.hex
                    ? 'bg-orange-950 text-orange-200 border-orange-500'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: sec.hex }} />
                {sec.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Global Palette & Custom Hex Color Picker */}
      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 block">
          Популярні відтінки або власний колір:
        </label>
        
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {POPULAR_COLORS.map(c => {
            const isSelected = carConfig.colorHex.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.hex}
                onClick={() => handleSelectColor(c.hex)}
                title={c.name}
                className={`w-9 h-9 rounded-xl border transition-transform duration-150 flex items-center justify-center ${
                  isSelected ? 'scale-110 border-white shadow-lg ring-2 ring-cyan-400' : 'border-white/10 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && <Check size={16} className="text-white drop-shadow" strokeWidth={3} />}
              </button>
            );
          })}
        </div>

        {/* Custom Color Input */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
          <span className="text-xs text-slate-400">Власний відтінок:</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={carConfig.colorHex}
              onChange={(e) => updateCarConfig({ colorHex: e.target.value })}
              className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
              title="Оберіть довільний колір"
            />
            <input
              type="text"
              value={carConfig.colorHex}
              onChange={(e) => updateCarConfig({ colorHex: e.target.value })}
              className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white text-center focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
        <button
          onClick={onPrev}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all"
        >
          ← Назад (Тонування)
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
        >
          Далі до назви авто →
        </button>
      </div>
    </div>
  );
}
