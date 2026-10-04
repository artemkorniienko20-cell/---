import React, { useState } from 'react';
import { ShoppingCart, Heart, Utensils, X, Plus, Sparkles, AlertCircle, Check } from 'lucide-react';
import { playCashSound, playEatingSound, playDrinkingSound, playClickSound } from '../../utils/audioSynthesizer';

const GROCERY_ITEMS = [
  {
    id: 'hotdog',
    name: 'Французький хот-дог',
    desc: 'Хрумка булочка, баварська сосиска, фірмовий соус та гірчиця',
    icon: '🌭',
    price: 55,
    hunger: 35,
    health: 5,
    isDrink: false
  },
  {
    id: 'pizza',
    name: 'Шматочок піци «Пепероні»',
    desc: 'Свіжоспечена гаряча піца з подвійним сиром моцарела',
    icon: '🍕',
    price: 95,
    hunger: 50,
    health: 8,
    isDrink: false
  },
  {
    id: 'sandwich',
    name: 'Сендвіч з шинкою та сиром',
    desc: 'Тостовий хліб, буженина, чеддер та свіжий лист салату',
    icon: '🥪',
    price: 45,
    hunger: 25,
    health: 4,
    isDrink: false
  },
  {
    id: 'varenyky',
    name: 'Вареники з картоплею та грибами',
    desc: 'Ситна українська страва зі смаженою цибулею та сметаною',
    icon: '🥟',
    price: 85,
    hunger: 65,
    health: 12,
    isDrink: false
  },
  {
    id: 'nuggets',
    name: 'Курячі нагетси (6 шт)',
    desc: 'Золотава хрустка скоринка з ніжного курячого філе',
    icon: '🍗',
    price: 75,
    hunger: 40,
    health: 6,
    isDrink: false
  },
  {
    id: 'water',
    name: 'Вода «Моршинська» негазована 0.5л',
    desc: 'Природна карпатська мінеральна вода для відновлення балансу',
    icon: '🥤',
    price: 20,
    hunger: 15,
    health: 10,
    isDrink: true
  },
  {
    id: 'coffee',
    name: 'Кава Американо з молоком',
    desc: '100% арабіка свіжого обсмаження для бадьорості',
    icon: '☕',
    price: 35,
    hunger: 12,
    health: 5,
    isDrink: true
  },
  {
    id: 'chocolate',
    name: 'Шоколадний батончик «Рошен»',
    desc: 'Темний шоколад з цільним горіхом та карамеллю',
    icon: '🍫',
    price: 28,
    hunger: 20,
    health: 2,
    isDrink: false
  },
  {
    id: 'medkit',
    name: 'Аптечка першої допомоги',
    desc: 'Повний набір перев\'язувальних засобів, знеболювальне та вітаміни',
    icon: '🩹',
    price: 130,
    hunger: 0,
    health: 65,
    isDrink: false
  }
];

export default function SupermarketModal({
  store,
  playerMoney,
  setPlayerMoney,
  humanHealth,
  setHumanHealth,
  humanHunger,
  setHumanHunger,
  onClose
}) {
  const [purchaseFeedback, setPurchaseFeedback] = useState(null);

  const isATB = store.brand === 'atb';

  const handleBuy = (item) => {
    if (playerMoney < item.price) {
      playClickSound();
      setPurchaseFeedback({
        type: 'error',
        text: `Недостатньо грошей для покупки ${item.name}! Потрібно ₴${item.price}`
      });
      setTimeout(() => setPurchaseFeedback(null), 2500);
      return;
    }

    // Deduct money
    setPlayerMoney(prev => prev - item.price);

    // Apply food benefits
    setHumanHunger(prev => Math.min(100, prev + item.hunger));
    setHumanHealth(prev => Math.min(100, prev + item.health));

    // Play sound
    playCashSound();
    if (item.isDrink) {
      setTimeout(() => playDrinkingSound(), 180);
    } else {
      setTimeout(() => playEatingSound(), 180);
    }

    setPurchaseFeedback({
      type: 'success',
      text: `Куплено ${item.name}! +${item.hunger}% ситості ${item.health > 0 ? `+${item.health}% HP` : ''}`
    });
    setTimeout(() => setPurchaseFeedback(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border-cyan-500/50">
        {/* Header */}
        <div
          className={`p-4 flex items-center justify-between text-white ${
            isATB
              ? 'bg-gradient-to-r from-red-700 via-rose-900 to-slate-900'
              : 'bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{isATB ? '🔴' : '🍊'}</span>
            <div>
              <h2 className="text-xl font-black tracking-tight">{store.name}</h2>
              <p className="text-xs text-slate-200">
                {isATB ? 'Продукти високої якості за чесними цінами 24/7' : 'Свіжа випічка, авторські страви та ресторанні смаколики'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Player Status Bar */}
        <div className="px-5 py-3 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-6">
            {/* Health */}
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-red-500 animate-pulse" />
              <span className="text-slate-400">Здоров'я:</span>
              <span className="text-white font-bold">{Math.round(humanHealth)}%</span>
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${humanHealth}%` }}
                />
              </div>
            </div>

            {/* Hunger */}
            <div className="flex items-center gap-2">
              <Utensils size={16} className="text-amber-400" />
              <span className="text-slate-400">Ситість:</span>
              <span className="text-white font-bold">{Math.round(humanHunger)}%</span>
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${humanHunger}%` }}
                />
              </div>
            </div>
          </div>

          {/* Money Wallet */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-500/40">
            <span className="text-emerald-400 font-black text-sm">💵 ₴{playerMoney}</span>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {purchaseFeedback && (
          <div
            className={`px-4 py-2 text-xs font-bold font-mono flex items-center justify-center gap-2 ${
              purchaseFeedback.type === 'error'
                ? 'bg-red-500/90 text-white'
                : 'bg-emerald-500/90 text-slate-950'
            }`}
          >
            {purchaseFeedback.type === 'error' ? <AlertCircle size={15} /> : <Check size={15} />}
            <span>{purchaseFeedback.text}</span>
          </div>
        )}

        {/* Grocery Items Grid */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[460px]">
          {GROCERY_ITEMS.map(item => {
            const canAfford = playerMoney >= item.price;
            return (
              <div
                key={item.id}
                className="bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-3 flex flex-col justify-between transition-all hover:scale-[1.02]"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-emerald-400 font-mono font-black text-sm">
                      ₴{item.price}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight mb-1">{item.name}</h4>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{item.desc}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-[10px] font-mono text-slate-300">
                    {item.hunger > 0 && <span className="text-amber-400 mr-1.5">+{item.hunger}% 🍗</span>}
                    {item.health > 0 && <span className="text-emerald-400">+{item.health}% ❤️</span>}
                  </div>

                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                      canAfford
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Plus size={13} />
                    Купити
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Підказка: Їжа відновлює ситість, щоб не втрачати здоров'я</span>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            Вийти з магазину (ESC)
          </button>
        </div>
      </div>
    </div>
  );
}
