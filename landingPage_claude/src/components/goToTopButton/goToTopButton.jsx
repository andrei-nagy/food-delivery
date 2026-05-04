import React, { useState, useEffect } from "react";
import "./goToTopButton.css";

export default function GoToTopButton() {
  const [visible, setVisible]   = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.pageYOffset;
      const total    = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(scrolled > 320);
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      className={`gtt ${visible ? "gtt--on" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
    >
      <svg className="gtt__ring" viewBox="0 0 44 44">
        <circle className="gtt__track" cx="22" cy="22" r="19" />
        <circle
          className="gtt__fill"
          cx="22" cy="22" r="19"
          strokeDasharray={`${2 * Math.PI * 19}`}
          strokeDashoffset={`${2 * Math.PI * 19 * (1 - progress / 100)}`}
        />
      </svg>
      <span className="gtt__icon">↑</span>
    </button>
  );
}