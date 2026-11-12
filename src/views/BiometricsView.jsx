import React, { useState, useEffect } from 'react';

const bioI18n = {
  ar: {
    title: 'صحة القمر - القياسات الحيوية للرائد',
    back: 'الرجوع للقائمة',
    sleepDep: 'حرمان من النوم (SLEEP DEPRIVATION)',
    lowRate: 'منخفض',
    isolation: 'خطر العزلة (ISOLATION RISK)',
    radiation: 'إجهاد الإشعاع (RADIATION STRESS)',
    note: 'النوم حوالي 6 ساعات، نبضات قلب منخفضة في الراحة، وضغوط العزلة والإشعاع: مخاطر صحة الطاقم الأربعة الموثقة بناسا.',
  },
  en: {
    title: 'LUNAR HEALTH - BIOMETRIC TELEMETRY',
    back: 'BACK',
    sleepDep: 'SLEEP DEPRIVATION',
    lowRate: 'LOW',
    isolation: 'ISOLATION RISK',
    radiation: 'RADIATION STRESS',
    note: 'Sleep around 6 h, lower resting heart rate, isolation and radiation stress: the four NASA crew-health risks.',
  },
  fr: {
    title: 'SANTÉ LUNAIRE - TÉLÉMÉTRIE BIOMÉTRIQUE',
    back: 'RETOUR',
    sleepDep: 'MANQUE DE SOMMEIL',
    lowRate: 'BAS',
    isolation: 'RISQUE D’ISOLEMENT',
    radiation: 'STRESS DES RADIATIONS',
    note: 'Environ 6 h de sommeil, rythme cardiaque bas au repos, isolement et stress des radiations: les quatre risques majeurs de la NASA.',
  },
  es: {
    title: 'SALUD LUNAR - TELEMETRÍA BIOMÉTRICA',
    back: 'VOLVER',
    sleepDep: 'PRIVACIÓN DE SUEÑO',
    lowRate: 'BAJO',
    isolation: 'RIESGO DE AISLAMIENTO',
    radiation: 'ESTRÉS POR RADIACIÓN',
    note: 'Dormir unas 6 h, ritmo cardíaco bajo en reposo, aislamiento y radiación: los cuatro riesgos clave de salud de la NASA.',
  },
  de: {
    title: 'MONDGESUNDHEIT - BIOMETRISCHE TELEMETRIE',
    back: 'ZURÜCK',
    sleepDep: 'SCHLAFENTZUG',
    lowRate: 'NIEDRIG',
    isolation: 'ISOLATIONSRISIKO',
    radiation: 'STRAHLUNGSSTRESS',
    note: 'Etwa 6 Std. Schlaf, niedriger Ruhepuls, Isolation und Strahlungsbelastung: die vier NASA-Hauptgesundheitsrisiken.',
  },
};

export function BiometricsView({ onBack, lang }) {
  const [bpm, setBpm] = useState(62);
  const t = bioI18n[lang] || bioI18n.en || bioI18n.ar;

  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      setBpm(62 + Math.round(Math.sin(tick / 2) * 3));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pg pt-18" style={{ background: '#000' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="pg-head">
        <h2>{t.title}</h2>
        <button className="pg-back" onClick={onBack}>
          {t.back}
        </button>
      </div>

      <div className="bm-frame">
        <div
          className="bm-slot"
          style={{ left: '5.5%', top: '20%', width: '29%', height: '19%' }}
        >
          <span className="bm-big">6.0 h</span>
          <div className="bm-segs">
            {Array.from({ length: 8 }, (_, idx) => (
              <i key={idx} className={idx < 6 ? 'on' : ''} />
            ))}
          </div>
          <span className="bm-tag">{t.sleepDep}</span>
        </div>

        <div
          className="bm-slot"
          style={{
            left: '16%',
            top: '50%',
            width: '19%',
            height: '7%',
            alignItems: 'flex-end',
          }}
        >
          <span className="bm-tag">{bpm} BPM · {t.lowRate}</span>
        </div>

        <div
          className="bm-slot"
          style={{ left: '66%', top: '14.5%', width: '20%', height: '5%' }}
        >
          <span className="bm-tag">{t.isolation}</span>
        </div>

        <div
          className="bm-slot"
          style={{
            left: '70%',
            top: '54%',
            width: '24%',
            height: '5%',
            alignItems: 'flex-end',
          }}
        >
          <span className="bm-tag">{t.radiation}</span>
        </div>
      </div>

      <p className="bm-note">{t.note}</p>
    </div>
  );
}
