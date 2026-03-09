import { useState } from "react";
import { Play, Square, Plus, Edit3, Timer, SkipForward, RefreshCw } from "lucide-react";
import { Card }              from "../components/Card";
import { ManualEntryModal }  from "../components/ManualEntryModal";
import { useTimer }          from "../hooks/useTimer";
import { usePomodoro }       from "../hooks/usePomodoro";
import { fmt, fmtH, today }  from "../utils/helpers";

/**
 * TimerView — stopwatch session tracker + Pomodoro panel + manual entry.
 *
 * Props: entries, categories, projects, addEntry, showNotif
 */
export function TimerView({ entries, categories, projects, addEntry, showNotif }) {
  const [tab,           setTab]           = useState("stopwatch"); // "stopwatch" | "pomodoro"
  const [showManual,    setShowManual]    = useState(false);
  const [pendingResult, setPendingResult] = useState(null); // after stop, confirm form

  const timer    = useTimer();
  const pomodoro = usePomodoro();

  // ── stopwatch handlers ──────────────────────────────────────────────────────
  const handleStart = () => {
    if (!timer.sessionMeta.categoryId) {
      showNotif("Please pick a category first", "error");
      return;
    }
    timer.start({ categoryId: timer.sessionMeta.categoryId, projectId: timer.sessionMeta.projectId });
  };

  const handleStop = () => {
    const result = timer.stop();
    if (result && result.duration > 0) setPendingResult(result);
  };

  const handleConfirm = () => {
    if (!pendingResult) return;
    addEntry({ date: today(), ...pendingResult, manual: false });
    setPendingResult(null);
  };

  const todayTotal = entries.filter((e) => e.date === today()).reduce((a, b) => a + b.duration, 0);

  const phaseColors = { work: "#FCA5A5", shortBreak: "#6EE7B7", longBreak: "#93C5FD" };
  const phaseLabels = { work: "FOCUS", shortBreak: "SHORT BREAK", longBreak: "LONG BREAK" };

  return (
    <div style={{ padding: 28, maxWidth: 900, margin: "0 auto" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { id: "stopwatch", label: "⏱  Stopwatch" },
          { id: "pomodoro",  label: "🍅  Pomodoro"  },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding:      "8px 18px",
              borderRadius: 8,
              border:       "none",
              cursor:       "pointer",
              fontFamily:   "inherit",
              fontSize:     12,
              fontWeight:   700,
              letterSpacing: "0.04em",
              background:   tab === id ? "rgba(110,231,183,0.15)" : "rgba(255,255,255,0.03)",
              color:        tab === id ? "#6EE7B7" : "#64748B",
              border:       `1px solid ${tab === id ? "rgba(110,231,183,0.3)" : "rgba(255,255,255,0.07)"}`,
              transition:   "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setShowManual(true)}
          style={{
            marginLeft:   "auto",
            padding:      "8px 18px",
            borderRadius: 8,
            border:       "1px solid rgba(255,255,255,0.1)",
            cursor:       "pointer",
            fontFamily:   "inherit",
            fontSize:     12,
            fontWeight:   700,
            background:   "rgba(255,255,255,0.03)",
            color:        "#94A3B8",
            display:      "flex",
            alignItems:   "center",
            gap:          6,
          }}
        >
          <Edit3 size={13} /> Manual Entry
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* MAIN TIMER PANEL */}
        {tab === "stopwatch" ? (
          <Card style={{ textAlign: "center", padding: 40 }}>
            {/* Category picker */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 10, color: "#64748B", letterSpacing: "0.08em", marginBottom: 10, fontWeight: 700 }}>
                ACTIVITY
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => !timer.isRunning && timer.setSessionMeta((p) => ({ ...p, categoryId: c.id }))}
                    style={{
                      padding:      "6px 14px",
                      borderRadius: 20,
                      border:       `1px solid ${timer.sessionMeta.categoryId === c.id ? c.color : "rgba(255,255,255,0.1)"}`,
                      background:   timer.sessionMeta.categoryId === c.id ? `${c.color}22` : "transparent",
                      color:        timer.sessionMeta.categoryId === c.id ? c.color : "#64748B",
                      cursor:       timer.isRunning ? "default" : "pointer",
                      fontSize:     12,
                      fontFamily:   "inherit",
                      fontWeight:   600,
                      transition:   "all 0.15s",
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Clock display */}
            <div
              style={{
                fontSize:      72,
                fontWeight:    700,
                color:         timer.isRunning ? "#6EE7B7" : "#fff",
                letterSpacing: "-0.02em",
                lineHeight:    1,
                marginBottom:  32,
                fontVariantNumeric: "tabular-nums",
                transition:    "color 0.3s",
              }}
            >
              {fmt(timer.elapsed)}
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              {!timer.isRunning ? (
                <ActionBtn color="#6EE7B7" onClick={handleStart}>
                  <Play size={18} fill="#000" /> START
                </ActionBtn>
              ) : (
                <ActionBtn color="#FCA5A5" onClick={handleStop}>
                  <Square size={16} fill="#000" /> STOP
                </ActionBtn>
              )}
            </div>

            {/* Notes (while running) */}
            {timer.isRunning && (
              <textarea
                placeholder="Add notes about this session…"
                value={timer.sessionMeta.notes}
                onChange={(e) => timer.setNotes(e.target.value)}
                rows={3}
                style={{
                  marginTop:  24,
                  width:      "100%",
                  background: "rgba(255,255,255,0.04)",
                  border:     "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding:    "10px 12px",
                  color:      "#E2E8F0",
                  fontSize:   13,
                  fontFamily: "inherit",
                  resize:     "none",
                  outline:    "none",
                }}
              />
            )}

            {/* Confirm save */}
            {pendingResult && (
              <div
                style={{
                  marginTop:    24,
                  padding:      "16px 20px",
                  background:   "rgba(110,231,183,0.08)",
                  border:       "1px solid rgba(110,231,183,0.2)",
                  borderRadius: 10,
                  textAlign:    "left",
                }}
              >
                <div style={{ fontSize: 11, color: "#6EE7B7", fontWeight: 700, marginBottom: 8 }}>SAVE SESSION?</div>
                <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 12 }}>
                  Duration: <strong style={{ color: "#fff" }}>{fmtH(pendingResult.duration)}</strong>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <ActionBtn color="#6EE7B7" onClick={handleConfirm} small>✓ SAVE</ActionBtn>
                  <ActionBtn color="#475569" onClick={() => setPendingResult(null)} small>DISCARD</ActionBtn>
                </div>
              </div>
            )}
          </Card>
        ) : (
          /* POMODORO */
          <Card style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 10, color: "#64748B", letterSpacing: "0.08em", marginBottom: 8, fontWeight: 700 }}>
              {phaseLabels[pomodoro.phase]}
            </div>
            <div
              style={{
                fontSize:    72,
                fontWeight:  700,
                color:       phaseColors[pomodoro.phase],
                letterSpacing: "-0.02em",
                lineHeight:  1,
                marginBottom: 32,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmt(pomodoro.timeLeft)}
            </div>

            {/* Progress ring (simplified) */}
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 24 }}>
              Sessions completed: <strong style={{ color: "#fff" }}>{pomodoro.sessionCount}</strong>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {!pomodoro.isRunning ? (
                <ActionBtn color={phaseColors[pomodoro.phase]} onClick={pomodoro.start}>
                  <Play size={18} fill="#000" /> START
                </ActionBtn>
              ) : (
                <ActionBtn color="#FCD34D" onClick={pomodoro.pause}>
                  ⏸ PAUSE
                </ActionBtn>
              )}
              <ActionBtn color="#475569" onClick={pomodoro.skip} small>
                <SkipForward size={14} /> SKIP
              </ActionBtn>
              <ActionBtn color="#475569" onClick={pomodoro.reset} small>
                <RefreshCw size={14} /> RESET
              </ActionBtn>
            </div>
          </Card>
        )}

        {/* SIDEBAR: today's log */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748B", marginBottom: 12 }}>
              TODAY'S LOG
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
              {fmtH(todayTotal)}
            </div>
            <div style={{ fontSize: 11, color: "#475569" }}>
              {entries.filter((e) => e.date === today()).length} sessions
            </div>
          </Card>

          <Card style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748B", marginBottom: 12 }}>
              RECENT
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 360, overflowY: "auto" }}>
              {entries
                .filter((e) => e.date === today())
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((e) => {
                  const cat = categories.find((c) => c.id === e.categoryId);
                  return (
                    <div
                      key={e.id}
                      style={{
                        display:      "flex",
                        alignItems:   "center",
                        gap:          10,
                        padding:      "8px 10px",
                        borderRadius: 8,
                        background:   "rgba(255,255,255,0.02)",
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat?.color || "#475569", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#94A3B8", flex: 1 }}>{cat?.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{fmtH(e.duration)}</span>
                    </div>
                  );
                })}
              {entries.filter((e) => e.date === today()).length === 0 && (
                <span style={{ fontSize: 12, color: "#475569" }}>No sessions yet today</span>
              )}
            </div>
          </Card>
        </div>
      </div>

      {showManual && (
        <ManualEntryModal
          categories={categories}
          projects={projects}
          onSave={addEntry}
          onClose={() => setShowManual(false)}
        />
      )}
    </div>
  );
}

function ActionBtn({ children, color, onClick, small = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        background:    `${color}22`,
        border:        `1px solid ${color}55`,
        borderRadius:  8,
        color,
        padding:       small ? "7px 14px" : "12px 28px",
        cursor:        "pointer",
        display:       "flex",
        alignItems:    "center",
        gap:           6,
        fontSize:      small ? 11 : 13,
        fontFamily:    "inherit",
        fontWeight:    700,
        letterSpacing: "0.05em",
        transition:    "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}
