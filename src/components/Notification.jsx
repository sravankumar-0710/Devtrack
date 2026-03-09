/**
 * Notification — floating toast that appears top-right.
 *
 * Props:
 *   notification  {object|null}  { msg: string, type: "success"|"info"|"error" }
 */
export function Notification({ notification }) {
  if (!notification) return null;

  const colors = {
    success: { bg: "#065F46", border: "#10B981" },
    info:    { bg: "#1E3A5F", border: "#3B82F6" },
    error:   { bg: "#7F1D1D", border: "#EF4444" },
  };
  const c = colors[notification.type] || colors.info;

  return (
    <div
      style={{
        position:   "fixed",
        top:        20,
        right:      20,
        zIndex:     9999,
        background: c.bg,
        border:     `1px solid ${c.border}`,
        color:      "#fff",
        padding:    "10px 18px",
        borderRadius: 8,
        fontSize:   13,
        boxShadow:  "0 4px 20px rgba(0,0,0,0.5)",
        animation:  "slideIn 0.3s ease",
        fontFamily: "inherit",
      }}
    >
      {notification.msg}
    </div>
  );
}
