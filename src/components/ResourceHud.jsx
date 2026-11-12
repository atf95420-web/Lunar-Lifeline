import React from 'react';
import { getTranslation } from '../constants/translations';

function MeterItem({ label, value, color, icon }) {
  const activeCount = Math.round(value / 10);

  return (
    <div className="panel" style={{ '--c': color }}>
      <h4 style={{ color }}>
        <span>
          <span aria-hidden="true">{icon}</span> {label}
        </span>
        <span className={value < 25 ? 'low' : ''}>{Math.round(value)}%</span>
      </h4>
      <div className="bar" role="progressbar" aria-valuenow={Math.round(value)}>
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} className={i < activeCount ? 'on' : ''} />
        ))}
      </div>
    </div>
  );
}

export function ResourceHud({ resources, lang }) {
  const t = (key) => getTranslation(key, lang);

  return (
    <div className="hud">
      <MeterItem
        label={t('oxygen')}
        value={resources.oxygen}
        color="#00d4ff"
        icon="🫁"
      />
      <MeterItem
        label={t('food')}
        value={resources.food}
        color="#ffa800"
        icon="🌾"
      />
      <MeterItem
        label={t('energy')}
        value={resources.energy}
        color="#2bffa8"
        icon="⚡"
      />
    </div>
  );
}
