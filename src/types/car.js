export const CAR_MODELS = {
  gwagon: {
    id: 'gwagon',
    brand: 'Mercedes-Benz',
    country: '🇩🇪 Німеччина',
    category: 'suv',
    categoryName: '🚙 Позашляховик',
    name: 'AMG G 63 "Гелендваген"',
    tagline: 'Культовий німецький позашляховик з брутальним V8 Biturbo та незламним характером',
    specs: {
      power: '585 к.с. V8 Biturbo',
      accel: '4.5 с до 100 км/год',
      topSpeed: '240 км/год',
      drive: 'AMG Performance 4MATIC AWD',
      range: '620 км'
    },
    basePrice: 185000,
    accentColor: '#e2e8f0',
    defaultColors: [
      { name: 'Obsidian Black Metallic', hex: '#0f172a', finish: 'metallic' },
      { name: 'Night Black Magno', hex: '#18181b', finish: 'matte' },
      { name: 'Designo Diamond White Bright', hex: '#f8fafc', finish: 'metallic' },
      { name: 'Arabian Grey Solid', hex: '#64748b', finish: 'gloss' },
      { name: 'Military Olive Magno', hex: '#365314', finish: 'matte' },
    ]
  },
  bmw: {
    id: 'bmw',
    brand: 'BMW',
    country: '🇩🇪 Німеччина',
    category: 'coupe',
    categoryName: '🏎️ Спорткупе',
    name: 'M4 Competition Coupé',
    tagline: 'Хижа баварська міць, точне шасі та ідеальний дрифт',
    specs: {
      power: '530 к.с. Twin-Turbo',
      accel: '3.4 с до 100 км/год',
      topSpeed: '290 км/год',
      drive: 'M xDrive / RWD Switchable',
      range: '580 км'
    },
    basePrice: 94000,
    accentColor: '#3b82f6',
    defaultColors: [
      { name: 'Isle of Man Green', hex: '#047857', finish: 'metallic' },
      { name: 'Tanzanite Blue', hex: '#1e3a8a', finish: 'metallic' },
      { name: 'Frozen Marina Grey', hex: '#475569', finish: 'matte' },
      { name: 'Toronto Red', hex: '#dc2626', finish: 'gloss' },
      { name: 'Sao Paulo Yellow', hex: '#eab308', finish: 'gloss' },
    ]
  },
  audi_rs6: {
    id: 'audi_rs6',
    brand: 'Audi',
    country: '🇩🇪 Німеччина',
    category: 'wagon',
    categoryName: '🏁 Спортивний універсал',
    name: 'RS6 Avant Performance',
    tagline: 'Легендарний хижий універсал з надпотужним Quattro та диким прискоренням',
    specs: {
      power: '630 к.с. V8 TFSI',
      accel: '3.4 с до 100 км/год',
      topSpeed: '305 км/год',
      drive: 'quattro Permanent AWD',
      range: '640 км'
    },
    basePrice: 138000,
    accentColor: '#ef4444',
    defaultColors: [
      { name: 'Nardo Grey', hex: '#6b7280', finish: 'gloss' },
      { name: 'Mythos Black Metallic', hex: '#090d16', finish: 'metallic' },
      { name: 'Tango Red Metallic', hex: '#dc2626', finish: 'metallic' },
      { name: 'Navarra Blue Metallic', hex: '#1d4ed8', finish: 'metallic' },
      { name: 'Ascari Blue Matte', hex: '#2563eb', finish: 'matte' },
    ]
  },
  porsche: {
    id: 'porsche',
    brand: 'Porsche',
    country: '🇩🇪 Німеччина',
    category: 'supercar',
    categoryName: '🏆 Трековий болід',
    name: '911 GT3 RS (Weissach)',
    tagline: 'Атмосферний 9000 RPM гоночний монстр з активною аеродинамікою DRS',
    specs: {
      power: '525 к.с. 4.0L Boxer-6',
      accel: '3.2 с до 100 км/год',
      topSpeed: '296 км/год',
      drive: 'Задній привід RWD Weissach',
      range: '510 км'
    },
    basePrice: 240000,
    accentColor: '#10b981',
    defaultColors: [
      { name: 'GT Silver & Pyro Red', hex: '#94a3b8', secondaryHex: '#ef4444', finish: 'metallic' },
      { name: 'Shark Blue', hex: '#0284c7', finish: 'gloss' },
      { name: 'Lizard Green', hex: '#84cc16', finish: 'gloss' },
      { name: 'Guards Red', hex: '#e11d48', finish: 'gloss' },
      { name: 'Arctic Grey Carbon', hex: '#475569', finish: 'gloss' },
    ]
  },
  lambo: {
    id: 'lambo',
    brand: 'Lamborghini',
    country: '🇮🇹 Італія',
    category: 'supercar',
    categoryName: '⚡ Гіперкар V12',
    name: 'Revuelto V12 HPEV',
    tagline: '1015-сильний італійський винищувач з атмосферним V12 та 3 електродвигунами',
    specs: {
      power: '1015 к.с. V12 Hybrid',
      accel: '2.5 с до 100 км/год',
      topSpeed: '350 км/год',
      drive: 'e-AWD Torque Vectoring',
      range: '450 км'
    },
    basePrice: 608000,
    accentColor: '#f59e0b',
    defaultColors: [
      { name: 'Giallo Inti (Neon Yellow)', hex: '#facc15', finish: 'metallic' },
      { name: 'Arancio Apodis (Pearl Orange)', hex: '#f97316', finish: 'metallic' },
      { name: 'Verde Mantis', hex: '#22c55e', finish: 'gloss' },
      { name: 'Nero Nemesis Matt', hex: '#18181b', finish: 'matte' },
      { name: 'Blu Cepheus Sky', hex: '#38bdf8', finish: 'gloss' },
    ]
  },
  cybertruck: {
    id: 'cybertruck',
    brand: 'Tesla',
    country: '🇺🇸 США',
    category: 'electric',
    categoryName: '⚡ Електропікап',
    name: 'Cybertruck Cyberbeast',
    tagline: 'Куленепробивний екзоскелет майбутнього та шалена динаміка гіперкара',
    specs: {
      power: '845 к.с. Tri-Motor',
      accel: '2.6 с до 100 км/год',
      topSpeed: '210 км/год',
      drive: 'Cyber Tri-Motor AWD',
      range: '547 км'
    },
    basePrice: 99990,
    accentColor: '#94a3b8',
    defaultColors: [
      { name: 'Ultra-Hard Stainless Steel', hex: '#94a3b8', finish: 'matte' },
      { name: 'Stealth Satin Black Wrap', hex: '#18181b', finish: 'matte' },
      { name: 'Ceramic Satin White Wrap', hex: '#f8fafc', finish: 'matte' },
      { name: 'Cyberpunk Neon Orange', hex: '#f97316', finish: 'gloss' },
      { name: 'Military Tactical Green', hex: '#3f6212', finish: 'matte' },
    ]
  },
  tesla: {
    id: 'tesla',
    brand: 'Tesla',
    country: '🇺🇸 США',
    category: 'electric',
    categoryName: '⚡ Електро-гіперкар',
    name: 'Cyber Sedan Plaid',
    tagline: 'Електрична ракета майбутнього: 1020 к.с. та розгін за 1.99 секунди',
    specs: {
      power: '1020 к.с.',
      accel: '1.99 с до 100 км/год',
      topSpeed: '322 км/год',
      drive: 'Повний привід Tri-Motor AWD',
      range: '600 км'
    },
    basePrice: 89000,
    accentColor: '#38bdf8',
    defaultColors: [
      { name: 'Ultra Red', hex: '#b91c1c', finish: 'metallic' },
      { name: 'Pearl White Multi-Coat', hex: '#f8fafc', finish: 'metallic' },
      { name: 'Solid Black', hex: '#111827', finish: 'gloss' },
      { name: 'Cyber Steel', hex: '#64748b', finish: 'matte' },
      { name: 'Deep Blue Metallic', hex: '#1d4ed8', finish: 'metallic' },
    ]
  },
  bus: {
    id: 'bus',
    brand: 'Volkswagen',
    country: '🇩🇪 Німеччина',
    category: 'van',
    categoryName: '🚐 Кемпер & Ретро',
    name: 'Bober Camper Bulli Van',
    tagline: 'Легендарний бусик для мандрівок, затишку, кемпінгу та повної свободи',
    specs: {
      power: '204 к.с. Turbo',
      accel: '8.4 с до 100 км/год',
      topSpeed: '185 км/год',
      drive: '4Motion AWD / Кемпер',
      range: '850 км'
    },
    basePrice: 52000,
    accentColor: '#fb923c',
    defaultColors: [
      { name: 'California Turquoise & Cream', hex: '#06b6d4', secondaryHex: '#fef08a', finish: 'gloss', isTwoTone: true },
      { name: 'Sunset Orange & White', hex: '#f97316', secondaryHex: '#f8fafc', finish: 'gloss', isTwoTone: true },
      { name: 'Retro Pistachio', hex: '#10b981', finish: 'gloss' },
      { name: 'Nardo Grey Van', hex: '#6b7280', finish: 'matte' },
      { name: 'Mocha Vintage', hex: '#78350f', finish: 'gloss' },
    ]
  },
  ferrari: {
    id: 'ferrari',
    brand: 'Ferrari',
    country: '🇮🇹 Італія',
    category: 'hypercar',
    categoryName: '🏎️ Гіперкар V8',
    name: 'SF90 Stradale',
    tagline: '1000-сильний гібридний шедевр із Маранелло: розгін до 100 км/год за рекордні 2.5 с',
    specs: {
      power: '1000 к.с. V8 Hybrid',
      accel: '2.5 с до 100 км/год',
      topSpeed: '340 км/год',
      drive: 'e-4WD Електричний повний',
      range: '520 км'
    },
    basePrice: 528000,
    accentColor: '#dc2626',
    defaultColors: [
      { name: 'Rosso Corsa Racing Red', hex: '#dc2626', finish: 'gloss' },
      { name: 'Giallo Modena Yellow', hex: '#facc15', finish: 'gloss' },
      { name: 'Nero Daytona Metallic', hex: '#090d16', finish: 'metallic' },
      { name: 'Bianco Avus Pure White', hex: '#f8fafc', finish: 'gloss' },
      { name: 'Blu Tour de France', hex: '#1e3a8a', finish: 'metallic' },
    ]
  },
  gtr: {
    id: 'gtr',
    brand: 'Nissan',
    country: '🇯🇵 Японія',
    category: 'jdm',
    categoryName: '🇯🇵 JDM Легенда',
    name: 'GT-R Nismo "Годзілла"',
    tagline: 'Культовий японський вбивця суперкарів з Twin-Turbo V6 та повним приводом ATTESA',
    specs: {
      power: '600 к.с. Twin-Turbo V6',
      accel: '2.7 с до 100 км/год',
      topSpeed: '330 км/год',
      drive: 'ATTESA E-TS Pro AWD',
      range: '550 км'
    },
    basePrice: 220000,
    accentColor: '#ef4444',
    defaultColors: [
      { name: 'Nismo Brilliant White & Red', hex: '#f8fafc', secondaryHex: '#ef4444', finish: 'metallic' },
      { name: 'Super Silver Metallic', hex: '#94a3b8', finish: 'metallic' },
      { name: 'Midnight Purple III', hex: '#581c87', finish: 'chameleon' },
      { name: 'Bayside Blue Classic', hex: '#2563eb', finish: 'metallic' },
      { name: 'Kuro Pearl Black', hex: '#0f172a', finish: 'metallic' },
    ]
  },
  mustang: {
    id: 'mustang',
    brand: 'Ford',
    country: '🇺🇸 США',
    category: 'muscle',
    categoryName: '🦅 American Muscle',
    name: 'Mustang Shelby GT500',
    tagline: 'Американський дикий маслкар з компресорним 5.2L V8 "Predator" та вихлопом звіра',
    specs: {
      power: '760 к.с. 5.2L Supercharged',
      accel: '3.3 с до 100 км/год',
      topSpeed: '290 км/год',
      drive: 'Задній привід RWD Torsen',
      range: '460 км'
    },
    basePrice: 85000,
    accentColor: '#0284c7',
    defaultColors: [
      { name: 'Grabber Blue & White Stripes', hex: '#0284c7', secondaryHex: '#f8fafc', finish: 'gloss' },
      { name: 'Twister Orange & Black Stripes', hex: '#ea580c', secondaryHex: '#18181b', finish: 'gloss' },
      { name: 'Shadow Black', hex: '#090d16', finish: 'metallic' },
      { name: 'Rapid Red Tintcoat', hex: '#b91c1c', finish: 'metallic' },
      { name: 'Iconic Silver Metallic', hex: '#cbd5e1', finish: 'metallic' },
    ]
  },
  bugatti: {
    id: 'bugatti',
    brand: 'Bugatti',
    country: '🇫🇷 Франція',
    category: 'hypercar',
    categoryName: '👑 Король Гіперкарів',
    name: 'Chiron Super Sport',
    tagline: 'Абсолютна вершина швидкості та розкоші: 1600 к.с., W16 Quad-Turbo та 440 км/год',
    specs: {
      power: '1600 к.с. 8.0L W16 Quad-Turbo',
      accel: '2.4 с до 100 км/год',
      topSpeed: '440 км/год',
      drive: 'Постійний повний привід AWD',
      range: '400 км'
    },
    basePrice: 3825000,
    accentColor: '#06b6d4',
    defaultColors: [
      { name: 'French Racing Blue & Carbon', hex: '#0284c7', secondaryHex: '#090d16', finish: 'gloss', isTwoTone: true },
      { name: 'Bugatti Black & Tangerine', hex: '#0f172a', secondaryHex: '#f97316', finish: 'gloss', isTwoTone: true },
      { name: 'Glacier White & Royal Blue', hex: '#f8fafc', secondaryHex: '#1e3a8a', finish: 'gloss', isTwoTone: true },
      { name: 'Royal Blue Exposed Carbon', hex: '#0c4a6e', finish: 'metallic' },
      { name: 'Nocturne Onyx Black', hex: '#020617', finish: 'metallic' },
    ]
  },
  zeekr: {
    id: 'zeekr',
    brand: 'Zeekr',
    country: '🇨🇳 Китай',
    category: 'electric',
    categoryName: '⚡ Гіпер-електрокар',
    name: 'Zeekr 001 FR',
    tagline: '1300-сильний гіперкар майбутнього: 4 електромотори, 0-100 за 2.07 с, розворот на місці та лідар NZP',
    specs: {
      power: '1300 к.с. Quad-Motor',
      accel: '2.07 с до 100 км/год',
      topSpeed: '280 км/год',
      drive: 'e-4WD Quad-Motor Torque Vectoring',
      range: '550 км'
    },
    basePrice: 118000,
    accentColor: '#f97316',
    defaultColors: [
      { name: 'Su Yan White & Carbon FR', hex: '#f8fafc', secondaryHex: '#ea580c', finish: 'metallic', isTwoTone: true },
      { name: 'Extreme Obsidian Black', hex: '#090d16', secondaryHex: '#ea580c', finish: 'metallic', isTwoTone: true },
      { name: 'Laser Neon Orange', hex: '#ea580c', finish: 'gloss' },
      { name: 'Silicon Grey Satin', hex: '#475569', finish: 'matte' },
      { name: 'Cyber Electric Cyan', hex: '#06b6d4', finish: 'metallic' },
    ]
  },
  zaporozhets: {
    id: 'zaporozhets',
    brand: 'ЗАЗ',
    country: '🇺🇦 Україна',
    category: 'retro',
    categoryName: '🇺🇦 Українська Легенда',
    name: 'ЗАЗ-968М "Запорожець"',
    tagline: 'Легендарний народний автомобіль із Запоріжжя: задньомоторне компонування, V4 повітряного охолодження та фірмові повітрозабірники "вуха"',
    specs: {
      power: '45 к.с. МеМЗ-968 V4',
      accel: '24 с до 100 км/год',
      topSpeed: '125 км/год',
      drive: 'Задній привід RWD (Задньомоторний)',
      range: '450 км'
    },
    basePrice: 2800,
    accentColor: '#eab308',
    defaultColors: [
      { name: 'Сонячний Оранж ("Коррида")', hex: '#f97316', finish: 'gloss' },
      { name: 'Волошковий Блакитний', hex: '#0284c7', finish: 'gloss' },
      { name: 'Біла Лілея', hex: '#f8fafc', finish: 'gloss' },
      { name: 'Смарагдовий Хортицький', hex: '#15803d', finish: 'gloss' },
      { name: 'Ретро Охра Запорізька', hex: '#ca8a04', finish: 'gloss' },
    ]
  }
};

export const ROOF_OPTIONS = [
  {
    id: 'panoramic',
    name: 'Панорамний скляний дах',
    description: 'Атермальне гартоване скло з градієнтним захистом від сонця',
    price: 1800,
    icon: 'Sun',
    feature: 'Сонцезахисне скло 99% UV'
  },
  {
    id: 'carbon',
    name: 'Полегшений карбоновий дах',
    description: 'Вуглепластик преміум-плетіння, що знижує центр ваги на 25%',
    price: 3200,
    icon: 'Layers',
    feature: 'Зниження ваги на 14 кг'
  },
  {
    id: 'body_solid',
    name: 'Метал у колір кузова',
    description: 'Класичний суцільний сталевий дах з ідеальною шумоізоляцією',
    price: 0,
    icon: 'Shield',
    feature: 'Максимальна жорсткість'
  },
  {
    id: 'roof_rack',
    name: 'Експедиційний багажник & Автобокс',
    description: 'Аеродинамічний багажник на дах для спорядження, намету та подорожей',
    price: 2100,
    icon: 'Package',
    feature: '+550 літрів простору'
  },
  {
    id: 'cabrio',
    name: 'Кабріолет / М\'який складаний дах',
    description: 'Швидкісний текстильний дах з електроприводом, складається за 10 сек',
    price: 4500,
    icon: 'Wind',
    feature: 'Вітер у волоссі'
  },
  {
    id: 'starlight',
    name: 'Зоряне небо Rolls-Style',
    description: '1400 оптоволоконних діодів з ефектом мерехтіння сузір\'їв у салоні',
    price: 3800,
    icon: 'Sparkles',
    feature: 'Сузір\'я на вибір'
  }
];

export const DOOR_OPTIONS = [
  {
    id: 'standard',
    name: 'Класичні двері',
    description: 'Надійні безрамкові двері з висувними сенсорними ручками та дотяжками',
    price: 0,
    icon: 'Square',
    angleName: 'Класичне відкривання'
  },
  {
    id: 'scissor',
    name: 'Ламбо-ножиці (Scissor)',
    description: 'Вертикальний підйом дверей угору на пневмодоводчиках під кутом 75°',
    price: 4900,
    icon: 'ChevronsUp',
    angleName: 'Підйом вгору (Lambo)'
  },
  {
    id: 'falcon',
    name: 'Крила сокола (Falcon Wings)',
    description: 'Двосекційні двері-крила з сенсорами перешкод, що піднімаються над дахом',
    price: 6500,
    icon: 'Feather',
    angleName: 'Крила чайки / сокола'
  },
  {
    id: 'sliding',
    name: 'Електро-зсувні двері (Sliding)',
    description: 'Автоматичні зсувні двері вздовж борту з сенсором відкриття ногою',
    price: 2400,
    icon: 'ArrowRightLeft',
    angleName: 'Зсувні двері'
  },
  {
    id: 'suicide',
    name: 'Каретні двері (Suicide Doors)',
    description: 'Задні двері відчиняються проти руху, забезпечуючи царську посадку',
    price: 5200,
    icon: 'Compass',
    angleName: 'Каретне відкриття'
  }
];

export const STEERING_WHEEL_OPTIONS = [
  {
    id: 'yoke',
    name: 'Штурвал Tesla Cyber Yoke',
    description: 'Футуристичний авіаційний штурвал без верхнього обода з вібро-відгуком',
    price: 1200,
    icon: 'Cpu',
    styleTag: 'Кіберпанк & Електро'
  },
  {
    id: 'msport',
    name: 'Спортивне BMW M з Alcantara',
    description: 'Анатомічний товстий хват, замша алькантара, карбонові пелюстки та червона риска',
    price: 1600,
    icon: 'Activity',
    styleTag: 'Motorsport Pro'
  },
  {
    id: 'classic_wood',
    name: 'Вінтажний полірований горіх',
    description: 'Класичне дерев\'яне кермо з триспицевим полірованим хромом для справжніх цінителів',
    price: 1400,
    icon: 'Gem',
    styleTag: 'Класика & Люкс'
  },
  {
    id: 'retro_bus',
    name: 'Ретро-кермо з великим ободом',
    description: 'Автентичне велике тонке біле кермо 70-х з фірмовою кнопкою клаксона',
    price: 900,
    icon: 'Disc',
    styleTag: 'Автентичний Bulli'
  },
  {
    id: 'f1_carbon',
    name: 'Формульний F1 штурвал',
    description: 'Справжній болідний руль з кольоровими LED-індикаторами передач та кнопками DRS',
    price: 2800,
    icon: 'Zap',
    styleTag: 'F1 Racing'
  }
];

export const TINT_OPTIONS = [
  {
    id: 'clear',
    name: 'Заводське скло (100% світла)',
    description: 'Повністю прозоре легке зеленувате скло без затемнення',
    opacity: 0.15,
    tintColor: 'rgba(255, 255, 255, 0.15)',
    price: 0,
    legal: '100% легально всюди'
  },
  {
    id: 'smoke50',
    name: 'Легке атермальне (50%)',
    description: 'Приємний димчастий відтінок, захищає очі та пластик від вигорання',
    opacity: 0.45,
    tintColor: 'rgba(30, 41, 59, 0.45)',
    price: 350,
    legal: 'Комфорт на щодень'
  },
  {
    id: 'smoke35',
    name: 'Євро-стандарт (35%)',
    description: 'Оптимальний баланс між приватністю в салоні та ідеальним оглядом вночі',
    opacity: 0.65,
    tintColor: 'rgba(15, 23, 42, 0.65)',
    price: 500,
    legal: 'Популярний вибір'
  },
  {
    id: 'dark5',
    name: 'Глухий Бункер (5% Limo)',
    description: 'Чорне як ніч скло, ззовні салон не проглядається взагалі',
    opacity: 0.88,
    tintColor: 'rgba(2, 6, 23, 0.88)',
    price: 750,
    legal: 'VIP Приватність'
  },
  {
    id: 'chameleon',
    name: 'Хамелеон Mystic Blue',
    description: 'Атермальна плівка з райдужним синьо-фіолетовим переливом на сонці',
    opacity: 0.55,
    tintColor: 'rgba(99, 102, 241, 0.55)',
    price: 950,
    legal: 'Стильний хамелеон'
  },
  {
    id: 'gold_mirror',
    name: 'Дзеркальне сонцезахисне',
    description: 'Бронзове металізоване напилення з відбиттям тепла та сторонніх очей',
    opacity: 0.6,
    tintColor: 'rgba(217, 119, 6, 0.55)',
    price: 850,
    legal: 'Преміум захист'
  }
];

export const PAINT_FINISHES = [
  { id: 'gloss', name: 'Глянцевий лак', desc: 'Глибоке дзеркальне сяйво', shine: 0.9 },
  { id: 'matte', name: 'Матовий сатин', desc: 'Оксамитовий фініш без бліків', shine: 0.2 },
  { id: 'metallic', name: 'Металік', desc: 'Сяючі алюмінієві мікрочасточки', shine: 0.7 },
  { id: 'chameleon', name: 'Хамелеон', desc: 'Градієнтне сяйво під кутом світла', shine: 0.85 }
];

export const POPULAR_COLORS = [
  { name: 'Ultra Red', hex: '#dc2626' },
  { name: 'Speed Yellow', hex: '#eab308' },
  { name: 'M Isle of Man Green', hex: '#059669' },
  { name: 'Tanzanite Royal Blue', hex: '#2563eb' },
  { name: 'Cyberpunk Purple', hex: '#9333ea' },
  { name: 'Bulli Turquoise', hex: '#06b6d4' },
  { name: 'Sunset Tangerine', hex: '#ea580c' },
  { name: 'Pearl Ghost White', hex: '#f8fafc' },
  { name: 'Stealth Onyx Black', hex: '#090d16' },
  { name: 'Nardo Gunmetal', hex: '#475569' },
  { name: 'Acid Neon Lime', hex: '#65a30d' },
  { name: 'Rose Gold Metallic', hex: '#f43f5e' }
];

export const UNDERGLOW_COLORS = [
  { id: 'none', name: 'Вимкнено', hex: 'transparent' },
  { id: 'cyan', name: 'Неоновий Кисень', hex: '#06b6d4' },
  { id: 'purple', name: 'Кібер Фіолет', hex: '#c026d3' },
  { id: 'green', name: 'Токсичний Зелений', hex: '#22c55e' },
  { id: 'red', name: 'Кривавий Дракон', hex: '#ef4444' },
  { id: 'gold', name: 'Золотий спалах', hex: '#eab308' }
];

export const BADGE_OPTIONS = [
  'ЗАПОРОЖЕЦЬ 968М',
  'ЗАЗ V4 МЕМЗ',
  'MADE IN ZAPORIZHZHIA',
  'ZEEKR 001 FR',
  'QUAD-MOTOR 1300HP',
  'SF90 ASSETTO FIORANO',
  'NISMO GT-R R35',
  'SHELBY GT500',
  'CHIRON 1600 HP',
  'AMG V8 BITURBO',
  'G 63 STRONGER THAN TIME',
  'M PERFORMANCE',
  'RS QUATTRO',
  'GT3 RS WEISSACH',
  'REVUELTO V12',
  'CYBERBEAST',
  'FOUNDATION SERIES',
  'PLAID AWD',
  'CAMPER SPECIAL',
  'LIMITED EDITION',
  'V8 POWER'
];

export const STEPS = [
  { id: 'model', label: 'Марка авто', num: 0 },
  { id: 'roof', label: 'Стеля', num: 1 },
  { id: 'doors', label: 'Двері', num: 2 },
  { id: 'wheel', label: 'Руль', num: 3 },
  { id: 'tint', label: 'Тонування', num: 4 },
  { id: 'color', label: 'Колір', num: 5 },
  { id: 'name', label: 'Назва авто', num: 6 }
];

export const INITIAL_CAR_STATE = {
  modelId: 'bmw',
  roofId: 'panoramic',
  doorId: 'standard',
  wheelId: 'msport',
  tintId: 'smoke35',
  colorHex: '#047857',
  colorFinish: 'metallic',
  secondaryColorHex: '#f8fafc',
  carName: 'Баварська Блискавка M4',
  licensePlate: 'AA 7777 MI',
  badge: 'M PERFORMANCE',
  underglowId: 'cyan',
  headlightsOn: true,
  doorsOpen: false,
  viewMode: 'photo' // 'photo' | '3d' | 'interior'
};
