import { useState, useRef } from "react";
import { Plus, Check, Download, Upload, Trash2, AlertTriangle, Database, Shield } from "lucide-react";
import { Card } from "../components/Card";
import { PRESET_CATEGORIES, PRESET_PROJECTS, DEFAULT_GOALS } from "../data/constants";

const PALETTE = ["#6EE7B7","#93C5FD","#FCA5A5","#FCD34D","#C4B5FD","#6EE7F7","#F472B6","#34D399","#FB923C","#A78BFA"];

export function SettingsView({
  entries, categories, projects, goals,
  setGoals, addCategory, addProject, showNotif,
  onRestore,
}) {
  return (
    <div style={{ padding: 28, maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <DataSection
        entries={entries} categories={categories}
        projects={projects} goals={goals}
        onRestore={onRestore} showNotif={showNotif}
      />
      <GoalsSection    goals={goals} setGoals={setGoals} showNotif={showNotif} />
      <CategoriesSection categories={categories} addCategory={addCategory} showNotif={showNotif} />
      <ProjectsSection   projects={projects} addProject={addProject} showNotif={showNotif} />
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
  const [daily,  setDaily]  = useState(goals.daily  / 3600);
  const [weekly, setWeekly] = useState(goals.weekly / 3600);
  const save = () => setGoals({ daily: daily * 3600, weekly: weekly * 3600 });

  return (
    <Card>
      <SectionTitle>PRODUCTIVITY GOALS</SectionTitle>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:16 }}>
        <Field label="DAILY GOAL (hours)">
          <NumberInput value={daily}  onChange={setDaily}  min={0.5} max={24}  step={0.5} />
        </Field>
        <Field label="WEEKLY GOAL (hours)">
          <NumberInput value={weekly} onChange={setWeekly} min={1}   max={168} step={1} />
        </Field>
      </div>
      <SaveBtn onClick={save} />
    </Card>
  );
}

function CategoriesSection({ categories, addCategory, showNotif }) {
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
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:16 }}>
        {categories.map((c) => (
          <div key={c.id} style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${c.color}40`, background:`${c.color}12`, color:c.color, fontSize:12, fontWeight:600 }}>
            {c.name}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:10, marginTop:20, alignItems:"flex-end" }}>
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

function ProjectsSection({ projects, addProject, showNotif }) {
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
          <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:8, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:p.color }} />
            <span style={{ fontSize:13, color:"#94A3B8" }}>{p.name}</span>
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