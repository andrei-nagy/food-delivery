import React, { useEffect, useState, useRef } from "react";
import "./ConfirmModal.css";

/**
 * ConfirmModal — modal grafic cu checkmark verde, identic ca stil cu OrderToast.
 *
 * Props:
 *  - show      : boolean
 *  - title     : string
 *  - subtitle  : string
 *  - icon      : "check" | "bell" | "card" | "cash"  (default "check")
 *  - duration  : number (ms, default 4500) — 0 = nu se închide automat
 *  - onClose   : fn
 */

/* ─── Icons ─── */
const CheckCircle = ({ color = "#3A7D50" }) => (
  <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
    <circle cx="44" cy="44" r="44" fill={color} />
    <polyline points="24,46 37,59 64,30"
      stroke="white" strokeWidth="6"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BellCircle = () => (
  <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
    <circle cx="44" cy="44" r="44" fill="#3A7D50" />
    <path d="M44 26c-8 0-13 5.4-13 12v8l-3 4h32l-3-4v-8c0-6.6-5-12-13-12z"
      stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M40 58a4 4 0 0 0 8 0" stroke="white" strokeWidth="3"
      strokeLinecap="round" fill="none" />
  </svg>
);

const CardCircle = () => (
  <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
    <circle cx="44" cy="44" r="44" fill="#1D4ED8" />
    <rect x="24" y="33" width="40" height="26" rx="4"
      stroke="white" strokeWidth="3" fill="none" />
    <line x1="24" y1="43" x2="64" y2="43" stroke="white" strokeWidth="3" />
    <rect x="29" y="50" width="10" height="4" rx="1" fill="white" />
  </svg>
);

const CashCircle = () => (
  <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
    <circle cx="44" cy="44" r="44" fill="#15803D" />
    <rect x="22" y="34" width="44" height="26" rx="4"
      stroke="white" strokeWidth="3" fill="none" />
    <circle cx="44" cy="47" r="6" stroke="white" strokeWidth="3" fill="none" />
    <line x1="30" y1="34" x2="30" y2="60" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
    <line x1="58" y1="34" x2="58" y2="60" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
  </svg>
);

const ICONS = {
  check: <CheckCircle />,
  bell:  <BellCircle />,
  card:  <CardCircle />,
  cash:  <CashCircle />,
};

const ConfirmModal = ({ show, title, subtitle, icon = "check", duration = 4500, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [barOn,   setBarOn]   = useState(false);
  const timerRef              = useRef(null);

  useEffect(() => {
    if (!show) { setVisible(false); setBarOn(false); return; }

    const t1 = setTimeout(() => setVisible(true), 30);
    const t2 = setTimeout(() => setBarOn(true),   80);

    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 400);
      }, duration);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(timerRef.current);
    };
  }, [show]);

  const close = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(onClose, 400);
  };

  if (!show) return null;

  return (
    <div
      className={`cm-overlay${visible ? " cm-overlay--in" : ""}`}
      onClick={close}
    >
      <div
        className={`cm-modal${visible ? " cm-modal--in" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cm-icon-wrap">
          {ICONS[icon] ?? ICONS.check}
        </div>

        <h2 className="cm-title">{title}</h2>
        <p  className="cm-sub">{subtitle}</p>

        <button className="cm-btn" onClick={close}>OK</button>

        {duration > 0 && (
          <div className="cm-bar-wrap">
            <div
              className={`cm-bar${barOn ? " cm-bar--go" : ""}`}
              style={barOn ? { transitionDuration: `${duration - 80}ms` } : {}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmModal;