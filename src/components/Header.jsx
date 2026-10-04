import React, { useState } from 'react';
import { Volume2, VolumeX, Warehouse, RotateCcw, CarFront } from 'lucide-react';
import { isSoundMuted, setSoundMuted, playClickSound } from '../utils/audioSynthesizer';

export default function Header({ onOpenGarage, onResetCar, garageCount = 0 }) {
  const [muted, setMuted] = useState(isSoundMuted());

  const handleToggleSound = () => {
    const nextState = !muted;
    setMuted(nextState);
    setSoundMuted(nextState);
    if (!nextState) {
      playClickSound();
    }
  };

  return (
    <header className="w-full py-4 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-lg sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <CarFront className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              АВТО-КОНФІГУРАТОР
              <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full">
                PRO 2026
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Створи свою унікальну Tesla, Бусик Bulli, BMW M або Спорткар
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2.5 rounded-xl border transition-all ${
              muted
                ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                : 'bg-cyan-950/60 border-cyan-800/80 text-cyan-300 shadow-sm shadow-cyan-500/10'
            }`}
            title={muted ? 'Увімкнути звук' : 'Вимкнути звук'}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Reset / New car */}
          <button
            onClick={() => {
              playClickSound();
              onResetCar();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-all"
            title="Почати спочатку"
          >
            <RotateCcw size={14} />
            <span className="hidden md:inline">Скинути</span>
          </button>

          {/* Garage Button with Counter Badge */}
          <button
            onClick={() => {
              playClickSound();
              onOpenGarage();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 border border-slate-700 text-white text-xs font-bold transition-all shadow-md"
          >
            <Warehouse size={16} className="text-cyan-400" />
            <span>Мій Гараж</span>
            {garageCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                {garageCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
