import React from 'react';
import { NAV_ITEMS } from '../constants';
import { getTranslation } from '../constants/translations';

export function LandingView({
  onNavigate,
  onPlay,
  loading,
  lang,
}) {
  const t = (key) => getTranslation(key, lang);

  return (
    <div className="lp pt-16" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {loading && (
        <div className="loading-screen">
          <div className="loading-text">{t('loadingProtocol')}</div>
          <div className="loading-bar-wrap">
            <div className="loading-bar" />
          </div>
        </div>
      )}

      <div className="lp-bg" />
      <div className="lp-shade" />

      <header className="lp-top">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-xs font-semibold mb-2 shadow-sm">
          <span>👨‍👩‍👧‍👦</span>
          <span>{t('allAudiencesBadge')}</span>
        </div>

        <h1 className="title">
          LUNAR <b>LIFELINE</b>
        </h1>
        <div className="lp-sub">{t('protocolSubtitle')}</div>
        <p className="lp-hook">{t('heroDescription')}</p>
      </header>

      <nav className="lp-nav">
        {NAV_ITEMS.map((item) => {
          const itemTitle = item.titles?.[lang] || item.titles?.en || '';
          const itemDesc = item.descriptions?.[lang] || item.descriptions?.en || '';
          return (
            <button
              key={item.id}
              className="lp-item relative group"
              onClick={() => onNavigate(item.id)}
            >
              <span className="lp-ico" aria-hidden="true">
                {item.icon}
              </span>
              <span>
                <b className="flex items-center gap-2">
                  <span>{itemTitle}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-cyan-400 text-black px-1.5 py-0.5 rounded font-mono font-bold shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </b>
                <span>{itemDesc}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <button className="btn lp-play" onClick={onPlay} autoFocus>
        {t('playNow')}
      </button>
    </div>
  );
}
