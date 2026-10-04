import React, { useState } from 'react';
import {
  Users,
  Globe,
  Plus,
  LogIn,
  LogOut,
  Copy,
  Check,
  Shield,
  Zap,
  Radio,
  Wifi,
  X,
  Server,
  Car,
  UserCheck
} from 'lucide-react';
import { playClickSound } from '../../utils/audioSynthesizer';

export function MultiplayerModal({
  isOpen,
  onClose,
  multiplayerManager,
  isPolice,
  isArmy,
  selectedCity,
  onSelectCity,
  connectedPlayersCount = 1,
  playersList = []
}) {
  if (!isOpen || !multiplayerManager) return null;

  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'host' | 'join' | 'profile'
  const [nicknameInput, setNicknameInput] = useState(multiplayerManager.nickname || '');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [hostCodeInput, setHostCodeInput] = useState(
    'UA-' + (selectedCity === 'kyiv' ? 'KYIV' : selectedCity === 'zaporizhzhia' ? 'ZP' : 'VIN') + '-' + Math.floor(100 + Math.random() * 900)
  );
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const isOnline = multiplayerManager.status === 'hosting' || multiplayerManager.status === 'connected';

  const handleSaveNickname = (e) => {
    e.preventDefault();
    if (nicknameInput.trim()) {
      playClickSound();
      multiplayerManager.setNickname(nicknameInput.trim());
    }
  };

  const handleQuickPlay = async (cityPreset = null) => {
    playClickSound();
    setIsConnecting(true);
    if (cityPreset && onSelectCity) {
      onSelectCity(cityPreset);
    }
    const defaultCode = 'UA-' + (cityPreset || selectedCity).toUpperCase() + '-1';
    await multiplayerManager.hostRoom(defaultCode, cityPreset || selectedCity);
    setIsConnecting(false);
  };

  const handleHostRoom = async () => {
    playClickSound();
    setIsConnecting(true);
    await multiplayerManager.hostRoom(hostCodeInput, selectedCity);
    setIsConnecting(false);
  };

  const handleJoinRoom = async () => {
    if (!joinCodeInput.trim()) return;
    playClickSound();
    setIsConnecting(true);
    await multiplayerManager.joinRoom(joinCodeInput.trim());
    setIsConnecting(false);
  };

  const handleDisconnect = () => {
    playClickSound();
    multiplayerManager.disconnect();
  };

  const handleCopyCode = () => {
    playClickSound();
    const code = multiplayerManager.roomCode || hostCodeInput;
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-950/95 border-2 border-cyan-500/60 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.4)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-md">
              <Globe size={22} className="animate-spin" style={{ animationDuration: '16s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-wide uppercase">
                  🌐 Мультиплеєр Онлайн • UA City Drive
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                    isOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  {isOnline ? `ОНЛАЙН (${connectedPlayersCount})` : 'ОФЛАЙН'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Катайтеся з друзями, влаштовуйте вуличні гонки, захищайте місто від шахедів разом!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Bar */}
        <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={handleSaveNickname} className="flex items-center gap-2 flex-1 max-w-sm">
            <span className="text-xs font-mono text-slate-400 font-bold whitespace-nowrap">ПОЗИВНИЙ:</span>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Введіть ваш нікнейм..."
              maxLength={18}
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white font-bold outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md"
            >
              Зберегти
            </button>
          </form>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">РОЛЬ:</span>
            <span
              className={`px-2 py-0.5 rounded-lg font-bold ${
                isArmy
                  ? 'bg-emerald-950 border border-yellow-400 text-yellow-300'
                  : isPolice
                  ? 'bg-blue-950 border border-blue-400 text-blue-300'
                  : 'bg-slate-900 border border-slate-700 text-slate-300'
              }`}
            >
              {isArmy ? '🪖 ЗСУ ППО' : isPolice ? '👮 ПОЛІЦІЯ 102' : '👤 ЦИВІЛЬНИЙ'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-black text-xs transition-all ${
              activeTab === 'quick'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Zap size={14} />
            <span>ШВИДКИЙ ВХІД</span>
          </button>
          <button
            onClick={() => setActiveTab('host')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-black text-xs transition-all ${
              activeTab === 'host'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Plus size={14} />
            <span>СТВОРИТИ КІМНАТУ</span>
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-black text-xs transition-all ${
              activeTab === 'join'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <LogIn size={14} />
            <span>ПРИЄДНАТИСЯ ЗА КОДОМ</span>
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-black text-xs transition-all ${
              activeTab === 'players'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users size={14} />
            <span>ГРАВЦІ ({connectedPlayersCount})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto max-h-[380px] flex flex-col gap-4">
          {/* Active Room Banner if connected */}
          {isOnline && (
            <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/50 p-4 rounded-2xl flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Wifi size={20} className="animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-mono text-emerald-400 font-bold uppercase">
                    АКТИВНА СЕСІЯ: {multiplayerManager.isHost ? '👑 ХОСТ' : '🔗 КЛІЄНТ'}
                  </div>
                  <div className="text-base font-black text-white flex items-center gap-2">
                    <span>Кімната: «{multiplayerManager.roomCode}»</span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                      title="Копіювати код кімнати"
                    >
                      {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-all shadow-md"
              >
                <LogOut size={14} />
                <span>Відключитися</span>
              </button>
            </div>
          )}

          {/* TAB 1: Quick Play */}
          {activeTab === 'quick' && (
            <div className="flex flex-col gap-4">
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                🚀 <span className="font-bold text-white">Миттєве підключення</span>: оберіть місто для автоматичного входу. Працює як для гри з друзями по мережі, так і для перевірки в декількох вкладках або вікнах браузера!
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => handleQuickPlay('kyiv')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group hover:scale-[1.02] ${
                    selectedCity === 'kyiv' && isOnline
                      ? 'bg-yellow-950/50 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                      : 'bg-slate-900/70 border-slate-800 hover:border-yellow-400'
                  }`}
                >
                  <div>
                    <span className="text-2xl">🏛️</span>
                    <h3 className="text-sm font-black text-white mt-2">Київ (Хрещатик)</h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Столиця: Майдан, Золоті Ворота, Дніпро, патрулі 102 та блокпости ЗСУ.
                    </p>
                  </div>
                  <button className="mt-4 w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md">
                    УВІЙТИ В КИЇВ
                  </button>
                </div>

                <div
                  onClick={() => handleQuickPlay('vinnytsia')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group hover:scale-[1.02] ${
                    selectedCity === 'vinnytsia' && isOnline
                      ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900/70 border-slate-800 hover:border-cyan-400'
                  }`}
                >
                  <div>
                    <span className="text-2xl">🏙️</span>
                    <h3 className="text-sm font-black text-white mt-2">Вінниця (Вежа)</h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      вул. Соборна, Фонтан Roshen, Центральний міст, супермаркети.
                    </p>
                  </div>
                  <button className="mt-4 w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-md">
                    УВІЙТИ У ВІННИЦЮ
                  </button>
                </div>

                <div
                  onClick={() => handleQuickPlay('zaporizhzhia')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group hover:scale-[1.02] ${
                    selectedCity === 'zaporizhzhia' && isOnline
                      ? 'bg-amber-950/50 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-900/70 border-slate-800 hover:border-amber-400'
                  }`}
                >
                  <div>
                    <span className="text-2xl">⚡</span>
                    <h3 className="text-sm font-black text-white mt-2">Запоріжжя (ГЕС)</h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      ДніпроГЕС, о. Хортиця, пр. Соборний, швидкісні траси та дрифт.
                    </p>
                  </div>
                  <button className="mt-4 w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md">
                    УВІЙТИ В ЗАПОРІЖЖЯ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Host Room */}
          {activeTab === 'host' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-slate-400">НАЗВА / КОД КІМНАТИ:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={hostCodeInput}
                    onChange={(e) => setHostCodeInput(e.target.value.toUpperCase())}
                    placeholder="Наприклад: UA-KYIV-777"
                    maxLength={16}
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white outline-none"
                  />
                  <button
                    onClick={() =>
                      setHostCodeInput(
                        'UA-' + (selectedCity === 'kyiv' ? 'KYIV' : selectedCity === 'zaporizhzhia' ? 'ZP' : 'VIN') + '-' + Math.floor(100 + Math.random() * 900)
                      )
                    }
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Випадковий
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-slate-400">ОБЕРІТЬ МІСТО ДЛЯ ГРИ:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectCity && onSelectCity('kyiv')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedCity === 'kyiv'
                        ? 'bg-yellow-500 text-slate-950 border-yellow-300 font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    Київ 🏛️
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectCity && onSelectCity('vinnytsia')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedCity === 'vinnytsia'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    Вінниця 🏙️
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectCity && onSelectCity('zaporizhzhia')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedCity === 'zaporizhzhia'
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    Запоріжжя ⚡
                  </button>
                </div>
              </div>

              <button
                onClick={handleHostRoom}
                disabled={isConnecting}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                <span>{isConnecting ? 'СТВОРЕННЯ СЕРВЕРА...' : 'СТВОРИТИ КІМНАТУ ТА ЗАПУСТИТИ'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: Join Room */}
          {activeTab === 'join' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-slate-400">ВВЕДІТЬ КОД КІМНАТИ ДРУГА:</label>
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="Введіть код, наприклад: UA-KYIV-777"
                  maxLength={20}
                  className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm font-mono font-bold text-white outline-none uppercase"
                />
              </div>

              <button
                onClick={handleJoinRoom}
                disabled={isConnecting || !joinCodeInput.trim()}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogIn size={18} />
                <span>{isConnecting ? 'ПІДКЛЮЧЕННЯ...' : 'ПРИЄДНАТИСЯ ДО СЕРВЕРА'}</span>
              </button>
            </div>
          )}

          {/* TAB 4: Connected Players List */}
          {activeTab === 'players' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                <span>ГРАВЦІ НА СЕРВЕРІ:</span>
                <span className="text-cyan-400 font-bold">{connectedPlayersCount} онлайн</span>
              </div>

              {/* Self Player */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-cyan-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                    ★
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>{multiplayerManager.nickname}</span>
                      <span className="text-[10px] text-cyan-400 font-mono">(Ви)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {isArmy ? '🪖 ЗСУ' : isPolice ? '👮 Поліція' : '👤 Цивільний'}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">🟢 0 ms</span>
              </div>

              {/* Remote Players */}
              {playersList.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold">
                      {p.role === 'army' ? '🪖' : p.role === 'police' ? '👮' : '🚗'}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">{p.nickname}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.isHumanOnFoot
                          ? '🚶 Пішки'
                          : p.isDrivingTank
                          ? '🛡️ Танк Т-64БВ'
                          : p.isDrivingMilitaryCar
                          ? '🚛 Козак-2М'
                          : '🚗 За кермом'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-bold">🟢 Онлайн</span>
                </div>
              ))}

              {playersList.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500 font-mono">
                  Поки що немає інших підключених гравців. Запросіть друга за кодом або відкрийте другу вкладку для перевірки!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Radio size={14} className={isOnline ? 'text-emerald-400' : 'text-slate-500'} />
            <span className="font-mono">{multiplayerManager.status === 'hosting' ? 'Сервер активний' : multiplayerManager.status === 'connected' ? 'Підключено' : 'Офлайн'}</span>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}
