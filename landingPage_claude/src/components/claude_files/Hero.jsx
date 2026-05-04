import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Hero.css";
import original_logo from "../../assets/original_logo.png";
import mockup_menu from "../../assets/mobile_view1.png";
import AnimatedShaderBackground from "../AnimatedShaderBackground/AnimatedShaderBackground";

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const FOOD_ICONS = [
  { emoji:"🍽️", x:3,  y:14, size:38, op:0.22, dur:18, delay:0    },
  { emoji:"🥂",  x:8,  y:72, size:30, op:0.18, dur:22, delay:2.2  },
  { emoji:"🍷",  x:89, y:12, size:36, op:0.20, dur:20, delay:0.8  },
  { emoji:"🫒",  x:93, y:62, size:28, op:0.17, dur:17, delay:3.5  },
  { emoji:"🥩",  x:5,  y:46, size:34, op:0.19, dur:24, delay:1.4  },
  { emoji:"🍋",  x:84, y:80, size:30, op:0.17, dur:19, delay:0.4  },
  { emoji:"🫙",  x:48, y:90, size:28, op:0.16, dur:21, delay:2.8  },
  { emoji:"🧂",  x:74, y:6,  size:26, op:0.17, dur:16, delay:4.1  },
  { emoji:"🥗",  x:22, y:88, size:32, op:0.18, dur:25, delay:1.1  },
  { emoji:"☕",  x:96, y:38, size:28, op:0.17, dur:18, delay:3.2  },
  { emoji:"🍰",  x:18, y:4,  size:30, op:0.19, dur:20, delay:2.5  },
  { emoji:"🧁",  x:62, y:3,  size:26, op:0.16, dur:23, delay:0.7  },
  { emoji:"🫕",  x:36, y:94, size:32, op:0.17, dur:19, delay:1.9  },
  { emoji:"🍜",  x:79, y:52, size:28, op:0.16, dur:22, delay:3.8  },
  { emoji:"🥐",  x:1,  y:28, size:30, op:0.18, dur:21, delay:0.3  },
  { emoji:"🫐",  x:56, y:96, size:24, op:0.16, dur:17, delay:2.0  },
];

const TRUST_LOGOS = [
  "Le Bernardin","Nobu","The Ivy","Sketch","Brasserie Lipp",
  "El Celler","Zuma","Noma","Osteria Francescana",
  "Le Bernardin","Nobu","The Ivy","Sketch","Brasserie Lipp",
  "El Celler","Zuma","Noma","Osteria Francescana",
];

const WORDS    = ["restaurants","bistros","brasseries","cafés","hotels"];
const CONFETTI = ["🍽️","🥂","🍷","🥩","🍋","🎉","⭐","✨","🎊","🍾"];
const DRIFT    = ["food-drift-a","food-drift-b","food-drift-c","food-drift-d","food-drift-e","food-drift-f"];

const SECTIONS = [
  { id:"home",      icon:"🏠", label:"Home"      },
  { id:"orders",    icon:"⚡", label:"Orders"    },
  { id:"tables",    icon:"🗺️", label:"Tables"    },
  { id:"analytics", icon:"📊", label:"Analytics" },
  { id:"qrmenu",    icon:"📱", label:"QR Menu"   },
  { id:"staff",     icon:"👥", label:"Staff"     },
  { id:"settings",  icon:"⚙️", label:"Settings"  },
];
const TOUR_IDS = ["home","orders","tables","analytics","qrmenu"];

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useCountUp(target, duration, go) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!go) { setVal(0); return; }
    let s = null;
    const step = (ts) => {
      if (!s) s = ts;
      const p = Math.min((ts-s)/duration,1);
      setVal(Math.round((1-Math.pow(1-p,3))*target));
      if (p<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [go,target,duration]);
  return val;
}

// ─── PLAIN BUTTON ─────────────────────────────────────────────────────────────
function MagBtn({ cls, children, onClick }) {
  return <button className={cls} onClick={onClick}>{children}</button>;
}

// ─── CONFETTI PARTICLE ────────────────────────────────────────────────────────
function Particle({ id, x, y, emoji, vx, vy, onDone }) {
  const r = useRef(null);
  useEffect(() => {
    let px=x,py=y,pvx=vx,pvy=vy,rot=Math.random()*360,rv=(Math.random()-0.5)*20,f;
    const tick=()=>{
      pvx*=0.97;pvy+=0.5;pvy*=0.985;px+=pvx;py+=pvy;rot+=rv;
      if(r.current){r.current.style.left=px+"px";r.current.style.top=py+"px";r.current.style.transform=`rotate(${rot}deg) scale(${Math.max(0.3,1-py/window.innerHeight)})`;}
      if(py<window.innerHeight+100)f=requestAnimationFrame(tick);else onDone(id);
    };
    f=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(f);
  },[]);
  return <span ref={r} style={{position:"fixed",left:x,top:y,fontSize:20+Math.random()*14,pointerEvents:"none",zIndex:9999,userSelect:"none",lineHeight:1}}>{emoji}</span>;
}

// ─── SCREEN VIEWS ────────────────────────────────────────────────────────────
function HomeScreen({ goKpi }) {
  const rev    = useCountUp(224,  1800, goKpi);
  const orders = useCountUp(1457, 2000, goKpi);
  const ticket = useCountUp(221,  1500, goKpi);
  return (
    <div className="lsh-db-screen">
      <div className="lsh-db-header">
        <div className="lsh-db-title">Home</div>
        <div className="lsh-db-pills-row">
          <span className="lsh-tpill">All venues</span>
          <span className="lsh-tpill active">26 Sep–25 Oct</span>
        </div>
      </div>
      <div className="lsh-kpis">
        <div className="lsh-kpi"><div className="lsh-kpi-label">Revenue</div><div className="lsh-kpi-val">€{rev}.4k</div><div className="lsh-kpi-delta up">↑ +18%</div></div>
        <div className="lsh-kpi"><div className="lsh-kpi-label">Orders</div><div className="lsh-kpi-val">{orders.toLocaleString()}</div><div className="lsh-kpi-delta up">↑ +24</div></div>
        <div className="lsh-kpi"><div className="lsh-kpi-label">Avg. ticket</div><div className="lsh-kpi-val">€{(ticket/10).toFixed(1)}</div><div className="lsh-kpi-delta down">↓ -3%</div></div>
      </div>
      <div className="lsh-chart-wrap">
        <div className="lsh-chart-label">Weekly Revenue</div>
        <svg className="lsh-chart-svg" viewBox="0 0 380 68" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lshLg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e86514" stopOpacity="0.32"/><stop offset="100%" stopColor="#e86514" stopOpacity="0"/></linearGradient>
            <linearGradient id="lshLg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4ade80" stopOpacity="0.2"/><stop offset="100%" stopColor="#4ade80" stopOpacity="0"/></linearGradient>
          </defs>
          <path d="M0,52 C30,47 60,32 100,27 C140,22 170,35 200,25 C230,15 260,8 300,13 C330,17 360,33 380,28 L380,68 L0,68 Z" fill="url(#lshLg1)"/>
          <path d="M0,52 C30,47 60,32 100,27 C140,22 170,35 200,25 C230,15 260,8 300,13 C330,17 360,33 380,28" fill="none" stroke="#e86514" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M0,60 C30,56 60,50 100,46 C140,42 170,48 200,42 C230,36 260,32 300,36 C330,39 360,46 380,42 L380,68 L0,68 Z" fill="url(#lshLg2)"/>
          <path d="M0,60 C30,56 60,50 100,46 C140,42 170,48 200,42 C230,36 260,32 300,36 C330,39 360,46 380,42" fill="none" stroke="#4ade80" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 2.5"/>
          <circle cx="300" cy="13" r="3.5" fill="#e86514"/><circle cx="300" cy="13" r="7" fill="#e86514" opacity="0.2"/>
        </svg>
      </div>
      <div className="lsh-section-rows">
        <div className="lsh-section-label">Top dishes today</div>
        {[{e:"🥩",n:"Wagyu Ribeye",p:87},{e:"🍝",n:"Pasta al Tartufo",p:72},{e:"🍷",n:"Barolo 2018",p:65}].map((d,i)=>(
          <div className="lsh-dish-row" key={i}>
            <span className="lsh-dish-emoji">{d.e}</span>
            <div className="lsh-dish-info">
              <span className="lsh-dish-name">{d.n}</span>
              <div className="lsh-dish-bar-bg"><div className="lsh-dish-bar" style={{width:`${d.p}%`,animationDelay:`${i*0.12}s`}}/></div>
            </div>
            <span className="lsh-dish-pct">{d.p}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersScreen() {
  const rows=[
    {e:"🥩",n:"Wagyu Ribeye",       t:"T-04",s:"Cooking",c:"#F97316",bg:"rgba(249,115,22,0.14)",time:"8 min"},
    {e:"🍝",n:"Pasta al Tartufo",   t:"T-11",s:"Ready",  c:"#22C55E",bg:"rgba(34,197,94,0.14)",  time:"—"  },
    {e:"🫙",n:"Burrata & Pomodoro", t:"T-02",s:"New",    c:"#6366F1",bg:"rgba(99,102,241,0.14)", time:"12 min"},
    {e:"🍷",n:"Barolo 2018",         t:"T-07",s:"Served", c:"#94A3B8",bg:"rgba(148,163,184,0.14)",time:"—"  },
  ];
  return (
    <div className="lsh-db-screen">
      <div className="lsh-db-header">
        <div className="lsh-db-title">Live Orders</div>
        <span className="lsh-live-badge"><span className="lsh-live-dot"/>Live · 127 today</span>
      </div>
      <div className="lsh-orders-full">
        {rows.map((o,i)=>(
          <div className="lsh-order-row-full" key={i} style={{animationDelay:`${i*0.07}s`}}>
            <span className="lsh-order-emoji-lg">{o.e}</span>
            <div className="lsh-order-info-lg">
              <span className="lsh-order-name-lg">{o.n}</span>
              <span className="lsh-order-meta">{o.t}{o.time!=="—"?` · ⏱ ${o.time}`:""}</span>
            </div>
            <span className="lsh-order-status-lg" style={{color:o.c,background:o.bg}}>{o.s}</span>
          </div>
        ))}
      </div>
      <div className="lsh-order-summary">
        {[{n:3,l:"Cooking",c:"#F97316"},{n:8,l:"Ready",c:"#22C55E"},{n:5,l:"New",c:"#6366F1"},{n:14,l:"Served",c:"#94A3B8"}].map(x=>(
          <div className="lsh-order-stat" key={x.l}><span className="lsh-os-num" style={{color:x.c}}>{x.n}</span><span className="lsh-os-lbl">{x.l}</span></div>
        ))}
      </div>
    </div>
  );
}

function TablesScreen() {
  const tables=[
    {num:"01",state:"occupied", guests:3,info:"42 min"},
    {num:"02",state:"available",guests:0,info:"Seats 4"},
    {num:"03",state:"reserved", guests:0,info:"Rossi · 20:00"},
    {num:"04",state:"occupied", guests:6,info:"18 min"},
    {num:"05",state:"cleaning", guests:0,info:"~2 min"},
    {num:"06",state:"available",guests:0,info:"Seats 2"},
    {num:"07",state:"occupied", guests:2,info:"1h 5m"},
    {num:"08",state:"reserved", guests:0,info:"Chen · 19:30"},
  ];
  const style={
    occupied:  {bg:"rgba(216,119,72,0.22)",border:"rgba(216,119,72,0.4)", text:"#D87748"},
    available: {bg:"rgba(61,122,82,0.15)", border:"rgba(61,122,82,0.35)", text:"#3D7A52"},
    reserved:  {bg:"rgba(180,130,0,0.15)", border:"rgba(180,130,0,0.35)", text:"#B48000"},
    cleaning:  {bg:"rgba(100,116,139,0.15)",border:"rgba(100,116,139,0.3)",text:"#64748B"},
  };
  const labels={occupied:"Occupied",available:"Free",reserved:"Reserved",cleaning:"Cleaning"};
  return (
    <div className="lsh-db-screen">
      <div className="lsh-db-header">
        <div className="lsh-db-title">Table Map</div>
        <div className="lsh-db-pills-row"><span className="lsh-tpill active">Floor 1</span><span className="lsh-tpill">Terrace</span></div>
      </div>
      <div className="lsh-tables-grid">
        {tables.map(tb=>{
          const st=style[tb.state];
          return (
            <div key={tb.num} className="lsh-table-cell" style={{background:st.bg,border:`1px solid ${st.border}`,color:st.text}}>
              <span className="lsh-table-num">T{tb.num}</span>
              <span className="lsh-table-state">{labels[tb.state]}</span>
              <span className="lsh-table-since">{tb.info}</span>
            </div>
          );
        })}
      </div>
      <div className="lsh-table-legend">
        {Object.entries(labels).map(([k,v])=>(
          <div key={k} className="lsh-legend-item"><span className="lsh-legend-dot" style={{background:style[k].text}}/>{v}</div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  const bars=[42,61,55,78,95,72,58], days=["M","T","W","T","F","S","S"], vals=["€1.8k","€2.4k","€2.1k","€3.0k","€3.8k","€2.9k","€2.3k"];
  const [active,setActive]=useState(4);
  return (
    <div className="lsh-db-screen">
      <div className="lsh-db-header">
        <div className="lsh-db-title">Analytics</div>
        <div className="lsh-db-pills-row"><span className="lsh-tpill active">This week</span><span className="lsh-tpill">Month</span></div>
      </div>
      <div className="lsh-analytics-kpis">
        <div className="lsh-akpi"><span className="lsh-akpi-val" style={{color:"#e86514"}}>€18.4k</span><span className="lsh-akpi-lbl">Revenue</span><span className="lsh-akpi-d up">↑ +18%</span></div>
        <div className="lsh-akpi"><span className="lsh-akpi-val">834</span><span className="lsh-akpi-lbl">Covers</span><span className="lsh-akpi-d up">↑ +24</span></div>
        <div className="lsh-akpi"><span className="lsh-akpi-val">€22.1</span><span className="lsh-akpi-lbl">Avg. bill</span><span className="lsh-akpi-d down">↓ -3%</span></div>
      </div>
      <div className="lsh-bar-chart">
        {bars.map((h,i)=>(
          <div className="lsh-bar-col" key={i} onClick={()=>setActive(i)}>
            {active===i&&<span className="lsh-bar-tip">{vals[i]}</span>}
            <div className="lsh-bar-fill" style={{height:`${h}%`,background:active===i?"#e86514":"rgba(232,101,20,0.2)",animationDelay:`${i*0.06}s`}}/>
            <span className="lsh-bar-day" style={{color:active===i?"#e86514":"rgba(255,255,255,0.3)"}}>{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QrMenuScreen() {
  const steps=["Guest scans QR at table","Browses digital menu","Taps to order & pay","Kitchen gets it instantly"];
  const [step,setStep]=useState(0);
  useEffect(()=>{const iv=setInterval(()=>setStep(s=>(s+1)%steps.length),1400);return()=>clearInterval(iv);},[]);
  return (
    <div className="lsh-db-screen">
      <div className="lsh-db-header">
        <div className="lsh-db-title">QR Menu</div>
        <span className="lsh-live-badge" style={{background:"rgba(232,101,20,0.12)",borderColor:"rgba(232,101,20,0.3)",color:"#e86514"}}>
          <span style={{width:5,height:5,borderRadius:"50%",background:"#e86514",display:"inline-block",animation:"live-pulse 1.4s ease-in-out infinite"}}/>Active
        </span>
      </div>
      <div className="lsh-qr-layout">
        <div className="lsh-qr-phone-wrap">
          <div className="lsh-qr-phone">
            <div className="lsh-qr-notch"/>
            <div className="lsh-qr-screen-inner">
              <svg width="68" height="68" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="8" height="8" rx="1" stroke="#1A1108" strokeWidth="1.2" fill="none"/>
                <rect x="3" y="3" width="4" height="4" rx="0.5" fill="#1A1108"/>
                <rect x="12" y="1" width="8" height="8" rx="1" stroke="#1A1108" strokeWidth="1.2" fill="none"/>
                <rect x="14" y="3" width="4" height="4" rx="0.5" fill="#1A1108"/>
                <rect x="1" y="12" width="8" height="8" rx="1" stroke="#1A1108" strokeWidth="1.2" fill="none"/>
                <rect x="3" y="14" width="4" height="4" rx="0.5" fill="#1A1108"/>
                <rect x="12" y="12" width="2" height="2" fill="#1A1108"/>
                <rect x="15" y="12" width="2" height="2" fill="#1A1108"/>
                <rect x="18" y="12" width="2" height="2" fill="#1A1108"/>
                <rect x="12" y="15" width="2" height="2" fill="#1A1108"/>
                <rect x="15" y="15" width="5" height="5" rx="0.5" fill="#1A1108"/>
              </svg>
              <span className="lsh-qr-hint">Scan to order</span>
            </div>
          </div>
          <div className="lsh-qr-stat"><span className="lsh-qr-stat-num">4.2 min</span><span className="lsh-qr-stat-lbl">avg. order time</span></div>
        </div>
        <div className="lsh-qr-steps">
          <div className="lsh-qr-steps-lbl">How it works</div>
          {steps.map((s,i)=>(
            <div key={i} className={`lsh-qr-step${i===step?" lsh-qr-step--on":""}`}>
              <span className="lsh-qr-num" style={{background:i<=step?"#e86514":"rgba(255,255,255,0.08)",color:i<=step?"#fff":"rgba(255,255,255,0.3)"}}>
                {i<step?"✓":i+1}
              </span>
              <span className="lsh-qr-text" style={{color:i===step?"rgba(255,255,255,0.9)":i<step?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.22)"}}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LemonSqueezyHero() {
  const iconRefs = useRef([]);

  const [tilt,     setTilt]     = useState({ rx:0, ry:0 });
  const [offsets,  setOffsets]  = useState(FOOD_ICONS.map(()=>({ox:0,oy:0})));
  const [glowXY,   setGlowXY]   = useState({ x:60, y:40 });
  const [wordIdx,  setWordIdx]  = useState(0);
  const [typed,    setTyped]    = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [tourIdx,  setTourIdx]  = useState(0);
  const [visible,  setVisible]  = useState(true);
  const [goKpi,    setGoKpi]    = useState(true);
  const [paused,   setPaused]   = useState(false);
  const tourRef   = useRef(0);
  const pauseRef  = useRef(false);
  const resumeRef = useRef(null);

  // Tour cycle
  useEffect(() => {
    const iv = setInterval(() => {
      if (pauseRef.current) return;
      setVisible(false);
      setTimeout(() => {
        tourRef.current = (tourRef.current+1) % TOUR_IDS.length;
        const next = tourRef.current;
        setTourIdx(next);
        if (TOUR_IDS[next]==="home") { setGoKpi(false); setTimeout(()=>setGoKpi(true),80); }
        setVisible(true);
      }, 380);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  // Typewriter
  useEffect(() => {
    const word = WORDS[wordIdx];
    let t;
    if (!deleting) {
      if (typed.length<word.length) t=setTimeout(()=>setTyped(word.slice(0,typed.length+1)),85);
      else t=setTimeout(()=>setDeleting(true),2400);
    } else {
      if (typed.length>0) t=setTimeout(()=>setTyped(typed.slice(0,-1)),48);
      else { setDeleting(false); setWordIdx(i=>(i+1)%WORDS.length); }
    }
    return()=>clearTimeout(t);
  },[typed,deleting,wordIdx]);

  // Mouse effects
  useEffect(() => {
    const onMove = (e) => {
      const nx=e.clientX/window.innerWidth, ny=e.clientY/window.innerHeight;
      setGlowXY({x:nx*100,y:ny*100});
      setTilt({rx:(ny-0.5)*14,ry:(nx-0.5)*-20});
      setOffsets(FOOD_ICONS.map((_,i)=>{
        const el=iconRefs.current[i]; if(!el)return{ox:0,oy:0};
        const r=el.getBoundingClientRect();
        const cx=r.left+r.width/2,cy=r.top+r.height/2;
        const d=Math.hypot(e.clientX-cx,e.clientY-cy);
        if(d<130){const f=(1-d/130)*44,a=Math.atan2(cy-e.clientY,cx-e.clientX);return{ox:Math.cos(a)*f,oy:Math.sin(a)*f};}
        return{ox:0,oy:0};
      }));
    };
    const onLeave=()=>{setTilt({rx:0,ry:0});setOffsets(FOOD_ICONS.map(()=>({ox:0,oy:0})));};
    window.addEventListener("mousemove",onMove);
    window.addEventListener("mouseleave",onLeave);
    return()=>{window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseleave",onLeave);};
  },[]);

  // Confetti
  const boom = useCallback((e) => {
    const r=e.currentTarget.getBoundingClientRect();
    const cx=r.left+r.width/2,cy=r.top+r.height/2;
    setConfetti(prev=>[...prev,...Array.from({length:32},(_,i)=>{
      const a=(i/32)*Math.PI*2,sp=7+Math.random()*11;
      return{id:Date.now()+i,x:cx,y:cy,emoji:CONFETTI[Math.floor(Math.random()*CONFETTI.length)],
        vx:Math.cos(a)*sp+(Math.random()-0.5)*5,vy:Math.sin(a)*sp-Math.random()*9};
    })]);
  },[]);
  const removeParticle = useCallback((id)=>setConfetti(p=>p.filter(x=>x.id!==id)),[]);

  const goToSection = (i) => {
    pauseRef.current = true;
    setPaused(true);
    if (resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => {
      pauseRef.current = false;
      setPaused(false);
    }, 12000);

    setVisible(false);
    setTimeout(() => {
      setTourIdx(i);
      tourRef.current = i;
      if (TOUR_IDS[i]==="home") { setGoKpi(false); setTimeout(()=>setGoKpi(true),80); }
      setVisible(true);
    }, 300);
  };

  const currentId = TOUR_IDS[tourIdx];
  const renderScreen = () => {
    switch(currentId) {
      case "orders":    return <OrdersScreen/>;
      case "tables":    return <TablesScreen/>;
      case "analytics": return <AnalyticsScreen/>;
      case "qrmenu":    return <QrMenuScreen/>;
      default:          return <HomeScreen goKpi={goKpi}/>;
    }
  };

  return (
    <section className="lsh-root">
      {confetti.map(p=><Particle key={p.id} {...p} onDone={removeParticle}/>)}

      {/* BG - commented out to remove floating icons */}
      {/* <AnimatedShaderBackground className="lsh-bg" aria-hidden="true">
        {FOOD_ICONS.map((f,i)=>(
          <span key={i} ref={el=>iconRefs.current[i]=el} className="lsh-food-icon" >
            {f.emoji}
          </span>
        ))}
      </AnimatedShaderBackground> */}

      {/* MAIN */}
      <div className="lsh-main">
        <div className="lsh-left">
          <div className="lsh-tag"><span className="lsh-tag-dot"/>Now live in 500+ venues worldwide</div>
          <h1 className="lsh-h1">
            Orders, tables<br/>
            &amp;{" "}<em className="lsh-typeword">{typed}<span className="lsh-caret">|</span></em><br/>
            for restaurants
          </h1>
          <p className="lsh-p">
            As your all-in-one restaurant OS, Orderly handles real-time orders,
            table management and analytics so you can focus on hospitality — not paperwork.
          </p>
          <div className="lsh-btns">
            <MagBtn cls="lsh-btn-primary" onClick={boom}>Get started for free <span className="lsh-arrow">→</span></MagBtn>
            <MagBtn cls="lsh-btn-ghost"><span className="lsh-play-icon">▶</span>Watch demo</MagBtn>
          </div>
          <div className="lsh-proof">
            <div className="lsh-avs">
              {["SC","MR","AK","JP","TL"].map((a,i)=>(
                <span className="lsh-av" key={a} style={{zIndex:5-i}}>{a}</span>
              ))}
            </div>
            <div><div className="lsh-stars">★★★★★</div><div className="lsh-proof-txt"><strong>4.9</strong> · 1,200+ restaurants love us</div></div>
          </div>
        </div>

        <div className="lsh-right">
          <div className="lsh-mockup-wrap">
            <div className="lsh-badge lsh-badge-1">
              <span className="lsh-badge-icon">📈</span>
              <div><strong className="lsh-badge-strong">Revenue today</strong><div className="lsh-badge-sub">€4,812.50 <span className="lsh-chip green">↑ +31%</span></div></div>
            </div>
            <div className="lsh-badge lsh-badge-2">
              <span className="lsh-badge-icon">⚡</span>
              <div><strong className="lsh-badge-strong">127 orders today</strong><div className="lsh-badge-sub"><span className="lsh-live-dot"/>Live <span className="lsh-chip orange">Active</span></div></div>
            </div>

            <div className="lsh-tablet">
              <div className="lsh-screen">
                <div className="lsh-topbar">
                  <div className="lsh-topbar-dots"><span/><span/><span/></div>
                  <div className="lsh-topbar-title">Orderly Dashboard</div>
                  <div className="lsh-topbar-pills"><div className="lsh-tpill active">Today</div><div className="lsh-tpill">Week</div></div>
                </div>

                <div className="lsh-db-body">
                  {/* Sidebar — hidden on mobile via CSS, shown on desktop */}
                  <div className="lsh-sidebar">
                    <div className="lsh-sidebar-logo">
                      <img src={original_logo} alt="Orderly" className="lsh-sidebar-logo-img" />
                    </div>
                    {SECTIONS.map(s=>{
                      const tourI = TOUR_IDS.indexOf(s.id);
                      const isActive = s.id===currentId;
                      return (
                        <div
                          key={s.id}
                          className={`lsh-nav-item${isActive?" active":""}${tourI>=0?" clickable":""}`}
                          onClick={tourI>=0 ? ()=>goToSection(tourI) : undefined}
                        >
                          <span className="lsh-nav-icon">{s.icon}</span>
                          <span className="lsh-nav-label">{s.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="lsh-db-content">
                    {/* Mobile top nav — icon-only strip, shown only on mobile */}
                    <div className="lsh-mobile-nav">
                      {TOUR_IDS.map((id, i) => {
                        const sec = SECTIONS.find(s => s.id === id);
                        return (
                          <div
                            key={id}
                            className={`lsh-mobile-nav-item${i === tourIdx ? " active" : ""}`}
                            onClick={() => goToSection(i)}
                          >
                            <span className="lsh-mobile-nav-icon">{sec.icon}</span>
                            <span className="lsh-mobile-nav-label">{sec.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className={`lsh-screen-fade${visible?" lsh-screen-fade--in":" lsh-screen-fade--out"}`}>
                      {renderScreen()}
                    </div>
                    <div className="lsh-tour-dots">
                      {paused && <span className="lsh-tour-paused">▶ auto</span>}
                      {TOUR_IDS.map((id,i)=>(
                        <div key={id} className={`lsh-tour-dot${i===tourIdx?" lsh-tour-dot--active":""}`} onClick={()=>goToSection(i)}/>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <img src={mockup_menu} alt="App interface" className="lsh-iphone-img" />

          </div>
        </div>
      </div>

      <div className="lsh-trust">
        <div className="lsh-trust-logos">
          {TRUST_LOGOS.map((l,i)=><span key={i} className="lsh-trust-logo">{l}</span>)}
        </div>
      </div>
    </section>
  );
}