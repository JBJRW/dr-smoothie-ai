import { useState, useEffect, useRef } from "react";

const API_URL = "/api/analyze";

const INGREDIENTS = [
  { id: 1,  name: "Spirulina",   category: "Superfood",   emoji: "🌿" },
  { id: 2,  name: "Mango",       category: "Fruit",       emoji: "🥭" },
  { id: 3,  name: "Ginger",      category: "Root",        emoji: "🫚" },
  { id: 4,  name: "Turmeric",    category: "Spice",       emoji: "🟡" },
  { id: 5,  name: "Banana",      category: "Fruit",       emoji: "🍌" },
  { id: 6,  name: "Moringa",     category: "Superfood",   emoji: "🌱" },
  { id: 7,  name: "Beet",        category: "Vegetable",   emoji: "🫐" },
  { id: 8,  name: "Matcha",      category: "Tea",         emoji: "🍵" },
  { id: 9,  name: "Pineapple",   category: "Fruit",       emoji: "🍍" },
  { id: 10, name: "Chia Seeds",  category: "Seed",        emoji: "⚫" },
  { id: 11, name: "Kale",        category: "Leafy Green", emoji: "🥬" },
  { id: 12, name: "Coconut",     category: "Tropical",    emoji: "🥥" },
];

const GOALS = ["Energy Boost","Immunity","Anti-Inflammation","Detox","Weight Loss","Recovery","Focus","Skin Glow"];

function TypingText({ text, speed = 18 }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);
  useEffect(() => {
    setDisplayed(""); setDone(false); idx.current = 0;
    const iv = setInterval(() => {
      if (idx.current < text.length) { setDisplayed(text.slice(0, idx.current + 1)); idx.current++; }
      else { setDone(true); clearInterval(iv); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return <span>{displayed}{!done && <span style={{animation:"blink .8s step-end infinite"}}>|</span>}</span>;
}

function ScoreBar({ value, label, color }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 400); return () => clearTimeout(t); }, [value]);
  return (
    <div style={{marginBottom:"10px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
        <span style={{fontSize:"11px",color:"#94a3b8",letterSpacing:".08em",textTransform:"uppercase"}}>{label}</span>
        <span style={{fontSize:"12px",color:color,fontWeight:700}}>{value}%</span>
      </div>
      <div style={{height:"6px",background:"rgba(255,255,255,.06)",borderRadius:"99px",overflow:"hidden"}}>
        <div style={{height:"100%",width:`${w}%`,background:color,borderRadius:"99px",
          transition:"width 1.2s cubic-bezier(.16,1,.3,1)",boxShadow:`0 0 8px ${color}66`}} />
      </div>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState([]);
  const [goal, setGoal]         = useState("");
  const [report, setReport]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [phase, setPhase]       = useState("select");

  const toggle = (id) =>
    setSelected(p => p.includes(id) ? p.filter(x=>x!==id) : p.length < 5 ? [...p,id] : p);

  const analyze = async () => {
    if (selected.length < 2 || !goal) return;
    setLoading(true); setError(null); setReport(null);
    const names = selected.map(id => INGREDIENTS.find(i=>i.id===id).name).join(", ");
    const prompt = `You are Dr. Smoothie AI — a precision nutrition intelligence engine.
Analyze these ingredients: ${names}. Wellness goal: ${goal}.
Respond ONLY with valid JSON, no markdown:
{"title":"short poetic blend name max 5 words","tagline":"one punchy sentence","synergy_score":0-100,"goal_match":0-100,"bioavailability":0-100,"inflammation_index":0-100,"key_benefits":["benefit 1","benefit 2","benefit 3"],"best_time":"morning|pre-workout|post-workout|evening","caution":"one sentence","verdict":"2-3 sentences expert verdict mentioning specific ingredient interactions"}`;
    try {
      const res  = await fetch(API_URL, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{role:"user",content:prompt}], max_tokens:1000 })
      });
      const data = await res.json();
      const raw  = data.content?.find(b=>b.type==="text")?.text || "";
      setReport(JSON.parse(raw.replace(/```json|```/g,"").trim()));
      setPhase("result");
    } catch { setError("Analysis failed. Please try again."); }
    finally { setLoading(false); }
  };

  const reset = () => { setSelected([]); setGoal(""); setReport(null); setPhase("select"); setError(null); };
  const items  = selected.map(id => INGREDIENTS.find(i=>i.id===id));

  const S = {
    wrap:       {minHeight:"100vh",background:"#060a0f",color:"#e2e8f0",fontFamily:"'DM Mono','Fira Mono',monospace"},
    header:     {borderBottom:"1px solid rgba(74,222,128,.1)",padding:"18px 24px",display:"flex",alignItems:"center",
                  justifyContent:"space-between",position:"sticky",top:0,zIndex:100,
                  background:"rgba(6,10,15,.95)",backdropFilter:"blur(10px)"},
    logoBox:    {width:"32px",height:"32px",background:"linear-gradient(135deg,#166534,#4ade80)",
                  borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"},
    brand:      {fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"14px",color:"#f0fdf4"},
    sub:        {fontSize:"9px",color:"#4ade80",letterSpacing:".2em",textTransform:"uppercase",marginTop:"1px"},
    body:       {maxWidth:"640px",margin:"0 auto",padding:"28px 20px"},
    grid:       {display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"},
    goals:      {display:"flex",flexWrap:"wrap",gap:"8px"},
    preview:    {background:"rgba(74,222,128,.04)",border:"1px solid rgba(74,222,128,.12)",borderRadius:"10px",padding:"14px 16px",marginBottom:"20px"},
    card:       {border:"1px solid rgba(255,255,255,.06)",borderRadius:"12px",padding:"20px",marginBottom:"16px",background:"rgba(255,255,255,.02)"},
    reportHdr:  {position:"relative",background:"linear-gradient(135deg,rgba(22,101,52,.3),rgba(15,23,42,.6))",
                  border:"1px solid rgba(74,222,128,.2)",borderRadius:"14px",padding:"24px",marginBottom:"20px",overflow:"hidden"},
    twoCol:     {display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"},
    actions:    {display:"flex",gap:"10px"},
    footer:     {marginTop:"20px",textAlign:"center",fontSize:"10px",color:"#1e293b",letterSpacing:".15em"},
    dot:        {width:"8px",height:"8px",background:"#4ade80",borderRadius:"50%"},
    live:       {display:"flex",alignItems:"center",gap:"8px",fontSize:"10px",color:"#4ade80",letterSpacing:".15em"},
    sec:        (color)=>({fontSize:"10px",color:color,letterSpacing:".2em",textTransform:"uppercase",marginBottom:"12px"}),
    chip:       (on)=>({cursor:"pointer",border:`1px solid ${on?"#4ade80":"rgba(255,255,255,.08)"}`,borderRadius:"8px",
                  padding:"10px 14px",background:on?"rgba(74,222,128,.12)":"rgba(255,255,255,.03)",
                  transition:"all .2s",userSelect:"none",
                  boxShadow:on?"0 0 12px rgba(74,222,128,.15)":"none"}),
    goalBtn:    (on)=>({cursor:"pointer",border:`1px solid ${on?"#fbbf24":"rgba(255,255,255,.07)"}`,borderRadius:"6px",
                  padding:"7px 14px",background:on?"rgba(251,191,36,.08)":"transparent",
                  color:on?"#fbbf24":"#94a3b8",fontFamily:"inherit",fontSize:"11px",
                  letterSpacing:".08em",textTransform:"uppercase",transition:"all .2s"}),
    btn:        (disabled)=>({cursor:disabled?"not-allowed":"pointer",width:"100%",padding:"16px",border:"none",
                  borderRadius:"10px",background:"linear-gradient(135deg,#166534,#15803d)",
                  color:"#dcfce7",fontFamily:"inherit",fontSize:"13px",letterSpacing:".15em",
                  textTransform:"uppercase",opacity:disabled?.4:1,transition:"all .25s"}),
    tag:        (color,bg,border)=>({fontSize:"11px",color:color,background:bg,padding:"4px 10px",borderRadius:"99px",border:`1px solid ${border}`}),
    btnGhost:   {flex:1,padding:"14px",border:"1px solid rgba(255,255,255,.08)",borderRadius:"10px",
                  background:"transparent",color:"#94a3b8",fontFamily:"inherit",fontSize:"12px",
                  letterSpacing:".1em",cursor:"pointer"},
    btnBlue:    {flex:2,padding:"14px",border:"none",borderRadius:"10px",
                  background:"linear-gradient(135deg,#1e40af,#2563eb)",color:"#dbeafe",
                  fontFamily:"inherit",fontSize:"12px",letterSpacing:".1em",cursor:"pointer"},
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes blink{50%{opacity:0}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.4)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scan{0%{top:0%}100%{top:100%}}
        .fade{animation:fadeIn .5s ease forwards}
        .dot-pulse{animation:pulse 1.5s ease-in-out infinite}
        .scan-line{position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#4ade80,transparent);animation:scan 3s linear infinite;opacity:.4}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0d1117}::-webkit-scrollbar-thumb{background:#1e3a2f;border-radius:2px}
      `}</style>

      <div style={S.wrap}>
        {/* Header */}
        <div style={S.header}>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <div style={S.logoBox}>🧪</div>
            <div>
              <div style={S.brand}>dr.smoothie.ai</div>
              <div style={S.sub}>Ingredient Intelligence Engine</div>
            </div>
          </div>
          <div style={S.live}><div style={S.dot} className="dot-pulse"/>LIVE</div>
        </div>

        <div style={S.body}>

          {phase==="select" && (
            <div className="fade">
              <div style={{marginBottom:"28px"}}>
                <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"22px",color:"#f0fdf4",lineHeight:1.3,marginBottom:"8px"}}>
                  Build your formula.<br/><span style={{color:"#4ade80"}}>Science will verify it.</span>
                </h1>
                <p style={{fontSize:"12px",color:"#64748b",lineHeight:1.6}}>Select up to 5 ingredients → set your goal → get a precision analysis.</p>
              </div>

              <div style={{marginBottom:"24px"}}>
                <div style={S.sec("#4ade80")}>— Ingredients ({selected.length}/5)</div>
                <div style={S.grid}>
                  {INGREDIENTS.map(ing => (
                    <div key={ing.id} style={S.chip(selected.includes(ing.id))} onClick={()=>toggle(ing.id)}>
                      <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                        <span style={{fontSize:"18px"}}>{ing.emoji}</span>
                        <div>
                          <div style={{fontSize:"13px",color:"#e2e8f0",fontWeight:500}}>{ing.name}</div>
                          <div style={{fontSize:"10px",color:"#475569"}}>{ing.category}</div>
                        </div>
                        {selected.includes(ing.id) && (
                          <div style={{marginLeft:"auto",width:"18px",height:"18px",background:"#4ade80",borderRadius:"50%",
                            display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",color:"#052e16"}}>✓</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:"28px"}}>
                <div style={S.sec("#fbbf24")}>— Wellness Goal</div>
                <div style={S.goals}>
                  {GOALS.map(g=><button key={g} style={S.goalBtn(goal===g)} onClick={()=>setGoal(g)}>{g}</button>)}
                </div>
              </div>

              {selected.length>0 && (
                <div style={S.preview}>
                  <div style={{fontSize:"10px",color:"#4ade80",letterSpacing:".15em",marginBottom:"8px"}}>YOUR BLEND</div>
                  <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                    {items.map(i=><span key={i.id} style={S.tag("#86efac","rgba(74,222,128,.1)","rgba(74,222,128,.2)")}>{i.emoji} {i.name}</span>)}
                    {goal&&<span style={S.tag("#fbbf24","rgba(251,191,36,.08)","rgba(251,191,36,.2)")}>🎯 {goal}</span>}
                  </div>
                </div>
              )}

              <button style={S.btn(selected.length<2||!goal||loading)} disabled={selected.length<2||!goal||loading} onClick={analyze}>
                {loading?"⟳  Analyzing...":"→  Run Intelligence Analysis"}
              </button>

              {loading&&<div style={{marginTop:"20px",textAlign:"center",fontSize:"11px",color:"#4ade80",letterSpacing:".15em"}}>
                <TypingText text="Scanning nutritional databases... cross-referencing bioavailability data..." speed={25}/>
              </div>}
              {error&&<div style={{marginTop:"12px",color:"#f87171",fontSize:"12px",textAlign:"center"}}>{error}</div>}
            </div>
          )}

          {phase==="result"&&report&&(
            <div className="fade">
              <div style={S.reportHdr}>
                <div className="scan-line"/>
                <div style={{fontSize:"10px",color:"#4ade80",letterSpacing:".2em",marginBottom:"10px"}}>INTELLIGENCE REPORT</div>
                <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"24px",color:"#f0fdf4",marginBottom:"8px",lineHeight:1.2}}>
                  <TypingText text={report.title} speed={50}/>
                </h2>
                <p style={{fontSize:"13px",color:"#86efac",lineHeight:1.6}}>{report.tagline}</p>
                <div style={{display:"flex",gap:"8px",marginTop:"14px",flexWrap:"wrap"}}>
                  {items.map(i=><span key={i.id} style={S.tag("#64748b","rgba(255,255,255,.04)","rgba(255,255,255,.07)")}>{i.emoji} {i.name}</span>)}
                  <span style={S.tag("#fbbf24","rgba(251,191,36,.08)","rgba(251,191,36,.2)")}>🎯 {goal}</span>
                </div>
              </div>

              <div style={S.card}>
                <div style={{fontSize:"10px",color:"#94a3b8",letterSpacing:".2em",marginBottom:"16px"}}>PERFORMANCE METRICS</div>
                <ScoreBar value={report.synergy_score}      label="Ingredient Synergy"      color="#4ade80"/>
                <ScoreBar value={report.goal_match}         label="Goal Match"              color="#fbbf24"/>
                <ScoreBar value={report.bioavailability}    label="Bioavailability"         color="#60a5fa"/>
                <ScoreBar value={report.inflammation_index} label="Anti-Inflammatory Index" color="#f472b6"/>
              </div>

              <div style={S.card}>
                <div style={{fontSize:"10px",color:"#94a3b8",letterSpacing:".2em",marginBottom:"14px"}}>KEY BENEFITS</div>
                {report.key_benefits?.map((b,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:"10px",marginBottom:"10px"}}>
                    <div style={{width:"20px",height:"20px",background:"rgba(74,222,128,.15)",borderRadius:"50%",
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",color:"#4ade80",flexShrink:0,marginTop:"1px"}}>{i+1}</div>
                    <span style={{fontSize:"13px",color:"#cbd5e1",lineHeight:1.5}}>{b}</span>
                  </div>
                ))}
              </div>

              <div style={S.twoCol}>
                <div style={{background:"rgba(251,191,36,.05)",border:"1px solid rgba(251,191,36,.15)",borderRadius:"10px",padding:"16px"}}>
                  <div style={{fontSize:"9px",color:"#fbbf24",letterSpacing:".2em",marginBottom:"6px"}}>BEST TIME</div>
                  <div style={{fontSize:"14px",color:"#fef3c7",textTransform:"capitalize"}}>⏰ {report.best_time}</div>
                </div>
                <div style={{background:"rgba(248,113,113,.05)",border:"1px solid rgba(248,113,113,.15)",borderRadius:"10px",padding:"16px"}}>
                  <div style={{fontSize:"9px",color:"#f87171",letterSpacing:".2em",marginBottom:"6px"}}>CAUTION</div>
                  <div style={{fontSize:"11px",color:"#fecaca",lineHeight:1.5}}>{report.caution}</div>
                </div>
              </div>

              <div style={{background:"rgba(96,165,250,.05)",border:"1px solid rgba(96,165,250,.15)",borderRadius:"12px",padding:"20px",marginBottom:"20px"}}>
                <div style={{fontSize:"10px",color:"#60a5fa",letterSpacing:".2em",marginBottom:"10px"}}>EXPERT VERDICT</div>
                <p style={{fontSize:"13px",color:"#bfdbfe",lineHeight:1.7}}>{report.verdict}</p>
              </div>

              <div style={S.actions}>
                <button style={S.btnGhost} onClick={reset}>← New Analysis</button>
                <button style={S.btnBlue}>+ Add to My Plan</button>
              </div>
              <div style={S.footer}>POWERED BY JRMB FOOD NETWORK LLC · dr.smoothie.ai</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
