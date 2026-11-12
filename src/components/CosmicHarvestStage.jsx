import React, { useRef, useEffect, useState, useCallback } from 'react';

const drawCenteredCover = (ctx, img, dx, dy, dw, dh) => {
  if (!img || !img.complete || !img.naturalWidth || !img.naturalHeight) return;
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const minDim = Math.min(nw, nh);
  const sx = (nw - minDim) / 2;
  const sy = (nh - minDim) / 2;
  ctx.drawImage(img, sx, sy, minDim, minDim, dx, dy, dw, dh);
};

export function CosmicHarvestStage({
  resources,
  onGather,
  generatorDown,
  onRepairGenerator,
  playBeep,
  lang,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const astronautPos = useRef({ x: 340, y: 240, vx: 0, vy: 0, angle: 0 });
  const targetPos = useRef({ x: 340, y: 240 });

  const dronePos = useRef({ x: 370, y: 220, angle: 0 });
  const repairProgress = useRef(0);

  const lastHarvestTime = useRef({
    oxygen: 0,
    food: 0,
    energy: 0,
  });

  const particles = useRef([]);
  const floatingTexts = useRef([]);
  const [hudFeedback, setHudFeedback] = useState('');

  const orbs = useRef([
    { id: 1, x: 120, y: 140, vx: 0.35, vy: -0.2, type: 'oxygen', radius: 11, value: 8 },
    { id: 2, x: 220, y: 340, vx: -0.25, vy: 0.3, type: 'oxygen', radius: 11, value: 8 },
    { id: 3, x: 500, y: 150, vx: 0.2, vy: -0.3, type: 'food', radius: 12, value: 8 },
    { id: 4, x: 440, y: 350, vx: -0.3, vy: -0.2, type: 'food', radius: 12, value: 8 },
    { id: 5, x: 340, y: 90, vx: 0.3, vy: 0.15, type: 'energy', radius: 12, value: 9 },
    { id: 6, x: 270, y: 390, vx: -0.25, vy: 0.25, type: 'energy', radius: 12, value: 9 },
    { id: 7, x: 160, y: 240, vx: 0.15, vy: 0.2, type: 'oxygen', radius: 10, value: 8 },
    { id: 8, x: 580, y: 260, vx: -0.2, vy: 0.1, type: 'energy', radius: 11, value: 9 },
  ]);

  const handlePointerInteraction = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    targetPos.current = { x, y };
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const step = 40;
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        targetPos.current.y = Math.max(35, targetPos.current.y - step);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        targetPos.current.y = Math.min(460, targetPos.current.y + step);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        targetPos.current.x = Math.max(35, targetPos.current.x - step);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        targetPos.current.x = Math.min(685, targetPos.current.x + step);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addFloatingText = (text, x, y, color) => {
    floatingTexts.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      color,
      alpha: 1,
    });
  };

  const emitBurst = useCallback((x, y, color, count = 14) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 4.0;
      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2.5 + Math.random() * 3.5,
        life: 0,
        maxLife: 20 + Math.random() * 25,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let tick = 0;

    const moonImg = new Image();
    moonImg.src = '/imges/moon2.jpg';
    const earthImg = new Image();
    earthImg.src = '/imges/earth.jpg';
    const hydroImg = new Image();
    hydroImg.src = '/imges/hydroponics.jpg';
    const solarImg = new Image();
    solarImg.src = '/imges/solar.jpg';
    const astroImg = new Image();
    astroImg.src = '/imges/astronaut_eva.jpg';

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      const moonHub = {
        x: w * 0.16,
        y: h * 0.5,
        radius: 48,
        color: '#00d4ff',
        type: 'oxygen',
        nameAr: 'القمر - منجم الأكسجين',
        nameEn: 'Moon - Oxygen Station',
      };

      const hydroHub = {
        x: w * 0.83,
        y: h * 0.28,
        radius: 48,
        color: '#10b981',
        type: 'food',
        nameAr: 'محطة الزراعة الفضائية - الغذاء',
        nameEn: 'Bio-Station - Hydroponics',
      };

      const solarHub = {
        x: w * 0.8,
        y: h * 0.76,
        radius: 46,
        color: '#eab308',
        type: 'energy',
        nameAr: 'مصفوفة الطاقة الشمسية - الكهرباء',
        nameEn: 'Solar Array - Energy Field',
      };

      const genHub = {
        x: w * 0.5,
        y: h * 0.17,
        radius: 36,
        color: generatorDown ? '#ff3b4e' : '#38bdf8',
        nameAr: 'مولد الطاقة الرئيسي',
        nameEn: 'Emergency Generator',
      };

      ctx.save();
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.5, w * 0.38, h * 0.38, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.58, 52, 0, Math.PI * 2);
      ctx.fillStyle = '#06203a';
      ctx.fill();
      if (earthImg.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.58, 52, 0, Math.PI * 2);
        ctx.clip();
        drawCenteredCover(ctx, earthImg, w * 0.5 - 52, h * 0.58 - 52, 104, 104);
        ctx.restore();
      }
      ctx.strokeStyle = '#00d4ff44';
      ctx.stroke();
      ctx.restore();

      const hubs = [moonHub, hydroHub, solarHub];
      hubs.forEach((hub) => {
        const pulse = Math.sin(tick * 0.05) * 5;

        const grad = ctx.createRadialGradient(
          hub.x,
          hub.y,
          hub.radius * 0.6,
          hub.x,
          hub.y,
          hub.radius + 22 + pulse
        );
        grad.addColorStop(0, `${hub.color}55`);
        grad.addColorStop(1, `${hub.color}00`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, hub.radius + 22 + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, hub.radius, 0, Math.PI * 2);
        ctx.clip();

        let imgToDraw = null;
        if (hub.type === 'oxygen') imgToDraw = moonImg;
        else if (hub.type === 'food') imgToDraw = hydroImg;
        else if (hub.type === 'energy') imgToDraw = solarImg;

        if (imgToDraw && imgToDraw.complete) {
          drawCenteredCover(
            ctx,
            imgToDraw,
            hub.x - hub.radius,
            hub.y - hub.radius,
            hub.radius * 2,
            hub.radius * 2
          );
        } else {
          ctx.fillStyle = '#0a192f';
          ctx.fill();
        }
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = hub.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, hub.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ar' ? hub.nameAr : hub.nameEn, hub.x, hub.y - hub.radius - 8);

        ctx.fillStyle = hub.color;
        const iconText =
          hub.type === 'oxygen'
            ? '🫁 +أكسجين (O2)'
            : hub.type === 'food'
            ? '🌾 +غذاء (Food)'
            : '⚡ +طاقة (Power)';
        ctx.fillText(iconText, hub.x, hub.y + hub.radius + 16);
        ctx.restore();
      });

      const genPulse = Math.sin(tick * (generatorDown ? 0.18 : 0.04)) * (generatorDown ? 10 : 2);
      ctx.save();
      const genGrad = ctx.createRadialGradient(
        genHub.x,
        genHub.y,
        15,
        genHub.x,
        genHub.y,
        genHub.radius + 18 + genPulse
      );
      genGrad.addColorStop(0, generatorDown ? 'rgba(255, 59, 78, 0.7)' : 'rgba(56, 189, 248, 0.25)');
      genGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = genGrad;
      ctx.beginPath();
      ctx.arc(genHub.x, genHub.y, genHub.radius + 18 + genPulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(genHub.x, genHub.y, genHub.radius, 0, Math.PI * 2);
      ctx.fillStyle = generatorDown ? '#3a0208' : '#031730';
      ctx.fill();
      ctx.strokeStyle = genHub.color;
      ctx.lineWidth = generatorDown ? 3.5 : 2;
      ctx.stroke();

      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(generatorDown ? '⚠️' : '⚙️', genHub.x, genHub.y);

      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = generatorDown ? '#ff3b4e' : '#9cc8ff';
      ctx.fillText(
        generatorDown
          ? (lang === 'ar' ? 'عطل! اقترب للإصلاح التلقائي!' : 'ALERT! Approach to Auto-Repair!')
          : (lang === 'ar' ? genHub.nameAr : genHub.nameEn),
        genHub.x,
        genHub.y + genHub.radius + 15
      );
      ctx.restore();

      orbs.current.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < 30 || orb.x > w - 30) orb.vx *= -1;
        if (orb.y < 30 || orb.y > h - 30) orb.vy *= -1;

        const orbColor =
          orb.type === 'oxygen' ? '#00d4ff' : orb.type === 'food' ? '#10b981' : '#eab308';

        ctx.save();
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fillStyle = orbColor;
        ctx.shadowColor = orbColor;
        ctx.shadowBlur = 12;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(orb.x - 3, orb.y - 3, orb.radius * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      });

      const astro = astronautPos.current;
      const target = targetPos.current;

      const dx = target.x - astro.x;
      const dy = target.y - astro.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 3) {
        astro.vx += (dx / dist) * 0.65;
        astro.vy += (dy / dist) * 0.65;
        astro.vx *= 0.88;
        astro.vy *= 0.88;
        astro.x += astro.vx;
        astro.y += astro.vy;
        astro.angle = Math.atan2(dy, dx);

        if (Math.random() < 0.7) {
          const rearAngle = astro.angle + Math.PI + (Math.random() - 0.5) * 0.7;
          particles.current.push({
            x: astro.x - Math.cos(astro.angle) * 18,
            y: astro.y - Math.sin(astro.angle) * 18,
            vx: Math.cos(rearAngle) * (2.5 + Math.random() * 2.5),
            vy: Math.sin(rearAngle) * (2.5 + Math.random() * 2.5),
            color: '#38bdf8',
            size: 3,
            life: 0,
            maxLife: 16,
          });
        }
      }

      const drone = dronePos.current;
      drone.angle += 0.04;
      const droneTargetX = astro.x + Math.cos(drone.angle) * 44;
      const droneTargetY = astro.y + Math.sin(drone.angle) * 32;
      drone.x += (droneTargetX - drone.x) * 0.15;
      drone.y += (droneTargetY - drone.y) * 0.15;

      ctx.save();
      ctx.translate(drone.x, drone.y);
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(1.5, -1, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#00d4ff';
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(drone.x, drone.y);
      ctx.lineTo(astro.x, astro.y);
      ctx.stroke();
      ctx.restore();

      orbs.current.forEach((orb) => {
        const dAstronaut = Math.hypot(astro.x - orb.x, astro.y - orb.y);
        const dDrone = Math.hypot(drone.x - orb.x, drone.y - orb.y);

        if (dAstronaut < 38 || dDrone < 28) {
          playBeep(orb.type === 'oxygen' ? 660 : orb.type === 'food' ? 770 : 880, 0.1);
          emitBurst(
            orb.x,
            orb.y,
            orb.type === 'oxygen' ? '#00d4ff' : orb.type === 'food' ? '#10b981' : '#eab308'
          );

          onGather(
            orb.type,
            orb.value,
            'energy',
            0,
            lang === 'ar'
              ? `امتصاص بلورة ${orb.type === 'oxygen' ? 'أكسجين' : orb.type === 'food' ? 'غذاء' : 'طاقة'} مجانية (+${orb.value})`
              : `Collected free ${orb.type} crystal (+${orb.value})`
          );

          addFloatingText(
            `+${orb.value} ${orb.type.toUpperCase()}`,
            orb.x,
            orb.y - 12,
            orb.type === 'oxygen' ? '#00d4ff' : orb.type === 'food' ? '#10b981' : '#eab308'
          );

          orb.x = Math.random() * (w - 100) + 50;
          orb.y = Math.random() * (h - 100) + 50;
        }
      });

      const now = Date.now();
      hubs.forEach((hub) => {
        const dHub = Math.hypot(astro.x - hub.x, astro.y - hub.y);
        const harvestThreshold = hub.radius + 75;

        if (dHub < harvestThreshold) {
          ctx.save();
          ctx.strokeStyle = hub.color;
          ctx.lineWidth = 3;
          ctx.shadowColor = hub.color;
          ctx.shadowBlur = 15;

          ctx.beginPath();
          ctx.moveTo(hub.x, hub.y);
          const midX = (hub.x + astro.x) / 2 + Math.sin(tick * 0.25) * 10;
          const midY = (hub.y + astro.y) / 2 + Math.cos(tick * 0.25) * 10;
          ctx.quadraticCurveTo(midX, midY, astro.x, astro.y);
          ctx.stroke();

          if (tick % 2 === 0) {
            particles.current.push({
              x: hub.x + (astro.x - hub.x) * 0.15,
              y: hub.y + (astro.y - hub.y) * 0.15,
              vx: (astro.x - hub.x) * 0.08,
              vy: (astro.y - hub.y) * 0.08,
              color: hub.color,
              size: 3.5,
              life: 0,
              maxLife: 20,
            });
          }
          ctx.restore();

          if (now - lastHarvestTime.current[hub.type] > 750) {
            lastHarvestTime.current[hub.type] = now;
            playBeep(hub.type === 'oxygen' ? 620 : hub.type === 'food' ? 740 : 840, 0.08);

            const costRules = {
              oxygen: { costType: 'energy', cost: 2, gain: 18 },
              food: { costType: 'oxygen', cost: 2, gain: 18 },
              energy: { costType: 'food', cost: 2, gain: 20 },
            };
            const rule = costRules[hub.type];

            if (resources[rule.costType] >= rule.cost) {
              onGather(
                hub.type,
                rule.gain,
                rule.costType,
                rule.cost,
                lang === 'ar'
                  ? `شعاع السحب: تم شحن ${hub.type === 'oxygen' ? 'الأكسجين' : hub.type === 'food' ? 'الغذاء' : 'الطاقة'} (+${rule.gain})`
                  : `Tractor Beam: Charged ${hub.type} (+${rule.gain})`
              );

              addFloatingText(
                `+${rule.gain} ${hub.type.toUpperCase()}`,
                astro.x,
                astro.y - 25,
                hub.color
              );
              setHudFeedback(
                lang === 'ar'
                  ? `جاري الشحن التلقائي لـ ${hub.type === 'oxygen' ? 'الأكسجين' : hub.type === 'food' ? 'الغذاء' : 'الطاقة'} بمجرد الاقتراب!`
                  : `Proximity charging active for ${hub.type}!`
              );
            }
          }
        }
      });

      if (generatorDown) {
        const dGen = Math.hypot(astro.x - genHub.x, astro.y - genHub.y);
        if (dGen < genHub.radius + 60) {
          ctx.save();
          ctx.strokeStyle = '#ff3b4e';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#ff3b4e';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.moveTo(astro.x, astro.y);
          ctx.lineTo(genHub.x + (Math.random() - 0.5) * 8, genHub.y + (Math.random() - 0.5) * 8);
          ctx.stroke();

          emitBurst(genHub.x, genHub.y, '#ffd166', 4);
          ctx.restore();

          repairProgress.current += 0.035;
          if (repairProgress.current >= 1) {
            repairProgress.current = 0;
            onRepairGenerator();
            playBeep(920, 0.3);
            addFloatingText(
              lang === 'ar' ? 'تم إصلاح المولد بالكامل!' : 'GENERATOR REPAIRED!',
              genHub.x,
              genHub.y - 22,
              '#2bffa8'
            );
            emitBurst(genHub.x, genHub.y, '#2bffa8', 28);
          }
        } else {
          repairProgress.current = Math.max(0, repairProgress.current - 0.01);
        }
      }

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const alpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (p.life >= p.maxLife) {
          particles.current.splice(i, 1);
        }
      }

      for (let i = floatingTexts.current.length - 1; i >= 0; i--) {
        const ft = floatingTexts.current[i];
        ft.y -= 0.9;
        ft.alpha -= 0.02;

        ctx.save();
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();

        if (ft.alpha <= 0) {
          floatingTexts.current.splice(i, 1);
        }
      }

      ctx.save();
      ctx.translate(astro.x, astro.y);
      ctx.rotate(astro.angle * 0.25 + Math.sin(tick * 0.04) * 0.1);

      ctx.save();
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.quadraticCurveTo(-30, 20 + Math.sin(tick * 0.1) * 10, -60, 45);
      ctx.stroke();
      ctx.restore();

      if (astroImg.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.clip();
        drawCenteredCover(ctx, astroImg, -24, -24, 48, 48);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 12;
        ctx.stroke();
      } else {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-18, -14, 10, 28);
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(-10, -16, 24, 32, 8);
        ctx.fill();
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(4, -5, 9, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 34 + Math.sin(tick * 0.1) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [resources, generatorDown, onGather, onRepairGenerator, playBeep, lang, emitBurst]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl overflow-hidden border border-cyan-500/40 bg-black/85 shadow-[0_0_30px_rgba(0,212,255,0.18)] mb-3"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="absolute top-2 left-3 right-3 z-20 flex items-center justify-between pointer-events-none text-xs">
        <div className="bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-lg text-cyan-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>
            {lang === 'ar'
              ? 'حرّك رائد الفضاء بالماوس أو اللمس نحو الكواكب لجمع الأكسجين والغذاء والطاقة تلقائياً!'
              : 'Move astronaut near planets & stations to collect oxygen, food & energy without buttons!'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/85 px-2.5 py-1 rounded text-slate-400 font-mono">
          <span>🎮 ⌨️ WASD / Arrows</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={720}
        height={480}
        onPointerMove={handlePointerInteraction}
        onPointerDown={handlePointerInteraction}
        className="w-full h-[360px] sm:h-[440px] block cursor-crosshair touch-none"
      />

      <div className="absolute bottom-2 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded text-xs text-slate-300">
          {hudFeedback ||
            (lang === 'ar'
              ? 'درون التعدين الآلي يرافق الرائد لجمع البلورات السابحة تلقائيا'
              : 'Mining drone companion active - harvesting cosmic crystals')}
        </div>

        <div className="flex items-center gap-2 text-[11px] pointer-events-auto">
          <span className="bg-cyan-950/85 border border-cyan-500/60 text-cyan-300 px-2.5 py-1 rounded">
            🌕 {lang === 'ar' ? 'القمر = أكسجين' : 'Moon = O2'}
          </span>
          <span className="bg-emerald-950/85 border border-emerald-500/60 text-emerald-300 px-2.5 py-1 rounded">
            🌱 {lang === 'ar' ? 'الزراعة = غذاء' : 'Bio = Food'}
          </span>
          <span className="bg-amber-950/85 border border-amber-500/60 text-amber-300 px-2.5 py-1 rounded">
            ⚡ {lang === 'ar' ? 'الشمسية = طاقة' : 'Solar = Power'}
          </span>
        </div>
      </div>
    </div>
  );
}
