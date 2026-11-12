import React from 'react';
import { NASA_LINKS } from '../constants';

const dirI18n = {
  ar: {
    head: 'دليل شبكة ناسا الرقمية والأبحاث',
    back: 'الرجوع للقائمة',
    sub: `${NASA_LINKS.length} بوابة نشطة. اضغط على أي بطاقة لفتحها في تبويب جديد.`,
    open: 'فتح البوابة ↗',
    whyTitle: 'علاقة هذه الأبحاث باللعبة',
    whyText: 'تطبيق Lunar Lifeline يحول بيانات أبحاث ناسا حول صحة رواد الفضاء إلى تجربة لعب حقيقية: النوم، ضربات القلب، المزاج والتوتر، دورة بقاء المريخ، ونظام الغذاء الفضائي.',
  },
  en: {
    head: 'NASA - DIRECTORY & RESEARCH PORTALS',
    back: 'BACK',
    sub: `${NASA_LINKS.length} active portals. Tap any card to open in a new tab.`,
    open: 'OPEN ↗',
    whyTitle: 'WHY THESE LINKS',
    whyText: 'Lunar Lifeline turns NASA crew-health findings into gameplay: sleep, heart rate, mood and anxiety. Cards tagged GAME show which mechanic each source feeds.',
  },
  fr: {
    head: 'NASA - RÉPERTOIRE & PORTAILS SCIENTIFIQUES',
    back: 'RETOUR',
    sub: `${NASA_LINKS.length} portails actifs. Cliquez sur une carte pour l’ouvrir.`,
    open: 'OUVRIR ↗',
    whyTitle: 'LIEN AVEC LE JEU',
    whyText: 'Lunar Lifeline transforme les recherches de la NASA sur la santé des astronautes en gameplay: sommeil, rythme cardiaque, stress et nourriture spatiale.',
  },
  es: {
    head: 'NASA - DIRECTORIO Y PORTALES CIENTÍFICOS',
    back: 'VOLVER',
    sub: `${NASA_LINKS.length} portales activos. Toca una tarjeta para abrirla.`,
    open: 'ABRIR ↗',
    whyTitle: 'VÍNCULO CON EL JUEGO',
    whyText: 'Lunar Lifeline transforma los estudios de la NASA sobre la salud de los astronautas en mecánicas de juego: sueño, pulso cardíaco, estrés y cultivo espacial.',
  },
  de: {
    head: 'NASA - VERZEICHNIS & FORSCHUNGSPORTALE',
    back: 'ZURÜCK',
    sub: `${NASA_LINKS.length} aktive Portale. Klicke auf eine Karte, um sie zu öffnen.`,
    open: 'ÖFFNEN ↗',
    whyTitle: 'BEDEUTUNG FÜR DAS SPIEL',
    whyText: 'Lunar Lifeline überträgt echte NASA-Forschungsdaten der Astronautengesundheit ins Spielgeschehen: Schlaf, Herzschlag, Strahlenstress und Raumfahrtnahrung.',
  },
};

export function DirectoryView({ onBack, lang }) {
  const t = dirI18n[lang] || dirI18n.en || dirI18n.ar;

  return (
    <div
      className="pg pt-18"
      style={{ backgroundImage: "url('/imges/moon2.jpg')" }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="pg-shade" />
      <div className="pg-art" style={{ backgroundImage: "url('/imges/astronaut2.jpg')" }} />

      <div className="pg-wrap">
        <div className="pg-head">
          <h2>{t.head}</h2>
          <button className="pg-back" onClick={onBack}>
            {t.back}
          </button>
        </div>

        <p className="pg-sub">{t.sub}</p>

        <div className="pg-grid">
          {NASA_LINKS.map((link, idx) => {
            const linkTitle = link.titles?.[lang] || link.titles?.en || '';
            const linkDesc = link.descriptions?.[lang] || link.descriptions?.en || '';
            return (
              <a
                key={idx}
                className="pg-card pg-link"
                href={link.u}
                target="_blank"
                rel="noreferrer"
              >
                <h3>{linkTitle}</h3>
                <p>{linkDesc}</p>
                {link.g && <em className="pg-tag">{link.g}</em>}
                <span>{link.u}</span>
                <div className="pg-open">{t.open}</div>
              </a>
            );
          })}
        </div>

        <div className="pg-why">
          <b>{t.whyTitle}</b>
          <br />
          {t.whyText}
        </div>
      </div>
    </div>
  );
}
