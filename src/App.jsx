import { useState, useRef, useEffect, useMemo } from "react";
import { T, PC } from "./lib/constants.js";
import { isToday, isThisWeek, isThisMonth } from "./lib/utils.js";
import { SAMPLE, SAMPLE_COURSES } from "./data/sample.js";
import NoteRow from "./components/NoteRow.jsx";
import Section from "./components/Section.jsx";
import CaptureModal from "./components/CaptureModal.jsx";
import CourseList from "./components/CourseList.jsx";
import VoiceCapture from "./components/VoiceCapture.jsx";

function Card({ children, style }) {
  return (
    <div style={{ background: T.card, borderRadius: 12, boxShadow: T.cardShadow, overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

function ExpandBtn({ total, limit, expanded, onClick }) {
  return total > limit && !expanded ? (
    <button onClick={onClick} style={{
      display: "block", width: "100%", padding: "10px", border: "none",
      background: "transparent", cursor: "pointer", fontSize: 12,
      fontFamily: T.font, color: T.textMuted, textAlign: "center",
      borderTop: `1px solid ${T.border}`,
    }}>
      Voir tout ({total})
    </button>
  ) : null;
}

export default function App() {
  const [items, setItems] = useState(SAMPLE);
  const [courses, setCourses] = useState(SAMPLE_COURSES);
  const [world, setWorld] = useState("faire");
  const [subNav, setSubNav] = useState("today");
  const [showCapture, setShowCapture] = useState(null);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [expandTri, setExpandTri] = useState(false);
  const [expandMain, setExpandMain] = useState(false);
  const [filterProjet, setFilterProjet] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const searchRef = useRef(null);

  const accent = T.accent[world];

  const toggleDone = (id) => setItems((p) => p.map((i) => i.id === id ? { ...i, done: !i.done } : i));
  const addItem = (item) => setItems((p) => [item, ...p]);
  const addCourse = (text) => setCourses((p) => [...p, { id: Date.now(), text, done: false }]);
  const toggleCourse = (id) => setCourses((p) => p.map((c) => c.id === id ? { ...c, done: !c.done } : c));

  // Faire lists
  const todayTasks = useMemo(() =>
    items.filter((i) => i.mode === "tache" && isToday(i.time) && i.projet)
      .sort((a, b) => {
        const u = ["urgent", "semaine", "quand je peux"];
        return (a.done ? 1 : 0) - (b.done ? 1 : 0) || u.indexOf(a.urgence) - u.indexOf(b.urgence);
      }), [items]);

  const weekTasks = useMemo(() =>
    items.filter((i) => i.mode === "tache" && i.projet && isThisWeek(i.time))
      .sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0) || a.time - b.time), [items]);

  const monthTasks = useMemo(() =>
    items.filter((i) => i.mode === "tache" && i.projet && isThisMonth(i.time))
      .sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0) || a.time - b.time), [items]);

  const triTaches = useMemo(() =>
    items.filter((i) => i.mode === "tache" && !i.projet).sort((a, b) => b.time - a.time), [items]);

  // Penser lists
  const recentIdees = useMemo(() =>
    items.filter((i) => i.mode === "carnet" && i.projet).sort((a, b) => b.time - a.time), [items]);

  const triIdees = useMemo(() =>
    items.filter((i) => i.mode === "carnet" && !i.projet).sort((a, b) => b.time - a.time), [items]);

  // Search
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    const pool = world === "faire" ? items.filter((i) => i.mode === "tache") : items.filter((i) => i.mode === "carnet");
    return pool.filter((i) => i.text.toLowerCase().includes(q) || (i.projet || "").toLowerCase().includes(q))
      .sort((a, b) => b.time - a.time);
  }, [items, search, world]);

  useEffect(() => { if (showSearch && searchRef.current) searchRef.current.focus(); }, [showSearch]);

  const switchWorld = (w) => {
    setWorld(w);
    setSubNav(w === "faire" ? "today" : "recent");
    setExpandTri(false);
    setExpandMain(false);
    setFilterProjet("");
    setShowFilter(false);
    setShowFabMenu(false);
    setShowSearch(false);
    setSearch("");
  };

  const handleVoiceResult = (result) => {
    setShowCapture({
      mode: result.mode || "tache",
      prefill: {
        text: result.text || "",
        projet: result.projet || "",
        urgence: result.urgence || "",
        duree: result.duree || "",
        reference: result.reference || false,
      },
    });
  };

  const handleAddCourses = (courseTexts) => {
    courseTexts.forEach((t) => setCourses((p) => [...p, { id: Date.now() + Math.random(), text: t, done: false }]));
  };

  const renderTriSection = (triItems) => {
    if (triItems.length === 0) return null;
    return (
      <Section
        title="À trier"
        badge={
          <span style={{
            fontSize: 10, fontFamily: T.font, fontWeight: 700, color: "#FFF",
            background: accent, padding: "2px 8px", borderRadius: 8, marginLeft: 2,
          }}>{triItems.length}</span>
        }
      >
        <Card>
          {(expandTri ? triItems : triItems.slice(0, 3)).map((i) => (
            <NoteRow key={i.id} item={i} onToggle={i.mode === "tache" ? toggleDone : null} />
          ))}
          <ExpandBtn total={triItems.length} limit={3} expanded={expandTri} onClick={() => setExpandTri(true)} />
        </Card>
      </Section>
    );
  };

  const renderProjectFilter = (rawList) => {
    const activeProjects = [...new Set(rawList.map((i) => i.projet).filter(Boolean))].sort();
    if (activeProjects.length <= 1) return null;
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14, position: "relative" }}>
        <button onClick={() => setShowFilter(!showFilter)} style={{
          padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer",
          fontSize: 11, fontFamily: T.font, fontWeight: filterProjet ? 500 : 400,
          background: filterProjet ? `${PC[filterProjet]}18` : "rgba(0,0,0,0.03)",
          color: filterProjet ? "#555" : T.textMuted,
          display: "flex", alignItems: "center", gap: 5,
          transition: "all 0.2s ease",
        }}>
          {filterProjet && <span style={{ width: 5, height: 5, borderRadius: "50%", background: PC[filterProjet] }} />}
          {filterProjet ? (filterProjet.length > 18 ? filterProjet.slice(0, 16) + "…" : filterProjet) : "Filtrer"}
          <span style={{ fontSize: 8, marginLeft: 2 }}>{showFilter ? "▴" : "▾"}</span>
        </button>
        {showFilter && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", right: 0, background: "#FFF",
            borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.04)",
            padding: 4, zIndex: 200, minWidth: 180, maxHeight: 280, overflowY: "auto",
          }}>
            <button onClick={() => { setFilterProjet(""); setShowFilter(false); setExpandMain(false); }} style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "8px 10px", border: "none", borderRadius: 6,
              background: !filterProjet ? "rgba(0,0,0,0.04)" : "transparent",
              cursor: "pointer", fontSize: 12, fontFamily: T.font, color: "#444", textAlign: "left",
            }}>Tout</button>
            {activeProjects.map((p) => (
              <button key={p} onClick={() => { setFilterProjet(p); setShowFilter(false); setExpandMain(false); }} style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                padding: "8px 10px", border: "none", borderRadius: 6,
                background: filterProjet === p ? "rgba(0,0,0,0.04)" : "transparent",
                cursor: "pointer", fontSize: 12, fontFamily: T.font, color: "#444", textAlign: "left",
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: PC[p], flexShrink: 0 }} />
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFaire = () => {
    const rawList = subNav === "today" ? todayTasks : subNav === "semaine" ? weekTasks : monthTasks;
    const list = filterProjet ? rawList.filter((i) => i.projet === filterProjet) : rawList;
    const label = subNav === "today" ? "Aujourd'hui" : subNav === "semaine" ? "Cette semaine" : "Ce mois";
    const shown = expandMain ? list : list.slice(0, 8);

    return (
      <>
        <div style={{ display: "flex", gap: 2, marginBottom: 12, background: "rgba(0,0,0,0.03)", borderRadius: 8, padding: 2 }}>
          {[{ id: "today", l: "Aujourd'hui" }, { id: "semaine", l: "Semaine" }, { id: "mois", l: "Mois" }].map((n) => (
            <button key={n.id} onClick={() => { setSubNav(n.id); setExpandMain(false); setFilterProjet(""); setShowFilter(false); }} style={{
              flex: 1, padding: "7px 4px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 12, fontFamily: T.font, fontWeight: subNav === n.id ? 600 : 400,
              background: subNav === n.id ? "#FFF" : "transparent",
              color: subNav === n.id ? T.text : T.textMuted,
              boxShadow: subNav === n.id ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
              transition: "all 0.2s ease",
            }}>{n.l}</button>
          ))}
        </div>

        {renderProjectFilter(rawList)}

        <Section title={label} count={list.filter((t) => !t.done).length}>
          <Card>
            {list.length === 0 ? (
              <p style={{ padding: 20, textAlign: "center", color: T.textFaint, fontSize: 13, fontFamily: T.font, fontStyle: "italic" }}>
                {subNav === "today" ? "Rien pour aujourd'hui." : "Rien ici."}
              </p>
            ) : shown.map((i) => <NoteRow key={i.id} item={i} onToggle={toggleDone} />)}
            <ExpandBtn total={list.length} limit={8} expanded={expandMain} onClick={() => setExpandMain(true)} />
          </Card>
        </Section>

        {renderTriSection(triTaches)}

        {subNav === "today" && (
          <Section title="Courses" count={courses.filter((c) => !c.done).length}>
            <CourseList courses={courses} onToggle={toggleCourse} onAdd={addCourse} />
          </Section>
        )}
      </>
    );
  };

  const renderPenser = () => {
    const filtered = filterProjet ? recentIdees.filter((i) => i.projet === filterProjet) : recentIdees;
    const shown = expandMain ? filtered : filtered.slice(0, 8);

    return (
      <>
        {renderProjectFilter(recentIdees)}

        <Section title="Dernières réflexions" count={filtered.length}>
          <Card>
            {filtered.length === 0 ? (
              <p style={{ padding: 20, textAlign: "center", color: T.textFaint, fontSize: 13, fontFamily: T.font, fontStyle: "italic" }}>
                {filterProjet ? "Rien dans ce projet." : "Rien encore."}
              </p>
            ) : shown.map((i) => <NoteRow key={i.id} item={i} />)}
            <ExpandBtn total={filtered.length} limit={8} expanded={expandMain} onClick={() => setExpandMain(true)} />
          </Card>
        </Section>

        {renderTriSection(triIdees)}
      </>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes recPulse { 0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(217,79,59,0.4) } 50% { transform: scale(1.05); box-shadow: 0 0 0 16px rgba(217,79,59,0) } }
        @keyframes fabMenuIn { from { opacity: 0; transform: translateX(-50%) translateY(6px) } to { opacity: 1; transform: translateX(-50%) translateY(0) } }
        * { -webkit-tap-highlight-color: transparent }
        input::placeholder, textarea::placeholder { color: #B0B0B0 !important }
      `}</style>

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 480, padding: "18px 20px 0", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <h1 style={{ fontSize: 19, fontWeight: 700, color: T.text, margin: 0, letterSpacing: "-0.03em" }}>Mémoire vive</h1>
            <p style={{ fontSize: 10, color: T.textFaint, margin: "1px 0 0", fontStyle: "italic", letterSpacing: "0.03em" }}>le pense-pas-bête</p>
          </div>
          <button onClick={() => { setShowSearch(!showSearch); setSearch(""); }} style={{
            width: 32, height: 32, borderRadius: "50%", border: "none",
            background: showSearch ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.04)",
            cursor: "pointer", fontSize: 14, color: "#888",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>⌕</button>
        </div>

        {/* World toggle */}
        <div style={{ display: "flex", marginBottom: 12, background: "rgba(0,0,0,0.04)", borderRadius: 12, padding: 3 }}>
          {["faire", "penser"].map((w) => (
            <button key={w} onClick={() => switchWorld(w)} style={{
              flex: 1, padding: "10px 4px", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 14, fontFamily: T.font, fontWeight: world === w ? 700 : 400,
              letterSpacing: world === w ? "-0.01em" : "0",
              background: world === w ? T.card : "transparent",
              color: world === w ? T.accent[w] : T.textMuted,
              boxShadow: world === w ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
              transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
            }}>
              {w === "faire" ? "Faire" : "Penser"}
            </button>
          ))}
        </div>

        {/* Search */}
        {showSearch && (
          <div style={{ marginBottom: 14, animation: "fadeIn 0.2s ease" }}>
            <input
              ref={searchRef} value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: "1.5px solid rgba(0,0,0,0.08)", background: "#FFF",
                fontSize: 14, fontFamily: T.font, color: T.text,
                outline: "none", boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.15)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.08)")}
            />
            {search.trim() && (
              <Card style={{ marginTop: 8 }}>
                {searchResults.length === 0 ? (
                  <p style={{ padding: 16, textAlign: "center", color: T.textFaint, fontSize: 13, fontStyle: "italic" }}>Rien trouvé.</p>
                ) : searchResults.slice(0, 10).map((i) => (
                  <NoteRow key={i.id} item={i} onToggle={i.mode === "tache" ? toggleDone : null} />
                ))}
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ width: "100%", maxWidth: 480, padding: "0 20px 100px", boxSizing: "border-box" }}>
        {world === "faire" && renderFaire()}
        {world === "penser" && renderPenser()}
      </div>

      {/* FAB overlay */}
      {showFabMenu && <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setShowFabMenu(false)} />}

      {/* FAB */}
      <div style={{
        position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 100,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        {showFabMenu && (
          <div style={{
            position: "absolute", bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)",
            background: "#FFF", borderRadius: 14, padding: 5,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)",
            display: "flex", flexDirection: "column", gap: 2, minWidth: 140,
            animation: "fabMenuIn 0.15s ease",
          }}>
            {[
              { id: "tache", label: "Tâche", color: T.accent.faire },
              { id: "carnet", label: "Idée", color: T.accent.penser },
              { id: "course", label: "Courses", color: "#4EA66D" },
            ].map((opt) => (
              <button key={opt.id} onClick={() => { setShowFabMenu(false); setShowCapture({ mode: opt.id }); }} style={{
                padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                fontSize: 13, fontFamily: T.font, fontWeight: 500, color: opt.color,
                background: "transparent", textAlign: "left",
                transition: "background 0.15s ease",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => setShowFabMenu(!showFabMenu)} style={{
          padding: "12px 28px", borderRadius: 14, border: "none",
          background: showFabMenu ? "#444" : "#555", color: "#FFF", cursor: "pointer",
          fontSize: 14, fontFamily: T.font, fontWeight: 600,
          boxShadow: "0 4px 18px rgba(0,0,0,0.25)",
          transition: "all 0.2s ease", letterSpacing: "0.01em",
        }}>
          + Capturer
        </button>
        <VoiceCapture onResult={handleVoiceResult} onAddCourses={handleAddCourses} />
      </div>

      {/* Modal */}
      {showCapture && (
        <CaptureModal
          mode={showCapture.mode}
          projet={showCapture.projet}
          prefill={showCapture.prefill}
          world={world}
          onClose={() => setShowCapture(null)}
          onSave={addItem}
          onSaveCourse={(c) => setCourses((p) => [...p, c])}
        />
      )}
    </div>
  );
}
