import React, { useState } from 'react';
import { X, Printer, Check, Copy, Shield, Award } from 'lucide-react';
import { CAR_MODELS, ROOF_OPTIONS, DOOR_OPTIONS, STEERING_WHEEL_OPTIONS, TINT_OPTIONS } from '../types/car';
import { playClickSound } from '../utils/audioSynthesizer';

export default function ExportCardModal({ isOpen, onClose, carConfig }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const model = CAR_MODELS[carConfig.modelId] || CAR_MODELS.bmw;
  const roof = ROOF_OPTIONS.find(r => r.id === carConfig.roofId) || ROOF_OPTIONS[0];
  const door = DOOR_OPTIONS.find(d => d.id === carConfig.doorId) || DOOR_OPTIONS[0];
  const wheel = STEERING_WHEEL_OPTIONS.find(w => w.id === carConfig.wheelId) || STEERING_WHEEL_OPTIONS[0];
  const tint = TINT_OPTIONS.find(t => t.id === carConfig.tintId) || TINT_OPTIONS[0];

  const handlePrint = () => {
    playClickSound();
    window.print();
  };

  const handleCopySpec = () => {
    playClickSound();
    const specText = `🚗 ПАСПОРТ АВТОМОБІЛЯ: ${carConfig.carName}
Бренд & Модель: ${model.brand} ${model.name}
Номерний знак: ${carConfig.licensePlate}
Шильдик: ${carConfig.badge}
1. Стеля: ${roof.name}
2. Двері: ${door.name}
3. Руль: ${wheel.name}
4. Тонування: ${tint.name}
5. Колір: ${carConfig.colorHex} (${carConfig.colorFinish})
Потужність: ${model.specs.power} | 0-100 км/г: ${model.specs.accel}
Створено в Авто-Конфігуратор PRO 2026`;

    navigator.clipboard.writeText(specText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Certificate / Spec Card Header */}
        <div className="text-center border-b border-slate-800 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono font-bold mb-2">
            <Award size={14} /> ОФІЦІЙНИЙ ПАСПОРТ СПЕЦИФІКАЦІЇ
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            {carConfig.carName || `${model.brand} ${model.name}`}
          </h2>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              {model.brand} • {model.name}
            </span>
            <span className="bg-white text-slate-950 font-black font-mono px-2 py-0.5 rounded text-xs tracking-wider border border-slate-300">
              {carConfig.licensePlate}
            </span>
          </div>
        </div>

        {/* Specs Table */}
        <div className="my-5 space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">1. Стеля (Roof):</span>
              <span className="text-white font-bold">{roof.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">2. Двері (Doors):</span>
              <span className="text-white font-bold">{door.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">3. Руль (Steering):</span>
              <span className="text-white font-bold">{wheel.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">4. Тонування (Tint):</span>
              <span className="text-white font-bold">{tint.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">5. Колір кузова:</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-3.5 h-3.5 rounded-full border border-white/40" style={{ backgroundColor: carConfig.colorHex }} />
                <span className="text-white font-bold uppercase">{carConfig.colorHex} ({carConfig.colorFinish})</span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Шильдик & Комплектація:</span>
              <span className="text-cyan-400 font-black">{carConfig.badge}</span>
            </div>
          </div>

          {/* Performance strip */}
          <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl grid grid-cols-3 text-center">
            <div>
              <div className="text-[10px] text-cyan-400 font-bold uppercase">Потужність</div>
              <div className="text-sm font-bold text-white">{model.specs.power}</div>
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 font-bold uppercase">Розгін 0-100</div>
              <div className="text-sm font-bold text-white">{model.specs.accel}</div>
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 font-bold uppercase">Швидкість</div>
              <div className="text-sm font-bold text-white">{model.specs.topSpeed}</div>
            </div>
          </div>
        </div>

        {/* Quality Seal */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-emerald-400" />
            <span>Сертифіковано Авто-Конфігуратором 2026</span>
          </div>
          <span>ID: {Date.now().toString(36).toUpperCase()}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 mt-5">
          <button
            onClick={handleCopySpec}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? 'Скопійовано!' : 'Копіювати специфікацію'}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            <Printer size={14} />
            Друкувати паспорт
          </button>
        </div>
      </div>
    </div>
  );
}
