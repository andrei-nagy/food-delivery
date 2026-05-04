import React, { useState, useEffect, useRef } from "react";
import { useReveal } from "../UseReveal/UseReveal";
import "./Hero.css";

const WORDS = ["restaurants", "bistros", "brasseries", "cafés", "hotels"];

const TEXT_LOGOS = [
  "Le Bernardin", "Nobu", "The Ivy", "Sketch", "Brasserie Lipp",
  "El Celler", "Zuma", "Noma", "Osteria Francescana", "Eleven Madison",
  "Geranium", "Mirazur", "Central", "Disfrutar", "Alain Ducasse",
];

function CardDashboard() {
  return (
    <div className="hsc">
      <div className="hsc__kpis">
        {[["€4,812","Revenue","↑ 31%","#E65C19"],
          ["127","Orders","↑ 24","#3B82F6"],
          ["€38","Avg ticket","→","#10B981"]].map(([v,l,d,c]) => (
          <div className="hsc__kpi" key={l}>
            <span className="hsc__kpi-v" style={{color:c}}>{v}</span>
            <span className="hsc__kpi-l">{l}</span>
            <span className="hsc__kpi-d">{d}</span>
          </div>
        ))}
      </div>
      <svg className="hsc__chart" viewBox="0 0 280 44" preserveAspectRatio="none">
        <defs>
          <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E65C19" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#E65C19" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d="M0,38 C35,30 70,14 110,10 C148,6 172,20 205,12 C228,6 252,2 280,5 L280,44 L0,44Z" fill="url(#cg1)"/>
        <path d="M0,38 C35,30 70,14 110,10 C148,6 172,20 205,12 C228,6 252,2 280,5" fill="none" stroke="#E65C19" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="268" cy="4" r="3" fill="#E65C19"/>
        <circle cx="268" cy="4" r="7" fill="#E65C19" opacity="0.15"/>
      </svg>
      <div className="hsc__orders">
        {[["🥩","Wagyu Ribeye","T-04","Cooking","#F97316"],
          ["🍝","Pasta Tartufo","T-11","Ready","#22C55E"],
          ["🫙","Burrata","T-02","New","#6366F1"]].map(([e,n,t,s,c]) => (
          <div className="hsc__order" key={n}>
            <span>{e}</span>
            <span className="hsc__order-n">{n}</span>
            <span className="hsc__order-t">{t}</span>
            <span className="hsc__order-s" style={{color:c,background:c+"18"}}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardOrders() {
  return (
    <div className="hsc">
      <div className="hsc__section-label">Live Orders · Today</div>
      {[["🥩","Wagyu Ribeye","T-04","€42","Cooking","#F97316"],
        ["🍝","Pasta Tartufo","T-11","€28","Ready","#22C55E"],
        ["🫙","Burrata","T-02","€18","New","#6366F1"],
        ["🍷","Barolo 2018","T-08","€32","Served","#10B981"],
        ["🍋","Limoncello","T-03","€8","New","#6366F1"],
      ].map(([e,n,t,p,s,c]) => (
        <div className="hsc__table-row" key={n}>
          <span className="hsc__tr-name"><span>{e}</span>{n}</span>
          <span className="hsc__tr-t">{t}</span>
          <span className="hsc__tr-p">{p}</span>
          <span className="hsc__tr-s" style={{color:c,background:c+"18"}}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function CardAnalytics() {
  return (
    <div className="hsc">
      <div className="hsc__section-label">Analytics · This Week</div>
      <div className="hsc__an-stats">
        {[["€34,218","Weekly revenue","#7C3AED"],
          ["↑ 24%","vs last week","#10B981"],
          ["891","Total orders","#3B82F6"]].map(([v,l,c]) => (
          <div className="hsc__an-stat" key={l}>
            <span style={{color:c}}>{v}</span>
            <span>{l}</span>
          </div>
        ))}
      </div>
      <div className="hsc__bars">
        {[["M",65],["T",82],["W",48],["T",91],["F",73],["S",88],["S",100]].map(([d,h],i) => (
          <div className="hsc__bar-col" key={i}>
            <div className="hsc__bar-track">
              <div className="hsc__bar-fill" style={{height:`${h}%`,background:i===6?"#7C3AED":"rgba(124,58,237,0.22)"}}/>
            </div>
            <span className="hsc__bar-d">{d}</span>
          </div>
        ))}
      </div>
      <div className="hsc__an-winner">
        <span>🏆</span>
        <div><strong>Best seller</strong><span>Wagyu Ribeye · 34 orders</span></div>
      </div>
    </div>
  );
}

function CardMenu() {
  return (
    <div className="hsc">
      <div className="hsc__section-label">QR Menu · Live</div>
      <div className="hsc__menu-cats">
        {["Starters","Mains","Desserts","Drinks"].map((c,i) => (
          <span key={c} className={`hsc__menu-cat${i===1?" hsc__menu-cat--on":""}`}>{c}</span>
        ))}
      </div>
      {[["🥩","Wagyu Ribeye","€42","Chef's Pick","#E65C19"],
        ["🫙","Burrata Pomodoro","€18","Vegan","#10B981"],
        ["🍝","Pasta al Tartufo","€28","Popular","#3B82F6"],
        ["🦞","Lobster Bisque","€36","New","#F97316"],
      ].map(([e,n,p,tag,c]) => (
        <div className="hsc__menu-item" key={n}>
          <span className="hsc__menu-e">{e}</span>
          <div className="hsc__menu-info">
            <span className="hsc__menu-n">{n}</span>
            <span className="hsc__menu-tag" style={{color:c,background:c+"15"}}>{tag}</span>
          </div>
          <span className="hsc__menu-p">{p}</span>
        </div>
      ))}
    </div>
  );
}

function CardStaff() {
  return (
    <div className="hsc">
      <div className="hsc__section-label">Staff · Active Now</div>
      {[["Sofia M.","Waiter","T-04, T-05","🟢","#E65C19"],
        ["Marco R.","Admin","Dashboard","🟢","#3B82F6"],
        ["Ana P.","Waiter","T-01, T-11","🟡","#10B981"],
        ["Luca D.","Chef","Kitchen","🟢","#F59E0B"],
      ].map(([n,r,a,dot,c]) => (
        <div className="hsc__staff-row" key={n}>
          <span className="hsc__staff-av" style={{background:c+"1a",color:c}}>{n[0]}</span>
          <div className="hsc__staff-info">
            <span>{n}</span>
            <span className="hsc__staff-r">{r}</span>
          </div>
          <span className="hsc__staff-a">{a}</span>
          <span>{dot}</span>
        </div>
      ))}
      <div className="hsc__staff-note">✓ All permissions verified</div>
    </div>
  );
}

const SCREENS = [
  { id:0, label:"Live Dashboard",   color:"#E65C19", comp:<CardDashboard /> },
  { id:1, label:"Order Management", color:"#3B82F6", comp:<CardOrders />    },
  { id:2, label:"Analytics",        color:"#7C3AED", comp:<CardAnalytics />  },
  { id:3, label:"QR Menu",          color:"#10B981", comp:<CardMenu />       },
  { id:4, label:"Staff Control",    color:"#F59E0B", comp:<CardStaff />      },
];
const N = SCREENS.length;

export default function Hero2({ logos }) {
  const revealRef = useReveal();
  const logosRef  = useReveal();

  const [wIdx, setWIdx] = useState(0);
  const [fade, setFade] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setFade(true);
      setTimeout(() => { setWIdx(p => (p+1) % WORDS.length); setFade(false); }, 280);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const [current,   setCurrent]   = useState(0);
  const [mobileIdx, setMobileIdx] = useState(0);
  const autoRef  = useRef(null);
  const dragX    = useRef(null);
  const didDrag  = useRef(false);

  const resetAuto = () => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setCurrent(p => {
        const next = (p + 1) % N;
        setMobileIdx(next);
        return next;
      });
    }, 3500);
  };
  useEffect(() => { resetAuto(); return () => clearInterval(autoRef.current); }, []);

  const goTo = (i) => { setCurrent(i); setMobileIdx(i); resetAuto(); };
  const prev = () => { const i = (current - 1 + N) % N; goTo(i); };
  const next = () => { const i = (current + 1) % N;     goTo(i); };

  const onPointerDown = (e) => { dragX.current = e.clientX; didDrag.current = false; };
  const onPointerUp   = (e) => {
    if (dragX.current === null) return;
    const dx = e.clientX - dragX.current;
    if (Math.abs(dx) > 40) { didDrag.current = true; dx < 0 ? next() : prev(); }
    dragX.current = null;
  };

  const getPosClass = (idx) => {
    const diff = ((idx - current) % N + N) % N;
    if (diff === 0)     return "pos-active";
    if (diff === 1)     return "pos-right1";
    if (diff === 2)     return "pos-right2";
    if (diff === N - 1) return "pos-left1";
    if (diff === N - 2) return "pos-left2";
    return "pos-hidden";
  };

  const active    = SCREENS[current];
  const logoItems = logos || TEXT_LOGOS;

  return (
    <section className="hero2" id="home" ref={revealRef}>
      <div className="hero2__inner">

        {/* ── LEFT ── */}
        <div className="hero2__left">
          <div className="hero2__kicker">
            <span className="hero2__kicker-line" />
            Restaurant OS
            <span className="hero2__kicker-line" />
          </div>

          <h1 className="hero2__h1 reveal reveal-delay-1">
            Orders & tables
            <span className="hero2__h1-line2">
              for{" "}
              <span className="hero2__word-wrap">
                <em className={`hero2__word ${fade ? "hero2__word--out" : "hero2__word--in"}`}>
                  {WORDS[wIdx]}
                </em>
              </span>
            </span>
          </h1>

          <p className="hero2__desc reveal reveal-delay-2">
            Orderly is your all-in-one restaurant OS — real-time orders,
            table management and analytics so you can focus on hospitality,
            not paperwork.
          </p>

          <div className="hero2__btns reveal reveal-delay-3">
            <button className="hero2__btn-primary">
              Get started free <span className="hero2__btn-arr">→</span>
            </button>
            <button className="hero2__btn-ghost">
              <span className="hero2__play">▶</span> Watch demo
            </button>
          </div>

          <div className="hero2__proof reveal reveal-delay-4">
            <div className="hero2__avs">
              {["SC","MR","AK","JP","TL"].map((a,i) => (
                <span key={a} className="hero2__av" style={{zIndex:5-i}}>{a}</span>
              ))}
            </div>
            <div>
              <div className="hero2__stars">★★★★★</div>
              <div className="hero2__proof-txt"><strong>4.9</strong> · Average rating</div>
            </div>
          </div>

          <div className="hero2__screen-ind reveal reveal-delay-4">
            <span className="hero2__screen-dot" style={{background: active.color}} />
            <span className="hero2__screen-name" style={{color: active.color}}>{active.label}</span>
          </div>

          <div className="hero2__controls reveal reveal-delay-5">
            <button className="hero2__ctrl" onClick={prev}>←</button>
            <div className="hero2__dots">
              {SCREENS.map((s,i) => (
                <button
                  key={s.id}
                  className={`hero2__dot${i === current ? " hero2__dot--on" : ""}`}
                  style={i === current ? {background: active.color, width:"24px"} : {}}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
            <button className="hero2__ctrl" onClick={next}>→</button>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="hero2__right reveal reveal-delay-2">

          {/* Desktop carousel */}
          <div
            className="hero2__stage hero2__stage--desktop"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            {SCREENS.map((screen) => {
              const posClass = getPosClass(screen.id);
              return (
                <div
                  key={screen.id}
                  className={`hero2__card ${posClass}`}
                  onClick={() => {
                    if (!didDrag.current && posClass !== "pos-active") goTo(screen.id);
                  }}
                >
                  <div className="hero2__card-strip" style={{background: screen.color}} />
                  <div className="hero2__card-chrome">
                    <div className="hero2__card-dots"><span/><span/><span/></div>
                    <span className="hero2__card-title">{screen.label}</span>
                    <span className="hero2__card-live"
                      style={{color: screen.color, background: screen.color+"18"}}>● Live</span>
                  </div>
                  <div className="hero2__card-body">{screen.comp}</div>
                  <div className="hero2__card-foot"
                    style={{background: screen.color+"0d", borderTopColor: screen.color+"28"}}>
                    <span style={{color: screen.color+"bb"}}>Orderly · {screen.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile gallery */}
          <div className="hero2__mobile-gallery">
            <div className="hero2__mg-tabs">
              {SCREENS.map((s, i) => (
                <button
                  key={s.id}
                  className={`hero2__mg-tab${mobileIdx === i ? " hero2__mg-tab--on" : ""}`}
                  style={mobileIdx === i ? { borderColor: s.color, color: s.color } : {}}
                  onClick={() => goTo(i)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="hero2__mg-card">
              <div className="hero2__card-strip" style={{background: SCREENS[mobileIdx].color}} />
              <div className="hero2__card-chrome">
                <div className="hero2__card-dots"><span/><span/><span/></div>
                <span className="hero2__card-title">{SCREENS[mobileIdx].label}</span>
                <span className="hero2__card-live"
                  style={{color: SCREENS[mobileIdx].color, background: SCREENS[mobileIdx].color+"18"}}>● Live</span>
              </div>
              <div className="hero2__card-body">{SCREENS[mobileIdx].comp}</div>
              <div className="hero2__card-foot"
                style={{background: SCREENS[mobileIdx].color+"0d", borderTopColor: SCREENS[mobileIdx].color+"28"}}>
                <span style={{color: SCREENS[mobileIdx].color+"bb"}}>Orderly · {SCREENS[mobileIdx].label}</span>
              </div>
            </div>
          </div>

          <div className="hero2__badge hero2__badge--1">
            <span>📈</span>
            <div>
              <strong>Revenue today</strong>
              <span>€4,812 <em>↑ +31%</em></span>
            </div>
          </div>
          <div className="hero2__badge hero2__badge--2">
            <span>⚡</span>
            <div>
              <strong>127 orders</strong>
              <span><span className="hero2__live-dot" /> Active now</span>
            </div>
          </div>
        </div>

      </div>

      {/* Logos strip */}
      <div className="hero2__logos" ref={logosRef}>
        <p className="hero2__logos-hdr">Trusted by 2,000+ restaurants worldwide</p>
        <div className="hero2__logos-wrap">
          <div className="hero2__logos-track">
            {[...logoItems, ...logoItems].map((item, i) => (
              <div className="hero2__logos-item" key={i} aria-hidden={i >= logoItems.length}>
                {typeof item === "string"
                  ? <span className="hero2__logos-text">{item}</span>
                  : <img className="hero2__logos-img" src={item} alt="" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}