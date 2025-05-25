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
    const menuContainerRef = useRef(null);

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const uniqueCategories = ['All', ...new Set(food_list.map(item => item.category))];
        setCategories(uniqueCategories);
    }, [food_list]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [categoryName]);
    useEffect(() => {
        if (!categories.length) return; // nu face nimic dacă categoriile nu sunt încă populate
      
        const timeout = setTimeout(() => {
          if (activeCategoryRef.current && menuContainerRef.current) {
            const active = activeCategoryRef.current;
            const container = menuContainerRef.current;
      
            const offsetLeft = active.offsetLeft;
            const itemWidth = active.offsetWidth;
            const containerWidth = container.offsetWidth;
      
            container.scrollTo({
              left: offsetLeft - containerWidth / 2 + itemWidth / 2,
              behavior: 'smooth',
            });
          }
        }, 100); // așteptăm puțin până când DOM-ul e sigur gata
      
        return () => clearTimeout(timeout); // curățăm timeout-ul dacă componenta se re-renderizează
      }, [categoryName, categories]);
      
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
            <nav
                className="category-menu"
                ref={menuContainerRef}
                style={{
                    marginBottom: '20px',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    scrollBehavior: 'smooth',
                }}
            >
                {categories.map(cat => (
                    <Link
                        key={cat}
                        to={`/category/${encodeURIComponent(cat)}`}
                        className={categoryName === cat ? 'active' : ''}
                        style={{
                            marginRight: '15px',
                            textDecoration: 'none',
                            color: '#333',
                            fontWeight: categoryName === cat ? 'bold' : 'normal',
                        }}
                    >
                        <span
                            ref={categoryName === cat ? activeCategoryRef : null}
                            style={{
                                display: 'inline-block',
                                padding: '5px 10px',
                                borderBottom: categoryName === cat ? '2px solid #333' : 'none',
                            }}
                        >
                            {cat}
                        </span>
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
