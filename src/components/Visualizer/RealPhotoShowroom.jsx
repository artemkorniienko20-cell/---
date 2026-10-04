import React, { useState, useRef } from 'react';
import { CAR_MODELS, TINT_OPTIONS, UNDERGLOW_COLORS } from '../../types/car';
import { playHornSound, playClickSound } from '../../utils/audioSynthesizer';
import { Sparkles, ZoomIn, Rotate3d, Play, Volume2 } from 'lucide-react';

export default function RealPhotoShowroom({
  carConfig,
  onStartDrive,
  onSwitchTo3D
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isHornPressed, setIsHornPressed] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0); // 0 to 360 deg
  const isDragging = useRef(false);
  const startX = useRef(0);

  const model = CAR_MODELS[carConfig.modelId] || CAR_MODELS.bmw;
  const underglow = UNDERGLOW_COLORS.find(u => u.id === carConfig.underglowId) || UNDERGLOW_COLORS[0];
  const tint = TINT_OPTIONS.find(t => t.id === carConfig.tintId) || TINT_OPTIONS[0];

  const getCarImagePath = () => {
    switch (carConfig.modelId) {
      case 'gwagon':
        return '/cars/gwagon_studio.jpg';
      case 'audi_rs6':
        return '/cars/audi_rs6_studio.jpg';
      case 'porsche':
        return '/cars/porsche_studio.jpg';
      case 'lambo':
        return '/cars/lambo_studio.jpg';
      case 'ferrari':
        return '/cars/ferrari_studio.jpg';
      case 'gtr':
        return '/cars/gtr_studio.jpg';
      case 'mustang':
        return '/cars/mustang_studio.jpg';
      case 'bugatti':
        return '/cars/bugatti_studio.jpg';
      case 'zeekr':
        return '/cars/zeekr_studio.jpg';
      case 'cybertruck':
        return '/cars/cybertruck_studio.jpg';
      case 'tesla':
        return '/cars/tesla_studio.jpg';
      case 'bus':
        return '/cars/bus_studio.jpg';
      case 'supercar':
        return '/cars/supercar_studio.jpg';
      case 'zaporozhets':
        return '/cars/zaporozhets_studio.jpg';
      case 'bmw':
      default:
        return '/cars/bmw_studio.jpg';
    }
  };

  const getInteriorImagePath = () => {
    if (carConfig.roofId === 'starlight' || carConfig.wheelId === 'classic_wood') {
      return '/cars/starlight_interior.jpg';
    }
    if (carConfig.modelId === 'gwagon') {
      return '/cars/gwagon_interior.jpg';
    }
    if (carConfig.modelId === 'lambo') {
      return '/cars/lambo_interior.jpg';
    }
    if (carConfig.modelId === 'tesla' || carConfig.modelId === 'cybertruck' || carConfig.wheelId === 'yoke') {
      return '/cars/tesla_interior.jpg';
    }
    return '/cars/bmw_interior.jpg';
  };

  const handleHorn = () => {
    setIsHornPressed(true);
    playHornSound();
    setTimeout(() => setIsHornPressed(false), 300);
  };

  // Horizontal drag to rotate 360 degrees
  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const delta = e.clientX - startX.current;
    startX.current = e.clientX;
    setRotationAngle((prev) => (prev + delta * 0.8 + 360) % 360);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const isInterior = carConfig.viewMode === 'interior';

  // Calculate perspective 3D tilt transformation based on rotationAngle
  const getTransform = () => {
    const rad = (rotationAngle * Math.PI) / 180;
    const rotateY = Math.sin(rad) * 18;
    const scale = 1 + Math.cos(rad) * 0.04;
    return `perspective(1000px) rotateY(${rotateY}deg) scale(${isZoomed ? 1.25 : scale})`;
  };

  return (
    <div
      className="relative w-full h-[540px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-[#020408] select-none flex items-center justify-center group"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* ================= PHOTOREALISTIC EXTERIOR STUDIO ================= */}
      {!isInterior ? (
        <div
          className="relative w-full h-full flex items-center justify-center overflow-hidden transition-transform duration-150 cursor-grab active:cursor-grabbing"
          style={{ transform: getTransform() }}
        >
          {/* Real Commercial Photography Base Layer */}
          <img
            src={getCarImagePath()}
            alt={model.name}
            className="w-full h-full object-cover object-center pointer-events-none transition-all duration-700"
          />

          {/* Dynamic Real-Life Metallic Paint Synthesis Layer */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-500"
            style={{
              backgroundColor: carConfig.colorHex,
              mixBlendMode: carConfig.colorFinish === 'matte' ? 'color' : 'soft-light',
              opacity: carConfig.colorFinish === 'metallic' ? 0.65 : carConfig.colorFinish === 'matte' ? 0.75 : 0.5
            }}
          />

          {/* Secondary Color Multiply for Deep Metallic Luster */}
          {carConfig.colorFinish === 'metallic' && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundColor: carConfig.colorHex,
                mixBlendMode: 'multiply',
                opacity: 0.25
              }}
            />
          )}

          {/* Chameleon Dynamic Shimmer Overlay */}
          {carConfig.colorFinish === 'chameleon' && (
            <div
              className="absolute inset-0 pointer-events-none opacity-60"
              style={{
                background: `linear-gradient(135deg, ${carConfig.colorHex} 0%, #8b5cf6 50%, #06b6d4 100%)`,
                mixBlendMode: 'color-dodge'
              }}
            />
          )}

          {/* Dynamic Window Tinting Layer */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-300"
            style={{
              backgroundColor: tint.tintColor,
              opacity: tint.opacity * 0.45,
              mixBlendMode: 'multiply'
            }}
          />

          {/* Dynamic Underglow Neon Floor Reflection */}
          {underglow.hex !== 'transparent' && (
            <div
              className="absolute bottom-6 w-3/5 h-20 rounded-full pointer-events-none transition-all duration-500 animate-pulse-glow"
              style={{
                backgroundColor: underglow.hex,
                boxShadow: `0 0 90px 40px ${underglow.hex}`,
                opacity: 0.85
              }}
            />
          )}

          {/* Headlight beam illumination on showroom floor */}
          {carConfig.headlightsOn && (
            <div
              className="absolute right-0 bottom-10 w-2/5 h-44 pointer-events-none opacity-60 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(to right, rgba(147, 197, 253, 0.7), rgba(147, 197, 253, 0))',
                clipPath: 'polygon(0% 45%, 100% 0%, 100% 100%, 0% 70%)',
                filter: 'blur(16px)'
              }}
            />
          )}

          {/* Door Open Mechanism Visual Badge / Indicator */}
          {carConfig.doorsOpen && (
            <div className="absolute top-16 left-6 z-20 bg-cyan-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-500/50 shadow-xl flex items-center gap-2 text-cyan-300 text-xs font-mono font-bold animate-pulse">
              <span>● Двері відчинено ({carConfig.doorId.toUpperCase()})</span>
            </div>
          )}

          {/* Roof Style Badge Overlay */}
          <div className="absolute top-16 right-6 z-20 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-slate-300 text-xs font-mono">
            Стеля: {carConfig.roofId}
          </div>
        </div>
      ) : (
        /* ================= PHOTOREALISTIC COCKPIT INTERIOR ================= */
        <div
          className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={handleHorn}
          title="Натисніть на кермо для сигналу!"
        >
          <img
            src={getInteriorImagePath()}
            alt="Салон авто"
            className={`w-full h-full object-cover object-center transition-transform duration-200 ${
              isHornPressed ? 'scale-[1.01]' : 'scale-100'
            }`}
          />

          <div
            className="absolute inset-0 pointer-events-none transition-all duration-300"
            style={{
              backgroundColor: tint.tintColor,
              opacity: tint.opacity * 0.35,
              mixBlendMode: 'multiply'
            }}
          />

          {carConfig.roofId === 'starlight' && (
            <div className="absolute top-0 w-full h-1/2 pointer-events-none bg-[radial-gradient(#ffffff_1.2px,transparent_1px)] [background-size:24px_24px] opacity-70 animate-pulse" />
          )}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-full border border-cyan-500/60 shadow-2xl text-xs font-bold text-cyan-300 animate-bounce">
            <span>📢 Натисніть у будь-яке місце салону для сигналу (Клаксон)</span>
          </div>
        </div>
      )}

      {/* ================= SHOWROOM HUD OVERLAYS ================= */}
      {/* Top Left: 8K Realism Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-500/60 shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-black text-emerald-300 tracking-wider">
            8K РЕАЛІЗМ (ЯК В РЕАЛІ)
          </span>
        </div>
      </div>

      {/* Top Center: BIG DRIVE BUTTON */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={onStartDrive}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-slate-950 font-black text-xs tracking-wider shadow-[0_0_25px_rgba(249,115,22,0.8)] border-2 border-white hover:scale-105 active:scale-95 transition-all"
        >
          <Play size={16} fill="currentColor" />
          <span>🏁 СІСТИ ЗА КЕРМО ТА ПОЇХАТИ!</span>
        </button>
      </div>

      {/* Top Right: Model Badge & 3D Switcher */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={onSwitchTo3D}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded-full text-xs font-bold transition-all shadow-lg"
          title="Повний 3D режим для вільного обертання під будь-яким кутом"
        >
          <Rotate3d size={14} />
          <span>3D 360° Тур</span>
        </button>
        <span className="bg-white text-slate-950 font-black font-mono px-2.5 py-1 rounded-md text-xs shadow-md border border-slate-300">
          {carConfig.licensePlate}
        </span>
      </div>

      {/* Bottom Center: 360 Degree Rotation Slider Bar */}
      {!isInterior && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 shadow-2xl">
          <Rotate3d size={16} className="text-cyan-400" />
          <span className="text-xs font-mono text-slate-400 font-bold whitespace-nowrap">
            Обертання 360°:
          </span>
          <input
            type="range"
            min="0"
            max="360"
            value={Math.round(rotationAngle)}
            onChange={(e) => setRotationAngle(Number(e.target.value))}
            className="w-36 sm:w-48 accent-cyan-400 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-white w-10 text-right">
            {Math.round(rotationAngle)}°
          </span>
        </div>
      )}

      {/* Bottom Left: Drag Hint */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg pointer-events-none">
        <span>🔄 Затисніть та тягніть мишку для обертання 360°</span>
      </div>
    </div>
  );
}
