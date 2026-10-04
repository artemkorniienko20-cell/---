import React from 'react';
import { CAR_MODELS, ROOF_OPTIONS, DOOR_OPTIONS, STEERING_WHEEL_OPTIONS, TINT_OPTIONS, UNDERGLOW_COLORS, BADGE_OPTIONS } from '../../types/car';
import { playClickSound, playCelebrationSound } from '../../utils/audioSynthesizer';
import { saveCarToGarage } from '../../utils/storage';
import confetti from 'canvas-confetti';
import { Tag, Sparkles, Check, BookmarkCheck, FileText, Share2 } from 'lucide-react';

export default function StepFinalize({
  carConfig,
  updateCarConfig,
  onPrev,
  onOpenGarage,
  onOpenExportCard
}) {
  const model = CAR_MODELS[carConfig.modelId] || CAR_MODELS.bmw;
  const roof = ROOF_OPTIONS.find(r => r.id === carConfig.roofId) || ROOF_OPTIONS[0];
  const door = DOOR_OPTIONS.find(d => d.id === carConfig.doorId) || DOOR_OPTIONS[0];
  const wheel = STEERING_WHEEL_OPTIONS.find(w => w.id === carConfig.wheelId) || STEERING_WHEEL_OPTIONS[0];
  const tint = TINT_OPTIONS.find(t => t.id === carConfig.tintId) || TINT_OPTIONS[0];

  // Calculate total price
  const totalPrice = model.basePrice + roof.price + door.price + wheel.price + tint.price;

  const handleSaveGarage = () => {
    playCelebrationSound();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    saveCarToGarage(carConfig);
    onOpenGarage();
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
          Фінальний крок 6
        </span>
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
          <Tag className="text-cyan-400" size={22} />
          Назва автомобіля та фінальна персоналізація
        </h2>
        <p className="text-xs text-slate-400">
          Дайте унікальне ім'я вашому авто, налаштуйте номерний знак, неонову підсвітку та збережіть авто в свій гараж
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Car Name & License Plate Inputs */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Назва або прізвисько машини:
            </label>
            <input
              type="text"
              value={carConfig.carName}
              onChange={(e) => updateCarConfig({ carName: e.target.value })}
              placeholder="Введіть назву машини..."
              maxLength={35}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Індивідуальний номерний знак:
            </label>
            <div className="flex items-center gap-2">
              {/* Ukraine flag plate mockup */}
              <div className="flex items-center bg-white border border-slate-700 rounded-lg px-2 py-1 shadow-inner">
                <div className="w-4 h-6 mr-1.5 flex flex-col rounded-sm overflow-hidden border border-black/10">
                  <div className="h-3 bg-blue-600" />
                  <div className="h-3 bg-yellow-400" />
                </div>
                <input
                  type="text"
                  value={carConfig.licensePlate}
                  onChange={(e) => updateCarConfig({ licensePlate: e.target.value.toUpperCase() })}
                  maxLength={10}
                  className="bg-transparent font-mono font-black text-slate-900 text-sm tracking-wider uppercase focus:outline-none w-28 text-center"
                />
              </div>
              <span className="text-[11px] text-slate-400">Відображається на бампері</span>
            </div>
          </div>

          {/* Badge selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Шильдик комплектації на кузові:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BADGE_OPTIONS.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    playClickSound();
                    updateCarConfig({ badge: b });
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    carConfig.badge === b
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Underglow Neon Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-400" />
              Неонова підсвітка днища (Underglow Neon):
            </label>
            <div className="flex flex-wrap gap-2">
              {UNDERGLOW_COLORS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    playClickSound();
                    updateCarConfig({ underglowId: u.id });
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                    carConfig.underglowId === u.id
                      ? 'bg-slate-800 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {u.hex !== 'transparent' ? (
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: u.hex, boxShadow: `0 0 6px ${u.hex}` }}
                    />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full border border-slate-600" />
                  )}
                  {u.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration Summary & Specs Sheet */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <span>Специфікація збірки</span>
              <span className="text-xs font-mono text-cyan-400">{model.brand}</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">1. Стеля:</span>
                <span className="font-semibold text-white">{roof.name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">2. Двері:</span>
                <span className="font-semibold text-white">{door.name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">3. Руль:</span>
                <span className="font-semibold text-white">{wheel.name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">4. Тонування:</span>
                <span className="font-semibold text-white">{tint.name}</span>
              </div>
              <div className="flex justify-between text-slate-300 items-center">
                <span className="text-slate-400">5. Колір кузова:</span>
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <span className="w-3 h-3 rounded-full border border-white/30" style={{ backgroundColor: carConfig.colorHex }} />
                  <span>{carConfig.colorHex.toUpperCase()} ({carConfig.colorFinish})</span>
                </div>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">6. Назва авто:</span>
                <span className="font-semibold text-cyan-300">"{carConfig.carName}"</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-xs text-slate-400">Загальна вартість проекту:</span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                ${totalPrice.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSaveGarage}
                className="py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                <BookmarkCheck size={16} />
                Зберегти в Гараж
              </button>

              <button
                onClick={onOpenExportCard}
                className="py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5"
              >
                <FileText size={16} />
                Паспорт авто
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
        <button
          onClick={onPrev}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all"
        >
          ← Назад (Колір)
        </button>
        <button
          onClick={handleSaveGarage}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
        >
          Завершити конфігурацію 🎉
        </button>
      </div>
    </div>
  );
}
