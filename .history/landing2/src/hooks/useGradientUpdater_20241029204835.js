import { useEffect, useRef } from "react";

const useGradientUpdater = () => {
  const gradientRefs = useRef([]);

  useEffect(() => {
    const updateGradients = () => {
      gradientRefs.current.forEach((html, index) => {
        if (html) {
          const angle = (performance.now() / 10 + index * 120) % 360;
          // Modifică gradientul cu nuanțe de portocaliu
          html.style.backgroundImage = `linear-gradient(${angle}deg, rgba(255, 102, 102, 1) 0%, rgba(255, 0, 0, 1) 50%, rgba(153, 0, 0, 1) 100%)`;
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
