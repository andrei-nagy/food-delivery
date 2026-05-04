import React, { useContext, useRef, useEffect, useState } from 'react';
import './ExploreMenu.css';
import { StoreContext } from '../../context/StoreContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaShoppingBag, FaPlus, FaMinus, FaLeaf, FaStar, FaFire } from 'react-icons/fa';
import FoodModal from '../FoodItem/FoodModal';
import DeliveryToast from '../DeliveryToast/DeliveryToast';
import { assets } from '../../assets/assets';

const ExploreMenu = ({ category, setCategory }) => {
    const {
        foodCategory_list, url, food_list,
        addToCart, removeFromCart, cartItems, restaurantData
    } = useContext(StoreContext);
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const menuListRef = useRef(null);
    const [translatedCategories, setTranslatedCategories] = useState({});
    const [isTranslating, setIsTranslating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeQuantities, setActiveQuantities] = useState({});
    const [toasts, setToasts] = useState([]);
    const [imageErrors, setImageErrors] = useState({});
    const searchInputRef = useRef(null);
    const timeoutRefs = useRef({});

    const activeCategories = foodCategory_list.filter(item => item.isActive);
    const currency = restaurantData?.currency || '€';
    const currencyPosition = restaurantData?.currencyPosition || 'after';

    const formatPrice = (priceValue) => {
        if (!priceValue && priceValue !== 0) return '';
        const num = typeof priceValue === 'string' ? parseFloat(priceValue) : priceValue;
        const formatted = num.toFixed(2);
        const nbsp = '\u00A0';
        return currencyPosition === 'before'
            ? `${currency}${nbsp}${formatted}`
            : `${formatted}${nbsp}${currency}`;
    };

    const getCartQuantity = (foodId) => {
        if (!cartItems || !foodId) return 0;
        
        let totalQuantity = 0;
        Object.keys(cartItems).forEach((key) => {
            if (key.startsWith(foodId)) {
                const item = cartItems[key];
                if (typeof item === "number") {
                    totalQuantity += item;
                } else if (item && typeof item === "object" && "quantity" in item) {
                    totalQuantity += item.quantity || 0;
                }
            }
        });
        
        return totalQuantity;
    };

    const handleImageError = (foodId) => {
        setImageErrors(prev => ({
            ...prev,
            [foodId]: true
        }));
    };

    const translateCategoryNames = async () => {
        if (currentLanguage === 'ro' || !activeCategories.length) {
            setTranslatedCategories({});
            setIsTranslating(false);
            return;
        }
        setIsTranslating(true);
        try {
            const categoryNamesToTranslate = [];
            const categoryIdMap = {};
            activeCategories.forEach((category, index) => {
                if (category.menu_name && category.menu_name.trim()) {
                    categoryNamesToTranslate.push(category.menu_name);
                    categoryIdMap[index] = category._id || category.menu_name;
                }
            });
            if (categoryNamesToTranslate.length > 0) {
                const combinedText = categoryNamesToTranslate.join(' ||| ');
                const response = await fetch(
                    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLanguage}&dt=t&q=${encodeURIComponent(combinedText)}`
                );
                if (response.ok) {
                    const data = await response.json();
                    const translatedCombinedText = data[0]?.map(item => item[0]).join('') || combinedText;
                    const translatedNames = translatedCombinedText.split(' ||| ');
                    const newTranslatedCategories = {};
                    Object.keys(categoryIdMap).forEach((index) => {
                        const categoryId = categoryIdMap[index];
                        const translatedName = translatedNames[index] || categoryNamesToTranslate[index];
                        if (translatedName && categoryId) {
                            newTranslatedCategories[categoryId] = translatedName;
                        }
                    });
                    setTranslatedCategories(newTranslatedCategories);
                }
            }
        } catch (error) {
            // Error handled silently
        } finally {
            setIsTranslating(false);
        }
    };

    useEffect(() => {
        if (activeCategories.length > 0) translateCategoryNames();
    }, [currentLanguage, activeCategories.length]);

    const getTranslatedCategoryName = (categoryItem) => {
        const categoryId = categoryItem._id || categoryItem.menu_name;
        const translatedName = translatedCategories[categoryId];
        return currentLanguage !== 'ro' && translatedName ? translatedName : categoryItem.menu_name;
    };

    useEffect(() => {
        if (searchQuery.length > 0) {
            const suggestions = food_list
                .filter(item =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .slice(0, 5);
            setSearchSuggestions(suggestions);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
            setSearchSuggestions([]);
        }
    }, [searchQuery, food_list]);

    const openModal = (food) => {
        setSelectedFood(food);
        setIsModalOpen(true);
        setShowSuggestions(false);
        setSearchQuery("");
    };

    const closeModal = () => {
        setSelectedFood(null);
        setIsModalOpen(false);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setShowSuggestions(false);
        searchInputRef.current?.focus();
    };

    const resetTimeout = (foodId) => {
        if (timeoutRefs.current[foodId]) clearTimeout(timeoutRefs.current[foodId]);
        timeoutRefs.current[foodId] = setTimeout(() => {
            setActiveQuantities(prev => {
                const newState = { ...prev };
                delete newState[foodId];
                return newState;
            });
            delete timeoutRefs.current[foodId];
        }, 3000);
    };

    // Funcție pentru a adăuga în coș și a activa stepper-ul
    const activateStepperAndAdd = (food, e) => {
        e.stopPropagation();
        
        const hasDiscount = food.discountPercentage > 0;
        const unitPrice = hasDiscount ? food.discountedPrice : food.price;
        
        // Adaugă 1 în coș
        addToCart(food._id, 1, "", [], {
            baseFoodId: food._id,
            quantity: 1,
            specialInstructions: "",
            selectedOptions: [],
            unitPrice,
            extrasPrice: 0,
            extras: []
        });
        
        // Activează stepper-ul cu cantitatea 1
        setActiveQuantities(prev => ({ ...prev, [food._id]: 1 }));
        resetTimeout(food._id);
        
        // Arată toast-ul
        setToasts(prev => [...prev, { id: `search-${Date.now()}`, subtitle: food.name }]);
    };

    // Funcție pentru a incrementa cantitatea în coș
    const incrementQuantity = (food, e) => {
        e.stopPropagation();
        
        const currentQty = getCartQuantity(food._id);
        const newQty = currentQty + 1;
        
        const hasDiscount = food.discountPercentage > 0;
        const unitPrice = hasDiscount ? food.discountedPrice : food.price;
        
        // Adaugă încă unul în coș
        addToCart(food._id, 1, "", [], {
            baseFoodId: food._id,
            quantity: newQty,
            specialInstructions: "",
            selectedOptions: [],
            unitPrice,
            extrasPrice: 0,
            extras: []
        });
        
        // Actualizează stepper-ul
        setActiveQuantities(prev => ({ ...prev, [food._id]: newQty }));
        resetTimeout(food._id);
    };

    // Funcție pentru a decrementa cantitatea în coș
    const decrementQuantity = (food, e) => {
        e.stopPropagation();
        
        const currentQty = getCartQuantity(food._id);
        
        if (currentQty <= 1) {
            // Dacă e ultimul produs, elimină complet din coș
            removeFromCart(food._id, 1);
            setActiveQuantities(prev => {
                const newState = { ...prev };
                delete newState[food._id];
                return newState;
            });
            if (timeoutRefs.current[food._id]) {
                clearTimeout(timeoutRefs.current[food._id]);
                delete timeoutRefs.current[food._id];
            }
        } else {
            // Elimină unul din coș
            removeFromCart(food._id, 1);
            setActiveQuantities(prev => ({ ...prev, [food._id]: currentQty - 1 }));
            resetTimeout(food._id);
        }
    };

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    useEffect(() => {
        return () => {
            Object.values(timeoutRefs.current).forEach(timeout => clearTimeout(timeout));
        };
    }, []);

    const getProductBadges = (item) => {
        const badges = [];
        
        if (item.isVegan) {
            badges.push({
                type: 'vegan',
                icon: <FaLeaf />,
                text: 'Vegan',
                color: '#16a34a',
                bgColor: '#f0fdf4'
            });
        }
        
        if (item.isBestSeller) {
            badges.push({
                type: 'bestseller',
                icon: <FaStar />,
                text: 'Best Seller',
                color: '#f97316',
                bgColor: '#fff7ed'
            });
        }
        
        if (item.isNewAdded) {
            badges.push({
                type: 'new',
                icon: <FaFire />,
                text: 'New',
                color: '#dc2626',
                bgColor: '#fef2f2'
            });
        }
        
        return badges;
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
            >
                <div className='explore-menu' id='explore-menu'>

                    <div className="em-search-section">
                        <div className="em-search-wrap">
                            <div className={`em-search-box ${isSearchFocused ? 'em-search-box--focused' : ''}`}>
                                <FaSearch className="em-search-icon" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className="em-search-input"
                                    placeholder="Caută în meniu..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => {
                                        setIsSearchFocused(true);
                                        if (searchQuery.length > 0) setShowSuggestions(true);
                                    }}
                                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                />
                                {searchQuery && (
                                    <button className="em-clear-btn" onClick={clearSearch} aria-label="Șterge">
                                        <FaTimes />
                                    </button>
                                )}
                            </div>

                            <AnimatePresence>
                                {showSuggestions && searchSuggestions.length > 0 && (
                                    <motion.div
                                        className="em-results"
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                    >
                                        {searchSuggestions.map((item, idx) => {
                                            const hasDiscount = item.discountPercentage > 0;
                                            const displayPrice = hasDiscount ? item.discountedPrice : item.price;
                                            const originalPrice = item.price;
                                            const isStepperActive = activeQuantities[item._id] !== undefined;
                                            const cartQty = getCartQuantity(item._id);
                                            const stepperQuantity = isStepperActive ? activeQuantities[item._id] : cartQty;
                                            const badges = getProductBadges(item);
                                            const imageUrl = imageErrors[item._id] 
                                                ? assets.image_coming_soon 
                                                : `${url}/images/${item.image}`;

                                            return (
                                                <motion.div
                                                    key={item._id}
                                                    className="em-result-row"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: idx * 0.04 }}
                                                    onClick={() => openModal(item)}
                                                >
                                                    <div className="em-thumb-wrap">
                                                        <img
                                                            src={imageUrl}
                                                            alt={item.name}
                                                            className="em-thumb"
                                                            onError={() => handleImageError(item._id)}
                                                        />
                                                        {hasDiscount && (
                                                            <span className="em-disc-pill">-{item.discountPercentage}%</span>
                                                        )}
                                                    </div>

                                                    <div className="em-result-info">
                                                        <p className="em-result-name">{item.name}</p>
                                                        {item.description && (
                                                            <p className="em-result-desc">
                                                                {item.description.substring(0, 55)}…
                                                            </p>
                                                        )}
                                                        <div className="em-result-meta">
                                                            {hasDiscount ? (
                                                                <>
                                                                    <span className="em-price-orig">{formatPrice(originalPrice)}</span>
                                                                    <span className="em-price-final">{formatPrice(displayPrice)}</span>
                                                                </>
                                                            ) : (
                                                                <span className="em-price-final">{formatPrice(displayPrice)}</span>
                                                            )}
                                                            
                                                            <div className="em-badges-container">
                                                                {badges.map((badge, badgeIdx) => (
                                                                    <span 
                                                                        key={badgeIdx}
                                                                        className="em-badge"
                                                                        style={{
                                                                            backgroundColor: badge.bgColor,
                                                                            color: badge.color,
                                                                            borderColor: badge.color
                                                                        }}
                                                                    >
                                                                        {badge.icon}
                                                                        <span>{badge.text}</span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="em-action-col"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        {(isStepperActive || cartQty > 0) ? (
                                                            <div className="em-stepper">
                                                                <button
                                                                    className="em-step-btn em-step-btn--minus"
                                                                    onClick={e => decrementQuantity(item, e)}
                                                                    aria-label="Scade"
                                                                >
                                                                    <FaMinus />
                                                                </button>
                                                                <span className="em-step-val">{stepperQuantity || cartQty}</span>
                                                                <button
                                                                    className="em-step-btn em-step-btn--plus"
                                                                    onClick={e => incrementQuantity(item, e)}
                                                                    aria-label="Crește"
                                                                >
                                                                    <FaPlus />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className="em-add-btn"
                                                                onClick={e => activateStepperAndAdd(item, e)}
                                                                aria-label={`Adaugă ${item.name}`}
                                                            >
                                                                <FaPlus />
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}

                                        <div className="em-results-hint">
                                            Apasă pe un produs pentru mai multe detalii
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="explore-menu-container">
                        <div className="explore-menu-list" ref={menuListRef}>
                            {activeCategories.map((item, index) => (
                                <Link
                                    to={`/category/${encodeURIComponent(item.menu_name)}`}
                                    key={index}
                                    className='explore-menu-list-item'
                                    onClick={() => setCategory(prev => prev === item.menu_name ? "All" : item.menu_name)}
                                >
                                    <img
                                        className={category === item.menu_name ? "active" : ""}
                                        src={`${url}/images/${item.image}`}
                                        alt={getTranslatedCategoryName(item)}
                                    />
                                    <p className={category === item.menu_name ? "active" : ""}>
                                        {getTranslatedCategoryName(item)}
                                        {isTranslating && <span className="translating-indicator"></span>}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {isModalOpen && selectedFood && (
                <FoodModal food={selectedFood} closeModal={closeModal} isOpen={isModalOpen} />
            )}

            {toasts.map(t => (
                <DeliveryToast key={t.id} type="added" subtitle={t.subtitle} onDone={() => removeToast(t.id)} />
            ))}
        </>
    );
}

export default ExploreMenu;