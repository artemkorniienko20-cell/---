import React from 'react';
import { Camera, Box, Sparkles, Volume2, KeyRound, Lightbulb } from 'lucide-react';
import { playDoorSound, playEngineRev, playHornSound, playClickSound } from '../../utils/audioSynthesizer';

export default function CarControlsOverlay({
  carConfig,
  updateCarConfig,
  isRevving,
  setIsRevving,
  showroomTheme,
  setShowroomTheme,
  onStartDrive
}) {
  const { viewMode, doorsOpen, headlightsOn, modelId, doorId } = carConfig;

  const handleToggleDoors = () => {
    const nextState = !doorsOpen;
    updateCarConfig({ doorsOpen: nextState });
    playDoorSound(doorId, nextState);
  };

  const handleToggleHeadlights = () => {
    updateCarConfig({ headlightsOn: !headlightsOn });
  };

  const handleRevEngine = () => {
    if (isRevving) return;
    setIsRevving(true);
    playEngineRev(modelId);
    setTimeout(() => {
      setIsRevving(false);
    }, 2000);
  };

  const handleHorn = () => {
    playHornSound();
  };

  const setView = (mode) => {
    playClickSound();
    updateCarConfig({ viewMode: mode });
  };

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl">
      {/* View Mode Switcher: Photorealism (Like in Real Life) vs 3D Orbit vs Interior Cockpit */}
      <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setView('photo')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'photo'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Справжня студійна комерційна фотографія 8K"
        >
          <Camera size={14} />
          <span>Як в реалі (8K)</span>
        </button>

        <button
          onClick={() => setView('3d')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            viewMode === '3d'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Вільне обертання 360 градусів у 3D"
        >
          <Box size={14} />
          <span>3D Огляд 360°</span>
        </button>

        <button
          onClick={() => setView('interior')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'interior'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Справжній салон водія з кермом"
        >
          <Sparkles size={14} />
          <span>Салон (Кокпіт)</span>
        </button>
      </div>

      {/* Interactive Car Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Rev Engine button */}
        <button
          onClick={handleRevEngine}
          disabled={isRevving}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            isRevving
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 animate-pulse'
              : 'bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border-amber-500/30 hover:border-amber-500/60 shadow-sm'
          }`}
          title="Запустити двигун"
        >
          <Volume2 size={14} className={isRevving ? 'animate-bounce' : ''} />
          {isRevving ? 'Двигун реве...' : 'Газнути!'}
        </button>

        {/* Doors toggle button */}
        <button
          onClick={handleToggleDoors}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            doorsOpen
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          <KeyRound size={14} />
          {doorsOpen ? 'Зачинити двері' : 'Відчинити двері'}
        </button>

        {/* Headlights toggle */}
        <button
          onClick={handleToggleHeadlights}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            headlightsOn
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 border-slate-700'
          }`}
        >
          <Lightbulb size={14} />
          {headlightsOn ? 'Фари ON' : 'Фари OFF'}
        </button>

        {/* Drive Mode Launcher Button */}
        <button
          onClick={onStartDrive}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
          title="Справжня поїздка на авто по 3D треку!"
        >
          <span>🏁 Поїхати!</span>
        </button>

        {/* Horn button */}
        <button
          onClick={handleHorn}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition-all"
          title="Посигналити"
        >
          📢 Гудок
        </button>
      </div>

      {/* Showroom theme toggle */}
      <div className="flex items-center gap-1 text-[11px] text-slate-400">
        <span>Студія:</span>
        <button
          onClick={() => setShowroomTheme('neon')}
          className={`px-2 py-1 rounded transition-colors ${
            showroomTheme === 'neon' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'hover:text-white'
          }`}
        >
          Кібер
        </button>
        <button
          onClick={() => setShowroomTheme('studio')}
          className={`px-2 py-1 rounded transition-colors ${
            showroomTheme === 'studio' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'hover:text-white'
          }`}
        >
          Метал
        </button>
        <button
          onClick={() => setShowroomTheme('sunset')}
          className={`px-2 py-1 rounded transition-colors ${
            showroomTheme === 'sunset' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'hover:text-white'
          }`}
        >
          Захід
        </button>
      </div>
    </div>
  );
}
