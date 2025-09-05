import { useEffect, useMemo, useRef, useState } from "react";

/**
 * STEP 12 — Tags + Global Search + Import/Export All Sessions
 * - Session tagging: add/remove tags per session (persisted)
 * - Global search across sessions: search questions & advice text; optional tag filter
 * - Import/Export ALL sessions as JSON (Merge or Replace)
 *
 * Single-file App.jsx for Vite React (Replit). No external deps.
 */

/* ---------- Theme (Palette E: Cozy Friend) ---------- */
const THEME = {
  cream:"#FAF7F2", beige:"#F5E6D3", taupe:"#D1BFA3",
  sage:"#A8BCA1", olive:"#8A9A5B", terracotta:"#D97B66",
  coral:"#F6A192", ochre:"#E3A857", charcoal:"#4A4A48",
  warmTaupe:"#5A4E4A", border:"#E9E1D6",
};
const TOKENS = {
  radius:"16px",
  shadowSoft:"0 6px 18px rgba(0,0,0,.06)",
  shadowInset:"inset 0 1px 0 rgba(0,0,0,.04), inset 0 -1px 0 rgba(0,0,0,.03)",
};

/* ---------- Personas ---------- */
const PERSONAS = [
  { key:"balanced",  name:"Balanced",       color:"var(--border)" },
  { key:"parenting", name:"Parenting Pal",  color:"var(--sage)" },
  { key:"money",     name:"Money Mentor",   color:"var(--olive)" },
  { key:"time",      name:"Time Coach",     color:"var(--taupe)" },
];

/* ---------- Prompt mixes (tone-aware) ---------- */
const PROMPT_MIXES = {
  balanced: ({tone}) => ({ persona:"balanced", tone }),
  parenting:({tone}) => ({ persona:"parenting", tone }),
  money:    ({tone}) => ({ persona:"money", tone }),
  time:     ({tone}) => ({ persona:"time", tone }),
};

/* ---------- Sample advice (object lines) ---------- */
const s = (text, cites=[]) => ({ text, cites });
const SAMPLES = {
  save200: {
    prompt:"How can I save $200 this month?",
    practical:[ s("Cancel one subscription ($15–20/mo)."), s("Cook at home 3 nights/week."), s("Auto-transfer $50 every Friday.") ],
    magical:[ s("Run a “$200 challenge”: sell 5 unused items."), s("Try a no-spend weekend."), s("Gamify: $1 in a jar when you skip a splurge.") ],
    balanced:[ s("Cancel a subscription + set weekly $50 transfer."), s("List 3 items online to sell."), s("Try one no-spend weekend.") ],
  },
  birthday: {
    prompt:"What should I do for my partner’s birthday?",
    practical:[ s("Book a favorite restaurant."), s("Thoughtful gift ($50–$100)."), s("Write 3 reasons you appreciate them.") ],
    magical:[ s("Plan a mystery date with playful clues."), s("Curate a playlist from your story."), s("Make an “adventure jar” of surprises.") ],
    balanced:[ s("Dinner + mystery envelope."), s("Gift: framed memory + adventure jar.") ],
  },
  toddlerSleep: {
    prompt:"How do I get my toddler to sleep earlier?",
    practical:[ s("Set a fixed bedtime (e.g., 8pm)."), s("No screens 1 hour before bed."), s("Read one calming story; repeat consistently.") ],
    magical:[ s("Create a “dream passport” sticker chart."), s("A friendly “bedtime fairy” reward."), s("Cozy forest-at-night soundscape.") ],
    balanced:[ s("Routine: bath, story, lights out."), s("Dream passport + small weekly reward.") ],
  },
};

/* ---------- Guardrails ---------- */
const MAX_LEN = 800;
const SENSITIVE_RE = /(diagnose|prescription|legal advice|lawsuit|suicide|self-harm|investment|stock tip|therapy)/i;
function applyGuardrails(q){
  let note=null, guard=null, qq=q;
  if(qq.length>MAX_LEN){ qq = qq.slice(0, MAX_LEN) + "…"; note = "Trimmed for clarity (question was very long)."; }
  if(SENSITIVE_RE.test(qq)){ guard = "Note: This is general information, not a substitute for professional advice."; }
  return { q: qq, note, guard };
}

/* ---------- Evaluator ---------- */
function scoreList(lines=[]){
  const verbs=/(set|cancel|list|cook|write|try|plan|create|make|book|auto|move|start|stop|reduce|add|sell|save|read)/i;
  let score=0, acts=0, nums=0, uniq=new Set();
  lines.forEach(l=>{
    const t=(typeof l==="string")? l : (l?.text||"");
    if(verbs.test(t)){ acts++; score+=2; }
    if(/\d/.test(t)){ nums++; score+=1; }
    t.split(/\W+/).forEach(w=>w&&uniq.add(w.toLowerCase()));
  });
  score += Math.min(uniq.size/50, 3);
  return { score:Math.round(score*10)/10, acts, nums, uniq:uniq.size };
}

/* ---------- Backend settings ---------- */
const K_BACKEND = "sg_backend";
const DEFAULT_BACKEND = { apiUrl:"", apiKey:"", model:"best-friend-advisor-v1", mode:"auto" }; // auto|json|sse

/* ---------- Sessions ---------- */
const K_THREADS = "sg_threads";
const K_ACTIVE  = "sg_active_thread";
function uid(){ return crypto.randomUUID(); }
function expertLabel(key){ if(key==="parenting")return"Parenting Pal"; if(key==="money")return"Money Mentor"; if(key==="time")return"Time Coach"; return"Balanced"; }
function downloadFile(filename, content, type="application/json"){ const blob=new Blob([content],{type}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url); }

/* ---------- App ---------- */
export default function App(){
  useEffect(()=>{
    Object.entries(THEME).forEach(([k,v])=> document.documentElement.style.setProperty(`--${k}`, v));
    Object.entries(TOKENS).forEach(([k,v])=> document.documentElement.style.setProperty(`--${k.replace(/[A-Z]/g,m=>`-${m.toLowerCase()}`)}`, v));
  },[]);

  // Sessions
  const [threads, setThreads] = useState(()=> safeParse(localStorage.getItem(K_THREADS), []));
  const [activeId, setActiveId] = useState(()=> localStorage.getItem(K_ACTIVE) || "");
  useEffect(()=> localStorage.setItem(K_THREADS, JSON.stringify(threads)), [threads]);
  useEffect(()=> localStorage.setItem(K_ACTIVE, activeId), [activeId]);
  const activeThread = useMemo(()=> threads.find(t=>t.id===activeId) || null, [threads, activeId]);

  function newThread(name="New Session"){
    const t={ id:uid(), name, createdAt:new Date().toISOString(), tags:[], privacy:{ persistEntries:true, shareable:true }, entries:[] };
    setThreads(prev=> [t, ...prev]); setActiveId(t.id);
  }
  function renameThread(id){
    const name = prompt("Rename session:", threads.find(t=>t.id===id)?.name || "");
    if(!name) return; setThreads(prev=> prev.map(t=> t.id===id? {...t, name} : t));
  }
  function deleteThread(id){
    if(!confirm("Delete this session?")) return;
    setThreads(prev=> prev.filter(t=>t.id!==id)); if(activeId===id){ const rest=threads.filter(t=>t.id!==id); setActiveId(rest[0]?.id || ""); }
  }

  // Tagging
  function addTag(){
    if(!activeThread) return;
    const tag = (prompt("Add tag:")||"").trim();
    if(!tag) return;
    if(activeThread.tags?.includes(tag)) return;
    setThreads(prev=> prev.map(t=> t.id===activeThread.id? {...t, tags:[...(t.tags||[]), tag]} : t));
  }
  function removeTag(tag){
    if(!activeThread) return;
    setThreads(prev=> prev.map(t=> t.id===activeThread.id? {...t, tags:(t.tags||[]).filter(x=>x!==tag)} : t));
  }

  function togglePrivacy(key){
    if(!activeThread) return;
    setThreads(prev=> prev.map(t=> t.id===activeThread.id? {...t, privacy:{...t.privacy, [key]:!t.privacy[key]}} : t));
  }

  // Backend settings modal
  const [showBackend, setShowBackend] = useState(false);
  const [backend, setBackend] = useState(()=> safeParse(localStorage.getItem(K_BACKEND), DEFAULT_BACKEND));
  useEffect(()=> localStorage.setItem(K_BACKEND, JSON.stringify(backend)), [backend]);

  // Search modal
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchTag, setSearchTag] = useState("");
  const searchResults = useMemo(()=>{
    const q = searchQ.trim().toLowerCase();
    const tag = searchTag.trim().toLowerCase();
    if(!q && !tag) return [];
    const out = [];
    threads.forEach(t=>{
      const hasTag = tag ? (t.tags||[]).map(x=>x.toLowerCase()).includes(tag) : true;
      if(!hasTag) return;
      (t.entries||[]).forEach(e=>{
        const hitQ = q ? (e.q||"").toLowerCase().includes(q) : true;
        const hitA = q ? ["practical","balanced","magical"].some(k=> (e.advice?.[k]||[]).some(o=> ((typeof o==="string"? o : o.text)||"").toLowerCase().includes(q))) : true;
        if(hitQ || hitA){
          out.push({ threadId:t.id, threadName:t.name, when:e.at, q:e.q, expert:e.expert, mode:e.mode });
        }
      });
    });
    return out.slice(0, 200);
  }, [threads, searchQ, searchTag]);

  function jumpToThread(id){
    setActiveId(id);
    setShowSearch(false);
  }

  // Ask state
  const [question, setQuestion] = useState("");
  const [sampleKey, setSampleKey] = useState("");
  const [expert, setExpert] = useState("balanced");
  const [mode, setMode] = useState(1); // 0,1,2
  const [compare, setCompare] = useState(true);
  const [loading, setLoading] = useState(false);
  const [guardNote, setGuardNote] = useState(null);
  const [guardDisclaimer, setGuardDisclaimer] = useState(null);

  const latest = activeThread?.entries?.[0] || null;
  const cards = latest?.advice || null;
  const cardsToShow = useMemo(()=>{
    if(!cards) return [];
    const all=[ {key:"practical",label:"Practical",list:cards.practical},
                {key:"balanced", label:"Balanced", list:cards.balanced},
                {key:"magical",  label:"Magical",  list:cards.magical} ];
    return latest.compare ? all : [ all[latest.mode===0?0:latest.mode===1?1:2] ];
  }, [latest, cards]);

  // Local backend fallback (demo)
  function localAdvise({ question, expert, mix }){
    const q=(question||"").toLowerCase();
    let sample=SAMPLES.save200; if(q.includes("birthday")) sample=SAMPLES.birthday; if(q.includes("sleep")||q.includes("toddler")) sample=SAMPLES.toddlerSleep;
    const base={ prompt: sample.prompt, practical:[...sample.practical], balanced:[...sample.balanced], magical:[...sample.magical] };
    if(expert && expert!=="balanced"){
      const tag = mix?.persona ? `(${mix.persona} · ${mix?.tone||"balanced"})` : `(${expertLabel(expert)} perspective)`;
      ["practical","balanced","magical"].forEach(k=> base[k].unshift(s(tag)));
    }
    return base;
  }

  async function onAsk(){
    const baseQ = question || (sampleKey && SAMPLES[sampleKey]?.prompt) || "";
    if(!baseQ) return;

    // auto-create session
    if(!activeThread){ newThread("Session 1"); return; } // ask again after creation

    const { q, note, guard } = applyGuardrails(baseQ);
    setGuardNote(note); setGuardDisclaimer(guard);
    const tone = mode===0? "practical" : mode===2? "magical" : "balanced";
    const mixFn = PROMPT_MIXES[expert] || PROMPT_MIXES["balanced"];
    const mix = mixFn({ tone });

    setLoading(true);
    try{
      // If no backend configured, use local
      const advice = localAdvise({ question:q, expert, mix });
      const entry = { id:uid(), at:new Date().toISOString(), q, expert, mode, compare, advice, guardNote:note, guardDisclaimer:guard };
      setThreads(prev=> prev.map(t=> {
        if(t.id!==activeThread.id) return t;
        if(t.privacy?.persistEntries===false) return {...t}; // ephemeral
        return {...t, entries:[entry, ...(t.entries||[])]};
      }));
    }finally{
      setLoading(false);
    }
  }

  // Export/Import ALL sessions JSON
  function exportAllJSON(){
    const payload = { threads, exportedAt:new Date().toISOString(), version:"step12" };
    downloadFile("symbiogo-all-sessions.json", JSON.stringify(payload, null, 2));
  }
  function onImportAll(ev){
    const file = ev.target.files?.[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const data = JSON.parse(reader.result || "{}");
        if(!Array.isArray(data.threads)){ alert("Invalid file."); return; }
        const action = prompt("Type MERGE to merge, or REPLACE to overwrite existing sessions.", "MERGE");
        if(String(action||"").toUpperCase()==="REPLACE"){
          setThreads(data.threads); setActiveId(data.threads[0]?.id || "");
        }else{
          // Merge by id; keep existing if id collision
          const map = new Map(threads.map(t=> [t.id, t]));
          data.threads.forEach(t=> { if(!map.has(t.id)) map.set(t.id, t); });
          const merged = Array.from(map.values()).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
          setThreads(merged);
        }
        alert("Import complete.");
      }catch(e){ alert("Import failed."); }
      ev.target.value = "";
    };
    reader.readAsText(file);
  }

  // One‑pager (simple printable) for latest
  function openOnePager(){
    if(!latest){ alert("No advice yet."); return; }
    const html = renderOnePagerHTML(latest, activeThread?.name || "Session");
    const blob = new Blob([html], {type:"text/html"});
    const url = URL.createObjectURL(blob);
    const wnd = window.open(url, "_blank");
    if(!wnd){ downloadFile("symbiogo-onepager.html", html, "text/html"); }
    setTimeout(()=> URL.revokeObjectURL(url), 120000);
  }

  // Derived
  const practicalScore = cards ? scoreList(cards.practical) : {score:0};
  const magicalScore   = cards ? scoreList(cards.magical)   : {score:0};

  return (
    <>
      <GlobalStyles />
      {/* Header */}
      <header className="appbar">
        <div className="appbar__inner">
          <div className="brand">
            <div className="brand__wordmark">SymbioGo</div>
            <div className="brand__tagline">Friendly advice that knows you</div>
          </div>

          <div className="row" role="group" aria-label="Session & actions">
            <select className="btn btn--ghost btn--pill" value={activeId} onChange={e=>setActiveId(e.target.value)} aria-label="Switch session">
              <option value="">(no session)</option>
              {threads.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button className="btn btn--ghost btn--pill" onClick={()=>newThread("New Session")}>New</button>
            {activeId && <button className="btn btn--ghost btn--pill" onClick={()=>renameThread(activeId)}>Rename</button>}
            {activeId && <button className="btn btn--ghost btn--pill" onClick={()=>deleteThread(activeId)}>Delete</button>}

            <button className="btn btn--ghost btn--pill" onClick={()=>setShowSearch(true)}>Search</button>
            <button className="btn btn--ghost btn--pill" onClick={exportAllJSON}>Export All</button>
            <label className="btn btn--ghost btn--pill" style={{cursor:"pointer"}}>
              Import
              <input type="file" accept="application/json" onChange={onImportAll} style={{display:"none"}} />
            </label>
            <button className="btn btn--ghost btn--pill" onClick={openOnePager}>Print One‑Pager</button>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Left: ask panel */}
        <section className="panel">
          <div className="panel__header" style={{ color:"var(--charcoal)" }}>
            New Question
            {activeThread && (
              <span className="tag" style={{marginLeft:8}}>
                {activeThread.tags?.length ? activeThread.tags.map(t=><span key={t} style={{marginRight:6}}>#{t}</span>) : <em className="muted">no-tags</em>}
              </span>
            )}
          </div>
          <div className="panel__body">
            <div className="field">
              <label className="label" htmlFor="q">Ask anything</label>
              <textarea id="q" className="askbox"
                value={question}
                onChange={e=>setQuestion(e.target.value)}
                placeholder="What's on your mind today? (e.g., How can I save $200 this month?)"
              />
              <div className="ask__actions">
                <select className="btn btn--ghost btn--pill" value={sampleKey} onChange={e=>setSampleKey(e.target.value)}>
                  <option value="">Load a sample…</option>
                  <option value="save200">How can I save $200 this month?</option>
                  <option value="birthday">What should I do for my partner’s birthday?</option>
                  <option value="toddlerSleep">How do I get my toddler to sleep earlier?</option>
                </select>
                <button className="btn btn--primary btn--pill" onClick={onAsk} disabled={loading}>
                  {loading? "Thinking…" : "Get Advice"}
                </button>
              </div>
              {guardNote && <div className="muted" style={{marginTop:8}}>⚠️ {guardNote}</div>}
              {guardDisclaimer && <div className="muted" style={{marginTop:6}}>🛡️ {guardDisclaimer}</div>}
            </div>

            {activeThread && (
              <div className="field">
                <div className="label">Session tags</div>
                <div className="chips">
                  {(activeThread.tags||[]).map(tag=> (
                    <button key={tag} className="chip" onClick={()=>removeTag(tag)} title="Remove tag">#{tag} ✕</button>
                  ))}
                  <button className="chip" onClick={addTag}>+ add tag</button>
                </div>
                <div className="row" style={{marginTop:8}}>
                  <span className="label" style={{alignSelf:"center"}}>Persist</span>
                  <button className="btn btn--ghost btn--pill" onClick={()=>togglePrivacy("persistEntries")} aria-pressed={activeThread.privacy?.persistEntries!==false}>
                    {activeThread.privacy?.persistEntries===false ? "Off" : "On"}
                  </button>
                  <span className="label" style={{alignSelf:"center"}}>Shareable</span>
                  <button className="btn btn--ghost btn--pill" onClick={()=>togglePrivacy("shareable")} aria-pressed={activeThread.privacy?.shareable!==false}>
                    {activeThread.privacy?.shareable===false ? "No" : "Yes"}
                  </button>
                </div>
              </div>
            )}

            <div className="field">
              <div className="label">Choose an expert</div>
              <div className="chips">
                {PERSONAS.map(p=> (
                  <button key={p.key} className="chip" data-active={expert===p.key} onClick={()=>setExpert(p.key)}>
                    <span style={{display:"inline-block",width:10,height:10,borderRadius:20,background:p.color}}></span>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="field slider">
              <div className="label">Perspective</div>
              <div className="slider__track">
                <input type="range" min="0" max="2" step="1" value={mode} onChange={(e)=>setMode(+e.target.value)} />
              </div>
              <div className="slider__labels">
                <span data-active={mode===0}>Practical</span>
                <span data-active={mode===1}>Balanced</span>
                <span data-active={mode===2}>Magical</span>
              </div>

              <div className="row" style={{marginTop:10}}>
                <span className="label" style={{alignSelf:"center"}}>Compare</span>
                <button className="btn btn--ghost btn--pill" onClick={()=>setCompare(v=>!v)} aria-pressed={compare}>
                  {compare? "On" : "Off"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right: responses */}
        <section className="panel">
          <div className="panel__header" style={{ color:"var(--charcoal)" }}>
            Advice & Ideas {latest && <span className="tag" style={{marginLeft:8}}>{expertLabel(latest.expert)}</span>}
          </div>
          <div className="panel__body">
            {cards && (
              <div className="muted" style={{marginBottom:8}}>
                Evaluator: Practical {scoreList(cards.practical).score} vs Magical {scoreList(cards.magical).score}
              </div>
            )}
            {!cards && <div className="muted">Ask something to see advice.</div>}

            {cardsToShow.map(card => (
              <article className="card" key={card.key}>
                <div className="card__head"><span className="tag">{card.label}</span></div>
                <div className="card__body">
                  {card.list.map((o,i)=> <div key={i}>• {typeof o==="string"? o : o.text}</div>)}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Search Modal */}
      {showSearch && (
        <div role="dialog" aria-modal="true" style={modalStyle}>
          <div style={modalCardStyle}>
            <h3 style={{marginTop:0}}>Search Sessions</h3>
            <div className="field">
              <label className="label">Query</label>
              <input className="askbox" style={{minHeight:40}} value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search questions and answers..."/>
            </div>
            <div className="field">
              <label className="label">Tag (optional)</label>
              <input className="askbox" style={{minHeight:40}} value={searchTag} onChange={e=>setSearchTag(e.target.value)} placeholder="e.g., budgeting"/>
            </div>
            <div className="row"><button className="btn btn--ghost btn--pill" onClick={()=>{setSearchQ("");setSearchTag("");}}>Clear</button><button className="btn btn--primary btn--pill" onClick={()=>setShowSearch(false)}>Close</button></div>
            <div style={{marginTop:12,maxHeight:"40vh",overflow:"auto"}}>
              {searchResults.length===0? <div className="muted">No results.</div> :
                searchResults.map((r,i)=> (
                  <div key={i} className="vault__item" style={{marginBottom:8}}>
                    <div>
                      <div><b>{r.threadName}</b> — {new Date(r.when).toLocaleString()}</div>
                      <div className="muted" style={{maxWidth:520,whiteSpace:"nowrap",textOverflow:"ellipsis",overflow:"hidden"}}>Q: {r.q}</div>
                    </div>
                    <button className="btn btn--ghost btn--pill" onClick={()=>jumpToThread(r.threadId)}>Open</button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Backend Modal */}
      {showBackend && (
        <div role="dialog" aria-modal="true" style={modalStyle}>
          <div style={modalCardStyle}>
            <h3 style={{marginTop:0}}>Backend Settings</h3>
            <div className="field">
              <label className="label">Mode</label>
              <div className="row">
                {["auto","json","sse"].map(m=> (
                  <button key={m} className="btn btn--ghost btn--pill" aria-pressed={backend.mode===m} onClick={()=>setBackend(b=>({...b, mode:m}))}>
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="label">API URL</label>
              <input className="askbox" style={{minHeight:40}} value={backend.apiUrl} onChange={e=>setBackend(b=>({...b, apiUrl:e.target.value}))} placeholder="https://your-api.example.com/advise"/>
            </div>
            <div className="field">
              <label className="label">API Key</label>
              <input className="askbox" style={{minHeight:40}} value={backend.apiKey} onChange={e=>setBackend(b=>({...b, apiKey:e.target.value}))} placeholder="sk-..."/>
            </div>
            <div className="field">
              <label className="label">Model</label>
              <input className="askbox" style={{minHeight:40}} value={backend.model} onChange={e=>setBackend(b=>({...b, model:e.target.value}))}/>
            </div>

            <div className="row" style={{marginTop:10}}>
              <button className="btn btn--ghost btn--pill" onClick={()=>setShowBackend(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Printable One‑Pager Renderer ---------- */
function renderOnePagerHTML(entry, threadName){
  const css = `
    body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:24px;color:#333}
    h1{margin:0 0 6px}
    h2{margin:16px 0 8px}
    .meta{color:#666;font-size:12px;margin-bottom:16px}
    .card{border:1px solid #e2e2e2;border-radius:12px;padding:12px 14px;margin-bottom:10px}
    @media print {.noprint{display:none}}
  `;
  const section = (title, list)=> `
    <div class="card">
      <h3>${title}</h3>
      <ul>${(list||[]).map(o=> `<li>${typeof o==="string"? o : (o.text||"")}</li>`).join("")}</ul>
    </div>
  `;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>One‑Pager</title><style>${css}</style></head>
  <body>
    <h1>Advice One‑Pager</h1>
    <div class="meta">${threadName} · ${new Date(entry.at).toLocaleString()}</div>
    <h2>Question</h2>
    <div class="card">${entry.q}</div>
    ${section("Practical", entry.advice.practical)}
    ${section("Balanced",  entry.advice.balanced)}
    ${section("Magical",   entry.advice.magical)}
    ${entry.guardDisclaimer? `<div class="card" style="background:#FFF7E6"><b>Note:</b> ${entry.guardDisclaimer}</div>` : ""}
    <div class="noprint" style="margin-top:14px"><button onclick="window.print()">Print</button></div>
  </body></html>`;
  return html;
}

/* ---------- Styles ---------- */
const modalStyle = {
  position:"fixed", inset:0, background:"rgba(0,0,0,.2)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999
};
const modalCardStyle = {
  background:"#fff", border:"1px solid var(--border)", borderRadius:"12px",
  boxShadow:"var(--shadow-soft)", padding:"16px 18px", width:"640px", maxWidth:"calc(100% - 32px)"
};

function GlobalStyles(){ return (<style>{`
  :root{
    --cream:${THEME.cream}; --beige:${THEME.beige}; --taupe:${THEME.taupe};
    --sage:${THEME.sage}; --olive:${THEME.olive}; --terracotta:${THEME.terracotta};
    --coral:${THEME.coral}; --ochre:${THEME.ochre}; --charcoal:${THEME.charcoal};
    --warmTaupe:${THEME.warmTaupe}; --border:${THEME.border};
    --radius:${TOKENS.radius}; --shadow-soft:${TOKENS.shadowSoft}; --shadow-inset:${TOKENS.shadowInset};
  }
  *{box-sizing:border-box}
  html,body,#root{height:100%}
  body{
    margin:0;
    font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
    color:var(--charcoal);
    background:var(--cream);
    line-height:1.5;
  }
  .appbar{ position:sticky; top:0; z-index:20; background:var(--beige); border-bottom:1px solid var(--border); }
  .appbar__inner{ max-width:1200px; margin:0 auto; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .brand{ display:flex; flex-direction:column; gap:2px; }
  .brand__wordmark{ font-weight:600; letter-spacing:.2px; color:var(--charcoal); font-size:18px; }
  .brand__tagline{ color:var(--warmTaupe); font-size:12px; }

  .container{ max-width:1200px; margin:24px auto 64px; padding:0 20px; display:grid; grid-template-columns: 360px 1fr; gap:24px; }
  @media (max-width:1000px){ .container{ grid-template-columns:1fr; } }

  .panel{ background:#fff; border:1px solid var(--border); border-radius:var(--radius); box-shadow:var(--shadow-soft); }
  .panel__header{ padding:16px 18px; border-bottom:1px solid var(--border); border-top-left-radius:var(--radius); border-top-right-radius:var(--radius); display:flex; align-items:center; gap:8px; font-weight:600; }
  .panel__body{ padding:16px 18px; }

  .field{ display:flex; flex-direction:column; gap:8px; margin-bottom:14px; }
  .label{ font-size:12px; color:var(--warmTaupe); }
  .askbox{
    border-radius:14px; padding:14px 14px 56px; resize:vertical; min-height:120px;
    border:1px solid var(--border); background:#fff; box-shadow:var(--shadow-inset);
    font:inherit; color:var(--charcoal);
  }
  .ask__actions{ display:flex; justify-content:space-between; align-items:center; margin-top:-44px; padding:0 6px; }

  .btn{ appearance:none; border:1px solid var(--border); border-radius:999px; padding:10px 16px; font-weight:600; cursor:pointer; background:#fff; color:var(--charcoal); }
  .btn:active{ transform:translateY(1px) }
  .btn--primary{ background:var(--terracotta); color:#fff; border-color:transparent; box-shadow:var(--shadow-soft); }

  .chips{ display:flex; flex-wrap:wrap; gap:8px; }
  .chip{
    border:1px solid var(--border); background:#fff; color:var(--charcoal);
    padding:8px 12px; border-radius:999px; cursor:pointer; font-size:13px;
    display:inline-flex; align-items:center; gap:8px; box-shadow:var(--shadow-soft);
  }
  .chip[data-active="true"]{ border-color:var(--sage); outline:2px solid rgba(168,188,161,.25) }

  .slider{ background:#fff; border:1px solid var(--border); border-radius:12px; padding:14px; box-shadow:var(--shadow-soft); }
  .slider__track{ display:flex; align-items:center; gap:12px; }
  input[type="range"]{ width:100%; accent-color:var(--sage); }
  .slider__labels{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:8px; font-size:12px; color:var(--warmTaupe); text-align:center; }
  .slider__labels span[data-active="true"]{ color:var(--charcoal); font-weight:600; }

  .responses{ display:grid; grid-template-columns:1fr; gap:16px; }
  .card{ border:1px solid var(--border); border-radius:var(--radius); background:#fff; box-shadow:var(--shadow-soft); display:flex; flex-direction:column; }
  .card__head{ display:flex; align-items:center; gap:10px; padding:12px 14px; border-bottom:1px solid var(--border); font-weight:600; }
  .card__body{ padding:14px 16px; display:flex; flex-direction:column; gap:8px; }
`}</style>); }

