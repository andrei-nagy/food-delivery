import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { FaArrowLeft } from 'react-icons/fa';
import './CategoryPage.css';

const FoodItemCategory = ({
    id,
    name,
    description,
    price,
    image,
    isBestSeller,
    isNewAdded,
    isVegan,
    onClick
}) => {
    return (
        <div className="food-item" onClick={onClick} style={{ cursor: 'pointer' }}>
            <img src={`/images/${image}`} alt={name} />
            <h3>{name}</h3>
            <p>{description}</p>
            <p><strong>{price} €</strong></p>
            {isBestSeller && <span className="badge best-seller">Best Seller</span>}
            {isNewAdded && <span className="badge new">New</span>}
            {isVegan && <span className="badge vegan">Vegan</span>}
        </div>
    );
};

const CategoryPage = () => {
    const { categoryName } = useParams();
    const { food_list, addToCart } = useContext(StoreContext);
    const navigate = useNavigate();
    const activeCategoryRef = useRef(null);
    const menuContainerRef = useRef(null);
    const [categories, setCategories] = useState([]);
    const [selectedFood, setSelectedFood] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const openModal = (food) => {
        setSelectedFood(food);
        setSelectedQuantity(1);
        setSpecialInstructions("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedFood(null);
        setIsModalOpen(false);
    };

    const handleIncreaseQuantity = () => setSelectedQuantity(prev => prev + 1);
    const handleDecreaseQuantity = () => setSelectedQuantity(prev => Math.max(1, prev - 1));

    const handleAddToOrder = () => {
        if (selectedFood) {
            addToCart(selectedFood.id, selectedQuantity, specialInstructions);
            closeModal();
        }
    };

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

    const filteredFood = categoryName === 'All'
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

            <nav
                className="category-menu"
                ref={menuContainerRef}
            >
                {categories.map(cat => (
                    <Link
                        key={cat}
                        to={`/category/${encodeURIComponent(cat)}`}
                        className={categoryName === cat ? 'active' : ''}
                    >
                        <span
                            ref={categoryName === cat ? activeCategoryRef : null}
                        >
                            {cat}
                        </span>
                    </Link>
                ))}
            </nav>

            {filteredFood.length > 0 ? (
                <>
                    <div className="food-list">
                        {filteredFood.map(item => (
                            <FoodItemCategory
                                key={item._id}
                                id={item._id}
                                name={item.name}
                                description={item.description.length > 50
                                    ? item.description.slice(0, 70) + '...'
                                    : item.description}
                                price={item.price}
                                image={item.image}
                                isBestSeller={item.isBestSeller}
                                isNewAdded={item.isNewAdded}
                                isVegan={item.isVegan}
                                onClick={() => openModal({
                                    id: item._id,
                                    name: item.name,
                                    price: item.price,
                                    description: item.description,
                                    image: item.image,
                                })}
                            />
                        ))}
                    </div>

                    {isModalOpen && selectedFood && (
                        <div className="modal-overlay" onClick={closeModal}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <button className="modal-close-button" onClick={closeModal}>×</button>
                                <h2>{selectedFood.name}</h2>
                                <img src={`/images/${selectedFood.image}`} alt={selectedFood.name} />
                                <p>{selectedFood.description}</p>

                                <div className="modal-actions">
                                    <div className="quantity-selector">
                                        <button onClick={handleDecreaseQuantity}>-</button>
                                        <span>{selectedQuantity}</span>
                                        <button onClick={handleIncreaseQuantity}>+</button>
                                    </div>
                                </div>

                                <textarea
                                    placeholder="Special Instructions"
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                />
                                <button className="add-to-order-button" onClick={handleAddToOrder}>
                                    Add to Order
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p>No items found for this category.</p>
            )}
        </div>
    );
};

export default CategoryPage;
