import React, { useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from './usePWAInstall';
import { Language } from '../scripts/GameState';

interface PWAInstallButtonProps {
  lang: Language;
  onOpenApkModal: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ lang, onOpenApkModal }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {isInstallable && (
          <button
            onClick={install}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg transition-transform active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{lang === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App'}</span>
          </button>
        )}

        {isIOS && (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800/90 border border-white/15 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-700 transition whitespace-nowrap cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{lang === 'hi' ? 'iOS पर इंस्टॉल' : 'Install on iOS'}</span>
          </button>
        )}

        <button
          onClick={onOpenApkModal}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <Smartphone className="w-4 h-4 shrink-0" />
          <span>{lang === 'hi' ? 'BUILD APK' : 'BUILD APK'}</span>
        </button>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/15 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white font-display">
                {lang === 'hi' ? 'होम स्क्रीन पर जोड़ें' : 'Install on iPhone / iPad'}
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              1. Tap the <strong>Share</strong> icon in your Safari toolbar.<br />
              2. Scroll down and select <strong>Add to Home Screen</strong> to play 5TAR RUNNER fullscreen offline.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full min-h-[44px] rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition"
            >
              {lang === 'hi' ? 'समझ गया' : 'Got It'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineBanner: React.FC<{ lang: Language }> = ({ lang }) => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-xl">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        {lang === 'hi'
          ? 'ऑफ़लाइन मोड सक्रिय — सभी गेम डेटा सुरक्षित हैं'
          : 'Offline Mode Active — Local Save Enabled'}
      </span>
    </div>
  );
};
