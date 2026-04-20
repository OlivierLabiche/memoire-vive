import { useState } from "react";
import { T } from "../lib/constants.js";

export default function CourseList({ courses, onToggle, onAdd }) {
  const [newItem, setNewItem] = useState("");

  const handleAdd = () => {
    if (!newItem.trim()) return;
    onAdd(newItem.trim());
    setNewItem("");
  };

  return (
    <div style={{ background: T.card, borderRadius: 12, boxShadow: T.cardShadow, overflow: "hidden", padding: "4px 0" }}>
      {courses.map((c) => (
        <div
          key={c.id}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", cursor: "pointer" }}
          onClick={() => onToggle(c.id)}
        >
          <div style={{
            width: 16, height: 16, borderRadius: 4, flexShrink: 0,
            border: c.done ? "none" : "1.5px solid #CDCDCD",
            background: c.done ? "#4EA66D" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {c.done && <span style={{ color: "#FFF", fontSize: 9, fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{
            fontSize: 13, fontFamily: T.font,
            color: c.done ? "#CCC" : "#444",
            textDecoration: c.done ? "line-through" : "none",
          }}>
            {c.text}
          </span>
        </div>
      ))}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 14px 10px",
        borderTop: `1px solid ${T.border}`, marginTop: 2,
      }}>
        <span style={{ color: T.textFaint, fontSize: 16, fontWeight: 300 }}>+</span>
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          placeholder="Ajouter…"
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontSize: 13, fontFamily: T.font, color: "#444",
          }}
        />
      </div>
    </div>
  );
}
