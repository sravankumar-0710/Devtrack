import { BarChart3, Flame, Trophy, Award, Map, Code2, Clock, CalendarDays, Brain, CheckCircle2 } from "lucide-react";
import { Card, SectionTitle, StatCard, ProgressBar } from "../components/UI";
import { fmtH, today } from "../utils/helpers";
import { PLAN_365, VOLUME_TITLES, DSA_YEAR_TARGET, getTodayPlan, stageLabel } from "../data/curriculum365";

export function StatisticsView({
  entries = [], streak = 0,
  devProjects = [], certifications = [], roadmapItems = [],
  weeklyReviews = [], engineState = {},
}) {
  const totalSeconds = entries.reduce((a, e) => a + e.duration, 0);

  const longestStreak = (() => {
    // derive longest streak from unique dates
    const dates = [...new Set(entries.map((e) => e.date))].sort();
    let best = 0, run = 0, prev = null;
    dates.forEach((d) => {
      if (prev) {
        const diff = (new Date(d) - new Date(prev)) / 86400000;
        run = diff === 1 ? run + 1 : 1;
      } else run = 1;
      best = Math.max(best, run);
      prev = d;
    });
    return best;
  })();

  const projectsCompleted = devProjects.filter((p) => p.status === "Completed").length;
  const certsEarned = certifications.filter((c) => c.status === "Completed").length;
  const roadmapDone = roadmapItems.filter((r) => r.status === "Completed").length;
  const roadmapPct = roadmapItems.length ? Math.round((roadmapDone / roadmapItems.length) * 100) : 0;

  const weekStart = (() => { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0, 10); })();
  const monthStart = (() => { const d = new Date(); d.setDate(d.getDate() - 29); return d.toISOString().slice(0, 10); })();
  const weeklySeconds = entries.filter((e) => e.date >= weekStart).reduce((a, e) => a + e.duration, 0);
  const monthlySeconds = entries.filter((e) => e.date >= monthStart).reduce((a, e) => a + e.duration, 0);

  const lastReview = [...weeklyReviews].sort((a, b) => new Date(b.weekOf) - new Date(a.weekOf))[0];

  // ── 365-day curriculum stats ────────────────────────────────────────────
  const completedDaysMap = engineState.completedDays || {};
  const daysDone = Object.keys(completedDaysMap).length;
  const daysPct = Math.round((daysDone / PLAN_365.length) * 100);
  const dsaSolved = Object.values(engineState.dsaSolved || {}).reduce((a, b) => a + b, 0);
  const dsaPct = Math.round((dsaSolved / DSA_YEAR_TARGET) * 100);
  const currentPlan = getTodayPlan();

  const perVolume = Object.entries(VOLUME_TITLES).map(([vol, title]) => {
    const days = PLAN_365.filter((d) => d.volume === Number(vol));
    const done = days.filter((d) => completedDaysMap[d.day]).length;
    return { volume: Number(vol), title, done, total: days.length, pct: days.length ? Math.round((done / days.length) * 100) : 0 };
  });

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <BarChart3 size={18} color="#6EE7B7" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Statistics</h1>
      </div>
      <SectionTitle>The full picture, at a glance</SectionTitle>

      {/* ── 365-day plan progress ──────────────────────────────────────── */}
      <Card style={{ marginTop: 16, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <CalendarDays size={14} color="#6EE7B7" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0" }}>365-Day Curriculum Progress</span>
          {currentPlan && (
            <span style={{ fontSize: 11, color: "#64748B", marginLeft: "auto" }}>
              Day {currentPlan.day} &middot; {stageLabel(currentPlan)}
            </span>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
          <StatCard label="DAYS DONE" value={daysDone} sub={`of ${PLAN_365.length} (${daysPct}%)`} color="#6EE7B7" icon={CheckCircle2} />
          <StatCard label="DSA SOLVED" value={dsaSolved} sub={`of ${DSA_YEAR_TARGET} (${dsaPct}%)`} color="#FCD34D" icon={Brain} />
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: "0.06em", marginBottom: 8 }}>BY VOLUME</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {perVolume.map((v) => (
            <div key={v.volume}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#CBD5E1" }}>Volume {v.volume} — {v.title}</span>
                <span style={{ fontSize: 11, color: "#64748B" }}>{v.done}/{v.total}</span>
              </div>
              <ProgressBar pct={v.pct} color="#6EE7B7" height={6} />
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="TOTAL STUDY HOURS" value={fmtH(totalSeconds)} sub="all-time" color="#6EE7B7" icon={Clock} />
        <StatCard label="CURRENT STREAK" value={`${streak}d`} sub="consecutive" color="#FCD34D" icon={Flame} />
        <StatCard label="LONGEST STREAK" value={`${longestStreak}d`} sub="best run" color="#FCA5A5" icon={Trophy} />
        <StatCard label="PROJECTS COMPLETED" value={projectsCompleted} sub={`of ${devProjects.length}`} color="#34D399" icon={Code2} />
        <StatCard label="CERTIFICATES EARNED" value={certsEarned} sub={`of ${certifications.length}`} color="#FCD34D" icon={Award} />
        <StatCard label="WEEKLY HOURS" value={fmtH(weeklySeconds)} sub="last 7 days" color="#93C5FD" icon={CalendarDays} />
        <StatCard label="MONTHLY HOURS" value={fmtH(monthlySeconds)} sub="last 30 days" color="#C4B5FD" icon={CalendarDays} />
      </div>

      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Map size={14} color="#34D399" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0" }}>Roadmap Completion</span>
          <span style={{ fontSize: 11, color: "#64748B", marginLeft: "auto" }}>{roadmapDone}/{roadmapItems.length} &middot; {roadmapPct}%</span>
        </div>
        <ProgressBar pct={roadmapPct} color="#34D399" height={8} />
      </Card>

      {lastReview && (
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 10, letterSpacing: "0.06em" }}>
            MOST RECENT WEEKLY REVIEW &middot; {lastReview.weekOf || "—"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, fontSize: 12, color: "#CBD5E1" }}>
            <div>Hours studied: <b style={{ color: "#fff" }}>{lastReview.hoursStudied || 0}</b></div>
            <div>Target achieved: <b style={{ color: "#fff" }}>{lastReview.targetAchieved || "—"}</b></div>
            <div>Certs completed: <b style={{ color: "#fff" }}>{lastReview.certsCompleted || 0}</b></div>
            <div>Projects completed: <b style={{ color: "#fff" }}>{lastReview.projectsCompleted || 0}</b></div>
            <div>LeetCode solved: <b style={{ color: "#fff" }}>{lastReview.leetcodeSolved || 0}</b></div>
          </div>
        </Card>
      )}
    </div>
  );
}
