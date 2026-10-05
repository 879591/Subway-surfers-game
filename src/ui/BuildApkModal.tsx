import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileCode2,
  FolderGit2,
  Layers,
  ShieldCheck,
  Smartphone,
  Terminal,
  X,
} from 'lucide-react';
import { Language } from '../scripts/GameState';

interface BuildApkModalProps {
  lang: Language;
  onClose: () => void;
}

const CAPACITOR_CONFIG_JSON = `{
  "appId": "com.surajadventure.fivestarrunner",
  "appName": "5TAR RUNNER - Suraj's Adventure",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "buildOptions": {
      "keystorePath": "release-key.keystore",
      "keystoreAlias": "5tar_runner_key"
    }
  }
}`;

const BUILD_SCRIPT_SH = `#!/usr/bin/env bash
# ==============================================================================
# 5TAR RUNNER – Suraj's Adventure | Official Android APK & AAB Build Script
# Generates:
#   1. Debug APK   (android/app/build/outputs/apk/debug/app-debug.apk)
#   2. Release APK (android/app/build/outputs/apk/release/app-release.apk)
#   3. Android App Bundle AAB (android/app/build/outputs/bundle/release/app-release.aab)
# ==============================================================================

set -e

echo "=== [1/5] Installing Capacitor Android Packaging Dependencies ==="
npm install @capacitor/core @capacitor/cli @capacitor/android

echo "=== [2/5] Compiling Production WebGL / Offline Bundle ==="
npm run build

echo "=== [3/5] Initializing Android Native Project (if not initialized) ==="
if [ ! -d "android" ]; then
  npx cap add android
fi
npx cap sync android

echo "=== [4/5] Building Debug APK & Release APK via Gradle ==="
cd android
chmod +x gradlew
./gradlew assembleDebug
./gradlew assembleRelease

echo "=== [5/5] Building Google Play Android App Bundle (AAB) ==="
./gradlew bundleRelease

echo "✅ BUILD COMPLETE!"
echo "-> Debug APK:   android/app/build/outputs/apk/debug/app-debug.apk"
echo "-> Release APK: android/app/build/outputs/apk/release/app-release.apk"
echo "-> Release AAB: android/app/build/outputs/bundle/release/app-release.aab"
`;

const TWA_MANIFEST_JSON = `{
  "packageId": "com.surajadventure.fivestarrunner",
  "name": "5TAR RUNNER – Suraj's Adventure",
  "launcherName": "5TAR RUNNER",
  "display": "fullscreen",
  "orientation": "portrait",
  "themeColor": "#0F172A",
  "navigationColor": "#0F172A",
  "backgroundColor": "#0F172A",
  "enableNotifications": false,
  "startUrl": "/",
  "iconUrl": "/pwa-512x512.png",
  "maskableIconUrl": "/pwa-maskable-512x512.png",
  "signingKey": {
    "path": "./android.keystore",
    "alias": "5tar-runner-key"
  },
  "appVersionName": "1.0.0",
  "appVersionCode": 1
}`;

export const BuildApkModal: React.FC<BuildApkModalProps> = ({ lang, onClose }) => {
  const [activeTab, setActiveTab] = useState<'CAPACITOR' | 'BUBBLEWRAP' | 'ASSETS'>('CAPACITOR');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadFile = (filename: string, content: string, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-white/15 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display tracking-wide">
                {lang === 'hi'
                  ? 'BUILD APK / AAB — एंड्रॉइड बिल्ड सिस्टम'
                  : 'BUILD APK & AAB — Android Export System'}
              </h2>
              <p className="text-xs text-slate-400">
                packageId: <span className="font-mono-tabular text-amber-300">com.surajadventure.fivestarrunner</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/10 bg-slate-900">
          <button
            onClick={() => setActiveTab('CAPACITOR')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'CAPACITOR'
                ? 'border-amber-400 text-amber-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            1. Capacitor Gradle (Debug APK / Release APK / AAB)
          </button>
          <button
            onClick={() => setActiveTab('BUBBLEWRAP')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'BUBBLEWRAP'
                ? 'border-amber-400 text-amber-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            2. Android TWA / Direct Mobile Install
          </button>
          <button
            onClick={() => setActiveTab('ASSETS')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'ASSETS'
                ? 'border-amber-400 text-amber-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            3. Download Official Logo & App Icons
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300">
          {activeTab === 'CAPACITOR' && (
            <>
              <div className="rounded-2xl bg-slate-950/90 border border-white/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <span>Download Automated Android APK & AAB Build Script</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Generates <span className="text-white font-mono-tabular">app-debug.apk</span>,{' '}
                    <span className="text-white font-mono-tabular">app-release.apk</span>, and{' '}
                    <span className="text-white font-mono-tabular">app-release.aab</span> from this project tree.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => downloadFile('build-android-apk.sh', BUILD_SCRIPT_SH, 'text/x-shellscript')}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download build-apk.sh</span>
                  </button>
                  <button
                    onClick={() => downloadFile('capacitor.config.json', CAPACITOR_CONFIG_JSON, 'application/json')}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                  >
                    <FileCode2 className="w-4 h-4 text-amber-400" />
                    <span>capacitor.config.json</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Exact Terminal Commands to Build Debug APK, Release APK & AAB:
                  </span>
                  <button
                    onClick={() => copyText('script', BUILD_SCRIPT_SH)}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-amber-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === 'script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'script' ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-xs font-mono-tabular text-emerald-300 overflow-x-auto leading-relaxed">
                  {BUILD_SCRIPT_SH}
                </pre>
              </div>
            </>
          )}

          {activeTab === 'BUBBLEWRAP' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-950/90 border border-white/10 p-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Play Immediately on Any Android Phone (Offline PWA + TWA)</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  1. Open this game URL on your Android phone in Chrome and tap <strong>"Install App"</strong> in the top bar (or Chrome menu &rarr; <strong>Add to Home screen / Install app</strong>) to install the full offline-capable game with custom 5TAR icon.<br />
                  2. Or compile a standalone signed APK &amp; AAB using Google's official <strong>Bubblewrap CLI</strong> with the manifest below:
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => downloadFile('twa-manifest.json', TWA_MANIFEST_JSON, 'application/json')}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download twa-manifest.json</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-xs font-mono-tabular text-amber-200 overflow-x-auto leading-relaxed">
{`# Build Signed Android APK & AAB via Bubblewrap CLI
npm i -g @bubblewrap/cli
bubblewrap init --manifest=twa-manifest.json
bubblewrap build
# Outputs: app-release-signed.apk and app-release-bundle.aab`}
              </pre>
            </div>
          )}

          {activeTab === 'ASSETS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-950 border border-white/10 p-4 flex flex-col justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/icon.svg"
                    alt="5TAR RUNNER Vector Icon"
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl border border-amber-500/40"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">Original 5TAR App Icon</h4>
                    <p className="text-xs text-slate-400">Scalable SVG + 512x512 Adaptive PNG</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/icon.svg"
                    download="5tar-runner-icon.svg"
                    className="min-h-[44px] flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Icon SVG</span>
                  </a>
                  <a
                    href="/pwa-512x512.png"
                    download="5tar-runner-icon-512x512.png"
                    className="min-h-[44px] flex-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>512x512 PNG</span>
                  </a>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950 border border-white/10 p-4 flex flex-col justify-between gap-4">
                <div>
                  <img
                    src="/logo.svg"
                    alt="5TAR RUNNER Official Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-16 object-contain"
                  />
                  <h4 className="font-bold text-white text-sm mt-2">5TAR RUNNER Game Logo</h4>
                  <p className="text-xs text-slate-400">Transparent vector SVG &amp; high-contrast banner</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/logo.svg"
                    download="5tar-runner-logo.svg"
                    className="min-h-[44px] flex-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Logo SVG</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
