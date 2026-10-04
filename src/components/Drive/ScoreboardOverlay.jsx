import React from 'react';
import { Users, Shield, Zap, Globe, Award, Wifi } from 'lucide-react';

export function ScoreboardOverlay({
  isOpen,
  multiplayerManager,
  selfNickname,
  selfRole,
  selfVehicle,
  selfShahedKills,
  selfMoney,
  playersList = [],
  selectedCity = 'kyiv'
}) {
  if (!isOpen) return null;

  const cityName =
    selectedCity === 'kyiv' ? 'Київ 🏛️' : selectedCity === 'zaporizhzhia' ? 'Запоріжжя ⚡' : 'Вінниця 🏙️';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in select-none pointer-events-none">
      <div className="w-full max-w-3xl bg-slate-950/95 border-2 border-cyan-500/60 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.5)] overflow-hidden flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-cyan-950/50 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base uppercase tracking-wider">
                  ТАБЛИЦЯ ГРАВЦІВ СЕРВЕРА [TAB]
                </span>
                <span className="bg-cyan-950 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/40">
                  {multiplayerManager?.roomCode ? `Кімната: «${multiplayerManager.roomCode}»` : 'Локальна сесія'}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Локація: {cityName} • Захист неба та порядок у місті</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <Wifi size={14} className="animate-pulse" />
            <span>Гравців онлайн: {playersList.length + 1}</span>
          </div>
        </div>

        {/* Players Table */}
        <div className="p-4 overflow-y-auto max-h-[420px]">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Гравець</th>
                <th className="py-2.5 px-3">Служба / Роль</th>
                <th className="py-2.5 px-3">Транспорт</th>
                <th className="py-2.5 px-3 text-center">Збито БПЛА</th>
                <th className="py-2.5 px-3 text-right">Готівка</th>
                <th className="py-2.5 px-3 text-right">Пінг</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {/* Local Player (Self) */}
              <tr className="bg-cyan-950/30 hover:bg-cyan-950/50 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-black text-white text-sm">{selfNickname}</span>
                    <span className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded text-[10px] font-bold">
                      ВИ
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selfRole === 'army'
                        ? 'bg-emerald-950 text-yellow-300 border border-yellow-500/40'
                        : selfRole === 'police'
                        ? 'bg-blue-950 text-cyan-300 border border-blue-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {selfRole === 'army' ? '🪖 ЗСУ ППО' : selfRole === 'police' ? '👮 Поліція 102' : '👤 Цивільний'}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-200 font-bold">{selfVehicle}</td>
                <td className="py-3 px-3 text-center text-amber-300 font-black">🎯 {selfShahedKills}</td>
                <td className="py-3 px-3 text-right text-emerald-400 font-bold">₴{selfMoney.toLocaleString()}</td>
                <td className="py-3 px-3 text-right text-cyan-400 font-bold">0 ms</td>
              </tr>

              {/* Connected Remote Players */}
              {playersList.map((p) => {
                const pVehicle = p.isHumanOnFoot
                  ? '🚶 Пішки'
                  : p.isDrivingTank
                  ? '🛡️ Танк Т-64БВ'
                  : p.isDrivingMilitaryCar
                  ? '🚛 Козак-2М'
                  : p.isDrivingPoliceCar
                  ? '🚓 Патруль 102'
                  : p.carConfig?.modelId
                  ? `🚗 ${p.carConfig.modelId.toUpperCase()}`
                  : '🚗 Автомобіль';

                return (
                  <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-bold text-white text-sm">{p.nickname}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.role === 'army'
                            ? 'bg-emerald-950 text-yellow-300 border border-yellow-500/40'
                            : p.role === 'police'
                            ? 'bg-blue-950 text-cyan-300 border border-blue-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {p.role === 'army' ? '🪖 ЗСУ ППО' : p.role === 'police' ? '👮 Поліція 102' : '👤 Цивільний'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{pVehicle}</td>
                    <td className="py-3 px-3 text-center text-amber-300 font-black">🎯 {p.shahedKills || 0}</td>
                    <td className="py-3 px-3 text-right text-slate-300">₴{(p.money || 1000).toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">~15 ms</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {playersList.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-xs font-mono">
              Поки що на сервері лише ви. Натисніть кнопку «МУЛЬТИПЛЕЄР» вгорі, щоб створити кімнату або скопіювати код для друга!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/80 border-t border-slate-800 text-center text-[11px] font-mono text-slate-400">
          Натисніть або відпустіть <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300 font-bold">TAB</kbd>, щоб закрити таблицю
        </div>
      </div>
    </div>
  );
}
