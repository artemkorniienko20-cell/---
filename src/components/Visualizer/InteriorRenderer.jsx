import React, { useState } from 'react';
import { playHornSound } from '../../utils/audioSynthesizer';
import { ROOF_OPTIONS, STEERING_WHEEL_OPTIONS, TINT_OPTIONS } from '../../types/car';

export default function InteriorRenderer({
  modelId = 'bmw',
  roofId = 'panoramic',
  wheelId = 'msport',
  tintId = 'smoke35',
  colorHex = '#047857',
  carName = 'Баварська Блискавка M4'
}) {
  const [isHornActive, setIsHornActive] = useState(false);
  const tint = TINT_OPTIONS.find(t => t.id === tintId) || TINT_OPTIONS[2];
  const wheel = STEERING_WHEEL_OPTIONS.find(w => w.id === wheelId) || STEERING_WHEEL_OPTIONS[1];

  const handleHornClick = () => {
    setIsHornActive(true);
    playHornSound();
    setTimeout(() => setIsHornActive(false), 300);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between select-none overflow-hidden bg-gradient-to-b from-[#090d16] via-[#0f172a] to-[#020617] rounded-2xl p-4">
      {/* ================= UPPER SECTION: ROOF / HEADLINER ================= */}
      <div className="w-full h-44 rounded-xl border border-slate-700/60 overflow-hidden relative shadow-inner">
        {/* Roof type badge */}
        <div className="absolute top-2 left-3 z-20 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-cyan-400 border border-cyan-500/30">
          Стеля: {ROOF_OPTIONS.find(r => r.id === roofId)?.name}
        </div>

        {roofId === 'starlight' && (
          <div className="w-full h-full bg-[#05070d] relative overflow-hidden flex items-center justify-center">
            {/* Constellation Stars Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.2px,transparent_1px)] [background-size:18px_18px] opacity-80 animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1.8px,transparent_1px)] [background-size:38px_38px] opacity-75" />
            <div className="absolute inset-0 bg-[radial-gradient(#c084fc_2.2px,transparent_1px)] [background-size:60px_60px] opacity-90" />
            
            {/* Ambient luxury glow */}
            <div className="absolute top-0 w-full h-8 bg-gradient-to-b from-purple-500/20 to-transparent" />
            <div className="z-10 text-center">
              <span className="text-xs uppercase tracking-widest text-purple-300 font-mono bg-purple-950/60 px-4 py-1.5 rounded-full border border-purple-500/40">
                ✦ 1400 Оптоволоконних Зірок ✦
              </span>
            </div>
          </div>
        )}

        {roofId === 'panoramic' && (
          <div className="w-full h-full bg-gradient-to-b from-sky-900/40 via-sky-800/20 to-slate-950 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
            {/* Panoramic glass reflection lines */}
            <div className="absolute top-4 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent transform -rotate-6" />
            <div className="z-10 text-xs text-sky-200/90 font-mono bg-sky-950/60 px-4 py-1.5 rounded-full border border-sky-500/30">
              Скляний панорамний огляд неба
            </div>
          </div>
        )}

        {roofId === 'carbon' && (
          <div className="w-full h-full bg-[#18181b] relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,#27272a_25%,transparent_25%),linear-gradient(-45deg,#27272a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#27272a_75%),linear-gradient(-45deg,transparent_75%,#27272a_75%)] bg-[size:12px_12px] opacity-60" />
            <div className="z-10 text-xs text-zinc-300 font-mono bg-zinc-900/80 px-4 py-1.5 rounded-full border border-zinc-600">
              Карбонова стеля Dry Carbon Weave
            </div>
          </div>
        )}

        {roofId === 'cabrio' && (
          <div className="w-full h-full bg-gradient-to-b from-amber-950/30 to-slate-950 relative flex items-center justify-center">
            <div className="z-10 text-xs text-amber-200/90 font-mono bg-amber-950/70 px-4 py-1.5 rounded-full border border-amber-500/30">
              Кабріолет: відкрите повітря та легкий текстиль
            </div>
          </div>
        )}

        {(roofId === 'roof_rack' || roofId === 'body_solid') && (
          <div className="w-full h-full bg-slate-900 relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:14px_14px]" />
            <div className="z-10 text-xs text-slate-300 font-mono bg-slate-950/70 px-4 py-1.5 rounded-full border border-slate-700">
              {roofId === 'roof_rack' ? 'Багажний відсік зверху' : 'Алькантара та шумоізоляція'}
            </div>
          </div>
        )}

        {/* Dome light console */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-800/90 rounded-full border border-slate-600/50 flex items-center justify-around px-3 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
          <span className="text-[10px] text-slate-400 font-mono">AIRBAG</span>
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
        </div>
      </div>

      {/* ================= MIDDLE SECTION: WINDSHIELD & DASHBOARD ================= */}
      <div className="w-full relative flex-1 flex flex-col items-center justify-center mt-2">
        {/* Windshield view of the road/horizon */}
        <div
          className="w-11/12 h-36 rounded-2xl relative overflow-hidden border-2 border-slate-800 flex items-end justify-center"
          style={{
            background: 'linear-gradient(to bottom, #090d16 0%, #1e1b4b 60%, #312e81 100%)'
          }}
        >
          {/* Window tint overlay */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-300"
            style={{
              backgroundColor: tint.tintColor,
              opacity: tint.opacity
            }}
          />

          {/* Road / Horizon perspective */}
          <div className="absolute bottom-0 w-full h-12 bg-slate-900/90 [clip-path:polygon(35%_0%,65%_0%,100%_100%,0%_100%)] flex justify-center">
            <div className="w-1 h-full bg-amber-400/80 [stroke-dasharray:10_5]" />
          </div>

          {/* Car Hood View */}
          <div
            className="w-3/4 h-8 rounded-t-3xl relative shadow-2xl transition-colors duration-300"
            style={{
              backgroundColor: colorHex,
              borderTop: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 -10px 25px rgba(0,0,0,0.8)'
            }}
          >
            {/* Hood crease line */}
            <div className="w-1/3 h-full mx-auto border-x border-white/20" />
          </div>
        </div>

        {/* Digital Instrument Cluster Display */}
        <div className="w-80 h-16 bg-slate-950/95 border-2 border-cyan-500/40 rounded-xl -mt-4 z-10 p-2 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center justify-between text-cyan-400 font-mono">
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-slate-400">READY</span>
            <span className="text-xl font-bold font-mono tracking-tight text-white">0 <span className="text-xs text-cyan-400">км/г</span></span>
          </div>

          <div className="text-center">
            <div className="text-[11px] font-bold tracking-widest text-cyan-300 uppercase truncate max-w-[130px]">
              {carName}
            </div>
            <div className="text-[9px] text-emerald-400 font-bold">● SPORT ACTIVE</div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400">BATTERY / FUEL</span>
            <span className="text-sm font-bold text-emerald-400">98% ⚡</span>
          </div>
        </div>
      </div>

      {/* ================= LOWER SECTION: STEERING WHEEL ================= */}
      <div className="relative w-full flex flex-col items-center justify-center -mt-6 z-20">
        <div
          onClick={handleHornClick}
          className={`cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 ${
            isHornActive ? 'scale-95 animate-bounce' : ''
          }`}
          title="Натисніть на кермо для клаксону!"
        >
          {renderSteeringWheelSvg(wheelId, modelId)}
        </div>

        {/* Sub-label & horn hint */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs font-semibold text-slate-300">
            {wheel.name}
          </span>
          <span className="text-[11px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800 animate-pulse">
            🔊 Натисніть на сигнал
          </span>
        </div>
      </div>
    </div>
  );
}

// Detailed SVG Steering Wheels Generator
function renderSteeringWheelSvg(wheelId, modelId) {
  switch (wheelId) {
    case 'yoke':
      return (
        <svg width="280" height="150" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cyber Yoke Open-top Wings */}
          <path
            d="M30 40 C30 110 60 135 140 135 C220 135 250 110 250 40 C250 25 235 25 220 45 C210 95 190 115 140 115 C90 115 70 95 60 45 C45 25 30 25 30 40 Z"
            fill="#18181b"
            stroke="#3f3f46"
            strokeWidth="3"
          />
          {/* Grips Texture */}
          <rect x="32" y="45" width="22" height="60" rx="10" fill="#27272a" />
          <rect x="226" y="45" width="22" height="60" rx="10" fill="#27272a" />

          {/* Central Yoke Core */}
          <rect x="95" y="55" width="90" height="60" rx="14" fill="#090d16" stroke="#52525b" strokeWidth="2" />
          
          {/* Tesla / Cyber Logo */}
          <path d="M120 75 Q140 70 160 75 L140 95 Z" fill="#e2e8f0" />
          <circle cx="140" cy="85" r="2" fill="#38bdf8" />

          {/* Left/Right Thumb Scroll Wheels */}
          <circle cx="115" cy="85" r="7" fill="#27272a" stroke="#71717a" strokeWidth="2" />
          <circle cx="165" cy="85" r="7" fill="#27272a" stroke="#71717a" strokeWidth="2" />
        </svg>
      );

    case 'msport':
      return (
        <svg width="220" height="200" viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Sport Wheel Rim */}
          <circle cx="110" cy="100" r="88" stroke="#18181b" strokeWidth="24" />
          <circle cx="110" cy="100" r="88" stroke="#27272a" strokeWidth="18" />

          {/* Red 12 O'Clock Racing Center Mark */}
          <rect x="106" y="2" width="8" height="18" rx="2" fill="#ef4444" />

          {/* Alcantara Side Grips */}
          <path d="M26 70 Q16 100 26 130" stroke="#3f3f46" strokeWidth="18" strokeLinecap="round" />
          <path d="M194 70 Q204 100 194 130" stroke="#3f3f46" strokeWidth="18" strokeLinecap="round" />

          {/* M Sport Spokes (Left, Right, Bottom) */}
          <line x1="30" y1="100" x2="85" y2="105" stroke="#334155" strokeWidth="16" />
          <line x1="190" y1="100" x2="135" y2="105" stroke="#334155" strokeWidth="16" />
          <line x1="110" y1="180" x2="110" y2="125" stroke="#334155" strokeWidth="18" />

          {/* Carbon Shift Paddles (+ and -) */}
          <path d="M35 55 L25 40 L25 80 L35 75 Z" fill="#090d16" stroke="#ef4444" strokeWidth="1.5" />
          <text x="27" y="62" fill="#ef4444" fontSize="12" fontWeight="bold">-</text>

          <path d="M185 55 L195 40 L195 80 L185 75 Z" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="187" y="62" fill="#38bdf8" fontSize="12" fontWeight="bold">+</text>

          {/* Central Airbag Hub */}
          <circle cx="110" cy="105" r="32" fill="#0f172a" stroke="#475569" strokeWidth="3" />
          
          {/* BMW M Tri-color Stripe on Hub */}
          <g transform="translate(100, 122)">
            <rect x="0" y="0" width="6" height="4" fill="#38bdf8" />
            <rect x="7" y="0" width="6" height="4" fill="#1e3a8a" />
            <rect x="14" y="0" width="6" height="4" fill="#ef4444" />
          </g>

          {/* BMW Center Roundel */}
          <circle cx="110" cy="100" r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
          <path d="M110 86 A 14 14 0 0 1 124 100 L 110 100 Z" fill="#ffffff" />
          <path d="M110 114 A 14 14 0 0 1 96 100 L 110 100 Z" fill="#ffffff" />
        </svg>
      );

    case 'classic_wood':
      return (
        <svg width="220" height="200" viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Polished Walnut Wooden Rim */}
          <circle cx="110" cy="100" r="88" stroke="#78350f" strokeWidth="16" />
          <circle cx="110" cy="100" r="88" stroke="#92400e" strokeWidth="12" />
          <circle cx="110" cy="100" r="86" stroke="#b45309" strokeWidth="4" strokeDasharray="14 4" />

          {/* 3 Polished Chrome Slotted Spokes */}
          <line x1="28" y1="100" x2="85" y2="100" stroke="#e2e8f0" strokeWidth="14" />
          <circle cx="45" cy="100" r="3" fill="#0f172a" />
          <circle cx="65" cy="100" r="3" fill="#0f172a" />

          <line x1="192" y1="100" x2="135" y2="100" stroke="#e2e8f0" strokeWidth="14" />
          <circle cx="175" cy="100" r="3" fill="#0f172a" />
          <circle cx="155" cy="100" r="3" fill="#0f172a" />

          <line x1="110" y1="185" x2="110" y2="125" stroke="#e2e8f0" strokeWidth="14" />
          <circle cx="110" cy="165" r="3" fill="#0f172a" />
          <circle cx="110" cy="145" r="3" fill="#0f172a" />

          {/* Central Chrome Horn Cap */}
          <circle cx="110" cy="100" r="26" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="4" />
          <circle cx="110" cy="100" r="14" fill="#0f172a" />
          <text x="105" y="104" fill="#eab308" fontSize="12" fontWeight="bold">♛</text>
        </svg>
      );

    case 'retro_bus':
      return (
        <svg width="220" height="200" viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Classic Vintage Off-white Thin Rim */}
          <circle cx="110" cy="100" r="90" stroke="#f1f5f9" strokeWidth="10" />
          <circle cx="110" cy="100" r="90" stroke="#cbd5e1" strokeWidth="4" />

          {/* Horizontal Vintage Twin Spokes */}
          <line x1="22" y1="105" x2="88" y2="105" stroke="#f8fafc" strokeWidth="12" strokeLinecap="round" />
          <line x1="198" y1="105" x2="132" y2="105" stroke="#f8fafc" strokeWidth="12" strokeLinecap="round" />

          {/* Retro Horn Ring */}
          <circle cx="110" cy="105" r="50" stroke="#e2e8f0" strokeWidth="3" fill="none" />

          {/* Center Wolfsburg / Bulli Crest Button */}
          <circle cx="110" cy="105" r="28" fill="#0284c7" stroke="#ffffff" strokeWidth="3" />
          <circle cx="110" cy="105" r="18" fill="#f8fafc" />
          <text x="103" y="110" fill="#0369a1" fontSize="14" fontWeight="bold">W</text>
        </svg>
      );

    case 'f1_carbon':
    default:
      return (
        <svg width="260" height="160" viewBox="0 0 260 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Carbon Fiber F1 Chassis */}
          <rect x="40" y="30" width="180" height="100" rx="20" fill="#18181b" stroke="#3f3f46" strokeWidth="3" />
          
          {/* Ergonomic Molded Grips */}
          <rect x="25" y="35" width="25" height="90" rx="10" fill="#090d16" stroke="#52525b" strokeWidth="2" />
          <rect x="210" y="35" width="25" height="90" rx="10" fill="#090d16" stroke="#52525b" strokeWidth="2" />

          {/* Top Shift LED Lights */}
          <g transform="translate(60, 42)">
            <circle cx="10" cy="0" r="4" fill="#22c55e" />
            <circle cx="25" cy="0" r="4" fill="#22c55e" />
            <circle cx="45" cy="0" r="4" fill="#eab308" />
            <circle cx="60" cy="0" r="4" fill="#eab308" />
            <circle cx="80" cy="0" r="4" fill="#ef4444" />
            <circle cx="95" cy="0" r="4" fill="#ef4444" />
            <circle cx="115" cy="0" r="4" fill="#3b82f6" />
            <circle cx="130" cy="0" r="4" fill="#3b82f6" />
          </g>

          {/* Central Telemetry OLED Screen */}
          <rect x="75" y="55" width="110" height="40" rx="4" fill="#020617" stroke="#06b6d4" strokeWidth="1.5" />
          <text x="85" y="72" fill="#06b6d4" fontSize="10" fontFamily="monospace">GEAR 4 | ERS 85%</text>
          <text x="85" y="87" fill="#22c55e" fontSize="12" fontWeight="bold" fontFamily="monospace">318 KM/H</text>

          {/* Racing Push Buttons */}
          <circle cx="58" cy="80" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
          <circle cx="58" cy="105" r="7" fill="#eab308" stroke="#ffffff" strokeWidth="1" />
          <circle cx="202" cy="80" r="7" fill="#22c55e" stroke="#ffffff" strokeWidth="1" />
          <circle cx="202" cy="105" r="7" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
        </svg>
      );
  }
}
