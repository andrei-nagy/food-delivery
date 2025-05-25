import React, { useRef } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const CategoryMenu = ({ categories, activeCategory, onSelect }) => {
  const menuRef = useRef(null);

  const scrollLeft = () => {
    if (menuRef.current) {
      menuRef.current.scrollBy({ left: -150, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (menuRef.current) {
      menuRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  return (
    <div className="category-menu-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button
        className="scroll-btn left"
        onClick={scrollLeft}
        aria-label="Scroll left"
        style={{
          position: 'absolute',
          left: 0,
          zIndex: 10,
          background: 'white',
          border: 'none',
          cursor: 'pointer',
          padding: '5px',
        }}
      >
        <FaArrowLeft />
      </button>

      <nav
        className="category-menu"
        ref={menuRef}
        style={{
          overflowX: 'auto',
          display: 'flex',
          gap: '15px',
          maxWidth: '100%',
          padding: '8px 40px', // ca sa lase loc pentru sageti
          scrollBehavior: 'smooth',
        }}
      >
        {categories.map((cat) => (
          <a
            key={cat}
            href="#!"
            className={cat === activeCategory ? 'active' : ''}
            onClick={() => onSelect(cat)}
            style={{
              whiteSpace: 'nowrap',
              padding: '5px 10px',
              textDecoration: 'none',
              color: '#333',
              fontWeight: cat === activeCategory ? '700' : '500',
              borderBottom: cat === activeCategory ? '2px solid black' : 'none',
              flexShrink: 0,
            }}
          >
            {cat}
          </a>
        ))}
      </nav>

      <button
        className="scroll-btn right"
        onClick={scrollRight}
        aria-label="Scroll right"
        style={{
          position: 'absolute',
          right: 0,
          zIndex: 10,
          background: 'white',
          border: 'none',
          cursor: 'pointer',
          padding: '5px',
        }}
      >
        <FaArrowRight />
      </button>
    </div>
  );
};

export default CategoryMenu;
