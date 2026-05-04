import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./OrderToast.css";

/**
 * OrderToast — montat o singură dată în App.jsx (sau layout root)
 *
 * Events globale:
 *   window.dispatchEvent(new CustomEvent("order:placed",    { detail: { shortId: "A3F2" } }))
 *   window.dispatchEvent(new CustomEvent("order:delivered", { detail: { shortId: "A3F2" } }))
 *
 * order:placed    → verde, checkmark, "Vezi meniu" → /category/All
 * order:delivered → verde, checkmark, confetti slow, "Cheamă ospătar"
 */

/* ─────────────────────────────────────────────────────────
   Confetti canvas — viteza redusă, mișcare moale
───────────────────────────────────────────────────────── */
const COLORS = ["#3A7D50", "#6BCB77", "#FFD166", "#F97316", "#EF476F", "#118AB2", "#ffffff", "#a78bfa"];

function launchConfetti(canvas) {
  const ctx = canvas.getContext("2d");
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 90 }, () => ({
    x:    canvas.width / 2 + (Math.random() - 0.5) * 80,
    y:    canvas.height / 2,
    vx:   (Math.random() - 0.5) * 6,        // mai lent pe x
    vy:   -(Math.random() * 7 + 3),          // mai lent pe y
    rot:  Math.random() * 360,
    rotV: (Math.random() - 0.5) * 3.5,      // rotație mai înceată
    w:    Math.random() * 9 + 5,
    h:    Math.random() * 5 + 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: 1,
  }));

  let frame;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach((p) => {
      p.vy  += 0.18;          // gravitație mică → cădere lentă
      p.vx  *= 0.992;         // rezistență aer
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.rotV;
      if (p.y > canvas.height * 0.55) p.alpha -= 0.012; // fade mai lent
      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });
    if (alive) frame = requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

/* ─────────────────────────────────────────────────────────
   SVG checkmark
───────────────────────────────────────────────────────── */
const CheckIcon = () => (
  <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
    <circle cx="44" cy="44" r="44" fill="#3A7D50" />
    <polyline
      points="24,46 37,59 64,30"
      stroke="white"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ─────────────────────────────────────────────────────────
   Config per tip
───────────────────────────────────────────────────────── */
const CONFIG = {
  placed: {
    title:    "Comandă plasată!",
    sub:      (id) => `#${id} · Urmărești live statusul din aplicație`,
    btnKey:   "view_menu",
    btnRoute: "/category/All",
    confetti: false,
    duration: 6000,
  },
  delivered: {
    title:    "Gata, produsele au ajuns la tine! 🎉",
    sub:      () =>
      "Sperăm să te bucuri de ele. Dacă ai nevoie de ajutor, poți chema un ospătar!",
    btnKey:   "call_waiter",
    btnRoute: null,
    confetti: true,
    duration: 7000,
  },
};

/* ─────────────────────────────────────────────────────────
   ToastModal
───────────────────────────────────────────────────────── */
const ToastModal = ({ id, type, shortId, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const [barOn,   setBarOn]   = useState(false);
  const canvasRef             = useRef(null);
  const stopConfettiRef       = useRef(null);
  const navigate              = useNavigate();
  const { t }                 = useTranslation();

  const cfg      = CONFIG[type] ?? CONFIG.placed;
  const duration = cfg.duration;

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 30);
    const t2 = setTimeout(() => setBarOn(true),   80);
    const t3 = setTimeout(() => close(), duration);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    if (cfg.confetti && canvasRef.current) {
      const tid = setTimeout(() => {
        stopConfettiRef.current = launchConfetti(canvasRef.current);
      }, 250);
      return () => {
        clearTimeout(tid);
        stopConfettiRef.current?.();
      };
    }
  }, [cfg.confetti]);

  const close = () => {
    setVisible(false);
    stopConfettiRef.current?.();
    setTimeout(() => onRemove(id), 420);
  };

  const handleBtn = () => {
    if (cfg.btnRoute) {
      navigate(cfg.btnRoute);
    } else {
      window.dispatchEvent(new CustomEvent("waiter:call"));
    }
    close();
  };

  return (
    <div
      className={`ot-overlay${visible ? " ot-overlay--in" : ""}`}
      onClick={close}
    >
      {cfg.confetti && (
        <canvas
          ref={canvasRef}
          className="ot-confetti-canvas"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      <div
        className={`ot-modal${visible ? " ot-modal--in" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ot-icon-wrap">
          <CheckIcon />
        </div>

        <h2 className="ot-title">{cfg.title}</h2>
        <p  className="ot-sub">{cfg.sub(shortId)}</p>

        <button className="ot-btn" onClick={handleBtn}>
          {t(cfg.btnKey)}
        </button>

        <div className="ot-bar-wrap">
          <div
            className={`ot-bar${barOn ? " ot-bar--go" : ""}`}
            style={barOn ? { transitionDuration: `${duration - 80}ms` } : {}}
          />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Root — expus ca named export pentru ActiveOrder
   și ca default export pentru App.jsx
───────────────────────────────────────────────────────── */
export const useOrderToast = () => {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((type, shortId) => {
    setToasts([{ id: `${type}-${Date.now()}`, type, shortId }]);
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const renderToasts = () =>
    toasts.map((t) => (
      <ToastModal
        key={t.id}
        id={t.id}
        type={t.type}
        shortId={t.shortId}
        onRemove={remove}
      />
    ));

  return { add, renderToasts };
};

const OrderToast = () => {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((type, shortId) => {
    setToasts([{ id: `${type}-${Date.now()}`, type, shortId }]);
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const onPlaced    = (e) => add("placed",    e.detail?.shortId || "------");
    const onDelivered = (e) => add("delivered", e.detail?.shortId || "------");
    window.addEventListener("order:placed",    onPlaced);
    window.addEventListener("order:delivered", onDelivered);
    return () => {
      window.removeEventListener("order:placed",    onPlaced);
      window.removeEventListener("order:delivered", onDelivered);
    };
  }, [add]);

  return (
    <>
      {toasts.map((t) => (
        <ToastModal
          key={t.id}
          id={t.id}
          type={t.type}
          shortId={t.shortId}
          onRemove={remove}
        />
      ))}
    </>
  );
};

export default OrderToast;