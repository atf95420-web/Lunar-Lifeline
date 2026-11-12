import React, { useState } from 'react';
import { usePreferences } from './hooks/usePreferences';
import { playAudioBeep } from './audio/sound';
import { StickyHeader } from './components/StickyHeader';
import { LandingView } from './views/LandingView';
import { GameView } from './views/GameView';
import { CosmicAnimationStudio } from './views/CosmicAnimationStudio';
import { BiometricsView } from './views/BiometricsView';
import { ResearchView } from './views/ResearchView';
import { DirectoryView } from './views/DirectoryView';
import { StatsView } from './views/StatsView';

export default function App() {
  const { lang, sound, setLanguage, toggleSound } = usePreferences();
  const [view, setView] = useState('landing');
  const [loading, setLoading] = useState(false);

  const handlePlayNow = () => {
    setLoading(true);
    if (sound) playAudioBeep(880, 0.1);
    setTimeout(() => {
      if (sound) playAudioBeep(1100, 0.15);
      setTimeout(() => {
        setLoading(false);
        setView('game');
      }, 400);
    }, 2000);
  };

  const backToHome = () => setView('landing');

  return (
    <div
      className="relative min-h-screen bg-black text-slate-100 font-sans"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <StickyHeader
        view={view}
        onNavigate={setView}
        lang={lang}
        onSetLanguage={setLanguage}
        soundEnabled={sound}
        onToggleSound={toggleSound}
      />

      {view === 'landing' && (
        <LandingView
          onNavigate={setView}
          onPlay={handlePlayNow}
          loading={loading}
          lang={lang}
        />
      )}

      {view === 'game' && (
        <GameView
          onBack={backToHome}
          onOpenAnimation={() => setView('animation')}
          onOpenStats={() => setView('stats')}
          lang={lang}
          soundEnabled={sound}
          playBeep={(freq, duration) => sound && playAudioBeep(freq, duration)}
        />
      )}

      {view === 'animation' && (
        <CosmicAnimationStudio onBack={backToHome} lang={lang} />
      )}

      {view === 'health' && <BiometricsView onBack={backToHome} lang={lang} />}

      {view === 'research' && <ResearchView onBack={backToHome} lang={lang} />}

      {view === 'nasa' && <DirectoryView onBack={backToHome} lang={lang} />}

      {view === 'stats' && <StatsView onBack={backToHome} lang={lang} />}
    </div>
  );
}
