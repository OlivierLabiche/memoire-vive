import { useState, useRef, useEffect, useCallback, useMemo } from "react";

/* ═══════ CONSTANTS ═══════ */
const PROJETS = [
  "Santé et forme","Formation","Chaotik Lab","Lacan",
  "Dramathérapie / Théâtre Sensible","La Voix des Papillons",
  "Radio Tik Tak","Présence numérique","Trading",
  "Perso / Famille","Spectacle / Création"
];
const PC = {
  "Santé et forme":"#7DB87D","Formation":"#6A9FCA","Chaotik Lab":"#D48A5A",
  "Lacan":"#9A7DB8","Dramathérapie / Théâtre Sensible":"#C47A94",
  "La Voix des Papillons":"#B8B46A","Radio Tik Tak":"#5AB8B0",
  "Présence numérique":"#8AAA6A","Trading":"#B89A6A",
  "Perso / Famille":"#D4A87A","Spectacle / Création":"#A07AC4",
};
const URG = [
  { label:"Urgent", value:"urgent", color:"#D94F3B" },
  { label:"Cette semaine", value:"semaine", color:"#D4A03C" },
  { label:"Quand je peux", value:"quand je peux", color:"#4EA66D" },
];
const DUREES = ["5 min max","20 min","~1 heure","2 heures","Demi-journée","Long terme"];

const today = new Date();
const d = (off,h=9) => { const x=new Date(today); x.setDate(x.getDate()+off); x.setHours(h,0,0,0); return x; };

const SAMPLE = [
  { id:1,mode:"tache",text:"Appeler le comptable pour le statut auto-entrepreneur",projet:"Chaotik Lab",urgence:"urgent",duree:"20 min",time:d(0,8),done:false },
  { id:2,mode:"tache",text:"Préparer le canevas pour la répétition avec Pierre",projet:"Spectacle / Création",urgence:"semaine",duree:"~1 heure",time:d(0,9),done:false },
  { id:3,mode:"tache",text:"Répondre au mail de la MJC pour les ateliers de juin",projet:"Dramathérapie / Théâtre Sensible",urgence:"urgent",duree:"20 min",time:d(0,10),done:true },
  { id:4,mode:"tache",text:"Mettre à jour le profil Google My Business",projet:"Chaotik Lab",urgence:"semaine",duree:"20 min",time:d(1,9),done:false },
  { id:5,mode:"tache",text:"Fixer le bug d'affichage mobile sur TradeSpotter",projet:"Trading",urgence:"quand je peux",duree:"~1 heure",time:d(2,14),done:false },
  { id:6,mode:"tache",text:"Prendre RDV chez le dentiste",projet:"Santé et forme",urgence:"semaine",duree:"5 min max",time:d(3,10),done:false },
  { id:7,mode:"tache",text:"Envoyer les photos de l'appartement à Maria",projet:"Perso / Famille",urgence:"quand je peux",duree:"20 min",time:d(5,11),done:false },
  { id:8,mode:"tache",text:"Acheter une coque pour le nouveau MacBook",projet:"",urgence:"semaine",duree:"20 min",time:d(0,11),done:false },
  { id:9,mode:"tache",text:"Vérifier les disponibilités Airbnb Granada juillet",projet:"",urgence:"",duree:"~1 heure",time:d(0,14),done:false },
  { id:10,mode:"carnet",text:"Explorer le lien entre le holding environment de Winnicott et l'espace de jeu dans l'impro sensible — la scène comme espace transitionnel, un lieu où l'on peut échouer sans conséquence réelle.",projet:"Dramathérapie / Théâtre Sensible",reference:false,time:d(0,7) },
  { id:11,mode:"carnet",text:"Podcast France Culture sur Lacan et le stade du miroir — épisode du 12 avril 2026",projet:"Lacan",reference:true,time:d(-1,20) },
  { id:12,mode:"carnet",text:"Idée pour Monter en bas : Paul pourrait commenter un silence de Pierre comme s'il s'agissait d'un moment de grâce radiophonique — le silence devient l'événement.",projet:"Spectacle / Création",reference:false,time:d(-1,15) },
  { id:13,mode:"carnet",text:"Article Revue Française de Psychanalyse sur le Nachträglichkeit et sa pertinence en art-thérapie — à relire et annoter.",projet:"Lacan",reference:true,time:d(-2,11) },
  { id:14,mode:"carnet",text:"Et si le fibo de biais obligatoire fonctionnait comme le neutre-marche en impro sensible : un reset corporel avant l'action. Un geste physique qui freine l'impulsion.",projet:"Trading",reference:false,time:d(-3,10) },
  { id:15,mode:"carnet",text:"Chercher des exemples de portfolios artisan numérique pour le site Chaotik Lab",projet:"",reference:false,time:d(0,12) },
  { id:16,mode:"carnet",text:"Revoir la structure du pitch pour les ateliers en EHPAD",projet:"",reference:false,time:d(-1,9) },
];

const SAMPLE_COURSES = [
  { id:100,text:"Lait",done:false },
  { id:101,text:"Pain",done:false },
  { id:102,text:"Citrons",done:false },
  { id:103,text:"Café en grains",done:true },
  { id:104,text:"Papier toilette",done:false },
];

const fmtDate = d => d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
const fmtShort = d => d.toLocaleDateString("fr-FR",{day:"numeric",month:"short"});
const fmtRel = date => {
  const diff = today - date;
  if (diff < 0) return fmtShort(date);
  if (diff < 86400000) return "Aujourd'hui";
  if (diff < 172800000) return "Hier";
  if (diff < 604800000) return date.toLocaleDateString("fr-FR",{weekday:"long"});
  return fmtShort(date);
};
const isToday = date => date.toDateString()===today.toDateString();
const isThisWeek = date => {
  const s=new Date(today); s.setDate(today.getDate()-today.getDay()+1); s.setHours(0,0,0,0);
  const e=new Date(s); e.setDate(s.getDate()+7);
  return date>=s && date<e;
};
const isThisMonth = date => date.getMonth()===today.getMonth()&&date.getFullYear()===today.getFullYear();
const truncate = (s,n=65) => s.length>n ? s.slice(0,n)+"…" : s;

/* ═══════ THEME ═══════ */
const T = {
  bg: "#F6F4F0",
  card: "#FFFFFF",
  cardShadow: "0 1px 5px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)",
  accent: { faire:"#8A7340", penser:"#6A7B8A" },
  accentBg: { faire:"#F0EBE0", penser:"#E8ECF0" },
  accentLight: { faire:"#EDE7D8", penser:"#DDE3EA" },
  text: "#2A2A2A",
  textMuted: "#999",
  textFaint: "#CCC",
  border: "rgba(0,0,0,0.05)",
  font: "'DM Sans', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

/* ═══════ COMPONENTS ═══════ */

function NoteRow({ item, onToggle }) {
  const [open, setOpen] = useState(false);
  const isTache = item.mode==="tache";
  const urg = URG.find(u=>u.value===item.urgence);

  return (
    <div style={{
      padding:"8px 14px", borderBottom:`1px solid ${T.border}`,
      background: open ? "rgba(0,0,0,0.015)" : "transparent",
      transition:"background 0.15s ease",
    }}>
      {/* Compact row */}
      <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}
        onClick={()=>setOpen(!open)}>
        {isTache && onToggle && (
          <div onClick={e=>{e.stopPropagation();onToggle(item.id);}}
            style={{
              width:17,height:17,borderRadius:5,flexShrink:0,
              border:item.done?"none":"1.5px solid #CDCDCD",
              background:item.done?"#4EA66D":"transparent",
              display:"flex",alignItems:"center",justifyContent:"center",
              cursor:"pointer",transition:"all 0.2s ease",
            }}>
            {item.done && <span style={{color:"#FFF",fontSize:10,fontWeight:700}}>✓</span>}
          </div>
        )}
        {!isTache && (
          <span style={{width:3,height:3,borderRadius:"50%",flexShrink:0,
            background:item.reference?"#6B8ACA":"#C8C8C8",marginTop:1}}/>
        )}
        <span style={{
          flex:1,fontSize:13,fontFamily:T.font,fontWeight:400,
          color:item.done?"#BBB":T.text,
          textDecoration:item.done?"line-through":"none",
          lineHeight:1.35,
        }}>{open ? item.text : truncate(item.text)}</span>
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          {urg && <span style={{width:6,height:6,borderRadius:"50%",background:urg.color,opacity:0.6}}/>}
          {item.duree && !open && <span style={{fontSize:10,color:"#BBB",fontFamily:T.font}}>⏱{item.duree}</span>}
          <span style={{fontSize:10,color:T.textFaint,fontFamily:T.font,minWidth:46,textAlign:"right"}}>{fmtRel(item.time)}</span>
          <span style={{fontSize:9,color:T.textFaint,transition:"transform 0.2s ease",
            transform:open?"rotate(180deg)":"rotate(0)"}}>▾</span>
        </div>
      </div>
      {/* Expanded */}
      {open && (
        <div style={{marginTop:10,paddingLeft:isTache?27:20,animation:"fadeIn 0.2s ease"}}>
          <p style={{
            fontSize:14,fontFamily:isTache?T.font:T.fontMono,
            fontWeight:isTache?400:300,color:T.text,
            lineHeight:1.75,margin:"0 0 10px",
          }}>{item.text}</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            {item.projet && <span style={{
              fontSize:11,fontFamily:T.font,fontWeight:500,color:"#666",
              background:`${PC[item.projet]||"#EEE"}25`,padding:"3px 9px",borderRadius:6,
              display:"flex",alignItems:"center",gap:5,
            }}>
              <span style={{width:6,height:6,borderRadius:"50%",background:PC[item.projet]}}/>
              {item.projet}
            </span>}
            {urg && <span style={{fontSize:10,fontFamily:T.font,fontWeight:600,
              color:urg.color,textTransform:"uppercase",letterSpacing:"0.03em"}}>{urg.label}</span>}
            {item.duree && <span style={{fontSize:11,color:"#AAA",fontFamily:T.font}}>⏱ {item.duree}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({title,count,children,action,badge}) {
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,padding:"0 2px"}}>
        <span style={{fontSize:12,fontFamily:T.font,fontWeight:600,color:"#888",
          textTransform:"uppercase",letterSpacing:"0.07em"}}>{title}</span>
        {count!=null && <span style={{fontSize:10,fontFamily:T.font,fontWeight:600,
          color:"#AAA",background:"rgba(0,0,0,0.04)",padding:"2px 7px",borderRadius:8}}>{count}</span>}
        {badge}
        <div style={{flex:1,height:1,background:T.border}}/>
        {action}
      </div>
      {children}
    </div>
  );
}

function Card({children,style}) {
  return <div style={{background:T.card,borderRadius:12,boxShadow:T.cardShadow,overflow:"hidden",...style}}>{children}</div>;
}

function ExpandBtn({total,limit,expanded,onClick}) {
  return total>limit && !expanded ? (
    <button onClick={onClick} style={{
      display:"block",width:"100%",padding:"10px",border:"none",
      background:"transparent",cursor:"pointer",fontSize:12,
      fontFamily:T.font,color:T.textMuted,textAlign:"center",
      borderTop:`1px solid ${T.border}`,
    }}>Voir tout ({total})</button>
  ) : null;
}

function CaptureModal({mode:initMode,projet:initProjet,prefill,onClose,onSave,onSaveCourse,world}) {
  const [mode,setMode] = useState(initMode||(world==="faire"?"tache":"carnet"));
  const [text,setText] = useState(prefill?.text||"");
  const [projet,setProjet] = useState(initProjet||prefill?.projet||"");
  const [urgence,setUrgence] = useState(prefill?.urgence||"");
  const [duree,setDuree] = useState(prefill?.duree||"");
  const [reference,setReference] = useState(prefill?.reference||false);
  const [showProjet,setShowProjet] = useState(false);
  const [showDuree,setShowDuree] = useState(false);
  const [saved,setSaved] = useState(false);
  const tRef = useRef(null);
  const isTache = mode==="tache";
  const isCourse = mode==="course";
  const isCarnet = mode==="carnet";
  const accent = isTache ? T.accent.faire : isCourse ? "#4EA66D" : T.accent.penser;

  useEffect(()=>{setTimeout(()=>tRef.current?.focus(),100)},[mode]);

  const save = () => {
    if(!text.trim()) return;
    if(isCourse) {
      text.split(/\n|,/).map(t=>t.trim()).filter(Boolean).forEach(t=>{
        onSaveCourse({id:Date.now()+Math.random(),text:t,done:false});
      });
    } else {
      onSave({id:Date.now(),mode,text:text.trim(),projet,time:new Date(),done:false,
        ...(isTache?{urgence,duree}:{reference})});
    }
    setSaved(true);
    setText("");setUrgence("");setDuree("");setReference(false);
    setTimeout(()=>{setSaved(false);tRef.current?.focus();},800);
  };

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:500,
      background:"rgba(30,30,28,0.35)",backdropFilter:"blur(6px)",
      display:"flex",alignItems:"flex-start",justifyContent:"center",
      paddingTop:50,
    }} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{
        width:"100%",maxWidth:440,margin:"0 16px",
        background:"#FEFDFB",borderRadius:16,
        boxShadow:"0 20px 60px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)",
        overflow:"visible",position:"relative",
        animation:"modalIn 0.3s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px 0"}}>
          <div style={{display:"flex",background:"rgba(0,0,0,0.04)",borderRadius:18,padding:2}}>
            {[{id:"tache",l:"Tâche",c:T.accent.faire},{id:"carnet",l:"Idée",c:T.accent.penser},{id:"course",l:"Courses",c:"#4EA66D"}].map(m=>(
              <button key={m.id} onClick={()=>setMode(m.id)} style={{
                padding:"5px 13px",borderRadius:16,border:"none",cursor:"pointer",
                fontSize:12,fontFamily:T.font,fontWeight:mode===m.id?600:400,
                background:mode===m.id?"#FFF":"transparent",
                color:mode===m.id?m.c:T.textMuted,
                boxShadow:mode===m.id?"0 1px 4px rgba(0,0,0,0.05)":"none",
                transition:"all 0.3s ease",
              }}>{m.l}</button>
            ))}
          </div>
          <button onClick={onClose} style={{
            width:28,height:28,borderRadius:"50%",border:"none",
            background:"rgba(0,0,0,0.05)",cursor:"pointer",
            fontSize:13,color:"#AAA",display:"flex",alignItems:"center",justifyContent:"center",
          }}>✕</button>
        </div>

        {/* Text */}
        <div style={{padding:"14px 20px 0"}}>
          <textarea ref={tRef} value={text} onChange={e=>setText(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey)){e.preventDefault();save();}}}
            placeholder={isTache?"À faire…":isCourse?"Lait, pain, citrons…":"…"}
            rows={isCourse?2:isTache?3:5}
            style={{
              width:"100%",border:"none",outline:"none",resize:"none",
              background:"transparent",boxSizing:"border-box",padding:0,
              fontFamily:T.font,fontSize:15,fontWeight:400,
              lineHeight:1.7,color:T.text,
            }}/>
        </div>

        {/* Toolbar */}
        <div style={{padding:"10px 20px 14px",borderTop:`1px solid ${T.border}`,marginTop:6}}>
          {!isCourse && (
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:10,}}>
            {/* Projet */}
            <div style={{position:"relative"}}>
              <button onClick={()=>{setShowProjet(!showProjet);setShowDuree(false);}} style={{
                padding:"5px 12px",borderRadius:8,
                border:`1.5px solid ${projet?`${PC[projet]}66`:"rgba(0,0,0,0.08)"}`,
                background:projet?`${PC[projet]}12`:"rgba(0,0,0,0.02)",
                cursor:"pointer",fontSize:12,fontFamily:T.font,fontWeight:500,
                color:projet?"#555":T.textMuted,whiteSpace:"nowrap",
              }}>
                {projet?<span style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:PC[projet]}}/>
                  {projet}
                </span>:"Projet…"}
              </button>
              {showProjet && <div style={{
                position:"absolute",top:"calc(100% + 4px)",left:0,background:"#FFF",
                borderRadius:10,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",padding:4,
                zIndex:300,minWidth:200,maxHeight:260,overflowY:"auto",
              }}>
                {PROJETS.map(p=>(
                  <button key={p} onClick={()=>{setProjet(p);setShowProjet(false);}} style={{
                    display:"flex",alignItems:"center",gap:8,width:"100%",
                    padding:"8px 10px",border:"none",borderRadius:6,
                    background:projet===p?"rgba(0,0,0,0.04)":"transparent",
                    cursor:"pointer",fontSize:12,fontFamily:T.font,color:"#444",textAlign:"left",
                  }}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:PC[p],flexShrink:0}}/>
                    {p}
                  </button>
                ))}
              </div>}
            </div>
            {/* Urgence */}
            {isTache && <div style={{display:"flex",gap:3,background:"rgba(0,0,0,0.025)",borderRadius:8,padding:"3px 4px"}}>
              {URG.map(u=>(
                <button key={u.value} onClick={()=>setUrgence(urgence===u.value?"":u.value)} style={{
                  display:"flex",alignItems:"center",gap:4,
                  padding:urgence===u.value?"3px 10px 3px 6px":"3px 6px",
                  borderRadius:6,border:"none",
                  background:urgence===u.value?`${u.color}15`:"transparent",
                  cursor:"pointer",transition:"all 0.2s ease",
                }}>
                  <span style={{width:11,height:11,borderRadius:"50%",background:u.color,
                    opacity:urgence===u.value?1:0.25,transition:"all 0.2s ease"}}/>
                  {urgence===u.value && <span style={{fontSize:11,fontWeight:500,color:u.color,
                    fontFamily:T.font,animation:"fadeIn 0.2s ease"}}>{u.label}</span>}
                </button>
              ))}
            </div>}
            {/* Durée */}
            {isTache && <div style={{position:"relative"}}>
              <button onClick={()=>{setShowDuree(!showDuree);setShowProjet(false);}} style={{
                padding:"5px 12px",borderRadius:8,border:"1.5px solid rgba(0,0,0,0.08)",
                background:duree?"rgba(0,0,0,0.03)":"rgba(0,0,0,0.02)",
                cursor:"pointer",fontSize:12,fontFamily:T.font,
                fontWeight:duree?500:400,color:duree?"#555":T.textMuted,
              }}>⏱ {duree||"Durée"}</button>
              {showDuree && <div style={{
                position:"absolute",top:"calc(100% + 4px)",left:0,background:"#FFF",
                borderRadius:10,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",padding:4,
                zIndex:300,minWidth:140,
              }}>
                {DUREES.map(dd=>(
                  <button key={dd} onClick={()=>{setDuree(dd);setShowDuree(false);}} style={{
                    display:"block",width:"100%",padding:"8px 10px",border:"none",borderRadius:6,
                    background:duree===dd?"rgba(0,0,0,0.04)":"transparent",
                    cursor:"pointer",fontSize:12,fontFamily:T.font,color:"#444",textAlign:"left",
                  }}>{dd}</button>
                ))}
              </div>}
            </div>}
            {/* Référence */}
            {isCarnet && <button onClick={()=>setReference(!reference)} style={{
              padding:"5px 12px",borderRadius:8,
              border:`1.5px solid ${reference?"#6B8ACA":"rgba(0,0,0,0.08)"}`,
              background:reference?"#6B8ACA12":"rgba(0,0,0,0.02)",
              cursor:"pointer",fontSize:12,fontFamily:T.font,
              fontWeight:reference?500:400,color:reference?"#5A76B0":T.textMuted,
            }}>📎 Référence{reference?" ✓":""}</button>}
          </div>
          )}
          {isCourse && (
            <p style={{fontSize:11,color:T.textMuted,fontFamily:T.font,margin:"0 0 10px",fontStyle:"italic"}}>
              Sépare par virgule ou retour à la ligne
            </p>
          )}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:11,color:T.textFaint,fontFamily:T.font}}>⌘+Entrée</span>
            <button onClick={save} disabled={!text.trim()} style={{
              padding:"9px 28px",borderRadius:10,border:"none",
              background:saved?"#4EA66D":text.trim()?accent:"rgba(0,0,0,0.05)",
              color:text.trim()||saved?"#FFF":"#C0C0C0",
              cursor:text.trim()?"pointer":"default",
              fontSize:14,fontFamily:T.font,fontWeight:600,
              transition:"all 0.3s ease",
            }}>{saved?"✓ Capturé":"Capturer"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════ APP ═══════ */
export default function MemoireVive() {
  const [items,setItems] = useState(SAMPLE);
  const [courses,setCourses] = useState(SAMPLE_COURSES);
  const [newCourse,setNewCourse] = useState("");
  const [world,setWorld] = useState("faire"); // faire | penser
  const [subNav,setSubNav] = useState("today"); // faire: today|semaine|mois  penser: recent|projets
  const [showCapture,setShowCapture] = useState(null);
  const [search,setSearch] = useState("");
  const [showSearch,setShowSearch] = useState(false);
  const [expandTri,setExpandTri] = useState(false);
  const [expandMain,setExpandMain] = useState(false);
  const [filterProjet,setFilterProjet] = useState("");
  const [showFilter,setShowFilter] = useState(false);
  const [showFabMenu,setShowFabMenu] = useState(false);
  const [recording,setRecording] = useState(false);
  const [classifying,setClassifying] = useState(false);
  const [liveTranscript,setLiveTranscript] = useState("");
  const recognitionRef = useRef(null);
  const searchRef = useRef(null);

  const classifyWithClaude = async (text) => {
    setClassifying(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`Tu es un assistant de tri pour l'app Mémoire vive. L'utilisateur dicte une note vocale. Classe-la.

Projets disponibles : ${PROJETS.join(", ")}
Urgences : urgent, semaine, quand je peux
Durées : 5 min max, 20 min, ~1 heure, 2 heures, Demi-journée, Long terme

Réponds UNIQUEMENT en JSON sans backticks :
{
  "mode": "tache" | "carnet" | "course",
  "text": "texte nettoyé et reformulé si besoin",
  "projet": "nom du projet ou vide",
  "urgence": "urgent | semaine | quand je peux ou vide",
  "duree": "durée estimée ou vide",
  "reference": false,
  "courses": ["item1","item2"] (seulement si mode=course, sépare les items),
  "confidence": "high" | "medium" | "low"
}

Si c'est une liste de courses (acheter X, Y, Z), mets mode=course et remplis courses[].
Si c'est une action à faire, mets mode=tache.
Si c'est une réflexion/idée/référence, mets mode=carnet.
Si c'est une référence (podcast, article, lien, livre), mets reference=true.
Essaie de deviner le projet le plus probable. Si aucun ne colle, laisse vide.`,
          messages:[{role:"user",content:text}],
        }),
      });
      const data = await res.json();
      const raw = data.content?.find(c=>c.type==="text")?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      return parsed;
    } catch(e) {
      console.error("Classification error:",e);
      return null;
    } finally {
      setClassifying(false);
    }
  };

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR) { alert("Reconnaissance vocale non disponible dans ce navigateur"); return; }
    const rec = new SR();
    rec.lang = "fr-FR";
    rec.continuous = true;
    rec.interimResults = true;
    let finalText = "";

    rec.onresult = (e) => {
      let interim = "";
      for(let i=e.resultIndex; i<e.results.length; i++) {
        if(e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      setLiveTranscript((finalText + interim).trim());
    };

    rec.onerror = (e) => {
      console.error("Speech error:",e.error);
      setRecording(false);
      setLiveTranscript("");
    };

    rec.onend = async () => {
      setRecording(false);
      const text = finalText.trim();
      if(!text) { setLiveTranscript(""); return; }
      setLiveTranscript("Classification en cours…");
      const result = await classifyWithClaude(text);
      setLiveTranscript("");
      if(result) {
        if(result.mode==="course" && result.courses?.length) {
          result.courses.forEach(c => setCourses(p=>[...p,{id:Date.now()+Math.random(),text:c,done:false}]));
          setShowCapture(null);
        } else {
          setShowCapture({
            mode:result.mode||"tache",
            prefill:{
              text:result.text||text,
              projet:result.projet||"",
              urgence:result.urgence||"",
              duree:result.duree||"",
              reference:result.reference||false,
            }
          });
        }
      } else {
        setShowCapture({mode:"tache",prefill:{text}});
      }
    };

    recognitionRef.current = rec;
    rec.start();
    setRecording(true);
    setLiveTranscript("");
    setShowFabMenu(false);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
  };

  const accent = T.accent[world];
  const accentBg = T.accentBg[world];

  const toggleDone = id => setItems(p=>p.map(i=>i.id===id?{...i,done:!i.done}:i));
  const addItem = item => setItems(p=>[item,...p]);

  // Faire views
  const todayTasks = useMemo(()=>items.filter(i=>i.mode==="tache"&&isToday(i.time)&&i.projet).sort((a,b)=>{
    const u=["urgent","semaine","quand je peux"];
    return (a.done?1:0)-(b.done?1:0)||u.indexOf(a.urgence)-u.indexOf(b.urgence);
  }),[items]);
  const weekTasks = useMemo(()=>items.filter(i=>i.mode==="tache"&&i.projet&&isThisWeek(i.time)).sort((a,b)=>(a.done?1:0)-(b.done?1:0)||a.time-b.time),[items]);
  const monthTasks = useMemo(()=>items.filter(i=>i.mode==="tache"&&i.projet&&isThisMonth(i.time)).sort((a,b)=>(a.done?1:0)-(b.done?1:0)||a.time-b.time),[items]);
  const triTaches = useMemo(()=>items.filter(i=>i.mode==="tache"&&!i.projet).sort((a,b)=>b.time-a.time),[items]);

  // Penser views
  const recentIdees = useMemo(()=>items.filter(i=>i.mode==="carnet"&&i.projet).sort((a,b)=>b.time-a.time),[items]);
  const triIdees = useMemo(()=>items.filter(i=>i.mode==="carnet"&&!i.projet).sort((a,b)=>b.time-a.time),[items]);

  // Search
  const searchResults = useMemo(()=>{
    if(!search.trim()) return [];
    const q=search.toLowerCase();
    const pool = world==="faire" ? items.filter(i=>i.mode==="tache") : items.filter(i=>i.mode==="carnet");
    return pool.filter(i=>i.text.toLowerCase().includes(q)||(i.projet||"").toLowerCase().includes(q)).sort((a,b)=>b.time-a.time);
  },[items,search,world]);

  useEffect(()=>{if(showSearch&&searchRef.current)searchRef.current.focus();},[showSearch]);

  const switchWorld = w => {
    setWorld(w);
    setSubNav(w==="faire"?"today":"recent");
    setExpandTri(false);
    setExpandMain(false);
    setFilterProjet("");
    setShowFilter(false);
    setShowFabMenu(false);
    setShowSearch(false);
    setSearch("");
  };

  const addCourse = () => {
    if(!newCourse.trim()) return;
    setCourses(p=>[...p,{id:Date.now(),text:newCourse.trim(),done:false}]);
    setNewCourse("");
  };

  const renderTriSection = (triItems, label) => {
    if(triItems.length===0) return null;
    return (
      <Section title="À trier" badge={
        <span style={{fontSize:10,fontFamily:T.font,fontWeight:700,color:"#FFF",
          background:accent,padding:"2px 8px",borderRadius:8,marginLeft:2}}>{triItems.length}</span>
      }>
        <Card>
          {(expandTri?triItems:triItems.slice(0,3)).map(i=>(
            <NoteRow key={i.id} item={i} onToggle={i.mode==="tache"?toggleDone:null}/>
          ))}
          <ExpandBtn total={triItems.length} limit={3} expanded={expandTri} onClick={()=>setExpandTri(true)}/>
        </Card>
      </Section>
    );
  };

  const renderFaire = () => {
    const rawList = subNav==="today"?todayTasks:subNav==="semaine"?weekTasks:monthTasks;
    const list = filterProjet ? rawList.filter(i=>i.projet===filterProjet) : rawList;
    const label = subNav==="today"?"Aujourd'hui":subNav==="semaine"?"Cette semaine":"Ce mois";
    const shown = expandMain?list:list.slice(0,8);

    // Projects present in current raw list
    const activeProjects = [...new Set(rawList.map(i=>i.projet).filter(Boolean))].sort();

    return (
      <>
        {/* Sub-nav */}
        <div style={{display:"flex",gap:2,marginBottom:12,background:"rgba(0,0,0,0.03)",borderRadius:8,padding:2}}>
          {[{id:"today",l:"Aujourd'hui"},{id:"semaine",l:"Semaine"},{id:"mois",l:"Mois"}].map(n=>(
            <button key={n.id} onClick={()=>{setSubNav(n.id);setExpandMain(false);setFilterProjet("");setShowFilter(false);}} style={{
              flex:1,padding:"7px 4px",borderRadius:6,border:"none",cursor:"pointer",
              fontSize:12,fontFamily:T.font,fontWeight:subNav===n.id?600:400,
              background:subNav===n.id?"#FFF":"transparent",
              color:subNav===n.id?T.text:T.textMuted,
              boxShadow:subNav===n.id?"0 1px 3px rgba(0,0,0,0.04)":"none",
              transition:"all 0.2s ease",
            }}>{n.l}</button>
          ))}
        </div>

        {/* Project filter */}
        {activeProjects.length>1 && (
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14,position:"relative"}}>
            <button onClick={()=>setShowFilter(!showFilter)} style={{
              padding:"4px 10px",borderRadius:8,border:"none",cursor:"pointer",
              fontSize:11,fontFamily:T.font,fontWeight:filterProjet?500:400,
              background:filterProjet?`${PC[filterProjet]}18`:"rgba(0,0,0,0.03)",
              color:filterProjet?"#555":T.textMuted,
              display:"flex",alignItems:"center",gap:5,
              transition:"all 0.2s ease",
            }}>
              {filterProjet && <span style={{width:5,height:5,borderRadius:"50%",background:PC[filterProjet]}}/>}
              {filterProjet ? (filterProjet.length>18?filterProjet.slice(0,16)+"…":filterProjet) : "Filtrer"}
              <span style={{fontSize:8,marginLeft:2}}>{showFilter?"▴":"▾"}</span>
            </button>
            {showFilter && (
              <div style={{
                position:"absolute",top:"calc(100% + 4px)",right:0,background:"#FFF",
                borderRadius:10,boxShadow:"0 8px 32px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.04)",
                padding:4,zIndex:200,minWidth:180,maxHeight:280,overflowY:"auto",
              }}>
                <button onClick={()=>{setFilterProjet("");setShowFilter(false);setExpandMain(false);}} style={{
                  display:"flex",alignItems:"center",gap:8,width:"100%",
                  padding:"8px 10px",border:"none",borderRadius:6,
                  background:!filterProjet?"rgba(0,0,0,0.04)":"transparent",
                  cursor:"pointer",fontSize:12,fontFamily:T.font,color:"#444",textAlign:"left",
                }}>Tout</button>
                {activeProjects.map(p=>(
                  <button key={p} onClick={()=>{setFilterProjet(p);setShowFilter(false);setExpandMain(false);}} style={{
                    display:"flex",alignItems:"center",gap:8,width:"100%",
                    padding:"8px 10px",border:"none",borderRadius:6,
                    background:filterProjet===p?"rgba(0,0,0,0.04)":"transparent",
                    cursor:"pointer",fontSize:12,fontFamily:T.font,color:"#444",textAlign:"left",
                  }}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:PC[p],flexShrink:0}}/>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tasks */}
        <Section title={label} count={list.filter(t=>!t.done).length}>
          <Card>
            {list.length===0 ? (
              <p style={{padding:20,textAlign:"center",color:T.textFaint,fontSize:13,fontFamily:T.font,fontStyle:"italic"}}>
                {subNav==="today"?"Rien pour aujourd'hui.":"Rien ici."}
              </p>
            ) : shown.map(i=><NoteRow key={i.id} item={i} onToggle={toggleDone}/>)}
            <ExpandBtn total={list.length} limit={8} expanded={expandMain} onClick={()=>setExpandMain(true)}/>
          </Card>
        </Section>

        {/* À trier */}
        {renderTriSection(triTaches)}

        {/* Courses */}
        {subNav==="today" && (
          <Section title="Courses" count={courses.filter(c=>!c.done).length}>
            <Card style={{padding:"4px 0"}}>
              {courses.map(c=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",cursor:"pointer"}}
                  onClick={()=>setCourses(p=>p.map(x=>x.id===c.id?{...x,done:!x.done}:x))}>
                  <div style={{
                    width:16,height:16,borderRadius:4,flexShrink:0,
                    border:c.done?"none":"1.5px solid #CDCDCD",
                    background:c.done?"#4EA66D":"transparent",
                    display:"flex",alignItems:"center",justifyContent:"center",
                  }}>{c.done&&<span style={{color:"#FFF",fontSize:9,fontWeight:700}}>✓</span>}</div>
                  <span style={{fontSize:13,fontFamily:T.font,color:c.done?"#CCC":"#444",
                    textDecoration:c.done?"line-through":"none"}}>{c.text}</span>
                </div>
              ))}
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px 10px",
                borderTop:`1px solid ${T.border}`,marginTop:2}}>
                <span style={{color:T.textFaint,fontSize:16,fontWeight:300}}>+</span>
                <input value={newCourse} onChange={e=>setNewCourse(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")addCourse();}}
                  placeholder="Ajouter…"
                  style={{flex:1,border:"none",outline:"none",background:"transparent",
                    fontSize:13,fontFamily:T.font,color:"#444"}}/>
              </div>
            </Card>
          </Section>
        )}
      </>
    );
  };

  const renderPenser = () => {
    const filtered = filterProjet ? recentIdees.filter(i=>i.projet===filterProjet) : recentIdees;
    const shown = expandMain ? filtered : filtered.slice(0,8);
    const activeProjects = [...new Set(recentIdees.map(i=>i.projet).filter(Boolean))].sort();

    return (
      <>
        {/* Project filter */}
        {activeProjects.length>1 && (
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14,position:"relative"}}>
            <button onClick={()=>setShowFilter(!showFilter)} style={{
              padding:"4px 10px",borderRadius:8,border:"none",cursor:"pointer",
              fontSize:11,fontFamily:T.font,fontWeight:filterProjet?500:400,
              background:filterProjet?`${PC[filterProjet]}18`:"rgba(0,0,0,0.03)",
              color:filterProjet?"#555":T.textMuted,
              display:"flex",alignItems:"center",gap:5,
              transition:"all 0.2s ease",
            }}>
              {filterProjet && <span style={{width:5,height:5,borderRadius:"50%",background:PC[filterProjet]}}/>}
              {filterProjet ? (filterProjet.length>18?filterProjet.slice(0,16)+"…":filterProjet) : "Filtrer"}
              <span style={{fontSize:8,marginLeft:2}}>{showFilter?"▴":"▾"}</span>
            </button>
            {showFilter && (
              <div style={{
                position:"absolute",top:"calc(100% + 4px)",right:0,background:"#FFF",
                borderRadius:10,boxShadow:"0 8px 32px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.04)",
                padding:4,zIndex:200,minWidth:180,maxHeight:280,overflowY:"auto",
              }}>
                <button onClick={()=>{setFilterProjet("");setShowFilter(false);setExpandMain(false);}} style={{
                  display:"flex",alignItems:"center",gap:8,width:"100%",
                  padding:"8px 10px",border:"none",borderRadius:6,
                  background:!filterProjet?"rgba(0,0,0,0.04)":"transparent",
                  cursor:"pointer",fontSize:12,fontFamily:T.font,color:"#444",textAlign:"left",
                }}>Tout</button>
                {activeProjects.map(p=>(
                  <button key={p} onClick={()=>{setFilterProjet(p);setShowFilter(false);setExpandMain(false);}} style={{
                    display:"flex",alignItems:"center",gap:8,width:"100%",
                    padding:"8px 10px",border:"none",borderRadius:6,
                    background:filterProjet===p?"rgba(0,0,0,0.04)":"transparent",
                    cursor:"pointer",fontSize:12,fontFamily:T.font,color:"#444",textAlign:"left",
                  }}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:PC[p],flexShrink:0}}/>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dernières réflexions */}
        <Section title="Dernières réflexions" count={filtered.length}>
          <Card>
            {filtered.length===0 ? (
              <p style={{padding:20,textAlign:"center",color:T.textFaint,fontSize:13,fontFamily:T.font,fontStyle:"italic"}}>
                {filterProjet?"Rien dans ce projet.":"Rien encore."}
              </p>
            ) : shown.map(i=><NoteRow key={i.id} item={i}/>)}
            <ExpandBtn total={filtered.length} limit={8} expanded={expandMain} onClick={()=>setExpandMain(true)}/>
          </Card>
        </Section>

        {/* À trier */}
        {renderTriSection(triIdees)}
      </>
    );
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes recPulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(217,79,59,0.4)}50%{transform:scale(1.05);box-shadow:0 0 0 16px rgba(217,79,59,0)}}
        *{-webkit-tap-highlight-color:transparent}
        input::placeholder,textarea::placeholder{color:#B0B0B0!important}
        .mv-filter-scroll::-webkit-scrollbar{display:none}
      `}</style>

      {/* ─── HEADER ─── */}
      <div style={{width:"100%",maxWidth:480,padding:"18px 20px 0",boxSizing:"border-box"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div>
            <h1 style={{fontSize:19,fontWeight:700,color:T.text,margin:0,letterSpacing:"-0.03em"}}>Mémoire vive</h1>
            <p style={{fontSize:10,color:T.textFaint,margin:"1px 0 0",fontStyle:"italic",letterSpacing:"0.03em"}}>le pense-pas-bête</p>
          </div>
          <button onClick={()=>{setShowSearch(!showSearch);setSearch("");}} style={{
            width:32,height:32,borderRadius:"50%",border:"none",
            background:showSearch?"rgba(0,0,0,0.08)":"rgba(0,0,0,0.04)",
            cursor:"pointer",fontSize:14,color:"#888",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>⌕</button>
        </div>

        {/* World toggle */}
        <div style={{
          display:"flex",marginBottom:12,
          background:"rgba(0,0,0,0.04)",borderRadius:12,padding:3,
        }}>
          {["faire","penser"].map(w=>(
            <button key={w} onClick={()=>switchWorld(w)} style={{
              flex:1,padding:"10px 4px",borderRadius:10,border:"none",cursor:"pointer",
              fontSize:14,fontFamily:T.font,fontWeight:world===w?700:400,
              letterSpacing:world===w?"-0.01em":"0",
              background:world===w?T.card:"transparent",
              color:world===w?T.accent[w]:T.textMuted,
              boxShadow:world===w?"0 2px 8px rgba(0,0,0,0.05)":"none",
              transition:"all 0.3s cubic-bezier(0.22,1,0.36,1)",
            }}>{w==="faire"?"Faire":"Penser"}</button>
          ))}
        </div>

        {/* Search */}
        {showSearch && (
          <div style={{marginBottom:14,animation:"fadeIn 0.2s ease"}}>
            <input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Rechercher…"
              style={{
                width:"100%",padding:"10px 14px",borderRadius:10,
                border:"1.5px solid rgba(0,0,0,0.08)",background:"#FFF",
                fontSize:14,fontFamily:T.font,color:T.text,
                outline:"none",boxSizing:"border-box",
              }}
              onFocus={e=>e.target.style.borderColor="rgba(0,0,0,0.15)"}
              onBlur={e=>e.target.style.borderColor="rgba(0,0,0,0.08)"}/>
            {search.trim() && (
              <Card style={{marginTop:8}}>
                {searchResults.length===0 ? (
                  <p style={{padding:16,textAlign:"center",color:T.textFaint,fontSize:13,fontStyle:"italic"}}>Rien trouvé.</p>
                ) : searchResults.slice(0,10).map(i=>(
                  <NoteRow key={i.id} item={i} onToggle={i.mode==="tache"?toggleDone:null}/>
                ))}
              </Card>
            )}
          </div>
        )}
      </div>

      {/* ─── CONTENT ─── */}
      <div style={{width:"100%",maxWidth:480,padding:"0 20px 100px",boxSizing:"border-box"}}>
        {world==="faire" && renderFaire()}
        {world==="penser" && renderPenser()}
      </div>

      {/* ─── Recording overlay ─── */}
      {(recording || classifying) && (
        <div style={{
          position:"fixed",inset:0,zIndex:200,
          background:"rgba(30,30,28,0.5)",backdropFilter:"blur(6px)",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          gap:20,padding:40,
        }} onClick={recording ? stopRecording : undefined}>
          <div style={{
            width:80,height:80,borderRadius:"50%",
            background:recording?"#D94F3B":"#555",
            display:"flex",alignItems:"center",justifyContent:"center",
            animation:recording?"recPulse 1.5s ease infinite":"none",
            cursor:recording?"pointer":"default",
          }}>
            <span style={{fontSize:28,color:"#FFF"}}>{recording?"🎙":"⏳"}</span>
          </div>
          <p style={{
            fontSize:15,fontFamily:T.font,fontWeight:500,color:"#FFF",
            textAlign:"center",maxWidth:360,lineHeight:1.5,
          }}>
            {classifying ? "Classification en cours…" : liveTranscript || "Parle…"}
          </p>
          {recording && (
            <p style={{fontSize:12,fontFamily:T.font,color:"rgba(255,255,255,0.5)",marginTop:-10}}>
              Appuie n'importe où pour arrêter
            </p>
          )}
        </div>
      )}

      {/* ─── FAB overlay ─── */}
      {showFabMenu && (
        <div style={{position:"fixed",inset:0,zIndex:99}} onClick={()=>setShowFabMenu(false)}/>
      )}

      {/* ─── FAB ─── */}
      <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",zIndex:100,
        display:"flex",alignItems:"center",gap:10}}>
        {/* Popup menu */}
        {showFabMenu && (
            <div style={{
              position:"absolute",bottom:"calc(100% + 10px)",left:"50%",transform:"translateX(-50%)",
              background:"#FFF",borderRadius:14,padding:5,
              boxShadow:"0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)",
              display:"flex",flexDirection:"column",gap:2,minWidth:140,
              animation:"fabMenuIn 0.15s ease",
            }}>
              <style>{`@keyframes fabMenuIn{from{opacity:0;transform:translateX(-50%) translateY(6px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
              {[
                {id:"tache",label:"Tâche",color:T.accent.faire},
                {id:"carnet",label:"Idée",color:T.accent.penser},
                {id:"course",label:"Courses",color:"#4EA66D"},
              ].map(opt=>(
                <button key={opt.id} onClick={()=>{setShowFabMenu(false);setShowCapture({mode:opt.id});}} style={{
                  padding:"10px 16px",borderRadius:10,border:"none",cursor:"pointer",
                  fontSize:13,fontFamily:T.font,fontWeight:500,color:opt.color,
                  background:"transparent",textAlign:"left",
                  transition:"background 0.15s ease",
                }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,0.04)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  {opt.label}
                </button>
              ))}
            </div>
        )}
        <button onClick={()=>setShowFabMenu(!showFabMenu)} style={{
          padding:"12px 28px",borderRadius:14,border:"none",
          background:showFabMenu?"#444":"#555",color:"#FFF",cursor:"pointer",
          fontSize:14,fontFamily:T.font,fontWeight:600,
          boxShadow:"0 4px 18px rgba(0,0,0,0.25)",
          transition:"all 0.2s ease",letterSpacing:"0.01em",
        }}>
          + Capturer
        </button>
        <button onClick={startRecording} style={{
          width:48,height:48,borderRadius:"50%",border:"none",
          background:"#D94F3B",color:"#FFF",cursor:"pointer",
          fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 4px 14px rgba(217,79,59,0.35)",
          transition:"all 0.2s ease",
        }}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
          🎙
        </button>
      </div>

      {/* ─── MODAL ─── */}
      {showCapture && (
        <CaptureModal
          mode={showCapture.mode}
          projet={showCapture.projet}
          prefill={showCapture.prefill}
          world={world}
          onClose={()=>setShowCapture(null)}
          onSave={addItem}
          onSaveCourse={c=>setCourses(p=>[...p,c])}
        />
      )}
    </div>
  );
}
