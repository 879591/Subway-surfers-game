import React from 'react';
import {
  ChevronLeft,
  ExternalLink,
  GraduationCap,
  Phone,
  Sparkles,
  User,
} from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

interface AboutDeveloperScreenProps {
  onBack: () => void;
}

export const AboutDeveloperScreen: React.FC<AboutDeveloperScreenProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/15 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 bg-slate-950/60 shrink-0">
          <button
            onClick={() => {
              soundEngine.playButtonTap();
              onBack();
            }}
            className="min-h-[44px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h2 className="text-lg sm:text-xl font-extrabold font-display text-white tracking-wide">
            About Developer
          </h2>
          <div className="w-16" aria-hidden="true" />
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-200">
          {/* Developer Identity & Bio Card */}
          <div className="rounded-2xl bg-slate-950/90 border border-white/10 p-5 space-y-4">
            <div className="flex items-center gap-4">
              <img
                src="/src/assets/images/character_suraj_portrait_1791178616487.jpg"
                alt="Suraj Maurya (5tar Suraj)"
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shrink-0 shadow-lg"
              />
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold font-display text-amber-400 tracking-wide">
                  Suraj Maurya (5tar Suraj) 🇮🇳
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Digital Creator &amp; Developer</span>
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm sm:text-base text-slate-200 leading-relaxed pt-2 border-t border-white/10">
              <p>
                I am Suraj Maurya, a Digital Creator and Developer working under the name 5tar Suraj.
              </p>
              <p>
                I work on Game Development, Web Development, AI &amp; Technology, Digital Design and Creative Digital Projects.
              </p>
              <p>
                This game is an original endless-runner/adventure game developed by me, designed to provide an enjoyable and engaging gaming experience.
              </p>
            </div>
          </div>

          {/* Education Card */}
          <div className="rounded-2xl bg-slate-950/90 border border-white/10 p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <GraduationCap className="w-5 h-5 shrink-0" />
              <h4 className="text-base font-extrabold font-display tracking-wide text-white">
                Education
              </h4>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-200">
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold mt-0.5">•</span>
                <span>Primary Education — Bakhariya Primary School</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold mt-0.5">•</span>
                <span>Class 6–12 — Dileshwari Inter College, Rudhauli, Basti, Uttar Pradesh</span>
              </li>
            </ul>
          </div>

          {/* Connect With Me Card */}
          <div className="rounded-2xl bg-slate-950/90 border border-white/10 p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles className="w-5 h-5 shrink-0" />
              <h4 className="text-base font-extrabold font-display tracking-wide text-white">
                Connect With Me
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/1FDbbX2rcH/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundEngine.playButtonTap()}
                className="min-h-[54px] px-4 py-3 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/40 flex items-center justify-between gap-3 transition active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#1877F2] flex items-center justify-center text-white shrink-0 shadow">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Facebook</div>
                    <div className="text-[11px] text-sky-300 truncate max-w-[160px]">
                      facebook.com/share/1FDbbX2rcH/
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-sky-300 shrink-0" />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/5tar.suraj?stkn=OWZjNXhyb2toanZk"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundEngine.playButtonTap()}
                className="min-h-[54px] px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500/15 via-rose-500/15 to-amber-500/15 hover:from-pink-500/25 hover:to-amber-500/25 border border-pink-500/40 flex items-center justify-between gap-3 transition active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Instagram</div>
                    <div className="text-[11px] text-pink-300 truncate max-w-[160px]">
                      @5tar.suraj
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-pink-300 shrink-0" />
              </a>
            </div>
          </div>

          {/* Contact & Work Card */}
          <div className="rounded-2xl bg-slate-950/90 border border-white/10 p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-amber-400">
              <Phone className="w-5 h-5 shrink-0" />
              <h4 className="text-base font-extrabold font-display tracking-wide text-white">
                Contact &amp; Work
              </h4>
            </div>

            <p className="text-sm text-slate-300">
              For Game, Website, App, Design or other Digital Projects, contact me:
            </p>

            <a
              href="tel:9792006815"
              onClick={() => soundEngine.playButtonTap()}
              className="w-full min-h-[52px] px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-base font-mono-tabular flex items-center justify-center gap-2.5 shadow-lg transition active:scale-[0.98]"
            >
              <span aria-hidden="true">📞</span>
              <span>9792006815</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
