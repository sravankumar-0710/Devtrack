/**
 * Card — standard dark-glass panel used throughout the app.
 *
 * Props:
 *   children   {ReactNode}
 *   style      {object}    optional additional inline styles
 *   className  {string}    optional class name
 */
export function Card({ children, style = {}, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background:   "rgba(255,255,255,0.03)",
        border:       "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        padding:      20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
