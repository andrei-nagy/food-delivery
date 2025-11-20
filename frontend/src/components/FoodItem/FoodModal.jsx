import React, { useContext, useEffect, useState, useRef } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { FaChevronDown, FaChevronUp, FaFire, FaWeight, FaAllergies, FaClock, FaLeaf, FaInfoCircle, FaUtensils, FaLanguage, FaSync, FaGlobe } from 'react-icons/fa';
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
    
    // STATE-URI PENTRU TRADUCERE - nimic selectat inițial
    const [targetLanguage, setTargetLanguage] = useState(''); // GOL inițial
    const [translationEnabled, setTranslationEnabled] = useState(false); // DEZACTIVAT inițial
    const [isTranslating, setIsTranslating] = useState(false);
    const [translatedContent, setTranslatedContent] = useState({
        description: '',
        ingredients: [],
        preparation: {},
        allergens: []
    });
    const [translationAnimations, setTranslationAnimations] = useState({});
    
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

    // === FUNCȚII PENTRU TRADUCERE CU ANIMAȚII ===

    const translateTextFree = async (text, targetLang) => {
        if (!text.trim()) return text;
        
        try {
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ro|${targetLang}`
            );

            if (!response.ok) {
                throw new Error('Translation failed');
            }

            const data = await response.json();
            return data.responseData.translatedText || text;
        } catch (error) {
            console.error('Free translation error:', error);
            try {
                const googleResponse = await fetch(
                    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ro&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
                );
                const googleData = await googleResponse.json();
                return googleData[0][0][0] || text;
            } catch (googleError) {
                console.error('Google translation error:', googleError);
                return text;
            }
        }
    };

    // Funcție cu animații pentru traducere
    const translateAllContent = async () => {
        if (!translationEnabled || !food || !targetLanguage) return;
        
        setIsTranslating(true);
        
        // Animație de început
        setTranslationAnimations({
            description: 'translating',
            ingredients: 'translating',
            preparation: 'translating',
            allergens: 'translating'
        });

        try {
            const translations = {
                description: '',
                ingredients: [],
                preparation: {},
                allergens: []
            };

            // Traduce descrierea cu animație progresivă
            if (foodDescription) {
                translations.description = await translateTextFree(foodDescription, targetLanguage);
                setTranslationAnimations(prev => ({ ...prev, description: 'completed' }));
            }

            // Traduce ingredientele
            if (ingredientsList.length > 0) {
                const translatedIngredients = [];
                for (const [index, ingredient] of ingredientsList.entries()) {
                    const translated = await translateTextFree(ingredient, targetLanguage);
                    translatedIngredients.push(translated);
                    
                    // Animație progresivă pentru fiecare ingredient
                    if (index === ingredientsList.length - 1) {
                        setTranslationAnimations(prev => ({ ...prev, ingredients: 'completed' }));
                    }
                }
                translations.ingredients = translatedIngredients;
            }

            // Traduce informațiile de preparare
            const translatedPreparation = { ...preparationInfo };
            if (preparationInfo.cookingTime) {
                translatedPreparation.cookingTime = await translateTextFree(preparationInfo.cookingTime, targetLanguage);
            }
            if (preparationInfo.difficulty) {
                translatedPreparation.difficulty = await translateTextFree(preparationInfo.difficulty, targetLanguage);
            }
            if (preparationInfo.spiceLevel) {
                translatedPreparation.spiceLevel = await translateTextFree(preparationInfo.spiceLevel, targetLanguage);
            }
            translations.preparation = translatedPreparation;
            setTranslationAnimations(prev => ({ ...prev, preparation: 'completed' }));

            // Traduce alergenii
            if (allergens.length > 0) {
                const translatedAllergens = [];
                for (const allergen of allergens) {
                    const translated = await translateTextFree(allergen, targetLanguage);
                    translatedAllergens.push(translated);
                }
                translations.allergens = translatedAllergens;
                setTranslationAnimations(prev => ({ ...prev, allergens: 'completed' }));
            }

            setTranslatedContent(translations);
            
            // Finalizează toate animațiile
            setTimeout(() => {
                setTranslationAnimations({
                    description: 'idle',
                    ingredients: 'idle',
                    preparation: 'idle',
                    allergens: 'idle'
                });
            }, 500);

        } catch (error) {
            console.error('Error translating content:', error);
            setTranslationAnimations({
                description: 'idle',
                ingredients: 'idle',
                preparation: 'idle',
                allergens: 'idle'
            });
        } finally {
            setIsTranslating(false);
        }
    };

    // Efect pentru traducere automată - doar când translationEnabled este true
    useEffect(() => {
        if (translationEnabled && food && targetLanguage) {
            translateAllContent();
        } else {
            // Animație de fade-out pentru conținutul tradus
            setTranslationAnimations({
                description: 'fading',
                ingredients: 'fading',
                preparation: 'fading',
                allergens: 'fading'
            });
            
            setTimeout(() => {
                setTranslatedContent({
                    description: '',
                    ingredients: [],
                    preparation: {},
                    allergens: []
                });
                setTranslationAnimations({
                    description: 'idle',
                    ingredients: 'idle',
                    preparation: 'idle',
                    allergens: 'idle'
                });
            }, 300);
        }
    }, [translationEnabled, targetLanguage, food]);

    // Funcție pentru schimbarea limbii - activează traducerea când utilizatorul alege orice limbă
    const handleLanguageChange = (newLang) => {
        if (newLang) {
            setTargetLanguage(newLang);
            // Activează traducerea pentru ORICE limbă selectată
            setTranslationEnabled(true);
        }
    };

    // Funcții pentru a obține conținutul
    const getDescription = () => {
        return translationEnabled && translatedContent.description 
            ? translatedContent.description 
            : foodDescription;
    };

    const getIngredients = () => {
        return translationEnabled && translatedContent.ingredients.length > 0
            ? translatedContent.ingredients
            : ingredientsList;
    };

    const getPreparationInfo = () => {
        return translationEnabled && translatedContent.preparation
            ? { ...preparationInfo, ...translatedContent.preparation }
            : preparationInfo;
    };

    const getAllergens = () => {
        return translationEnabled && translatedContent.allergens.length > 0
            ? translatedContent.allergens
            : allergens;
    };

    // Funcție pentru a obține clasa de animație
    const getAnimationClass = (section) => {
        const animation = translationAnimations[section];
        if (!translationEnabled) return '';
        
        switch (animation) {
            case 'translating': return 'content-translating';
            case 'completed': return 'content-translated';
            case 'fading': return 'content-fading';
            default: return translationEnabled ? 'content-translated' : '';
        }
    };

    // Funcție pentru a obține textul bazat pe limbă
    const getStaticText = (roText, enText) => {
        // Dacă traducerea este activată, folosește textul în limba selectată
        if (translationEnabled && targetLanguage) {
            return targetLanguage === 'ro' ? roText : enText;
        }
        // Dacă traducerea nu este activată, folosește textul original (română)
        return roText;
    };

    // Mesajul care va apărea când utilizatorul este blocat
    const getBlockedMessage = () => {
        if (userBlocked) {
            return {
                icon: "⏰",
                text: getStaticText("Sesiune Expirată", "Session Expired"),
                warningText: getStaticText(
                    "Nu se pot adăuga produse - sesiunea a expirat. Vă rugăm să reîmprospătați pagina.",
                    "Cannot add items - session expired. Please refresh the page."
                )
            };
        }
        if (billRequested) {
            return {
                icon: "🔒", 
                text: getStaticText("Notă Solicitată", "Bill Requested"),
                warningText: getStaticText(
                    "Nu se pot adăuga produse noi. Vă rugăm să anulați mai întâi solicitarea notei de plată.",
                    "Cannot add new items. Please cancel the bill request first."
                )
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
            // Resetează traducerea la starea inițială când se închide modalul
            setTranslationEnabled(false);
            setTargetLanguage('');
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
        
        const extrasPrice = selectedOptions.reduce((total, optionName) => {
            const extra = foodExtras.find(extra => extra.name === optionName);
            return total + (extra?.price || 0);
        }, 0);

        const cartItemData = {
            baseFoodId: foodId,
            quantity: selectedQuantity,
            specialInstructions: specialInstructions,
            selectedOptions: selectedOptions,
            unitPrice: discountedPrice,
            extrasPrice: extrasPrice,
            extras: foodExtras
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
    const shouldShowIngredients = getIngredients().length > 0;
    const shouldShowPreparation = getPreparationInfo().cookingTime || getPreparationInfo().servingSize || getPreparationInfo().difficulty;
    const shouldShowAllergens = getAllergens().length > 0;

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
                        
                        {/* CONTROALE TRADUCERE - DESIGN SIMPLIFICAT */}
                        <div className="food-modal-translation-controls">
                            <div className="translation-toggle-group">
                                {/* SELECTORUL DE LIMBĂ - nimic selectat inițial */}
                                <div className="language-select-wrapper">
                                    <FaLanguage className="language-select-icon" />
                                    <select 
                                        className="food-modal-language-select"
                                        value={targetLanguage}
                                        onChange={(e) => handleLanguageChange(e.target.value)}
                                        disabled={isTranslating}
                                    >
                                        <option value="">Translate</option>
                                        <option value="en">🇺🇸 English</option>
                                        <option value="ro">🇷🇴 Română</option>
                                        <option value="es">🇪🇸 Español</option>
                                        <option value="fr">🇫🇷 Français</option>
                                        <option value="de">🇩🇪 Deutsch</option>
                                        <option value="it">🇮🇹 Italiano</option>
                                        <option value="ru">🇷🇺 Русский</option>
                                        <option value="zh">🇨🇳 中文</option>
                                        <option value="ar">🇦🇪 العربية</option>
                                    </select>
                                </div>
                            </div>
                            <button className="food-modal-close-btn" onClick={closeModal}>✕</button>
                        </div>
                    </div>
                </div>
                
                <div className="food-modal-body">
                    {/* Warning Banner */}
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
                    
                    {/* Imaginea principală */}
                    <img 
                        src={imageError ? assets.image_coming_soon : (url + "/images/" + foodImage)} 
                        alt={foodName} 
                        className={`food-modal-image ${isDisabled ? 'disabled-image' : ''} ${imageError ? 'image-error' : ''}`}
                        onError={handleImageError}
                    />
                    
                    {/* Badge-uri */}
                    {(isVegan || isBestSeller || isNewAdded) && !isDisabled && (
                        <div className="food-modal-badges">
                            {isNewAdded && (
                                <span className="food-modal-badge food-modal-badge-new">
                                    {getStaticText('Nou', 'New')}
                                </span>
                            )}
                            {isVegan && (
                                <span className="food-modal-badge food-modal-badge-vegan">
                                    Vegan
                                </span>
                            )}
                            {isBestSeller && (
                                <span className="food-modal-badge food-modal-badge-bestseller">
                                    {getStaticText('Cele Mai Vândute', 'Best Seller')}
                                </span>
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
                            {nutritionData.calories > 0 && (
                                <div className="food-modal-quick-info-item">
                                    <FaFire className="quick-info-icon" />
                                    <span>{nutritionData.calories} cal</span>
                                </div>
                            )}
                            
                            {getPreparationInfo().servingSize && (
                                <div className="food-modal-quick-info-item">
                                    <FaWeight className="quick-info-icon" />
                                    <span>{getPreparationInfo().servingSize}</span>
                                </div>
                            )}
                            
                            {dietaryInfo.isSpicy && !isDisabled && (
                                <div className="food-modal-quick-info-item">
                                    <span className="spicy-icon">🌶️</span>
                                    <span>
                                        {getStaticText('Picant', 'Spicy')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DESCRIERE */}
                    {getDescription() && (
                        <div className="food-modal-section">
                            <div className={`food-modal-description-static ${getAnimationClass('description')}`}>
                                <p className="food-modal-description-text">{getDescription()}</p>
                            </div>
                        </div>
                    )}

                    {/* Instrucțiuni speciale */}
                    {!isDisabled && (
                        <div className="food-modal-section">
                            <h3 className="food-modal-section-title">
                                {getStaticText('Instrucțiuni speciale (opțional)', 'Special instructions (optional)')}
                            </h3>
                            <textarea
                                className="food-modal-textarea"
                                placeholder={getStaticText('Ex: fără sos picant, mai puțină sare, etc.', 'Ex: no spicy sauce, less salt, etc.')}
                                value={specialInstructions}
                                onChange={(e) => setSpecialInstructions(e.target.value)}
                                disabled={isDisabled}
                            />
                        </div>
                    )}   

                    {/* Extra opțiuni */}
                    {foodExtras.length > 0 && !isDisabled && (
                        <div className="food-modal-section">
                            <h3 className="food-modal-section-title">
                                {getStaticText('Extra opțiuni (opțional)', 'Extra options (optional)')}
                            </h3>
                            <div className="food-modal-options-modern">
                                {foodExtras.map((extra) => (
                                    <label 
                                        key={extra._id || extra.name} 
                                        className={`food-modal-option-modern ${selectedOptions.includes(extra.name) ? 'selected' : ''}`}
                                    >
                                        <div className="option-modern-content">
                                            <div className="option-modern-checkbox">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedOptions.includes(extra.name)}
                                                    onChange={() => handleOptionChange(extra.name)}
                                                    disabled={isDisabled}
                                                />
                                                <span className="checkmark"></span>
                                            </div>
                                            <div className="option-modern-info">
                                                <span className="option-modern-name">{extra.name}</span>
                                                <span className="option-modern-price">+{extra.price.toFixed(2)} €</span>
                                            </div>
                                        </div>
                                        <div className="option-modern-glow"></div>
                                    </label>
                                ))}
                            </div>
                            {validationError && (
                                <div className="food-modal-error">{validationError}</div>
                            )}
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
                                    <span className="food-modal-accordion-title">
                                        {getStaticText('Valori Nutritionale', 'Nutritional Values')}
                                    </span>
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
                                                    <span className="nutrition-label">
                                                        {getStaticText('Calorii', 'Calories')}
                                                    </span>
                                                    <span className="nutrition-value">{nutritionData.calories} kcal</span>
                                                </div>
                                            )}
                                            {nutritionData.protein > 0 && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">
                                                        {getStaticText('Proteine', 'Protein')}
                                                    </span>
                                                    <span className="nutrition-value">{nutritionData.protein}g</span>
                                                </div>
                                            )}
                                            {nutritionData.carbs > 0 && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">
                                                        {getStaticText('Carbohidrați', 'Carbs')}
                                                    </span>
                                                    <span className="nutrition-value">{nutritionData.carbs}g</span>
                                                </div>
                                            )}
                                            {nutritionData.fat > 0 && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">
                                                        {getStaticText('Grăsimi', 'Fat')}
                                                    </span>
                                                    <span className="nutrition-value">{nutritionData.fat}g</span>
                                                </div>
                                            )}
                                            {nutritionData.fiber > 0 && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">
                                                        {getStaticText('Fibre', 'Fiber')}
                                                    </span>
                                                    <span className="nutrition-value">{nutritionData.fiber}g</span>
                                                </div>
                                            )}
                                            {nutritionData.sugar > 0 && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">
                                                        {getStaticText('Zaharuri', 'Sugar')}
                                                    </span>
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
                                    <span className="food-modal-accordion-title">
                                        {getStaticText('Ingrediente', 'Ingredients')}
                                    </span>
                                    {expandedSections.ingredients ? 
                                        <FaChevronUp className="accordion-chevron" /> : 
                                        <FaChevronDown className="accordion-chevron" />
                                    }
                                </div>
                                {expandedSections.ingredients && (
                                    <div className="food-modal-accordion-content">
                                        <ul className={`food-modal-ingredients-list ${getAnimationClass('ingredients')}`}>
                                            {getIngredients().map((ingredient, index) => (
                                                <li key={index} className="ingredient-item">
                                                    {ingredient}
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        <div className="food-modal-dietary-tags">
                                            {dietaryInfo.isGlutenFree && (
                                                <span className="dietary-tag gluten-free">
                                                    {getStaticText('Fără Gluten', 'Gluten Free')}
                                                </span>
                                            )}
                                            {dietaryInfo.isDairyFree && (
                                                <span className="dietary-tag dairy-free">
                                                    {getStaticText('Fără Lapte', 'Dairy Free')}
                                                </span>
                                            )}
                                            {dietaryInfo.isVegetarian && (
                                                <span className="dietary-tag vegetarian">
                                                    {getStaticText('Vegetarian', 'Vegetarian')}
                                                </span>
                                            )}
                                            {dietaryInfo.containsNuts && (
                                                <span className="dietary-tag contains-nuts">
                                                    {getStaticText('Conține Nuci', 'Contains Nuts')}
                                                </span>
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
                                    <span className="food-modal-accordion-title">
                                        {getStaticText('Informații Preparare', 'Preparation Information')}
                                    </span>
                                    {expandedSections.preparation ? 
                                        <FaChevronUp className="accordion-chevron" /> : 
                                        <FaChevronDown className="accordion-chevron" />
                                    }
                                </div>
                                {expandedSections.preparation && (
                                    <div className="food-modal-accordion-content">
                                        <div className="food-modal-preparation-grid">
                                            {getPreparationInfo().cookingTime && (
                                                <div className="preparation-item">
                                                    <span className="preparation-label">
                                                        {getStaticText('Timp preparare', 'Preparation time')}
                                                    </span>
                                                    <span className="preparation-value">{getPreparationInfo().cookingTime}</span>
                                                </div>
                                            )}
                                            {getPreparationInfo().servingSize && (
                                                <div className="preparation-item">
                                                    <span className="preparation-label">
                                                        {getStaticText('Gramaj', 'Serving size')}
                                                    </span>
                                                    <span className="preparation-value">{getPreparationInfo().servingSize}</span>
                                                </div>
                                            )}
                                            {getPreparationInfo().difficulty && (
                                                <div className="preparation-item">
                                                    <span className="preparation-label">
                                                        {getStaticText('Dificultate', 'Difficulty')}
                                                    </span>
                                                    <span className="preparation-value">{getPreparationInfo().difficulty}</span>
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
                                    <span className="food-modal-accordion-title">
                                        {getStaticText('Alergeni', 'Allergens')}
                                    </span>
                                    {expandedSections.allergens ? 
                                        <FaChevronUp className="accordion-chevron" /> : 
                                        <FaChevronDown className="accordion-chevron" />
                                    }
                                </div>
                                {expandedSections.allergens && (
                                    <div className="food-modal-accordion-content">
                                        <div className="food-modal-allergens-list">
                                            {getAllergens().map((allergen, index) => (
                                                <span key={index} className="allergen-tag">
                                                    {allergen}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="food-modal-allergens-disclaimer">
                                            {getStaticText(
                                                '*Vă rugăm să ne anunțați dacă aveți alergii sau restricții alimentare.',
                                                '*Please inform us if you have any allergies or dietary restrictions.'
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
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
                            {isDisabled ? blockedMessage?.text : `${getStaticText('Adaugă', 'Add')} ${calculateTotalPrice().toFixed(2)} €`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodModal;