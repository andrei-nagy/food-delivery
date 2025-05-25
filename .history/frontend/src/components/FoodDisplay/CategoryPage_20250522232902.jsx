import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import './CategoryPage.css'; // stiluri dedicate dacă dorești

const CategoryPage = () => {
  const { categoryName } = useParams();
  const { food_list } = useContext(StoreContext);

  const [categories, setCategories] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    const uniqueCategories = ['All', ...new Set(food_list.map(item => item.category))];
    setCategories(uniqueCategories);
  }, [food_list]);

  const filteredFood =
    categoryName === 'All'
      ? food_list
      : food_list.filter(item => item.category === categoryName);

  // Funcții scroll săgeți
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
    <div className="category-page">
      {/* Meniu categorii cu scroll orizontal */}
      <div className="category-menu-wrapper" style={{ position: 'relative', marginBottom: '20px' }}>
        <button
          onClick={scrollLeft}
          className="scroll-btn left"
          aria-label="Scroll left"
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'white',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            boxShadow: '0 0 5px rgba(0,0,0,0.1)'
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
            padding: '8px 40px',
            scrollBehavior: 'smooth',
            whiteSpace: 'nowrap',
          }}
        >
          {categories.map(cat => (
            <Link
              key={cat}
              to={cat === 'All' ? '/' : `/category/${encodeURIComponent(cat)}`}
              className={categoryName === cat ? 'active' : ''}
              style={{
                padding: '5px 10px',
                textDecoration: 'none',
                color: categoryName === cat ? '#000' : '#666',
                fontWeight: categoryName === cat ? '700' : '500',
                borderBottom: categoryName === cat ? '2px solid black' : 'none',
                flexShrink: 0,
                userSelect: 'none',
              }}
            >
              {cat}
            </Link>
          ))}
        </nav>

        <button
          onClick={scrollRight}
          className="scroll-btn right"
          aria-label="Scroll right"
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'white',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            boxShadow: '0 0 5px rgba(0,0,0,0.1)'
          }}
        >
          <FaArrowRight />
        </button>
      </div>

      <h2 style={{ marginBottom: '20px' }}>{categoryName}</h2>

      {filteredFood.length > 0 ? (
        <div className="food-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {filteredFood.map(item => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={
                item.description.length > 50
                  ? item.description.slice(0, 70) + '...'
                  : item.description
              }
              price={item.price}
              image={item.image}
              isBestSeller={item.isBestSeller}
              isNewAdded={item.isNewAdded}
              isVegan={item.isVegan}
              category={item.category}
            />
          ))}
        </div>
      ) : (
        <p>No items found for this category.</p>
      )}
    </div>
  );
};

export default CategoryPage;
