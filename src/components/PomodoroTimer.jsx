import { useState, useEffect, useRef } from "react";
import { Play, Square, RefreshCw } from "lucide-react";
import { fmt } from "../utils/timeUtils";

const MODES = [
  { id: "work",       label: "FOCUS",       color: "#6EE7B7" },
  { id: "shortBreak", label: "SHORT BREAK", color: "#93C5FD" },
  { id: "longBreak",  label: "LONG BREAK",  color: "#FCD34D" },
];

export default function PomodoroTimer({ settings, onSessionComplete }) {
  const [mode, setMode]         = useState("work");
  const [running, setRunning]   = useState(false);
  const [remaining, setRemaining] = useState(settings.work);
  const intervalRef = useRef(null);

  const total = settings[mode];
  const pct   = ((total - remaining) / total) * 100;

  // Reset when mode changes
  useEffect(() => {
    setRunning(false);
    setRemaining(settings[mode]);
    clearInterval(intervalRef.current);
  }, [mode, settings]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "work") onSessionComplete?.(settings.work);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setRemaining(settings[mode]);
  };

  const accent = MODES.find((m) => m.id === mode)?.color ?? "#6EE7B7";

  // SVG ring
  const R  = 64;
  const C  = 2 * Math.PI * R;
  const offset = C - (pct / 100) * C;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      {/* MODE TABS */}
      <div style={{ display: "flex", gap: 6 }}>
        {MODES.map(({ id, label, color }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: 10,
              fontFamily: "inherit",
              fontWeight: 700,
              letterSpacing: "0.08em",
              background: mode === id ? `${color}20` : "transparent",
              color: mode === id ? color : "#475569",
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* RING */}
      <div style={{ position: "relative", width: 160, height: 160 }}>
        <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="80" cy="80" r={R} fill="none"
            stroke={accent} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>
            {fmt(remaining)}
          </span>
          <span style={{ fontSize: 9, color: "#64748B", letterSpacing: "0.1em", marginTop: 2 }}>
            {MODES.find((m) => m.id === mode)?.label}
          </span>
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => setRunning((r) => !r)}
          style={{
            padding: "10px 28px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 700,
            fontSize: 12,
            background: running ? "#FCA5A530" : accent,
            color: running ? "#FCA5A5" : "#000",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s",
          }}
        >
          {running ? <Square size={14} /> : <Play size={14} />}
          {running ? "PAUSE" : "START"}
        </button>
        <button
          onClick={reset}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)",
            cursor: "pointer",
            background: "transparent",
            color: "#64748B",
            display: "flex",
            alignItems: "center",
            transition: "all 0.2s",
          }}
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </div>
  );
}
