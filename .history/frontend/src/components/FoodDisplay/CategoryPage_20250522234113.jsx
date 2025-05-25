import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import FoodItemCategory from '../FoodItem/FoodItemCategory';
import { FaArrowLeft } from 'react-icons/fa';
import './CategoryPage.css';

const CategoryPage = () => {
    const { categoryName } = useParams();
    const { food_list } = useContext(StoreContext);
    const navigate = useNavigate();
    const activeCategoryRef = useRef(null);

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const uniqueCategories = ['All', ...new Set(food_list.map(item => item.category))];
        setCategories(uniqueCategories);
    }, [food_list]);

    const filteredFood =
        categoryName === 'All'
            ? food_list
            : food_list.filter(item => item.category === categoryName);

    return (
        <div className="category-page">
            {/* Săgeată Back */}
            <button
                onClick={() => navigate(-1)}
                aria-label="Go back"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginBottom: '15px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#333',
                }}
            >
                <FaArrowLeft /> Back
            </button>

            {/* Meniu categorii */}
            <nav className="category-menu" style={{ marginBottom: '20px' }}>
            {categories.map(cat => (
  <Link
    key={cat}
    to={`/category/${encodeURIComponent(cat)}`}
    className={categoryName === cat ? 'active' : ''}
    style={{ marginRight: '15px' }}
    ref={categoryName === cat ? activeCategoryRef : null}
  >
    {cat}
  </Link>
))}
            </nav>

            {filteredFood.length > 0 ? (
                <div
                    className="food-list"
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}
                >
                    {filteredFood.map(item => (
                        <FoodItemCategory
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
