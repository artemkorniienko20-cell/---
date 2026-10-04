import React, { useState } from 'react';
import {
  Shield,
  Zap,
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  X,
  Crosshair,
  Flame,
  Award,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import {
  playCashSound,
  playGunCockSound,
  playClickSound,
  playGunshotSound
} from '../../utils/audioSynthesizer';

const WEAPON_ITEMS = [
  {
    id: 'armor',
    name: 'Тактичний бронежилет «Корсар-М3»',
    category: 'Захист',
    desc: 'Кевларовий бронежилет 4 класу захисту. Миттєво відновлює 100% HP та захищає від поранень.',
    icon: '🛡️',
    price: 150,
    type: 'consumable',
    effect: 'restore_health'
  },
  {
    id: 'pepper_spray',
    name: 'Газовий балончик «Терен-4М»',
    category: 'Самооборона',
    desc: 'Спецзасіб сльозогінної та подразливої дії (МПК). Засліплює та дезорієнтує нападників на 5 секунд.',
    icon: '🌶️',
    price: 80,
    type: 'weapon',
    weaponKey: 'spray'
  },
  {
    id: 'baton',
    name: 'Гумовий кийок «ПР-73»',
    category: 'Ближній бій',
    desc: 'Міцний тактичний кийок з рукояткою. Подвоює силу удару в рукопашному бою (шкода +35).',
    icon: '🥢',
    price: 120,
    type: 'weapon',
    weaponKey: 'baton'
  },
  {
    id: 'taser',
    name: 'Електрошокер «Taser X26» (Цивільний)',
    category: 'Спецзасоби',
    desc: 'Офіційний дозвіл та електрошоковий пістолет. Паралізує дебоширів електричним струмом на 4 секунди!',
    icon: '⚡',
    price: 250,
    type: 'weapon',
    weaponKey: 'taser'
  },
  {
    id: 'pistol',
    name: 'Пістолет «Форт-12Р» (9mm P.A.)',
    category: 'Вогнепальна зброя',
    desc: 'Надійний український пістолет з магазином на 12 набоїв. Висока точність та зупиняюча дія (65 шкоди).',
    icon: '🔫',
    price: 450,
    type: 'weapon',
    weaponKey: 'pistol'
  },
  {
    id: 'shotgun',
    name: 'Помповий дробовик «Hatsan Escort»',
    category: 'Важка зброя',
    desc: 'Потужний 12-каліберний гладкоствольний дробовик. Колосальна нищівна сила на ближній дистанції (120 шкоди)!',
    icon: '💥',
    price: 750,
    type: 'weapon',
    weaponKey: 'shotgun'
  },
  {
    id: 'ammo_pack',
    name: 'Коробка набоїв (50 шт)',
    category: 'Амуніція',
    desc: 'Якісні бронебійні набої стандартів НАТО та МВС для пістолетів та дробовиків.',
    icon: '🎯',
    price: 60,
    type: 'consumable',
    effect: 'ammo'
  }
];

export default function GunShopModal({
  playerMoney,
  setPlayerMoney,
  ownedWeapons = [],
  setOwnedWeapons,
  equippedWeapon,
  setEquippedWeapon,
  setHumanHealth,
  onClose
}) {
  const [feedback, setFeedback] = useState(null);

  const handleBuyItem = (item) => {
    if (playerMoney < item.price) {
      playClickSound();
      setFeedback({
        type: 'error',
        text: `❌ Недостатньо коштів! Потрібно ₴${item.price}, а у вас лише ₴${playerMoney}.`
      });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    // Process payment
    playCashSound();
    playGunCockSound();
    setPlayerMoney(prev => prev - item.price);

    if (item.type === 'consumable') {
      if (item.effect === 'restore_health') {
        if (setHumanHealth) setHumanHealth(100);
        setFeedback({
          type: 'success',
          text: `🛡️ Придбано та вдягнуто «${item.name}»! Здоров'я та броня повністю відновлені до 100%!`
        });
      } else {
        setFeedback({
          type: 'success',
          text: `🎯 Придбано «${item.name}»! Боєкомплект поповнено!`
        });
      }
    } else {
      // Weapon purchase
      if (setOwnedWeapons) {
        setOwnedWeapons(prev => {
          if (!prev.includes(item.weaponKey)) return [...prev, item.weaponKey];
          return prev;
        });
      }
      if (setEquippedWeapon) {
        setEquippedWeapon(item.weaponKey);
      }
      setFeedback({
        type: 'success',
        text: `🔫 Придбано та екіпіровано «${item.name}»! Тепер ця зброя доступна для використання!`
      });
    }

    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl bg-zinc-950 border-2 border-red-600/60 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-500 shadow-lg">
              <Crosshair className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white uppercase tracking-wider">
                  Магазин Зброї «КАЛІБР»
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white uppercase">
                  24/7 ЛІЦЕНЗІЯ
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Тактичне спорядження, засоби самооборони, набої та цивільна зброя
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Player Cash */}
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-emerald-500/40 flex items-center gap-1.5 text-emerald-400 font-bold text-sm shadow">
              <DollarSign className="w-4 h-4" />
              <span>₴{playerMoney}</span>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
              title="Закрити магазин [Esc]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className={`mt-3 p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/60 border-red-500/50 text-red-300'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Weapons Grid list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {WEAPON_ITEMS.map((item) => {
            const isOwned = item.weaponKey && ownedWeapons.includes(item.weaponKey);
            const isEquipped = item.weaponKey && equippedWeapon === item.weaponKey;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-red-500/40 transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {item.category}
                      </span>
                      {isEquipped && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600/40 text-blue-300 font-bold border border-blue-500/40">
                          Екіпіровано
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 max-w-md">{item.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-black text-amber-400">₴{item.price}</div>
                    <div className="text-[10px] text-zinc-500">В наявності</div>
                  </div>

                  {isOwned ? (
                    <button
                      onClick={() => {
                        playGunCockSound();
                        if (setEquippedWeapon) setEquippedWeapon(item.weaponKey);
                        setFeedback({
                          type: 'success',
                          text: `✅ «${item.name}» встановлено як поточну зброю!`
                        });
                        setTimeout(() => setFeedback(null), 3000);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow"
                    >
                      {isEquipped ? 'Обрано' : 'Взяти в руки'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyItem(item)}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-red-950"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Купити
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <span>Куплена зброя зберігається у вашому інвентарі.</span>
          <span className="text-zinc-500">Клавіші [1]-[4] або меню зброї в пішому режимі</span>
        </div>

      </div>
    </div>
  );
}
