import React, { useState, useEffect, useRef } from 'react';
import { CREW_STATUSES } from '../constants';
import { ResourceHud } from '../components/ResourceHud';
import { CosmicHarvestStage } from '../components/CosmicHarvestStage';

const clamp = (val) => Math.max(0, Math.min(100, Math.round(val)));

export function GameView({
  onBack,
  onOpenAnimation,
  onOpenStats,
  lang,
  soundEnabled,
  playBeep,
}) {
  const [gameState, setGameState] = useState('menu');
  const [controlMode, setControlMode] = useState('creative');
  const [missionTargetSeconds, setMissionTargetSeconds] = useState(60);

  const [resources, setResources] = useState({
    oxygen: 80,
    food: 65,
    energy: 90,
  });

  const [timeLeft, setTimeLeft] = useState(60);
  const [generatorDown, setGeneratorDown] = useState(false);
  const [anxiety, setAnxiety] = useState(10);
  const [logMessage, setLogMessage] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [actionCooldown, setActionCooldown] = useState({});

  const genDownRef = useRef(false);
  const cooldownTimers = useRef({});
  const timeLeftRef = useRef(60);
  const targetDurationRef = useRef(60);
  const historyRef = useRef([]);
  const gameEndedRef = useRef(false);

  useEffect(() => {
    genDownRef.current = generatorDown;
  }, [generatorDown]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    targetDurationRef.current = missionTargetSeconds;
  }, [missionTargetSeconds]);

  useEffect(() => {
    return () => {
      Object.values(cooldownTimers.current).forEach(clearTimeout);
    };
  }, []);

  const startMission = (duration = missionTargetSeconds) => {
    setMissionTargetSeconds(duration);
    targetDurationRef.current = duration;
    setResources({ oxygen: 80, food: 65, energy: 90 });
    setTimeLeft(duration);
    timeLeftRef.current = duration;
    setGeneratorDown(false);
    setAnxiety(10);
    setActionCooldown({});
    setFailureReason('');
    setLogMessage(
      lang === 'ar'
        ? `بدأت المهمة (${duration} ثانية)! حرّك رائد الفضاء نحو الكواكب لجمع الموارد بدون أزرار.`
        : `Mission started (${duration}s)! Move astronaut near planets to collect resources.`
    );
    setGameState('play');
    historyRef.current = [{ t: 0, oxygen: 80, food: 65, energy: 90 }];
    gameEndedRef.current = false;
  };

  const handleSafeReturnWin = () => {
    playBeep(1050, 0.3);
    setGameState('win');
  };

  useEffect(() => {
    if (gameState !== 'play') return;

    const timer = setInterval(() => {
      setResources((prev) => {
        const energyPenalty = prev.energy < 25 ? 1.2 : 1;
        const next = {
          oxygen: clamp(prev.oxygen - 0.5 * energyPenalty),
          food: clamp(prev.food - 0.4),
          energy: clamp(prev.energy - (genDownRef.current ? 1.8 : 0.45)),
        };

        const elapsed = targetDurationRef.current - timeLeftRef.current;
        if (elapsed > 0) {
          historyRef.current.push({ t: elapsed, ...next });
          const stored = JSON.parse(localStorage.getItem('ll_stats') || '{}');
          localStorage.setItem(
            'll_stats',
            JSON.stringify({ ...stored, lastRunHistory: historyRef.current })
          );
        }
        return next;
      });

      setTimeLeft((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          setGameState((curr) => (curr === 'play' ? 'win' : curr));
        }
        return next;
      });

      if (!genDownRef.current && timeLeftRef.current > 8 && Math.random() < 0.02) {
        setGeneratorDown(true);
        if (soundEnabled) playBeep(180, 0.5);
        setLogMessage(
          lang === 'ar'
            ? '⚠️ عطل في المولد! وجّه رائد الفضاء نحو المولد لإصلاحه فوراً!'
            : '⚠️ Generator failure! Move astronaut to generator to auto-repair!'
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, lang, soundEnabled, playBeep]);

  useEffect(() => {
    if (gameState !== 'play' || !soundEnabled) return;
    const pulseSpeed = anxiety > 60 ? 1.8 : anxiety > 40 ? 1.2 : 0.6;
    const interval = setInterval(() => {
      if (anxiety > 60) {
        playBeep(120, 0.08);
        setTimeout(() => playBeep(140, 0.1), 150);
      }
    }, 1000 / pulseSpeed);
    return () => clearInterval(interval);
  }, [anxiety, gameState, soundEnabled, playBeep]);

  useEffect(() => {
    if (gameState !== 'play') return;
    const lostResource = ['oxygen', 'food', 'energy'].find(
      (k) => resources[k] <= 0
    );
    if (lostResource) {
      setFailureReason(lostResource);
      setGameState('lose');
    }
  }, [resources, gameState]);

  useEffect(() => {
    if ((gameState !== 'win' && gameState !== 'lose') || gameEndedRef.current) return;
    gameEndedRef.current = true;

    const elapsed =
      gameState === 'win'
        ? targetDurationRef.current
        : targetDurationRef.current - timeLeftRef.current;

    historyRef.current.push({ t: elapsed, ...resources });

    const stored = JSON.parse(localStorage.getItem('ll_stats') || '{}');
    const updated = {
      games: (stored.games || 0) + 1,
      wins: (stored.wins || 0) + (gameState === 'win' ? 1 : 0),
      losses: (stored.losses || 0) + (gameState === 'lose' ? 1 : 0),
      bestTime: Math.max(stored.bestTime || 0, elapsed),
      loseReasons: {
        oxygen:
          (stored.loseReasons?.oxygen || 0) +
          (gameState === 'lose' && failureReason === 'oxygen' ? 1 : 0),
        food:
          (stored.loseReasons?.food || 0) +
          (gameState === 'lose' && failureReason === 'food' ? 1 : 0),
        energy:
          (stored.loseReasons?.energy || 0) +
          (gameState === 'lose' && failureReason === 'energy' ? 1 : 0),
      },
      lastRunHistory: historyRef.current,
    };
    localStorage.setItem('ll_stats', JSON.stringify(updated));
  }, [gameState, failureReason, resources]);

  useEffect(() => {
    const minVal = Math.min(resources.oxygen, resources.food, resources.energy);
    setAnxiety(clamp(100 - minVal * 1.1 + (generatorDown ? 20 : 0)));
  }, [resources, generatorDown]);

  const handleGatherResource = (
    target,
    gain,
    costType,
    cost,
    desc
  ) => {
    if (resources[costType] < cost) return;

    const penalty = resources.energy < 25 && target !== 'energy' ? 0.7 : 1;
    setResources((prev) => {
      const updated = {
        ...prev,
        [target]: clamp(prev[target] + gain * penalty),
        [costType]: clamp(prev[costType] - cost),
      };
      historyRef.current.push({
        t: targetDurationRef.current - timeLeftRef.current,
        ...updated,
      });
      const stored = JSON.parse(localStorage.getItem('ll_stats') || '{}');
      localStorage.setItem(
        'll_stats',
        JSON.stringify({ ...stored, lastRunHistory: historyRef.current })
      );
      return updated;
    });

    setLogMessage(
      desc +
        (penalty < 1
          ? lang === 'ar'
            ? ' (إجهاد الطاقم: كفاءة أقل)'
            : ' (crew tired: less output)'
          : '')
    );
  };

  const handleActionButton = (
    target,
    gain,
    costType,
    cost,
    desc
  ) => {
    if (actionCooldown[target] || resources[costType] < cost) return;
    if (soundEnabled) playBeep(660);
    handleGatherResource(target, gain, costType, cost, desc);

    setActionCooldown((prev) => ({ ...prev, [target]: true }));
    cooldownTimers.current[target] = setTimeout(() => {
      setActionCooldown((prev) => ({ ...prev, [target]: false }));
    }, 1000);
  };

  const handleRepair = () => {
    if (resources.oxygen < 6 || resources.food < 6) {
      return setLogMessage(
        lang === 'ar'
          ? 'لا يوجد أكسجين أو غذاء كافٍ لطاقم الصيانة.'
          : 'Not enough oxygen/food for repair crew.'
      );
    }
    setResources((prev) => {
      const updated = {
        ...prev,
        oxygen: clamp(prev.oxygen - 6),
        food: clamp(prev.food - 6),
      };
      return updated;
    });
    setGeneratorDown(false);
    if (soundEnabled) playBeep(880);
    setLogMessage(lang === 'ar' ? 'تم إصلاح المولد بنجاح!' : 'Generator repaired.');
  };

  const elapsedRunTime = targetDurationRef.current - timeLeft;
  const canSafelyEvac =
    elapsedRunTime >= 30 &&
    resources.oxygen > 30 &&
    resources.food > 30 &&
    resources.energy > 30;

  const avgResources = (resources.oxygen + resources.food + resources.energy) / 3;
  const heartRate = Math.round(60 + anxiety * 0.6);
  const mood =
    avgResources > 60
      ? lang === 'ar'
        ? 'هادئ ومستقر (Calm)'
        : 'Calm'
      : avgResources > 30
      ? lang === 'ar'
        ? 'متوتر (Tense)'
        : 'Tense'
      : lang === 'ar'
      ? 'حرج وخطر (Critical)'
      : 'Critical';

  const sleepTime = resources.energy > 60 ? '7.0 h' : resources.energy > 30 ? '6.0 h' : '4.5 h';
  const mins = String(Math.floor(Math.max(0, timeLeft) / 60)).padStart(2, '0');
  const secs = String(Math.max(0, timeLeft) % 60).padStart(2, '0');

  const statusIdx = avgResources <= 30 ? 2 : avgResources <= 60 || generatorDown ? 1 : 0;
  const currentStatus = CREW_STATUSES[statusIdx];
  const heartSpeed = `${Math.max(0.4, 60 / heartRate).toFixed(2)}s`;
  const timeProgress = ((targetDurationRef.current - timeLeft) / targetDurationRef.current) * 100;

  return (
    <div
      className={`ll pt-16 ${generatorDown && gameState === 'play' ? 'danger shake' : ''} ${
        gameState === 'lose' ? 'crash-fade' : ''
      }`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="game-bg" />
      <div className="game-overlay" />
      <div className="stars" />

      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-slate-950/80 rounded-lg border border-cyan-500/25 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">
            {lang === 'ar' ? 'نمط التحكم:' : 'Control:'}
          </span>
          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded border border-slate-700">
            <button
              onClick={() => setControlMode('creative')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                controlMode === 'creative'
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👨‍🚀 {lang === 'ar' ? 'رائد الفضاء والكواكب (بدون أزرار)' : 'Creative Spacewalk'}
            </button>
            <button
              onClick={() => setControlMode('buttons')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                controlMode === 'buttons'
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🕹️ {lang === 'ar' ? 'أزرار التحكم' : 'HUD Buttons'}
            </button>
          </div>
        </div>

        {gameState === 'play' && canSafelyEvac && (
          <button
            onClick={handleSafeReturnWin}
            className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold rounded-lg shadow-[0_0_15px_rgba(43,255,168,0.6)] animate-pulse hover:scale-105 active:scale-95 transition-all text-xs"
            title={lang === 'ar' ? 'إكمال المهمة وتسجيل حالة نجاح فورية' : 'Complete mission & win'}
          >
            🏆 {lang === 'ar' ? 'طلب عودة آمنة للأرض (تسجيل فوز)' : 'Safe Evac to Earth (Win!)'}
          </button>
        )}

        <button
          onClick={onOpenAnimation}
          className="px-2.5 py-1 bg-cyan-950/90 border border-cyan-400 text-cyan-200 rounded hover:bg-cyan-500 hover:text-black font-bold transition-colors"
        >
          🌌 {lang === 'ar' ? 'استوديو 3D' : '3D Studio'}
        </button>
      </div>

      <ResourceHud resources={resources} lang={lang} />

      <div className="gm">
        <div className="gm-col">
          <div
            className="card crew"
            style={{
              '--h': currentStatus.hue,
              '--c': currentStatus.color,
            }}
          >
            <div className="crew-img" />
            <div className="crew-txt">
              <small>{lang === 'ar' ? 'حالة الطاقم' : 'CREW STATUS'}</small>
              <b>{lang === 'ar' ? currentStatus.nameAr : currentStatus.name}</b>
            </div>
          </div>

          <div className="card vit">
            {lang === 'ar' ? 'ساعات النوم' : 'SLEEP'}
            <b>{sleepTime}</b>
            {resources.energy < 25
              ? lang === 'ar' ? 'حرمان وإجهاد' : 'deprivation'
              : lang === 'ar' ? 'مستقر' : 'stable'}
          </div>

          <div className="card vit">
            {lang === 'ar' ? 'الحالة المزاجية' : 'MOOD'}
            <b>{mood}</b>
            {lang === 'ar' ? 'مؤشر العزلة' : 'isolation index'}
          </div>
        </div>

        <div className="gm-center">
          {gameState === 'menu' && (
            <div className="brief">
              <h2>{lang === 'ar' ? 'تعليمات المهمة الفضائية' : 'MISSION BRIEFING'}</h2>
              <p>
                {lang === 'ar'
                  ? 'القاعدة القمرية - قطاع 04: حافظ على مستويات الأكسجين والغذاء والطاقة للرائد في الفضاء.'
                  : 'Sector 04 Lunar Base: Maintain critical vitals and balance resources.'}
              </p>

              <div className="mb-4 text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <label className="block text-xs font-bold text-cyan-300 mb-1.5">
                  {lang === 'ar' ? '🎯 اختر مدة المهمة ومستوى التحدي:' : '🎯 Choose Mission Duration:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { sec: 60, titleAr: 'مهمة سريعة (1 دقيقة)', titleEn: 'Quick (1 min)', subAr: 'صمود سهل وسريع للنجاح' },
                    { sec: 180, titleAr: 'مهمة قياسية (3 دقائق)', titleEn: 'Standard (3 min)', subAr: 'تحدي استكشاف متوازن' },
                    { sec: 300, titleAr: 'صمود أقصى (5 دقائق)', titleEn: 'Hardcore (5 min)', subAr: 'اختبار البقاء الكامل' },
                  ].map((d) => (
                    <button
                      key={d.sec}
                      onClick={() => setMissionTargetSeconds(d.sec)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        missionTargetSeconds === d.sec
                          ? 'border-cyan-400 bg-cyan-950/80 text-white shadow-[0_0_12px_rgba(0,212,255,0.4)]'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-xs">
                        {lang === 'ar' ? d.titleAr : d.titleEn}
                      </div>
                      <div className="text-[10px] text-cyan-300/70 mt-0.5">
                        {lang === 'ar' ? d.subAr : `${d.sec} seconds`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <ol>
                <li>
                  {lang === 'ar'
                    ? 'جمع الموارد بدون أزرار: حرّك رائد الفضاء بالماوس أو اللمس نحو القمر (أكسجين)، محطة الزراعة (غذاء)، والمصفوفة الشمسية (طاقة).'
                    : 'Creative Gathering: Move astronaut near Moon (O2), Bio-dome (Food), and Solar array (Energy).'}
                </li>
                <li>
                  {lang === 'ar'
                    ? 'درون التعدين الآلي: يرافق الرائد ويجمع بلورات الفضاء السابحة مجاناً ويشحنها بالبذلة.'
                    : 'Mining drone companion: Flies along and absorbs drifting crystals automatically.'}
                </li>
                <li>
                  {lang === 'ar'
                    ? 'عند تعطل المولد، يكفي توجيه الرائد نحو منارة المولد ليتم إصلاحه تلقائياً بشعاع اللحام.'
                    : 'When generator fails, move astronaut to it to auto-repair with plasma beam.'}
                </li>
              </ol>

              <div className="loop">
                <span>{lang === 'ar' ? 'القمر = أكسجين' : 'Moon = Oxygen'}</span>
                <span>{lang === 'ar' ? 'الزراعة = غذاء' : 'Bio = Food'}</span>
                <span>{lang === 'ar' ? 'الشمسية = طاقة' : 'Solar = Power'}</span>
              </div>

              <div className="brief-actions">
                <button className="btn" onClick={() => startMission()} autoFocus>
                  {lang === 'ar' ? '🚀 انطلاق للمهمة' : 'START MISSION'}
                </button>
                <button className="link" onClick={onBack}>
                  {lang === 'ar' ? 'رجوع' : 'BACK'}
                </button>
              </div>
            </div>
          )}

          {gameState === 'play' && (
            <>
              <div className="timer">
                <small>{lang === 'ar' ? 'زمن الصمود المتبقي' : 'SURVIVE'}</small>
                {mins}:{secs}
              </div>
              <div className="tbar">
                <i style={{ width: `${timeProgress}%` }} />
              </div>

              {generatorDown && (
                <div className="alert" role="alert">
                  {lang === 'ar'
                    ? '⚠️ عطل في المولد: الطاقة تستنزف أسرع! وجّه رائد الفضاء نحو المولد لإصلاحه فوراً.'
                    : 'GENERATOR OFFLINE: energy drains faster! Move astronaut to generator.'}
                </div>
              )}

              {controlMode === 'creative' ? (
                <CosmicHarvestStage
                  resources={resources}
                  onGather={handleGatherResource}
                  generatorDown={generatorDown}
                  onRepairGenerator={() => {
                    setGeneratorDown(false);
                    setLogMessage(
                      lang === 'ar'
                        ? 'تم إصلاح المولد بالكامل بواسطة رائد الفضاء!'
                        : 'Generator repaired by astronaut!'
                    );
                  }}
                  playBeep={playBeep}
                  lang={lang}
                />
              ) : (
                <div className="actions">
                  <button
                    className="btn"
                    disabled={actionCooldown['oxygen'] || resources.energy < 8}
                    onClick={() =>
                      handleActionButton(
                        'oxygen',
                        18,
                        'energy',
                        4,
                        lang === 'ar' ? 'تم إنتاج أكسجين (-4 طاقة)' : 'Oxygen produced (-4 energy)'
                      )
                    }
                  >
                    {lang === 'ar' ? 'إنتاج أكسجين' : 'PRODUCE OXYGEN'}
                    <small>+18 oxygen · -4 energy</small>
                  </button>

                  <button
                    className="btn"
                    disabled={actionCooldown['food'] || resources.oxygen < 6}
                    onClick={() =>
                      handleActionButton(
                        'food',
                        18,
                        'oxygen',
                        4,
                        lang === 'ar' ? 'تم استزراع غذاء (-4 أكسجين)' : 'Food grown (-4 oxygen)'
                      )
                    }
                  >
                    {lang === 'ar' ? 'استزراع الغذاء' : 'GROW FOOD'}
                    <small>+18 food · -4 oxygen</small>
                  </button>

                  <button
                    className="btn"
                    disabled={actionCooldown['energy'] || resources.food < 6 || generatorDown}
                    onClick={() =>
                      handleActionButton(
                        'energy',
                        20,
                        'food',
                        4,
                        lang === 'ar' ? 'توليد طاقة (-4 غذاء)' : 'Energy generated (-4 food)'
                      )
                    }
                  >
                    {lang === 'ar' ? 'توليد الطاقة' : 'GENERATE ENERGY'}
                    <small>+20 energy · -4 food</small>
                  </button>

                  {generatorDown && (
                    <button
                      className="btn"
                      style={{ borderColor: '#ff3b4e' }}
                      onClick={handleRepair}
                    >
                      {lang === 'ar' ? 'إصلاح المولد' : 'REPAIR GENERATOR'}
                      <small>-6 oxygen · -6 food</small>
                    </button>
                  )}
                </div>
              )}

              <div className="log">{logMessage}</div>

              <div className="flex items-center justify-center gap-3 mt-2">
                {canSafelyEvac && (
                  <button
                    className="btn text-xs py-2 px-4 border-emerald-400 bg-emerald-950/80 text-emerald-200 hover:bg-emerald-500 hover:text-black font-bold"
                    onClick={handleSafeReturnWin}
                  >
                    🏆 {lang === 'ar' ? 'إنهاء المهمة بنجاح والعودة للأرض' : 'Return to Earth as Victor'}
                  </button>
                )}

                <button className="link" onClick={onBack}>
                  {lang === 'ar' ? 'الخروج للقائمة الرئيسية' : 'EXIT TO MENU'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="gm-col">
          <div className="card earthcard">
            <div className="ewrap" style={{ opacity: 0.35 + (avgResources / 100) * 0.65 }}>
              <div className="earth" aria-hidden="true" />
            </div>
            <small>{lang === 'ar' ? 'اتصال الأرض' : 'EARTH LINK'}</small>
            <b>{Math.round(avgResources)}%</b>
          </div>

          <div className="card heart" style={{ '--s': heartSpeed }}>
            <div className="heart-img" />
            <div className="heart-txt">
              {lang === 'ar' ? 'نبض القلب' : 'HEART RATE'}
              <b>{heartRate} bpm</b>
              <svg className="ecg" viewBox="0 0 120 36" preserveAspectRatio="none">
                <polyline points="0,18 20,18 26,4 32,32 38,18 70,18 76,4 82,32 88,18 120,18" />
              </svg>
            </div>
          </div>

          <div className="card vit">
            {lang === 'ar' ? 'مستوى التوتر' : 'ANXIETY'}
            <b>{Math.round(anxiety)}%</b>
            {anxiety > 60
              ? lang === 'ar'
                ? 'تحذير إشعاعي'
                : 'radiation alert'
              : lang === 'ar'
              ? 'طبيعي'
              : 'nominal'}
          </div>
        </div>
      </div>

      {(gameState === 'win' || gameState === 'lose') && (
        <div className="end">
          <h2
            className="title"
            style={{
              fontSize: 48,
              color: gameState === 'win' ? '#2bffa8' : '#ff3b4e',
            }}
          >
            {gameState === 'win'
              ? lang === 'ar'
                ? '🎉 اكتملت المهمة بنجاح!'
                : 'MISSION COMPLETE!'
              : lang === 'ar'
              ? 'فقدان القاعدة القمرية'
              : 'BASE LOST'}
          </h2>
          <p className="text-base max-w-md">
            {gameState === 'win'
              ? lang === 'ar'
                ? 'تهانينا! صمد الطاقم وحافظ على موارد القاعدة القمرية بنجاح. تم تسجيل حالة نجاح في الإحصائيات!'
                : 'Congratulations! The crew survived successfully. Victory recorded in stats!'
              : lang === 'ar'
              ? `نفد مورد ${
                  failureReason === 'oxygen'
                    ? 'الأكسجين'
                    : failureReason === 'food'
                    ? 'الغذاء'
                    : 'الطاقة'
                } تماماً ووصل إلى الصفر. حاول مجدداً ووازن بين الكواكب!`
              : `${failureReason.toUpperCase()} reached zero.`}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <button className="btn" onClick={() => startMission()}>
              {lang === 'ar' ? 'إعادة المحاولة' : 'PLAY AGAIN'}
            </button>
            <button className="link" onClick={onOpenStats}>
              {lang === 'ar' ? 'عرض الإحصائيات 📊' : 'VIEW STATS'}
            </button>
            <button className="link" onClick={onBack}>
              {lang === 'ar' ? 'القائمة الرئيسية' : 'MAIN MENU'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
