// ─── CARD ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={color} />
      </div>
      <div>
        <div
          style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#64748B",
            letterSpacing: "0.08em",
            marginTop: 2,
          }}
        >
          {label} · {sub}
        </div>
      </div>
    </div>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
export function ProgressBar({ pct, color = "#6EE7B7", height = 6 }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: 4,
        height,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.min(100, pct)}%`,
          height: "100%",
          borderRadius: 4,
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          transition: "width 0.8s ease",
        }}
      />
    </div>
  );
}

// ─── NOTIFICATION TOAST ───────────────────────────────────────────────────────
export function Notification({ notification }) {
  if (!notification) return null;
  const isSuccess = notification.type !== "info" && notification.type !== "error";
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        background: isSuccess ? "#065F46" : "#1E3A5F",
        border: `1px solid ${isSuccess ? "#10B981" : "#3B82F6"}`,
        color: "#fff",
        padding: "10px 18px",
        borderRadius: 8,
        fontSize: 13,
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        animation: "slideIn 0.3s ease",
        fontFamily: "inherit",
      }}
    >
      {notification.msg}
    </div>
  );
}

// ─── SECTION TITLE ────────────────────────────────────────────────────────────
export function SectionTitle({ children, style = {} }) {
  return (
    <h2
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.1em",
        color: "#64748B",
        textTransform: "uppercase",
        marginBottom: 14,
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export function EmptyState({ message = "No data yet." }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px 0",
        color: "#475569",
        fontSize: 13,
      }}
    >
      {message}
    </div>
  );
}
