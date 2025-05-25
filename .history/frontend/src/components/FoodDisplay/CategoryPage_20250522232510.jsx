import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import './CategoryPage.css'; // stiluri dedicate dacă dorești

const CategoryPage = () => {
  const { categoryName } = useParams();
  const { food_list } = useContext(StoreContext);

  const [categories, setCategories] = useState([]);

  // Obține lista unică de categorii (pentru meniu)
  useEffect(() => {
    const uniqueCategories = [...new Set(food_list.map(item => item.category))];
    setCategories(uniqueCategories);
  }, [food_list]);

  // Filtrează produsele după categoria din URL
  const filteredFood = food_list.filter(item => item.category === categoryName);

  return (
    <div className="category-page">
      {/* Meniu categorii */}
      <nav className="category-menu" style={{ marginBottom: '20px' }}>
        <Link
          to="/"
          className={categoryName === 'All' ? 'active' : ''}
          style={{ marginRight: '15px' }}
        >
          All
        </Link>
        {categories.map(cat => (
          <Link
            key={cat}
            to={`/category/${encodeURIComponent(cat)}`}
            className={categoryName === cat ? 'active' : ''}
            style={{ marginRight: '15px' }}
          >
            {cat}
          </Link>
        ))}
      </nav>

      <h2 style={{ marginBottom: '20px' }}>{categoryName}</h2>

      {filteredFood.length > 0 ? (
        <div className="food-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {filteredFood.map(item => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description.length > 50 ? item.description.slice(0, 70) + '...' : item.description}
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
