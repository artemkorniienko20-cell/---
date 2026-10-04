/**
 * Vinnytsia Landmarks & Street Locations for Interactive Navigation
 */
export const VINNYTSIA_LANDMARKS = [
  { id: 'tower', x: 0, z: -18, name: 'Вежа Артинова (Європейська площа)', desc: 'Символ міста 1912 року з годинником' },
  { id: 'bridge', x: 0, z: 30, name: 'Центральний міст над Південним Бугом', desc: 'Двоярусний міст з арками' },
  { id: 'rosh_fountain', x: 22, z: 12, name: 'Фонтан Roshen (Набережна)', desc: 'Плавучий світломузичний фонтан' },
  { id: 'theater', x: -26, z: -15, name: 'Театр ім. Садовського (вул. Театральна)', desc: 'Класичний театр з колонадою' },
  { id: 'khmelnytske', x: -160, z: -50, name: 'Хмельницьке шосе (Західна магістраль)', desc: 'Швидкісний 4-смуговий проспект' },
  { id: 'pirogov', x: -110, z: -160, name: 'Вулиця Пирогова (Музей-садиба)', desc: 'Історична алея з віковими деревами' },
  { id: 'kotsyubynsky', x: 0, z: 140, name: 'Проспект Коцюбинського (Замостя)', desc: 'Головна вулиця Замостянського району' },
  { id: 'kyivska', x: 140, z: 55, name: 'Вулиця Київська (Північна Набережна)', desc: 'Набережна північного берега Бугу' },
  { id: 'city_hall', x: 24, z: -5, name: 'Вінницька міська рада (Мерія)', desc: 'Адміністративний центр міста' },
  { id: 'police_hq', x: 110, z: -35, name: 'ГУ Національної Поліції 102 (вул. Театральна, 10)', desc: 'Головне управління поліції та стоянка патрульних авто' },
  { id: 'gun_shop', x: 65, z: -35, name: 'Магазин Зброї «КАЛІБР» (вул. Театральна)', desc: 'Тактична амуніція, бронежилети, зброя та самооборона' },
  { id: 'dsns_station', x: -60, z: 80, name: 'Рятувальна частина ДСНС 101 (вул. Київська)', desc: 'Державна служба надзвичайних ситуацій та пожежна техніка' }
];

export const DEFAULT_AUTOPILOT_ROUTE = [
  { x: 0, z: -5, name: 'Вулиця Соборна' },
  { x: 0, z: 14, name: 'Під\'їзд до Центрального мосту' },
  { x: 0, z: 30, name: 'Центральний міст над Південним Бугом' },
  { x: 0, z: 55, name: 'Перехрестя Соборна / Київська' },
  { x: 60, z: 55, name: 'Вулиця Київська (Замостя)' },
  { x: 80, z: 30, name: 'Спуск до річки' },
  { x: 22, z: 12, name: 'Набережна «Рошен» (Фонтан)' },
  { x: 6, z: 12, name: 'Повернення до Центрального мосту' },
  { x: 0, z: -15, name: 'Вулиця Театральна' },
  { x: -26, z: -15, name: 'Театр ім. Садовського' },
  { x: 0, z: -18, name: 'Вінницька Вежа Артинова' }
];

export const VINNYTSIA_PRESET_ROUTES = [
  {
    id: 'city_tour',
    name: '🌟 Повна екскурсія Вінницею',
    waypoints: DEFAULT_AUTOPILOT_ROUTE
  },
  {
    id: 'khmelnytske_express',
    name: '⚡ Хмельницьке шосе (Швидкісний заїзд)',
    waypoints: [
      { x: 0, z: -15, name: 'Вулиця Соборна' },
      { x: -50, z: -50, name: 'Виїзд на Хмельницьке шосе' },
      { x: -180, z: -50, name: 'Хмельницьке шосе (Швидкість 120+)' },
      { x: -300, z: -50, name: 'Західне розворотне коло' },
      { x: -180, z: -50, name: 'Зворотний шлях до центру' },
      { x: 0, z: -18, name: 'Фініш: Вежа Артинова' }
    ]
  },
  {
    id: 'pirogov_park',
    name: '🌳 Вулиця Пирогова & Садиба',
    waypoints: [
      { x: 0, z: -18, name: 'Європейська площа' },
      { x: -30, z: -50, name: 'Поворот на вул. Пирогова' },
      { x: -80, z: -120, name: 'Вулиця Пирогова (Паркова зона)' },
      { x: -140, z: -200, name: 'Національний музей-садиба М.І. Пирогова' },
      { x: -80, z: -120, name: 'Повернення до Центру' },
      { x: 0, z: -5, name: 'Вулиця Соборна' }
    ]
  },
  {
    id: 'waterfront_bridges',
    name: '🌉 Набережні та Центральний міст',
    waypoints: [
      { x: 0, z: 14, name: 'Початок Центрального мосту' },
      { x: 0, z: 30, name: 'Центральний міст' },
      { x: 60, z: 55, name: 'Вулиця Київська' },
      { x: 120, z: 55, name: 'Північна Набережна Бугу' },
      { x: 60, z: 20, name: 'Рошен-плаза' },
      { x: 22, z: 12, name: 'Оглядовий майданчик Фонтану' },
      { x: 0, z: 14, name: 'Фініш: Набережна біля мосту' }
    ]
  }
];

/**
 * Zaporizhzhia Landmarks & Street Locations
 */
export const ZAPORIZHZHIA_LANDMARKS = [
  { id: 'dniprohes', x: -52, z: -20, name: 'ДніпроГЕС (Дніпровська ГЕС)', desc: 'Легендарна гребля з проїжджою частиною над Дніпром (1932)' },
  { id: 'khortytsia_sich', x: -85, z: 100, name: 'Запорозька Січ (Острів Хортиця)', desc: 'Козацька дерев\'яна фортеця, курені, вежі та церква Покрови' },
  { id: 'prospekt_soborny', x: 120, z: 0, name: 'Проспект Соборний (Головна артерія)', desc: 'Один з найдовших проспектів Європи (~11 км, 6 смуг)' },
  { id: 'preobrazhensky_bridge', x: -37.5, z: 50, name: 'Міст Преображенського', desc: 'Двоярусний залізобетонний арковий міст над Дніпром' },
  { id: 'festivalska', x: 155, z: -100, name: 'Площа Фестивальна (Центральний майдан)', desc: 'Фонтани, готель «Запоріжжя» та адміністрація' },
  { id: 'shevchenko_blvd', x: 85, z: 40, name: 'Бульвар Шевченка & Годинник Закоханих', desc: 'Міський романтичний бульвар із музичним годинником' },
  { id: 'dnipro_rocks', x: -165, z: 0, name: 'Гранітні скелі Дніпра (Пороги)', desc: 'Мальовничі скелі козацьких порогів над водою' },
  { id: 'powerhouse', x: -145, z: -20, name: 'Машинний зал ДніпроГЕС-1', desc: 'Гідроагрегати та високовольтні трансформатори' },
  { id: 'police_hq', x: 148, z: 25, name: 'ГУ Національної Поліції 102 (просп. Соборний)', desc: 'Головне управління поліції Запоріжжя та стоянка патрульних авто' },
  { id: 'gun_shop', x: 148, z: -75, name: 'Магазин Зброї «КАЛІБР» (просп. Соборний)', desc: 'Тактична амуніція, бронежилети, зброя та самооборона' },
  { id: 'dsns_station', x: 148, z: 90, name: '1-ша Рятувальна частина ДСНС 101 (просп. Соборний)', desc: 'Державна служба надзвичайних ситуацій та пожежна техніка' }
];

export const DEFAULT_ZAPORIZHZHIA_ROUTE = [
  { x: 120, z: -100, name: 'Площа Фестивальна' },
  { x: 120, z: -20, name: 'Проспект Соборний / Виїзд на ГЕС' },
  { x: 72.5, z: -20, name: 'Під\'їзд до ДніпроГЕС' },
  { x: -52, z: -20, name: 'Траса над греблею ДніпроГЕС' },
  { x: -130, z: -20, name: 'Правий берег Дніпра (Машинний зал)' },
  { x: -85, z: 55, name: 'З\'їзд на острів Хортиця' },
  { x: -85, z: 100, name: 'Запорозька Січ (Хортиця)' },
  { x: -37.5, z: 50, name: 'Міст Преображенського через Дніпро' },
  { x: 75, z: 40, name: 'Бульвар Шевченка' },
  { x: 85, z: 40, name: 'Годинник Закоханих' },
  { x: 120, z: 40, name: 'Повернення на проспект Соборний' },
  { x: 120, z: -100, name: 'Фініш: Площа Фестивальна' }
];

export const ZAPORIZHZHIA_PRESET_ROUTES = [
  {
    id: 'dniprohes_khortytsia_loop',
    name: '⚡ ДніпроГЕС ➔ Острів Хортиця ➔ Січ',
    waypoints: DEFAULT_ZAPORIZHZHIA_ROUTE
  },
  {
    id: 'soborny_sprint_300',
    name: '🚀 Проспект Соборний (Спринт 300+ км/год)',
    waypoints: [
      { x: 120, z: -320, name: 'Північний в\'їзд на просп. Соборний' },
      { x: 120, z: -200, name: 'Проспект Соборний (Розгін 200+)' },
      { x: 120, z: -100, name: 'Площа Фестивальна (300 км/год)' },
      { x: 120, z: 0, name: 'Центральна розв\'язка' },
      { x: 120, z: 100, name: 'Південна ділянка' },
      { x: 120, z: 320, name: 'Південне розворотне коло' },
      { x: 120, z: -100, name: 'Фініш: Фестивальна' }
    ]
  },
  {
    id: 'sich_cossack_trail',
    name: '🏰 Запорозька Січ та Скелі Хортиці',
    waypoints: [
      { x: -85, z: 55, name: 'В\'їзд на Хортицю з мосту' },
      { x: -85, z: 100, name: 'Брама Запорозької Січі' },
      { x: -85, z: 150, name: 'Південні плавні Хортиці' },
      { x: -120, z: 120, name: 'Гранітні скелі над Дніпром' },
      { x: -85, z: 100, name: 'Церква Покрови (Січ)' },
      { x: -37.5, z: 50, name: 'Міст Преображенського' }
    ]
  }
];

/**
 * Kyiv Landmarks & Street Locations for Interactive Navigation
 */
export const KYIV_LANDMARKS = [
  { id: 'maidan', x: 0, z: 0, name: 'Майдан Незалежності (Стела & Берегиня)', desc: 'Головна площа України зі Стелою Незалежності та фонтанами' },
  { id: 'khreshchatyk', x: 0, z: 60, name: 'Вулиця Хрещатик (ЦУМ & КМДА)', desc: 'Легендарний 6-смуговий бульвар з каштанами' },
  { id: 'european_sq', x: 0, z: -160, name: 'Європейська площа (Український дім)', desc: 'Площа на початку Хрещатика біля Філармонії' },
  { id: 'glass_bridge', x: 25, z: -215, name: 'Скляний міст (Пішохідний міст Кличка)', desc: 'Панорамний міст над Володимирським узвозом' },
  { id: 'poshtova_sq', x: 85, z: -320, name: 'Поштова площа & Річковий вокзал', desc: 'Історичний Поділ на березі Дніпра' },
  { id: 'dnipro_highway', x: 100, z: -40, name: 'Набережно-Хрещатицька магістраль', desc: 'Швидкісна 4-смугова траса вздовж річки Дніпро' },
  { id: 'park_bridge', x: 175, z: -20, name: 'Парковий міст на Труханів острів', desc: 'Вантовий пішохідний міст через Дніпро' },
  { id: 'golden_gate', x: -90, z: 40, name: 'Золоті Ворота (Ярослав Мудрий)', desc: 'Пам\'ятка оборонної архітектури Київської Русі 1037 року' },
  { id: 'sophia_square', x: -90, z: -60, name: 'Софійська площа & Дзвіниця Софії', desc: 'Барокова дзвіниця та пам\'ятник Богдану Хмельницькому' },
  { id: 'bessarabka', x: 0, z: 180, name: 'Бессарабська площа (Бессарабський ринок)', desc: 'Південний край Хрещатика з історичним ринком' },
  { id: 'motherland', x: 85, z: 260, name: 'Монумент «Батьківщина-Мати» (Тризуб)', desc: 'Велична сталева скульптура з українським Тризубом на щиті' },
  { id: 'police_hq', x: -65, z: -90, name: 'ГУ Національної Поліції Києва (вул. Володимирська)', desc: 'Головне управління столичної поліції та патрульні авто' },
  { id: 'gun_shop', x: -28, z: 85, name: 'Магазин Зброї «ЗБРОЯ КИЇВ» (вул. Хрещатик)', desc: 'Тактична амуніція, бронежилети та спецзасоби' },
  { id: 'dsns_station', x: 75, z: -220, name: '1-ша Рятувальна частина ДСНС Києва (Поділ)', desc: 'Державна служба надзвичайних ситуацій столиці' }
];

export const DEFAULT_KYIV_ROUTE = [
  { x: 0, z: 0, name: 'Майдан Незалежності' },
  { x: 0, z: -80, name: 'Хрещатик (Північний напрямок)' },
  { x: 0, z: -160, name: 'Європейська площа' },
  { x: 25, z: -215, name: 'Володимирський узвіз (під Скляним мостом)' },
  { x: 85, z: -320, name: 'Поштова площа & Річковий вокзал' },
  { x: 100, z: -250, name: 'Виїзд на Набережно-Хрещатицьку' },
  { x: 100, z: -40, name: 'Набережна Дніпра (Краєвид на Труханів)' },
  { x: 100, z: 120, name: 'Набережна (Швидкісний відрізок)' },
  { x: 50, z: 180, name: 'Поворот до Бессарабки' },
  { x: 0, z: 180, name: 'Бессарабська площа' },
  { x: 0, z: 60, name: 'Хрещатик (ЦУМ & КМДА)' },
  { x: 0, z: 0, name: 'Фініш: Майдан Незалежності' }
];

export const KYIV_PRESET_ROUTES = [
  {
    id: 'kyiv_grand_tour',
    name: '🌟 Гранд Тур Столицею (Хрещатик • Майдан • Поділ)',
    waypoints: DEFAULT_KYIV_ROUTE
  },
  {
    id: 'dnipro_embankment_sprint',
    name: '⚡ Спринт по Набережній Дніпра (200+ км/год)',
    waypoints: [
      { x: 100, z: -360, name: 'Початок Набережної (Поділ)' },
      { x: 100, z: -200, name: 'Набережна (Розгін 150+)' },
      { x: 100, z: -40, name: 'Навпроти Труханового острова (200+)' },
      { x: 100, z: 100, name: 'Набережна Дніпра (Максимальна швидкість)' },
      { x: 100, z: 260, name: 'Краєвид на Батьківщину-Мати' },
      { x: 85, z: 260, name: 'Підйом на Печерські пагорби' },
      { x: 50, z: 180, name: 'Бессарабська площа' },
      { x: 0, z: 0, name: 'Фініш: Майдан' }
    ]
  },
  {
    id: 'historic_kyiv_princes',
    name: '👑 Княжий Київ: Золоті Ворота & Софія',
    waypoints: [
      { x: 0, z: 0, name: 'Майдан Незалежності' },
      { x: 0, z: 40, name: 'Хрещатик / Б. Хмельницького' },
      { x: -45, z: 40, name: 'Вулиця Богдана Хмельницького' },
      { x: -90, z: 40, name: 'Золоті Ворота (Ярослав Мудрий)' },
      { x: -90, z: -10, name: 'Вулиця Володимирська' },
      { x: -90, z: -60, name: 'Софійська площа (Дзвіниця & Хмельницький)' },
      { x: -45, z: -60, name: 'Вулиця Михайлівська' },
      { x: 0, z: 0, name: 'Фініш: Майдан Незалежності' }
    ]
  }
];

/**
 * Frontline Landmarks & Routes (Зона бойових дій • Тільки ЗСУ)
 */
export const FRONTLINE_LANDMARKS = [
  { id: 'zsu_hq', x: -35, z: 110, name: 'Командний штаб ЗСУ «Скеля»', desc: 'Укріплений бункер командування передової' },
  { id: 'frontline_trenches', x: 0, z: 20, name: 'Головна лінія оборони ЗСУ', desc: 'Мережа траншей, мішки з піском та вогневі позиції' },
  { id: 'gray_zone', x: 0, z: -30, name: 'Сіра зона (Мінні поля & вирви)', desc: 'Нічийна земля, розбита артилерією техніка ворога' },
  { id: 'enemy_front', x: 0, z: -100, name: 'Ворожі рубежі (Позиції окупантів)', desc: 'Опорні пункти та ДОТи армії РФ' },
  { id: 'moscow_highway_gate', x: 0, z: -200, name: 'Прорив кордону • Траса на Москву', desc: 'Прикордонний КПП та прямий шлях у напрямку Москви' },
  { id: 'evac_point', x: 0, z: 160, name: 'Пункт ротації • Евакуація в Київ', desc: 'Тиловий пункт зв\'язку та повернення до столиці' }
];

export const DEFAULT_FRONTLINE_ROUTE = [
  { x: 0, z: 140, name: 'Тилова база постачання ЗСУ' },
  { x: 0, z: 70, name: 'Передовий редут ЗСУ' },
  { x: 0, z: 0, name: 'Лінія зіткнення' },
  { x: 0, z: -60, name: 'Сіра зона' },
  { x: 0, z: -130, name: 'Рубіж окупантів' },
  { x: 0, z: -200, name: 'Прорив кордону на Москву' }
];

export const FRONTLINE_PRESET_ROUTES = [
  {
    id: 'frontline_offensive',
    name: '⚔️ Прорив рубежів: Від штабу ЗСУ до кордону',
    waypoints: DEFAULT_FRONTLINE_ROUTE
  }
];

/**
 * Moscow Landmarks & Routes (Локація «Москва» • ДПС & Київський вокзал)
 */
export const MOSCOW_LANDMARKS = [
  { id: 'red_square', x: 0, z: 0, name: 'Красна площа (Бруківка)', desc: 'Центральна площа біля кремлівських стін' },
  { id: 'spasskaya_tower', x: 0, z: 45, name: 'Спаська вежа з курантами', desc: 'Головна кремлівська вежа з годинником' },
  { id: 'st_basil', x: 45, z: -20, name: 'Собор Василя Блаженного', desc: 'Храм з різнокольоровими куполами-цибулинами' },
  { id: 'moscow_city', x: 120, z: -40, name: 'Діловий квартал «Москва-Сіті»', desc: 'Скляні гігантські хмарочоси: Федерація, Еволюція, Меркурій' },
  { id: 'dps_post', x: 35, z: 35, name: 'Головний Пост ДПС (Робота)', desc: 'Стакан інспектора ДПС, службове авто та регулювання руху' },
  { id: 'kyiv_station', x: -65, z: -98, name: 'Київський вокзал (Повернення в Київ)', desc: 'Евакуаційний пункт та квиток назад в Україну' }
];

export const DEFAULT_MOSCOW_ROUTE = [
  { x: 0, z: 10, name: 'Красна площа' },
  { x: 35, z: 35, name: 'Пост ДПС' },
  { x: 100, z: 0, name: 'Проспект до Москва-Сіті' },
  { x: 120, z: -40, name: 'Вежі Москва-Сіті' },
  { x: 0, z: -80, name: 'Садове кільце' },
  { x: -65, z: -98, name: 'Київський вокзал (Назад у Київ)' },
  { x: 0, z: 0, name: 'Фініш: Красна площа' }
];

export const MOSCOW_PRESET_ROUTES = [
  {
    id: 'moscow_patrol',
    name: '🚨 Патрульний рейд ДПС столицею',
    waypoints: DEFAULT_MOSCOW_ROUTE
  }
];

/**
 * Tokmak Landmarks & Routes (Місто Токмак • Запорізька область)
 */
export const TOKMAK_LANDMARKS = [
  { id: 'stela_tokmak', x: -180, z: 16, name: 'В\'їзна стела «ТОКМАК»', desc: 'Монументальний в\'їзд у місто з українським прапором' },
  { id: 'bridge_tokmachka', x: -60, z: 0, name: 'Міст через р. Токмачка', desc: 'Автомобільний міст над степовою річкою' },
  { id: 'city_hall_tokmak', x: 60, z: 60, name: 'Центральна площа & Мерія', desc: 'Адміністративний центр міста Токмак' },
  { id: 'station_tokmak', x: 140, z: -120, name: 'Вокзал «Великий Токмак»', desc: 'Залізничний вокзал, перон та потяги' },
  { id: 'diesel_factory', x: -140, z: -150, name: 'Токмацький Дизельмаш', desc: 'Машинобудівний завод «Південдизельмаш»' },
  { id: 'grain_elevator', x: 160, z: 120, name: 'Токмацький Елеватор', desc: 'Зерновий комплекс з високими силосами' },
  { id: 'solar_farm', x: -150, z: 130, name: 'СЕС «Tokmak Solar Energy»', desc: 'Сонячна електростанція півдня України' }
];

export const DEFAULT_TOKMAK_ROUTE = [
  { x: -180, z: 0, name: 'В\'їзна стела Токмак' },
  { x: -60, z: 0, name: 'Міст через р. Токмачка' },
  { x: 0, z: 0, name: 'Головна траса Р37' },
  { x: 60, z: 0, name: 'Перехрестя Шевченка' },
  { x: 60, z: 60, name: 'Міська рада Токмака' },
  { x: 140, z: -100, name: 'Вокзал Великий Токмак' },
  { x: 160, z: 120, name: 'Токмацький Елеватор' },
  { x: 0, z: 0, name: 'Фініш: Траса' }
];

export const TOKMAK_PRESET_ROUTES = [
  {
    id: 'tokmak_tour',
    name: '🌻 Степовий експрес: Вокзал • Дизельмаш • СЕС Токмак',
    waypoints: DEFAULT_TOKMAK_ROUTE
  }
];


/**
 * Vehicle dynamics, collision crash & destruction physics simulation
 */
export class DrivePhysics {
  constructor(modelId = 'bmw') {
    this.modelId = modelId;
    this.isAutopilot = false;
    this.activeRoute = [...DEFAULT_AUTOPILOT_ROUTE];
    this.currentWaypointIdx = 0;
    this.routeCompleted = false;
    this.reset();
  }

  reset() {
    this.x = 0;
    this.z = 25; // Start near bridge entrance
    this.yaw = 0;
    this.speed = 0;
    this.steeringAngle = 0;
    this.gear = 1;
    this.rpm = 1000;
    this.isDrifting = false;
    this.driftScore = 0;
    this.health = 100;
    this.damageLevel = 0;
    this.lastCrash = null;
    this.isAutopilot = false;
    this.currentWaypointIdx = 0;
    this.routeCompleted = false;
    this.speedLimitKmh = null; // Speed limiter: 50, 100, 200, 300, or null (unlimited)

    // Destruction state
    this.destruction = {
      bumperDetached: false,
      hoodPopped: false,
      windshieldShattered: false,
      wheelMisaligned: false,
      isSmoking: false,
      isFire: false,
      isWrecked: false,
      justWrecked: false
    };

    // Performance profiles
    if (this.modelId === 'cybertruck') {
      this.maxSpeed = 85;
      this.acceleration = 48; // Cyberbeast 2.6s
      this.braking = 54;
      this.handling = 1.45;
    } else if (this.modelId === 'tesla') {
      this.maxSpeed = 90;
      this.acceleration = 50; // Plaid 1.99s
      this.braking = 55;
      this.handling = 1.6;
    } else if (this.modelId === 'lambo') {
      this.maxSpeed = 100;
      this.acceleration = 52; // Revuelto V12 1015hp 2.5s
      this.braking = 62;
      this.handling = 1.82;
    } else if (this.modelId === 'porsche') {
      this.maxSpeed = 92;
      this.acceleration = 48; // GT3 RS 3.2s with DRS
      this.braking = 64;
      this.handling = 1.92;
    } else if (this.modelId === 'audi_rs6') {
      this.maxSpeed = 88;
      this.acceleration = 46; // RS6 630hp Quattro 3.4s
      this.braking = 56;
      this.handling = 1.70;
    } else if (this.modelId === 'gwagon') {
      this.maxSpeed = 75;
      this.acceleration = 38; // G 63 585hp V8 Biturbo 4.5s
      this.braking = 46;
      this.handling = 1.30;
    } else if (this.modelId === 'bugatti') {
      this.maxSpeed = 120; // Chiron 1600hp 440 km/h
      this.acceleration = 58; // 2.4s
      this.braking = 65;
      this.handling = 1.76;
    } else if (this.modelId === 'ferrari') {
      this.maxSpeed = 98; // SF90 1000hp 340 km/h
      this.acceleration = 54; // 2.5s
      this.braking = 62;
      this.handling = 1.90;
    } else if (this.modelId === 'gtr') {
      this.maxSpeed = 94; // Nismo GT-R 600hp 330 km/h
      this.acceleration = 50; // 2.7s
      this.braking = 60;
      this.handling = 1.84;
    } else if (this.modelId === 'mustang') {
      this.maxSpeed = 84; // Shelby GT500 760hp 290 km/h
      this.acceleration = 45; // 3.3s
      this.braking = 52;
      this.handling = 1.48;
    } else if (this.modelId === 'zeekr') {
      this.maxSpeed = 82; // Zeekr 001 FR 1300hp 280 km/h
      this.acceleration = 56; // 2.07s Quad-Motor instantaneous electric torque
      this.braking = 64; // 10-piston Brembo carbon ceramics
      this.handling = 1.86; // Quad-motor torque vectoring
    } else if (this.modelId === 'zaporozhets') {
      this.maxSpeed = 42; // ЗАЗ-968М ~120-130 км/год
      this.acceleration = 24; // МеМЗ-968 V4 повітряного охолодження 45 к.с.
      this.braking = 38;
      this.handling = 1.65; // легке шасі (800 кг) та задньомоторне компонування
    } else if (this.modelId === 'supercar') {
      this.maxSpeed = 95;
      this.acceleration = 44;
      this.braking = 60;
      this.handling = 1.8;
    } else if (this.modelId === 'bus') {
      this.maxSpeed = 50;
      this.acceleration = 18;
      this.braking = 32;
      this.handling = 1.1;
    } else {
      this.maxSpeed = 82;
      this.acceleration = 40; // BMW M4 530hp
      this.braking = 50;
      this.handling = 1.55;
    }
  }

  repair() {
    this.health = 100;
    this.damageLevel = 0;
    this.lastCrash = null;
    this.destruction = {
      bumperDetached: false,
      hoodPopped: false,
      windshieldShattered: false,
      wheelMisaligned: false,
      isSmoking: false,
      isFire: false,
      isWrecked: false,
      justWrecked: false
    };
  }

  // Apply collision force & damage from NPC traffic bots or external impacts
  applyImpact(force = 15, objectName = 'Авто трафіку') {
    const damagePoints = Math.round(force * 0.75);
    this.health = Math.max(0, this.health - damagePoints);
    this.damageLevel = Math.min(1.0, (100 - this.health) / 100);
    this.speed = this.speed * 0.4;

    if (force > 12 || this.health < 75) {
      this.destruction.hoodPopped = true;
    }
    if (force > 22 || this.health < 45) {
      this.destruction.bumperDetached = true;
      this.destruction.windshieldShattered = true;
    }
    if (this.health <= 0) {
      this.destruction.isWrecked = true;
      this.destruction.isFire = true;
      this.destruction.isSmoking = true;
    }
    this.lastCrash = {
      x: this.x,
      z: this.z,
      force: Math.round(force),
      objectName,
      health: this.health,
      isTotalWreck: this.destruction.isWrecked
    };
  }

  // Teleport vehicle to starting spawn point of selected city
  resetPosition(x = 0, z = 0, yaw = 0) {
    this.x = x;
    this.z = z;
    this.yaw = yaw;
    this.speed = 0;
    this.steeringAngle = 0;
    this.isDrifting = false;
    this.lastCrash = null;
    this.routeCompleted = false;
  }

  // Set custom plotted route
  setRoute(waypoints) {
    if (waypoints && waypoints.length > 0) {
      this.activeRoute = waypoints.map((w, idx) => ({
        x: w.x,
        z: w.z,
        name: w.name || `Точка ${idx + 1}`
      }));
      this.currentWaypointIdx = 0;
      this.routeCompleted = false;
    }
  }

  // Add individual waypoint to active route
  addWaypoint(wp) {
    this.activeRoute.push({
      x: wp.x,
      z: wp.z,
      name: wp.name || `Точка ${this.activeRoute.length + 1}`
    });
    this.routeCompleted = false;
  }

  // Clear plotted route
  clearRoute() {
    this.activeRoute = [];
    this.currentWaypointIdx = 0;
    this.routeCompleted = false;
  }

  // Set maximum speed limit in km/h (50, 100, 200, 300, or null for unlimited)
  setSpeedLimit(kmh) {
    this.speedLimitKmh = kmh ? Number(kmh) : null;
  }

  toggleAutopilot() {
    this.isAutopilot = !this.isAutopilot;
    if (this.isAutopilot) {
      this.routeCompleted = false;
      // If no route, set default
      if (this.activeRoute.length === 0) {
        this.activeRoute = [...DEFAULT_AUTOPILOT_ROUTE];
      }
      // Find closest waypoint on route
      let closestIdx = 0;
      let closestDist = Infinity;
      for (let i = 0; i < this.activeRoute.length; i++) {
        const wp = this.activeRoute[i];
        const d = Math.hypot(wp.x - this.x, wp.z - this.z);
        if (d < closestDist) {
          closestDist = d;
          closestIdx = i;
        }
      }
      this.currentWaypointIdx = closestIdx;
    }
    return this.isAutopilot;
  }

  update(inputs, dt, colliders = []) {
    let { throttle, brake, steerLeft, steerRight, handbrake } = inputs;
    this.lastCrash = null;
    this.destruction.justWrecked = false;

    // If vehicle is completely destroyed / total wreck
    if (this.destruction.isWrecked) {
      throttle = false;
      this.speed *= Math.max(0, 1 - 2.5 * dt);
      if (Math.abs(this.speed) < 0.1) this.speed = 0;
    }

    // Tesla Autopilot Autonomous Navigation along plotted route
    if (this.isAutopilot && this.activeRoute.length > 0 && !this.destruction.isWrecked) {
      if (this.routeCompleted) {
        // Smooth stop at final destination
        throttle = false;
        brake = true;
      } else {
        const wp = this.activeRoute[this.currentWaypointIdx];
        if (wp) {
          const dx = wp.x - this.x;
          const dz = wp.z - this.z;
          const dist = Math.hypot(dx, dz);

          // Checkpoint reached
          if (dist < 6.5) {
            if (this.currentWaypointIdx >= this.activeRoute.length - 1) {
              // Final destination reached
              this.routeCompleted = true;
            } else {
              this.currentWaypointIdx++;
            }
          }

          const targetYaw = Math.atan2(dx, dz);
          let angleDiff = targetYaw - this.yaw;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

          // Autopilot steering
          const autoSteer = Math.max(-0.55, Math.min(0.55, angleDiff * 1.8));
          if (autoSteer > 0.05) {
            steerLeft = true;
            steerRight = false;
          } else if (autoSteer < -0.05) {
            steerLeft = false;
            steerRight = true;
          } else {
            steerLeft = false;
            steerRight = false;
          }

          // Speed regulation based on turn angle & speed limit
          let targetSpeed = Math.abs(angleDiff) > 0.35 ? 10 : 16.5; // ~36 to ~60 km/h
          if (this.speedLimitKmh) {
            targetSpeed = Math.min(targetSpeed, this.speedLimitKmh / 3.6);
          }

          if (this.speed < targetSpeed) {
            throttle = true;
            brake = false;
          } else if (this.speed > targetSpeed + 2) {
            throttle = false;
            brake = true;
          } else {
            throttle = false;
            brake = false;
          }
        }
      }
    }

    // 1. Steering Input
    const targetSteer = (steerLeft ? 1 : 0) - (steerRight ? 1 : 0);
    const steerSpeed = 4.5;
    this.steeringAngle += (targetSteer * 0.55 - this.steeringAngle) * steerSpeed * dt;

    // Performance degradation from damage
    const healthFactor = Math.max(0.2, this.health / 100);

    // Calculate effective maximum speed limit (50, 100, 200, 300, or car's native maxSpeed)
    const baseLimit = this.speedLimitKmh ? (this.speedLimitKmh / 3.6) : this.maxSpeed;
    const effectiveMaxSpeed = Math.min(baseLimit, this.maxSpeed);

    // 2. Throttle & Acceleration
    if (throttle && this.health > 0 && !this.destruction.isWrecked) {
      if (this.speed < effectiveMaxSpeed * healthFactor) {
        this.speed += this.acceleration * healthFactor * dt;
        if (this.speed > effectiveMaxSpeed * healthFactor) {
          this.speed = effectiveMaxSpeed * healthFactor;
        }
      } else if (this.speed > effectiveMaxSpeed * healthFactor + 0.5) {
        // Smoothly bring down to limit
        this.speed -= this.braking * 0.7 * dt;
      }
    } else if (brake) {
      if (handbrake) {
        // Handbrake / Parking brake active: halt vehicle and never reverse
        this.speed *= Math.max(0, 1 - 15.0 * dt);
        if (Math.abs(this.speed) < 0.1) this.speed = 0;
      } else if (this.speed > 0.5) {
        this.speed -= this.braking * dt;
      } else if (this.speed > -20) {
        this.speed -= this.acceleration * 0.5 * dt;
      }
    } else {
      if (this.speedLimitKmh && this.speed > (this.speedLimitKmh / 3.6) + 0.5) {
        this.speed = Math.max(this.speedLimitKmh / 3.6, this.speed - this.braking * 0.5 * dt);
      } else {
        this.speed *= Math.max(0, 1 - 1.2 * dt);
      }
      if (Math.abs(this.speed) < 0.1) this.speed = 0;
    }

    // 3. Handbrake / Drift Factor
    const isTurningHard = Math.abs(this.steeringAngle) > 0.28 && Math.abs(this.speed) > 14;
    this.isDrifting = (handbrake || isTurningHard) && Math.abs(this.speed) > 8;

    const driftSlip = this.isDrifting ? 1.75 : 1.0;
    if (this.isDrifting) {
      this.driftScore += Math.round(Math.abs(this.speed) * 0.4);
    }

    // 4. Heading & Movement
    const turnRate = (this.speed / 4.2) * Math.tan(this.steeringAngle) * this.handling * driftSlip;
    this.yaw += turnRate * dt;

    let vx = Math.sin(this.yaw) * this.speed;
    let vz = Math.cos(this.yaw) * this.speed;

    let nextX = this.x + vx * dt;
    let nextZ = this.z + vz * dt;

    // 5. CRASH & COLLISION DESTRUCTION PHYSICS (Continuous Sliding & Restitution)
    const carRadius = 1.25;
    let hasCollided = false;
    let impactForce = 0;
    let crashObjectName = '';

    for (let c of colliders) {
      if (c.type === 'circle') {
        const dx = nextX - c.x;
        const dz = nextZ - c.z;
        const dist = Math.hypot(dx, dz);
        const minDist = c.radius + carRadius;

        if (dist < minDist) {
          hasCollided = true;
          crashObjectName = c.name || 'Об\'єкт';

          const nx = dist > 0.0001 ? dx / dist : 1;
          const nz = dist > 0.0001 ? dz / dist : 0;
          const overlap = minDist - dist;

          nextX += nx * (overlap + 0.02);
          nextZ += nz * (overlap + 0.02);

          const vn = vx * nx + vz * nz;
          if (vn < 0) {
            impactForce = Math.max(impactForce, Math.abs(vn) * 3.6);
            const tangentX = vx - vn * nx;
            const tangentZ = vz - vn * nz;
            const bounce = 0.22;
            const friction = 0.85;
            vx = tangentX * friction - nx * vn * bounce;
            vz = tangentZ * friction - nz * vn * bounce;

            const headingX = Math.sin(this.yaw);
            const headingZ = Math.cos(this.yaw);
            this.speed = vx * headingX + vz * headingZ;
          }
        }
      } else if (c.type === 'box') {
        const halfW = c.width / 2;
        const halfD = c.depth / 2;

        // Find closest point on box to car center
        const closestX = Math.max(c.x - halfW, Math.min(c.x + halfW, nextX));
        const closestZ = Math.max(c.z - halfD, Math.min(c.z + halfD, nextZ));

        const dx = nextX - closestX;
        const dz = nextZ - closestZ;
        const distSq = dx * dx + dz * dz;

        if (distSq < carRadius * carRadius) {
          hasCollided = true;
          crashObjectName = c.name || 'Огородження';

          let nx = 0;
          let nz = 0;
          let pushDist = 0;

          if (distSq > 0.00001) {
            const dist = Math.sqrt(distSq);
            nx = dx / dist;
            nz = dz / dist;
            pushDist = (carRadius - dist) + 0.03;
          } else {
            // Circle center is strictly inside the box: find closest edge to push out
            const leftDist = nextX - (c.x - halfW);
            const rightDist = (c.x + halfW) - nextX;
            const bottomDist = nextZ - (c.z - halfD);
            const topDist = (c.z + halfD) - nextZ;
            const minDist = Math.min(leftDist, rightDist, bottomDist, topDist);

            if (minDist === leftDist) { nx = -1; nz = 0; pushDist = carRadius + leftDist + 0.03; }
            else if (minDist === rightDist) { nx = 1; nz = 0; pushDist = carRadius + rightDist + 0.03; }
            else if (minDist === bottomDist) { nx = 0; nz = -1; pushDist = carRadius + bottomDist + 0.03; }
            else { nx = 0; nz = 1; pushDist = carRadius + topDist + 0.03; }
          }

          nextX += nx * pushDist;
          nextZ += nz * pushDist;

          const vn = vx * nx + vz * nz;
          if (vn < 0) {
            impactForce = Math.max(impactForce, Math.abs(vn) * 3.6);
            // Sliding along wall/divider: smoothly glide along tangent without jittering
            const tangentX = vx - vn * nx;
            const tangentZ = vz - vn * nz;
            const bounce = 0.18;
            const friction = 0.88;
            vx = tangentX * friction - nx * vn * bounce;
            vz = tangentZ * friction - nz * vn * bounce;

            const headingX = Math.sin(this.yaw);
            const headingZ = Math.cos(this.yaw);
            this.speed = vx * headingX + vz * headingZ;
          }
        }
      }
    }

    this.x = nextX;
    this.z = nextZ;

    // Apply Damage and Physical Destruction States
    if (hasCollided && impactForce > 6) {
      const damagePoints = Math.round(impactForce * 0.7);
      this.health = Math.max(0, this.health - damagePoints);
      this.damageLevel = Math.min(1.0, (100 - this.health) / 100);

      // Destruction thresholds
      if (impactForce > 12 || this.health < 75) {
        this.destruction.hoodPopped = true;
      }
      if (impactForce > 22 || this.health < 45) {
        this.destruction.bumperDetached = true;
        this.destruction.windshieldShattered = true;
        this.destruction.wheelMisaligned = true;
      }
      if (this.health < 40) {
        this.destruction.isSmoking = true;
      }
      if (this.health <= 0) {
        if (!this.destruction.isWrecked) {
          this.destruction.justWrecked = true;
        }
        this.destruction.isWrecked = true;
        this.destruction.isFire = true;
        this.destruction.isSmoking = true;
      }

      this.lastCrash = {
        x: this.x,
        z: this.z,
        force: Math.round(impactForce),
        objectName: crashObjectName,
        health: this.health,
        isTotalWreck: this.destruction.isWrecked
      };
    }

    // 6. Gear & RPM Calculation
    const kmh = Math.abs(this.speed) * 3.6;
    if (this.modelId === 'tesla' || this.modelId === 'cybertruck' || this.modelId === 'zeekr') {
      this.gear = this.speed >= 0 ? 'D' : 'R';
      this.rpm = Math.min(18000, 1000 + kmh * 75);
    } else if (this.modelId === 'zaporozhets') {
      if (this.speed < -0.5) {
        this.gear = 'R';
        this.rpm = 900 + kmh * 120;
      } else {
        // 4-speed manual gearbox (1: 0-25, 2: 25-50, 3: 50-80, 4: 80+)
        const gearSpeeds = [0, 25, 50, 80, 140];
        let g = 1;
        for (let i = 1; i < gearSpeeds.length - 1; i++) {
          if (kmh > gearSpeeds[i]) g = i + 1;
        }
        this.gear = g;
        const prevGearSpeed = gearSpeeds[g - 1];
        const nextGearSpeed = gearSpeeds[g];
        const gearProgress = Math.min(1, Math.max(0, (kmh - prevGearSpeed) / (nextGearSpeed - prevGearSpeed)));
        this.rpm = Math.round(1000 + gearProgress * 3600); // 1000 to 4600 RPM
      }
    } else {
      if (this.speed < -0.5) {
        this.gear = 'R';
        this.rpm = 1000 + kmh * 150;
      } else {
        const gearSpeeds = [0, 45, 85, 130, 180, 230, 320];
        let g = 1;
        for (let i = 1; i < gearSpeeds.length - 1; i++) {
          if (kmh > gearSpeeds[i]) {
            g = i + 1;
          }
        }
        this.gear = g;
        const prevGearSpeed = gearSpeeds[g - 1];
        const nextGearSpeed = gearSpeeds[g];
        const gearProgress = Math.min(1, Math.max(0, (kmh - prevGearSpeed) / (nextGearSpeed - prevGearSpeed)));
        this.rpm = Math.round(1800 + gearProgress * 5500);
      }
    }

    return {
      x: this.x,
      z: this.z,
      yaw: this.yaw,
      speedKmh: Math.round(kmh),
      steeringAngle: this.steeringAngle,
      gear: this.gear,
      rpm: this.rpm,
      isDrifting: this.isDrifting,
      driftScore: this.driftScore,
      health: this.health,
      damageLevel: this.damageLevel,
      lastCrash: this.lastCrash,
      destruction: this.destruction,
      isAutopilot: this.isAutopilot,
      autopilotTarget: this.activeRoute[this.currentWaypointIdx],
      autopilotIdx: this.currentWaypointIdx,
      autopilotRoute: this.activeRoute,
      routeCompleted: this.routeCompleted,
      speedLimitKmh: this.speedLimitKmh
    };
  }
}
