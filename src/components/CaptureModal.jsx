import { useState, useRef, useEffect } from "react";
import { T, PROJETS, PC, URG, DUREES } from "../lib/constants.js";

export default function CaptureModal({ mode: initMode, projet: initProjet, prefill, onClose, onSave, onSaveCourse, world }) {
  const [mode, setMode] = useState(initMode || (world === "faire" ? "tache" : "carnet"));
  const [text, setText] = useState(prefill?.text || "");
  const [projet, setProjet] = useState(initProjet || prefill?.projet || "");
  const [urgence, setUrgence] = useState(prefill?.urgence || "");
  const [duree, setDuree] = useState(prefill?.duree || "");
  const [reference, setReference] = useState(prefill?.reference || false);
  const [showProjet, setShowProjet] = useState(false);
  const [showDuree, setShowDuree] = useState(false);
  const [saved, setSaved] = useState(false);
  const tRef = useRef(null);
  const isTache = mode === "tache";
  const isCourse = mode === "course";
  const isCarnet = mode === "carnet";
  const accent = isTache ? T.accent.faire : isCourse ? "#4EA66D" : T.accent.penser;

  useEffect(() => { setTimeout(() => tRef.current?.focus(), 100); }, [mode]);

  const save = () => {
    if (!text.trim()) return;
    if (isCourse) {
      text.split(/\n|,/).map((t) => t.trim()).filter(Boolean).forEach((t) => {
        onSaveCourse({ id: Date.now() + Math.random(), text: t, done: false });
      });
    } else {
      onSave({
        id: Date.now(), mode, text: text.trim(), projet, time: new Date(), done: false,
        ...(isTache ? { urgence, duree } : { reference }),
      });
    }
    setSaved(true);
    setText(""); setUrgence(""); setDuree(""); setReference(false);
    setTimeout(() => { setSaved(false); tRef.current?.focus(); }, 800);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(30,30,28,0.35)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: 50,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: 440, margin: "0 16px",
        background: "#FEFDFB", borderRadius: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)",
        overflow: "visible", position: "relative",
        animation: "modalIn 0.3s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px 0" }}>
          <div style={{ display: "flex", background: "rgba(0,0,0,0.04)", borderRadius: 18, padding: 2 }}>
            {[
              { id: "tache", l: "Tâche", c: T.accent.faire },
              { id: "carnet", l: "Idée", c: T.accent.penser },
              { id: "course", l: "Courses", c: "#4EA66D" },
            ].map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                padding: "5px 13px", borderRadius: 16, border: "none", cursor: "pointer",
                fontSize: 12, fontFamily: T.font, fontWeight: mode === m.id ? 600 : 400,
                background: mode === m.id ? "#FFF" : "transparent",
                color: mode === m.id ? m.c : T.textMuted,
                boxShadow: mode === m.id ? "0 1px 4px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.3s ease",
              }}>{m.l}</button>
            ))}
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: "50%", border: "none",
            background: "rgba(0,0,0,0.05)", cursor: "pointer",
            fontSize: 13, color: "#AAA", display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* Text */}
        <div style={{ padding: "14px 20px 0" }}>
          <textarea
            ref={tRef} value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); save(); } }}
            placeholder={isTache ? "À faire…" : isCourse ? "Lait, pain, citrons…" : "…"}
            rows={isCourse ? 2 : isTache ? 3 : 5}
            style={{
              width: "100%", border: "none", outline: "none", resize: "none",
              background: "transparent", boxSizing: "border-box", padding: 0,
              fontFamily: T.font, fontSize: 15, fontWeight: 400,
              lineHeight: 1.7, color: T.text,
            }}
          />
        </div>

        {/* Toolbar */}
        <div style={{ padding: "10px 20px 14px", borderTop: `1px solid ${T.border}`, marginTop: 6 }}>
          {!isCourse && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
              {/* Projet */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => { setShowProjet(!showProjet); setShowDuree(false); }}
                  style={{
                    padding: "5px 12px", borderRadius: 8,
                    border: `1.5px solid ${projet ? `${PC[projet]}66` : "rgba(0,0,0,0.08)"}`,
                    background: projet ? `${PC[projet]}12` : "rgba(0,0,0,0.02)",
                    cursor: "pointer", fontSize: 12, fontFamily: T.font, fontWeight: 500,
                    color: projet ? "#555" : T.textMuted, whiteSpace: "nowrap",
                  }}
                >
                  {projet ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: PC[projet] }} />
                      {projet}
                    </span>
                  ) : "Projet…"}
                </button>
                {showProjet && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", left: 0, background: "#FFF",
                    borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", padding: 4,
                    zIndex: 300, minWidth: 200, maxHeight: 260, overflowY: "auto",
                  }}>
                    {PROJETS.map((p) => (
                      <button key={p} onClick={() => { setProjet(p); setShowProjet(false); }} style={{
                        display: "flex", alignItems: "center", gap: 8, width: "100%",
                        padding: "8px 10px", border: "none", borderRadius: 6,
                        background: projet === p ? "rgba(0,0,0,0.04)" : "transparent",
                        cursor: "pointer", fontSize: 12, fontFamily: T.font, color: "#444", textAlign: "left",
                      }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: PC[p], flexShrink: 0 }} />
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Urgence */}
              {isTache && (
                <div style={{ display: "flex", gap: 3, background: "rgba(0,0,0,0.025)", borderRadius: 8, padding: "3px 4px" }}>
                  {URG.map((u) => (
                    <button key={u.value} onClick={() => setUrgence(urgence === u.value ? "" : u.value)} style={{
                      display: "flex", alignItems: "center", gap: 4,
                      padding: urgence === u.value ? "3px 10px 3px 6px" : "3px 6px",
                      borderRadius: 6, border: "none",
                      background: urgence === u.value ? `${u.color}15` : "transparent",
                      cursor: "pointer", transition: "all 0.2s ease",
                    }}>
                      <span style={{
                        width: 11, height: 11, borderRadius: "50%", background: u.color,
                        opacity: urgence === u.value ? 1 : 0.25, transition: "all 0.2s ease",
                      }} />
                      {urgence === u.value && (
                        <span style={{ fontSize: 11, fontWeight: 500, color: u.color, fontFamily: T.font, animation: "fadeIn 0.2s ease" }}>
                          {u.label}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Durée */}
              {isTache && (
                <div style={{ position: "relative" }}>
                  <button onClick={() => { setShowDuree(!showDuree); setShowProjet(false); }} style={{
                    padding: "5px 12px", borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.08)",
                    background: duree ? "rgba(0,0,0,0.03)" : "rgba(0,0,0,0.02)",
                    cursor: "pointer", fontSize: 12, fontFamily: T.font,
                    fontWeight: duree ? 500 : 400, color: duree ? "#555" : T.textMuted,
                  }}>⏱ {duree || "Durée"}</button>
                  {showDuree && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 4px)", left: 0, background: "#FFF",
                      borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", padding: 4,
                      zIndex: 300, minWidth: 140,
                    }}>
                      {DUREES.map((dd) => (
                        <button key={dd} onClick={() => { setDuree(dd); setShowDuree(false); }} style={{
                          display: "block", width: "100%", padding: "8px 10px", border: "none", borderRadius: 6,
                          background: duree === dd ? "rgba(0,0,0,0.04)" : "transparent",
                          cursor: "pointer", fontSize: 12, fontFamily: T.font, color: "#444", textAlign: "left",
                        }}>{dd}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Référence */}
              {isCarnet && (
                <button onClick={() => setReference(!reference)} style={{
                  padding: "5px 12px", borderRadius: 8,
                  border: `1.5px solid ${reference ? "#6B8ACA" : "rgba(0,0,0,0.08)"}`,
                  background: reference ? "#6B8ACA12" : "rgba(0,0,0,0.02)",
                  cursor: "pointer", fontSize: 12, fontFamily: T.font,
                  fontWeight: reference ? 500 : 400, color: reference ? "#5A76B0" : T.textMuted,
                }}>📎 Référence{reference ? " ✓" : ""}</button>
              )}
            </div>
          )}

          {isCourse && (
            <p style={{ fontSize: 11, color: T.textMuted, fontFamily: T.font, margin: "0 0 10px", fontStyle: "italic" }}>
              Sépare par virgule ou retour à la ligne
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: T.textFaint, fontFamily: T.font }}>⌘+Entrée</span>
            <button onClick={save} disabled={!text.trim()} style={{
              padding: "9px 28px", borderRadius: 10, border: "none",
              background: saved ? "#4EA66D" : text.trim() ? accent : "rgba(0,0,0,0.05)",
              color: text.trim() || saved ? "#FFF" : "#C0C0C0",
              cursor: text.trim() ? "pointer" : "default",
              fontSize: 14, fontFamily: T.font, fontWeight: 600,
              transition: "all 0.3s ease",
            }}>
              {saved ? "✓ Capturé" : "Capturer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
