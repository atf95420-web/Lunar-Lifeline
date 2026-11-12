import React from 'react';
import { RESEARCH_ITEMS } from '../constants';

const researchHeadings = {
  ar: { head: 'ملخص أبحاث ناسا لطب الفضاء', back: 'الرجوع للقائمة' },
  en: { head: 'NASA SPACE MEDICINE RESEARCH SUMMARY', back: 'BACK' },
  fr: { head: 'RÉSUMÉ DES RECHERCHES MÉDICALES NASA', back: 'RETOUR' },
  es: { head: 'RESUMEN DE INVESTIGACIÓN MÉDICA NASA', back: 'VOLVER' },
  de: { head: 'ZUSAMMENFASSUNG DER NASA-WELTRAUMMEDIZIN', back: 'ZURÜCK' },
};

export function ResearchView({ onBack, lang }) {
  const slotWidth = 12.5;
  const t = researchHeadings[lang] || researchHeadings.en || researchHeadings.ar;

  return (
    <div className="pg pt-18" style={{ background: '#000' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="pg-head">
        <h2>{t.head}</h2>
        <button className="pg-back" onClick={onBack}>
          {t.back}
        </button>
      </div>

      <div className="rs-frame">
        {RESEARCH_ITEMS.map((item) => {
          const itemTitle = item.titles?.[lang] || item.titles?.en || item.t;
          const itemDesc = item.descriptions?.[lang] || item.descriptions?.en || '';
          return (
            <a
              key={item.t}
              className="rs-slot"
              href={item.u}
              target="_blank"
              rel="noreferrer"
              title="Open the NASA source"
              style={{
                left: `${item.cx - slotWidth / 2}%`,
                top: `${item.y}%`,
              }}
            >
              <b>{itemTitle}</b>
              <span>{itemDesc}</span>
            </a>
          );
        })}
      </div>

      <div className="rs-list">
        {RESEARCH_ITEMS.map((item) => {
          const itemTitle = item.titles?.[lang] || item.titles?.en || item.t;
          const itemDesc = item.descriptions?.[lang] || item.descriptions?.en || '';
          return (
            <a key={item.t} href={item.u} target="_blank" rel="noreferrer">
              <b>{itemTitle}</b>
              {itemDesc}
            </a>
          );
        })}
      </div>
    </div>
  );
}
