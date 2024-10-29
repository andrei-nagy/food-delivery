import { useEffect, useRef } from "react";

const useGradientUpdater = () => {
  const gradientRefs = useRef([]);

  useEffect(() => {
    const updateGradients = () => {
      gradientRefs.current.forEach((html, index) => {
        if (html) {
          const angle = (performance.now() / 10 + index * 120) % 360;
          // Modifică gradientul cu nuanțe de portocaliu
          // html.style.backgroundImage = `linear-gradient(${angle}deg, rgba(255, 183, 94, 1) 0%, rgba(255, 94, 0, 1) 50%, rgba(255, 165, 0, 1) 100%)`;
          html.style.backgroundImage = `white`
        }
      });
      requestAnimationFrame(updateGradients);
    };
    requestAnimationFrame(updateGradients);
    return () => {};
  }, []);

  return gradientRefs;
};

export default useGradientUpdater;
