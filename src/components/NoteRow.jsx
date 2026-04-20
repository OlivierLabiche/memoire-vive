import { useState } from "react";
import { T, URG, PC } from "../lib/constants.js";
import { fmtRel, truncate } from "../lib/utils.js";

export default function NoteRow({ item, onToggle }) {
  const [open, setOpen] = useState(false);
  const isTache = item.mode === "tache";
  const urg = URG.find((u) => u.value === item.urgence);

  return (
    <div style={{
      padding: "8px 14px",
      borderBottom: `1px solid ${T.border}`,
      background: open ? "rgba(0,0,0,0.015)" : "transparent",
      transition: "background 0.15s ease",
    }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        onClick={() => setOpen(!open)}
      >
        {isTache && onToggle && (
          <div
            onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
            style={{
              width: 17, height: 17, borderRadius: 5, flexShrink: 0,
              border: item.done ? "none" : "1.5px solid #CDCDCD",
              background: item.done ? "#4EA66D" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s ease",
            }}
          >
            {item.done && <span style={{ color: "#FFF", fontSize: 10, fontWeight: 700 }}>✓</span>}
          </div>
        )}
        {!isTache && (
          <span style={{
            width: 3, height: 3, borderRadius: "50%", flexShrink: 0,
            background: item.reference ? "#6B8ACA" : "#C8C8C8", marginTop: 1,
          }} />
        )}
        <span style={{
          flex: 1, fontSize: 13, fontFamily: T.font, fontWeight: 400,
          color: item.done ? "#BBB" : T.text,
          textDecoration: item.done ? "line-through" : "none",
          lineHeight: 1.35,
        }}>
          {open ? item.text : truncate(item.text)}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {urg && <span style={{ width: 6, height: 6, borderRadius: "50%", background: urg.color, opacity: 0.6 }} />}
          {item.duree && !open && <span style={{ fontSize: 10, color: "#BBB", fontFamily: T.font }}>⏱{item.duree}</span>}
          <span style={{ fontSize: 10, color: T.textFaint, fontFamily: T.font, minWidth: 46, textAlign: "right" }}>
            {fmtRel(item.time)}
          </span>
          <span style={{ fontSize: 9, color: T.textFaint, transition: "transform 0.2s ease", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 10, paddingLeft: isTache ? 27 : 20, animation: "fadeIn 0.2s ease" }}>
          <p style={{
            fontSize: 14, fontFamily: isTache ? T.font : T.fontMono,
            fontWeight: isTache ? 400 : 300, color: T.text,
            lineHeight: 1.75, margin: "0 0 10px",
          }}>
            {item.text}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {item.projet && (
              <span style={{
                fontSize: 11, fontFamily: T.font, fontWeight: 500, color: "#666",
                background: `${PC[item.projet] || "#EEE"}25`, padding: "3px 9px", borderRadius: 6,
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: PC[item.projet] }} />
                {item.projet}
              </span>
            )}
            {urg && (
              <span style={{
                fontSize: 10, fontFamily: T.font, fontWeight: 600,
                color: urg.color, textTransform: "uppercase", letterSpacing: "0.03em",
              }}>
                {urg.label}
              </span>
            )}
            {item.duree && <span style={{ fontSize: 11, color: "#AAA", fontFamily: T.font }}>⏱ {item.duree}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
