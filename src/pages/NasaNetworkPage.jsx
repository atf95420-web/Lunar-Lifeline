import { pageCss } from "./pageStyles";

const portals = [
  { t: "AGENCY HOMEPAGE", d: "National Aeronautics and Space Administration", u: "https://www.nasa.gov" },
  { t: "JET PROPULSION LABORATORY", d: "Robotic space and Earth science missions", u: "https://www.jpl.nasa.gov" },
  { t: "OPEN DATA CATALOG", d: "Public metadata and archive repository", u: "https://data.nasa.gov" },
  { t: "OPEN API PORTAL", d: "Application and data services interface", u: "https://api.nasa.gov" },
  { t: "MISSIONS", d: "Current and past NASA missions", u: "https://www.nasa.gov/missions" },
  { t: "ARTEMIS PROGRAM", d: "Returning humans to the Moon", u: "https://www.nasa.gov/artemis" },
  { t: "EARTH OBSERVATORY", d: "Satellite images and Earth science", u: "https://earthobservatory.nasa.gov" },
  { t: "TECHNICAL REPORTS", d: "Research papers behind the crew health data", u: "https://ntrs.nasa.gov", g: "GAME: SLEEP" },
  { t: "HUMANS TO MARS", d: "How NASA plans the next giant leap for crews", u: "https://www.nasa.gov/humans-in-space/humans-to-mars/", g: "GAME: SURVIVAL LOOP" },
  { t: "DEEP SPACE FOOD", d: "The menu for Mars: designing a deep space food system", u: "https://www.nasa.gov/humans-in-space/the-menu-for-mars-designing-a-deep-space-food-system/", g: "GAME: GROW FOOD" },
  { t: "RADIATION PROTECTION", d: "How crews are shielded from space radiation", u: "https://www.nasa.gov/radiation-protection/", g: "GAME: ANXIETY" },
  { t: "HUMANS IN SPACE", d: "Everything about crewed exploration", u: "https://www.nasa.gov/humans-in-space/" },
];

export default function NasaNetworkPage({ onBack }) {
  return (
    <div className="pg" style={{ backgroundImage: "url('/imges/moon2.jpg')" }}>
      <style>{pageCss}</style>
      <div className="pg-shade" />
      <div className="pg-art" style={{ backgroundImage: "url('/imges/astronaut2.jpg')" }} />
      <div className="pg-wrap">
        <div className="pg-head">
          <h2>NASA // DIGITAL NETWORK DIRECTORY</h2>
          <button className="pg-back" onClick={onBack}>BACK</button>
        </div>
        <p className="pg-sub">{portals.length} active portals. Tap a card to open it in a new tab.</p>
        <div className="pg-grid">
          {portals.map((p) => (
            <a className="pg-card pg-link" key={p.t} href={p.u} target="_blank" rel="noreferrer">
              <h3>{p.t}</h3>
              <p>{p.d}</p>
              {p.g && <em className="pg-tag">{p.g}</em>}
              <span>{p.u}</span>
              <div className="pg-open">OPEN ↗</div>
            </a>
          ))}
        </div>
        <div className="pg-why">
          <b>WHY THESE LINKS</b><br />
          Lunar Lifeline turns NASA crew-health findings into gameplay: sleep, heart rate, mood and anxiety. Cards tagged GAME show which mechanic each source feeds: sleep data, the Mars survival loop, deep space food and radiation stress.
        </div>
      </div>
    </div>
  );
}