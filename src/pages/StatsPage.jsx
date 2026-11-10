import { pageCss } from "./pageStyles";

const css = `
.st-wrap{max-width:1000px;margin:0 auto;display:flex;flex-direction:column;gap:20px}
/* تصميم الهيدر الجديد اللي فيه صورة الرائد */
.st-header{display:flex;align-items:center;gap:20px;background:#030a1aee;border:1px solid #1e90ff88;padding:20px;border-radius:6px;box-shadow:0 0 18px #1e90ff22}
.st-avatar{width:80px;height:80px;border-radius:50%;border:2px solid #00d4ff;background:url('/imges/astronaut2.jpg') center/cover;box-shadow:0 0 15px #00d4ff88}
.st-header-info h2{margin:0 0 5px;color:#00d4ff;letter-spacing:2px;font-size:20px}
.st-header-info p{margin:0;color:#9cc8ff;font-size:13px;letter-spacing:1px}

.st-grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:16px}
.st-card{border:1px solid #1e90ff88;background:#030a1aee;padding:20px;text-align:center;border-radius:6px;box-shadow:0 0 18px #1e90ff22}
.st-card h3{margin:0 0 10px;color:#9cc8ff;font-size:14px;letter-spacing:2px}
.st-card .val{font-size:36px;font-weight:800;color:#00d4ff;text-shadow:0 0 10px #00d4ff88}
.st-chart{border:1px solid #1e90ff88;background:#030a1aee;padding:24px;border-radius:6px}
.st-chart h3{margin:0 0 20px;color:#00d4ff;letter-spacing:2px;font-size:16px;display:flex;align-items:center;gap:8px}
.st-bar-wrap{display:flex;align-items:center;margin-bottom:16px;gap:12px}
.st-bar-label{width:80px;font-size:13px;color:#9cc8ff;text-align:right}
.st-bar-bg{flex:1;height:20px;background:#0b1a33;border-radius:4px;overflow:hidden;position:relative}
.st-bar-fill{height:100%;background:#1e90ff;box-shadow:0 0 10px #1e90ff;transition:width 1s ease-in-out}
.st-bar-val{width:40px;font-size:13px;color:#fff;font-weight:bold}
.st-legend{display:flex;gap:16px;margin-bottom:20px;font-size:12px;justify-content:center;background:#030a1aee;padding:8px;border-radius:20px;border:1px solid #1e90ff44}
.st-legend span{display:flex;align-items:center;gap:6px;color:#cfe8ff}
.st-legend i{width:12px;height:12px;border-radius:50%;display:inline-block;box-shadow:0 0 6px currentColor}
.btn-clear{background:#ff3b4e22;border:1px solid #ff3b4e;color:#ff3b4e;padding:6px 12px;cursor:pointer;font-size:12px;letter-spacing:1px;border-radius:4px;margin-right:10px}
.btn-clear:hover{background:#ff3b4e;color:#fff}
@media(max-width:600px){
  .st-grid{grid-template-columns:1fr}
  .st-bar-label{width:60px;font-size:11px}
}
`;

function LineChart({ data }) {
  if (!data || data.length < 2) {
    return (
      <div style={{ height: "250px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9cc8ff", border: "1px dashed #1e90ff44", borderRadius: "8px" }}>
        Not enough telemetry data to generate timeline.
      </div>
    );
  }
  
  const W = 900;
  const H = 250;
  const maxT = Math.max(...data.map(d => d.t)) || 300;
  
  const points = (key) => data.map(d => {
    const x = (d.t / maxT) * W;
    const y = H - (d[key] / 100) * H;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", minWidth: "600px", display: "block" }}>
        {[0, 25, 50, 75, 100].map(val => (
          <g key={val}>
            <line x1="0" y1={H - (val/100)*H} x2={W} y2={H - (val/100)*H} stroke="#1e90ff33" strokeDasharray="4 4" />
            <text x="5" y={H - (val/100)*H - 8} fill="#9cc8ff" fontSize="12" fontWeight="bold">{val}%</text>
          </g>
        ))}
        
        <polyline points={points("oxygen")} fill="none" stroke="#00d4ff" strokeWidth="3" style={{ filter: "drop-shadow(0 0 4px #00d4ff88)" }} />
        <polyline points={points("food")} fill="none" stroke="#ffa800" strokeWidth="3" style={{ filter: "drop-shadow(0 0 4px #ffa80088)" }} />
        <polyline points={points("energy")} fill="none" stroke="#2bffa8" strokeWidth="3" style={{ filter: "drop-shadow(0 0 4px #2bffa888)" }} />

        {["oxygen", "food", "energy"].map(k => {
          const last = data[data.length - 1];
          const color = k==="oxygen"?"#00d4ff":k==="food"?"#ffa800":"#2bffa8";
          return <circle key={k} cx={(last.t / maxT) * W} cy={H - (last[k]/100)*H} r="5" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />;
        })}
      </svg>
    </div>
  );
}

export default function StatsPage({ onBack }) {
  const stats = JSON.parse(localStorage.getItem("ll_stats") || "{}");
  const games = stats.games || 0;
  const wins = stats.wins || 0;
  const losses = stats.losses || 0;
  const bestTime = stats.bestTime || 0;
  const loseReasons = stats.loseReasons || { oxygen: 0, food: 0, energy: 0 };
  const history = stats.lastRunHistory || [];

  const totalLosses = loseReasons.oxygen + loseReasons.food + loseReasons.energy || 1;
  const oxyPct = Math.round((loseReasons.oxygen / totalLosses) * 100);
  const foodPct = Math.round((loseReasons.food / totalLosses) * 100);
  const energyPct = Math.round((loseReasons.energy / totalLosses) * 100);

  const bm = Math.floor(bestTime / 60);
  const bs = bestTime % 60;
  const bestFormatted = `${String(bm).padStart(2, "0")}:${String(bs).padStart(2, "0")}`;

  const clearData = () => {
    if(window.confirm("Are you sure you want to clear all telemetry data?")) {
      localStorage.removeItem("ll_stats");
      window.location.reload();
    }
  };

  return (
    <div className="pg" style={{ backgroundImage: "url('/imges/moon2.jpg')" }}>
      <style>{pageCss}{css}</style>
      <div className="pg-shade" />
      <div className="pg-wrap" style={{ marginTop: "20px", paddingBottom: "40px" }}>
        
        <div className="pg-head">
          <h2>MISSION STATS // TELEMETRY</h2>
          <div>
            <button className="btn-clear" onClick={clearData}>CLEAR DATA</button>
            <button className="pg-back" onClick={onBack}>BACK TO HOME</button>
          </div>
        </div>

        <div className="st-wrap">
          
          {/* NEW: الهيدر اللي فيه صورة الرائد */}
          <div className="st-header">
            <div className="st-avatar" />
            <div className="st-header-info">
              <h2>CREW COMMANDER</h2>
              <p>Sector 04 // Lunar Base</p>
            </div>
          </div>

          <div className="st-grid">
            <div className="st-card">
              <h3>TOTAL MISSIONS</h3>
              <div className="val">{games}</div>
            </div>
            <div className="st-card">
              <h3>SUCCESSFUL</h3>
              <div className="val" style={{ color: "#2bffa8" }}>{wins}</div>
            </div>
            <div className="st-card">
              <h3>FAILED</h3>
              <div className="val" style={{ color: "#ff3b4e" }}>{losses}</div>
            </div>
          </div>

          <div className="st-card" style={{ padding: "15px" }}>
            <h3>BEST SURVIVAL TIME</h3>
            <div className="val" style={{ fontSize: "48px" }}>{bestFormatted}</div>
          </div>

          <div className="st-chart">
            <h3>LAST MISSION TIMELINE</h3>
            <div className="st-legend">
              <span><i style={{background:"#00d4ff", color:"#00d4ff"}}></i> Oxygen</span>
              <span><i style={{background:"#ffa800", color:"#ffa800"}}></i> Food</span>
              <span><i style={{background:"#2bffa8", color:"#2bffa8"}}></i> Energy</span>
            </div>
            <LineChart data={history} />
          </div>

          <div className="st-chart">
            <h3>WHY THE CREW WAS LOST</h3>
            
            <div className="st-bar-wrap">
              <div className="st-bar-label">OXYGEN</div>
              <div className="st-bar-bg">
                <div className="st-bar-fill" style={{ width: `${oxyPct}%`, background: "#00d4ff", boxShadow: "0 0 10px #00d4ff" }} />
              </div>
              <div className="st-bar-val">{oxyPct}%</div>
            </div>

            <div className="st-bar-wrap">
              <div className="st-bar-label">FOOD</div>
              <div className="st-bar-bg">
                <div className="st-bar-fill" style={{ width: `${foodPct}%`, background: "#ffa800", boxShadow: "0 0 10px #ffa800" }} />
              </div>
              <div className="st-bar-val">{foodPct}%</div>
            </div>

            <div className="st-bar-wrap">
              <div className="st-bar-label">ENERGY</div>
              <div className="st-bar-bg">
                <div className="st-bar-fill" style={{ width: `${energyPct}%`, background: "#2bffa8", boxShadow: "0 0 10px #2bffa8" }} />
              </div>
              <div className="st-bar-val">{energyPct}%</div>
            </div>

            {games === 0 && (
              <p style={{ color: "#9cc8ff", textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
                No telemetry data available. Play a mission to generate stats.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}