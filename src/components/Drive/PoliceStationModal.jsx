import React, { useState } from 'react';
import {
  Shield,
  Zap,
  Target,
  Lock,
  Car,
  AlertTriangle,
  Award,
  CheckCircle2,
  X,
  UserCheck,
  UserX,
  DollarSign
} from 'lucide-react';
import {
  playClickSound,
  playPoliceRadioSound,
  playCashSound
} from '../../utils/audioSynthesizer';

export default function PoliceStationModal({
  isPolice,
  setIsPolice,
  arrestsCount = 0,
  playerMoney = 0,
  onClose
}) {
  const [feedback, setFeedback] = useState(null);

  const getRankTitle = (count) => {
    if (count >= 10) return 'Капітан поліції 🌟🌟🌟';
    if (count >= 6) return 'Старший лейтенант поліції ⭐⭐';
    if (count >= 3) return 'Лейтенант поліції ⭐';
    if (count >= 1) return 'Капрал поліції 🔰';
    return 'Рядовий поліції 🔹';
  };

  const handleJoinPolice = () => {
    playPoliceRadioSound();
    setIsPolice(true);
    setFeedback({
      type: 'success',
      text: '🎉 ВІТАЄМО НА СЛУЖБІ! Ви прийняли присягу поліцейського України. Отримано форму, табельний тайзер, пістолет, наручники та доступ до патрульних авто!'
    });
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleLeavePolice = () => {
    playClickSound();
    setIsPolice(false);
    setFeedback({
      type: 'info',
      text: 'Звільнено зі служби. Ви повернулися до цивільного статусу.'
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-xl bg-slate-950 border-2 border-blue-500/80 rounded-3xl shadow-[0_0_60px_rgba(59,130,246,0.4)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-5 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-blue-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-slate-950 shadow-lg shadow-blue-500/30">
              <Shield size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-cyan-400/40">
                  🇺🇦 Національна Поліція 102
                </span>
                {isPolice ? (
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                    <CheckCircle2 size={11} /> ДІЮЧИЙ ОФІЦЕР
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    ЦИВІЛЬНИЙ СТАТУС
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-white tracking-wide mt-1">
                Головне Управління Національної Поліції
              </h2>
              <p className="text-xs font-mono text-blue-300/80">
                Служити та захищати • Патрульна служба правопорядку
              </p>
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
          <div className={`mx-5 mt-4 p-3 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
              : 'bg-blue-950/90 text-blue-300 border border-blue-500/50'
          }`}>
            <Award size={18} className="text-yellow-400 shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 flex flex-col gap-4 max-h-[460px] overflow-y-auto">
          {/* Officer Status Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Ваш поточний ранг</span>
                <span className="text-sm font-black text-cyan-300">
                  {isPolice ? getRankTitle(arrestsCount) : 'Цивільний громадянин'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Затримано правопорушників</span>
                <span className="text-sm font-mono font-bold text-amber-400 flex items-center gap-1 justify-end">
                  <Lock size={13} /> {arrestsCount} осіб
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <DollarSign size={14} className="text-emerald-400" />
                <span>Баланс: <strong className="text-emerald-400">₴{playerMoney.toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Car size={14} className="text-blue-400" />
                <span>Патрульні авто: <strong className={isPolice ? 'text-emerald-400' : 'text-rose-400'}>{isPolice ? 'ДОЗВОЛЕНО' : 'ЗАБЛОКОВАНО'}</strong></span>
              </div>
            </div>
          </div>

          {/* Service Gear Showcase */}
          <div>
            <span className="text-[11px] font-mono font-bold uppercase text-blue-400 tracking-wider block mb-2">
              🛡️ Спецзасоби та озброєння поліцейського:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Taser */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <Zap size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">⚡ Тайзер Taser X26P [Клавіша 2]</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Стріляє електричним розрядом, паралізує порушника на 4 сек (повний стан).
                  </span>
                </div>
              </div>

              {/* Pistol */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-rose-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
                  <Target size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">🔫 Пістолет Форт-14ТП [Клавіша 3]</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Табельний 9мм пістолет для ліквідації небезпечних озброєних нападників.
                  </span>
                </div>
              </div>

              {/* Handcuffs */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-blue-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                  <Lock size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">🔗 Наручники БР-С [Клавіша 4]</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Арештовують знерухомленого нападника. <strong>Премія ₴300–₴500 за арешт!</strong>
                  </span>
                </div>
              </div>

              {/* Police Patrol Car */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                  <Car size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">🚓 Патрульне авто 102 [Клавіша E]</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Спецтранспорт біля відділку з синьо-червоними мигалками та сиреною [G].
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button: Enlist or Resign */}
          <div className="pt-2 border-t border-slate-800">
            {!isPolice ? (
              <button
                onClick={handleJoinPolice}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
              >
                <UserCheck size={18} />
                <span>👮‍♂️ ВСТУПИТИ НА СЛУЖБУ В НАЦІОНАЛЬНУ ПОЛІЦІЮ</span>
              </button>
            ) : (
              <button
                onClick={handleLeavePolice}
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-rose-950/70 border border-slate-700 hover:border-rose-600 text-slate-300 hover:text-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <UserX size={16} />
                <span>ЗВІЛЬНИТИСЯ ЗІ СЛУЖБИ (ПОВЕРНУТИСЯ ДО ЦИВІЛЬНОГО СТАТУСУ)</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Натисніть [ESC] або кнопку для повернення на вулицю</span>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}
