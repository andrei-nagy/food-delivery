import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import FoodItemCategory from '../FoodItem/FoodItemCategory';
import { FaArrowLeft } from 'react-icons/fa';
import './CategoryPage.css';
import FoodModal from '../FoodItem/FoodModal';

const CategoryPage = () => {
    const { categoryName } = useParams();
    const { food_list } = useContext(StoreContext);
    const navigate = useNavigate();
    const activeCategoryRef = useRef(null);
    const menuContainerRef = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const [categories, setCategories] = useState([]);
    const [selectedFood, setSelectedFood] = useState(null);

    useEffect(() => {
        const uniqueCategories = ['All', ...new Set(food_list.map(item => item.category))];
        setCategories(uniqueCategories);
    }, [food_list]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [categoryName]);

    useEffect(() => {
        if (!categories.length) return;

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
        }, 100);

        return () => clearTimeout(timeout);
    }, [categoryName, categories]);

    const filteredFood =
        categoryName === 'All'
            ? food_list
            : food_list.filter(item => item.category === categoryName);

    return (
        <div className="category-page">
            <button
                onClick={() => navigate('/')}
                aria-label="Go back"
                className="back-button"
            >
                <FaArrowLeft /> Back
            </button>

            <nav className="category-menu" ref={menuContainerRef}>
                {categories.map(cat => (
                    <Link
                        key={cat}
                        to={`/category/${encodeURIComponent(cat)}`}
                        className={categoryName === cat ? 'active' : ''}
                    >
                        <span
                            ref={categoryName === cat ? activeCategoryRef : null}
                            className="category-tab"
                        >
                            {cat}
                        </span>
                    </Link>
                ))}
            </nav>

            {filteredFood.length > 0 ? (
                <div className="food-list">
                {filteredFood.map(item => (
                  <div key={item._id} onClick={() => setSelectedItem(item)}>
                    <FoodItemCategory
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
                  </div>
                ))}
              </div>
              
            ) : (
                <p>No items found for this category.</p>
            )}

            {selectedFood && (
                <FoodModal item={selectedFood} onClose={() => setSelectedFood(null)} />
            )}
        </div>
    );
};

export default CategoryPage;
