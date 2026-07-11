import { useMemo } from "react";
import { Award, Plus, CheckCircle2, BookOpen } from "lucide-react";
import { SectionTitle } from "../components/UI";
import { Card } from "../components/Card";
import { RecordManager } from "../components/RecordManager";
import { CERTIFICATION_FIELDS } from "../data/consistencyConstants";
import { PLANNED_CERTIFICATIONS, VOLUME_TITLES, dateForDay, todayDayNum, certStatus } from "../data/curriculum365";

export function CertificationsView({ certifications, addItem, updateItem, deleteItem }) {
  const completed = certifications.filter((c) => c.status === "Completed").length;
  const todayNum = todayDayNum();

  // Track which planned certs the user has already pulled into their tracker,
  // matched loosely by name so re-adding doesn't create duplicates.
  const addedNames = useMemo(
    () => new Set(certifications.map((c) => (c.certificate || "").trim().toLowerCase())),
    [certifications]
  );

  const byVolume = useMemo(() => {
    const map = new Map();
    PLANNED_CERTIFICATIONS.forEach((c) => {
      if (!map.has(c.volume)) map.set(c.volume, []);
      map.get(c.volume).push(c);
    });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, []);

  const addPlanned = (c) => {
    const status = certStatus(c, todayNum) === "done" ? "Completed" : certStatus(c, todayNum) === "active" ? "In Progress" : "Not Started";
    addItem("certifications", {
      certificate: c.name,
      provider: c.provider === "—" ? "" : c.provider,
      status,
      startDate: dateForDay(c.startDay).toISOString().slice(0, 10),
      endDate: dateForDay(c.endDay).toISOString().slice(0, 10),
      credential: "",
    });
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Award size={18} color="#FCD34D" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Certifications</h1>
      </div>
      <SectionTitle>{completed} of {certifications.length} completed</SectionTitle>

      {/* ── Planned certifications, straight from the 365-day syllabus ───── */}
      <Card style={{ marginTop: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <BookOpen size={15} color="#C4B5FD" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0" }}>Planned Certifications</span>
        </div>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 14 }}>
          Every certification / course the 365-day plan schedules, in order. Add one to your
          tracker above to log progress and dates yourself.
        </div>

        {byVolume.map(([vol, items]) => (
          <div key={vol} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: "0.06em", marginBottom: 8 }}>
              VOLUME {vol} — {(VOLUME_TITLES[vol] || "").toUpperCase()}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {items.map((c, i) => {
                const already = addedNames.has(c.name.trim().toLowerCase());
                const status = certStatus(c, todayNum);
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                    padding: "10px 12px", borderRadius: 8,
                    background: status === "active" ? "rgba(252,211,77,0.06)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${status === "active" ? "rgba(252,211,77,0.25)" : "rgba(255,255,255,0.06)"}`,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>
                        {c.name}{c.provider !== "—" && <span style={{ color: "#64748B", fontWeight: 400 }}> · {c.provider}</span>}
                      </div>
                      <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
                        Day {c.startDay}{c.endDay !== c.startDay ? `–${c.endDay}` : ""} (Week {c.startWeek}{c.endWeek !== c.startWeek ? `–${c.endWeek}` : ""})
                        {status === "done" && <span style={{ color: "#6EE7B7" }}> · past due — likely done</span>}
                        {status === "active" && <span style={{ color: "#FCD34D" }}> · in progress now</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => addPlanned(c)}
                      disabled={already}
                      style={{
                        display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
                        background: already ? "rgba(110,231,183,0.08)" : "rgba(196,181,253,0.1)",
                        border: `1px solid ${already ? "rgba(110,231,183,0.3)" : "rgba(196,181,253,0.3)"}`,
                        color: already ? "#6EE7B7" : "#C4B5FD",
                        borderRadius: 7, padding: "6px 10px", fontSize: 11, fontWeight: 700,
                        cursor: already ? "default" : "pointer", fontFamily: "inherit",
                      }}
                    >
                      {already ? <><CheckCircle2 size={12} /> Added</> : <><Plus size={12} /> Add to tracker</>}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </Card>

      <RecordManager
        title="Certifications"
        fields={CERTIFICATION_FIELDS}
        items={certifications}
        accent="#FCD34D"
        onAdd={(item) => addItem("certifications", item)}
        onDelete={(id) => deleteItem("certifications", id)}
        onUpdate={(id, patch) => updateItem("certifications", id, patch)}
      />
    </div>
  );
}
