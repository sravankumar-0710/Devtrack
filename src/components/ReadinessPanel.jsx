import { Card } from "../components/Card";
import { TRACKS } from "../data/curriculum";

const TRACK_COLORS = {
  fullstack: "#6EE7B7",
  dsa:       "#FCD34D",
  coreCS:    "#93C5FD",
  aiml:      "#C4B5FD",
  placement: "#FB923C",
};

/** readiness = output of computeReadiness() from missionEngine.js */
export function ReadinessPanel({ readiness, progress }) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em" }}>
          CAREER READINESS
        </span>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{readiness.overall}%</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Object.entries(TRACKS).map(([key, label]) => (
          <div key={key}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#CBD5E1" }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: TRACK_COLORS[key] }}>{readiness.byTrack[key] || 0}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{
                width: `${readiness.byTrack[key] || 0}%`, height: "100%",
                background: TRACK_COLORS[key], borderRadius: 4, transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <MiniStat label="DSA SOLVED" value={readiness.dsaSolved} color="#FCD34D" />
        <MiniStat label="GITHUB COMMITS" value={readiness.githubCommits} color="#93C5FD" />
        <MiniStat label="CURRICULUM" value={`${progress.done}/${progress.total}`} color="#6EE7B7" />
      </div>
    </Card>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: "#64748B", letterSpacing: "0.05em" }}>{label}</div>
    </div>
  );
}
