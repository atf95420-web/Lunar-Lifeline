import { pageCss } from "./pageStyles";

const W = 12.5;

const items = [
  { t: "SLEEP", d: "6 hours of sleep: deprivation", u: "https://ntrs.nasa.gov/citations/20240002094", cx: 26.1, y: 28 },
  { t: "HEART RATE", d: "Shape changes, rate gets lower", u: "https://www.nasa.gov/missions/station/cardiovascular-health-in-microgravity/", cx: 74, y: 28 },
  { t: "MOOD", d: "Isolation causes mood problems", u: "https://www.nasa.gov/reference/risk-of-behavioral-changes-and-psychiatric-disorders/", cx: 26.1, y: 76 },
  { t: "ANXIETY", d: "Stress tool linked to radiation", u: "https://www.nasa.gov/missions/station/iss-research/mental-well-being-in-space/", cx: 74, y: 77 },
];

const css = `
.rs-frame{container-type:inline-size;position:relative;width:min(100%,1300px);margin:0 auto;aspect-ratio:2576/1455;
  background:url('/imges/research.jpg') center/100% 100% no-repeat}
.rs-slot{position:absolute;width:${W}%;height:11%;display:flex;flex-direction:column;align-items:center;text-align:center;text-decoration:none;color:#9cd8ff;transition:transform .2s}
.rs-slot:hover{transform:scale(1.06)}
.rs-slot b{font-size:1.45cqw;color:#fff;letter-spacing:.15cqw}
.rs-slot span{font-size:1cqw;line-height:1.35}
.rs-list{display:none;margin-top:16px}
.rs-list a{display:block;margin-bottom:10px;padding:12px;border:1px solid #1e90ff88;background:#030a1aee;color:#9cd8ff;text-decoration:none;font-size:14px}
.rs-list b{color:#fff;display:block;margin-bottom:4px;letter-spacing:2px}
@media(max-width:700px){.rs-slot{display:none}.rs-list{display:block}}
`;

export default function ResearchPage({ onBack }) {
  return (
    <div className="pg" style={{ background: "#000" }}>
      <style>{pageCss}{css}</style>
      <div className="pg-head">
        <h2>NASA RESEARCH SUMMARY</h2>
        <button className="pg-back" onClick={onBack}>BACK</button>
      </div>

      <div className="rs-frame">
        {items.map((it) => (
          <a key={it.t} className="rs-slot" href={it.u} target="_blank" rel="noreferrer"
            title="Open the NASA source"
            style={{ left: `${it.cx - W / 2}%`, top: `${it.y}%` }}>
            <b>{it.t}</b>
            <span>{it.d}</span>
          </a>
        ))}
      </div>

      <div className="rs-list">
        {items.map((it) => (
          <a key={it.t} href={it.u} target="_blank" rel="noreferrer">
            <b>{it.t}</b>{it.d}
          </a>
        ))}
      </div>
    </div>
  );
}