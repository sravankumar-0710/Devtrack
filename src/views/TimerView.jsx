import { useState, useRef } from "react";
import { Play, Square, Edit3, SkipForward, RefreshCw, Plus, X, Check } from "lucide-react";
import { Card }              from "../components/Card";
import { ManualEntryModal }  from "../components/ManualEntryModal";
import { useTimer }          from "../hooks/useTimer";
import { usePomodoro }       from "../hooks/usePomodoro";
import { fmt, fmtDuration, today }  from "../utils/helpers";

/**
 * TimerView — stopwatch session tracker + Pomodoro panel + manual entry.
 *
 * Props: entries, categories, projects, addEntry, showNotif
 */
export function TimerView({ entries, categories, projects, addEntry, addCategory, deleteCategory, showNotif }) {
  const [tab,           setTab]           = useState("stopwatch");
  const [showManual,    setShowManual]    = useState(false);
  const [pendingResult, setPendingResult] = useState(null);
  const [editingCats,   setEditingCats]   = useState(false);
  const [newCatName,    setNewCatName]    = useState("");
  const [newCatColor,   setNewCatColor]   = useState("#6EE7B7");

  const CAT_COLORS = ["#6EE7B7","#93C5FD","#FCA5A5","#FCD34D","#C4B5FD","#6EE7F7","#F472B6","#34D399","#FB923C","#A78BFA"];

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    addCategory({ name: newCatName.trim(), color: newCatColor, icon: "BookOpen" });
    setNewCatName("");
    showNotif(`"${newCatName.trim()}" added!`);
  };

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
            <div style={{ marginBottom: 24 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:10 }}>
                <div style={{ fontSize:10, color:"#64748B", letterSpacing:"0.08em", fontWeight:700 }}>ACTIVITY</div>
                {!timer.isRunning && (
                  <button
                    onClick={() => setEditingCats((e) => !e)}
                    style={{ background:"transparent", border:`1px solid ${editingCats?"rgba(110,231,183,0.4)":"rgba(255,255,255,0.1)"}`, borderRadius:6, padding:"2px 8px", color:editingCats?"#6EE7B7":"#475569", cursor:"pointer", fontSize:10, fontFamily:"inherit", fontWeight:700 }}
                  >
                    {editingCats ? "✓ DONE" : "✎ EDIT"}
                  </button>
                )}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
                {categories.map((c) => (
                  <div key={c.id} style={{ position:"relative", display:"inline-flex", alignItems:"center" }}>
                    <button
                      onClick={() => !timer.isRunning && !editingCats && timer.setSessionMeta((p) => ({ ...p, categoryId: c.id }))}
                      style={{
                        padding:      editingCats ? "6px 28px 6px 14px" : "6px 14px",
                        borderRadius: 20,
                        border:       `1px solid ${timer.sessionMeta.categoryId === c.id ? c.color : "rgba(255,255,255,0.1)"}`,
                        background:   timer.sessionMeta.categoryId === c.id ? `${c.color}22` : "transparent",
                        color:        timer.sessionMeta.categoryId === c.id ? c.color : "#64748B",
                        cursor:       (timer.isRunning || editingCats) ? "default" : "pointer",
                        fontSize:     12, fontFamily:"inherit", fontWeight:600, transition:"all 0.15s",
                      }}
                    >
                      {c.name}
                    </button>
                    {editingCats && (
                      <button
                        onClick={() => {
                          if (categories.length <= 1) { showNotif("Need at least 1 category", "error"); return; }
                          if (timer.sessionMeta.categoryId === c.id) timer.setSessionMeta((p) => ({ ...p, categoryId: "" }));
                          deleteCategory(c.id);
                          showNotif(`"${c.name}" removed`);
                        }}
                        style={{
                          position:"absolute", right:6, top:"50%", transform:"translateY(-50%)",
                          background:"rgba(252,165,165,0.2)", border:"none", borderRadius:"50%",
                          width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center",
                          cursor:"pointer", padding:0, color:"#FCA5A5",
                        }}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add new category inline */}
              {editingCats && (
                <div style={{ marginTop:14, display:"flex", gap:8, alignItems:"center", justifyContent:"center", flexWrap:"wrap" }}>
                  <input
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                    placeholder="New activity name…"
                    style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, padding:"6px 12px", color:"#E2E8F0", fontSize:12, fontFamily:"inherit", outline:"none", width:180 }}
                  />
                  <div style={{ display:"flex", gap:4 }}>
                    {CAT_COLORS.map((col) => (
                      <div key={col} onClick={() => setNewCatColor(col)} style={{ width:18, height:18, borderRadius:"50%", background:col, cursor:"pointer", border: newCatColor===col?"2px solid #fff":"2px solid transparent", transition:"border 0.1s" }} />
                    ))}
                  </div>
                  <button onClick={handleAddCategory} style={{ background:"rgba(110,231,183,0.15)", border:"1px solid rgba(110,231,183,0.3)", borderRadius:8, padding:"6px 12px", color:"#6EE7B7", cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
                    <Plus size={12} /> ADD
                  </button>
                </div>
              )}
            </div>

            {/* Project picker */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: "#64748B", letterSpacing: "0.08em", marginBottom: 8, fontWeight: 700 }}>
                PROJECT (OPTIONAL)
              </div>
              <select
                value={timer.sessionMeta.projectId || ""}
                onChange={(e) => !timer.isRunning && timer.setSessionMeta((p) => ({ ...p, projectId: e.target.value }))}
                disabled={timer.isRunning}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8, color: "#E2E8F0", fontFamily: "inherit", fontSize: 13,
                  padding: "8px 12px", width: "60%", outline: "none",
                  cursor: timer.isRunning ? "default" : "pointer",
                }}
              >
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
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
                  Duration: <strong style={{ color: "#fff" }}>{fmtDuration(pendingResult.duration)}</strong>
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
              {fmtDuration(todayTotal)}
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
                  const addedAt = e.createdAt ? (() => {
                    const d = new Date(e.createdAt);
                    return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
                  })() : null;
                  return (
                    <div key={e.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, background:"rgba(255,255,255,0.02)" }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:cat?.color||"#475569", flexShrink:0 }} />
                      <span style={{ fontSize:12, color:"#94A3B8", flex:1 }}>{cat?.name}</span>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:1 }}>
                        {addedAt && <span style={{ fontSize:10, color:"#334155", fontWeight:700 }}>{addedAt}</span>}
                        <span style={{ fontSize:12, fontWeight:700, color:"#fff" }}>{fmtDuration(e.duration)}</span>
                      </div>
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