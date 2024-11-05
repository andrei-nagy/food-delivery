import React, { useState, useEffect, useLayoutEffect, useRef } from "https://cdn.skypack.dev/react";
import ReactDOM from "https://cdn.skypack.dev/react-dom";
import "./App.css"; // Ensure you have the CSS file

const slides = [
  {
    image: "https://images.unsplash.com/photo-1614983646436-b3d7a8398b3f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&ixid=MnwxNDU4OXwwfDF8cmFuZG9tfHx8fHx8fHx8MTYxNTU4MTkxNA&ixlib=rb-1.2.1&q=80&w=400&h=600",
    title: "Animation"
  },
  {
    image: "https://images.unsplash.com/photo-1615421559287-5e6eecec3b80?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&ixid=MnwxNDU4OXwwfDF8cmFuZG9tfHx8fHx8fHx8MTYxNTU4MjAwOQ&ixlib=rb-1.2.1&q=80&w=400&h=600",
    title: "CSS"
  },
  {
    image: "https://images.unsplash.com/photo-1615098270177-e2db45986811?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&ixid=MnwxNDU4OXwwfDF8cmFuZG9tfHx8fHx8fHx8MTYxNTU4MjAwOQ&ixlib=rb-1.2.1&q=80&w=400&h=600",
    title: "HTML"
  },
  {
    image: "https://images.unsplash.com/photo-1615114814213-a245ffc79e9a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&ixid=MnwxNDU4OXwwfDF8cmFuZG9tfHx8fHx8fHx8MTYxNTU4MjAwOQ&ixlib=rb-1.2.1&q=80&w=400&h=600",
    title: "React"
  }
];

function getRect(el) {
  return el.getBoundingClientRect();
}

function flip(firstRect, el) {
  requestAnimationFrame(() => {
    const lastEl = el;
    const lastRect = getRect(lastEl);
    const dx = lastRect.x - firstRect.x;
    const dy = lastRect.y - firstRect.y;
    const dw = lastRect.width / firstRect.width;
    const dh = lastRect.height / firstRect.height;
    lastEl.dataset.flipping = true;
    lastEl.style.setProperty("--dx", dx);
    lastEl.style.setProperty("--dy", dy);
    lastEl.style.setProperty("--dw", dw);
    lastEl.style.setProperty("--dh", dh);
    requestAnimationFrame(() => delete lastEl.dataset.flipping);
  });
}

function useFlip(ref) {
  const rectRef = useRef(null);
  useLayoutEffect(() => {
    if (ref.current) {
      if (!rectRef.current) {
        rectRef.current = getRect(ref.current);
      }
      flip(rectRef.current, ref.current);
      rectRef.current = getRect(ref.current);
    }
  });
}

function useKeyDown(onKeyDown) {
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}

function AdminGallery() {
  const [selected, setSelected] = useState(0);

  useKeyDown((event) => {
    switch (event.key) {
      case "ArrowRight":
        setSelected((selected) => (selected + 1) % slides.length);
        break;
      case "ArrowLeft":
        setSelected((selected) => (slides.length + (selected - 1)) % slides.length);
        break;
      default:
        break;
    }
  });

  return (
    <div className="app">
      <h1>@keyframers</h1>
      <div className="gallery">
        {slides.map((slide, index) => {
          const isSelected = index === selected;
          return (
            <div
              className={`image ${isSelected ? 'selected' : ''}`}
              key={index}
              onClick={() => setSelected(index)}
            >
              <img data-flip src={slide.image} />
              <span className="title" data-flip>
                <strong>{slide.title}</strong> 2021
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminGallery; // Added export default

 