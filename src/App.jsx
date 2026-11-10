import { useState, useEffect, useRef } from "react";
import DashboardPage from "./pages/DashboardPage";
import ResearchPage from "./pages/ResearchPage";
import NasaNetworkPage from "./pages/NasaNetworkPage";
import StatsPage from "./pages/StatsPage";

const GAME_SECONDS = 300;
const clamp = (v) => Math.max(0, Math.min(100, v));

const menu = [
  { id: "health", icon: "🌙", title: "MOON HEALTH", text: "Live crew biometrics" },
  { id: "research", icon: "🔬", title: "NASA RESEARCH", text: "4 findings behind the game" },
  { id: "nasa", icon: "🛰️", title: "NASA LINKS", text: "Official portals and data" },
  { id: "stats", icon: "📊", title: "MISSION STATS", text: "Telemetry and failure analysis" },
];

const levels = [
  { name: "STABLE", color: "#00d4ff", hue: "0deg" },
  { name: "STRAINED", color: "#ffa800", hue: "190deg" },
  { name: "CRITICAL", color: "#ff3b4e", hue: "150deg" },
];

const css = `
.ll,.lp{--cyan:#00d4ff;--red:#ff3b4e;color:#cfe8ff;font-family:'Segoe UI',Tahoma,sans-serif;direction:ltr;position:relative;overflow:hidden;background:#000;min-height:100vh}
.ll *,.lp *{box-sizing:border-box}
.btn{border:2px solid var(--cyan);background:linear-gradient(#08305a,#041a33);color:#fff;font-weight:800;letter-spacing:2px;padding:14px 26px;cursor:pointer;font-size:16px;font-family:inherit;
clip-path:polygon(14px 0,calc(100% - 14px) 0,100% 50%,calc(100% - 14px) 100%,14px 100%,0 50%);transition:.15s;box-shadow:0 0 14px #00d4ff55}
.btn:hover:not(:disabled){background:#0a4a8a;transform:scale(1.04)}
.btn:disabled{opacity:.35;cursor:not-allowed}
.btn small{display:block;font-weight:400;font-size:11px;letter-spacing:0;color:#9cc8ff;margin-top:2px}
.btn:focus-visible,.link:focus-visible,.lp-item:focus-visible{outline:3px solid #fff}
.link{background:#04122acc;border:1px solid #1e90ff;color:#9cd8ff;padding:8px 16px;cursor:pointer;letter-spacing:2px;font-size:13px;font-family:inherit}
.link:hover{background:#0a4a8a;color:#fff}
.title{font-size:clamp(40px,7vw,88px);font-weight:900;letter-spacing:3px;margin:0;line-height:1;background:linear-gradient(#fff,#8aa4c0);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 14px #00d4ff88)}
.title b{background:none;color:var(--cyan);-webkit-text-fill-color:var(--cyan)}

.lp{display:flex;flex-direction:column;padding:28px 32px}
.lp-bg{position:absolute;inset:0;background:url('/imges/moon1.jpg') center/cover no-repeat;animation:lpzoom 9s cubic-bezier(.2,.7,.2,1) both}
@keyframes lpzoom{from{transform:scale(1.25)}to{transform:scale(1)}}
.lp-shade{position:absolute;inset:0;background:linear-gradient(90deg,#000c 0%,#0000 55%),linear-gradient(#0000 55%,#000d 100%)}
.lp-top,.lp-nav,.lp-play{position:relative;z-index:2}
.lp-sub{margin-top:12px;color:var(--cyan);letter-spacing:5px;font-size:13px}
.lp-hook{margin:10px 0 0;font-size:15px;line-height:1.6;max-width:420px;color:#e8f4ff}
.lp-nav{margin-top:26px;display:flex;flex-direction:column;gap:10px;width:min(330px,100%)}
.lp-item{display:flex;align-items:center;gap:14px;text-align:left;background:#030a1acc;border:1px solid #1e90ff88;padding:10px 16px;color:#cfe8ff;cursor:pointer;font-family:inherit;transition:.15s}
.lp-item:hover{background:#0a3a6acc;border-color:var(--cyan);transform:translateX(6px)}
.lp-ico{font-size:24px}
.lp-item b{display:block;color:#fff;letter-spacing:2px;font-size:13px}
.lp-item span{font-size:12px;color:#9cc8ff}
.lp-play{margin:auto auto 5vh;font-size:clamp(20px,2.6vw,30px);padding:18px 72px}

.loading-screen{position:fixed;inset:0;z-index:9999;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--cyan)}
.loading-text{font-size:24px;letter-spacing:4px;margin-bottom:20px;font-weight:800;animation:blink 1.5s infinite}
.loading-bar-wrap{width:300px;height:4px;background:#1e90ff44;border:1px solid #1e90ff;border-radius:2px;overflow:hidden;position:relative}
.loading-bar{height:100%;width:0%;background:var(--cyan);box-shadow:0 0 10px var(--cyan);animation:fillBar 3s ease-in-out forwards}
@keyframes fillBar{0%{width:0%} 50%{width:70%} 100%{width:100%}}

.crash-fade{background: rgba(255, 0, 0, 0.05) !important;}
.crash-fade .game-overlay{background: rgba(40, 0, 0, 0.8) !important;}

.ll{display:flex;flex-direction:column;padding:16px;gap:14px}
.game-bg{position:absolute;inset:0;background:url('/imges/moon2.jpg') center/cover no-repeat;z-index:0}
.game-overlay{position:absolute;inset:0;background:rgba(0,0,0,.5);z-index:1;pointer-events:none;transition:background 1s}
.stars{position:absolute;inset:0;background-image:radial-gradient(1px 1px at 20% 30%,#fff8,transparent),radial-gradient(1px 1px at 70% 20%,#fff8,transparent),radial-gradient(1.5px 1.5px at 40% 70%,#fff6,transparent),radial-gradient(1px 1px at 85% 60%,#fff8,transparent);background-size:300px 300px;z-index:1;pointer-events:none;animation:twinkle 6s ease-in-out infinite alternate}
@keyframes twinkle{from{opacity:.4}to{opacity:.9}}
.hud{position:relative;z-index:10;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.panel{border:1px solid #1e90ff88;background:#030a1acc;clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px));padding:10px 14px}
.panel h4{margin:0 0 6px;font-size:14px;letter-spacing:1px;display:flex;justify-content:space-between}
.bar{display:grid;grid-template-columns:repeat(10,1fr);gap:3px;height:12px}
.bar i{background:#0b1a33}
.bar i.on{background:var(--c);box-shadow:0 0 6px var(--c)}
.low{animation:blink .6s infinite}
@keyframes blink{50%{opacity:.35}}

.gm{position:relative;z-index:10;flex:1;display:grid;grid-template-columns:minmax(210px,270px) 1fr minmax(210px,270px);gap:14px;min-height:0}
.gm-col{display:flex;flex-direction:column;gap:12px}
.gm-center{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;position:relative}
.card{position:relative;overflow:hidden;border:1px solid #1e90ff88;background:#030a1acc;padding:10px 12px}
.vit{font-size:12px}
.vit b{display:block;font-size:20px;color:var(--cyan)}
.crew{flex:1;min-height:260px;display:flex;align-items:flex-end;padding:0}
.crew-img{position:absolute;inset:0;background:url('/imges/astronaut2.jpg') center/cover no-repeat;filter:hue-rotate(var(--h)) saturate(1.3) brightness(.85);transition:filter 1.2s}
.crew-txt{position:relative;width:100%;padding:12px;background:linear-gradient(transparent,#000d)}
.crew-txt small{display:block;letter-spacing:3px;font-size:11px;color:#9cc8ff}
.crew-txt b{font-size:22px;letter-spacing:3px;color:var(--c)}
.earthcard{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}
.ewrap{transition:opacity 1s}
.earth{--d:130px;width:var(--d);height:var(--d);border-radius:50%;background:url('/imges/earth.jpg') 68% 56%/112% auto no-repeat;mix-blend-mode:screen;animation:rise 4s cubic-bezier(.2,.7,.2,1) both,float 6s ease-in-out 4s infinite alternate}
@keyframes rise{from{transform:translateY(60vh) scale(.15);opacity:0}to{transform:none;opacity:1}}
@keyframes float{to{transform:translateY(-8px)}}
.earthcard small{letter-spacing:3px;font-size:11px;color:#9cc8ff}
.earthcard b{font-size:20px;color:var(--cyan)}
.heart{height:175px;padding:0;display:flex;align-items:flex-end}
.heart-img{position:absolute;inset:-6%;background:url('/imges/heart.jpg') center/cover no-repeat;opacity:.75;animation:beat var(--s,1s) ease-in-out infinite}
@keyframes beat{0%,100%{transform:scale(1)}15%{transform:scale(1.07)}30%{transform:scale(1)}}
.heart-txt{position:relative;width:100%;padding:8px 12px;background:linear-gradient(transparent,#000d);font-size:12px}
.heart-txt b{display:block;font-size:20px;color:var(--cyan)}
.ecg{width:100%;height:30px;margin-top:4px;display:block}
.ecg polyline{fill:none;stroke:var(--cyan);stroke-width:2;stroke-dasharray:300;stroke-dashoffset:300;animation:ecg var(--s,1.5s) linear infinite}
@keyframes ecg{to{stroke-dashoffset:0}}

.timer{font-size:clamp(26px,4vw,44px);letter-spacing:6px;color:var(--cyan);font-weight:800;text-shadow:0 0 18px #00d4ff88}
.timer small{display:block;font-size:12px;letter-spacing:4px;color:#9cc8ff;font-weight:400}
.tbar{width:min(420px,80%);height:4px;background:#0b1a33}
.tbar i{display:block;height:100%;background:var(--cyan);box-shadow:0 0 8px var(--cyan)}
.actions{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
.alert{background:#3a0008;border:2px solid var(--red);color:#fff;padding:10px 16px;animation:blink .8s infinite;max-width:520px}
.log{font-size:13px;color:#cfe8ff;min-height:18px;text-shadow:0 0 6px #000}
.brief{max-width:540px;border:1px solid #1e90ff88;background:#030a1aee;padding:22px 26px;text-align:left}
.brief h2{margin:0 0 4px;letter-spacing:4px;color:var(--cyan);font-size:22px}
.brief p{margin:0 0 14px;color:#9cc8ff;font-size:13px;letter-spacing:2px}
.brief ol{margin:0 0 14px;padding-left:20px;line-height:1.7;font-size:15px}
.loop{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 18px;font-size:12px}
.loop span{border:1px solid #1e90ff88;padding:4px 10px;color:#fff}
.brief-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.end{position:absolute;inset:0;z-index:20;background:#000d;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:20px}
.danger::before{content:"";position:absolute;inset:0;z-index:15;pointer-events:none;box-shadow:inset 0 0 140px #ff3b4ecc;animation:blink 1s infinite}
.shake{animation:shake .4s infinite}
@keyframes shake{0%,100%{transform:translate(0)}25%{transform:translate(-3px,2px)}50%{transform:translate(3px,-2px)}75%{transform:translate(-2px,-3px)}}

@media(max-width:900px){
  .gm{grid-template-columns:1fr}
  .gm-center{order:-1}
  .crew{min-height:200px}
}
@media(max-width:600px){
  .hud{grid-template-columns:1fr}
  .lp{padding:20px}
  .lp-play{padding:16px 40px}
}
@media(prefers-reduced-motion:reduce){
  .lp-bg,.earth,.low,.alert,.shake,.stars,.danger::before,.ecg polyline,.heart-img,.loading-bar{animation:none}
}
`;

let audioCtx;
const beep = (freq = 520, dur = 0.12) => {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = freq;
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + dur);
  } catch {
    return;
  }
};

function Bar({ label, value, color, icon }) {
  const segs = Math.round(value / 10);
  return (
    <div className="panel" style={{ "--c": color }}>
      <h4 style={{ color }}>
        <span><span aria-hidden="true">{icon}</span> {label}</span>
        <span className={value < 25 ? "low" : ""}>{Math.round(value)}%</span>
      </h4>
      <div className="bar" role="progressbar" aria-valuenow={Math.round(value)}>
        {Array.from({ length: 10 }, (_, i) => <i key={i} className={i < segs ? "on" : ""} />)}
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("landing");
  const [screen, setScreen] = useState("menu");
  const [loading, setLoading] = useState(false);
  const [r, setR] = useState({ oxygen: 75, food: 50, energy: 90 });
  const [left, setLeft] = useState(GAME_SECONDS);
  const [broken, setBroken] = useState(false);
  const [anxiety, setAnxiety] = useState(10);
  const [log, setLog] = useState("Keep all three meters above zero for 5 minutes.");
  const [loseWhy, setLoseWhy] = useState("");
  const [cool, setCool] = useState({});

  const brokenRef = useRef(false);
  const cooldownTimers = useRef({});
  const leftRef = useRef(GAME_SECONDS);
  const historyRef = useRef([]);
  
  // متغير عشان نمنع حفظ النتيجة أكتر من مرة
  const savedRef = useRef(false);

  useEffect(() => { brokenRef.current = broken; }, [broken]);
  useEffect(() => { leftRef.current = left; }, [left]);
  useEffect(() => () => Object.values(cooldownTimers.current).forEach(clearTimeout), []);

  const start = () => {
    setR({ oxygen: 75, food: 50, energy: 90 });
    setLeft(GAME_SECONDS);
    setBroken(false);
    setAnxiety(10);
    setCool({});
    setLoseWhy("");
    setLog("Mission started. Balance your resources.");
    setScreen("play");
    
    historyRef.current = [{ t: 0, oxygen: 75, food: 50, energy: 90 }];
    savedRef.current = false; // تصفير الحفظ عشان اللعبة الجديدة
  };

  const handlePlayClick = () => {
    setLoading(true);
    beep(880, 0.1);
    setTimeout(() => {
      beep(1100, 0.15);
      setTimeout(() => {
        setLoading(false);
        setPage("game");
      }, 400);
    }, 2600);
  };

  useEffect(() => {
    if (screen !== "play") return;
    const id = setInterval(() => {
      setR((p) => {
        const tired = p.energy < 30 ? 1.3 : 1;
        const nextR = {
          oxygen: clamp(p.oxygen - 0.9 * tired),
          food: clamp(p.food - 0.7),
          energy: clamp(p.energy - (brokenRef.current ? 3 : 0.8)),
        };
        
        const currentElapsed = GAME_SECONDS - leftRef.current;
        if (currentElapsed > 0) {
          historyRef.current.push({ t: currentElapsed, ...nextR });
          
          // حفظ لحظي عشان الجراف
          const existingStats = JSON.parse(localStorage.getItem("ll_stats") || "{}");
          localStorage.setItem("ll_stats", JSON.stringify({
            ...existingStats,
            lastRunHistory: historyRef.current
          }));
        }
        
        return nextR;
      });
      
      setLeft((t) => {
        const next = Math.max(0, t - 1);
        if (next === 0) setScreen((s) => (s === "play" ? "win" : s));
        return next;
      });
      
      if (!brokenRef.current && leftRef.current > 5 && Math.random() < 0.03) {
        setBroken(true);
        beep(180, 0.6);
        setLog("Generator failure! Energy is draining fast. Repair it now.");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [screen]);

  useEffect(() => {
    if (screen !== "play") return;
    const heartRate = anxiety > 60 ? 1.8 : anxiety > 40 ? 1.2 : 0.6;
    const int = setInterval(() => {
      if (anxiety > 60) {
        beep(120, 0.08);
        setTimeout(() => beep(140, 0.1), 150);
      }
    }, 1000 / heartRate);
    return () => clearInterval(int);
  }, [anxiety, screen]);

  useEffect(() => {
    if (screen !== "play") return;
    const dead = ["oxygen", "food", "energy"].find((k) => r[k] <= 0);
    if (dead) {
      setLoseWhy(dead);
      setScreen("lose");
    }
  }, [r, screen]);

  // حفظ البيانات النهائية (الخسارة أو الفوز)
  useEffect(() => {
    if (screen !== "win" && screen !== "lose") return;
    
    // لو اتسجلت قبل كده، متسجلهاش تاني
    if (savedRef.current) return;
    savedRef.current = true;

    const survived = screen === "win" ? GAME_SECONDS : GAME_SECONDS - leftRef.current;
    const finalR = r;
    historyRef.current.push({ t: survived, ...finalR });
    
    const existingStats = JSON.parse(localStorage.getItem("ll_stats") || "{}");
    
    const newStats = {
      games: (existingStats.games || 0) + 1,
      wins: (existingStats.wins || 0) + (screen === "win" ? 1 : 0),
      losses: (existingStats.losses || 0) + (screen === "lose" ? 1 : 0),
      bestTime: Math.max(existingStats.bestTime || 0, survived),
      loseReasons: {
        oxygen: (existingStats.loseReasons?.oxygen || 0) + (screen === "lose" && loseWhy === "oxygen" ? 1 : 0),
        food: (existingStats.loseReasons?.food || 0) + (screen === "lose" && loseWhy === "food" ? 1 : 0),
        energy: (existingStats.loseReasons?.energy || 0) + (screen === "lose" && loseWhy === "energy" ? 1 : 0),
      },
      lastRunHistory: historyRef.current
    };
    
    localStorage.setItem("ll_stats", JSON.stringify(newStats));
  }, [screen, loseWhy, r]);

  useEffect(() => {
    const lowest = Math.min(r.oxygen, r.food, r.energy);
    setAnxiety(clamp(100 - lowest * 1.1 + (broken ? 20 : 0)));
  }, [r, broken]);

  const act = (key, gain, costKey, cost, text) => {
    if (cool[key] || r[costKey] < cost) return;
    beep(660);
    const eff = r.energy < 30 && key !== "energy" ? 0.6 : 1;
    
    setR((p) => {
      const nextR = { ...p, [key]: clamp(p[key] + gain * eff), [costKey]: clamp(p[costKey] - cost) };
      historyRef.current.push({ t: GAME_SECONDS - leftRef.current, ...nextR });
      
      const existingStats = JSON.parse(localStorage.getItem("ll_stats") || "{}");
      localStorage.setItem("ll_stats", JSON.stringify({
        ...existingStats,
        lastRunHistory: historyRef.current
      }));
      
      return nextR;
    });
    
    setLog(text + (eff < 1 ? " (crew tired: 40% less output)" : ""));
    setCool((c) => ({ ...c, [key]: true }));
    cooldownTimers.current[key] = setTimeout(() => setCool((c) => ({ ...c, [key]: false })), 1200);
  };

  const repair = () => {
    if (r.oxygen < 10 || r.food < 10) return setLog("Not enough oxygen/food for the repair crew.");
    setR((p) => {
      const nextR = { ...p, oxygen: clamp(p.oxygen - 10), food: clamp(p.food - 10) };
      historyRef.current.push({ t: GAME_SECONDS - leftRef.current, ...nextR });
      
      const existingStats = JSON.parse(localStorage.getItem("ll_stats") || "{}");
      localStorage.setItem("ll_stats", JSON.stringify({
        ...existingStats,
        lastRunHistory: historyRef.current
      }));
      
      return nextR;
    });
    setBroken(false);
    beep(880);
    setLog("Generator repaired.");
  };

  const back = () => setPage("landing");
  
  if (page === "health") return <DashboardPage onBack={back} />;
  if (page === "research") return <ResearchPage onBack={back} />;
  if (page === "nasa") return <NasaNetworkPage onBack={back} />;
  if (page === "stats") return <StatsPage onBack={back} />;

  if (page === "landing") {
    return (
      <div className="lp">
        <style>{css}</style>
        
        {loading && (
          <div className="loading-screen">
            <div className="loading-text">LOADING</div>
            <div className="loading-bar-wrap">
              <div className="loading-bar" />
            </div>
          </div>
        )}

        <div className="lp-bg" />
        <div className="lp-shade" />
        <header className="lp-top">
          <h1 className="title">LUNAR <b>LIFELINE</b></h1>
          <div className="lp-sub">SURVIVAL PROTOCOL // SECTOR 04</div>
          <p className="lp-hook">Three resources. One failing generator. Five minutes to keep the base alive.</p>
        </header>
        <nav className="lp-nav">
          {menu.map((m) => (
            <button key={m.id} className="lp-item" onClick={() => setPage(m.id)}>
              <span className="lp-ico" aria-hidden="true">{m.icon}</span>
              <span><b>{m.title}</b><span>{m.text}</span></span>
            </button>
          ))}
        </nav>
        <button className="btn lp-play" onClick={handlePlayClick} autoFocus>PLAY NOW</button>
      </div>
    );
  }

  const avg = (r.oxygen + r.food + r.energy) / 3;
  const bpm = Math.round(60 + anxiety * 0.6);
  const mood = avg > 60 ? "Calm" : avg > 30 ? "Tense" : "Critical";
  const sleep = r.energy > 60 ? "7.0 h" : r.energy > 30 ? "6.0 h" : "4.5 h";
  
  const mm = String(Math.floor(Math.max(0, left) / 60)).padStart(2, "0");
  const ss = String(Math.max(0, left) % 60).padStart(2, "0");

  const lv = levels[avg <= 30 ? 2 : avg <= 60 || broken ? 1 : 0];
  const beatSpeed = `${Math.max(0.4, 60 / bpm).toFixed(2)}s`;
  const elapsed = ((GAME_SECONDS - left) / GAME_SECONDS) * 100;

  return (
    <div className={`ll ${broken && screen === "play" ? "danger shake" : ""} ${screen === "lose" ? "crash-fade" : ""}`}>
      <style>{css}</style>
      <div className="game-bg" />
      <div className="game-overlay" />
      <div className="stars" />

      <div className="hud">
        <Bar label="OXYGEN" value={r.oxygen} color="#00d4ff" icon="🫁" />
        <Bar label="FOOD" value={r.food} color="#ffa800" icon="🌾" />
        <Bar label="ENERGY" value={r.energy} color="#2bffa8" icon="⚡" />
      </div>

      <div className="gm">
        <div className="gm-col">
          <div className="card crew" style={{ "--h": lv.hue, "--c": lv.color }}>
            <div className="crew-img" />
            <div className="crew-txt">
              <small>CREW STATUS</small>
              <b>{lv.name}</b>
            </div>
          </div>
          <div className="card vit">SLEEP<b>{sleep}</b>{r.energy < 30 ? "deprivation" : "stable"}</div>
          <div className="card vit">MOOD<b>{mood}</b>isolation index</div>
        </div>

        <div className="gm-center">
          {screen === "menu" && (
            <div className="brief">
              <h2>MISSION BRIEFING</h2>
              <p>SECTOR 04 // 5 MINUTES TO SURVIVE</p>
              <ol>
                <li>Oxygen, food and energy drop every second.</li>
                <li>Every production spends another resource.</li>
                <li>The generator can fail without warning. Repair it before any meter reaches zero.</li>
              </ol>
              <div className="loop">
                <span>Energy pays for oxygen</span>
                <span>Oxygen pays for food</span>
                <span>Food pays for energy</span>
              </div>
              <div className="brief-actions">
                <button className="btn" onClick={start} autoFocus>START MISSION</button>
                <button className="link" onClick={back}>BACK</button>
              </div>
            </div>
          )}

          {screen === "play" && (
            <>
              <div className="timer"><small>SURVIVE</small>{mm}:{ss}</div>
              <div className="tbar"><i style={{ width: `${elapsed}%` }} /></div>
              
              {broken && <div className="alert" role="alert">GENERATOR OFFLINE: energy drains 4x faster</div>}
              
              <div className="actions">
                <button className="btn" disabled={cool.oxygen || r.energy < 8}
                  onClick={() => act("oxygen", 15, "energy", 8, "Oxygen produced (-8 energy)")}>
                  PRODUCE OXYGEN<small>+15 oxygen · -8 energy</small></button>
                  
                <button className="btn" disabled={cool.food || r.oxygen < 6}
                  onClick={() => act("food", 15, "oxygen", 6, "Food grown (-6 oxygen)")}>
                  GROW FOOD<small>+15 food · -6 oxygen</small></button>
                  
                <button className="btn" disabled={cool.energy || r.food < 6 || broken}
                  onClick={() => act("energy", 15, "food", 6, "Energy generated (-6 food)")}>
                  GENERATE ENERGY<small>+15 energy · -6 food</small></button>
                  
                {broken && (
                  <button className="btn" style={{ borderColor: "#ff3b4e" }} onClick={repair}>
                    REPAIR GENERATOR<small>-10 oxygen · -10 food</small></button>
                )}
              </div>
              
              <div className="log">{log}</div>
              <button className="link" onClick={back}>EXIT TO MENU</button>
            </>
          )}
        </div>

        <div className="gm-col">
          <div className="card earthcard">
            <div className="ewrap" style={{ opacity: 0.35 + (avg / 100) * 0.65 }}>
              <div className="earth" aria-hidden="true" />
            </div>
            <small>EARTH LINK</small>
            <b>{Math.round(avg)}%</b>
          </div>
          <div className="card heart" style={{ "--s": beatSpeed }}>
            <div className="heart-img" />
            <div className="heart-txt">
              HEART RATE
              <b>{bpm} bpm</b>
              <svg className="ecg" viewBox="0 0 120 36" preserveAspectRatio="none">
                <polyline points="0,18 20,18 26,4 32,32 38,18 70,18 76,4 82,32 88,18 120,18" />
              </svg>
            </div>
          </div>
          <div className="card vit">ANXIETY<b>{Math.round(anxiety)}%</b>{anxiety > 60 ? "radiation alert" : "nominal"}</div>
        </div>
      </div>

      {(screen === "win" || screen === "lose") && (
        <div className="end">
          <h2 className="title" style={{ fontSize: 48 }}>{screen === "win" ? "MISSION COMPLETE" : "BASE LOST"}</h2>
          <p>{screen === "win" ? "The crew survived 5 minutes." : `${loseWhy.toUpperCase()} reached zero.`}</p>
          <button className="btn" onClick={start}>PLAY AGAIN</button>
          <button className="link" onClick={() => { setScreen("menu"); setPage("landing"); }}>MAIN MENU</button>
        </div>
      )}
    </div>
  );
}