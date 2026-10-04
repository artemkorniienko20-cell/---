import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageSquare,
  Shield,
  Flame,
  Heart,
  Wrench,
  X,
  Send,
  AlertTriangle,
  User,
  Radio,
  CheckCircle2,
  ChevronRight,
  PhoneCall,
  Sparkles,
  HelpCircle,
  Truck
} from 'lucide-react';
import {
  playClickSound,
  playPhoneRingtone,
  playPhoneMessageSound,
  playDsnsSirenSound,
  playExtinguisherSound,
  playPoliceRadioSound
} from '../../utils/audioSynthesizer';

const CITIZEN_CONTACTS = [
  {
    id: 'bogdan',
    name: 'Богдан',
    role: 'Вуличний боксер',
    avatar: '🥊',
    online: true,
    messages: [
      { sender: 'them', text: 'Здоров! Як життя в місті? Бачив тебе на колесах!' },
      { sender: 'me', text: 'Привіт! Все чітко, катаюся вулицями.' },
      { sender: 'them', text: 'Якщо скучно — підходь до площі, влаштуємо дружній спаринг на кулаках [Q]. Тільки обережно, копи на районі злі!' }
    ],
    replies: [
      'Де тебе знайти для спарингу?',
      'Скільки грошей дають за перемогу на вулиці?',
      'Краще не лізь, я вступив до поліції!'
    ]
  },
  {
    id: 'oksana',
    name: 'Оксана',
    role: 'Місцева мешканка',
    avatar: '👩',
    online: true,
    messages: [
      { sender: 'them', text: 'Привіт! Щойно була в АТБ, там свіжі французькі хот-доги та смачна піца!' },
      { sender: 'them', text: 'Не забувай підкріплюватися, бо рівень голоду падає під час бігу та їзди!' }
    ],
    replies: [
      'Дякую за пораду! Де знаходиться супермаркет?',
      'Я вже купив власну квартиру за ₴100!',
      'Зараз заїду перекусити.'
    ]
  },
  {
    id: 'taras',
    name: 'Тарас',
    role: 'Автомеханік',
    avatar: '🔧',
    online: true,
    messages: [
      { sender: 'them', text: 'Братуха, салам! Як тачка тягне? Якщо розіб\'єш бампер або фари — тисни [R] або дзвони в ДСНС 101!' },
      { sender: 'them', text: 'До речі, кнопками [1], [2], [3], [4] вмикається лімітер швидкості 50, 100, 200, 300 км/год!' }
    ],
    replies: [
      'Як розігнати авто швидше 300 км/год?',
      'Чи працює автопілот?',
      'Дякую, тачка просто ракета!'
    ]
  },
  {
    id: 'maks',
    name: 'Макс',
    role: 'Охоронець супермаркету',
    avatar: '🏪',
    online: true,
    messages: [
      { sender: 'them', text: 'Вітаю! Нагадую: в магазині діє самообслуговування. Підходьте до каси на [F].' },
      { sender: 'them', text: 'У нас є гаряча їжа, вода Моршинська та енергетики!' }
    ],
    replies: [
      'Який графік роботи маркету?',
      'Чи потрібна охорона в магазин?',
      'Дякую за безпеку в центрі!'
    ]
  },
  {
    id: 'lieutenant_koval',
    name: 'Лейтенант Коваль',
    role: 'Патрульна поліція 102',
    avatar: '👮',
    online: true,
    messages: [
      { sender: 'them', text: 'Доброго дня, громадянине. Патрульна поліція Вінниччини та Запоріжжя на зв\'язку.' },
      { sender: 'them', text: 'Дотримуйтесь правил дорожнього руху. У разі надзвичайних ситуацій телефонуйте 102.' }
    ],
    replies: [
      'Як вступити до лав поліції?',
      'Я бачив підозрілих дебоширів!',
      'Бажаю спокійного чергування, офіцере!'
    ]
  },
  {
    id: 'melnyk_zsu',
    name: 'Капітан Мельник',
    role: 'Командир зенітної батареї ЗСУ',
    avatar: '🪖',
    online: true,
    messages: [
      { sender: 'them', text: 'Бажаю здоров\'я! Небо над містом під пильним наглядом ППО ЗСУ!' },
      { sender: 'them', text: 'Коли лунає повітряна тривога — бери АК-74 [8], ПЗРК [9] або FPV-дрон [0] та збивай ворожі шахеди!' },
      { sender: 'them', text: 'Якщо шахед не збити, він може прилетіти прямо в супермаркет чи поліцію! До захисту допускаються танки та броньовики ЗСУ.' }
    ],
    replies: [
      'Я хочу вступити до лав ЗСУ! 🪖',
      'Як збивати шахед з калаша?',
      'Чи можу я керувати танком ЗСУ?',
      'Скільки платять за збитий дрон?'
    ]
  }
];

export default function PhoneModal({
  isOpen = true,
  onClose,
  onEmergencyCall,
  onCallPolice,
  onCallDsns,
  onTriggerAlarm,
  isPolice,
  isArmy,
  onEnlistArmy,
  onDischargeArmy,
  playerMoney,
  onSendSms,
  onJoinPolice,
  humanHealth,
  humanHunger,
  carDamage
}) {
  if (!isOpen) return null;

  useEffect(() => {
    const handleKey = (e) => {
      const k = e.key.toLowerCase();
      if (e.key === 'Escape' || e.code === 'KeyP' || k === 'p' || k === 'з') {
        e.preventDefault();
        e.stopPropagation();
        playClickSound();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);
  const [activeTab, setActiveTab] = useState('calls'); // 'calls' | 'messages' | 'info'
  const [activeChatId, setActiveChatId] = useState(null);
  const [callStatus, setCallStatus] = useState(null); // null | { service: '102' | '101' | '103', state: 'ringing' | 'connected', msg: string }
  const [chatHistories, setChatHistories] = useState(CITIZEN_CONTACTS);

  // Active chat
  const activeChat = chatHistories.find(c => c.id === activeChatId);

  // Trigger Police Call
  const handleCallPolice = (type) => {
    playPhoneRingtone();
    setCallStatus({ service: '102', state: 'ringing', msg: 'З\'єднання з черговою частиною 102...' });

    setTimeout(() => {
      playPoliceRadioSound();
      if (type === 'patrol') {
        setCallStatus({
          service: '102',
          state: 'connected',
          msg: '🚨 «Чергова частина слухає! Патрульний екіпаж виїхав за вашими GPS-координатами! Очікуйте прибуття!»'
        });
        if (onEmergencyCall) onEmergencyCall('102', 'patrol');
        if (onCallPolice) onCallPolice({ type: 'patrol' });
      } else if (type === 'brawl') {
        setCallStatus({
          service: '102',
          state: 'connected',
          msg: '🥊 «Орієнтування передано! Спецпідрозділ поліції з тайзерами прямує для знешкодження дебоширів!»'
        });
        if (onEmergencyCall) onEmergencyCall('102', 'report_fight');
        if (onCallPolice) onCallPolice({ type: 'brawl' });
      } else {
        setCallStatus({
          service: '102',
          state: 'connected',
          msg: '🏛️ «Головне управління відкрите 24/7 (вул. Театральна / просп. Соборний). Підходьте до парадного входу для складання присяги!»'
        });
        if (onEmergencyCall) onEmergencyCall('102', 'join');
        if (onJoinPolice) onJoinPolice();
        if (onCallPolice) onCallPolice({ type: 'recruitment' });
      }
    }, 1400);
  };

  // Trigger DSNS (101) Call
  const handleCallDsns = (type) => {
    playPhoneRingtone();
    setCallStatus({ service: '101', state: 'ringing', msg: 'Виклик оперативно-рятувальної служби ДСНС 101...' });

    setTimeout(() => {
      playDsnsSirenSound();
      if (type === 'fire') {
        setCallStatus({
          service: '101',
          state: 'connected',
          msg: '🚒 «Пожежно-рятувальне відділення ДСНС на місці! Пожежу авто ліквідовано спеціальною піною, двигун охолоджено!»'
        });
        playExtinguisherSound();
        if (onEmergencyCall) onEmergencyCall('101', 'fire');
        if (onCallDsns) onCallDsns({ type: 'fire' });
      } else if (type === 'medic') {
        setCallStatus({
          service: '101',
          state: 'connected',
          msg: '🚑 «Рятувально-медична бригада ДСНС надала першу допомогу! Здоров\'я та сили відновлено на 100%!»'
        });
        if (onEmergencyCall) onEmergencyCall('101', 'medical');
        if (onCallDsns) onCallDsns({ type: 'medic' });
      } else {
        setCallStatus({
          service: '101',
          state: 'connected',
          msg: '🚜 «Важка техніка ДСНС відбуксувала авто та відновила ходову частину! Машина готова до руху!»'
        });
        if (onEmergencyCall) onEmergencyCall('101', 'rescue');
        if (onCallDsns) onCallDsns({ type: 'evacuate' });
      }
    }, 1400);
  };

  // Send message to citizen
  const handleSendReply = (replyText) => {
    if (!activeChatId) return;
    playClickSound();

    setChatHistories(prev =>
      prev.map(c => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: [...c.messages, { sender: 'me', text: replyText }]
          };
        }
        return c;
      })
    );

    // Citizen automated reply
    setTimeout(() => {
      playPhoneMessageSound();
      let autoReply = 'Зрозумів тебе! Будь обережний на дорогах, друже!';
      if (replyText.includes('спарингу') || replyText.includes('бой')) {
        autoReply = 'Я біля Європейської площі та Вежі Артинова! Приходь спарингуватися, покажемо клас!';
      } else if (replyText.includes('грошей')) {
        autoReply = 'Приблизно ₴150-350 за бійку, готівка випадає одразу на землю!';
      } else if (replyText.includes('поліції')) {
        autoReply = 'Ого, нічого собі! Повага офіцеру! Не стріляй тільки з тайзера, я законослухняний громадянин!';
      } else if (replyText.includes('АТБ') || replyText.includes('магазин')) {
        autoReply = 'У центрі міста великі неонові вивіски АТБ та Сільпо, не промахнешся!';
      } else if (replyText.includes('300')) {
        autoReply = 'Швидкісний автобан на Хмельницькому шосе та 6 смуг проспекту Соборного ідеальні для 300+ км/год!';
      } else if (replyText.includes('квартиру')) {
        autoReply = 'Вітаю з новосіллям! Життя за ₴100 у власному будинку — це справжня розкіш!';
      } else if (replyText.includes('калаша') || replyText.includes('збивати')) {
        autoReply = 'Цілься трохи на випередження! 2 влучні черги з АК-74 [8] або 1 ракета ПЗРК [9] перетворюють шахед на металобрухт!';
      } else if (replyText.includes('вступити') || replyText.includes('ЗСУ')) {
        autoReply = '«Бажання козака — закон! Вітаю в лавах Збройних Сил України! 🇺🇦 Тобі видано повний арсенал: АК-74 [8], ПЗРК «Stinger» [9] та FPV-дрон [0], а також повний доступ до танка Т-64БВ і броньовика «Козак-2М» на базі! До бою!»';
        if (typeof onEnlistArmy === 'function') onEnlistArmy();
      } else if (replyText.includes('танком')) {
        autoReply = 'Танк Т-64БВ на блокпосту доступний виключно бійцям ЗСУ! Вступай до лав армії у штабі!';
      } else if (replyText.includes('платять') || replyText.includes('дрон')) {
        autoReply = 'За кожен знищений ворожий дрон ЗСУ виплачує бойову винагороду ₴500!';
      }

      setChatHistories(prev =>
        prev.map(c => {
          if (c.id === activeChatId) {
            return {
              ...c,
              messages: [...c.messages, { sender: 'them', text: autoReply }]
            };
          }
          return c;
        })
      );
    }, 900);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playClickSound();
          onClose();
        }
      }}
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none cursor-pointer"
    >
      {/* Smartphone Outer Casing */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[390px] h-[740px] max-h-[92vh] bg-zinc-950 rounded-[48px] p-3 shadow-2xl border-4 border-zinc-700/80 ring-8 ring-black flex flex-col justify-between cursor-default"
      >
        
        {/* Dynamic Island / Top Speaker */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-blue-900/60" />
        </div>

        {/* Smartphone Screen Inner */}
        <div className="relative w-full h-full bg-gradient-to-b from-slate-950 via-zinc-900 to-black rounded-[40px] overflow-hidden flex flex-col border border-zinc-800">
          
          {/* Top Status Bar */}
          <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-semibold text-zinc-300 z-20">
            <span>12:45</span>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className="text-[10px] text-sky-400">UA 5G</span>
              <span>🔋 96%</span>
            </div>
          </div>

          {/* Header Title & Close Button */}
          <div className="px-5 py-2.5 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/40">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
                🇺🇦
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">Смартфон «Дія / City»</h3>
                <p className="text-[10px] text-zinc-400">Екстрені служби та зв'язок</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                playClickSound();
                onClose();
              }}
              className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              title="Закрити телефон [P / Esc]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Body Content based on Tab */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* CALLS TAB */}
            {activeTab === 'calls' && (
              <div className="space-y-4">
                
                {/* Active Call Banner if active */}
                {callStatus && (
                  <div className={`p-3.5 rounded-2xl border ${
                    callStatus.service === '101'
                      ? 'bg-red-950/40 border-red-500/40 text-red-200'
                      : 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                  } animate-in fade-in`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 animate-pulse text-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Служба {callStatus.service} • {callStatus.state === 'ringing' ? 'Виклик...' : 'На зв\'язку'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          playClickSound();
                          setCallStatus(null);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      >
                        Завершити
                      </button>
                    </div>
                    <p className="text-xs font-medium leading-relaxed">{callStatus.msg}</p>
                  </div>
                )}

                {/* 102 POLICE CARD */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-900/90 border border-blue-500/30 shadow-lg">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-400">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          Поліція України <span className="text-xs text-blue-400 font-black">102</span>
                        </h4>
                        <p className="text-[11px] text-zinc-400">Охорона правопорядку та патрулі</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      onClick={() => handleCallPolice('patrol')}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-between transition-colors shadow-md"
                    >
                      <span className="flex items-center gap-2">
                        <PhoneCall className="w-3.5 h-3.5" /> Викликати патруль на мої координати
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>

                    <button
                      onClick={() => handleCallPolice('brawl')}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-blue-300 font-medium text-xs flex items-center justify-between transition-colors border border-blue-500/20"
                    >
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Повідомити про бійку / напад
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>

                    <button
                      onClick={() => handleCallPolice('recruitment')}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs flex items-center justify-between transition-colors border border-zinc-700"
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-sky-400" /> Як вступити до лав поліції?
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  </div>
                </div>

                {/* 101 DSNS EMERGENCY SERVICE CARD */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-950/60 to-orange-950/40 border border-red-500/30 shadow-lg">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-400/50 flex items-center justify-center text-red-400">
                        <Flame className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          ДСНС України <span className="text-xs text-red-400 font-black">101</span>
                        </h4>
                        <p className="text-[11px] text-zinc-400">Пожежно-рятувальна служба</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      onClick={() => handleCallDsns('fire')}
                      className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs flex items-center justify-between transition-colors shadow-md"
                    >
                      <span className="flex items-center gap-2">
                        <Flame className="w-3.5 h-3.5 text-amber-300" /> Загасити пожежу двигуна авто
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>

                    <button
                      onClick={() => handleCallDsns('medic')}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-red-300 font-medium text-xs flex items-center justify-between transition-colors border border-red-500/20"
                    >
                      <span className="flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-red-400" /> Медична допомога (Відновити HP)
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>

                    <button
                      onClick={() => handleCallDsns('evacuate')}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs flex items-center justify-between transition-colors border border-zinc-700"
                    >
                      <span className="flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-amber-400" /> Евакуація та ремонт авто
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  </div>
                </div>

                {/* 103 AMBULANCE */}
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Швидка медична допомога 103</h5>
                      <p className="text-[10px] text-zinc-400">Цілодобова допомога лікаря</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCallDsns('medic')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                  >
                    103
                  </button>
                </div>

                {/* ZSU AIR DEFENSE & MILITARY HQ CARD */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/70 to-stone-950/90 border border-emerald-500/40 shadow-lg">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-400/50 flex items-center justify-center text-emerald-400 text-lg">
                        🪖
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          ЗСУ • Штаб ППО <span className="text-xs text-emerald-400 font-black">Ситуаційний центр</span>
                        </h4>
                        <p className="text-[11px] text-zinc-400">Моніторинг неба та перехоплення БПЛА</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {!isArmy ? (
                      <button
                        onClick={() => {
                          playGunCockSound();
                          playRadioBeepSound();
                          if (onEnlistArmy) onEnlistArmy();
                          setCallStatus({
                            service: 'ЗСУ',
                            state: 'connected',
                            msg: '🎖️ «Вітаємо у лавах ЗСУ! Вам видано автомат АК-74, ПЗРК «Stinger» та FPV-дрон! Танк Т-64БВ та броньовик «Козак-2М» розблоковано на базі!»'
                          });
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs flex items-center justify-between transition-colors shadow-md cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-yellow-300" /> Вступити до лав ЗСУ (Контракт)
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    ) : (
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                        <span className="flex items-center gap-1.5">
                          <span>🪖</span> Військовослужбовець ЗСУ (Активний)
                        </span>
                        <button
                          onClick={() => {
                            playClickSound();
                            if (onDischargeArmy) onDischargeArmy();
                            setCallStatus({
                              service: 'ЗСУ',
                              state: 'connected',
                              msg: '👤 «Вас звільнено у запас. Дякуємо за службу!»'
                            });
                          }}
                          className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                        >
                          Звільнитися в запас
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        playPhoneRingtone();
                        setCallStatus({ service: 'ЗСУ', state: 'ringing', msg: 'З\'єднання з оперативним черговим ППО...' });
                        setTimeout(() => {
                          playPoliceRadioSound();
                          setCallStatus({
                            service: 'ЗСУ',
                            state: 'connected',
                            msg: '🚨 «Черговий ППО слухає! Виявлено загрозу ударних БПЛА! Сирену увімкнено! Вогневим групам приготуватися до збиття!»'
                          });
                          if (onTriggerAlarm) onTriggerAlarm();
                        }, 1200);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-600 hover:to-green-500 text-white font-medium text-xs flex items-center justify-between transition-colors shadow-md"
                    >
                      <span className="flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Оголосити Повітряну Тривогу (Атака Шахедів)
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* MESSAGES TAB */}
            {activeTab === 'messages' && (
              <div className="space-y-3">
                {activeChat ? (
                  // Inside active chat thread
                  <div className="flex flex-col h-[490px]">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                      <button
                        onClick={() => {
                          playClickSound();
                          setActiveChatId(null);
                        }}
                        className="text-xs font-medium text-blue-400 hover:underline flex items-center gap-1"
                      >
                        ← Назад
                      </button>
                      <div className="text-center">
                        <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                          <span>{activeChat.avatar}</span> {activeChat.name}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-medium">В мережі • {activeChat.role}</div>
                      </div>
                      <div className="w-6" />
                    </div>

                    {/* Chat Messages scroll area */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                      {activeChat.messages.map((m, idx) => (
                        <div
                          key={idx}
                          className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-2.5 rounded-2xl text-xs leading-relaxed ${
                              m.sender === 'me'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700/60'
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick reply choices */}
                    <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                      <span className="text-[10px] text-zinc-400 font-medium">Швидка відповідь:</span>
                      <div className="flex flex-col gap-1">
                        {activeChat.replies.map((r, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendReply(r)}
                            className="text-left text-[11px] py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-blue-600/30 text-zinc-300 hover:text-white transition-colors border border-zinc-700 flex items-center justify-between"
                          >
                            <span>{r}</span>
                            <Send className="w-3 h-3 text-blue-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Contact list
                  <div className="space-y-2">
                    <p className="text-[11px] text-zinc-400 font-medium">Громадяни та жителі міста:</p>
                    {chatHistories.map(c => {
                      const lastMsg = c.messages[c.messages.length - 1];
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            playClickSound();
                            setActiveChatId(c.id);
                          }}
                          className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg">
                              {c.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h5 className="text-xs font-bold text-white">{c.name}</h5>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                                  {c.role}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 truncate max-w-[200px] mt-0.5">
                                {lastMsg ? lastMsg.text : 'Нове повідомлення'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-500" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* INFO TAB */}
            {activeTab === 'info' && (
              <div className="space-y-3 text-xs text-zinc-300">
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                  <h5 className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Гарячі клавіші та керування
                  </h5>
                  <ul className="space-y-1 text-[11px] text-zinc-300">
                    <li>• <kbd className="px-1 bg-zinc-800 rounded font-mono">P</kbd> — Відкрити / закрити смартфон</li>
                    <li>• <kbd className="px-1 bg-zinc-800 rounded font-mono">E</kbd> — Сісти в авто або вийти</li>
                    <li>• <kbd className="px-1 bg-zinc-800 rounded font-mono">F</kbd> — Вхід у магазин / будинок / відділок</li>
                    <li>• <kbd className="px-1 bg-zinc-800 rounded font-mono">V</kbd> — Автопілот вперед (круїз-контроль)</li>
                    <li>• <kbd className="px-1 bg-zinc-800 rounded font-mono">G</kbd> — Поліцейська сирена та мигалки</li>
                    <li>• <kbd className="px-1 bg-zinc-800 rounded font-mono">Q / ЛКМ</kbd> — Удар / постріл / спецзасіб</li>
                    <li>• <kbd className="px-1 bg-zinc-800 rounded font-mono">1-4</kbd> — Вибір зброї / лімітер швидкості</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <h5 className="font-bold text-white">🚒 Служба ДСНС (101)</h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Якщо ваше авто спалахнуло внаслідок серйозної аварії або пошкоджень, одразу телефонуйте в ДСНС — рятувальники миттєво загасять пожежу та відновлять здоров'я!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <h5 className="font-bold text-white">👮 Національна Поліція (102)</h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Поліція цілодобово захищає спокій громадян. Вступайте до лав у Головному Управлінні, отримуйте табельні спецзасоби та затримуйте дебоширів за винагороду!
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Bottom App Navigation Bar */}
          <div className="p-2 border-t border-zinc-800/80 bg-zinc-950/90 flex items-center justify-around">
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('calls');
                setActiveChatId(null);
              }}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
                activeTab === 'calls'
                  ? 'bg-blue-600/20 text-blue-400 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Phone className="w-5 h-5" />
              <span className="text-[10px]">Дзвінки</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setActiveTab('messages');
              }}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
                activeTab === 'messages'
                  ? 'bg-blue-600/20 text-blue-400 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px]">СМС</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setActiveTab('info');
                setActiveChatId(null);
              }}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
                activeTab === 'info'
                  ? 'bg-blue-600/20 text-blue-400 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-[10px]">Довідка</span>
            </button>
          </div>

          {/* Bottom Home Indicator Bar */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              onClose();
            }}
            className="py-2.5 flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            title="Закрити смартфон [P / Esc]"
          >
            <div className="w-32 h-1.5 bg-zinc-400 hover:bg-white rounded-full shadow-sm" />
            <span className="text-[9px] text-zinc-500 hover:text-zinc-300 font-mono mt-1">Закрити [P / Esc]</span>
          </div>

        </div>
      </div>
    </div>
  );
}
