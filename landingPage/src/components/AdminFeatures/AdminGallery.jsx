import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import './AdminGallery.css'; // Ensure you have the CSS file
import analytics_admin from "../../assets/analytics_admin.png"; // Exemplu de imagine
import sales_admin from "../../assets/sales_admin.png"; // Exemplu de imagine
import ticketing_admin from "../../assets/ticketing_admin.png"; // Exemplu de imagine
import orders_admin from "../../assets/orders_admin.png"; // Exemplu de imagine
import laptop_front from "../../assets/laptop_front.png"

 

const slides = [
  {
    image: orders_admin,
 
  },
  {
    image: sales_admin,
 
  },
  {
    image: analytics_admin,

  },
  {
    image: ticketing_admin,
   
  },
  
  {
    image: laptop_front,
   
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
  }, [ref]); // Add ref as dependency
}

function useKeyDown(onKeyDown) {
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]); // Add onKeyDown as dependency
}

function ImageTitle(props) {
  const ref = useRef(null);
  useFlip(ref);

  return <span {...props} ref={ref} data-flip className="title" />;
}

function Image({ src, title, selected, ...props }) {
  const ref = useRef(null);
  useFlip(ref);

  return (
    <div
      {...props}
      className={`image_adminGallery ${selected ? 'selected' : ''}`}  // Modificare aici

      key={src}
      data-selected={selected || undefined}
    >
      <img data-flip src={src} ref={ref} alt={title} />
      {/* <ImageTitle>
        <strong>{title}</strong> 2021
      </ImageTitle> */}
    </div>
  );
}

function AdminGallery() {
  const [selected, setSelected] = useState(0);

  useKeyDown((event) => {
    switch (event.key) {
      case "ArrowRight":
        setSelected((selected) => (selected + 1) % slides.length);
        break;
      case "ArrowLeft":
        setSelected(
          (selected) => (slides.length + (selected - 1)) % slides.length
        );
        break;
      default:
        break;
    }
  });

  return (
    <div className="app">

      <div className="gallery">
        {slides.map((slide, index) => {
          return (
            <Image
              src={slide.image}
              title={slide.title}
              selected={index === selected}
              key={index}
         
              onClick={() => setSelected(index)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default AdminGallery;
