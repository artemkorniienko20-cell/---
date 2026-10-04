import React, { useState } from 'react';
import { Home, Key, BedDouble, Utensils, Car, Sparkles, Check, AlertCircle, X, MapPin, DollarSign, Heart } from 'lucide-react';
import { playCashSound, playClickSound, playRepairSound, playEatingSound, playDoorSound } from '../../utils/audioSynthesizer';

export default function HousingModal({
  property,
  isOwned,
  playerMoney,
  setPlayerMoney,
  humanHealth,
  setHumanHealth,
  humanHunger,
  setHumanHunger,
  onBuyProperty,
  onBuy,
  onParkCarAtHome,
  onParkCar,
  onEnterInterior,
  onClose
}) {
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  if (!property) return null;

  const isApartment = property.type === 'apartment';
  const propertyTitle = property.title || property.name || 'Житлова Нерухомість';
  const propertyAddress = property.address || property.district || 'Центр міста';
  const propertyDesc = property.desc || property.description || 'Комфортне та сучасне житло в центрі міста.';

  const handleEnterRoom = () => {
    playDoorSound();
    if (onEnterInterior) {
      onEnterInterior(property);
    }
  };

  const handleBuy = () => {
    if (playerMoney < property.price) {
      playClickSound();
      setFeedback({
        type: 'error',
        text: `Недостатньо коштів для покупки! Потрібно ₴${property.price}, у вас є ₴${playerMoney}.`
      });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    playCashSound();
    const buyFn = onBuy || onBuyProperty;
    if (buyFn) {
      buyFn(property);
    }

    setFeedback({
      type: 'success',
      text: `🎉 Вітаємо з новосіллям! Ви успішно придбали «${propertyTitle}» за ₴${property.price}!`
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSleepRest = () => {
    playRepairSound();
    setHumanHealth(100);
    setHumanHunger(100);
    setFeedback({
      type: 'success',
      text: '😴 Ви чудово виспалися у затишному ліжку! Здоров\'я та ситість відновлено на 100%!'
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleEatHome = () => {
    playEatingSound();
    setHumanHunger(prev => Math.min(100, prev + 35));
    setHumanHealth(prev => Math.min(100, prev + 10));
    setFeedback({
      type: 'success',
      text: '🥪 Смачний домашній перекус з холодильника! +35% ситості, +10% здоров\'я.'
    });
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleParkCar = () => {
    playClickSound();
    const parkFn = onParkCar || onParkCarAtHome;
    if (parkFn) {
      parkFn(property);
    }
    setFeedback({
      type: 'success',
      text: '🚗 Ваш автомобіль доставлено та припарковано на вашому персональному паркомісці!'
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-lg bg-slate-950 border-2 border-emerald-500/70 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.35)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-5 bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isOwned ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'} shadow-lg`}>
              <Home size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30">
                  {isApartment ? '🏢 Квартира' : '🏡 Приватний Будинок'}
                </span>
                {isOwned ? (
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                    <Check size={10} /> ВАША ВЛАСНІСТЬ
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50">
                    🔥 ПРОДАЄТЬСЯ ЗА ₴100
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-white tracking-wide mt-0.5">
                {propertyTitle}
              </h2>
              <div className="flex items-center gap-1 text-slate-400 text-xs font-mono">
                <MapPin size={12} className="text-emerald-400" />
                <span>{propertyAddress}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mx-5 mt-4 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
              : 'bg-rose-950/90 text-rose-300 border border-rose-500/50'
          }`}>
            {feedback.type === 'success' ? <Sparkles size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 flex flex-col gap-4">
          {/* Property Visual Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {propertyDesc}
            </p>

            {/* Spec tags */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase">Площа</span>
                <span className="font-bold text-emerald-400">{isApartment ? '85 м²' : '160 м²'}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase">Парковка</span>
                <span className="font-bold text-cyan-400">Власне місце 🅿️</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase">Вартість</span>
                <span className="font-bold text-amber-400">₴{property.price}</span>
              </div>
            </div>
          </div>

          {/* Action section depending on ownership */}
          {!isOwned ? (
            /* ================= BUY SECTION ================= */
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-emerald-400" />
                  <span className="text-xs font-mono text-slate-300">Ваш баланс:</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">₴{playerMoney.toLocaleString()}</span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Ціна: <span className="font-bold text-amber-400">₴{property.price}</span>
                </div>
              </div>

              <button
                onClick={handleBuy}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all"
              >
                <Key size={18} />
                <span>КУПИТИ ЖИТЛО ЗА ₴{property.price}</span>
              </button>
            </div>
          ) : (
            /* ================= LIVING AT HOME SECTION ================= */
            <div className="flex flex-col gap-3 pt-1 border-t border-slate-800">
              <div className="text-xs font-mono text-emerald-400 font-bold flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>ДОМАШНІЙ ЗАТИШОК ТА ВІДПОЧИНОК:</span>
                </span>
              </div>

              {/* Enter 3D Interior Button */}
              <button
                onClick={handleEnterRoom}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all"
              >
                <Home size={18} />
                <span>🚪 УВІЙТИ ВСЕРЕДИНУ {isApartment ? 'КВАРТИРИ' : 'БУДИНКУ'} (3D КІМНАТА)</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Sleep & Full Recovery Button */}
                <button
                  onClick={handleSleepRest}
                  className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-400 text-left flex items-start gap-3 transition-all group"
                >
                  <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 group-hover:scale-110 transition-transform">
                    <BedDouble size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">Поспати та відпочити</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Відновлює 100% здоров'я ❤️ та 100% ситості 🍗</span>
                  </div>
                </button>

                {/* Eat from fridge */}
                <button
                  onClick={handleEatHome}
                  className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 text-left flex items-start gap-3 transition-all group"
                >
                  <div className="p-2 rounded-xl bg-amber-950 text-amber-400 group-hover:scale-110 transition-transform">
                    <Utensils size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">Перекусити вдома</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Безкоштовна їжа з холодильника (+35% ситості)</span>
                  </div>
                </button>
              </div>

              {/* Park Car at House */}
              <button
                onClick={handleParkCar}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-cyan-950/60 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Car size={16} />
                <span>Припаркувати моє авто на домашнє паркомісце 🅿️</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Натисніть [ESC] або кнопку для виходу на вулицю</span>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            Вийти на вулицю
          </button>
        </div>
      </div>
    </div>
  );
}
