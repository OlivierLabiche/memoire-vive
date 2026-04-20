import { T } from "../lib/constants.js";

export default function Section({ title, count, children, action, badge }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, padding: "0 2px" }}>
        <span style={{
          fontSize: 12, fontFamily: T.font, fontWeight: 600, color: "#888",
          textTransform: "uppercase", letterSpacing: "0.07em",
        }}>
          {title}
        </span>
        {count != null && (
          <span style={{
            fontSize: 10, fontFamily: T.font, fontWeight: 600,
            color: "#AAA", background: "rgba(0,0,0,0.04)", padding: "2px 7px", borderRadius: 8,
          }}>
            {count}
          </span>
        )}
        {badge}
        <div style={{ flex: 1, height: 1, background: T.border }} />
        {action}
      </div>
      {children}
    </div>
  );
}
