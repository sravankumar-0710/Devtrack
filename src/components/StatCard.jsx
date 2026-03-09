/**
 * StatCard — single metric tile (icon + value + label).
 *
 * Props:
 *   label  {string}
 *   value  {string|number}
 *   sub    {string}         secondary label
 *   color  {string}         hex accent color
 *   icon   {ReactComponent} Lucide icon
 */
export function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div
      style={{
        background:   "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
        border:       "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding:      "18px 20px",
        display:      "flex",
        alignItems:   "center",
        gap:          16,
      }}
    >
      <div
        style={{
          width:          44,
          height:         44,
          borderRadius:   10,
          background:     `${color}18`,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
        }}
      >
        <Icon size={20} color={color} />
      </div>

      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
          {value}
        </div>
        <div
          style={{
            fontSize:      10,
            color:         "#64748B",
            letterSpacing: "0.08em",
            marginTop:     2,
          }}
        >
          {label} · {sub}
        </div>
      </div>
    </div>
  );
}
