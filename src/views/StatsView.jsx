import React from 'react';

function TelemetryChart({ data, lang }) {
  if (!data || data.length < 2) {
    return (
      <div
        style={{
          height: '250px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9cc8ff',
          border: '1px dashed #1e90ff44',
          borderRadius: '8px',
        }}
      >
        {lang === 'ar'
          ? 'لا توجد بيانات تيليميتري كافية لتوليد المخطط البياني.'
          : 'Not enough telemetry data to generate timeline.'}
      </div>
    );
  }

  const width = 900;
  const height = 250;
  const maxTime = Math.max(...data.map((d) => d.t)) || 300;

  const pointsFor = (key) =>
    data
      .map((d) => {
        const x = (d.t / maxTime) * width;
        const y = height - (d[key] / 100) * height;
        return `${x},${y}`;
      })
      .join(' ');

  const lastPoint = data[data.length - 1];

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '250px', display: 'block', overflow: 'visible' }}
      >
        {[0, 25, 50, 75, 100].map((val) => {
          const y = height - (val / 100) * height;
          return (
            <g key={val}>
              <line x1="0" y1={y} x2={width} y2={y} stroke="#1e90ff22" strokeWidth="1" />
              <text x="5" y={y - 4} fill="#1e90ff88" fontSize="10">
                {val}%
              </text>
            </g>
          );
        })}

        <polyline
          points={pointsFor('oxygen')}
          fill="none"
          stroke="#00d4ff"
          strokeWidth="3"
          style={{ filter: 'drop-shadow(0 0 4px #00d4ff88)' }}
        />
        <polyline
          points={pointsFor('food')}
          fill="none"
          stroke="#ffa800"
          strokeWidth="3"
          style={{ filter: 'drop-shadow(0 0 4px #ffa80088)' }}
        />
        <polyline
          points={pointsFor('energy')}
          fill="none"
          stroke="#2bffa8"
          strokeWidth="3"
          style={{ filter: 'drop-shadow(0 0 4px #2bffa888)' }}
        />

        {['oxygen', 'food', 'energy'].map((key) => {
          const color = key === 'oxygen' ? '#00d4ff' : key === 'food' ? '#ffa800' : '#2bffa8';
          const cx = (lastPoint.t / maxTime) * width;
          const cy = height - (lastPoint[key] / 100) * height;
          return (
            <circle
              key={key}
              cx={cx}
              cy={cy}
              r="5"
              fill={color}
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
          );
        })}
      </svg>
    </div>
  );
}

export function StatsView({ onBack, lang }) {
  const stats = JSON.parse(localStorage.getItem('ll_stats') || '{}');
  const games = stats.games || 0;
  const wins = stats.wins || 0;
  const losses = stats.losses || 0;
  const bestTime = stats.bestTime || 0;
  const loseReasons = stats.loseReasons || { oxygen: 0, food: 0, energy: 0 };
  const lastHistory = stats.lastRunHistory || [];

  const totalLoss = loseReasons.oxygen + loseReasons.food + loseReasons.energy || 1;
  const oxyPct = Math.round((loseReasons.oxygen / totalLoss) * 100);
  const foodPct = Math.round((loseReasons.food / totalLoss) * 100);
  const nrgPct = Math.round((loseReasons.energy / totalLoss) * 100);

  const bestM = Math.floor(bestTime / 60);
  const bestS = bestTime % 60;
  const bestFormatted = `${String(bestM).padStart(2, '0')}:${String(bestS).padStart(2, '0')}`;

  const handleClearData = () => {
    if (
      window.confirm(
        lang === 'ar'
          ? 'هل أنت متأكد من مسح جميع بيانات المهمات السابقة؟'
          : 'Are you sure you want to clear all telemetry data?'
      )
    ) {
      localStorage.removeItem('ll_stats');
      window.location.reload();
    }
  };

  return (
    <div
      className="pg pt-18"
      style={{ backgroundImage: "url('/imges/moon2.jpg')" }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="pg-shade" />

      <div className="pg-wrap" style={{ marginTop: '10px', paddingBottom: '40px' }}>
        <div className="pg-head">
          <h2>{lang === 'ar' ? 'إحصائيات المهمة والتيليميتري' : 'MISSION STATS - TELEMETRY'}</h2>
          <div className="flex items-center gap-2">
            <button className="btn-clear" onClick={handleClearData}>
              {lang === 'ar' ? 'مسح السجل' : 'CLEAR DATA'}
            </button>
            <button className="pg-back" onClick={onBack}>
              {lang === 'ar' ? 'الرجوع للقائمة' : 'BACK TO HOME'}
            </button>
          </div>
        </div>

        <div className="st-wrap">
          <div className="st-header">
            <div className="st-avatar" />
            <div className="st-header-info">
              <h2>{lang === 'ar' ? 'قائد طاقم قطاع 04' : 'CREW COMMANDER'}</h2>
              <p>{lang === 'ar' ? 'القاعدة القمرية - قطاع 04' : 'Sector 04 - Lunar Base'}</p>
            </div>
          </div>

          <div className="st-grid">
            <div className="st-card">
              <h3>{lang === 'ar' ? 'إجمالي المهمات' : 'TOTAL MISSIONS'}</h3>
              <div className="val">{games}</div>
            </div>
            <div className="st-card">
              <h3>{lang === 'ar' ? 'المهمات الناجحة (البقاء)' : 'SUCCESSFUL'}</h3>
              <div className="val" style={{ color: '#2bffa8' }}>
                {wins}
              </div>
            </div>
            <div className="st-card">
              <h3>{lang === 'ar' ? 'المهمات غير المكتملة' : 'FAILED'}</h3>
              <div className="val" style={{ color: '#ff3b4e' }}>
                {losses}
              </div>
            </div>
          </div>

          <div className="st-card" style={{ padding: '15px' }}>
            <h3>{lang === 'ar' ? 'أفضل زمن صمود وبقاء' : 'BEST SURVIVAL TIME'}</h3>
            <div className="val" style={{ fontSize: '48px' }}>
              {bestFormatted}
            </div>
          </div>

          <div className="st-chart">
            <h3>{lang === 'ar' ? 'الرسم البياني الزمني للمهمة الأخيرة' : 'LAST MISSION TIMELINE'}</h3>
            <div className="st-legend">
              <span>
                <i style={{ background: '#00d4ff', color: '#00d4ff' }} /> {lang === 'ar' ? 'الأكسجين O2' : 'Oxygen'}
              </span>
              <span>
                <i style={{ background: '#ffa800', color: '#ffa800' }} /> {lang === 'ar' ? 'الغذاء Food' : 'Food'}
              </span>
              <span>
                <i style={{ background: '#2bffa8', color: '#2bffa8' }} /> {lang === 'ar' ? 'الطاقة Energy' : 'Energy'}
              </span>
            </div>
            <TelemetryChart data={lastHistory} lang={lang} />
          </div>

          <div className="st-chart">
            <h3>{lang === 'ar' ? 'أسباب فقدان الاتصال بالقاعدة' : 'WHY THE CREW WAS LOST'}</h3>
            <div className="st-bar-wrap">
              <div className="st-bar-label">{lang === 'ar' ? 'نقص أكسجين' : 'OXYGEN'}</div>
              <div className="st-bar-bg">
                <div
                  className="st-bar-fill"
                  style={{ width: `${oxyPct}%`, background: '#00d4ff', boxShadow: '0 0 10px #00d4ff' }}
                />
              </div>
              <div className="st-bar-val">{oxyPct}%</div>
            </div>

            <div className="st-bar-wrap">
              <div className="st-bar-label">{lang === 'ar' ? 'نفاد الغذاء' : 'FOOD'}</div>
              <div className="st-bar-bg">
                <div
                  className="st-bar-fill"
                  style={{ width: `${foodPct}%`, background: '#ffa800', boxShadow: '0 0 10px #ffa800' }}
                />
              </div>
              <div className="st-bar-val">{foodPct}%</div>
            </div>

            <div className="st-bar-wrap">
              <div className="st-bar-label">{lang === 'ar' ? 'انقطاع الطاقة' : 'ENERGY'}</div>
              <div className="st-bar-bg">
                <div
                  className="st-bar-fill"
                  style={{ width: `${nrgPct}%`, background: '#2bffa8', boxShadow: '0 0 10px #2bffa8' }}
                />
              </div>
              <div className="st-bar-val">{nrgPct}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
