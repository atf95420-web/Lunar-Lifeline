import React, { useRef, useEffect, useState } from 'react';

const drawCenteredCover = (ctx, img, dx, dy, dw, dh) => {
  if (!img || !img.complete || !img.naturalWidth || !img.naturalHeight) return;
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const minDim = Math.min(nw, nh);
  const sx = (nw - minDim) / 2;
  const sy = (nh - minDim) / 2;
  ctx.drawImage(img, sx, sy, minDim, minDim, dx, dy, dw, dh);
};

export function CosmicAnimationStudio({ onBack, lang }) {
  const canvasRef = useRef(null);

  const [cameraMode, setCameraMode] = useState('orrery');
  const [orbitSpeed, setOrbitSpeed] = useState(1.0);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [solarStorm, setSolarStorm] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const [evaTelemetry] = useState({
    suitPressure: 4.3,
    coreTemp: 36.8,
    pulseRate: 72,
    co2Washout: 0.08,
  });

  const audioCtxRef = useRef(null);
  const humOscRef = useRef(null);

  useEffect(() => {
    if (soundEnabled) {
      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtxClass) return;
        const ctx = new AudioCtxClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 55;
        gain.gain.value = 0.03;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        audioCtxRef.current = ctx;
        humOscRef.current = osc;
      } catch {}
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [soundEnabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let angle = 0;

    const earthImg = new Image();
    earthImg.src = '/imges/earth.jpg';
    const moonImg = new Image();
    moonImg.src = '/imges/moon2.jpg';
    const marsImg = new Image();
    marsImg.src = '/imges/mars.jpg';
    const astroImg = new Image();
    astroImg.src = '/imges/astronaut_eva.jpg';
    const solarImg = new Image();
    solarImg.src = '/imges/solar.jpg';
    const hydroImg = new Image();
    hydroImg.src = '/imges/hydroponics.jpg';

    const stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1200,
        z: Math.random() * 800 + 100,
        size: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    const stormParticles = [];

    const render = () => {
      angle += 0.008 * orbitSpeed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      const spaceGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, w * 0.8);
      spaceGrad.addColorStop(0, '#030814');
      spaceGrad.addColorStop(0.5, '#01040a');
      spaceGrad.addColorStop(1, '#000000');
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, w, h);

      stars.forEach((s) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * (0.8 + Math.sin(angle * 4 + s.x) * 0.2)})`;
        ctx.beginPath();
        ctx.arc(cx + s.x * (400 / s.z), cy + s.y * (400 / s.z), s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (solarStorm) {
        if (Math.random() < 0.4) {
          stormParticles.push({
            x: 0,
            y: Math.random() * h,
            vx: 3 + Math.random() * 5,
            vy: (Math.random() - 0.5) * 1.5,
            color: Math.random() < 0.5 ? '#f59e0b' : '#38bdf8',
          });
        }

        ctx.save();
        for (let i = stormParticles.length - 1; i >= 0; i--) {
          const sp = stormParticles[i];
          sp.x += sp.vx;
          sp.y += sp.vy;

          ctx.strokeStyle = sp.color;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = sp.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.moveTo(sp.x, sp.y);
          ctx.lineTo(sp.x - sp.vx * 3, sp.y - sp.vy * 3);
          ctx.stroke();

          if (sp.x > w + 20) stormParticles.splice(i, 1);
        }
        ctx.restore();
      }

      const earthX = cx - (cameraMode === 'orrery' ? 70 : 0);
      const earthY = cy;
      const earthR = cameraMode === 'earth' ? 140 : 54;

      const moonDist = cameraMode === 'moon' ? 0 : 160;
      const moonX = cameraMode === 'moon' ? cx : earthX + Math.cos(angle * 1.2) * moonDist;
      const moonY = cameraMode === 'moon' ? cy : earthY + Math.sin(angle * 1.2) * (moonDist * 0.55);
      const moonR = cameraMode === 'moon' ? 120 : 22;

      const marsDist = cameraMode === 'mars' ? 0 : 330;
      const marsX = cameraMode === 'mars' ? cx : earthX + Math.cos(angle * 0.6 + 1.2) * marsDist;
      const marsY = cameraMode === 'mars' ? cy : earthY + Math.sin(angle * 0.6 + 1.2) * (marsDist * 0.5);
      const marsR = cameraMode === 'mars' ? 130 : 32;

      const stationX = earthX + Math.cos(angle * 2.1) * 90;
      const stationY = earthY + Math.sin(angle * 2.1) * 50;

      const solarSatX = earthX + Math.cos(angle * 1.6 + Math.PI) * 115;
      const solarSatY = earthY + Math.sin(angle * 1.6 + Math.PI) * 65;

      const astroBaseX = cameraMode === 'astronaut' ? cx : moonX + Math.cos(angle * 3.5) * 45;
      const astroBaseY = cameraMode === 'astronaut' ? cy : moonY + Math.sin(angle * 3.5) * 28;

      if (showOrbits && cameraMode === 'orrery') {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);

        ctx.beginPath();
        ctx.ellipse(earthX, earthY, moonDist, moonDist * 0.55, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.beginPath();
        ctx.ellipse(earthX, earthY, marsDist, marsDist * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.beginPath();
        ctx.ellipse(earthX, earthY, 90, 50, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      const renderPlanet = (
        x,
        y,
        radius,
        img,
        name,
        nameAr,
        haloColor
      ) => {
        ctx.save();
        const rimGrad = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 1.25);
        rimGrad.addColorStop(0, `${haloColor}55`);
        rimGrad.addColorStop(1, `${haloColor}00`);
        ctx.fillStyle = rimGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.clip();

        if (img.complete) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle * 0.3);
          drawCenteredCover(ctx, img, -radius * 1.05, -radius * 1.05, radius * 2.1, radius * 2.1);
          ctx.restore();
        } else {
          ctx.fillStyle = haloColor;
          ctx.fill();
        }

        const shadowGrad = ctx.createLinearGradient(
          x - radius * 0.6,
          y - radius * 0.6,
          x + radius,
          y + radius
        );
        shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shadowGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0.35)');
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        if (showLabels && cameraMode !== 'helmet') {
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.font = '11px "Segoe UI", Tahoma, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(lang === 'ar' ? nameAr : name, x, y + radius + 16);
          ctx.restore();
        }
      };

      if (cameraMode === 'orrery' || cameraMode === 'mars') {
        renderPlanet(marsX, marsY, marsR, marsImg, 'Mars - Red Planet', 'المريخ - الكوكب الأحمر', '#ef4444');
      }

      if (cameraMode === 'orrery' || cameraMode === 'earth') {
        renderPlanet(earthX, earthY, earthR, earthImg, 'Earth - Home World', 'كوكب الأرض - الوطن', '#38bdf8');
      }

      if (cameraMode === 'orrery' || cameraMode === 'moon' || cameraMode === 'astronaut') {
        renderPlanet(moonX, moonY, moonR, moonImg, 'The Moon - Artemis Base', 'القمر - قاعدة أرتميس', '#94a3b8');
      }

      if (cameraMode === 'orrery') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(stationX, stationY, 15, 0, Math.PI * 2);
        ctx.clip();
        if (hydroImg.complete) {
          drawCenteredCover(ctx, hydroImg, stationX - 15, stationY - 15, 30, 30);
        }
        ctx.restore();
        ctx.beginPath();
        ctx.arc(stationX, stationY, 15, 0, Math.PI * 2);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.arc(solarSatX, solarSatY, 15, 0, Math.PI * 2);
        ctx.clip();
        if (solarImg.complete) {
          drawCenteredCover(ctx, solarImg, solarSatX - 15, solarSatY - 15, 30, 30);
        }
        ctx.restore();
        ctx.beginPath();
        ctx.arc(solarSatX, solarSatY, 15, 0, Math.PI * 2);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (cameraMode === 'orrery' || cameraMode === 'astronaut') {
        const ax = astroBaseX;
        const ay = astroBaseY;
        const aScale = cameraMode === 'astronaut' ? 2.8 : 1.0;

        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(Math.sin(angle * 2) * 0.15);

        ctx.save();
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
        ctx.lineWidth = 1.5 * aScale;
        ctx.beginPath();
        ctx.moveTo(0, 10 * aScale);
        ctx.bezierCurveTo(
          -25 * aScale,
          20 * aScale + Math.sin(angle * 4) * 8 * aScale,
          -50 * aScale,
          40 * aScale + Math.cos(angle * 3) * 6 * aScale,
          -80 * aScale,
          60 * aScale
        );
        ctx.stroke();
        ctx.restore();

        if (Math.sin(angle * 6) > 0.2) {
          ctx.save();
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#00d4ff';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.ellipse(-14 * aScale, 8 * aScale, 4 * aScale, 10 * aScale, 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        const aRadius = 16 * aScale;
        ctx.beginPath();
        ctx.arc(0, 0, aRadius, 0, Math.PI * 2);
        ctx.clip();

        if (astroImg.complete) {
          drawCenteredCover(ctx, astroImg, -aRadius, -aRadius, aRadius * 2, aRadius * 2);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }

        ctx.restore();
        ctx.save();
        ctx.translate(ax, ay);
        ctx.beginPath();
        ctx.arc(0, 0, 16 * aScale, 0, Math.PI * 2);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 8;
        ctx.stroke();

        if (cameraMode === 'astronaut') {
          ctx.fillStyle = '#38bdf8';
          ctx.font = '12px "Segoe UI", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            lang === 'ar' ? 'رائد الفضاء في مهمة السير الحر (EVA)' : 'Astronaut Spacewalk (EVA)',
            0,
            24 * aScale + 20
          );
        }
        ctx.restore();
      }

      if (cameraMode === 'helmet') {
        ctx.save();

        const visorGrad = ctx.createRadialGradient(cx, cy, h * 0.4, cx, cy, h * 0.85);
        visorGrad.addColorStop(0, 'rgba(217, 119, 6, 0.05)');
        visorGrad.addColorStop(0.7, 'rgba(217, 119, 6, 0.15)');
        visorGrad.addColorStop(1, 'rgba(10, 15, 25, 0.95)');
        ctx.fillStyle = visorGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, w - 40, h - 40);

        ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 38, 0, Math.PI * 2);
        ctx.moveTo(cx - 50, cy);
        ctx.lineTo(cx - 20, cy);
        ctx.moveTo(cx + 20, cy);
        ctx.lineTo(cx + 50, cy);
        ctx.moveTo(cx, cy - 50);
        ctx.lineTo(cx, cy - 20);
        ctx.moveTo(cx, cy + 20);
        ctx.lineTo(cx, cy + 50);
        ctx.stroke();

        ctx.fillStyle = '#00d4ff';
        ctx.font = '12px monospace';
        ctx.fillText(`SUIT PRESS: ${evaTelemetry.suitPressure.toFixed(1)} PSI [NOMINAL]`, 40, 55);
        ctx.fillText(`CORE TEMP: ${evaTelemetry.coreTemp.toFixed(1)} °C`, 40, 75);
        ctx.fillText(`HEART PULSE: ${evaTelemetry.pulseRate} BPM`, 40, 95);
        ctx.fillText(`O2 TANK: 94.2% - FLOW OPTIMAL`, 40, 115);

        ctx.textAlign = 'right';
        ctx.fillText(`LUNAR HORIZON LOCK: ACQUIRED`, w - 40, 55);
        ctx.fillText(`TARGET: SECTOR 04 BASE`, w - 40, 75);
        ctx.fillText(`ELEVATION: 112 KM - LOW ORBIT`, w - 40, 95);

        ctx.save();
        ctx.translate(cx + Math.sin(angle) * 30, cy + Math.cos(angle) * 20);
        ctx.beginPath();
        ctx.arc(0, 0, 75, 0, Math.PI * 2);
        ctx.clip();
        if (moonImg.complete) {
          drawCenteredCover(ctx, moonImg, -75, -75, 150, 150);
        }
        ctx.restore();

        const tX = cx + Math.sin(angle) * 30;
        const tY = cy + Math.cos(angle) * 20;
        ctx.strokeStyle = '#2bffa8';
        ctx.lineWidth = 2;
        const bSize = 85;
        ctx.strokeRect(tX - bSize, tY - bSize, bSize * 2, bSize * 2);
        ctx.fillStyle = '#2bffa8';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`TARGET LOCKED: MOON BASE`, tX - bSize, tY - bSize - 6);

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [cameraMode, orbitSpeed, showOrbits, showLabels, solarStorm, lang, evaTelemetry]);

  return (
    <div className="relative min-h-screen bg-black text-slate-100 flex flex-col font-sans select-none pt-14">
      <header className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-cyan-500/30 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-300 border border-cyan-500/40 rounded hover:bg-cyan-500/20 transition-colors"
          >
            ← {lang === 'ar' ? 'الرجوع للقاعدة' : 'Back to Base'}
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-widest">
              {lang === 'ar' ? 'استوديو الأنيميشن والمدارات الفضائية' : 'COSMIC ORBIT & ANIMATION STUDIO'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSolarStorm(!solarStorm)}
            className={`px-2.5 py-1 text-xs rounded border transition-colors flex items-center gap-1.5 ${
              solarStorm
                ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>☀️</span>
            <span>{lang === 'ar' ? 'عاصفة شمسية' : 'Solar Storm'}</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-2.5 py-1 text-xs rounded border transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{soundEnabled ? '🔊' : '🔇'}</span>
            <span className="hidden sm:inline">
              {soundEnabled ? (lang === 'ar' ? 'صوت الفضاء' : 'Sound ON') : (lang === 'ar' ? 'صامت' : 'Muted')}
            </span>
          </button>
        </div>
      </header>

      <div className="relative flex-1 flex flex-col justify-center items-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full max-h-[calc(100vh-140px)] object-contain block bg-black"
        />

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-1 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-cyan-500/30 shadow-lg">
          {[
            { id: 'orrery', icon: '🌐', labelAr: 'النظام الشامل', labelEn: 'Orbital Orrery' },
            { id: 'astronaut', icon: '👨‍🚀', labelAr: 'السير في الفضاء', labelEn: 'Spacewalk EVA' },
            { id: 'helmet', icon: '🪟', labelAr: 'خوذة الرائد', labelEn: 'Helmet HUD' },
            { id: 'earth', icon: '🌍', labelAr: 'الأرض', labelEn: 'Earth' },
            { id: 'moon', icon: '🌕', labelAr: 'القمر', labelEn: 'The Moon' },
            { id: 'mars', icon: '🔴', labelAr: 'المريخ', labelEn: 'Mars' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setCameraMode(mode.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${
                cameraMode === mode.id
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,212,255,0.6)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{mode.icon}</span>
              <span>{lang === 'ar' ? mode.labelAr : mode.labelEn}</span>
            </button>
          ))}
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              {lang === 'ar' ? 'سرعة دوران المدارات:' : 'Orbit Speed:'}
            </span>
            <input
              type="range"
              min="0.1"
              max="4.0"
              step="0.1"
              value={orbitSpeed}
              onChange={(e) => setOrbitSpeed(parseFloat(e.target.value))}
              className="w-28 sm:w-36 accent-cyan-400 cursor-pointer"
            />
            <span className="font-mono text-cyan-300 font-bold">{orbitSpeed.toFixed(1)}x</span>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showOrbits}
                onChange={(e) => setShowOrbits(e.target.checked)}
                className="accent-cyan-400"
              />
              <span>{lang === 'ar' ? 'مسارات المدارات' : 'Orbital Rings'}</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="accent-cyan-400"
              />
              <span>{lang === 'ar' ? 'أسماء الأجرام' : 'Labels'}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
