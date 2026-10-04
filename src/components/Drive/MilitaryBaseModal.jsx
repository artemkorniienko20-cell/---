import React from 'react';
import { playClickSound, playGunCockSound, playRadioBeepSound } from '../../utils/audioSynthesizer';

/**
 * Military Base & Armed Forces of Ukraine (ЗСУ) Modal:
 * - Enlistment into the Armed Forces (ЗСУ)
 * - Ranks & Promotion System based on intercepted Shahed UAVs
 * - Weaponry loadout (AK-74, Stinger MANPADS, FPV kamikaze drones)
 * - Exclusive clearance for ZSU Heavy Armor (T-64BV Tank & Kozak-2M AA Combat Truck)
 * - Manual Air Defense Alert combat drill trigger
 */
export function MilitaryBaseModal({
  isOpen,
  onClose,
  isArmy,
  onEnlist,
  onDischarge,
  setIsArmy,
  shahedKills = 0,
  onTriggerAlarm,
  onTriggerAirAlarm,
  isAlarmActive = false,
  onEquipMilitaryWeapons,
  onEquipArmyWeapon
}) {
  const [feedbackMsg, setFeedbackMsg] = React.useState(null);

  if (!isOpen) return null;

  const handleEnlist = () => {
    playGunCockSound();
    playRadioBeepSound();
    if (typeof onEnlist === 'function') {
      onEnlist();
    } else if (typeof setIsArmy === 'function') {
      setIsArmy(true);
    }
    setFeedbackMsg('🇺🇦 Вітаємо у лавах ЗСУ! Вам видано АК-74, ПЗРК та FPV-дрон. Техніку розблоковано!');
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleDischarge = () => {
    playClickSound();
    if (typeof onDischarge === 'function') {
      onDischarge();
    } else if (typeof setIsArmy === 'function') {
      setIsArmy(false);
    }
    setFeedbackMsg('👤 Ви звільнилися в запас.');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleAlarm = () => {
    playClickSound();
    if (typeof onTriggerAlarm === 'function') {
      onTriggerAlarm();
    } else if (typeof onTriggerAirAlarm === 'function') {
      onTriggerAirAlarm();
    }
    setFeedbackMsg('🚨 Повітряну тривогу оголошено! Захищайте місто від шахедів!');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleEquipAll = () => {
    playGunCockSound();
    if (typeof onEquipMilitaryWeapons === 'function') {
      onEquipMilitaryWeapons();
    } else if (typeof onEquipArmyWeapon === 'function') {
      onEquipArmyWeapon('ak74');
    }
    setFeedbackMsg('📦 Арсенал ЗСУ отримано: автомат АК-74 [8], ПЗРК «Stinger» [9], FPV-дрон [0]');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const getMilitaryRank = (kills) => {
    if (kills >= 30) return { title: 'Генерал ППО', color: 'text-amber-400', badge: '⭐⭐⭐' };
    if (kills >= 20) return { title: 'Полковник ЗСУ', color: 'text-amber-400', badge: '⭐⭐' };
    if (kills >= 12) return { title: 'Майор', color: 'text-yellow-400', badge: '⭐' };
    if (kills >= 7) return { title: 'Капітан', color: 'text-emerald-400', badge: '🔱🔱🔱' };
    if (kills >= 4) return { title: 'Лейтенант', color: 'text-emerald-400', badge: '🔱🔱' };
    if (kills >= 2) return { title: 'Сержант', color: 'text-sky-400', badge: '🔱' };
    return { title: 'Солдат (Стрілець ППО)', color: 'text-slate-300', badge: '🔰' };
  };

  const rank = getMilitaryRank(shahedKills);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-stone-900 via-zinc-900 to-black border-2 border-emerald-600/80 rounded-2xl shadow-2xl shadow-emerald-950/60 overflow-hidden text-white font-sans">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 px-6 py-4 border-b border-emerald-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🪖</span>
            <div>
              <h2 className="text-xl font-black tracking-wider text-emerald-400 uppercase flex items-center gap-2">
                Військова частина ЗСУ
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/50">
                  Штаб ППО
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Оперативне командування протиповітряної та наземної оборони
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-900/90 border border-emerald-400 text-yellow-200 text-xs font-bold flex items-center gap-2 shadow-lg animate-fadeIn">
            <span>🎖️</span>
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Service Status Card */}
          <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-900/50 border-2 border-emerald-500 flex items-center justify-center text-2xl shadow-inner">
                {isArmy ? '🇺🇦' : '👤'}
              </div>
              <div>
                <div className="text-xs text-stone-400 uppercase font-semibold">Статус військової служби</div>
                <div className="text-lg font-bold flex items-center gap-2">
                  {isArmy ? (
                    <>
                      <span className="text-emerald-400">Військовослужбовець ЗСУ</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        АКТИВНИЙ
                      </span>
                    </>
                  ) : (
                    <span className="text-stone-400">Цивільна особа (Військовий квиток у запасі)</span>
                  )}
                </div>
                {isArmy && (
                  <div className="text-sm mt-0.5 flex items-center gap-2 font-medium">
                    <span className="text-stone-400">Звання:</span>
                    <span className={`font-bold ${rank.color}`}>{rank.badge} {rank.title}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Enlist / Resign Buttons */}
            <div>
              {!isArmy ? (
                <button
                  onClick={handleEnlist}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 font-bold text-sm shadow-lg shadow-emerald-900/40 border border-emerald-400/40 transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>📝</span>
                  <span>Вступити до лав ЗСУ</span>
                </button>
              ) : (
                <button
                  onClick={handleDischarge}
                  className="px-4 py-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-stone-300 hover:text-white font-medium text-xs border border-stone-600 transition cursor-pointer"
                >
                  Звільнитися в запас
                </button>
              )}
            </div>
          </div>

          {/* Air Defense Score & Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-stone-800/40 border border-stone-700/60 text-center">
              <div className="text-2xl font-black text-rose-400">{shahedKills}</div>
              <div className="text-xs text-stone-400 mt-0.5 font-medium">Збито БПЛА «Шахед-136»</div>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-800/40 border border-stone-700/60 text-center">
              <div className="text-2xl font-black text-emerald-400">₴{shahedKills * 500}</div>
              <div className="text-xs text-stone-400 mt-0.5 font-medium">Бойові премії ЗСУ</div>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-800/40 border border-stone-700/60 text-center">
              <div className="text-2xl font-black text-sky-400">100%</div>
              <div className="text-xs text-stone-400 mt-0.5 font-medium">Готовність ППО міста</div>
            </div>
          </div>

          {/* Military Equipment & Arsenal */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <span>🎯</span>
              <span>Бойове озброєння та військова техніка</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* AK-74 */}
              <div className="p-3.5 rounded-xl bg-stone-800/50 border border-stone-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-stone-200 flex items-center gap-2">
                    <span>🔫</span>
                    <span>АК-74 «Калаш» 5.45мм</span>
                  </div>
                  <div className="text-xs text-stone-400 mt-1">Клавіша [8] • Стрільба чергами по дронах</div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-600/40">
                  {isArmy ? 'Видано' : 'Тільки ЗСУ'}
                </span>
              </div>

              {/* Stinger */}
              <div className="p-3.5 rounded-xl bg-stone-800/50 border border-stone-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-stone-200 flex items-center gap-2">
                    <span>🚀</span>
                    <span>ПЗРК «Stinger» / ППО</span>
                  </div>
                  <div className="text-xs text-stone-400 mt-1">Клавіша [9] • Ракета знищує шахед з 1 пострілу</div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-600/40">
                  {isArmy ? 'Видано' : 'Тільки ЗСУ'}
                </span>
              </div>

              {/* FPV Drone */}
              <div className="p-3.5 rounded-xl bg-stone-800/50 border border-stone-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-stone-200 flex items-center gap-2">
                    <span>🎮</span>
                    <span>FPV-дрон Камікадзе</span>
                  </div>
                  <div className="text-xs text-stone-400 mt-1">Клавіша [0] • Політ та таран шахеда в небі</div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-600/40">
                  {isArmy ? 'Готовий' : 'Тільки ЗСУ'}
                </span>
              </div>

              {/* Tank T-64BV */}
              <div className="p-3.5 rounded-xl bg-stone-800/50 border border-stone-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-stone-200 flex items-center gap-2">
                    <span>🛡️</span>
                    <span>Танк ЗСУ Т-64БВ (125мм)</span>
                  </div>
                  <div className="text-xs text-stone-400 mt-1">Стрільба гармати [Space]/[Q] на блокпосту</div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-amber-900/60 text-amber-300 border border-amber-600/40 font-semibold">
                  Тільки ЗСУ 🔒
                </span>
              </div>
            </div>

            {isArmy && (
              <button
                onClick={handleEquipAll}
                className="w-full py-2.5 rounded-xl bg-emerald-800/60 hover:bg-emerald-700/80 border border-emerald-500/50 text-sm font-bold text-emerald-200 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📦</span>
                <span>Отримати повний арсенал ЗСУ (АК-74, ПЗРК, FPV-дрон)</span>
              </button>
            )}
          </div>

          {/* Air Defense Combat Alert Control */}
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-rose-300 flex items-center gap-2">
                  <span>🚨</span>
                  <span>Бойове чергування та Повітряна тривога</span>
                </h4>
                <p className="text-xs text-stone-300 mt-0.5">
                  Якщо шахед не збити, він завдасть ракетно-бомбового удару по будівлі міста (супермаркет, поліція)!
                </p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                isAlarmActive
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-stone-800 text-stone-400'
              }`}>
                {isAlarmActive ? 'Тривога активна!' : 'Відбій'}
              </span>
            </div>

            <button
              onClick={handleAlarm}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-950/60 border border-rose-400/40 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🔊</span>
              <span>Оголосити Повітряну Тривогу (Атака БПЛА «Шахед-136»)</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-900 px-6 py-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>Слава Україні! Героям Слава! 🇺🇦</span>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-medium transition"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}
