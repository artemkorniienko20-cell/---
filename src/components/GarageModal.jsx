import React from 'react';
import { X, Trash2, ArrowUpRight, Warehouse, Car } from 'lucide-react';
import { CAR_MODELS } from '../types/car';
import { playClickSound } from '../utils/audioSynthesizer';

export default function GarageModal({
  isOpen,
  onClose,
  garageCars,
  onLoadCar,
  onDeleteCar
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090d16] border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Warehouse size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Мій Автомобільний Гараж</h2>
              <p className="text-xs text-slate-400">
                Збережено ваших унікальних конфігурацій: {garageCars.length}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cars List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {garageCars.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <Car className="text-slate-700 mb-3" size={48} />
              <h3 className="text-base font-bold text-slate-300">Ваш гараж поки що порожній</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Створіть свій перший автомобіль за допомогою кроків конфігуратора та натисніть «Зберегти в Гараж»
              </p>
            </div>
          ) : (
            garageCars.map((car) => {
              const model = CAR_MODELS[car.modelId] || CAR_MODELS.bmw;

              return (
                <div
                  key={car.id}
                  className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {/* Color Swatch Orb */}
                    <div
                      className="w-10 h-10 rounded-xl border border-white/20 shadow-md shrink-0 flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: car.colorHex }}
                    >
                      <span className="sr-only">{car.colorHex}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          {car.carName || `${model.brand} ${model.name}`}
                        </h4>
                        <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded">
                          {car.licensePlate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {model.brand} • {model.name} • Лак: {car.colorFinish}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
                    <button
                      onClick={() => {
                        playClickSound();
                        onLoadCar(car);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      <ArrowUpRight size={14} />
                      Завантажити
                    </button>

                    <button
                      onClick={() => {
                        playClickSound();
                        onDeleteCar(car.id);
                      }}
                      className="p-1.5 rounded-xl bg-slate-950 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                      title="Видалити авто"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800/80 pt-4 flex justify-end">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}
