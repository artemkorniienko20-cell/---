import React from 'react';
import { playClickSound, playPoliceWhistleSound, playRadioBeepSound } from '../../utils/audioSynthesizer';

/**
 * DPS (Road Patrol Service / ДПС) Modal in Moscow:
 * - Влаштування на роботу в ДПС / звільнення
 * - Отримання форми, світловідбивного жилета та смугастого жезла ДПС
 * - Службовий автомобіль ДПС з сиреною та мигалками
 * - Статистика оштрафованих порушників та заробіток
 */
export function DpsModal({
  isOpen,
  onClose,
  isDps,
  onEnlistDps,
  onDischargeDps,
  dpsFinesCount = 0,
  dpsEarnings = 0,
  onEquipDpsWand
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 border-2 border-blue-500/80 rounded-2xl shadow-2xl shadow-blue-950/70 overflow-hidden text-white font-sans">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 px-6 py-4 border-b border-blue-600/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👮</span>
            <div>
              <h2 className="text-xl font-black tracking-wider text-blue-400 uppercase flex items-center gap-2">
                Відділ ДПС • Москва
                <span className="text-xs px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-400/40">
                  ГИБДД 102
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Дорожньо-патрульна служба • Контроль швидкості та безпека руху
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Service Status Card */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full bg-blue-900/50 border-2 border-blue-400 flex items-center justify-center text-2xl shadow-inner">
                {isDps ? '👮' : '👤'}
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Службовий статус</div>
                <div className="text-base font-bold flex items-center gap-2">
                  {isDps ? (
                    <>
                      <span className="text-blue-300">Інспектор ДПС на чергуванні</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 font-bold">
                        АКТИВНИЙ
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400">Цивільний водій / Пішохід</span>
                  )}
                </div>
                {isDps && (
                  <div className="text-xs text-lime-400 font-mono mt-0.5">
                    🦺 Світловідбивний жилет та жезл видано
                  </div>
                )}
              </div>
            </div>

            {/* Enlist / Resign Buttons */}
            <div>
              {!isDps ? (
                <button
                  onClick={() => {
                    playPoliceWhistleSound();
                    playRadioBeepSound();
                    if (onEnlistDps) onEnlistDps();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-xs shadow-lg shadow-blue-900/40 border border-blue-400/40 transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>📝</span>
                  <span>Влаштуватися в ДПС</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    playClickSound();
                    if (onDischargeDps) onDischargeDps();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white font-medium text-xs border border-slate-600 transition cursor-pointer"
                >
                  Здати зміну
                </button>
              )}
            </div>
          </div>

          {/* Job Stats & Earnings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center">
              <div className="text-2xl font-black text-amber-400">{dpsFinesCount}</div>
              <div className="text-xs text-slate-400 mt-0.5 font-medium">Оштрафовано водіїв</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center">
              <div className="text-2xl font-black text-emerald-400">₴{dpsEarnings}</div>
              <div className="text-xs text-slate-400 mt-0.5 font-medium">Зароблено премій</div>
            </div>
          </div>

          {/* Equipment & Patrol Vehicles */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <span>🚓</span>
              <span>Спецзасоби та службовий транспорт</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>🦯</span>
                    <span>Смугастий жезл ДПС</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Зупинка машин на [Q] / ЛКМ + свисток</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-500/40">
                  {isDps ? 'Видано' : 'Тільки ДПС'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>🚓</span>
                    <span>Патрульний седан ДПС</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Білий автомобіль, сирена [G], мигалки</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-500/40">
                  {isDps ? 'Доступний' : 'Тільки ДПС'}
                </span>
              </div>
            </div>

            {isDps && onEquipDpsWand && (
              <button
                onClick={() => {
                  playPoliceWhistleSound();
                  onEquipDpsWand();
                }}
                className="w-full py-2.5 rounded-xl bg-blue-800/60 hover:bg-blue-700/80 border border-blue-500/50 text-xs font-bold text-blue-200 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🦯</span>
                <span>Взяти в руки жезл регулювальника ДПС</span>
              </button>
            )}
          </div>

          {/* Job How-To Guide */}
          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-700/40 text-xs space-y-1.5 text-slate-300">
            <div className="font-bold text-blue-300 flex items-center gap-1.5">
              <span>📋</span>
              <span>Як працювати інспектором ДПС:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              1. Підійдіть до проспекту або сядьте за кермо патрульного авто ДПС.<br />
              2. При появі автомобілів трафіку змахніть жезлом на <b>[Q]</b> або кліком миші.<br />
              3. Пролунає свисток, автомобіль зупиниться, і ви оштрафуєте водія на <b>+₴1000</b>!
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-900 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Служба ДПС • Москва</span>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition cursor-pointer"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}
