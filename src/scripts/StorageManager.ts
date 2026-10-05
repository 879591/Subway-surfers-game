import {
  INITIAL_MISSIONS,
  INITIAL_SHOP_ITEMS,
  PlayerSaveData,
} from './GameState';

const STORAGE_KEY = '5tar_runner_suraj_save_v1';

const DEFAULT_SAVE: PlayerSaveData = {
  coins: 120, // Starter bonus coins so players can test the shop immediately or save up
  bestScore: 0,
  bestDistance: 0,
  totalGamesPlayed: 0,
  totalCoinsCollected: 0,
  totalJumps: 0,
  totalPowerUps: 0,
  baseMultiplier: 1.0,
  selectedCharacter: 'suraj_main',
  equippedShirtColor: '#FACC15',
  equippedShoesColor: '#EF4444',
  equippedTrailColor: '#FACC15',
  powerUpDurationBonus: 0,
  missions: INITIAL_MISSIONS,
  shopItems: INITIAL_SHOP_ITEMS,
  settings: {
    sound: true,
    music: true,
    vibration: true,
    graphics: 'HIGH',
    language: 'en',
    onScreenControls: true,
  },
};

export function loadPlayerSave(): PlayerSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_SAVE);
    const parsed = JSON.parse(raw) as Partial<PlayerSaveData>;
    return {
      ...structuredClone(DEFAULT_SAVE),
      ...parsed,
      settings: {
        ...DEFAULT_SAVE.settings,
        ...(parsed.settings || {}),
      },
      missions: parsed.missions && parsed.missions.length > 0 ? parsed.missions : structuredClone(INITIAL_MISSIONS),
      shopItems: parsed.shopItems && parsed.shopItems.length > 0 ? parsed.shopItems : structuredClone(INITIAL_SHOP_ITEMS),
    };
  } catch {
    return structuredClone(DEFAULT_SAVE);
  }
}

export function savePlayerData(data: PlayerSaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors in restricted webviews
  }
}
