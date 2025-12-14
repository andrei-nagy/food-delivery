import React, { useContext, useEffect, useState, useRef } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import { FaChevronDown, FaChevronUp, FaFire, FaWeight, FaAllergies, FaClock, FaLeaf, FaInfoCircle, FaUtensils, FaLanguage, FaSync, FaGlobe } from 'react-icons/fa';
import './FoodModal.css';
import { assets } from "../../assets/assets";

const FoodModal = ({ food, closeModal, isOpen }) => {
    const { addToCart, url, canAddToCart, billRequested, userBlocked } = useContext(StoreContext);
    const { currentLanguage } = useLanguage();
    
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
    
    // STATE-URI PENTRU TRADUCERE AUTOMATĂ
    const [targetLanguage, setTargetLanguage] = useState(currentLanguage);
    const [translationEnabled, setTranslationEnabled] = useState(currentLanguage !== 'ro');
    const [isTranslating, setIsTranslating] = useState(false);
    const [translatedContent, setTranslatedContent] = useState({
        foodName: '',
        description: '',
        ingredients: [],
        extras: [],
        preparation: {},
        allergens: [],
        uiTexts: {}
    });
    const [translationAnimations, setTranslationAnimations] = useState({});
    const [translationError, setTranslationError] = useState('');
    
    const modalRef = useRef(null);

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

    // Date pentru secțiuni
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

    // === TEXTURI DE BAZĂ PENTRU TRADUCERE ===
    const baseUITexts = {
        // Badge-uri
        newBadge: "Nou",
        bestSellerBadge: "Cele Mai Vândute", 
        veganBadge: "Vegan",
        
        // Titluri secțiuni
        specialInstructionsTitle: "Instrucțiuni speciale (opțional)",
        extraOptionsTitle: "Extra opțiuni (opțional)",
        nutritionalValuesTitle: "Valori Nutritionale",
        ingredientsTitle: "Ingrediente",
        preparationInfoTitle: "Informații Preparare",
        allergensTitle: "Alergeni",
        
        // Etichete nutriționale
        caloriesLabel: "Calorii",
        proteinLabel: "Proteine",
        carbsLabel: "Carbohidrați",
        fatLabel: "Grăsimi", 
        fiberLabel: "Fibre",
        sugarLabel: "Zaharuri",
        
        // Etichete preparare
        cookingTimeLabel: "Timp preparare",
        servingSizeLabel: "Gramaj",
        difficultyLabel: "Dificultate",
        
        // Tag-uri dietetice
        glutenFreeTag: "Fără Gluten",
        dairyFreeTag: "Fără Lapte",
        vegetarianTag: "Vegetarian",
        containsNutsTag: "Conține Nuci",
        spicyLabel: "Picant",
        
        // Text UI general
        addButton: "Adaugă",
        instructionsPlaceholder: "Ex: fără sos picant, mai puțină sare, etc.",
        allergensDisclaimer: "*Vă rugăm să ne anunțați dacă aveți alergii sau restricții alimentare.",
        
        // Mesaje de eroare
        sessionExpired: "Sesiune Expirată",
        sessionExpiredWarning: "Nu se pot adăuga produse - sesiunea a expirat. Vă rugăm să reîmprospătați pagina.",
        billRequested: "Notă Solicitată",
        billRequestedWarning: "Nu se pot adăuga produse noi. Vă rugăm să anulați mai întâi solicitarea notei de plată."
    };

    // === FUNCȚII PENTRU TRADUCERE RAPIDĂ ===
    
    // Funcție pentru a traduce mai multe texte într-un singur request
    const translateMultipleTexts = async (texts, targetLang) => {
        if (!texts || texts.length === 0 || !targetLang || targetLang === 'ro') {
            return texts;
        }

        try {
            // Combină toate textele într-un singur text pentru traducere
            const combinedText = texts.join(' ||| ');
            
            const response = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(combinedText)}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const translatedCombinedText = data[0]?.map(item => item[0]).join('') || combinedText;
            
            // Sepără textul tradus înapoi în texte individuale
            const translatedTexts = translatedCombinedText.split(' ||| ');
            
            return translatedTexts;
        } catch (error) {
            setTranslationError('Translation service temporarily unavailable.');
            return texts; // Returnează textele originale în caz de eroare
        }
    };

    // Funcție pentru traducerea rapidă a întregului conținut
    const translateAllContentFast = async () => {
        if (!translationEnabled || !food || !targetLanguage || targetLanguage === 'ro') {
            setTranslatedContent({
                foodName: '',
                description: '',
                ingredients: [],
                extras: [],
                preparation: {},
                allergens: [],
                uiTexts: {}
            });
            return;
        }
        
        setIsTranslating(true);
        setTranslationError('');
        
        setTranslationAnimations({
            allContent: 'translating'
        });

        try {
            const translations = {
                foodName: '',
                description: '',
                ingredients: [],
                extras: [],
                preparation: {},
                allergens: [],
                uiTexts: {}
            };

            // 1. Colectează TOATE textele care trebuie traduse
            const allTextsToTranslate = [];
            const textMap = new Map(); // Pentru a ține evidența originii textelor

            // Nume produs
            if (foodName) {
                textMap.set(`name_${allTextsToTranslate.length}`, 'foodName');
                allTextsToTranslate.push(foodName);
            }

            // Descriere
            if (foodDescription) {
                textMap.set(`desc_${allTextsToTranslate.length}`, 'description');
                allTextsToTranslate.push(foodDescription);
            }

            // Ingrediente
            if (ingredientsList.length > 0) {
                ingredientsList.forEach((ingredient, index) => {
                    textMap.set(`ing_${index}`, `ingredient_${index}`);
                    allTextsToTranslate.push(ingredient);
                });
            }

            // Extra opțiuni
            if (foodExtras.length > 0) {
                foodExtras.forEach((extra, index) => {
                    textMap.set(`extra_${index}`, `extra_${index}`);
                    allTextsToTranslate.push(extra.name);
                });
            }

            // Informații preparare
            const preparationFields = ['cookingTime', 'difficulty', 'spiceLevel', 'servingSize'];
            preparationFields.forEach(field => {
                if (preparationInfo[field]) {
                    textMap.set(`prep_${field}`, `preparation_${field}`);
                    allTextsToTranslate.push(preparationInfo[field]);
                }
            });

            // Alergeni
            if (allergens.length > 0) {
                allergens.forEach((allergen, index) => {
                    textMap.set(`alg_${index}`, `allergen_${index}`);
                    allTextsToTranslate.push(allergen);
                });
            }

            // Text UI
            Object.values(baseUITexts).forEach((text, index) => {
                textMap.set(`ui_${index}`, `ui_${Object.keys(baseUITexts)[index]}`);
                allTextsToTranslate.push(text);
            });

            // 2. Traduce TOATE textele într-un singur request
            if (allTextsToTranslate.length > 0) {
                const translatedTexts = await translateMultipleTexts(allTextsToTranslate, targetLanguage);
                
                // 3. Distribuie textele traduse înapoi
                translatedTexts.forEach((translatedText, index) => {
                    const originalKey = Array.from(textMap.keys())[index];
                    const targetField = textMap.get(originalKey);
                    
                    if (targetField.startsWith('foodName')) {
                        translations.foodName = translatedText;
                    } else if (targetField.startsWith('description')) {
                        translations.description = translatedText;
                    } else if (targetField.startsWith('ingredient_')) {
                        const ingIndex = parseInt(targetField.split('_')[1]);
                        if (!translations.ingredients) translations.ingredients = [];
                        translations.ingredients[ingIndex] = translatedText;
                    } else if (targetField.startsWith('extra_')) {
                        const extraIndex = parseInt(targetField.split('_')[1]);
                        if (!translations.extras) translations.extras = [];
                        if (!translations.extras[extraIndex]) {
                            translations.extras[extraIndex] = { ...foodExtras[extraIndex] };
                        }
                        translations.extras[extraIndex].name = translatedText;
                    } else if (targetField.startsWith('preparation_')) {
                        const fieldName = targetField.split('_')[1];
                        if (!translations.preparation) translations.preparation = {};
                        translations.preparation[fieldName] = translatedText;
                    } else if (targetField.startsWith('allergen_')) {
                        const algIndex = parseInt(targetField.split('_')[1]);
                        if (!translations.allergens) translations.allergens = [];
                        translations.allergens[algIndex] = translatedText;
                    } else if (targetField.startsWith('ui_')) {
                        const uiKey = targetField.split('_')[1];
                        if (!translations.uiTexts) translations.uiTexts = {};
                        translations.uiTexts[uiKey] = translatedText;
                    }
                });
            }

            // Completează cu datele originale pentru câmpurile care nu au fost traduse
            if (!translations.foodName) translations.foodName = foodName;
            if (!translations.description) translations.description = foodDescription;
            if (!translations.ingredients || translations.ingredients.length === 0) translations.ingredients = ingredientsList;
            if (!translations.extras || translations.extras.length === 0) translations.extras = foodExtras;
            if (!translations.preparation) translations.preparation = preparationInfo;
            if (!translations.allergens || translations.allergens.length === 0) translations.allergens = allergens;

            setTranslatedContent(translations);
            
            // Finalizează animația rapid
            setTimeout(() => {
                setTranslationAnimations({
                    allContent: 'completed'
                });
            }, 300);

        } catch (error) {
            setTranslationError('Translation service temporarily unavailable. Please try again later.');
            setTranslationAnimations({
                allContent: 'idle'
            });
        } finally {
            setIsTranslating(false);
        }
    };

    // 🔥 EFECT PENTRU TRADUCERE AUTOMATĂ
    useEffect(() => {
        if (isOpen && food) {
            setTargetLanguage(currentLanguage);
            setTranslationEnabled(currentLanguage !== 'ro');
        }
    }, [isOpen, food, currentLanguage]);

    // Efect pentru traducere automată
    useEffect(() => {
        if (translationEnabled && food && targetLanguage && targetLanguage !== 'ro') {
            translateAllContentFast();
        } else {
            setTranslationAnimations({
                allContent: 'fading'
            });
            
            setTimeout(() => {
                setTranslatedContent({
                    foodName: '',
                    description: '',
                    ingredients: [],
                    extras: [],
                    preparation: {},
                    allergens: [],
                    uiTexts: {}
                });
                setTranslationAnimations({
                    allContent: 'idle'
                });
                setTranslationError('');
            }, 200);
        }
    }, [translationEnabled, targetLanguage, food]);

    // === FUNCȚII PENTRU A OBȚINE CONȚINUTUL TRADUS ===
    const getFoodName = () => {
        return translationEnabled && translatedContent.foodName 
            ? translatedContent.foodName 
            : foodName;
    };

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

    const getExtras = () => {
        return translationEnabled && translatedContent.extras && translatedContent.extras.length > 0
            ? translatedContent.extras
            : foodExtras;
    };

    const getPreparationInfo = () => {
        if (translationEnabled && translatedContent.preparation) {
            return { ...preparationInfo, ...translatedContent.preparation };
        }
        return preparationInfo;
    };

    const getAllergens = () => {
        return translationEnabled && translatedContent.allergens.length > 0
            ? translatedContent.allergens
            : allergens;
    };

    // Funcție pentru a obține textul UI tradus
    const getUIText = (textKey) => {
        if (translationEnabled && translatedContent.uiTexts && translatedContent.uiTexts[textKey]) {
            return translatedContent.uiTexts[textKey];
        }
        return baseUITexts[textKey] || textKey;
    };

    // Funcție pentru a obține clasa de animație
    const getAnimationClass = () => {
        const animation = translationAnimations.allContent;
        if (!translationEnabled) return '';
        
        switch (animation) {
            case 'translating': return 'content-translating';
            case 'completed': return 'content-translated';
            case 'fading': return 'content-fading';
            default: return translationEnabled ? 'content-translated' : '';
        }
    };

    // Funcție pentru gestionarea erorilor de imagine
    const handleImageError = () => {
        setImageError(true);
    };

    // Mesajul care va apărea când utilizatorul este blocat
    const getBlockedMessage = () => {
        if (userBlocked) {
            return {
                icon: "⏰",
                text: getUIText('sessionExpired'),
                warningText: getUIText('sessionExpiredWarning')
            };
        }
        if (billRequested) {
            return {
                icon: "🔒", 
                text: getUIText('billRequested'),
                warningText: getUIText('billRequestedWarning')
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
            setTranslationEnabled(currentLanguage !== 'ro');
            setTargetLanguage(currentLanguage);
            setTranslationError('');
            setTimeout(() => {
                document.body.style.overflow = '';
            }, 300);
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, food, currentLanguage]);

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
        if (modalRef.current && modalRef.current.scrollTop > 0) {
            return;
        }
        
        const dragStartY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        if (modalRef.current) {
            modalRef.current.style.transition = 'none';
        }
    };

    const handleDrag = (e) => {
        // Implementare simplificată pentru drag
    };

    const handleDragEnd = () => {
        // Implementare simplificată pentru drag
    };

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
    try {
        if (!food) return 0;
        
        // Verificați toate valorile pentru a evita NaN
        const basePrice = hasDiscount && discountedPrice ? discountedPrice : foodPrice || 0;
        let total = (basePrice || 0) * (selectedQuantity || 1);
        
        selectedOptions.forEach(optionName => {
            const extra = foodExtras.find(extra => extra.name === optionName);
            if (extra && extra.price) {
                total += (extra.price || 0) * (selectedQuantity || 1);
            }
        });
        
        // Asigurați-vă că returnați un număr valid
        return isNaN(total) ? 0 : total;
    } catch (error) {
        console.error("Error calculating total price:", error);
        return 0;
    }
};

    const handleAddToCart = () => {
        if (isDisabled) {
            closeModal();
            return;
        }

        if (!food) {
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
                        <h2 className={`food-modal-title ${getAnimationClass()}`}>
                            {getFoodName()}
                        </h2>
                        <div className="food-modal-translation-controls">
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
                    
                    {/* Translation Error Banner */}
                    {translationError && (
                        <div className="food-modal-warning translation-warning">
                            <div className="food-modal-warning-content">
                                <span className="food-modal-warning-icon">⚠️</span>
                                <div className="food-modal-warning-text">
                                    <span>{translationError}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Imaginea principală */}
                    <img 
                        src={imageError ? assets.image_coming_soon : (url + "/images/" + foodImage)} 
                        alt={getFoodName()} 
                        className={`food-modal-image ${isDisabled ? 'disabled-image' : ''} ${imageError ? 'image-error' : ''}`}
                        onError={handleImageError}
                    />
                    
                    {/* Badge-uri */}
                    {(isVegan || isBestSeller || isNewAdded) && !isDisabled && (
                        <div className="food-modal-badges">
                            {isNewAdded && (
                                <span className="food-modal-badge food-modal-badge-new">
                                    {getUIText('newBadge')}
                                </span>
                            )}
                            {isVegan && (
                                <span className="food-modal-badge food-modal-badge-vegan">
                                    {getUIText('veganBadge')}
                                </span>
                            )}
                            {isBestSeller && (
                                <span className="food-modal-badge food-modal-badge-bestseller">
                                    {getUIText('bestSellerBadge')}
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
                                        {getUIText('spicyLabel')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DESCRIERE */}
                    {getDescription() && (
                        <div className="food-modal-section">
                            <div className={`food-modal-description-static ${getAnimationClass()}`}>
                                <p className="food-modal-description-text">{getDescription()}</p>
                            </div>
                        </div>
                    )}

                    {/* Instrucțiuni speciale */}
                    {!isDisabled && (
                        <div className="food-modal-section">
                            <h3 className="food-modal-section-title">
                                {getUIText('specialInstructionsTitle')}
                            </h3>
                            <textarea
                                className="food-modal-textarea"
                                placeholder={getUIText('instructionsPlaceholder')}
                                value={specialInstructions}
                                onChange={(e) => setSpecialInstructions(e.target.value)}
                                disabled={isDisabled}
                            />
                        </div>
                    )}   

                    {/* Extra opțiuni */}
                    {getExtras().length > 0 && !isDisabled && (
                        <div className="food-modal-section">
                            <h3 className="food-modal-section-title">
                                {getUIText('extraOptionsTitle')}
                            </h3>
                            <div className="food-modal-options-modern">
                                {getExtras().map((extra) => (
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
                                                <span className={`option-modern-name ${getAnimationClass()}`}>
                                                    {extra.name}
                                                </span>
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

                    {/* ACCORDION: Valori nutritionale */}
                    {shouldShowNutrition && (
                        <div className="food-modal-section">
                            <div 
                                className={`food-modal-accordion ${expandedSections.nutrition ? 'expanded' : ''}`}
                                onClick={() => toggleSection('nutrition')}
                            >
                                <div className="food-modal-accordion-header">
                                    <FaFire className="accordion-icon" />
                                    <span className="food-modal-accordion-title">
                                        {getUIText('nutritionalValuesTitle')}
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
                                                        {getUIText('caloriesLabel')}
                                                    </span>
                                                    <span className="nutrition-value">{nutritionData.calories} kcal</span>
                                                </div>
                                            )}
                                            {nutritionData.protein > 0 && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">
                                                        {getUIText('proteinLabel')}
                                                    </span>
                                                    <span className="nutrition-value">{nutritionData.protein}g</span>
                                                </div>
                                            )}
                                            {nutritionData.carbs > 0 && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">
                                                        {getUIText('carbsLabel')}
                                                    </span>
                                                    <span className="nutrition-value">{nutritionData.carbs}g</span>
                                                </div>
                                            )}
                                            {nutritionData.fat > 0 && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">
                                                        {getUIText('fatLabel')}
                                                    </span>
                                                    <span className="nutrition-value">{nutritionData.fat}g</span>
                                                </div>
                                            )}
                                            {nutritionData.fiber > 0 && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">
                                                        {getUIText('fiberLabel')}
                                                    </span>
                                                    <span className="nutrition-value">{nutritionData.fiber}g</span>
                                                </div>
                                            )}
                                            {nutritionData.sugar > 0 && (
                                                <div className="nutrition-item">
                                                    <span className="nutrition-label">
                                                        {getUIText('sugarLabel')}
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

                    {/* ACCORDION: Ingrediente */}
                    {shouldShowIngredients && (
                        <div className="food-modal-section">
                            <div 
                                className={`food-modal-accordion ${expandedSections.ingredients ? 'expanded' : ''}`}
                                onClick={() => toggleSection('ingredients')}
                            >
                                <div className="food-modal-accordion-header">
                                    <FaUtensils className="accordion-icon" />
                                    <span className="food-modal-accordion-title">
                                        {getUIText('ingredientsTitle')}
                                    </span>
                                    {expandedSections.ingredients ? 
                                        <FaChevronUp className="accordion-chevron" /> : 
                                        <FaChevronDown className="accordion-chevron" />
                                    }
                                </div>
                                {expandedSections.ingredients && (
                                    <div className="food-modal-accordion-content">
                                        <ul className={`food-modal-ingredients-list ${getAnimationClass()}`}>
                                            {getIngredients().map((ingredient, index) => (
                                                <li key={index} className="ingredient-item">
                                                    {ingredient}
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        <div className="food-modal-dietary-tags">
                                            {dietaryInfo.isGlutenFree && (
                                                <span className="dietary-tag gluten-free">
                                                    {getUIText('glutenFreeTag')}
                                                </span>
                                            )}
                                            {dietaryInfo.isDairyFree && (
                                                <span className="dietary-tag dairy-free">
                                                    {getUIText('dairyFreeTag')}
                                                </span>
                                            )}
                                            {dietaryInfo.isVegetarian && (
                                                <span className="dietary-tag vegetarian">
                                                    {getUIText('vegetarianTag')}
                                                </span>
                                            )}
                                            {dietaryInfo.containsNuts && (
                                                <span className="dietary-tag contains-nuts">
                                                    {getUIText('containsNutsTag')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ACCORDION: Informații preparare */}
                    {shouldShowPreparation && (
                        <div className="food-modal-section">
                            <div 
                                className={`food-modal-accordion ${expandedSections.preparation ? 'expanded' : ''}`}
                                onClick={() => toggleSection('preparation')}
                            >
                                <div className="food-modal-accordion-header">
                                    <FaClock className="accordion-icon" />
                                    <span className="food-modal-accordion-title">
                                        {getUIText('preparationInfoTitle')}
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
                                                        {getUIText('cookingTimeLabel')}
                                                    </span>
                                                    <span className="preparation-value">{getPreparationInfo().cookingTime}</span>
                                                </div>
                                            )}
                                            {getPreparationInfo().servingSize && (
                                                <div className="preparation-item">
                                                    <span className="preparation-label">
                                                        {getUIText('servingSizeLabel')}
                                                    </span>
                                                    <span className="preparation-value">{getPreparationInfo().servingSize}</span>
                                                </div>
                                            )}
                                            {getPreparationInfo().difficulty && (
                                                <div className="preparation-item">
                                                    <span className="preparation-label">
                                                        {getUIText('difficultyLabel')}
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

                    {/* ACCORDION: Alergeni */}
                    {shouldShowAllergens && (
                        <div className="food-modal-section">
                            <div 
                                className={`food-modal-accordion ${expandedSections.allergens ? 'expanded' : ''}`}
                                onClick={() => toggleSection('allergens')}
                            >
                                <div className="food-modal-accordion-header">
                                    <FaAllergies className="accordion-icon" />
                                    <span className="food-modal-accordion-title">
                                        {getUIText('allergensTitle')}
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
                                            {getUIText('allergensDisclaimer')}
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
                                disabled={isDisabled}
                            >-</button>
                            <span className="food-modal-qty-value">{selectedQuantity}</span>
                            <button 
                                className="food-modal-qty-btn" 
                                onClick={handleQtyButton(increase)}
                                disabled={isDisabled}
                            >+</button>
                        </div>
                      <button 
    className={`food-modal-add-btn ${isDisabled ? 'food-modal-add-btn-disabled' : ''}`} 
    onClick={handleAddButton}
    disabled={isDisabled}
>
    {isDisabled ? blockedMessage?.text : `${translationEnabled && currentLanguage === 'en' ? 'Add' : 'Adaugă'} ${calculateTotalPrice().toFixed(2)} €`}
</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodModal;