import React, { useState, useEffect } from "react";
import "./DeliveryToast.css";

/**
 * Toast vizual custom — pill negru jos, fără modal.
 *
 * Props:
 *  - shortId   : string  — ID-ul scurt al comenzii / produsului
 *  - onDone    : fn      — callback după ce toast-ul dispare
 *  - type      : "delivered" | "placed" | "added"
 *  - title     : string  — titlu override (opțional)
 *  - subtitle  : string  — subtitlu override (opțional)
 *  - duration  : number  — ms până dispare (default automat per tip)
 */
const DeliveryToast = ({
  shortId,
  onDone,
  type = "delivered",
  title,
  subtitle,
  duration,
}) => {
  const [visible, setVisible] = useState(false);

  const isPlaced    = type === "placed";
  const isAdded     = type === "added";
  const isDelivered = type === "delivered";

  const defaultDuration = isPlaced ? 5500 : isAdded ? 2800 : 4200;
  const finalDuration   = duration ?? defaultDuration;

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 60);
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 420);
    }, finalDuration);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const Icon = () => {
    if (isAdded) return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    );
    if (isPlaced) return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4"/>
        <path d="M20 12a8 8 0 11-16 0 8 8 0 0116 0z"/>
      </svg>
    );
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 12 9 17 20 7"/>
      </svg>
    );
  };

  const defaultTitle = isAdded
    ? "Adăugat în coș! 🛒"
    : isPlaced
    ? "Comandă plasată! 🎉"
    : "Comandă livrată!";

  const defaultSubtitle = isAdded
    ? shortId
    : isPlaced
    ? `#${shortId} · Urmărești live statusul`
    : `#${shortId} a ajuns la masă 🍽️`;

  return (
    <div
      className={[
        "ao-toast",
        visible     ? "ao-toast--in"       : "",
        isPlaced    ? "ao-toast--placed"   : "",
        isAdded     ? "ao-toast--added"    : "",
        isDelivered ? "ao-toast--delivered": "",
      ].filter(Boolean).join(" ")}
    >
      <div className="ao-toast-ico"><Icon /></div>
      <div className="ao-toast-txt">
        <span className="ao-toast-title">{title    ?? defaultTitle}</span>
        <span className="ao-toast-sub">{subtitle ?? defaultSubtitle}</span>
      </div>
    </div>
  );
};

export default DeliveryToast;