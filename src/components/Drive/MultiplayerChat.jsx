import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { playClickSound, playPhoneMessageSound } from '../../utils/audioSynthesizer';

const QUICK_PHRASES = [
  'Слава Україні! 🇺🇦',
  'Увага, Шахед у небі! 🚨 Всім ППО до бою!',
  'Хто на гонку наввипередки? 🏎️💨',
  'Працює поліція 102! Зупиніть авто! 🚔',
  'Потрібна допомога або ремонт СТО! 🔧',
  'Збив ворожий безпілотник! 🎯'
];

export function MultiplayerChat({
  multiplayerManager,
  role = 'civilian',
  isChatOpen,
  setIsChatOpen
}) {
  const [messages, setMessages] = useState([
    {
      id: 'init_1',
      senderId: 'system',
      nickname: 'СИСТЕМА',
      text: 'Ласкаво просимо до онлайн чату! Натисніть [T] для вводу або оберіть швидку фразу.',
      role: 'system',
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showQuick, setShowQuick] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!multiplayerManager) return;

    const handleIncomingChat = (msg) => {
      setMessages((prev) => [...prev.slice(-30), msg]);
      playPhoneMessageSound();
    };

    multiplayerManager.onChatMessage = handleIncomingChat;
  }, [multiplayerManager]);

  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isChatOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  const handleSend = (textToSend = null) => {
    const text = textToSend || inputValue;
    if (!text || !text.trim() || !multiplayerManager) return;

    multiplayerManager.sendChatMessage(text, role);
    setInputValue('');
    playClickSound();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape') {
      setIsChatOpen(false);
    }
  };

  return (
    <div className="absolute bottom-24 left-4 z-30 w-80 sm:w-96 flex flex-col pointer-events-none select-none">
      {/* Messages Stream (Always semi-visible or expanded) */}
      <div
        className={`flex flex-col gap-1.5 p-3 rounded-2xl transition-all duration-300 max-h-48 overflow-y-auto ${
          isChatOpen
            ? 'bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 shadow-2xl pointer-events-auto'
            : 'bg-black/40 backdrop-blur-xs border border-white/10'
        }`}
      >
        {messages.slice(isChatOpen ? -15 : -4).map((m) => {
          const isMe = m.senderId === multiplayerManager?.playerId;
          const isSystem = m.role === 'system';
          const isArmy = m.role === 'army';
          const isPolice = m.role === 'police';

          return (
            <div
              key={m.id}
              className={`text-xs flex flex-wrap items-baseline gap-1 leading-snug rounded-lg px-2 py-1 ${
                isSystem
                  ? 'bg-cyan-950/40 text-cyan-300 font-mono text-[11px] border border-cyan-500/30'
                  : isMe
                  ? 'bg-blue-950/40 text-white'
                  : 'bg-slate-900/40 text-slate-200'
              }`}
            >
              {!isSystem && (
                <span
                  className={`text-[9.5px] px-1 py-0.2 rounded font-bold font-mono ${
                    isArmy
                      ? 'bg-emerald-950 text-yellow-300 border border-yellow-500/40'
                      : isPolice
                      ? 'bg-blue-950 text-cyan-300 border border-blue-500/40'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {isArmy ? '🪖 ЗСУ' : isPolice ? '👮 102' : '👤'}
                </span>
              )}

              <span
                className={`font-black text-[11px] ${
                  isSystem
                    ? 'text-cyan-400 font-mono'
                    : isMe
                    ? 'text-yellow-400'
                    : isArmy
                    ? 'text-emerald-400'
                    : isPolice
                    ? 'text-blue-400'
                    : 'text-cyan-300'
                }`}
              >
                {m.nickname}:
              </span>

              <span className="text-white/90 break-words font-medium">{m.text}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Input Box & Quick Phrases (When active or opened) */}
      {isChatOpen ? (
        <div className="mt-2 bg-slate-950/95 border border-cyan-500/50 p-2.5 rounded-2xl shadow-xl pointer-events-auto flex flex-col gap-2">
          {/* Quick phrase dropdown */}
          {showQuick && (
            <div className="flex flex-col gap-1 bg-slate-900/90 p-2 rounded-xl border border-slate-700 max-h-36 overflow-y-auto">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Швидкі тактичні фрази:</span>
              {QUICK_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleSend(phrase);
                    setShowQuick(false);
                  }}
                  className="text-left text-xs text-white hover:text-cyan-300 hover:bg-slate-800 px-2 py-1 rounded transition-colors truncate"
                >
                  {phrase}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowQuick(!showQuick)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 transition-colors"
              title="Швидкі фрази"
            >
              <Sparkles size={14} />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Повідомлення в чат (Enter — надіслати, ESC — закрити)..."
              maxLength={120}
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
            />

            <button
              onClick={() => handleSend()}
              className="p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all shadow-md"
              title="Надіслати"
            >
              <Send size={14} />
            </button>

            <button
              onClick={() => setIsChatOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            playClickSound();
            setIsChatOpen(true);
          }}
          className="mt-1 self-start px-2.5 py-1 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-700/80 text-cyan-300 font-mono text-[10px] font-bold flex items-center gap-1.5 pointer-events-auto transition-all shadow-md"
          title="Відкрити чат (Клавіша T)"
        >
          <MessageSquare size={11} />
          <span>ЧАТ [T]</span>
        </button>
      )}
    </div>
  );
}
