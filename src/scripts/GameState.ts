export type Language = 'en' | 'hi';
export type GraphicsQuality = 'LOW' | 'MEDIUM' | 'HIGH';
export type ScreenState = 'HOME' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'CHARACTERS' | 'MISSIONS' | 'SHOP' | 'SETTINGS' | 'BUILD_APK';

export type PowerUpType = 'MAGNET' | 'SHIELD' | 'DOUBLE_SCORE' | 'SPEED_BOOST' | 'COIN_MULTIPLIER';

export type EnvironmentSectionId = 1 | 2 | 3 | 4 | 5 | 6;

export interface EnvironmentSection {
  id: EnvironmentSectionId;
  nameEn: string;
  nameHi: string;
  subtitleEn: string;
  subtitleHi: string;
  skyColor: string;
  fogColor: string;
  groundColor: string;
  roadColor: string;
  accentColor: string;
}

export interface Mission {
  id: string;
  titleEn: string;
  titleHi: string;
  target: number;
  current: number;
  rewardCoins: number;
  rewardMultiplier: number;
  completed: boolean;
  claimed: boolean;
  type: 'COINS' | 'DISTANCE' | 'POWERUPS' | 'JUMPS' | 'GAMES' | 'NEAR_MISS';
}

export interface ShopItem {
  id: string;
  category: 'SHIRT' | 'SHOES' | 'TRAIL' | 'UPGRADE';
  nameEn: string;
  nameHi: string;
  descEn: string;
  descHi: string;
  price: number;
  owned: boolean;
  equipped: boolean;
  colorHex?: string;
  secondaryHex?: string;
  upgradeLevel?: number;
  maxLevel?: number;
}

export interface CharacterSlot {
  id: string;
  nameEn: string;
  nameHi: string;
  titleEn: string;
  titleHi: string;
  unlocked: boolean;
  comingSoon?: boolean;
  stats: {
    speed: number;
    jump: number;
    luck: number;
  };
  shirtColor: string;
  pantsColor: string;
}

export interface GameSettings {
  sound: boolean;
  music: boolean;
  vibration: boolean;
  graphics: GraphicsQuality;
  language: Language;
  onScreenControls: boolean;
}

export interface PlayerSaveData {
  coins: number;
  bestScore: number;
  bestDistance: number;
  totalGamesPlayed: number;
  totalCoinsCollected: number;
  totalJumps: number;
  totalPowerUps: number;
  baseMultiplier: number;
  selectedCharacter: string;
  equippedShirtColor: string;
  equippedShoesColor: string;
  equippedTrailColor: string;
  powerUpDurationBonus: number; // seconds added
  missions: Mission[];
  shopItems: ShopItem[];
  settings: GameSettings;
}

export const ENVIRONMENT_SECTIONS: EnvironmentSection[] = [
  {
    id: 1,
    nameEn: 'Village Road',
    nameHi: 'गाँव की सड़क',
    subtitleEn: 'Lush green fields, banyan trees & mud-brick huts',
    subtitleHi: 'हरे-भरे खेत, बरगद के पेड़ और मिट्टी के घर',
    skyColor: '#38BDF8',
    fogColor: '#BAE6FD',
    groundColor: '#4D7C0F',
    roadColor: '#57534E',
    accentColor: '#FACC15',
  },
  {
    id: 2,
    nameEn: 'Small Indian Town',
    nameHi: 'छोटा भारतीय शहर',
    subtitleEn: 'Colorful shopfronts, chai stalls & auto-rickshaws',
    subtitleHi: 'रंग-बिरंगी दुकानें, चाय के स्टॉल और ऑटो-रिक्शा',
    skyColor: '#60A5FA',
    fogColor: '#DBEAFE',
    groundColor: '#D97706',
    roadColor: '#334155',
    accentColor: '#F97316',
  },
  {
    id: 3,
    nameEn: 'Market Road',
    nameHi: 'बाज़ार मार्ग',
    subtitleEn: 'Bustling bazaar canopies, fruit carts & street banners',
    subtitleHi: 'व्यस्त बाज़ार, फलों की गाड़ियाँ और स्ट्रीट बैनर',
    skyColor: '#F59E0B',
    fogColor: '#FEF3C7',
    groundColor: '#B45309',
    roadColor: '#3F3F46',
    accentColor: '#EC4899',
  },
  {
    id: 4,
    nameEn: 'Railway Area',
    nameHi: 'रेलवे क्षेत्र',
    subtitleEn: 'Steel bridges, signal posts & express crossings',
    subtitleHi: 'लोहे के पुल, सिग्नल पोस्ट और एक्सप्रेस क्रॉसिंग',
    skyColor: '#64748B',
    fogColor: '#CBD5E1',
    groundColor: '#78716C',
    roadColor: '#27272A',
    accentColor: '#EF4444',
  },
  {
    id: 5,
    nameEn: 'Golden Highway',
    nameHi: 'स्वर्ण राजमार्ग',
    subtitleEn: 'Multi-lane expressway, painted trucks & milestone markers',
    subtitleHi: 'एक्सप्रेसवे, सजे हुए ट्रक और मील के पत्थर',
    skyColor: '#FB923C',
    fogColor: '#FFEDD5',
    groundColor: '#CA8A04',
    roadColor: '#1E293B',
    accentColor: '#06B6D4',
  },
  {
    id: 6,
    nameEn: 'Temple & Festival Area',
    nameHi: 'मंदिर और उत्सव क्षेत्र',
    subtitleEn: 'Gopuram spires, marigold garlands & glowing diyas',
    subtitleHi: 'प्राचीन मंदिर, गेंदे के फूलों की माला और दीप',
    skyColor: '#311042',
    fogColor: '#581C87',
    groundColor: '#9A3412',
    roadColor: '#2E1065',
    accentColor: '#FDE047',
  },
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm_coins_100',
    titleEn: 'Collect 100 Coins',
    titleHi: '100 सिक्के इकट्ठा करें',
    target: 100,
    current: 0,
    rewardCoins: 250,
    rewardMultiplier: 0.2,
    completed: false,
    claimed: false,
    type: 'COINS',
  },
  {
    id: 'm_dist_1000',
    titleEn: 'Run 1,000 Meters in One or More Runs',
    titleHi: '1,000 मीटर दौड़ें',
    target: 1000,
    current: 0,
    rewardCoins: 350,
    rewardMultiplier: 0.3,
    completed: false,
    claimed: false,
    type: 'DISTANCE',
  },
  {
    id: 'm_dist_5000',
    titleEn: 'Run 5,000 Meters Total',
    titleHi: 'कुल 5,000 मीटर दौड़ें',
    target: 5000,
    current: 0,
    rewardCoins: 1000,
    rewardMultiplier: 0.5,
    completed: false,
    claimed: false,
    type: 'DISTANCE',
  },
  {
    id: 'm_powerups_3',
    titleEn: 'Collect 3 Power-Ups',
    titleHi: '3 पावर-अप इकट्ठा करें',
    target: 3,
    current: 0,
    rewardCoins: 300,
    rewardMultiplier: 0.2,
    completed: false,
    claimed: false,
    type: 'POWERUPS',
  },
  {
    id: 'm_jumps_20',
    titleEn: 'Jump Over 20 Obstacles',
    titleHi: '20 बाधाओं के ऊपर से कूदें',
    target: 20,
    current: 0,
    rewardCoins: 400,
    rewardMultiplier: 0.3,
    completed: false,
    claimed: false,
    type: 'JUMPS',
  },
  {
    id: 'm_games_3',
    titleEn: 'Play 3 Complete Runs',
    titleHi: '3 बार गेम खेलें',
    target: 3,
    current: 0,
    rewardCoins: 200,
    rewardMultiplier: 0.5,
    completed: false,
    claimed: false,
    type: 'GAMES',
  },
];

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'shirt_yellow_classic',
    category: 'SHIRT',
    nameEn: 'Suraj Signature Yellow Shirt',
    nameHi: 'सूरज का खास पीला शर्ट',
    descEn: 'Original bright yellow adventure shirt with red tilak blessing.',
    descHi: 'लाल तिलक के साथ सूरज का असली पीला एडवेंचर शर्ट।',
    price: 0,
    owned: true,
    equipped: true,
    colorHex: '#FACC15',
  },
  {
    id: 'shirt_saffron_festive',
    category: 'SHIRT',
    nameEn: 'Festival Saffron Kurta-Shirt',
    nameHi: 'उत्सव केसरिया शर्ट',
    descEn: 'Vibrant marigold saffron outfit inspired by Indian festivals.',
    descHi: 'भारतीय त्योहारों से प्रेरित चमकदार केसरिया पोशाक।',
    price: 150,
    owned: false,
    equipped: false,
    colorHex: '#F97316',
  },
  {
    id: 'shirt_royal_indigo',
    category: 'SHIRT',
    nameEn: 'Royal Peacock Blue Shirt',
    nameHi: 'रॉयल मोर नीला शर्ट',
    descEn: 'Electric royal blue shirt for high-speed highway sprints.',
    descHi: 'हाईवे पर तेज़ दौड़ के लिए रॉयल नीला शर्ट।',
    price: 300,
    owned: false,
    equipped: false,
    colorHex: '#38BDF8',
  },
  {
    id: 'shirt_emerald_express',
    category: 'SHIRT',
    nameEn: 'Emerald Ghat Runner',
    nameHi: 'पन्ना ग्रीन रनर शर्ट',
    descEn: 'Lush emerald green shirt styled for village & ghat tracks.',
    descHi: 'गाँव और घाट के रास्तों के लिए पन्ना हरा शर्ट।',
    price: 450,
    owned: false,
    equipped: false,
    colorHex: '#10B981',
  },
  {
    id: 'shoes_red_bolt',
    category: 'SHOES',
    nameEn: 'Crimson Sprint Sneakers',
    nameHi: 'क्रिमसन स्प्रिंट जूते',
    descEn: 'Standard high-grip road running sneakers.',
    descHi: 'मजबूत पकड़ वाले लाल रनिंग स्नीकर्स।',
    price: 0,
    owned: true,
    equipped: true,
    colorHex: '#EF4444',
  },
  {
    id: 'shoes_gold_star',
    category: 'SHOES',
    nameEn: '5TAR Golden Wing Shoes',
    nameHi: '5TAR गोल्डन विंग जूते',
    descEn: 'Radiant gold-trimmed pro runner footwear.',
    descHi: 'सुनहरे सितारों वाले प्रो रनर जूते।',
    price: 250,
    owned: false,
    equipped: false,
    colorHex: '#F59E0B',
  },
  {
    id: 'shoes_cyan_turbo',
    category: 'SHOES',
    nameEn: 'Turbo Neon Strikers',
    nameHi: 'टर्बो नियॉन जूते',
    descEn: 'High-visibility electric cyan night-runner shoes.',
    descHi: 'रात में चमकने वाले इलेक्ट्रीक सियान जूते।',
    price: 400,
    owned: false,
    equipped: false,
    colorHex: '#06B6D4',
  },
  {
    id: 'trail_solar_gold',
    category: 'TRAIL',
    nameEn: 'Surya Golden Spark Trail',
    nameHi: 'सूर्य गोल्डन ट्रेल',
    descEn: 'Leaves a warm golden aura trail as you sprint.',
    descHi: 'दौड़ते समय सुनहरी चमक छोड़ता है।',
    price: 0,
    owned: true,
    equipped: true,
    colorHex: '#FACC15',
  },
  {
    id: 'trail_rangoli_magenta',
    category: 'TRAIL',
    nameEn: 'Festival Gulal Aura',
    nameHi: 'उत्सव गुलाल ट्रेल',
    descEn: 'Vibrant pink & saffron particle burst while lane-switching.',
    descHi: 'लेन बदलते समय गुलाबी और केसरिया रंगों की चमक।',
    price: 350,
    owned: false,
    equipped: false,
    colorHex: '#EC4899',
  },
  {
    id: 'upgrade_powerup_timer',
    category: 'UPGRADE',
    nameEn: 'Power-Up Duration Boost',
    nameHi: 'पावर-अप समय बढ़ाएं',
    descEn: 'Increases active duration of Magnet, Shield, 2X & Boost by +2s per level.',
    descHi: 'हर लेवल पर सभी पावर-अप का समय +2 सेकंड बढ़ाता है।',
    price: 200,
    owned: true,
    equipped: true,
    upgradeLevel: 1,
    maxLevel: 5,
  },
  {
    id: 'upgrade_score_booster',
    category: 'UPGRADE',
    nameEn: 'Permanent Star Multiplier',
    nameHi: 'स्थायी स्कोर मल्टीप्लायर',
    descEn: 'Permanently boosts your base score multiplier by +0.5x per level.',
    descHi: 'आपके बेस स्कोर मल्टीप्लायर को स्थायी रूप से +0.5x बढ़ाता है।',
    price: 300,
    owned: true,
    equipped: true,
    upgradeLevel: 1,
    maxLevel: 5,
  },
];

export const CHARACTER_LIST: CharacterSlot[] = [
  {
    id: 'suraj_main',
    nameEn: 'Suraj',
    nameHi: 'सूरज',
    titleEn: 'The 5TAR Adventurer',
    titleHi: '5TAR एडवेंचरर',
    unlocked: true,
    comingSoon: false,
    stats: {
      speed: 92,
      jump: 90,
      luck: 95,
    },
    shirtColor: '#FACC15',
    pantsColor: '#1E3A8A',
  },
  {
    id: 'aarav_locked',
    nameEn: 'Aarav',
    nameHi: 'आरव',
    titleEn: 'Ghat Mountain Sprinter',
    titleHi: 'घाट माउंटेन स्प्रिंटर',
    unlocked: false,
    comingSoon: true,
    stats: {
      speed: 95,
      jump: 88,
      luck: 85,
    },
    shirtColor: '#F97316',
    pantsColor: '#0F172A',
  },
  {
    id: 'kavya_locked',
    nameEn: 'Kavya',
    nameHi: 'काव्या',
    titleEn: 'Festival Star Freerunner',
    titleHi: 'फेस्टिवल स्टार रनर',
    unlocked: false,
    comingSoon: true,
    stats: {
      speed: 94,
      jump: 96,
      luck: 92,
    },
    shirtColor: '#EC4899',
    pantsColor: '#1E1B4B',
  },
  {
    id: 'vikram_locked',
    nameEn: 'Vikram',
    nameHi: 'विक्रम',
    titleEn: 'Highway Turbo Legend',
    titleHi: 'हाईवे टर्बो लीजेंड',
    unlocked: false,
    comingSoon: true,
    stats: {
      speed: 98,
      jump: 86,
      luck: 90,
    },
    shirtColor: '#06B6D4',
    pantsColor: '#18181B',
  },
];
