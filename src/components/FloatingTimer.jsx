import { Square, Minimize2 } from "lucide-react";

/**
 * FloatingTimer — the compact view rendered inside the popped-out
 * Document PiP / popup window. Kept intentionally tiny since the
 * window itself is small.
 */
export function FloatingTimer({ elapsedLabel, isRunning, categoryLabel, onStop, onReturn }) {
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
        gap: 10,
        color: "#fff",
        background: "#0B1220",
        userSelect: "none",
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: "0.08em" }}>
        {categoryLabel ? categoryLabel.toUpperCase() : "FOCUS SESSION"}
      </div>

      <div
        style={{
          fontSize: 38,
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
          color: isRunning ? "#6EE7B7" : "#fff",
          lineHeight: 1,
        }}
      >
        {elapsedLabel}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          onClick={onStop}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 12px", borderRadius: 8, border: "none",
            background: "#FCA5A5", color: "#1E293B",
            fontWeight: 700, fontSize: 11, cursor: "pointer",
          }}
        >
          <Square size={12} fill="#1E293B" /> Stop
        </button>
        <button
          onClick={onReturn}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 12px", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.15)", background: "transparent",
            color: "#94A3B8", fontWeight: 700, fontSize: 11, cursor: "pointer",
          }}
        >
          <Minimize2 size={12} /> Back
        </button>
      </div>
    </div>
  );
}
