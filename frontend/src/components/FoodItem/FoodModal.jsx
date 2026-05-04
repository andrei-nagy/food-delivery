import React, { useContext, useEffect, useState, useRef } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  FaChevronDown, FaChevronUp, FaFire, FaWeight,
  FaAllergies, FaClock, FaUtensils
} from 'react-icons/fa';
import './FoodModal.css';
import { assets } from "../../assets/assets";
import DeliveryToast from "../DeliveryToast/DeliveryToast";

const FoodModal = ({ food, closeModal, isOpen }) => {
  const { addToCart, url, canAddToCart, billRequested, userBlocked, restaurantData } = useContext(StoreContext);
  const { currentLanguage } = useLanguage();

  const [selectedQuantity, setSelectedQuantity]       = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isVisible, setIsVisible]                     = useState(false);
  const [selectedOptions, setSelectedOptions]         = useState([]);
  const [validationError, setValidationError]         = useState("");
  const [imageError, setImageError]                   = useState(false);
  const [expandedSections, setExpandedSections]       = useState({
    nutrition: false, ingredients: false, preparation: false, allergens: false
  });
  const [targetLanguage, setTargetLanguage]               = useState(currentLanguage);
  const [translationEnabled, setTranslationEnabled]       = useState(currentLanguage !== 'ro');
  const [isTranslating, setIsTranslating]                 = useState(false);
  const [translatedContent, setTranslatedContent]         = useState({
    foodName: '', description: '', ingredients: [],
    extras: [], preparation: {}, allergens: [], uiTexts: {}
  });
  const [translationAnimations, setTranslationAnimations] = useState({});
  const [translationError, setTranslationError]           = useState('');
  const [toasts, setToasts]                               = useState([]);

  // swipe to close
  const [dragY, setDragY]       = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart               = useRef(null);

  const modalRef = useRef(null);
  const scrollRef = useRef(null);

  const isDisabled = billRequested || userBlocked;

  const currency         = restaurantData?.currency         || '€';
  const currencyPosition = restaurantData?.currencyPosition || 'after';

  const formatPrice = (priceValue, showCurrency = true) => {
    if (!priceValue && priceValue !== 0) return '';
    const n = typeof priceValue === 'string' ? parseFloat(priceValue) : priceValue;
    const f = n.toFixed(2);
    if (!showCurrency) return f;
    const nbsp = '\u00A0';
    return currencyPosition === 'before' ? `${currency}${nbsp}${f}` : `${f}${nbsp}${currency}`;
  };

  const foodDescription    = food?.description        || "";
  const foodName           = food?.name               || "";
  const foodPrice          = food?.price              || 0;
  const foodImage          = food?.image              || "";
  const foodExtras         = food?.extras             || [];
  const foodId             = food?._id                || "";
  const isVegan            = food?.isVegan            || false;
  const isBestSeller       = food?.isBestSeller       || false;
  const isNewAdded         = food?.isNewAdded         || false;
  const discountPercentage = food?.discountPercentage || 0;
  const discountedPrice    = food?.discountedPrice    || foodPrice;
  const hasDiscount        = discountPercentage > 0;

  const nutritionData   = food?.nutrition    || { calories:0, protein:0, carbs:0, fat:0, fiber:0, sugar:0 };
  const allergens       = Array.isArray(food?.allergens) ? food.allergens : [];
  const preparationInfo = food?.preparation || { cookingTime:"", spiceLevel:"", servingSize:"", difficulty:"" };
  const ingredientsList = Array.isArray(food?.ingredients) && food.ingredients.length > 0
    ? food.ingredients
    : (food?.ingredients && typeof food.ingredients === 'string'
        ? food.ingredients.split(',').map(i => i.trim()).filter(i => i)
        : []);
  const dietaryInfo = food?.dietaryInfo || {
    isGlutenFree:false, isDairyFree:false, isVegetarian:false, isSpicy:false, containsNuts:false
  };

  const baseUITexts = {
    newBadge:"Nou", bestSellerBadge:"Best Seller", veganBadge:"Vegan",
    specialInstructionsTitle:"Instrucțiuni speciale (opțional)",
    extraOptionsTitle:"Extra opțiuni (opțional)",
    nutritionalValuesTitle:"Valori Nutritionale", ingredientsTitle:"Ingrediente",
    preparationInfoTitle:"Informații Preparare", allergensTitle:"Alergeni",
    caloriesLabel:"Calorii", proteinLabel:"Proteine", carbsLabel:"Carbohidrați",
    fatLabel:"Grăsimi", fiberLabel:"Fibre", sugarLabel:"Zaharuri",
    cookingTimeLabel:"Timp preparare", servingSizeLabel:"Gramaj",
    difficultyLabel:"Dificultate", glutenFreeTag:"Fără Gluten",
    dairyFreeTag:"Fără Lapte", vegetarianTag:"Vegetarian",
    containsNutsTag:"Conține Nuci", spicyLabel:"Picant",
    addButton:"Adaugă în coș",
    instructionsPlaceholder:"Ex: fără sos picant, mai puțină sare, etc.",
    allergensDisclaimer:"*Vă rugăm să ne anunțați dacă aveți alergii.",
    sessionExpired:"Sesiune Expirată", sessionExpiredWarning:"Nu se pot adăuga produse.",
    billRequested:"Notă Solicitată", billRequestedWarning:"Nu se pot adăuga produse noi."
  };

  /* ── TRADUCERI ── */
  const translateMultipleTexts = async (texts, targetLang) => {
    if (!texts?.length || !targetLang || targetLang === 'ro') return texts;
    try {
      const SEP = ' [###] ';
      const resp = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(texts.join(SEP))}`
      );
      if (!resp.ok) throw new Error('HTTP error');
      const data = await resp.json();
      const joined = data[0]?.map(i => i[0]).join('') || texts.join(SEP);
      const arr = joined.split(SEP);
      return arr.length === texts.length ? arr.map(t => t.trim()) : texts;
    } catch {
      setTranslationError('Translation service temporarily unavailable.');
      return texts;
    }
  };

  const translateAllContentFast = async () => {
    if (!translationEnabled || !food || !targetLanguage || targetLanguage === 'ro') {
      setTranslatedContent({ foodName:'', description:'', ingredients:[], extras:[], preparation:{}, allergens:[], uiTexts:{} });
      return;
    }
    setIsTranslating(true);
    setTranslationError('');
    setTranslationAnimations({ allContent:'translating' });
    try {
      const translations = { foodName:'', description:'', ingredients:[], extras:[], preparation:{}, allergens:[], uiTexts:{} };
      const allTexts = [];
      const map = new Map();

      if (foodName)        { map.set(allTexts.length, 'foodName');    allTexts.push(foodName); }
      if (foodDescription) { map.set(allTexts.length, 'description'); allTexts.push(foodDescription); }
      ingredientsList.forEach((s,i) => { map.set(allTexts.length, `ingredient_${i}`); allTexts.push(s); });
      foodExtras.forEach((e,i)       => { map.set(allTexts.length, `extra_${i}`);     allTexts.push(e.name); });
      ['cookingTime','difficulty','spiceLevel','servingSize'].forEach(f => {
        if (preparationInfo[f]) { map.set(allTexts.length, `preparation_${f}`); allTexts.push(preparationInfo[f]); }
      });
      allergens.forEach((a,i) => { map.set(allTexts.length, `allergen_${i}`); allTexts.push(a); });
      Object.entries(baseUITexts).forEach(([k,v]) => {
        if (v?.trim()) { map.set(allTexts.length, `ui_${k}`); allTexts.push(v); }
      });

      if (allTexts.length) {
        const translated = await translateMultipleTexts(allTexts, targetLanguage);
        translated.forEach((txt, idx) => {
          const key = map.get(idx);
          if (!key) return;
          if (key === 'foodName')           translations.foodName = txt;
          else if (key === 'description')   translations.description = txt;
          else if (key.startsWith('ingredient_')) { const i=parseInt(key.split('_')[1]); translations.ingredients[i]=txt; }
          else if (key.startsWith('extra_'))      { const i=parseInt(key.split('_')[1]); if(!translations.extras[i]) translations.extras[i]={...foodExtras[i]}; translations.extras[i].name=txt; }
          else if (key.startsWith('preparation_')) translations.preparation[key.split('_')[1]]=txt;
          else if (key.startsWith('allergen_'))   { const i=parseInt(key.split('_')[1]); translations.allergens[i]=txt; }
          else if (key.startsWith('ui_'))         translations.uiTexts[key.slice(3)]=txt;
        });
      }

      if (!translations.foodName)    translations.foodName    = foodName;
      if (!translations.description) translations.description = foodDescription;
      if (!translations.ingredients?.length) translations.ingredients = ingredientsList;
      if (!translations.extras?.length)      translations.extras      = foodExtras;
      if (!Object.keys(translations.preparation||{}).length) translations.preparation = preparationInfo;
      if (!translations.allergens?.length)   translations.allergens   = allergens;
      if (!Object.keys(translations.uiTexts||{}).length) {
        translations.uiTexts = {};
        Object.keys(baseUITexts).forEach(k => { translations.uiTexts[k] = baseUITexts[k]; });
      }

      setTranslatedContent(translations);
      setTimeout(() => setTranslationAnimations({ allContent:'completed' }), 300);
    } catch {
      setTranslationError('Translation service temporarily unavailable.');
      setTranslationAnimations({ allContent:'idle' });
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    if (isOpen && food) {
      setTargetLanguage(currentLanguage);
      setTranslationEnabled(currentLanguage !== 'ro');
    }
  }, [isOpen, food, currentLanguage]);

  useEffect(() => {
    if (translationEnabled && food && targetLanguage && targetLanguage !== 'ro') {
      translateAllContentFast();
    } else {
      setTranslationAnimations({ allContent:'fading' });
      setTimeout(() => {
        setTranslatedContent({ foodName:'', description:'', ingredients:[], extras:[], preparation:{}, allergens:[], uiTexts:{} });
        setTranslationAnimations({ allContent:'idle' });
        setTranslationError('');
      }, 200);
    }
  }, [translationEnabled, targetLanguage, food]);

  /* ── GETTERS ── */
  const getFoodName        = () => (translationEnabled && translatedContent.foodName)    ? translatedContent.foodName    : foodName;
  const getDescription     = () => (translationEnabled && translatedContent.description) ? translatedContent.description : foodDescription;
  const getIngredients     = () => (translationEnabled && translatedContent.ingredients?.length) ? translatedContent.ingredients : ingredientsList;
  const getExtras          = () => (translationEnabled && translatedContent.extras?.length)      ? translatedContent.extras      : foodExtras;
  const getPreparationInfo = () => translationEnabled && translatedContent.preparation
    ? { ...preparationInfo, ...translatedContent.preparation } : preparationInfo;
  const getAllergens        = () => (translationEnabled && translatedContent.allergens?.length) ? translatedContent.allergens : allergens;
  const getUIText          = (k) => (translationEnabled && translatedContent.uiTexts?.[k]) ? translatedContent.uiTexts[k] : (baseUITexts[k] || k);
  const getAnimationClass  = () => {
    if (!translationEnabled) return '';
    const a = translationAnimations.allContent;
    if (a === 'translating') return 'content-translating';
    if (a === 'completed')   return 'content-translated';
    if (a === 'fading')      return 'content-fading';
    return translationEnabled ? 'content-translated' : '';
  };

  const getBlockedMessage = () => {
    if (userBlocked)   return { icon:"⏰", text:getUIText('sessionExpired'),  warningText:getUIText('sessionExpiredWarning') };
    if (billRequested) return { icon:"🔒", text:getUIText('billRequested'),   warningText:getUIText('billRequestedWarning')  };
    return null;
  };
  const blockedMessage = getBlockedMessage();

  /* ── LIFECYCLE ── */
  useEffect(() => {
    if (isOpen && food) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      setSelectedOptions([]);
      setValidationError("");
      setImageError(false);
      setExpandedSections({ nutrition:false, ingredients:false, preparation:false, allergens:false });
      setTranslationEnabled(currentLanguage !== 'ro');
      setTargetLanguage(currentLanguage);
      setTranslationError('');
      setDragY(0);
      setIsDragging(false);
      dragStart.current = null;
      setTimeout(() => { document.body.style.overflow = ''; }, 300);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, food, currentLanguage]);

  /* ── SWIPE TO CLOSE ── */
  const handleTouchStartModal = (e) => {
    const scrollTop = scrollRef.current?.scrollTop || 0;
    if (scrollTop > 0) return;
    dragStart.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMoveModal = (e) => {
    if (!isDragging || dragStart.current === null) return;
    const scrollTop = scrollRef.current?.scrollTop || 0;
    if (scrollTop > 0) {
      dragStart.current = null;
      setIsDragging(false);
      setDragY(0);
      return;
    }
    const delta = e.touches[0].clientY - dragStart.current;
    if (delta > 0) {
      setDragY(delta);
      e.preventDefault();
    }
  };

  const handleTouchEndModal = () => {
    setIsDragging(false);
    if (dragY > 120) {
      closeModal();
    }
    setDragY(0);
    dragStart.current = null;
  };

  /* ── HANDLERS ── */
  const handleOptionChange = (option) => {
    if (isDisabled) return;
    setValidationError("");
    setSelectedOptions(prev => prev.includes(option) ? prev.filter(i => i !== option) : [...prev, option]);
  };
  const toggleSection = (s) => {
    if (isDisabled) return;
    setExpandedSections(prev => ({ ...prev, [s]:!prev[s] }));
  };
  const increase = () => { if (!isDisabled) setSelectedQuantity(q => q + 1); };
  const decrease = () => { if (!isDisabled) setSelectedQuantity(q => Math.max(1, q - 1)); };

  const generateCartItemId = () => {
    if (!foodId) return "";
    const extrasStr = selectedOptions.sort().join(',');
    const instrHash = specialInstructions ? btoa(specialInstructions).substring(0,8).replace(/=/g,'') : '';
    if (extrasStr && instrHash) return `${foodId}__${btoa(extrasStr).replace(/=/g,'')}__${instrHash}`;
    if (extrasStr)               return `${foodId}__${btoa(extrasStr).replace(/=/g,'')}`;
    if (instrHash)               return `${foodId}____${instrHash}`;
    return `${foodId}__`;
  };

  const calculateTotalPrice = () => {
    try {
      if (!food) return 0;
      const base = hasDiscount && discountedPrice ? discountedPrice : foodPrice || 0;
      let total = base * (selectedQuantity || 1);
      selectedOptions.forEach(opt => {
        const extra = foodExtras.find(e => e.name === opt);
        if (extra?.price) total += extra.price * (selectedQuantity || 1);
      });
      return isNaN(total) ? 0 : total;
    } catch { return 0; }
  };

  const handleAddToCart = () => {
    if (isDisabled || !food) { closeModal(); return; }
    const cartItemId  = generateCartItemId();
    const extrasPrice = selectedOptions.reduce((sum, opt) => {
      const e = foodExtras.find(x => x.name === opt);
      return sum + (e?.price || 0);
    }, 0);
    addToCart(cartItemId, selectedQuantity, specialInstructions, selectedOptions, {
      baseFoodId:foodId, quantity:selectedQuantity,
      specialInstructions, selectedOptions,
      unitPrice:discountedPrice, extrasPrice, extras:foodExtras
    });
    const extrasLabel = selectedOptions.length > 0 ? ` + ${selectedOptions.length} extra` : "";
    const label = `${selectedQuantity > 1 ? `${selectedQuantity}× ` : ""}${getFoodName()}${extrasLabel}`;
    setToasts(prev => [...prev, { id:`modal-${Date.now()}`, subtitle:label }]);
    closeModal();
  };

  const handleAddButton = (e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(); };
  const handleQtyButton = (action) => (e) => { e.preventDefault(); e.stopPropagation(); action(); };

  const shouldShowNutrition   = nutritionData.calories > 0 || nutritionData.protein > 0 || nutritionData.carbs > 0;
  const shouldShowIngredients = getIngredients().length > 0;
  const shouldShowPreparation = getPreparationInfo().cookingTime || getPreparationInfo().servingSize || getPreparationInfo().difficulty;
  const shouldShowAllergens   = getAllergens().length > 0;

  const imageUrl = imageError ? assets.image_coming_soon : (url + "/images/" + foodImage);

  if (!isOpen || !food) return null;

  return (
    <>
      <div
        className={`food-modal-overlay ${isVisible ? 'active' : ''}`}
        onClick={closeModal}
      >
        <div
          className={`food-modal-container ${isDisabled ? 'bill-requested-modal' : ''}`}
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStartModal}
          onTouchMove={handleTouchMoveModal}
          onTouchEnd={handleTouchEndModal}
          style={{
            transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
            transition: isDragging ? 'none' : 'transform .42s var(--ease)',
          }}
        >
          {/* ══ IMAGINE FULL ══ */}
          <div className="fm4-img-wrap">
            <img
              src={imageUrl}
              alt={getFoodName()}
              className="fm4-img"
              onError={() => setImageError(true)}
            />
            <div className="fm4-img-gradient" />

            <button className="fm4-back-btn" onClick={closeModal}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>

            <button className="fm4-close-btn" onClick={closeModal}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {hasDiscount && (
              <span className="fm4-disc-pill">-{discountPercentage}%</span>
            )}
          </div>

          {/* ══ SCROLL CONTENT ══ */}
          <div className="fm4-scroll" ref={scrollRef}>
            <div className="fm4-card">
              <div className="fm4-drag" />

              {/* Warnings */}
              {isDisabled && blockedMessage && (
                <div className="fm4-warning">
                  <span className="fm4-warning-ico">{blockedMessage.icon}</span>
                  <div>
                    <strong>{blockedMessage.text}</strong>
                    <span>{blockedMessage.warningText}</span>
                  </div>
                </div>
              )}
              {translationError && (
                <div className="fm4-warning fm4-warning--red">
                  <span className="fm4-warning-ico">⚠️</span>
                  <div><span>{translationError}</span></div>
                </div>
              )}

              {/* Nume + pret */}
              <div className="fm4-name-row">
                <h2 className={`fm4-name ${getAnimationClass()}`}>{getFoodName()}</h2>
                <div className="fm4-price-block">
                  <span className="fm4-price">
                    {hasDiscount ? formatPrice(discountedPrice) : formatPrice(foodPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="fm4-price-orig">{formatPrice(foodPrice)}</span>
                  )}
                </div>
              </div>

              {/* Tags */}
              {(isVegan || isBestSeller || isNewAdded || dietaryInfo?.isSpicy) && !isDisabled && (
                <div className="fm4-tags">
                  {isNewAdded           && <span className="fm4-tag fm4-tag--blue">Nou</span>}
                  {isVegan              && <span className="fm4-tag fm4-tag--green">Vegan</span>}
                  {isBestSeller         && <span className="fm4-tag fm4-tag--amber">Best Seller</span>}
                  {dietaryInfo?.isSpicy && <span className="fm4-tag fm4-tag--orange">Picant 🌶️</span>}
                </div>
              )}

              {/* Stats */}
              {(nutritionData.calories > 0 || getPreparationInfo().servingSize ||
                getPreparationInfo().cookingTime || getPreparationInfo().difficulty) && (
                <div className="fm4-stats">
                  {nutritionData.calories > 0 && (
                    <div className="fm4-stat">
                      <span className="fm4-stat-val">{nutritionData.calories}</span>
                      <span className="fm4-stat-lbl">Kcal</span>
                    </div>
                  )}
                  {getPreparationInfo().servingSize && (
                    <div className="fm4-stat">
                      <span className="fm4-stat-val">{getPreparationInfo().servingSize}</span>
                      <span className="fm4-stat-lbl">Gramaj</span>
                    </div>
                  )}
                  {getPreparationInfo().cookingTime && (
                    <div className="fm4-stat">
                      <span className="fm4-stat-val">{getPreparationInfo().cookingTime}</span>
                      <span className="fm4-stat-lbl">Timp</span>
                    </div>
                  )}
                  {getPreparationInfo().difficulty && (
                    <div className="fm4-stat">
                      <span className="fm4-stat-val">{getPreparationInfo().difficulty}</span>
                      <span className="fm4-stat-lbl">Nivel</span>
                    </div>
                  )}
                </div>
              )}

              {/* Descriere */}
              {getDescription() && (
                <p className={`fm4-desc ${getAnimationClass()}`}>{getDescription()}</p>
              )}

              {/* Instructiuni speciale */}
              {!isDisabled && (
                <div className="fm4-section">
                  <h3 className="fm4-section-title">{getUIText('specialInstructionsTitle')}</h3>
                  <textarea
                    className="fm4-textarea"
                    placeholder={getUIText('instructionsPlaceholder')}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                  />
                </div>
              )}

              {/* Extras */}
              {getExtras().length > 0 && !isDisabled && (
                <div className="fm4-section">
                  <h3 className="fm4-section-title">{getUIText('extraOptionsTitle')}</h3>
                  <div className="fm4-extras">
                    {getExtras().map((extra) => (
                      <label
                        key={extra._id || extra.name}
                        className={`fm4-extra ${selectedOptions.includes(extra.name) ? 'selected' : ''}`}
                      >
                        <div className="fm4-extra-check">
                          <input
                            type="checkbox"
                            checked={selectedOptions.includes(extra.name)}
                            onChange={() => handleOptionChange(extra.name)}
                          />
                          <span className="fm4-checkmark" />
                        </div>
                        <span className={`fm4-extra-name ${getAnimationClass()}`}>{extra.name}</span>
                        <span className="fm4-extra-price">+{formatPrice(extra.price)}</span>
                      </label>
                    ))}
                  </div>
                  {validationError && <div className="fm4-error">{validationError}</div>}
                </div>
              )}

              {/* Nutritie */}
              {shouldShowNutrition && (
                <div className="fm4-section">
                  <div
                    className={`fm4-accordion ${expandedSections.nutrition ? 'open' : ''}`}
                    onClick={() => toggleSection('nutrition')}
                  >
                    <div className="fm4-accordion-hd">
                      <FaFire className="fm4-acc-ico" />
                      <span className="fm4-acc-title">{getUIText('nutritionalValuesTitle')}</span>
                      {expandedSections.nutrition
                        ? <FaChevronUp className="fm4-acc-chev" />
                        : <FaChevronDown className="fm4-acc-chev" />}
                    </div>
                    {expandedSections.nutrition && (
                      <div className="fm4-accordion-body">
                        <div className="fm4-grid-2">
                          {nutritionData.calories > 0 && <div className="fm4-grid-item"><span className="fm4-grid-lbl">{getUIText('caloriesLabel')}</span><span className="fm4-grid-val">{nutritionData.calories} kcal</span></div>}
                          {nutritionData.protein  > 0 && <div className="fm4-grid-item"><span className="fm4-grid-lbl">{getUIText('proteinLabel')}</span><span className="fm4-grid-val">{nutritionData.protein}g</span></div>}
                          {nutritionData.carbs    > 0 && <div className="fm4-grid-item"><span className="fm4-grid-lbl">{getUIText('carbsLabel')}</span><span className="fm4-grid-val">{nutritionData.carbs}g</span></div>}
                          {nutritionData.fat      > 0 && <div className="fm4-grid-item"><span className="fm4-grid-lbl">{getUIText('fatLabel')}</span><span className="fm4-grid-val">{nutritionData.fat}g</span></div>}
                          {nutritionData.fiber    > 0 && <div className="fm4-grid-item"><span className="fm4-grid-lbl">{getUIText('fiberLabel')}</span><span className="fm4-grid-val">{nutritionData.fiber}g</span></div>}
                          {nutritionData.sugar    > 0 && <div className="fm4-grid-item"><span className="fm4-grid-lbl">{getUIText('sugarLabel')}</span><span className="fm4-grid-val">{nutritionData.sugar}g</span></div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ingrediente */}
              {shouldShowIngredients && (
                <div className="fm4-section">
                  <div
                    className={`fm4-accordion ${expandedSections.ingredients ? 'open' : ''}`}
                    onClick={() => toggleSection('ingredients')}
                  >
                    <div className="fm4-accordion-hd">
                      <FaUtensils className="fm4-acc-ico" />
                      <span className="fm4-acc-title">{getUIText('ingredientsTitle')}</span>
                      {expandedSections.ingredients
                        ? <FaChevronUp className="fm4-acc-chev" />
                        : <FaChevronDown className="fm4-acc-chev" />}
                    </div>
                    {expandedSections.ingredients && (
                      <div className="fm4-accordion-body">
                        <ul className={`fm4-ing-list ${getAnimationClass()}`}>
                          {getIngredients().map((ing, i) => (
                            <li key={i} className="fm4-ing-item">{ing}</li>
                          ))}
                        </ul>
                        <div className="fm4-dietary-tags">
                          {dietaryInfo.isGlutenFree && <span className="fm4-dtag green">{getUIText('glutenFreeTag')}</span>}
                          {dietaryInfo.isDairyFree  && <span className="fm4-dtag blue">{getUIText('dairyFreeTag')}</span>}
                          {dietaryInfo.isVegetarian && <span className="fm4-dtag purple">{getUIText('vegetarianTag')}</span>}
                          {dietaryInfo.containsNuts && <span className="fm4-dtag amber">{getUIText('containsNutsTag')}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preparare */}
              {shouldShowPreparation && (
                <div className="fm4-section">
                  <div
                    className={`fm4-accordion ${expandedSections.preparation ? 'open' : ''}`}
                    onClick={() => toggleSection('preparation')}
                  >
                    <div className="fm4-accordion-hd">
                      <FaClock className="fm4-acc-ico" />
                      <span className="fm4-acc-title">{getUIText('preparationInfoTitle')}</span>
                      {expandedSections.preparation
                        ? <FaChevronUp className="fm4-acc-chev" />
                        : <FaChevronDown className="fm4-acc-chev" />}
                    </div>
                    {expandedSections.preparation && (
                      <div className="fm4-accordion-body">
                        <div className="fm4-grid-2">
                          {getPreparationInfo().cookingTime && <div className="fm4-grid-item"><span className="fm4-grid-lbl">{getUIText('cookingTimeLabel')}</span><span className="fm4-grid-val">{getPreparationInfo().cookingTime}</span></div>}
                          {getPreparationInfo().servingSize && <div className="fm4-grid-item"><span className="fm4-grid-lbl">{getUIText('servingSizeLabel')}</span><span className="fm4-grid-val">{getPreparationInfo().servingSize}</span></div>}
                          {getPreparationInfo().difficulty  && <div className="fm4-grid-item"><span className="fm4-grid-lbl">{getUIText('difficultyLabel')}</span><span className="fm4-grid-val">{getPreparationInfo().difficulty}</span></div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Alergeni */}
              {shouldShowAllergens && (
                <div className="fm4-section">
                  <div
                    className={`fm4-accordion ${expandedSections.allergens ? 'open' : ''}`}
                    onClick={() => toggleSection('allergens')}
                  >
                    <div className="fm4-accordion-hd">
                      <FaAllergies className="fm4-acc-ico" />
                      <span className="fm4-acc-title">{getUIText('allergensTitle')}</span>
                      {expandedSections.allergens
                        ? <FaChevronUp className="fm4-acc-chev" />
                        : <FaChevronDown className="fm4-acc-chev" />}
                    </div>
                    {expandedSections.allergens && (
                      <div className="fm4-accordion-body">
                        <div className="fm4-allergens">
                          {getAllergens().map((a, i) => (
                            <span key={i} className="fm4-allergen">{a}</span>
                          ))}
                        </div>
                        <p className="fm4-allergen-disc">{getUIText('allergensDisclaimer')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ height:'8px' }} />
            </div>
          </div>

          {/* ══ CTA FIX JOS ══ */}
          <div className="fm4-cta">
            <div className={`fm4-qty ${isDisabled ? 'fm4-qty--disabled' : ''}`}>
              <button className="fm4-qbtn" onClick={handleQtyButton(decrease)} disabled={isDisabled}>−</button>
              <span className="fm4-qval">{selectedQuantity}</span>
              <button className="fm4-qbtn" onClick={handleQtyButton(increase)} disabled={isDisabled}>+</button>
            </div>
            <button
              className={`fm4-add ${isDisabled ? 'fm4-add--disabled' : ''}`}
              onClick={handleAddButton}
              disabled={isDisabled}
            >
              {isDisabled
                ? blockedMessage?.text
                : `${getUIText('addButton')} · ${formatPrice(calculateTotalPrice())}`
              }
            </button>
          </div>

        </div>
      </div>

      {toasts.map(t => (
        <DeliveryToast
          key={t.id}
          type="added"
          subtitle={t.subtitle}
          onDone={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
        />
      ))}
    </>
  );
};

export default FoodModal;