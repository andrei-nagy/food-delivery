import React, { useContext, useEffect, useState, useRef } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { FaChevronDown, FaChevronUp, FaFire, FaWeight, FaAllergies, FaClock, FaLeaf, FaInfoCircle, FaUtensils } from 'react-icons/fa';
import './FoodModal.css';
import { assets } from "../../assets/assets";

const FoodModal = ({ food, closeModal, isOpen }) => {
    const { addToCart, url, canAddToCart, billRequested, userBlocked } = useContext(StoreContext);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [validationError, setValidationError] = useState("");
    const [imageError, setImageError] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        nutrition: false,
        ingredients: false,
        preparation: false,
        allergens: false
    });
    
    const modalRef = useRef(null);
    const dragStartY = useRef(0);
    const currentY = useRef(0);
    const isDragging = useRef(false);

    // Combină ambele condiții pentru a bloca interacțiunea
    const isDisabled = billRequested || userBlocked;

    // Safe access to food properties with fallbacks
    const foodDescription = food?.description || "";
    const foodName = food?.name || "";
    const foodPrice = food?.price || 0;
    const foodImage = food?.image || "";
    const foodExtras = food?.extras || [];
    const foodId = food?._id || "";
    const isVegan = food?.isVegan || false;
    const isBestSeller = food?.isBestSeller || false;
    const isNewAdded = food?.isNewAdded || false;
    const discountPercentage = food?.discountPercentage || 0;
    const discountedPrice = food?.discountedPrice || foodPrice;

    // Date pentru secțiuni - folosim datele reale din food sau valori default
    const nutritionData = food?.nutrition || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0
    };

    const allergens = Array.isArray(food?.allergens) ? food.allergens : [];

    const preparationInfo = food?.preparation || {
        cookingTime: "",
        spiceLevel: "",
        servingSize: "",
        difficulty: ""
    };

    const ingredientsList = Array.isArray(food?.ingredients) && food.ingredients.length > 0 
        ? food.ingredients 
        : (food?.ingredients && typeof food.ingredients === 'string' 
            ? food.ingredients.split(',').map(item => item.trim()).filter(item => item) 
            : []);

    const dietaryInfo = food?.dietaryInfo || {
        isGlutenFree: false,
        isDairyFree: false,
        isVegetarian: false,
        isSpicy: false,
        containsNuts: false
    };

    // Verifică dacă produsul are discount
    const hasDiscount = discountPercentage > 0;

    // Mesajul care va apărea când utilizatorul este blocat
    const getBlockedMessage = () => {
        if (userBlocked) {
            return {
                icon: "⏰",
                text: "Session Expired",
                warningText: "Cannot add items - session expired. Please refresh the page."
            };
        }
        if (billRequested) {
            return {
                icon: "🔒", 
                text: "Bill Requested",
                warningText: "Cannot add new items. Please cancel the bill request first."
            };
        }
        return null;
    };

    const blockedMessage = getBlockedMessage();

    useEffect(() => {
        if (isOpen && food) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
            requestAnimationFrame(() => {
                setIsVisible(true);
            });
        } else {
            setIsVisible(false);
            setSelectedOptions([]);
            setValidationError("");
            setImageError(false);
            setExpandedSections({
                nutrition: false,
                ingredients: false,
                preparation: false,
                allergens: false
            });
            setTimeout(() => {
                document.body.style.overflow = '';
            }, 300);
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, food]);

    const handleImageError = () => {
        setImageError(true);
    };

    const handleOptionChange = (option) => {
        if (isDisabled) return;
        
        setValidationError("");
        
        if (selectedOptions.includes(option)) {
            setSelectedOptions(selectedOptions.filter(item => item !== option));
        } else {
            setSelectedOptions([...selectedOptions, option]);
        }
    };

    const toggleSection = (section) => {
        if (isDisabled) return;
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleDragStart = (e) => {
        // Permite swipe doar dacă scroll-ul este în top
        if (modalRef.current && modalRef.current.scrollTop > 0) {
            return;
        }
        
        isDragging.current = true;
        dragStartY.current = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        if (modalRef.current) {
            modalRef.current.style.transition = 'none';
        }
    };

    const handleDrag = (e) => {
        if (!isDragging.current || !modalRef.current) return;
        
        const y = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        const deltaY = y - dragStartY.current;
        
        if (deltaY > 0) {
            currentY.current = deltaY;
            modalRef.current.style.transform = `translateY(${deltaY}px)`;
            
            // Adaugă opacity la overlay pe măsură ce tragi
            const overlay = document.querySelector('.food-modal-overlay');
            if (overlay) {
                const opacity = 1 - (deltaY / 300);
                overlay.style.backgroundColor = `rgba(0, 0, 0, ${Math.max(0.3, opacity * 0.5)})`;
            }
        }
    };

    const handleDragEnd = () => {
        isDragging.current = false;
        if (!modalRef.current) return;
        
        modalRef.current.style.transition = 'transform 0.3s ease';
        
        // Resetează opacity overlay
        const overlay = document.querySelector('.food-modal-overlay');
        if (overlay) {
            overlay.style.transition = 'background-color 0.3s ease';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        }
        
        if (currentY.current > 100) {
            modalRef.current.style.transform = 'translateY(100%)';
            setTimeout(() => closeModal(), 300);
        } else {
            modalRef.current.style.transform = 'translateY(0)';
        }
        
        currentY.current = 0;
    };

    // Adaugă această funcție pentru a preveni swipe-ul când se face scroll
    const handleScroll = (e) => {
        if (e.target.scrollTop > 0 && isDragging.current) {
            isDragging.current = false;
            if (modalRef.current) {
                modalRef.current.style.transform = 'translateY(0)';
                modalRef.current.style.transition = 'transform 0.3s ease';
            }
        }
    };

    useEffect(() => {
        const modal = modalRef.current;
        if (!modal) return;

        // Adaugă event listener pentru scroll
        modal.addEventListener('scroll', handleScroll);

        const handleMouseDown = (e) => {
            // Permite swipe doar pe primul 30% din modal sau pe header
            const modalRect = modal.getBoundingClientRect();
            const clickY = e.clientY - modalRect.top;
            const modalHeight = modalRect.height;
            
            if (clickY < modalHeight * 0.3 || e.target.closest('.food-modal-header')) {
                handleDragStart(e);
            }
        };

        const handleMouseMove = (e) => {
            handleDrag(e);
        };

        const handleMouseUp = () => {
            if (isDragging.current) {
                handleDragEnd();
            }
        };

        const handleTouchStart = (e) => {
            // Permite swipe doar pe primul 30% din modal sau pe header
            const modalRect = modal.getBoundingClientRect();
            const touchY = e.touches[0].clientY - modalRect.top;
            const modalHeight = modalRect.height;
            
            if (touchY < modalHeight * 0.3 || e.target.closest('.food-modal-header')) {
                handleDragStart(e);
            }
        };

        const handleTouchMove = (e) => {
            if (!isDragging.current) return;
            
            e.preventDefault();
            handleDrag(e);
        };

        const handleTouchEnd = () => {
            if (isDragging.current) {
                handleDragEnd();
            }
        };

        // Aplică evenimentele pe întregul modal
        modal.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        modal.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            modal.removeEventListener('scroll', handleScroll);
            modal.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            modal.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    const increase = () => {
        if (isDisabled) return;
        setSelectedQuantity(q => q + 1);
    };

    const decrease = () => {
        if (isDisabled) return;
        setSelectedQuantity(q => Math.max(1, q - 1));
    };
    
    const generateCartItemId = () => {
        if (!foodId) return "";
        
        const baseId = foodId;
        const extrasString = selectedOptions.sort().join(',');
        
        const instructionsHash = specialInstructions 
            ? btoa(specialInstructions).substring(0, 8).replace(/=/g, '')
            : '';
        
        if (extrasString && instructionsHash) {
            return `${baseId}__${btoa(extrasString).replace(/=/g, '')}__${instructionsHash}`;
        } else if (extrasString) {
            return `${baseId}__${btoa(extrasString).replace(/=/g, '')}`;
        } else if (instructionsHash) {
            return `${baseId}____${instructionsHash}`;
        } else {
            return `${baseId}__`;
        }
    };

    const calculateTotalPrice = () => {
        if (!food) return 0;
        
        let total = discountedPrice * selectedQuantity;
        
        selectedOptions.forEach(optionName => {
            const extra = foodExtras.find(extra => extra.name === optionName);
            if (extra) {
                total += extra.price * selectedQuantity;
            }
        });
        
        return total;
    };

    const handleAddToCart = () => {
        if (isDisabled) {
            closeModal();
            return;
        }

        if (!food) {
            console.error("Food object is undefined!");
            closeModal();
            return;
        }

        const cartItemId = generateCartItemId();
        
        // ✅ Calculează prețul extras-urilor
        const extrasPrice = selectedOptions.reduce((total, optionName) => {
            const extra = foodExtras.find(extra => extra.name === optionName);
            return total + (extra?.price || 0);
        }, 0);

        const cartItemData = {
            baseFoodId: foodId,
            quantity: selectedQuantity,
            specialInstructions: specialInstructions,
            selectedOptions: selectedOptions,
            unitPrice: discountedPrice, // ✅ Folosește prețul cu discount
            extrasPrice: extrasPrice,
            extras: foodExtras // ✅ Include și lista de extras-uri pentru calcul
        };
        
        addToCart(cartItemId, selectedQuantity, specialInstructions, selectedOptions, cartItemData);
        closeModal();
    };

    const handleAddButton = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleAddToCart();
    };

    const handleQtyButton = (action) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        action();
    };

    // Funcții pentru a verifica dacă să afișăm secțiunile
    const shouldShowNutrition = nutritionData.calories > 0 || nutritionData.protein > 0 || nutritionData.carbs > 0;
    const shouldShowIngredients = ingredientsList.length > 0;
    const shouldShowPreparation = preparationInfo.cookingTime || preparationInfo.servingSize || preparationInfo.difficulty;
    const shouldShowAllergens = allergens.length > 0;

    // Early return if no food or not open
    if (!isOpen || !food) return null;

    return (
        <div className={`food-modal-overlay ${isVisible ? 'active' : ''}`} onClick={closeModal}>
            <div 
                className={`food-modal-container ${isDisabled ? 'bill-requested-modal' : ''}`} 
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="food-modal-header">
                    <div className="food-modal-drag-handle"></div>
                    <div className="food-modal-title-section">
                        <h2 className="food-modal-title">{foodName}</h2>
                        <button className="food-modal-close-btn" onClick={closeModal}>✕</button>
                    </div>
                </div>
                
                <div className="food-modal-body">
                    {/* Warning Banner pentru Session Expired sau Bill Requested */}
                    {isDisabled && blockedMessage && (
                        <div className="food-modal-warning">
                            <div className="food-modal-warning-content">
                                <span className="food-modal-warning-icon">{blockedMessage.icon}</span>
                                <div className="food-modal-warning-text">
                                    <strong>{blockedMessage.text}</strong>
                                    <span>{blockedMessage.warningText}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Imaginea principală cu fallback */}
                    <img 
                        src={imageError ? assets.image_coming_soon : (url + "/images/" + foodImage)} 
                        alt={foodName} 
                        className={`food-modal-image ${isDisabled ? 'disabled-image' : ''} ${imageError ? 'image-error' : ''}`}
                        onError={handleImageError}
                    />
                    
                    {/* Badge-uri pentru Vegan, Best Seller și New */}
                    {(isVegan || isBestSeller || isNewAdded) && !isDisabled && (
                        <div className="food-modal-badges">
                            {isNewAdded && (
                                <span className="food-modal-badge food-modal-badge-new">New</span>
                            )}
                            {isVegan && (
                                <span className="food-modal-badge food-modal-badge-vegan">Vegan</span>
                            )}
                            {isBestSeller && (
                                <span className="food-modal-badge food-modal-badge-bestseller">Best Seller</span>
                            )}
                        </div>
                    )}
                    
                    <div className="food-modal-price-section">
                        <div className="food-modal-price-main">
                            {hasDiscount ? (
                                <div className="food-modal-price-discount-wrapper">
                                    <div className="food-modal-price-row">
                                        <span className="food-modal-current-price">
                                            {discountedPrice.toFixed(2)} €
                                        </span>
                                        <span className="food-modal-discount-badge">
                                            -{discountPercentage}%
                                        </span>
                                    </div>
                                    <span className="food-modal-original-price">
                                        {foodPrice.toFixed(2)} €
                                    </span>
                                </div>
                            ) : (
                                <span className={`food-modal-current-price ${isDisabled ? 'disabled-text' : ''}`}>
                                    {foodPrice.toFixed(2)} €
                                </span>
                            )}
                        </div>
                        
                        <div className="food-modal-quick-info">
                            {/* Calorii - afișat doar dacă există */}
                            {nutritionData.calories > 0 && (
                                <div className="food-modal-quick-info-item">
                                    <FaFire className="quick-info-icon" />
                                    <span>{nutritionData.calories} cal</span>
                                </div>
                            )}
                            
                            {/* Gramaj - afișat doar dacă există */}
                            {preparationInfo.servingSize && (
                                <div className="food-modal-quick-info-item">
                                    <FaWeight className="quick-info-icon" />
                                    <span>{preparationInfo.servingSize}</span>
                                </div>
                            )}
                            
                            {/* Picant - afișat doar dacă este spicy */}
                            {dietaryInfo.isSpicy && !isDisabled && (
                                <div className="food-modal-quick-info-item">
                                    <span className="spicy-icon">🌶️</span>
                                    <span>{preparationInfo.spiceLevel?.replace('🌶️', '').trim() || 'Picant'}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DESCRIERE - din food object */}
                    {foodDescription && (
                        <div className="food-modal-section">
                            <div className="food-modal-description-static">
                                <p className="food-modal-description-text">{foodDescription}</p>
                            </div>
                        </div>
                    )}

                    {/* Instrucțiuni speciale */}
                    {!isDisabled && (
                        <div className="food-modal-section">
                            <h3 className="food-modal-section-title">Instrucțiuni speciale (opțional)</h3>
                            <textarea
                                className="food-modal-textarea"
                                placeholder="Ex: fără sos picant, mai puțină sare, etc."
                                value={specialInstructions}
                                onChange={(e) => setSpecialInstructions(e.target.value)}
                                disabled={isDisabled}
                            />
                        </div>
                    )}   

                    {/* ACCORDION: Valori nutritionale - afișat doar dacă există date */}
                    {shouldShowNutrition && (
                        <div className="food-modal-section">
                            <div 
                                className={`food-modal-accordion ${expandedSections.nutrition ? 'expanded' : ''}`}
                                onClick={() => toggleSection('nutrition')}
                            >
                                <div className="food-modal-accordion-header">
                                    <FaFire className="accordion-icon" />
                                    <span className="food-modal-accordion-title">Valori Nutritionale</span>
                                    {expandedSections.nutrition ? 
                                        <FaChevronUp className="accordion-chevron" /> : 
                                        <FaChevronDown className="accordion-chevron" />
                                    }
                                </div>
                                {expandedSections.nutrition && (
                                    <div className="food-modal-accordion-content">
                                        <div className="food-modal-nutrition-grid">
                                            {nutritionData.calories > 0 && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">Calorii</span>
                                                    <span className="nutrition-value">{nutritionData.calories} kcal</span>
                                                </div>
                                            )}
                                            {nutritionData.protein > 0 && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">Proteine</span>
                                                    <span className="nutrition-value">{nutritionData.protein}g</span>
                                                </div>
                                            )}
                                            {nutritionData.carbs > 0 && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">Carbohidrați</span>
                                                    <span className="nutrition-value">{nutritionData.carbs}g</span>
                                                </div>
                                            )}
                                            {nutritionData.fat > 0 && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">Grăsimi</span>
                                                    <span className="nutrition-value">{nutritionData.fat}g</span>
                                                </div>
                                            )}
                                            {nutritionData.fiber > 0 && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">Fibre</span>
                                                    <span className="nutrition-value">{nutritionData.fiber}g</span>
                                                </div>
                                            )}
                                            {nutritionData.sugar > 0 && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">Zaharuri</span>
                                                    <span className="nutrition-value">{nutritionData.sugar}g</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ACCORDION: Ingrediente - afișat doar dacă există */}
                    {shouldShowIngredients && (
                        <div className="food-modal-section">
                            <div 
                                className={`food-modal-accordion ${expandedSections.ingredients ? 'expanded' : ''}`}
                                onClick={() => toggleSection('ingredients')}
                            >
                                <div className="food-modal-accordion-header">
                                    <FaUtensils className="accordion-icon" />
                                    <span className="food-modal-accordion-title">Ingrediente</span>
                                    {expandedSections.ingredients ? 
                                        <FaChevronUp className="accordion-chevron" /> : 
                                        <FaChevronDown className="accordion-chevron" />
                                    }
                                </div>
                                {expandedSections.ingredients && (
                                    <div className="food-modal-accordion-content">
                                        <ul className="food-modal-ingredients-list">
                                            {ingredientsList.map((ingredient, index) => (
                                                <li key={index} className="ingredient-item">
                                                    {ingredient}
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        <div className="food-modal-dietary-tags">
                                            {dietaryInfo.isGlutenFree && (
                                                <span className="dietary-tag gluten-free">Fără Gluten</span>
                                            )}
                                            {dietaryInfo.isDairyFree && (
                                                <span className="dietary-tag dairy-free">Fără Lapte</span>
                                            )}
                                            {dietaryInfo.isVegetarian && (
                                                <span className="dietary-tag vegetarian">Vegetarian</span>
                                            )}
                                            {dietaryInfo.containsNuts && (
                                                <span className="dietary-tag contains-nuts">Conține Nuci</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ACCORDION: Informații preparare - afișat doar dacă există */}
                    {shouldShowPreparation && (
                        <div className="food-modal-section">
                            <div 
                                className={`food-modal-accordion ${expandedSections.preparation ? 'expanded' : ''}`}
                                onClick={() => toggleSection('preparation')}
                            >
                                <div className="food-modal-accordion-header">
                                    <FaClock className="accordion-icon" />
                                    <span className="food-modal-accordion-title">Informații Preparare</span>
                                    {expandedSections.preparation ? 
                                        <FaChevronUp className="accordion-chevron" /> : 
                                        <FaChevronDown className="accordion-chevron" />
                                    }
                                </div>
                                {expandedSections.preparation && (
                                    <div className="food-modal-accordion-content">
                                        <div className="food-modal-preparation-grid">
                                            {preparationInfo.cookingTime && (
                                                <div className="preparation-item">
                                                    <span className="preparation-label">Timp preparare</span>
                                                    <span className="preparation-value">{preparationInfo.cookingTime}</span>
                                                </div>
                                            )}
                                            {preparationInfo.servingSize && (
                                                <div className="preparation-item">
                                                    <span className="preparation-label">Gramaj</span>
                                                    <span className="preparation-value">{preparationInfo.servingSize}</span>
                                                </div>
                                            )}
                                            {preparationInfo.difficulty && (
                                                <div className="preparation-item">
                                                    <span className="preparation-label">Dificultate</span>
                                                    <span className="preparation-value">{preparationInfo.difficulty}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ACCORDION: Alergeni - afișat doar dacă există */}
                    {shouldShowAllergens && (
                        <div className="food-modal-section">
                            <div 
                                className={`food-modal-accordion ${expandedSections.allergens ? 'expanded' : ''}`}
                                onClick={() => toggleSection('allergens')}
                            >
                                <div className="food-modal-accordion-header">
                                    <FaAllergies className="accordion-icon" />
                                    <span className="food-modal-accordion-title">Alergeni</span>
                                    {expandedSections.allergens ? 
                                        <FaChevronUp className="accordion-chevron" /> : 
                                        <FaChevronDown className="accordion-chevron" />
                                    }
                                </div>
                                {expandedSections.allergens && (
                                    <div className="food-modal-accordion-content">
                                        <div className="food-modal-allergens-list">
                                            {allergens.map((allergen, index) => (
                                                <span key={index} className="allergen-tag">
                                                    {allergen}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="food-modal-allergens-disclaimer">
                                            *Vă rugăm să ne anunțați dacă aveți alergii sau restricții alimentare.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Extra opțiuni */}
                    {foodExtras.length > 0 && !isDisabled && (
                        <div className="food-modal-section">
                            <h3 className="food-modal-section-title">Extra opțiuni (opțional)</h3>
                            <div className="food-modal-options">
                                {foodExtras.map((extra) => (
                                    <label key={extra._id || extra.name} className="food-modal-option">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedOptions.includes(extra.name)}
                                            onChange={() => handleOptionChange(extra.name)}
                                            disabled={isDisabled}
                                        />
                                        <span className="food-modal-option-text">
                                            {extra.name}
                                            <span className="food-modal-option-price">+{extra.price.toFixed(2)} €</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {validationError && (
                                <div className="food-modal-error">{validationError}</div>
                            )}
                        </div>
                    )}
                    
                    {/* Controale */}
                    <div className="food-modal-controls">
                        <div className={`food-modal-quantity ${isDisabled ? 'disabled-controls' : ''}`}>
                            <button 
                                className="food-modal-qty-btn" 
                                onClick={handleQtyButton(decrease)}
                                onTouchEnd={handleQtyButton(decrease)}
                                disabled={isDisabled}
                            >-</button>
                            <span className="food-modal-qty-value">{selectedQuantity}</span>
                            <button 
                                className="food-modal-qty-btn" 
                                onClick={handleQtyButton(increase)}
                                onTouchEnd={handleQtyButton(increase)}
                                disabled={isDisabled}
                            >+</button>
                        </div>
                        <button 
                            className={`food-modal-add-btn ${isDisabled ? 'food-modal-add-btn-disabled' : ''}`} 
                            onClick={handleAddButton}
                            onTouchEnd={handleAddButton}
                            disabled={isDisabled}
                        >
                            {isDisabled ? blockedMessage?.text : `Add ${calculateTotalPrice().toFixed(2)} €`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodModal;