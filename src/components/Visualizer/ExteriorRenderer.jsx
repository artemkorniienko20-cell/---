import React from 'react';
import { CAR_MODELS, ROOF_OPTIONS, TINT_OPTIONS, UNDERGLOW_COLORS } from '../../types/car';

export default function ExteriorRenderer({
  modelId = 'bmw',
  roofId = 'panoramic',
  doorId = 'standard',
  tintId = 'smoke35',
  colorHex = '#047857',
  colorFinish = 'metallic',
  secondaryColorHex = '#f8fafc',
  licensePlate = 'AA 7777 MI',
  underglowId = 'cyan',
  headlightsOn = true,
  doorsOpen = false,
  isRevving = false,
}) {
  const model = CAR_MODELS[modelId] || CAR_MODELS.bmw;
  const underglow = UNDERGLOW_COLORS.find(u => u.id === underglowId) || UNDERGLOW_COLORS[0];
  const tint = TINT_OPTIONS.find(t => t.id === tintId) || TINT_OPTIONS[2];

  // Gradients and finish styling
  const getBodyGradientId = () => `body-gradient-${modelId}`;
  const getGlassTint = () => tint.tintColor;

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden py-4">
      {/* Dynamic Underglow Neon */}
      {underglow.hex !== 'transparent' && (
        <div
          className="absolute bottom-12 w-3/4 h-16 rounded-full transition-all duration-500 animate-pulse-glow pointer-events-none"
          style={{
            backgroundColor: underglow.hex,
            boxShadow: `0 0 60px 25px ${underglow.hex}`,
            opacity: 0.85
          }}
        />
      )}

      {/* Headlight beam projection on floor */}
      {headlightsOn && (
        <div
          className="absolute right-0 bottom-12 w-1/3 h-28 pointer-events-none opacity-40 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to right, rgba(147, 197, 253, 0.6), rgba(147, 197, 253, 0))',
            clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%)',
            filter: 'blur(10px)'
          }}
        />
      )}

      {/* Exhaust flame/smoke when revving */}
      {isRevving && (
        <div className="absolute left-10 bottom-16 flex items-center gap-1 pointer-events-none z-10 animate-pulse">
          <div className="w-8 h-4 bg-orange-500 rounded-full blur-sm" />
          <div className="w-14 h-6 bg-cyan-400 rounded-full blur-md opacity-80" />
        </div>
      )}

      <svg
        viewBox="0 0 1000 480"
        className={`w-full max-h-[380px] drop-shadow-2xl transition-transform duration-300 ${
          isRevving ? 'scale-[1.01] -translate-y-1' : ''
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Body Finish Gradients */}
          <linearGradient id={getBodyGradientId()} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorFinish === 'metallic' ? '#ffffff' : colorHex} stopOpacity={colorFinish === 'metallic' ? 0.35 : 0.15} />
            <stop offset="35%" stopColor={colorHex} />
            <stop offset="70%" stopColor={colorHex} />
            <stop offset="100%" stopColor={colorFinish === 'matte' ? colorHex : '#000000'} stopOpacity={colorFinish === 'matte' ? 1 : 0.65} />
          </linearGradient>

          {/* Secondary body color gradient for bus two-tone */}
          <linearGradient id="bus-secondary-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.4} />
            <stop offset="50%" stopColor={secondaryColorHex || '#f8fafc'} />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          {/* Chameleon Finish Filter/Gradient */}
          <linearGradient id="chameleon-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colorHex} />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Carbon Fiber Pattern */}
          <pattern id="carbon-pattern" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="#18181b" />
            <rect width="3" height="3" fill="#27272a" />
            <rect x="3" y="3" width="3" height="3" fill="#27272a" />
          </pattern>

          {/* Starlight Headliner Pattern */}
          <pattern id="starlight-pattern" width="40" height="20" patternUnits="userSpaceOnUse">
            <rect width="40" height="20" fill="#090d16" />
            <circle cx="5" cy="5" r="1" fill="#ffffff" opacity="0.9" />
            <circle cx="18" cy="14" r="0.8" fill="#38bdf8" opacity="0.8" />
            <circle cx="32" cy="7" r="1.2" fill="#ffffff" opacity="0.95" />
            <circle cx="25" cy="16" r="0.7" fill="#f43f5e" opacity="0.7" />
          </pattern>

          {/* Glass Reflection Highlight */}
          <linearGradient id="glass-reflection" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
          </linearGradient>

          {/* Wheel Alloy Gradient */}
          <radialGradient id="alloy-rim" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="70%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>

          <filter id="glow-light" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shadow under car */}
        <ellipse cx="500" cy="385" rx="420" ry="24" fill="#020617" opacity="0.8" />
        <ellipse cx="500" cy="385" rx="360" ry="14" fill="#000000" opacity="0.9" />

        {/* ================= MODEL SPECIFIC BODY RENDERING ================= */}
        {modelId === 'tesla' && (
          <g id="tesla-car">
            {/* Tesla Aerodynamic Body Silhouette */}
            <path
              d="M140 330 C130 330 115 315 125 285 C145 250 200 230 290 220 C360 210 460 160 580 155 C700 150 780 200 860 250 C900 270 915 295 910 325 C905 340 890 345 870 345 L150 345 Z"
              fill={colorFinish === 'chameleon' ? 'url(#chameleon-grad)' : `url(#${getBodyGradientId()})`}
              stroke="#0f172a"
              strokeWidth="2"
            />

            {/* Aerodynamic side crease */}
            <path
              d="M170 280 Q320 270 520 275 T880 290"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeOpacity={colorFinish === 'matte' ? '0.15' : '0.4'}
              fill="none"
            />
            <path
              d="M260 315 Q520 320 780 315"
              stroke="#000000"
              strokeWidth="2"
              strokeOpacity="0.4"
              fill="none"
            />

            {/* ROOF SECTION */}
            {renderRoofElement(roofId, 380, 155, 330, 25, colorHex)}

            {/* WINDOWS & TINT */}
            <path
              d="M380 215 C440 170 500 160 590 158 C680 156 740 190 790 225 L650 225 L500 225 Z"
              fill={getGlassTint()}
            />
            <path
              d="M380 215 C440 170 500 160 590 158 C680 156 740 190 790 225 L650 225 L500 225 Z"
              fill="url(#glass-reflection)"
              stroke="#1e293b"
              strokeWidth="3"
            />
            {/* Window divider (B-Pillar) */}
            <line x1="560" y1="160" x2="555" y2="225" stroke="#090d16" strokeWidth="6" />

            {/* DOORS & OPENING MECHANISM */}
            {renderDoorsLayer(doorId, doorsOpen, 380, 160, 360, 175, colorHex, colorFinish)}

            {/* HEADLIGHTS & TAILLIGHTS */}
            {/* Front Cyber LED bar */}
            <path
              d="M875 270 Q905 282 895 295"
              stroke={headlightsOn ? '#e0f2fe' : '#94a3b8'}
              strokeWidth="4"
              strokeLinecap="round"
              filter={headlightsOn ? 'url(#glow-light)' : undefined}
            />
            {/* Rear Tail Light */}
            <path
              d="M130 285 L145 280 L140 295 Z"
              fill="#ef4444"
              filter={headlightsOn ? 'url(#glow-light)' : undefined}
            />

            {/* Flush Tesla Door Handles */}
            <rect x="470" y="245" width="22" height="4" rx="2" fill="#cbd5e1" opacity="0.8" />
            <rect x="630" y="245" width="22" height="4" rx="2" fill="#cbd5e1" opacity="0.8" />
          </g>
        )}

        {modelId === 'cybertruck' && (
          <g id="cybertruck-car">
            {/* Iconic Angular Origami Exoskeleton */}
            <polygon
              points="130,340 130,265 520,135 845,260 900,285 895,340"
              fill={colorFinish === 'chameleon' ? 'url(#chameleon-grad)' : `url(#${getBodyGradientId()})`}
              stroke="#0f172a"
              strokeWidth="2.5"
            />

            {/* Angular Wheel Wells (Cladding) */}
            <polygon points="215,340 240,295 330,295 355,340" fill="#090d16" />
            <polygon points="685,340 710,295 800,295 825,340" fill="#090d16" />

            {/* Cyber Armor Glass Windows */}
            <polygon
              points="400,240 515,148 765,240"
              fill={getGlassTint()}
            />
            <polygon
              points="400,240 515,148 765,240"
              fill="url(#glass-reflection)"
              stroke="#1e293b"
              strokeWidth="2.5"
            />
            {/* Triangular B-Pillar divider */}
            <line x1="535" y1="148" x2="550" y2="240" stroke="#090d16" strokeWidth="6" />

            {/* Tonneau Bed Vault Cover */}
            <line x1="140" y1="265" x2="390" y2="255" stroke="#18181b" strokeWidth="5" />

            {/* Front Cyber Razor LED Lightbar */}
            <line
              x1="845" y1="262" x2="898" y2="285"
              stroke={headlightsOn ? '#e0f2fe' : '#94a3b8'}
              strokeWidth="4"
              strokeLinecap="round"
              filter={headlightsOn ? 'url(#glow-light)' : undefined}
            />

            {/* Rear Red Blade Taillight Bar */}
            <line
              x1="130" y1="265" x2="135" y2="295"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
              filter={headlightsOn ? 'url(#glow-light)' : undefined}
            />

            {/* Roof Option */}
            {renderRoofElement(roofId, 450, 135, 180, 20, colorHex)}

            {/* Doors */}
            {renderDoorsLayer(doorId, doorsOpen, 390, 145, 360, 195, colorHex, colorFinish)}
          </g>
        )}

        {modelId === 'bus' && (
          <g id="bus-car">
            {/* Iconic VW Bulli / Camper Van Boxy Shape */}
            <path
              d="M150 340 L150 200 C150 170 170 150 210 145 L730 145 C780 145 840 170 860 230 L875 285 C885 315 870 340 840 340 Z"
              fill={colorFinish === 'chameleon' ? 'url(#chameleon-grad)' : `url(#${getBodyGradientId()})`}
              stroke="#0f172a"
              strokeWidth="2"
            />

            {/* Two-tone split upper body for Bus */}
            <path
              d="M150 240 L865 240 L860 230 C840 170 780 145 730 145 L210 145 C170 150 150 170 150 200 Z"
              fill="url(#bus-secondary-gradient)"
              stroke="#0f172a"
              strokeWidth="1.5"
            />

            {/* Chrome dividing beltline */}
            <line x1="150" y1="240" x2="865" y2="240" stroke="#f8fafc" strokeWidth="4" />
            <line x1="150" y1="242" x2="865" y2="242" stroke="#64748b" strokeWidth="1" />

            {/* ROOF SECTION FOR BUS */}
            {renderRoofElement(roofId, 210, 138, 550, 16, colorHex, true)}

            {/* BUS WINDOWS & TINT */}
            {/* Front windshield */}
            <path d="M725 155 L835 230 L730 230 L720 155 Z" fill={getGlassTint()} />
            <path d="M725 155 L835 230 L730 230 L720 155 Z" fill="url(#glass-reflection)" stroke="#334155" strokeWidth="2" />

            {/* Middle and rear windows */}
            <rect x="545" y="155" width="160" height="75" rx="6" fill={getGlassTint()} />
            <rect x="545" y="155" width="160" height="75" rx="6" fill="url(#glass-reflection)" stroke="#334155" strokeWidth="2" />

            <rect x="365" y="155" width="165" height="75" rx="6" fill={getGlassTint()} />
            <rect x="365" y="155" width="165" height="75" rx="6" fill="url(#glass-reflection)" stroke="#334155" strokeWidth="2" />

            <rect x="180" y="155" width="170" height="75" rx="6" fill={getGlassTint()} />
            <rect x="180" y="155" width="170" height="75" rx="6" fill="url(#glass-reflection)" stroke="#334155" strokeWidth="2" />

            {/* DOORS & SLIDING MECHANISM */}
            {renderDoorsLayer(doorId, doorsOpen, 360, 150, 360, 185, colorHex, colorFinish, true)}

            {/* Bus Round Headlight */}
            <circle cx="865" cy="275" r="14" fill={headlightsOn ? '#fef08a' : '#cbd5e1'} stroke="#475569" strokeWidth="3" filter={headlightsOn ? 'url(#glow-light)' : undefined} />
            <circle cx="865" cy="275" r="8" fill="#ffffff" opacity={headlightsOn ? 1 : 0.4} />

            {/* Classic Front Bulli Chrome Logo V */}
            <path d="M850 290 L880 290 L870 330 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="868" cy="305" r="8" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />

            {/* Rear vertical taillight */}
            <rect x="145" y="270" width="8" height="24" rx="2" fill="#ef4444" filter={headlightsOn ? 'url(#glow-light)' : undefined} />

            {/* Sliding door track line */}
            <line x1="360" y1="280" x2="720" y2="280" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" />
          </g>
        )}

        {modelId === 'bmw' && (
          <g id="bmw-car">
            {/* Aggressive BMW M4 Coupe Silhouette */}
            <path
              d="M135 325 C125 315 125 290 145 270 C165 245 220 230 310 220 C360 215 450 160 550 152 C650 148 710 175 750 215 L855 240 C895 250 915 280 910 320 C905 340 885 345 860 345 L150 345 Z"
              fill={colorFinish === 'chameleon' ? 'url(#chameleon-grad)' : `url(#${getBodyGradientId()})`}
              stroke="#0f172a"
              strokeWidth="2"
            />

            {/* M Aerodynamics & Power Dome on hood */}
            <path d="M730 215 L860 240" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.4" />
            <path d="M300 230 C450 250 650 255 870 275" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.3" />
            <path d="M260 320 L760 320" stroke="#000000" strokeWidth="3" strokeOpacity="0.5" />

            {/* M Fender Gill with badge */}
            <path d="M720 245 L735 240 L735 265 L720 268 Z" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
            <line x1="722" y1="246" x2="722" y2="267" stroke="#ef4444" strokeWidth="1.5" />

            {/* ROOF SECTION */}
            {renderRoofElement(roofId, 430, 150, 270, 22, colorHex)}

            {/* WINDOWS (Hofmeister Kink) & TINT */}
            <path
              d="M420 215 C470 165 530 155 620 154 C670 154 710 175 735 215 L600 215 Z"
              fill={getGlassTint()}
            />
            <path
              d="M420 215 C470 165 530 155 620 154 C670 154 710 175 735 215 L600 215 Z"
              fill="url(#glass-reflection)"
              stroke="#1e293b"
              strokeWidth="3.5"
            />
            {/* Hofmeister kink accent */}
            <path d="M420 215 Q435 200 450 215" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />

            {/* DOORS LAYER */}
            {renderDoorsLayer(doorId, doorsOpen, 420, 155, 300, 180, colorHex, colorFinish)}

            {/* BMW M Laser Headlight */}
            <path
              d="M860 250 L895 262 L875 272 Z"
              fill={headlightsOn ? '#38bdf8' : '#64748b'}
              filter={headlightsOn ? 'url(#glow-light)' : undefined}
            />
            <path d="M868 258 Q885 262 890 264" stroke="#ffffff" strokeWidth="2" />

            {/* L-Shaped OLED Taillight */}
            <path
              d="M140 275 Q165 278 150 290"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              filter={headlightsOn ? 'url(#glow-light)' : undefined}
            />

            {/* Quad M Exhaust Tips */}
            <rect x="125" y="332" width="14" height="6" rx="2" fill="#cbd5e1" stroke="#000" />
            <rect x="115" y="334" width="14" height="6" rx="2" fill="#cbd5e1" stroke="#000" />
          </g>
        )}

        {/* ================= MERCEDES-AMG G 63 ================= */}
        {modelId === 'gwagon' && (
          <g id="gwagon-car">
            {/* Boxy Rugged SUV Silhouette */}
            <path
              d="M130 335 L130 160 L230 155 L700 155 L780 230 L900 235 L905 335 Z"
              fill={colorFinish === 'chameleon' ? 'url(#chameleon-grad)' : `url(#${getBodyGradientId()})`}
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            {/* External Rear Spare Wheel Ring */}
            <circle cx="95" cy="245" r="48" fill="#18181b" stroke="#cbd5e1" strokeWidth="4" />
            <circle cx="95" cy="245" r="20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
            {/* Fender-top Amber Indicator */}
            <rect x="765" y="218" width="18" height="10" rx="3" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
            {/* G-Class Horizontal Black Rub-Strip */}
            <line x1="130" y1="245" x2="900" y2="245" stroke="#18181b" strokeWidth="4" />
            {/* Circular Halo Headlight */}
            <circle cx="885" cy="265" r="14" fill="#090d16" stroke={headlightsOn ? '#e0f2fe' : '#64748b'} strokeWidth="2.5" />
            <circle cx="885" cy="265" r="8" fill={headlightsOn ? '#38bdf8' : '#334155'} filter={headlightsOn ? 'url(#glow-light)' : undefined} />
            {/* WINDOWS */}
            <rect x="235" y="165" width="220" height="70" rx="4" fill={getGlassTint()} stroke="#1e293b" strokeWidth="2" />
            <polygon points="465,165 675,165 745,235 465,235" fill={getGlassTint()} stroke="#1e293b" strokeWidth="2" />
            {/* ROOF SECTION */}
            {renderRoofElement(roofId, 240, 155, 450, 15, colorHex)}
            {/* DOORS */}
            {renderDoorsLayer(doorId, doorsOpen, 235, 165, 480, 170, colorHex, colorFinish)}
            {/* Dual Side-Exit AMG Exhausts */}
            <rect x="360" y="338" width="12" height="6" rx="2" fill="#cbd5e1" stroke="#000" />
            <rect x="375" y="338" width="12" height="6" rx="2" fill="#cbd5e1" stroke="#000" />
          </g>
        )}

        {/* ================= AUDI RS6 AVANT ================= */}
        {modelId === 'audi_rs6' && (
          <g id="audi-rs6-car">
            {/* Muscular Sport Wagon / Avant Silhouette */}
            <path
              d="M110 325 C105 280 140 230 200 215 L420 205 C480 160 550 152 710 152 L770 190 L880 230 C920 245 930 275 925 325 Z"
              fill={colorFinish === 'chameleon' ? 'url(#chameleon-grad)' : `url(#${getBodyGradientId()})`}
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Roof Rails */}
            <line x1="430" y1="150" x2="680" y2="150" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            {/* Extended Rear Roof Spoiler */}
            <path d="M190 215 L230 195 L260 205 Z" fill="#0f172a" />
            {/* RS Matrix LED Headlight */}
            <polygon points="865,240 915,245 905,255 860,250" fill={headlightsOn ? '#e0f2fe' : '#64748b'} filter={headlightsOn ? 'url(#glow-light)' : undefined} />
            {/* WINDOWS */}
            <path d="M430 205 L470 160 L680 160 L730 205 Z" fill={getGlassTint()} stroke="#1e293b" strokeWidth="2" />
            {/* ROOF SECTION */}
            {renderRoofElement(roofId, 450, 152, 230, 18, colorHex)}
            {/* DOORS */}
            {renderDoorsLayer(doorId, doorsOpen, 420, 155, 310, 175, colorHex, colorFinish)}
            {/* Giant Oval RS Chrome Exhausts */}
            <ellipse cx="120" cy="336" rx="9" ry="5" fill="#cbd5e1" stroke="#000" />
          </g>
        )}

        {/* ================= PORSCHE 911 GT3 RS ================= */}
        {modelId === 'porsche' && (
          <g id="porsche-car">
            {/* Iconic 911 Teardrop Silhouette */}
            <path
              d="M120 325 C115 285 140 245 220 220 C320 210 420 195 520 148 C630 148 700 185 790 225 L880 245 C925 260 935 295 925 325 Z"
              fill={colorFinish === 'chameleon' ? 'url(#chameleon-grad)' : `url(#${getBodyGradientId()})`}
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Massive Swan-Neck GT3 RS Rear Wing */}
            <path d="M140 240 L160 170 L195 170 L180 240 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <path d="M110 170 L230 165 L225 158 L105 163 Z" fill="#18181b" stroke="#94a3b8" strokeWidth="2" />
            {/* Fender Gills / Louvers */}
            <line x1="770" y1="225" x2="800" y2="225" stroke="#090d16" strokeWidth="2" />
            <line x1="765" y1="230" x2="795" y2="230" stroke="#090d16" strokeWidth="2" />
            {/* Oval 911 Headlight with 4-point LEDs */}
            <ellipse cx="875" cy="245" rx="10" ry="14" fill="#090d16" stroke={headlightsOn ? '#e0f2fe' : '#64748b'} strokeWidth="2" />
            <circle cx="875" cy="245" r="4" fill={headlightsOn ? '#e0f2fe' : '#475569'} filter={headlightsOn ? 'url(#glow-light)' : undefined} />
            {/* Full-width continuous taillight */}
            <path d="M120 260 L180 255" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" filter={headlightsOn ? 'url(#glow-light)' : undefined} />
            {/* WINDOWS */}
            <path d="M440 205 C490 160 550 150 630 150 C680 150 720 180 750 215 L560 215 Z" fill={getGlassTint()} stroke="#1e293b" strokeWidth="2" />
            {/* ROOF SECTION */}
            {renderRoofElement(roofId, 450, 148, 220, 18, colorHex)}
            {/* DOORS */}
            {renderDoorsLayer(doorId, doorsOpen, 430, 150, 310, 175, colorHex, colorFinish)}
            {/* Central Dual Titanium Exhausts */}
            <circle cx="120" cy="336" r="4" fill="#cbd5e1" stroke="#000" />
            <circle cx="130" cy="336" r="4" fill="#cbd5e1" stroke="#000" />
          </g>
        )}

        {/* ================= LAMBORGHINI REVUELTO ================= */}
        {modelId === 'lambo' && (
          <g id="lambo-car">
            {/* Razor-Sharp Wedge Hypercar Silhouette */}
            <path
              d="M110 325 C100 290 120 250 160 235 C240 220 340 210 440 190 C530 142 640 142 740 195 L885 240 C935 255 940 290 930 325 Z"
              fill={colorFinish === 'chameleon' ? 'url(#chameleon-grad)' : `url(#${getBodyGradientId()})`}
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Front Y-Shaped LED DRL signature */}
            <path d="M880 245 L910 248 L925 240 M910 248 L925 256" stroke={headlightsOn ? '#e0f2fe' : '#64748b'} strokeWidth="3" strokeLinecap="round" filter={headlightsOn ? 'url(#glow-light)' : undefined} />
            {/* High-Mounted Dual Hexagonal Exhausts */}
            <polygon points="120,265 125,260 135,260 140,265 135,270 125,270" fill="#18181b" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Side Angular Air Duct */}
            <polygon points="350,230 410,215 390,290 340,285" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
            {/* WINDOWS */}
            <path d="M430 205 C490 155 560 144 635 144 C690 144 730 175 765 210 L580 210 Z" fill={getGlassTint()} stroke="#1e293b" strokeWidth="2" />
            {/* ROOF SECTION */}
            {renderRoofElement(roofId, 450, 142, 220, 18, colorHex)}
            {/* DOORS (Scissor door compatible) */}
            {renderDoorsLayer(doorId, doorsOpen, 420, 145, 320, 175, colorHex, colorFinish)}
          </g>
        )}

        {/* ================= FERRARI SF90 ================= */}
        {modelId === 'ferrari' && (
          <g id="ferrari-car">
            <path
              d="M115 325 C105 285 130 240 180 225 L380 205 C470 148 570 144 680 148 L760 195 L885 235 C930 250 935 285 925 325 Z"
              fill={colorFinish === 'chameleon' ? 'url(#chameleon-grad)' : `url(#${getBodyGradientId()})`}
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Mid-engine glass */}
            <path d="M220 225 L340 215 L320 250 L200 255 Z" fill="#090d16" opacity="0.8" />
            {/* Slit LED Headlight */}
            <line x1="875" y1="242" x2="920" y2="245" stroke={headlightsOn ? '#e0f2fe' : '#64748b'} strokeWidth="3" filter={headlightsOn ? 'url(#glow-light)' : undefined} />
            {/* Dual High Exhausts */}
            <circle cx="120" cy="275" r="4" fill="#cbd5e1" stroke="#000" />
            <circle cx="128" cy="275" r="4" fill="#cbd5e1" stroke="#000" />
            {/* WINDOWS */}
            <path d="M430 205 C490 155 560 148 640 148 C690 148 730 175 755 210 L570 210 Z" fill={getGlassTint()} stroke="#1e293b" strokeWidth="2" />
            {renderRoofElement(roofId, 450, 146, 220, 18, colorHex)}
            {renderDoorsLayer(doorId, doorsOpen, 420, 150, 310, 175, colorHex, colorFinish)}
          </g>
        )}

        {/* ================= NISSAN GT-R NISMO ================= */}
        {modelId === 'gtr' && (
          <g id="gtr-car">
            <path
              d="M120 325 C115 280 145 235 230 215 L430 205 C490 155 570 150 670 150 L750 190 L880 230 C925 245 930 280 925 325 Z"
              fill={colorFinish === 'chameleon' ? 'url(#chameleon-grad)' : `url(#${getBodyGradientId()})`}
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Nismo Red Bottom Stripe */}
            <path d="M120 340 L920 340" stroke="#ef4444" strokeWidth="4" />
            {/* High GT Wing */}
            <path d="M140 235 L160 170 L190 170 L175 235 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <path d="M120 170 L210 166 L205 160 L115 164 Z" fill="#18181b" stroke="#ef4444" strokeWidth="2" />
            {/* Iconic Double Round Afterburner Taillights */}
            <circle cx="125" cy="255" r="7" fill="none" stroke="#ef4444" strokeWidth="2.5" />
            <circle cx="145" cy="255" r="7" fill="none" stroke="#ef4444" strokeWidth="2.5" />
            {/* WINDOWS */}
            <path d="M430 205 C480 158 550 152 640 152 C685 152 725 178 750 210 L560 210 Z" fill={getGlassTint()} stroke="#1e293b" strokeWidth="2" />
            {renderRoofElement(roofId, 450, 150, 220, 18, colorHex)}
            {renderDoorsLayer(doorId, doorsOpen, 420, 152, 310, 175, colorHex, colorFinish)}
          </g>
        )}

        {/* ================= FORD MUSTANG SHELBY GT500 ================= */}
        {modelId === 'mustang' && (
          <g id="mustang-car">
            <path
              d="M120 325 C115 275 150 235 240 220 L440 210 C490 160 560 155 660 155 L740 195 L890 225 C930 240 935 275 925 325 Z"
              fill={colorFinish === 'chameleon' ? 'url(#chameleon-grad)' : `url(#${getBodyGradientId()})`}
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* White Le Mans Racing Stripe */}
            <path d="M440 156 L660 156 M740 196 L890 226" stroke="#f8fafc" strokeWidth="6" opacity="0.8" />
            {/* Tri-Bar Taillights */}
            <line x1="125" y1="245" x2="125" y2="265" stroke="#ef4444" strokeWidth="3" />
            <line x1="135" y1="245" x2="135" y2="265" stroke="#ef4444" strokeWidth="3" />
            <line x1="145" y1="245" x2="145" y2="265" stroke="#ef4444" strokeWidth="3" />
            {/* WINDOWS */}
            <path d="M430 208 C480 160 550 156 640 156 C685 156 720 182 745 212 L560 212 Z" fill={getGlassTint()} stroke="#1e293b" strokeWidth="2" />
            {renderRoofElement(roofId, 450, 155, 210, 18, colorHex)}
            {renderDoorsLayer(doorId, doorsOpen, 420, 156, 310, 175, colorHex, colorFinish)}
          </g>
        )}

        {/* ================= BUGATTI CHIRON ================= */}
        {modelId === 'bugatti' && (
          <g id="bugatti-car">
            <path
              d="M110 325 C100 285 130 235 190 220 L400 205 C480 148 570 145 680 145 L760 185 L890 230 C935 245 940 285 930 325 Z"
              fill={colorFinish === 'chameleon' ? 'url(#chameleon-grad)' : `url(#${getBodyGradientId()})`}
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Iconic Bugatti C-Line */}
            <path
              d="M680 160 C580 160 480 190 430 250 C390 300 440 330 520 330"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Quad Jewel Eye Headlights */}
            <rect x="875" y="240" width="8" height="5" rx="1" fill={headlightsOn ? '#e0f2fe' : '#64748b'} filter={headlightsOn ? 'url(#glow-light)' : undefined} />
            <rect x="888" y="242" width="8" height="5" rx="1" fill={headlightsOn ? '#e0f2fe' : '#64748b'} filter={headlightsOn ? 'url(#glow-light)' : undefined} />
            {/* 1.6m Continuous Taillight */}
            <path d="M115 255 L180 250" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" filter={headlightsOn ? 'url(#glow-light)' : undefined} />
            {/* WINDOWS */}
            <path d="M440 205 C490 155 560 146 640 146 C690 146 730 172 755 208 L570 208 Z" fill={getGlassTint()} stroke="#1e293b" strokeWidth="2" />
            {renderRoofElement(roofId, 450, 146, 220, 18, colorHex)}
            {renderDoorsLayer(doorId, doorsOpen, 420, 148, 310, 175, colorHex, colorFinish)}
          </g>
        )}

        {/* ================= ZEEKR 001 FR HYPER-EV ================= */}
        {modelId === 'zeekr' && (
          <g id="zeekr-car">
            {/* Aerodynamic Shooting Brake Body */}
            <path
              d="M115 325 C108 275 140 225 210 215 L430 200 C490 150 570 146 680 146 L760 190 L885 228 C930 242 935 280 925 325 Z"
              fill={colorFinish === 'chameleon' ? 'url(#chameleon-grad)' : `url(#${getBodyGradientId()})`}
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Laser Orange FR Splitter & Side Skirt Pinstripe */}
            <path d="M125 338 L920 338" stroke="#ea580c" strokeWidth="3.5" strokeLinecap="round" />
            {/* Top Claw Dual-Strip LED DRLs on front fender */}
            <line x1="860" y1="210" x2="880" y2="216" stroke={headlightsOn ? '#e0f2fe' : '#64748b'} strokeWidth="3" strokeLinecap="round" filter={headlightsOn ? 'url(#glow-light)' : undefined} />
            <line x1="864" y1="218" x2="884" y2="224" stroke={headlightsOn ? '#e0f2fe' : '#64748b'} strokeWidth="3" strokeLinecap="round" filter={headlightsOn ? 'url(#glow-light)' : undefined} />
            {/* Roof LiDAR Sensor Pod for NZP Autopilot */}
            <polygon points="695,145 725,145 720,135 700,135" fill="#090d16" stroke="#06b6d4" strokeWidth="1.5" />
            {/* Rear Roof Spoiler & Ducktail */}
            <path d="M420 146 L388 142 L392 150 L425 150 Z" fill="#090d16" />
            <path d="M210 215 L175 210 L180 218 L215 218 Z" fill="#090d16" />
            {/* Continuous Matrix LED Rear Taillight Bar */}
            <path d="M115 250 L185 245" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" filter={headlightsOn ? 'url(#glow-light)' : undefined} />
            {/* WINDOWS */}
            <path d="M425 200 C485 154 560 148 660 148 C705 148 735 174 755 206 L560 206 Z" fill={getGlassTint()} stroke="#1e293b" strokeWidth="2" />
            {renderRoofElement(roofId, 450, 148, 210, 18, colorHex)}
            {renderDoorsLayer(doorId, doorsOpen, 420, 150, 310, 175, colorHex, colorFinish)}
          </g>
        )}

        {modelId === 'zaporozhets' && (
          <g id="zaporozhets-body">
            {/* Main Rounded Retro Body Shell */}
            <path
              d="M135 325 C130 280 155 240 230 235 L430 225 C470 170 530 162 670 162 L745 220 L870 248 C915 260 920 295 905 325 Z"
              fill={colorFinish === 'chameleon' ? 'url(#chameleon-grad)' : `url(#${getBodyGradientId()})`}
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Chrome Front & Rear Bumpers */}
            <rect x="885" y="300" width="30" height="16" rx="4" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
            <rect x="110" y="300" width="30" height="16" rx="4" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
            {/* Front Bumper Fang */}
            <rect x="898" y="295" width="8" height="26" rx="2" fill="#18181b" />
            <rect x="122" y="295" width="8" height="26" rx="2" fill="#18181b" />

            {/* FAMOUS SIDE AIR INTAKE SCOOPS ("ВУХА") */}
            <g transform="translate(310, 240)">
              <rect x="0" y="0" width="45" height="32" rx="4" fill={colorHex} stroke="#0f172a" strokeWidth="2" />
              <rect x="3" y="4" width="39" height="24" rx="2" fill="#090d16" />
              <line x1="6" y1="10" x2="39" y2="10" stroke="#475569" strokeWidth="2" />
              <line x1="6" y1="16" x2="39" y2="16" stroke="#475569" strokeWidth="2" />
              <line x1="6" y1="22" x2="39" y2="22" stroke="#475569" strokeWidth="2" />
            </g>

            {/* Front Round Chrome Headlight */}
            <circle cx="890" cy="265" r="16" fill="#f8fafc" stroke="#94a3b8" strokeWidth="3" filter={headlightsOn ? 'url(#glow-light)' : undefined} />
            <circle cx="890" cy="265" r="12" fill={headlightsOn ? '#fef08a' : '#cbd5e1'} />
            {/* Amber Front Indicator Below Headlight */}
            <rect x="884" y="285" width="14" height="6" rx="2" fill="#f59e0b" />

            {/* Rear Rectangular Taillight */}
            <rect x="130" y="260" width="10" height="16" rx="2" fill="#ef4444" stroke="#94a3b8" strokeWidth="1" filter={headlightsOn ? 'url(#glow-light)' : undefined} />
            <rect x="130" y="254" width="10" height="6" rx="1" fill="#f59e0b" />

            {/* Chrome Front Bar Trim */}
            <line x1="840" y1="270" x2="880" y2="270" stroke="#f8fafc" strokeWidth="3" />
            {/* Rear Engine Louvers */}
            <line x1="220" y1="240" x2="260" y2="240" stroke="#090d16" strokeWidth="2" />
            <line x1="215" y1="246" x2="255" y2="246" stroke="#090d16" strokeWidth="2" />

            {/* Windows */}
            <path d="M435 220 C475 174 530 166 655 166 L730 220 Z" fill={getGlassTint()} stroke="#1e293b" strokeWidth="2" />
            {renderRoofElement(roofId, 455, 166, 195, 18, colorHex)}
            {renderDoorsLayer(doorId, doorsOpen, 430, 168, 290, 155, colorHex, colorFinish)}
          </g>
        )}

        {/* ================= WHEELS & TIRES ================= */}
        {/* Rear Wheel */}
        <g id="rear-wheel" transform={`translate(${modelId === 'bus' ? 260 : 230}, 340)`}>
          {renderWheel(modelId)}
        </g>

        {/* Front Wheel */}
        <g id="front-wheel" transform={`translate(${modelId === 'bus' ? 760 : 790}, 340)`}>
          {renderWheel(modelId)}
        </g>

        {/* License Plate on front bumper */}
        <g transform="translate(860, 320)">
          <rect x="0" y="0" width="46" height="15" rx="2" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
          <rect x="1" y="1" width="8" height="13" fill="#0284c7" />
          <rect x="1" y="7" width="8" height="7" fill="#eab308" />
          <text x="12" y="11" fill="#0f172a" fontSize="7.5" fontWeight="900" fontFamily="sans-serif">
            {licensePlate.substring(0, 7)}
          </text>
        </g>
      </svg>
    </div>
  );
}

// Helper to render roof accessories / styles
function renderRoofElement(roofId, x, y, width, height, colorHex, isBus = false) {
  switch (roofId) {
    case 'panoramic':
      return (
        <rect
          x={x}
          y={y - 2}
          width={width}
          height={height + 2}
          rx={isBus ? 4 : 8}
          fill="url(#glass-reflection)"
          stroke="#38bdf8"
          strokeWidth="1.5"
        />
      );
    case 'carbon':
      return (
        <rect
          x={x}
          y={y - 2}
          width={width}
          height={height + 2}
          rx={isBus ? 4 : 8}
          fill="url(#carbon-pattern)"
          stroke="#52525b"
          strokeWidth="1.5"
        />
      );
    case 'starlight':
      return (
        <rect
          x={x}
          y={y - 2}
          width={width}
          height={height + 2}
          rx={isBus ? 4 : 8}
          fill="url(#starlight-pattern)"
          stroke="#c084fc"
          strokeWidth="1.5"
        />
      );
    case 'roof_rack':
      return (
        <g id="roof-rack-accessory">
          {/* Rails */}
          <line x1={x + 10} y1={y - 8} x2={x + width - 10} y2={y - 8} stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          <line x1={x + 30} y1={y} x2={x + 30} y2={y - 8} stroke="#1e293b" strokeWidth="3" />
          <line x1={x + width - 30} y1={y} x2={x + width - 30} y2={y - 8} stroke="#1e293b" strokeWidth="3" />

          {/* Aerodynamic Overland Cargo Box */}
          <path
            d={`M${x + 35} ${y - 12} L${x + width - 40} ${y - 14} Q${x + width - 15} ${y - 22} ${x + width - 50} ${y - 26} L${x + 55} ${y - 24} Q${x + 25} ${y - 18} ${x + 35} ${y - 12} Z`}
            fill="#090d16"
            stroke="#475569"
            strokeWidth="2"
          />
          <path
            d={`M${x + 60} ${y - 20} L${x + width - 60} ${y - 20}`}
            stroke="#38bdf8"
            strokeWidth="1.5"
          />
        </g>
      );
    case 'cabrio':
      return (
        <rect
          x={x}
          y={y - 3}
          width={width}
          height={height + 3}
          rx={isBus ? 3 : 8}
          fill="#1c1917"
          stroke="#44403c"
          strokeWidth="2"
          strokeDasharray="12 4"
        />
      );
    case 'body_solid':
    default:
      return null;
  }
}

// Helper to render door opening mechanics & animations
function renderDoorsLayer(doorId, isOpen, x, y, width, height, colorHex, colorFinish, isBus = false) {
  if (!isOpen) {
    // Normal shut lines
    return (
      <g>
        <line x1={x} y1={y} x2={x + 10} y2={y + height} stroke="#0f172a" strokeWidth="2.5" />
        <line x1={x + width} y1={y + 10} x2={x + width - 15} y2={y + height} stroke="#0f172a" strokeWidth="2.5" />
      </g>
    );
  }

  // Open Doors States
  if (doorId === 'scissor') {
    // Lambo door rotated upwards 75 deg
    return (
      <g transform={`translate(${x + width * 0.7}, ${y + 20}) rotate(-65)`} className="transition-transform duration-500">
        <rect
          x="0"
          y="0"
          width={width * 0.75}
          height={height * 0.65}
          rx="12"
          fill={colorHex}
          stroke="#0f172a"
          strokeWidth="3"
          opacity="0.95"
        />
        <rect x="20" y="15" width={width * 0.4} height={height * 0.3} rx="6" fill="#38bdf8" opacity="0.3" />
        {/* Hydraulic Strut */}
        <line x1="0" y1="0" x2="-25" y2="45" stroke="#e2e8f0" strokeWidth="4" />
      </g>
    );
  }

  if (doorId === 'falcon') {
    // Falcon Wing roof + door lifted up high
    return (
      <g transform={`translate(${x + 20}, ${y - 90})`} className="transition-transform duration-500">
        <path
          d={`M0 40 Q${width * 0.4} 0 ${width * 0.8} 20 L${width * 0.75} 90 L${width * 0.1} 90 Z`}
          fill={colorHex}
          stroke="#0f172a"
          strokeWidth="3"
        />
        <line x1="10" y1="40" x2="10" y2="90" stroke="#38bdf8" strokeWidth="3" />
      </g>
    );
  }

  if (doorId === 'sliding') {
    // Sliding door moved horizontally backwards
    return (
      <g transform={`translate(${x - 70}, 0)`} className="transition-transform duration-500 opacity-95">
        <rect
          x={x}
          y={y + 10}
          width={width * 0.8}
          height={height * 0.9}
          rx="8"
          fill={colorHex}
          stroke="#0f172a"
          strokeWidth="3"
        />
        <line x1={x + 20} y1={y + 15} x2={x + width * 0.8 - 20} y2={y + 15} stroke="#38bdf8" strokeWidth="2" />
      </g>
    );
  }

  // Standard door open (perspective swing)
  return (
    <g transform={`translate(${x + 10}, 0) skewY(-8)`} className="transition-transform duration-500">
      <rect
        x="0"
        y={y + 20}
        width={width * 0.8}
        height={height * 0.8}
        rx="8"
        fill={colorHex}
        stroke="#0f172a"
        strokeWidth="3"
        opacity="0.9"
      />
      {/* Chrome interior handle & door card preview */}
      <rect x="25" y={y + 60} width="20" height="5" rx="2" fill="#e2e8f0" />
    </g>
  );
}

// Wheel renderer with rubber tire, alloy spokes, and brake caliper
function renderWheel(modelId) {
  const isBus = modelId === 'bus' || modelId === 'zaporozhets';
  const isSuper = modelId === 'supercar';

  return (
    <g>
      {/* Black Rubber Tire */}
      <circle cx="0" cy="0" r="50" fill="#0f172a" stroke="#020617" strokeWidth="3" />
      <circle cx="0" cy="0" r="42" fill="#18181b" />
      {/* Tire tread texture */}
      <circle cx="0" cy="0" r="46" stroke="#27272a" strokeWidth="2" strokeDasharray="6 3" fill="none" />

      {/* Brake Rotor & Brembo Caliper */}
      <circle cx="0" cy="0" r="28" fill="#94a3b8" opacity="0.6" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 2" />
      <path
        d="M-10 -28 A 28 28 0 0 1 18 -22 L 14 -12 A 18 18 0 0 0 -6 -18 Z"
        fill={isSuper ? '#ef4444' : isBus ? '#f97316' : '#3b82f6'}
      />

      {/* Alloy Rim */}
      <circle cx="0" cy="0" r="32" fill="url(#alloy-rim)" stroke="#64748b" strokeWidth="2" />

      {/* Rims Spokes */}
      {isBus ? (
        // Retro classic hubcap
        <g>
          <circle cx="0" cy="0" r="20" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="0" cy="0" r="10" fill="#0284c7" />
        </g>
      ) : (
        // Sport twin spokes
        <g stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round">
          <line x1="0" y1="-28" x2="0" y2="28" />
          <line x1="-24" y1="-14" x2="24" y2="14" />
          <line x1="-24" y1="14" x2="24" y2="-14" />
          <line x1="-14" y1="-24" x2="14" y2="24" />
          <line x1="-14" y1="24" x2="14" y2="-24" />
          <circle cx="0" cy="0" r="8" fill="#090d16" stroke="#94a3b8" strokeWidth="2" />
        </g>
      )}
    </g>
  );
}
