import React from 'react';
import { DOOR_OPTIONS } from '../../types/car';
import { playClickSound, playDoorSound } from '../../utils/audioSynthesizer';
import { Square, ChevronsUp, Feather, ArrowRightLeft, Compass, CheckCircle2, KeyRound } from 'lucide-react';

const ICON_MAP = {
  Square: Square,
  ChevronsUp: ChevronsUp,
  Feather: Feather,
  ArrowRightLeft: ArrowRightLeft,
  Compass: Compass
};

export default function StepDoors({ carConfig, updateCarConfig, onNext, onPrev }) {
  const handleSelectDoor = (doorId) => {
    playClickSound();
    playDoorSound(doorId, true);
    updateCarConfig({ doorId, doorsOpen: true });
  };

  const handleToggleDoorAnimation = () => {
    const nextState = !carConfig.doorsOpen;
    updateCarConfig({ doorsOpen: nextState });
    playDoorSound(carConfig.doorId, nextState);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            Крок 2 з 6
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
            <ChevronsUp className="text-cyan-400" size={22} />
            Оберіть тип та механізм дверей
          </h2>
          <p className="text-xs text-slate-400">
            Оберіть характер відкривання авто: класика, вертикальні Lambo-ножиці, крила сокола чи практичні зсувні двері
          </p>
        </div>

        {/* Quick action button to toggle door open/close */}
        <button
          onClick={handleToggleDoorAnimation}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
            carConfig.doorsOpen
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <KeyRound size={14} />
          {carConfig.doorsOpen ? 'Двері відчинено (Клацніть щоб зачинити)' : 'Клацніть щоб відчинити двері'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {DOOR_OPTIONS.map((door) => {
          const isSelected = carConfig.doorId === door.id;
          const IconComponent = ICON_MAP[door.icon] || Square;

          return (
            <div
              key={door.id}
              onClick={() => handleSelectDoor(door.id)}
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
                      <CheckCircle2 size={14} /> Обрано
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mt-3 group-hover:text-cyan-300 transition-colors">
                  {door.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {door.description}
                </p>

                <div className="mt-3 inline-block bg-slate-950 px-2 py-0.5 rounded text-[11px] font-mono text-cyan-400 border border-slate-800">
                  {door.angleName}
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Ціна опції:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {door.price === 0 ? 'Базово (Включено)' : `+$${door.price.toLocaleString()}`}
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
          ← Назад (Стеля)
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
        >
          Далі до руля →
        </button>
      </div>
    </div>
  );
}
