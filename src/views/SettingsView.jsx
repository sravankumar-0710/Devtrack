import { useState, useRef } from "react";
import { Plus, Check, Download, Upload, Trash2, AlertTriangle, Database, Shield, Bell, BellOff } from "lucide-react";
import { Card } from "../components/Card";
import { PRESET_CATEGORIES, PRESET_PROJECTS, DEFAULT_GOALS } from "../data/constants";
import { fmtDuration } from "../utils/helpers";

const PALETTE = ["#6EE7B7","#93C5FD","#FCA5A5","#FCD34D","#C4B5FD","#6EE7F7","#F472B6","#34D399","#FB923C","#A78BFA"];
const DAYS_FULL  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function SettingsView({
  entries, categories, projects, goals, activityGoals,
  setGoals, addCategory, deleteCategory, addProject, deleteProject,
  addActivityGoal, updateActivityGoal, deleteActivityGoal,
  showNotif, onRestore,
}) {
  return (
    <div style={{ padding:28, maxWidth:900, margin:"0 auto", display:"flex", flexDirection:"column", gap:24 }}>
      <DataSection entries={entries} categories={categories} projects={projects} goals={goals} onRestore={onRestore} showNotif={showNotif} />
      <GoalsSection goals={goals} setGoals={setGoals} showNotif={showNotif} />
      <ActivityGoalsSection
        activityGoals={activityGoals} categories={categories}
        addActivityGoal={addActivityGoal} updateActivityGoal={updateActivityGoal} deleteActivityGoal={deleteActivityGoal}
        showNotif={showNotif}
      />
      <CategoriesSection categories={categories} addCategory={addCategory} deleteCategory={deleteCategory} showNotif={showNotif} />
      <ProjectsSection   projects={projects} addProject={addProject} deleteProject={deleteProject} showNotif={showNotif} />
    </div>
  );
}

function DataSection({ entries, categories, projects, goals, onRestore, showNotif }) {
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef(null);

  const dataSize = (() => {
    const bytes = new Blob([JSON.stringify({ entries, categories, projects, goals })]).size;
    return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
  })();

  const lastAutoBackup = localStorage.getItem("devtrack-last-auto-backup") || "Never";

  const handleExportJSON = () => {
    const backup = { version: 1, exportedAt: new Date().toISOString(), entries, categories, projects, goals };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `devtrack-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    showNotif("Backup downloaded!");
  };

  const handleExportCSV = () => {
    const rows = [["Date","Category","Duration (h)","Duration (min)","Project","Notes","Type"]];
    [...entries].sort((a,b) => new Date(a.date) - new Date(b.date)).forEach((e) => {
      const cat  = categories.find((c) => c.id === e.categoryId);
      const proj = projects.find((p) => p.id === e.project);
      rows.push([
        e.date, cat?.name || "",
        (e.duration/3600).toFixed(2),
        Math.round(e.duration/60),
        proj?.name || "",
        `"${(e.notes||"").replace(/"/g,'""')}"`,
        e.manual ? "manual" : "timer",
      ]);
    });
    const blob = new Blob([rows.map(r=>r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `devtrack-sessions-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    showNotif("CSV exported!");
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const backup = JSON.parse(evt.target.result);
        if (!backup.entries || !backup.categories) { showNotif("Invalid backup file", "error"); return; }
        onRestore(backup);
        showNotif(`Restored ${backup.entries.length} sessions!`);
      } catch { showNotif("Could not read file", "error"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClear = () => {
    onRestore({ entries: [], categories: PRESET_CATEGORIES, projects: PRESET_PROJECTS, goals: DEFAULT_GOALS });
    setConfirmClear(false);
    showNotif("All data cleared", "info");
  };

  return (
    <Card>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <Database size={16} color="#6EE7B7" />
        <SectionTitle style={{ marginBottom:0 }}>DATA & BACKUP</SectionTitle>
      </div>

      <div style={{ display:"flex", gap:16, marginBottom:24 }}>
        {[
          { label:"TOTAL SESSIONS", value: entries.length },
          { label:"CATEGORIES",     value: categories.length },
          { label:"PROJECTS",       value: projects.length },
          { label:"STORAGE USED",   value: dataSize },
        ].map(({ label, value }) => (
          <div key={label} style={{ flex:1, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding:"12px 14px" }}>
            <div style={{ fontSize:18, fontWeight:700, color:"#fff" }}>{value}</div>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.08em", color:"#475569", marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Last auto-backup notice */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, padding:"10px 14px", background:"rgba(110,231,183,0.06)", border:"1px solid rgba(110,231,183,0.15)", borderRadius:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background: lastAutoBackup !== "Never" ? "#6EE7B7" : "#475569" }} />
          <span style={{ fontSize:11, color:"#64748B" }}>Last auto-backup:</span>
          <span style={{ fontSize:11, fontWeight:700, color: lastAutoBackup !== "Never" ? "#6EE7B7" : "#FCA5A5" }}>{lastAutoBackup}</span>
        </div>
        <span style={{ fontSize:10, color:"#475569" }}>Runs automatically every day on first open</span>
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom: confirmClear ? 20 : 0 }}>
        <ActionButton icon={Download} color="#6EE7B7" onClick={handleExportJSON}>BACKUP (JSON)</ActionButton>
        <ActionButton icon={Download} color="#93C5FD" onClick={handleExportCSV}>EXPORT CSV</ActionButton>
        <ActionButton icon={Upload}   color="#FCD34D" onClick={() => fileInputRef.current?.click()}>RESTORE BACKUP</ActionButton>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display:"none" }} />
        <ActionButton icon={Trash2}   color="#FCA5A5" onClick={() => setConfirmClear(true)}>CLEAR ALL DATA</ActionButton>
      </div>

      {confirmClear && (
        <div style={{ marginTop:16, padding:"16px 20px", background:"rgba(252,165,165,0.08)", border:"1px solid rgba(252,165,165,0.25)", borderRadius:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <AlertTriangle size={15} color="#FCA5A5" />
            <span style={{ fontSize:12, fontWeight:700, color:"#FCA5A5" }}>This will permanently delete all sessions and reset everything.</span>
          </div>
          <div style={{ fontSize:12, color:"#94A3B8", marginBottom:14 }}>Export a backup first if you want to keep your data.</div>
          <div style={{ display:"flex", gap:8 }}>
            <ActionButton icon={Trash2} color="#FCA5A5" onClick={handleClear}>YES, DELETE EVERYTHING</ActionButton>
            <ActionButton icon={Check}  color="#64748B" onClick={() => setConfirmClear(false)}>CANCEL</ActionButton>
          </div>
        </div>
      )}

      <div style={{ marginTop:20, display:"flex", alignItems:"flex-start", gap:8, padding:"12px 14px", background:"rgba(255,255,255,0.02)", borderRadius:8, border:"1px solid rgba(255,255,255,0.05)" }}>
        <Shield size={13} color="#64748B" style={{ flexShrink:0, marginTop:1 }} />
        <span style={{ fontSize:11, color:"#475569", lineHeight:1.6 }}>
          Your data is stored locally on this computer. Use <strong style={{ color:"#64748B" }}>BACKUP (JSON)</strong> regularly
          — this file restores everything exactly as it was. Store it somewhere safe like Google Drive or a USB drive.
        </span>
      </div>
    </Card>
  );
}

function GoalsSection({ goals, setGoals, showNotif }) {
  const [dailyH,  setDailyH]  = useState(Math.floor(goals.daily  / 3600));
  const [dailyM,  setDailyM]  = useState(Math.floor((goals.daily  % 3600) / 60));
  const [weeklyH, setWeeklyH] = useState(Math.floor(goals.weekly / 3600));
  const [weeklyM, setWeeklyM] = useState(Math.floor((goals.weekly % 3600) / 60));

  const save = () => {
    const daily  = dailyH  * 3600 + dailyM  * 60;
    const weekly = weeklyH * 3600 + weeklyM * 60;
    if (daily  <= 0) { showNotif("Daily goal must be > 0", "error"); return; }
    if (weekly <= 0) { showNotif("Weekly goal must be > 0", "error"); return; }
    setGoals({ daily, weekly });
    showNotif("Goals saved!");
  };

  const inputStyle = { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 12px", color:"#E2E8F0", fontSize:13, fontFamily:"inherit", width:"100%", outline:"none" };

  return (
    <Card>
      <SectionTitle>PRODUCTIVITY GOALS</SectionTitle>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginTop:16 }}>
        <div>
          <div style={{ fontSize:10, color:"#475569", letterSpacing:"0.08em", marginBottom:8, fontWeight:700 }}>DAILY GOAL</div>
          <div style={{ display:"flex", gap:8 }}>
            <div style={{ flex:1, position:"relative" }}>
              <input type="number" min={0} max={23} value={dailyH} onChange={(e)=>setDailyH(+e.target.value)} style={inputStyle} />
              <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontSize:10, color:"#64748B" }}>hrs</span>
            </div>
            <div style={{ flex:1, position:"relative" }}>
              <input type="number" min={0} max={59} value={dailyM} onChange={(e)=>setDailyM(+e.target.value)} style={inputStyle} />
              <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontSize:10, color:"#64748B" }}>min</span>
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize:10, color:"#475569", letterSpacing:"0.08em", marginBottom:8, fontWeight:700 }}>WEEKLY GOAL</div>
          <div style={{ display:"flex", gap:8 }}>
            <div style={{ flex:1, position:"relative" }}>
              <input type="number" min={0} max={167} value={weeklyH} onChange={(e)=>setWeeklyH(+e.target.value)} style={inputStyle} />
              <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontSize:10, color:"#64748B" }}>hrs</span>
            </div>
            <div style={{ flex:1, position:"relative" }}>
              <input type="number" min={0} max={59} value={weeklyM} onChange={(e)=>setWeeklyM(+e.target.value)} style={inputStyle} />
              <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontSize:10, color:"#64748B" }}>min</span>
            </div>
          </div>
        </div>
      </div>
      <SaveBtn onClick={save} />
    </Card>
  );
}

function ActivityGoalsSection({ activityGoals, categories, addActivityGoal, updateActivityGoal, deleteActivityGoal, showNotif }) {
  const BLANK = { categoryId:"", targetH:0, targetM:30, reminderTime:"21:00", days:[0,1,2,3,4,5,6], enabled:true };
  const [form, setForm] = useState(BLANK);
  const [adding, setAdding] = useState(false);

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleDay = (d) => {
    const days = form.days.includes(d) ? form.days.filter((x) => x !== d) : [...form.days, d];
    setF("days", days);
  };

  const handleAdd = () => {
    if (!form.categoryId) { showNotif("Pick a category", "error"); return; }
    const targetSeconds = form.targetH * 3600 + form.targetM * 60;
    if (targetSeconds <= 0) { showNotif("Set a target duration", "error"); return; }
    if (!form.days.length) { showNotif("Select at least one day", "error"); return; }
    addActivityGoal({ categoryId:form.categoryId, targetSeconds, reminderTime:form.reminderTime, days:form.days, enabled:true });
    setForm(BLANK);
    setAdding(false);
    showNotif("Activity goal added!");
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const inputStyle = { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 12px", color:"#E2E8F0", fontSize:13, fontFamily:"inherit", outline:"none" };

  return (
    <Card>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Bell size={16} color="#FCD34D" />
          <SectionTitle style={{ marginBottom:0 }}>ACTIVITY GOALS & REMINDERS</SectionTitle>
        </div>
        <button onClick={() => setAdding((a) => !a)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:"1px solid rgba(110,231,183,0.3)", background:"rgba(110,231,183,0.1)", color:"#6EE7B7", cursor:"pointer", fontSize:11, fontFamily:"inherit", fontWeight:700 }}>
          <Plus size={12} /> NEW GOAL
        </button>
      </div>

      {/* Existing goals */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {activityGoals.length === 0 && !adding && (
          <p style={{ fontSize:12, color:"#475569", textAlign:"center", padding:"20px 0" }}>
            No activity goals yet. Add one to get daily reminders and progress tracking.
          </p>
        )}
        {activityGoals.map((goal) => {
          const cat = categories.find((c) => c.id === goal.categoryId);
          return (
            <div key={goal.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:10, background:"rgba(255,255,255,0.03)", border:`1px solid ${cat?.color || "#334155"}25` }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:cat?.color||"#475569", flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#E2E8F0", marginBottom:3 }}>{cat?.name || "Unknown"}</div>
                <div style={{ fontSize:11, color:"#64748B", display:"flex", gap:10, flexWrap:"wrap" }}>
                  <span>Target: {fmtDuration(goal.targetSeconds)}</span>
                  {goal.reminderTime && <span>🔔 {goal.reminderTime}</span>}
                  <span>{(goal.days||[0,1,2,3,4,5,6]).map((d)=>DAYS_FULL[d]).join(", ")}</span>
                </div>
              </div>
              {/* Toggle enable */}
              <button
                onClick={() => updateActivityGoal(goal.id, { enabled: !goal.enabled })}
                title={goal.enabled ? "Disable" : "Enable"}
                style={{ background:"transparent", border:"none", cursor:"pointer", padding:4, display:"flex", alignItems:"center" }}
              >
                {goal.enabled
                  ? <Bell size={14} color="#FCD34D" />
                  : <BellOff size={14} color="#475569" />
                }
              </button>
              <button
                onClick={() => { deleteActivityGoal(goal.id); showNotif("Goal removed", "info"); }}
                style={{ background:"transparent", border:"none", cursor:"pointer", color:"#475569", padding:4, borderRadius:4, display:"flex", alignItems:"center", transition:"color 0.15s" }}
                onMouseEnter={(e) => e.currentTarget.style.color="#FCA5A5"}
                onMouseLeave={(e) => e.currentTarget.style.color="#475569"}
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add form */}
      {adding && (
        <div style={{ marginTop:20, padding:"20px", background:"rgba(255,255,255,0.03)", borderRadius:12, border:"1px solid rgba(255,255,255,0.08)", display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", color:"#64748B" }}>NEW ACTIVITY GOAL</div>

          {/* Category */}
          <div>
            <div style={{ fontSize:10, color:"#475569", letterSpacing:"0.08em", marginBottom:6, fontWeight:700 }}>ACTIVITY</div>
            <select value={form.categoryId} onChange={(e)=>setF("categoryId",e.target.value)} style={{ ...inputStyle, width:"100%" }}>
              <option value="">Select activity…</option>
              {categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Target duration */}
          <div>
            <div style={{ fontSize:10, color:"#475569", letterSpacing:"0.08em", marginBottom:6, fontWeight:700 }}>DAILY TARGET</div>
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ flex:1, position:"relative" }}>
                <input type="number" min={0} max={23} value={form.targetH} onChange={(e)=>setF("targetH",+e.target.value)} style={{ ...inputStyle, width:"100%" }} />
                <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontSize:10, color:"#64748B" }}>hrs</span>
              </div>
              <div style={{ flex:1, position:"relative" }}>
                <input type="number" min={0} max={59} value={form.targetM} onChange={(e)=>setF("targetM",+e.target.value)} style={{ ...inputStyle, width:"100%" }} />
                <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontSize:10, color:"#64748B" }}>min</span>
              </div>
            </div>
          </div>

          {/* Reminder time */}
          <div>
            <div style={{ fontSize:10, color:"#475569", letterSpacing:"0.08em", marginBottom:6, fontWeight:700 }}>REMINDER TIME (if goal not done by this time)</div>
            <input type="time" value={form.reminderTime} onChange={(e)=>setF("reminderTime",e.target.value)} style={{ ...inputStyle, width:160 }} />
          </div>

          {/* Active days */}
          <div>
            <div style={{ fontSize:10, color:"#475569", letterSpacing:"0.08em", marginBottom:8, fontWeight:700 }}>ACTIVE DAYS</div>
            <div style={{ display:"flex", gap:6 }}>
              {DAYS_FULL.map((d, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  style={{
                    width:36, height:36, borderRadius:8, border:"none", cursor:"pointer", fontFamily:"inherit",
                    fontSize:11, fontWeight:700,
                    background: form.days.includes(i) ? "rgba(110,231,183,0.2)" : "rgba(255,255,255,0.05)",
                    color:      form.days.includes(i) ? "#6EE7B7" : "#475569",
                    transition: "all 0.15s",
                  }}
                >
                  {d.slice(0,2)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={handleAdd} style={{ flex:1, padding:"10px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:12, background:"#6EE7B7", color:"#000", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <Check size={14} /> SAVE GOAL
            </button>
            <button onClick={() => { setAdding(false); setForm(BLANK); }} style={{ padding:"10px 16px", borderRadius:8, border:"1px solid rgba(255,255,255,0.08)", cursor:"pointer", background:"transparent", color:"#64748B", fontFamily:"inherit", fontSize:12 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop:16, padding:"10px 14px", background:"rgba(252,211,77,0.06)", border:"1px solid rgba(252,211,77,0.15)", borderRadius:8 }}>
        <span style={{ fontSize:11, color:"#94A3B8", lineHeight:1.6 }}>
          🔔 <strong style={{ color:"#FCD34D" }}>Browser notifications</strong> will fire at the reminder time if a goal isn't done yet. Make sure to allow notifications when prompted.
        </span>
      </div>
    </Card>
  );
}

function CategoriesSection({ categories, addCategory, deleteCategory, showNotif }) {
  const [name,  setName]  = useState("");
  const [color, setColor] = useState(PALETTE[0]);

  const handleAdd = () => {
    if (!name.trim()) return;
    addCategory({ name: name.trim(), color, icon: "BookOpen" });
    setName("");
    showNotif(`Category "${name.trim()}" added!`);
  };

  return (
    <Card>
      <SectionTitle>CATEGORIES</SectionTitle>
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:16 }}>
        {categories.map((c) => (
          <div key={c.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 14px", borderRadius:10, border:`1px solid ${c.color}30`, background:`${c.color}08` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:c.color }} />
              <span style={{ fontSize:13, color:c.color, fontWeight:600 }}>{c.name}</span>
            </div>
            <button
              onClick={() => {
                if (categories.length <= 1) { showNotif("Need at least 1 category", "error"); return; }
                deleteCategory(c.id);
                showNotif(`"${c.name}" removed`, "info");
              }}
              style={{ background:"transparent", border:"none", cursor:"pointer", color:"#475569", padding:4, borderRadius:4, display:"flex", alignItems:"center", transition:"color 0.15s" }}
              onMouseEnter={(e) => e.currentTarget.style.color="#FCA5A5"}
              onMouseLeave={(e) => e.currentTarget.style.color="#475569"}
              title="Delete category"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:10, marginTop:16, alignItems:"flex-end" }}>
        <Field label="NEW CATEGORY NAME" style={{ flex:1 }}>
          <TextInput value={name} onChange={setName} placeholder="e.g. System Design" />
        </Field>
        <Field label="COLOR">
          <ColorPicker palette={PALETTE} selected={color} onChange={setColor} />
        </Field>
        <button onClick={handleAdd} style={addBtnStyle("#6EE7B7")}><Plus size={14} /> ADD</button>
      </div>
    </Card>
  );
}

function ProjectsSection({ projects, addProject, deleteProject, showNotif }) {
  const [name,  setName]  = useState("");
  const [color, setColor] = useState(PALETTE[4]);

  const handleAdd = () => {
    if (!name.trim()) return;
    addProject({ name: name.trim(), color });
    setName("");
    showNotif(`Project "${name.trim()}" added!`);
  };

  return (
    <Card>
      <SectionTitle>PROJECTS</SectionTitle>
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:16 }}>
        {projects.length === 0 && <span style={{ fontSize:12, color:"#475569" }}>No projects yet.</span>}
        {projects.map((p) => (
          <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderRadius:8, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:p.color }} />
              <span style={{ fontSize:13, color:"#94A3B8" }}>{p.name}</span>
            </div>
            <button
              onClick={() => { deleteProject(p.id); showNotif(`"${p.name}" removed`, "info"); }}
              style={{ background:"transparent", border:"none", cursor:"pointer", color:"#475569", padding:4, borderRadius:4, display:"flex", alignItems:"center", transition:"color 0.15s" }}
              onMouseEnter={(e) => e.currentTarget.style.color="#FCA5A5"}
              onMouseLeave={(e) => e.currentTarget.style.color="#475569"}
              title="Delete project"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:10, marginTop:16, alignItems:"flex-end" }}>
        <Field label="NEW PROJECT NAME" style={{ flex:1 }}>
          <TextInput value={name} onChange={setName} placeholder="e.g. SecureVault v2" />
        </Field>
        <Field label="COLOR">
          <ColorPicker palette={PALETTE.slice(4)} selected={color} onChange={setColor} />
        </Field>
        <button onClick={handleAdd} style={addBtnStyle("#6EE7B7")}><Plus size={14} /> ADD</button>
      </div>
    </Card>
  );
}

function ActionButton({ icon: Icon, color, onClick, children }) {
  return (
    <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 16px", borderRadius:8, border:`1px solid ${color}35`, background:`${color}12`, color, cursor:"pointer", fontSize:11, fontFamily:"inherit", fontWeight:700, letterSpacing:"0.06em", transition:"all 0.15s", whiteSpace:"nowrap" }}>
      <Icon size={13} /> {children}
    </button>
  );
}

function ColorPicker({ palette, selected, onChange }) {
  return (
    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
      {palette.map((p) => (
        <div key={p} onClick={() => onChange(p)} style={{ width:22, height:22, borderRadius:"50%", background:p, cursor:"pointer", border: selected===p ? "2px solid #fff" : "2px solid transparent", transition:"border 0.1s" }} />
      ))}
    </div>
  );
}

function SectionTitle({ children, style={} }) {
  return <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", color:"#64748B", ...style }}>{children}</div>;
}

function Field({ label, children, style={} }) {
  return (
    <div style={style}>
      <div style={{ fontSize:10, color:"#475569", letterSpacing:"0.08em", marginBottom:6, fontWeight:700 }}>{label}</div>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 12px", color:"#E2E8F0", fontSize:13, fontFamily:"inherit", width:"100%", outline:"none" }}
    />
  );
}

function NumberInput({ value, onChange, min, max, step }) {
  return (
    <input type="number" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} min={min} max={max} step={step}
      style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 12px", color:"#E2E8F0", fontSize:13, fontFamily:"inherit", width:"100%", outline:"none" }}
    />
  );
}

function SaveBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ marginTop:16, display:"flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:8, border:"1px solid rgba(110,231,183,0.3)", background:"rgba(110,231,183,0.1)", color:"#6EE7B7", cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:700, letterSpacing:"0.05em" }}>
      <Check size={13} /> SAVE
    </button>
  );
}

function addBtnStyle(color) {
  return { display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, border:`1px solid ${color}40`, background:`${color}15`, color, cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:700, letterSpacing:"0.05em", whiteSpace:"nowrap" };
}