/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  Check,
  ChevronLeft,
  Coins,
  Compass,
  Flame,
  Globe,
  Home,
  Lock,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings as SettingsIcon,
  Shield,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  Trophy,
  UserCheck,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import {
  CHARACTER_LIST,
  ENVIRONMENT_SECTIONS,
  EnvironmentSectionId,
  GraphicsQuality,
  Language,
  PlayerSaveData,
  PowerUpType,
  ScreenState,
  ShopItem,
} from './scripts/GameState';
import { loadPlayerSave, savePlayerData } from './scripts/StorageManager';
import { soundEngine } from './audio/SoundEngine';
import { ActivePowerUpHUD, RunnerCanvas3D } from './scenes/RunnerCanvas3D';
import { OfflineBanner, PWAInstallButton } from './ui/PWAInstallButton';
import { BuildApkModal } from './ui/BuildApkModal';

const POWERUP_META: Record<
  PowerUpType,
  { labelEn: string; labelHi: string; colorClass: string; icon: React.ReactNode }
> = {
  MAGNET: {
    labelEn: 'Coin Magnet',
    labelHi: 'कॉइन मैग्नेट',
    colorClass: 'bg-red-500',
    icon: <Zap className="w-3.5 h-3.5 text-white" />,
  },
  SHIELD: {
    labelEn: 'Suraj Shield',
    labelHi: 'सूरज सुरक्षा कवच',
    colorClass: 'bg-sky-500',
    icon: <Shield className="w-3.5 h-3.5 text-white" />,
  },
  DOUBLE_SCORE: {
    labelEn: '2X Score Star',
    labelHi: '2X स्कोर स्टार',
    colorClass: 'bg-purple-500',
    icon: <Sparkles className="w-3.5 h-3.5 text-white" />,
  },
  SPEED_BOOST: {
    labelEn: 'Turbo Sprint',
    labelHi: 'टर्बो रफ़्तार',
    colorClass: 'bg-orange-500',
    icon: <Flame className="w-3.5 h-3.5 text-white" />,
  },
  COIN_MULTIPLIER: {
    labelEn: '2X Coins',
    labelHi: '2X सिक्के',
    colorClass: 'bg-emerald-500',
    icon: <Coins className="w-3.5 h-3.5 text-white" />,
  },
};

export default function App() {
  const [saveData, setSaveData] = useState<PlayerSaveData>(() => loadPlayerSave());
  const [screenState, setScreenState] = useState<ScreenState>('HOME');
  const [showApkModal, setShowApkModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live Run HUD State
  const [hudScore, setHudScore] = useState(0);
  const [hudCoins, setHudCoins] = useState(0);
  const [hudDistance, setHudDistance] = useState(0);
  const [hudSectionId, setHudSectionId] = useState<EnvironmentSectionId>(1);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUpHUD[]>([]);
  const [nearMissBanner, setNearMissBanner] = useState(false);

  // Last Game Over Summary
  const [lastRunStats, setLastRunStats] = useState({
    score: 0,
    coins: 0,
    distance: 0,
    isNewBest: false,
  });

  // Character Preview Rotation & Shop Tab
  const [selectedCharIdx, setSelectedCharIdx] = useState(0);
  const [charRotationY, setCharRotationY] = useState(0);
  const [shopCategory, setShopCategory] = useState<'SHIRT' | 'SHOES' | 'TRAIL' | 'UPGRADE'>('SHIRT');

  const controlSignalRef = useRef<{ action: 'LEFT' | 'RIGHT' | 'JUMP' | 'SLIDE' | null }>({
    action: null,
  });

  const lang: Language = saveData.settings.language;

  // Sync audio & save data whenever saveData changes
  useEffect(() => {
    savePlayerData(saveData);
    soundEngine.updateSettings(
      saveData.settings.sound,
      saveData.settings.music,
      saveData.settings.vibration
    );
  }, [saveData]);

  const toggleFullscreen = () => {
    soundEngine.playButtonTap();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const startPlay = () => {
    soundEngine.playButtonTap();
    soundEngine.startMusic();
    setHudScore(0);
    setHudCoins(0);
    setHudDistance(0);
    setHudSectionId(1);
    setActivePowerUps([]);
    setScreenState('PLAYING');
  };

  const handleHUDUpdate = useCallback(
    (
      score: number,
      coins: number,
      distance: number,
      sectionId: EnvironmentSectionId,
      powerUps: ActivePowerUpHUD[],
      nearMiss: boolean
    ) => {
      setHudScore(score);
      setHudCoins(coins);
      setHudDistance(distance);
      setHudSectionId(sectionId);
      setActivePowerUps(powerUps);
      if (nearMiss) {
        setNearMissBanner(true);
        setTimeout(() => setNearMissBanner(false), 950);
      }
    },
    []
  );

  const handleGameOver = useCallback(
    (
      finalScore: number,
      runCoins: number,
      runDistance: number,
      runJumps: number,
      runPowerUps: number
    ) => {
      soundEngine.stopMusic();
      setSaveData((prev) => {
        const isNewBest = finalScore > prev.bestScore;
        if (isNewBest) {
          try {
            confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
          } catch {
            // Ignore confetti errors
          }
        }

        const updatedMissions = prev.missions.map((m) => {
          if (m.completed) return m;
          let nextVal = m.current;
          if (m.type === 'COINS') nextVal += runCoins;
          else if (m.type === 'DISTANCE') nextVal += runDistance;
          else if (m.type === 'POWERUPS') nextVal += runPowerUps;
          else if (m.type === 'JUMPS') nextVal += runJumps;
          else if (m.type === 'GAMES') nextVal += 1;

          const done = nextVal >= m.target;
          return {
            ...m,
            current: Math.min(m.target, nextVal),
            completed: done,
          };
        });

        setLastRunStats({
          score: finalScore,
          coins: runCoins,
          distance: runDistance,
          isNewBest,
        });

        return {
          ...prev,
          coins: prev.coins + runCoins,
          bestScore: Math.max(prev.bestScore, finalScore),
          bestDistance: Math.max(prev.bestDistance, runDistance),
          totalGamesPlayed: prev.totalGamesPlayed + 1,
          totalCoinsCollected: prev.totalCoinsCollected + runCoins,
          totalJumps: prev.totalJumps + runJumps,
          totalPowerUps: prev.totalPowerUps + runPowerUps,
          missions: updatedMissions,
        };
      });

      setScreenState('GAMEOVER');
    },
    []
  );

  const claimMissionReward = (missionId: string) => {
    soundEngine.playPowerUp();
    setSaveData((prev) => {
      const targetMission = prev.missions.find((m) => m.id === missionId);
      if (!targetMission || !targetMission.completed || targetMission.claimed) return prev;

      return {
        ...prev,
        coins: prev.coins + targetMission.rewardCoins,
        baseMultiplier: Number((prev.baseMultiplier + targetMission.rewardMultiplier).toFixed(1)),
        missions: prev.missions.map((m) =>
          m.id === missionId ? { ...m, claimed: true } : m
        ),
      };
    });
  };

  const handleShopAction = (item: ShopItem) => {
    soundEngine.playButtonTap();

    setSaveData((prev) => {
      // Handle Upgrades
      if (item.category === 'UPGRADE') {
        const currentLvl = item.upgradeLevel || 1;
        const maxLvl = item.maxLevel || 5;
        if (currentLvl >= maxLvl || prev.coins < item.price) return prev;

        soundEngine.playPowerUp();
        const isTimerUpgrade = item.id === 'upgrade_powerup_timer';
        return {
          ...prev,
          coins: prev.coins - item.price,
          powerUpDurationBonus: isTimerUpgrade
            ? prev.powerUpDurationBonus + 2
            : prev.powerUpDurationBonus,
          baseMultiplier: !isTimerUpgrade
            ? Number((prev.baseMultiplier + 0.5).toFixed(1))
            : prev.baseMultiplier,
          shopItems: prev.shopItems.map((si) =>
            si.id === item.id
              ? {
                  ...si,
                  upgradeLevel: currentLvl + 1,
                  price: Math.floor(si.price * 1.45),
                }
              : si
          ),
        };
      }

      // If already owned, equip it
      if (item.owned) {
        return {
          ...prev,
          equippedShirtColor:
            item.category === 'SHIRT' && item.colorHex ? item.colorHex : prev.equippedShirtColor,
          equippedShoesColor:
            item.category === 'SHOES' && item.colorHex ? item.colorHex : prev.equippedShoesColor,
          equippedTrailColor:
            item.category === 'TRAIL' && item.colorHex ? item.colorHex : prev.equippedTrailColor,
          shopItems: prev.shopItems.map((si) =>
            si.category === item.category ? { ...si, equipped: si.id === item.id } : si
          ),
        };
      }

      // Buy & Equip
      if (prev.coins < item.price) return prev;
      soundEngine.playPowerUp();
      return {
        ...prev,
        coins: prev.coins - item.price,
        equippedShirtColor:
          item.category === 'SHIRT' && item.colorHex ? item.colorHex : prev.equippedShirtColor,
        equippedShoesColor:
          item.category === 'SHOES' && item.colorHex ? item.colorHex : prev.equippedShoesColor,
        equippedTrailColor:
          item.category === 'TRAIL' && item.colorHex ? item.colorHex : prev.equippedTrailColor,
        shopItems: prev.shopItems.map((si) => {
          if (si.id === item.id) {
            return { ...si, owned: true, equipped: true };
          }
          if (si.category === item.category) {
            return { ...si, equipped: false };
          }
          return si;
        }),
      };
    });
  };

  const currentSectionObj =
    ENVIRONMENT_SECTIONS.find((s) => s.id === hudSectionId) || ENVIRONMENT_SECTIONS[0];
  const unclaimedMissionsCount = saveData.missions.filter((m) => m.completed && !m.claimed).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-950 text-white">
      {/* 1. REAL-TIME 3D ENDLESS RUNNER ENGINE */}
      <RunnerCanvas3D
        screenState={screenState}
        shirtColor={saveData.equippedShirtColor}
        shoesColor={saveData.equippedShoesColor}
        trailColor={saveData.equippedTrailColor}
        graphics={saveData.settings.graphics}
        baseMultiplier={saveData.baseMultiplier}
        powerUpDurationBonus={saveData.powerUpDurationBonus}
        characterRotationY={charRotationY}
        onHUDUpdate={handleHUDUpdate}
        onGameOver={handleGameOver}
        controlSignalRef={controlSignalRef}
      />

      {/* Offline Status Toast */}
      <OfflineBanner lang={lang} />

      {/* =====================================================================
          2. HOME SCREEN
      ===================================================================== */}
      {screenState === 'HOME' && (
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-6 pointer-events-none">
          {/* Top Bar */}
          <header className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3 bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 pointer-events-auto shadow-xl">
            <div className="flex items-center gap-3">
              <img
                src="/icon.svg"
                alt="5TAR RUNNER Icon"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl border border-amber-400/50"
              />
              <div>
                <span className="text-base sm:text-lg font-extrabold tracking-wider font-display text-amber-400 block leading-none">
                  5TAR RUNNER
                </span>
                <span className="text-[11px] text-slate-300 font-medium">
                  {lang === 'hi' ? 'सूरज का एडवेंचर' : "Suraj's Adventure"}
                </span>
              </div>
            </div>

            {/* Player Currency & Best Score Summary */}
            <div className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{lang === 'hi' ? 'सर्वश्रेष्ठ:' : 'Best:'}</span>
                <span className="font-mono-tabular text-white font-bold">
                  {saveData.bestScore.toLocaleString()}
                </span>
              </div>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span>{lang === 'hi' ? 'सिक्के:' : 'Coins:'}</span>
                <span className="font-mono-tabular text-yellow-300 font-bold">
                  {saveData.coins.toLocaleString()}
                </span>
              </div>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-mono-tabular text-purple-300 font-bold">
                  {saveData.baseMultiplier.toFixed(1)}x
                </span>
              </div>
            </div>

            {/* Install App / Build APK / Fullscreen */}
            <div className="flex items-center gap-2">
              <PWAInstallButton lang={lang} onOpenApkModal={() => setShowApkModal(true)} />
              <button
                onClick={toggleFullscreen}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 flex items-center justify-center text-slate-200 transition cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* Center Hero Logo & Character Spotlight */}
          <div className="flex flex-col items-center text-center my-auto pointer-events-none">
            <img
              src="/logo.svg"
              alt="5TAR RUNNER - Suraj's Adventure Logo"
              referrerPolicy="no-referrer"
              className="w-72 sm:w-96 md:w-[430px] h-auto animate-pulse-glow drop-shadow-2xl mb-2"
            />
            <div className="flex items-center gap-2 text-xs text-amber-200/90 font-medium bg-slate-950/65 backdrop-blur-sm px-3.5 py-1 rounded-lg border border-white/10">
              <span>{lang === 'hi' ? '6 भारतीय लोकल ट्रैक' : '6 Indian Worlds'}</span>
              <span aria-hidden="true">·</span>
              <span>{lang === 'hi' ? 'ऑफ़लाइन रेडी' : '100% Offline Ready'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">{saveData.coins} Coins</span>
            </div>
          </div>

          {/* Bottom Navigation & Primary PLAY CTA */}
          <div className="w-full max-w-xl mx-auto flex flex-col gap-3 pointer-events-auto">
            {/* Giant Energetic PLAY Button */}
            <button
              onClick={startPlay}
              className="w-full min-h-[58px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-xl font-display tracking-wider shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition cursor-pointer"
            >
              <Play className="w-6 h-6 fill-slate-950" />
              <span>{lang === 'hi' ? 'खेलें (PLAY NOW)' : 'PLAY ADVENTURE'}</span>
            </button>

            {/* 4 Main Action Buttons: CHARACTERS, MISSIONS, SHOP, SETTINGS */}
            <div className="grid grid-cols-4 gap-2.5 bg-slate-950/85 backdrop-blur-md border border-white/15 p-2 rounded-2xl shadow-2xl">
              <button
                onClick={() => {
                  soundEngine.playButtonTap();
                  setScreenState('CHARACTERS');
                }}
                className="min-h-[56px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 flex flex-col items-center justify-center gap-1 py-2 transition active:scale-95 cursor-pointer"
              >
                <Users className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] font-bold text-slate-200 whitespace-nowrap">
                  {lang === 'hi' ? 'किरदार' : 'CHARACTERS'}
                </span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playButtonTap();
                  setScreenState('MISSIONS');
                }}
                className="relative min-h-[56px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 flex flex-col items-center justify-center gap-1 py-2 transition active:scale-95 cursor-pointer"
              >
                <Target className="w-5 h-5 text-emerald-400" />
                <span className="text-[11px] font-bold text-slate-200 whitespace-nowrap">
                  {lang === 'hi' ? 'मिशन' : 'MISSIONS'}
                </span>
                {unclaimedMissionsCount > 0 && (
                  <span className="absolute top-1.5 right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unclaimedMissionsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  soundEngine.playButtonTap();
                  setScreenState('SHOP');
                }}
                className="min-h-[56px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 flex flex-col items-center justify-center gap-1 py-2 transition active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-sky-400" />
                <span className="text-[11px] font-bold text-slate-200 whitespace-nowrap">
                  {lang === 'hi' ? 'दुकान' : 'SHOP'}
                </span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playButtonTap();
                  setScreenState('SETTINGS');
                }}
                className="min-h-[56px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 flex flex-col items-center justify-center gap-1 py-2 transition active:scale-95 cursor-pointer"
              >
                <SettingsIcon className="w-5 h-5 text-purple-400" />
                <span className="text-[11px] font-bold text-slate-200 whitespace-nowrap">
                  {lang === 'hi' ? 'सेटिंग्स' : 'SETTINGS'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. IN-GAME HUD & OPTIONAL MOBILE TOUCH CONTROLS
      ===================================================================== */}
      {screenState === 'PLAYING' && (
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 pointer-events-none">
          {/* Top HUD Row: Top Left Score | Top Center Distance & Region | Top Right Coins & Pause */}
          <div className="w-full max-w-5xl mx-auto flex flex-col gap-2">
            <div className="grid grid-cols-3 items-center gap-2">
              {/* Top Left: SCORE */}
              <div className="bg-slate-950/70 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2 justify-self-start">
                <div className="text-[10px] font-semibold text-slate-400">
                  {lang === 'hi' ? 'स्कोर' : 'SCORE'} ({saveData.baseMultiplier.toFixed(1)}x)
                </div>
                <div className="text-lg sm:text-2xl font-extrabold font-mono-tabular text-white leading-tight">
                  {hudScore.toLocaleString()}
                </div>
              </div>

              {/* Top Center: DISTANCE & ENVIRONMENT SECTION */}
              <div className="bg-slate-950/70 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2 text-center justify-self-center">
                <div className="text-[10px] font-semibold text-amber-400 truncate max-w-[130px] sm:max-w-none">
                  {lang === 'hi' ? currentSectionObj.nameHi : currentSectionObj.nameEn}
                </div>
                <div className="text-lg sm:text-2xl font-extrabold font-mono-tabular text-white leading-tight">
                  {hudDistance} m
                </div>
              </div>

              {/* Top Right: COINS + PAUSE BUTTON */}
              <div className="flex items-center gap-2 justify-self-end pointer-events-auto">
                <div className="bg-slate-950/70 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2 text-right">
                  <div className="text-[10px] font-semibold text-yellow-400">
                    {lang === 'hi' ? 'सिक्के' : 'COINS'}
                  </div>
                  <div className="text-lg sm:text-2xl font-extrabold font-mono-tabular text-yellow-300 leading-tight">
                    {hudCoins}
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playButtonTap();
                    setScreenState('PAUSED');
                  }}
                  className="min-h-[48px] min-w-[48px] rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-white/20 flex items-center justify-center text-white shadow-lg active:scale-95 transition cursor-pointer"
                  aria-label="Pause Game"
                >
                  <Pause className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Active Power-Up Timers Below HUD */}
            {activePowerUps.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {activePowerUps.map((p) => {
                  const meta = POWERUP_META[p.type];
                  const pct = Math.max(0, Math.min(100, (p.remaining / p.duration) * 100));
                  return (
                    <div
                      key={p.type}
                      className="bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-xl px-3 py-1.5 flex items-center gap-2 min-w-[140px]"
                    >
                      <div className={`w-6 h-6 rounded-lg ${meta.colorClass} flex items-center justify-center`}>
                        {meta.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span>{lang === 'hi' ? meta.labelHi : meta.labelEn}</span>
                          <span className="font-mono-tabular">{p.remaining.toFixed(1)}s</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full ${meta.colorClass} transition-all duration-75`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Near-Obstacle Bonus Notification */}
            {nearMissBanner && (
              <div className="self-center bg-amber-500/95 text-slate-950 font-extrabold text-xs px-3.5 py-1 rounded-lg shadow-lg animate-bounce">
                {lang === 'hi' ? 'करीबी बचाव! +25 बोनस' : 'CLOSE DODGE! +25 BONUS'}
              </div>
            )}
          </div>

          {/* Optional On-Screen Mobile Control D-Pad Buttons for Testing & Accessibility */}
          {saveData.settings.onScreenControls && (
            <div className="w-full max-w-md mx-auto flex items-end justify-between gap-4 pb-2 pointer-events-auto">
              {/* Left / Right Lane Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onPointerDown={() => {
                    controlSignalRef.current.action = 'LEFT';
                  }}
                  className="w-14 h-14 rounded-2xl bg-slate-950/65 hover:bg-slate-900/85 active:scale-90 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-xl cursor-pointer"
                  aria-label="Move Left Lane"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                  onPointerDown={() => {
                    controlSignalRef.current.action = 'RIGHT';
                  }}
                  className="w-14 h-14 rounded-2xl bg-slate-950/65 hover:bg-slate-900/85 active:scale-90 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-xl cursor-pointer"
                  aria-label="Move Right Lane"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>

              {/* Subtle Swipe / Key Helper */}
              <div className="hidden sm:block text-[11px] text-slate-300/80 bg-slate-950/50 px-3 py-1.5 rounded-xl border border-white/10">
                Swipe or WASD / Arrow Keys
              </div>

              {/* Jump / Slide Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onPointerDown={() => {
                    controlSignalRef.current.action = 'SLIDE';
                  }}
                  className="w-14 h-14 rounded-2xl bg-slate-950/65 hover:bg-slate-900/85 active:scale-90 border border-white/20 backdrop-blur-sm flex items-center justify-center text-amber-300 shadow-xl cursor-pointer"
                  aria-label="Slide Down"
                >
                  <ArrowDown className="w-6 h-6" />
                </button>
                <button
                  onPointerDown={() => {
                    controlSignalRef.current.action = 'JUMP';
                  }}
                  className="w-14 h-14 rounded-2xl bg-amber-500/85 hover:bg-amber-400 active:scale-90 border border-amber-300/50 backdrop-blur-sm flex items-center justify-center text-slate-950 shadow-xl cursor-pointer"
                  aria-label="Jump Up"
                >
                  <ArrowUp className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          4. PAUSE MENU
      ===================================================================== */}
      {screenState === 'PAUSED' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl space-y-4 text-center">
            <h2 className="text-2xl font-extrabold font-display text-white tracking-wide">
              {lang === 'hi' ? 'गेम रुका हुआ है (PAUSED)' : 'GAME PAUSED'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'hi' ? currentSectionObj.nameHi : currentSectionObj.nameEn} · {hudDistance} m
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  soundEngine.playButtonTap();
                  setScreenState('PLAYING');
                }}
                className="w-full min-h-[48px] rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{lang === 'hi' ? 'जारी रखें (RESUME)' : 'RESUME'}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playButtonTap();
                  setScreenState('HOME');
                  setTimeout(() => startPlay(), 30);
                }}
                className="w-full min-h-[48px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{lang === 'hi' ? 'फिर से शुरू करें (RESTART)' : 'RESTART'}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playButtonTap();
                  setScreenState('SETTINGS');
                }}
                className="w-full min-h-[48px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <SettingsIcon className="w-4 h-4" />
                <span>{lang === 'hi' ? 'सेटिंग्स (SETTINGS)' : 'SETTINGS'}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playButtonTap();
                  soundEngine.stopMusic();
                  setScreenState('HOME');
                }}
                className="w-full min-h-[48px] rounded-2xl bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-300 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>{lang === 'hi' ? 'होम स्क्रीन (HOME)' : 'HOME'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          5. GAME OVER SCREEN
      ===================================================================== */}
      {screenState === 'GAMEOVER' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl space-y-5 text-center">
            {lastRunStats.isNewBest && (
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-300 bg-amber-500/20 border border-amber-400/40 px-3.5 py-1 rounded-xl">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{lang === 'hi' ? 'नया सर्वश्रेष्ठ स्कोर!' : 'New Best Score!'}</span>
              </div>
            )}

            <div>
              <h2 className="text-3xl font-extrabold font-display text-white tracking-wider">
                {lang === 'hi' ? 'गेम ओवर (GAME OVER)' : 'GAME OVER'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'hi' ? 'सूरज ने शानदार दौड़ लगाई!' : "Suraj's run summary"}
              </p>
            </div>

            {/* Run Score / Coins / Distance / Best Score Breakdown */}
            <div className="grid grid-cols-2 gap-3 text-left bg-slate-950/80 border border-white/10 p-4 rounded-2xl">
              <div>
                <div className="text-xs text-slate-400">{lang === 'hi' ? 'स्कोर' : 'Score'}</div>
                <div className="text-2xl font-extrabold font-mono-tabular text-white">
                  {lastRunStats.score.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">
                  {lang === 'hi' ? 'सर्वश्रेष्ठ स्कोर' : 'Best Score'}
                </div>
                <div className="text-2xl font-extrabold font-mono-tabular text-amber-400">
                  {saveData.bestScore.toLocaleString()}
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <div className="text-xs text-slate-400">{lang === 'hi' ? 'सिक्के मिले' : 'Coins'}</div>
                <div className="text-lg font-bold font-mono-tabular text-yellow-300">
                  +{lastRunStats.coins}
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <div className="text-xs text-slate-400">{lang === 'hi' ? 'दूरी' : 'Distance'}</div>
                <div className="text-lg font-bold font-mono-tabular text-sky-300">
                  {lastRunStats.distance} m
                </div>
              </div>
            </div>

            {/* Action Buttons: RETRY, HOME, CHARACTERS */}
            <div className="space-y-2.5">
              <button
                onClick={startPlay}
                className="w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-base font-display tracking-wide flex items-center justify-center gap-2 shadow-xl transition cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{lang === 'hi' ? 'फिर से खेलें (RETRY)' : 'RETRY'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    soundEngine.playButtonTap();
                    setScreenState('HOME');
                  }}
                  className="min-h-[48px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'होम (HOME)' : 'HOME'}</span>
                </button>
                <button
                  onClick={() => {
                    soundEngine.playButtonTap();
                    setScreenState('CHARACTERS');
                  }}
                  className="min-h-[48px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'hi' ? 'किरदार (CHARACTERS)' : 'CHARACTERS'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          6. CHARACTER SELECT SCREEN
      ===================================================================== */}
      {screenState === 'CHARACTERS' && (
        <div className="relative z-20 w-full h-full flex flex-col justify-between p-4 sm:p-6 pointer-events-none">
          {/* Top Bar */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between bg-slate-950/85 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 pointer-events-auto">
            <button
              onClick={() => {
                soundEngine.playButtonTap();
                setScreenState('HOME');
              }}
              className="min-h-[44px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{lang === 'hi' ? 'वापस' : 'Back'}</span>
            </button>
            <h2 className="text-lg font-extrabold font-display text-white">
              {lang === 'hi' ? 'किरदार चुनें (CHARACTER SELECT)' : 'CHARACTER SELECT'}
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-300 font-mono-tabular">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>{saveData.coins}</span>
            </div>
          </div>

          {/* 3D Character Rotation Controls */}
          <div className="my-auto flex flex-col items-center pointer-events-auto">
            <div className="mt-44 sm:mt-52 flex items-center gap-3 bg-slate-950/75 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl">
              <button
                onClick={() => setCharRotationY((r) => r - 0.6)}
                className="min-h-[40px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rotate Left</span>
              </button>
              <button
                onClick={() => setCharRotationY(0)}
                className="min-h-[40px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold cursor-pointer"
              >
                Center
              </button>
              <button
                onClick={() => setCharRotationY((r) => r + 0.6)}
                className="min-h-[40px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Rotate Right</span>
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Character Roster & Stats Panel */}
          <div className="w-full max-w-4xl mx-auto bg-slate-950/90 backdrop-blur-md border border-white/15 rounded-3xl p-5 pointer-events-auto space-y-4">
            {(() => {
              const char = CHARACTER_LIST[selectedCharIdx];
              return (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src="/src/assets/images/character_suraj_portrait_1791178616487.jpg"
                      alt="Suraj Character Portrait"
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold font-display text-white">
                          {lang === 'hi' ? char.nameHi : char.nameEn}
                        </h3>
                        <span className="text-xs text-amber-400 font-semibold">
                          · {lang === 'hi' ? char.titleHi : char.titleEn}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {char.unlocked
                          ? lang === 'hi'
                            ? 'पीली शर्ट, घुंघराले काले बाल और लाल तिलक के साथ मुख्य एडवेंचर हीरो।'
                            : 'Signature yellow shirt, wavy black curls & sacred red tilak.'
                          : lang === 'hi'
                          ? 'भविष्य के अपडेट में जल्द आ रहा है (COMING SOON)'
                          : 'Locked Hero — COMING SOON in future festival update'}
                      </p>
                    </div>
                  </div>

                  {/* Character Stats */}
                  <div className="flex items-center gap-5 text-xs">
                    <div>
                      <span className="text-slate-400 block">Speed</span>
                      <span className="font-mono-tabular font-bold text-amber-300">
                        {char.stats.speed}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Jump</span>
                      <span className="font-mono-tabular font-bold text-emerald-300">
                        {char.stats.jump}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Luck</span>
                      <span className="font-mono-tabular font-bold text-sky-300">
                        {char.stats.luck}/100
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Character Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CHARACTER_LIST.map((c, idx) => {
                const isSelected = idx === selectedCharIdx;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      soundEngine.playButtonTap();
                      setSelectedCharIdx(idx);
                    }}
                    className={`min-h-[68px] p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-amber-400 shadow-lg'
                        : 'bg-slate-900/80 border-white/10 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white">
                        {lang === 'hi' ? c.nameHi : c.nameEn}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {c.unlocked ? (
                          <span className="text-emerald-400 font-semibold">UNLOCKED</span>
                        ) : (
                          <span className="text-amber-400/90 font-semibold">COMING SOON</span>
                        )}
                      </div>
                    </div>
                    {c.unlocked ? (
                      <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          7. MISSIONS SCREEN
      ===================================================================== */}
      {screenState === 'MISSIONS' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Target className="w-6 h-6 text-emerald-400" />
                <div>
                  <h2 className="text-xl font-extrabold font-display text-white">
                    {lang === 'hi' ? 'सूरज के मिशन (MISSIONS)' : 'ADVENTURE MISSIONS'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {lang === 'hi'
                      ? 'मिशन पूरे करें और सिक्के व स्कोर मल्टीप्लायर पाएं'
                      : 'Complete objectives to earn Coins & permanent Score Multiplier'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEngine.playButtonTap();
                  setScreenState('HOME');
                }}
                className="min-h-[44px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
              >
                {lang === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 my-4 pr-1">
              {saveData.missions.map((m) => {
                const pct = Math.min(100, Math.floor((m.current / m.target) * 100));
                return (
                  <div
                    key={m.id}
                    className="rounded-2xl bg-slate-950/90 border border-white/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 w-full">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-white">
                          {lang === 'hi' ? m.titleHi : m.titleEn}
                        </h3>
                        <span className="text-xs font-mono-tabular text-slate-400">
                          {m.current} / {m.target}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                        <span>Reward: +{m.rewardCoins} Coins</span>
                        <span aria-hidden="true">·</span>
                        <span>+{m.rewardMultiplier}x Multiplier</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {m.claimed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 px-3 py-2">
                          <Check className="w-4 h-4" />
                          <span>{lang === 'hi' ? 'प्राप्त किया' : 'Claimed'}</span>
                        </span>
                      ) : m.completed ? (
                        <button
                          onClick={() => claimMissionReward(m.id)}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg cursor-pointer whitespace-nowrap"
                        >
                          {lang === 'hi' ? 'इनाम लें (CLAIM)' : 'CLAIM REWARD'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 font-semibold px-3 py-2">
                          {pct}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          8. IN-GAME SHOP SCREEN (Virtual Coins Only)
      ===================================================================== */}
      {screenState === 'SHOP' && (
        <div className="relative z-20 w-full h-full flex flex-col justify-between p-4 sm:p-6 pointer-events-none">
          {/* Top Bar */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between bg-slate-950/85 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 pointer-events-auto">
            <button
              onClick={() => {
                soundEngine.playButtonTap();
                setScreenState('HOME');
              }}
              className="min-h-[44px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{lang === 'hi' ? 'वापस' : 'Back'}</span>
            </button>
            <h2 className="text-lg font-extrabold font-display text-white">
              {lang === 'hi' ? 'सूरज की दुकान (ITEM SHOP)' : '5TAR RUNNER SHOP'}
            </h2>
            <div className="flex items-center gap-1.5 text-sm font-extrabold text-yellow-300 font-mono-tabular">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>{saveData.coins.toLocaleString()}</span>
            </div>
          </div>

          {/* Bottom Shop Drawer */}
          <div className="w-full max-w-4xl mx-auto bg-slate-950/90 backdrop-blur-md border border-white/15 rounded-3xl p-5 pointer-events-auto space-y-4">
            {/* Category Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(['SHIRT', 'SHOES', 'TRAIL', 'UPGRADE'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    soundEngine.playButtonTap();
                    setShopCategory(cat);
                  }}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    shopCategory === cat
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {cat === 'SHIRT'
                    ? lang === 'hi'
                      ? 'शर्ट के रंग (Shirts)'
                      : 'Shirt Outfits'
                    : cat === 'SHOES'
                    ? lang === 'hi'
                      ? 'जूते (Running Shoes)'
                      : 'Running Shoes'
                    : cat === 'TRAIL'
                    ? lang === 'hi'
                      ? 'ट्रेल इफेक्ट (Trails)'
                      : 'Trail Effects'
                    : lang === 'hi'
                    ? 'पावर-अप अपग्रेड (Upgrades)'
                    : 'Power-Up Upgrades'}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
              {saveData.shopItems
                .filter((item) => item.category === shopCategory)
                .map((item) => {
                  const canAfford = saveData.coins >= item.price;
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-slate-900/90 border border-white/10 p-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {item.colorHex ? (
                          <div
                            className="w-10 h-10 rounded-xl border border-white/20 shrink-0 shadow-inner"
                            style={{ backgroundColor: item.colorHex }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                            <Award className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-sm text-white">
                            {lang === 'hi' ? item.nameHi : item.nameEn}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {lang === 'hi' ? item.descHi : item.descEn}
                          </p>
                          {item.category === 'UPGRADE' && (
                            <span className="text-[11px] font-mono-tabular text-amber-300">
                              Level {item.upgradeLevel}/{item.maxLevel}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleShopAction(item)}
                        disabled={
                          item.category === 'UPGRADE'
                            ? (item.upgradeLevel || 1) >= (item.maxLevel || 5) || !canAfford
                            : !item.owned && !canAfford
                        }
                        className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition cursor-pointer ${
                          item.category === 'UPGRADE'
                            ? (item.upgradeLevel || 1) >= (item.maxLevel || 5)
                              ? 'bg-slate-800 text-emerald-400 cursor-default'
                              : canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : item.equipped
                            ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                            : item.owned
                            ? 'bg-slate-800 hover:bg-slate-700 text-white'
                            : canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {item.category === 'UPGRADE'
                          ? (item.upgradeLevel || 1) >= (item.maxLevel || 5)
                            ? 'MAXED'
                            : `${item.price} Coins`
                          : item.equipped
                          ? lang === 'hi'
                            ? 'पहना हुआ'
                            : 'Equipped'
                          : item.owned
                          ? lang === 'hi'
                            ? 'पहनें'
                            : 'Equip'
                          : `${item.price} Coins`}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          9. SETTINGS SCREEN
      ===================================================================== */}
      {screenState === 'SETTINGS' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-xl font-extrabold font-display text-white flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-amber-400" />
                <span>{lang === 'hi' ? 'सेटिंग्स (SETTINGS)' : 'GAME SETTINGS'}</span>
              </h2>
              <button
                onClick={() => {
                  soundEngine.playButtonTap();
                  setScreenState('HOME');
                }}
                className="min-h-[44px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
              >
                {lang === 'hi' ? 'बंद करें' : 'Done'}
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {/* Sound ON/OFF */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-white/10">
                <div className="flex items-center gap-2.5">
                  {saveData.settings.sound ? (
                    <Volume2 className="w-5 h-5 text-amber-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-500" />
                  )}
                  <span className="font-semibold">
                    {lang === 'hi' ? 'ध्वनि प्रभाव (Sound SFX)' : 'Sound Effects'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setSaveData((p) => ({
                      ...p,
                      settings: { ...p.settings, sound: !p.settings.sound },
                    }))
                  }
                  className={`min-h-[44px] px-4 rounded-xl font-bold text-xs cursor-pointer ${
                    saveData.settings.sound
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {saveData.settings.sound ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Music ON/OFF */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold">
                    {lang === 'hi' ? 'संगीत (Background Music)' : 'Background Music'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setSaveData((p) => ({
                      ...p,
                      settings: { ...p.settings, music: !p.settings.music },
                    }))
                  }
                  className={`min-h-[44px] px-4 rounded-xl font-bold text-xs cursor-pointer ${
                    saveData.settings.music
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {saveData.settings.music ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Vibration ON/OFF */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-5 h-5 text-sky-400" />
                  <span className="font-semibold">
                    {lang === 'hi' ? 'कंपन (Vibration)' : 'Haptic Vibration'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setSaveData((p) => ({
                      ...p,
                      settings: { ...p.settings, vibration: !p.settings.vibration },
                    }))
                  }
                  className={`min-h-[44px] px-4 rounded-xl font-bold text-xs cursor-pointer ${
                    saveData.settings.vibration
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {saveData.settings.vibration ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* On-Screen Touch Buttons ON/OFF */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <Compass className="w-5 h-5 text-amber-400" />
                  <span className="font-semibold">
                    {lang === 'hi' ? 'ऑन-स्क्रीन बटन' : 'On-Screen Control Buttons'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setSaveData((p) => ({
                      ...p,
                      settings: {
                        ...p.settings,
                        onScreenControls: !p.settings.onScreenControls,
                      },
                    }))
                  }
                  className={`min-h-[44px] px-4 rounded-xl font-bold text-xs cursor-pointer ${
                    saveData.settings.onScreenControls
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {saveData.settings.onScreenControls ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Graphics Quality: LOW / MEDIUM / HIGH */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                <span className="font-semibold block text-xs text-slate-400">
                  {lang === 'hi' ? 'ग्राफिक्स क्वालिटी (Graphics)' : 'Graphics Quality'}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH'] as GraphicsQuality[]).map((q) => (
                    <button
                      key={q}
                      onClick={() =>
                        setSaveData((p) => ({
                          ...p,
                          settings: { ...p.settings, graphics: q },
                        }))
                      }
                      className={`min-h-[44px] rounded-xl font-bold text-xs cursor-pointer ${
                        saveData.settings.graphics === q
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language: English / Hindi */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                <span className="font-semibold flex items-center gap-1.5 text-xs text-slate-400">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'hi' ? 'भाषा (Language)' : 'Language / भाषा'}</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setSaveData((p) => ({
                        ...p,
                        settings: { ...p.settings, language: 'en' },
                      }))
                    }
                    className={`min-h-[44px] rounded-xl font-bold text-xs cursor-pointer ${
                      saveData.settings.language === 'en'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() =>
                      setSaveData((p) => ({
                        ...p,
                        settings: { ...p.settings, language: 'hi' },
                      }))
                    }
                    className={`min-h-[44px] rounded-xl font-bold text-xs cursor-pointer ${
                      saveData.settings.language === 'hi'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    हिंदी (Hindi)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          10. BUILD APK & ANDROID EXPORT MODAL
      ===================================================================== */}
      {showApkModal && (
        <BuildApkModal lang={lang} onClose={() => setShowApkModal(false)} />
      )}
    </div>
  );
}
