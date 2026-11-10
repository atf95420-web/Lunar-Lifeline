import { useState, useEffect } from "react";
import { pageCss } from "./pageStyles";

const css = `
.bm-frame{container-type:inline-size;position:relative;overflow:hidden;width:min(100%,1300px);margin:0 auto;aspect-ratio:1608/817}
.bm-frame::before{content:"";position:absolute;inset:0 -1%;background:url('/imges/biometrics.jpg') center/100% 100% no-repeat}
.bm-slot{position:absolute;color:#9cd8ff;font-size:1.2cqw;display:flex;flex-direction:column;justify-content:center}
.bm-big{font-size:3.4cqw;font-weight:800;color:#fff;line-height:1}
.bm-tag{font-size:1.2cqw;letter-spacing:.15cqw;color:#00d4ff}
.bm-segs{display:grid;grid-template-columns:repeat(8,1fr);gap:.4cqw;margin:.8cqw 0}
.bm-segs i{height:1.3cqw;background:#0b1a33;border:1px solid #1e90ff55}
.bm-segs i.on{background:#1e90ff;box-shadow:0 0 .6cqw #1e90ff}
.bm-note{padding:14px;color:#9cc8ff;font-size:13px;text-align:center}
@media(max-width:600px){.bm-tag{font-size:2cqw}}
`;

export default function DashboardPage({ onBack }) {
  const [bpm, setBpm] = useState(62);

  useEffect(() => {
    let t = 0;
    const id = setInterval(() => {
      t += 1;
      setBpm(62 + Math.round(Math.sin(t / 2) * 3));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pg" style={{ background: "#000" }}>
      <style>{pageCss}{css}</style>
      <div className="pg-head">
        <h2>MOON HEALTH // LUNAR BIOMETRICS</h2>
        <button className="pg-back" onClick={onBack}>BACK</button>
      </div>

      <div className="bm-frame">
        <div className="bm-slot" style={{ left: "5.5%", top: "20%", width: "29%", height: "19%" }}>
          <span className="bm-big">6.0 h</span>
          <div className="bm-segs">
            {Array.from({ length: 8 }, (_, i) => <i key={i} className={i < 6 ? "on" : ""} />)}
          </div>
          <span className="bm-tag">SLEEP DEPRIVATION</span>
        </div>

        <div className="bm-slot" style={{ left: "16%", top: "50%", width: "19%", height: "7%", alignItems: "flex-end" }}>
          <span className="bm-tag">{bpm} BPM · LOW</span>
        </div>

        <div className="bm-slot" style={{ left: "66%", top: "14.5%", width: "20%", height: "5%" }}>
          <span className="bm-tag">ISOLATION RISK</span>
        </div>

        <div className="bm-slot" style={{ left: "70%", top: "54%", width: "24%", height: "5%", alignItems: "flex-end" }}>
          <span className="bm-tag">RADIATION STRESS</span>
        </div>
      </div>

      <p className="bm-note">Sleep around 6 h, lower resting heart rate, isolation and radiation stress: the four NASA crew-health risks.</p>
    </div>
  );
}