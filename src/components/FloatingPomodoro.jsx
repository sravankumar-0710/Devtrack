import { Pause, Play, SkipForward } from "lucide-react";

/**
 * FloatingPomodoro — the compact view rendered inside the popped-out
 * Document PiP / popup window for the Pomodoro timer.
 */
export function FloatingPomodoro({
  timeLabel, phaseLabel, phaseColor, isRunning, onToggle, onSkip, onReturn,
}) {
  return (
    <div
      style={{
        fontFamily: "inherit",
        height: "100vh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        color: "#fff",
        background: "#0B1220",
        userSelect: "none",
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: "0.08em" }}>
        {phaseLabel}
      </div>

      <div
        style={{
          fontSize: 36,
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
          color: phaseColor,
          lineHeight: 1,
        }}
      >
        {timeLabel}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          onClick={onToggle}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 12px", borderRadius: 8, border: "none",
            background: phaseColor, color: "#1E293B",
            fontWeight: 700, fontSize: 11, cursor: "pointer",
          }}
        >
          {isRunning ? <Pause size={12} /> : <Play size={12} fill="#1E293B" />}
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={onSkip}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 12px", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.15)", background: "transparent",
            color: "#94A3B8", fontWeight: 700, fontSize: 11, cursor: "pointer",
          }}
        >
          <SkipForward size={12} /> Skip
        </button>
      </div>

      <button
        onClick={onReturn}
        style={{
          marginTop: 6, background: "transparent", border: "none",
          color: "#475569", fontSize: 10, fontWeight: 700, cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        Back to app
      </button>
    </div>
  );
}