import React, { useState, useRef, useEffect } from 'react';
import { getTranslation, SUPPORTED_LANGUAGES } from '../constants/translations';

export function StickyHeader({
  view,
  onNavigate,
  lang,
  onSetLanguage,
  soundEnabled,
  onToggleSound,
}) {
  const isHome = view === 'landing';
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const t = (key) => getTranslation(key, lang);

  const navItems = [
    { id: 'landing', labelKey: 'home', icon: '🏠' },
    { id: 'game', labelKey: 'mission', icon: '🎮' },
    { id: 'animation', labelKey: 'animationStudio', icon: '🌌' },
    { id: 'health', labelKey: 'biometrics', icon: '🌙' },
    { id: 'research', labelKey: 'nasaResearch', icon: '🔬' },
    { id: 'stats', labelKey: 'telemetryStats', icon: '📊' },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/30 px-3 sm:px-6 flex items-center justify-between text-xs select-none shadow-[0_4px_25px_rgba(0,0,0,0.8)]"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {!isHome && (
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-400 bg-cyan-950/80 text-cyan-200 hover:bg-cyan-500 hover:text-black font-bold transition-all shadow-[0_0_12px_rgba(0,212,255,0.3)] active:scale-95"
            title={t('backToHome')}
          >
            <span className={lang === 'ar' ? 'rotate-180 inline-block' : ''}>←</span>
            <span>{t('back')}</span>
          </button>
        )}

        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 group text-left"
        >
          <span className="w-7 h-7 rounded-full border border-cyan-400/60 bg-gradient-to-br from-cyan-500/20 to-blue-900/40 flex items-center justify-center text-sm shadow-[0_0_10px_rgba(0,212,255,0.3)]">
            🌕
          </span>
          <div className="leading-tight">
            <span className="font-extrabold text-sm tracking-wider text-white group-hover:text-cyan-300 transition-colors">
              LUNAR <span className="text-cyan-400">LIFELINE</span>
            </span>
            <span className="hidden md:block text-[10px] text-cyan-300/70 font-mono tracking-widest">
              {t('sectorSubtitle')}
            </span>
          </div>
        </button>
      </div>

      <nav className="hidden lg:flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-900/70 p-1 rounded-xl border border-slate-800">
        {navItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              view === tab.id
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,212,255,0.4)]'
                : 'hover:text-white hover:bg-slate-800/80 text-slate-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{t(tab.labelKey)}</span>
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-950/50 border border-cyan-500/30 text-[10px] text-cyan-300 font-semibold"
          title={t('allAudiencesBadge')}
        >
          <span>👨‍👩‍👧‍👦</span>
          <span>{lang === 'ar' ? 'لكل الأعمار' : 'All Ages'}</span>
        </span>

        {view !== 'animation' && (
          <button
            onClick={() => onNavigate('animation')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 hover:bg-cyan-500 hover:text-black font-semibold transition-all lg:hidden"
            title={t('animationStudio')}
          >
            <span>🌌</span>
          </button>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/50 bg-slate-900/95 hover:border-cyan-400 text-slate-100 hover:text-white font-bold transition-all shadow-sm active:scale-95"
            title="Language / اللغة"
          >
            <span className="text-sm">{currentLangObj.flag}</span>
            <span>{currentLangObj.label}</span>
            <span className="text-[10px] text-cyan-400">▼</span>
          </button>

          {langMenuOpen && (
            <div
              className={`absolute top-full mt-1.5 w-44 bg-slate-950/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                lang === 'ar' ? 'left-0' : 'right-0'
              }`}
            >
              <div className="px-2 py-1 text-[10px] font-bold text-cyan-400/80 border-b border-slate-800">
                {lang === 'ar' ? 'اختر لغة العرض:' : 'Choose Language:'}
              </div>
              <div className="flex flex-col gap-0.5 mt-1">
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onSetLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      lang === l.code
                        ? 'bg-cyan-500 text-black font-extrabold shadow-sm'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{l.flag}</span>
                      <span>{l.label}</span>
                    </span>
                    {lang === l.code && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onToggleSound}
          className={`p-1.5 rounded-lg border transition-all ${
            soundEnabled
              ? 'border-cyan-400/60 bg-cyan-950/70 text-cyan-300'
              : 'border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300'
          }`}
          title={soundEnabled ? t('mute') : t('unmute')}
        >
          <span>{soundEnabled ? '🔊' : '🔇'}</span>
        </button>
      </div>
    </header>
  );
}
