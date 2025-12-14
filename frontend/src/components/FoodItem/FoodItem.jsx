import React, { useContext, useState, useRef, useEffect } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { useLanguage } from "../../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

const FoodItem = ({
  _id,
  name,
  price,
  description,
  image,
  isBestSeller,
  isNewAdded,
  isVegan,
  discountPercentage,
  discountedPrice,
  openModal,
}) => {
  const { 
    cartItems, 
    addToCart, 
    removeFromCart, 
    url, 
    billRequested,
    userBlocked 
  } = useContext(StoreContext);

  const { currentLanguage } = useLanguage();
  
  const [showCounterControls, setShowCounterControls] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [translatedContent, setTranslatedContent] = useState({
    foodName: '',
    description: ''
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const timerRef = useRef(null);

  // Combină ambele condiții pentru a bloca interacțiunea
  const isDisabled = billRequested || userBlocked;
  const hasDiscount = discountPercentage > 0;
  const translationEnabled = currentLanguage !== 'ro';

  // === FUNCȚII PENTRU TRADUCERE ===
  const translateText = async (text, targetLang) => {
    if (!text.trim() || !targetLang || targetLang === 'ro') {
      return text;
    }
    
    // Dacă textul este prea scurt sau conține doar numere/simboluri, nu traduce
    if (text.length < 2 || /^[\d\s\W]+$/.test(text)) {
      return text;
    }
    
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const translatedText = data[0]?.[0]?.[0] || text;
      
      return translatedText;
    } catch (error) {
      console.error('Translation error for text:', text.substring(0, 50), error);
      setTranslationError('Translation failed');
      return text;
    }
  };

  // Funcție pentru traducerea rapidă a conținutului
  const translateContent = async () => {
    if (!translationEnabled || !name || currentLanguage === 'ro') {
      setTranslatedContent({
        foodName: '',
        description: ''
      });
      return;
    }
    
    setIsTranslating(true);
    setTranslationError('');

    try {
      const translations = {
        foodName: '',
        description: ''
      };

      // Colectează toate textele care trebuie traduse
      const textsToTranslate = [];
      if (name) textsToTranslate.push(name);
      if (description) textsToTranslate.push(description);

      if (textsToTranslate.length > 0) {
        // Combină toate textele într-un singur request
        const combinedText = textsToTranslate.join(' ||| ');
        
        const response = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLanguage}&dt=t&q=${encodeURIComponent(combinedText)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const translatedCombinedText = data[0]?.map(item => item[0]).join('') || combinedText;
          const translatedTexts = translatedCombinedText.split(' ||| ');
          
          // Distribuie textele traduse
          if (name && translatedTexts[0]) {
            translations.foodName = translatedTexts[0];
          }
          if (description && translatedTexts[1]) {
            translations.description = translatedTexts[1];
          }
        }
      }

      setTranslatedContent(translations);

    } catch (error) {
      console.error('Error translating content:', error);
      setTranslationError('Translation service unavailable');
    } finally {
      setIsTranslating(false);
    }
  };

  // Efect pentru traducere automată când se schimbă limba
  useEffect(() => {
    if (translationEnabled && name) {
      translateContent();
    } else {
      setTranslatedContent({
        foodName: '',
        description: ''
      });
    }
  }, [currentLanguage, name, description, translationEnabled]);

  // === FUNCȚII PENTRU A OBȚINE CONȚINUTUL TRADUS ===
  const getFoodName = () => {
    return translationEnabled && translatedContent.foodName 
      ? translatedContent.foodName 
      : name;
  };

  // ✅ FUNCȚIE NOUĂ - limitează numele la 15 caractere
  const getTruncatedFoodName = () => {
    const foodName = getFoodName();
    if (foodName.length > 15) {
      return foodName.substring(0, 15) + '...';
    }
    return foodName;
  };

  const getDescription = () => {
    return translationEnabled && translatedContent.description 
      ? translatedContent.description 
      : description;
  };

  const getItemQuantity = () => {
    if (!cartItems || !_id) return 0;

    let totalQuantity = 0;
    Object.keys(cartItems).forEach((key) => {
      if (key.startsWith(_id)) {
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

  const itemQuantity = getItemQuantity();

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCounterClick = (e) => {
    e.stopPropagation();

    if (isDisabled) {
      return;
    }

    setShowCounterControls(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setShowCounterControls(false);
    }, 3500);
  };

  const handleClick = () => {
    if (isDisabled) {
      return;
    }
    openModal({
      _id,
      name,
      price,
      description,
      image,
      discountPercentage,
      discountedPrice,
    });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();

    if (isDisabled) {
      return;
    }

    addToCart(_id, 1);
    handleCounterClick(e);
  };

  const handleRemoveFromCart = (e) => {
    e.stopPropagation();

    if (isDisabled) {
      return;
    }

    removeFromCart(_id, 1);
    handleCounterClick(e);
  };

  const handleSimpleCounterClick = (e) => {
    e.stopPropagation();

    if (isDisabled) {
      return;
    }

    if (!showCounterControls) {
      openModal({
        _id,
        name,
        price,
        description,
        image,
        discountPercentage,
        discountedPrice,
      });
    } else {
      handleCounterClick(e);
    }
  };

  const handleAddIconClick = (e) => {
    e.stopPropagation();

    if (isDisabled) {
      return;
    }

    openModal({
      _id,
      name,
      price,
      description,
      image,
      discountPercentage,
      discountedPrice,
    });
  };

  // Mesajul care va apărea când utilizatorul este blocat
  const getBlockedMessage = () => {
    if (userBlocked) {
      return {
        icon: "⏰",
        text: "Session Expired"
      };
    }
    if (billRequested) {
      return {
        icon: "🔒", 
        text: "Bill Requested"
      };
    }
    return null;
  };

  const blockedMessage = getBlockedMessage();

  return (
    <div
      className={`food-item ${isDisabled ? "bill-requested-disabled" : ""}`}
      onClick={handleClick}
      style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
    >
      <div className="food-item-img-container">
        {isNewAdded && (
          <img className="new-badge" src={assets.new_icon} alt="New" />
        )}
        {isVegan && (
          <img className="vegan-badge" src={assets.vegan_icon} alt="Vegan" />
        )}
        {isBestSeller && (
          <img
            className="best-seller-badge"
            src={assets.bestseller_icon}
            alt="Best Seller"
          />
        )}

        {hasDiscount && (
          <div className="discount-badge">-{discountPercentage}%</div>
        )}

        {isDisabled && blockedMessage && (
          <div className="bill-requested-overlay">
            <div className="bill-requested-message">
              <span className="repeat-product-bill-icon">{blockedMessage.icon}</span>
              <span>{blockedMessage.text}</span>
            </div>
          </div>
        )}

        <img
          className={`food-item-img ${isDisabled ? "disabled-image" : ""} ${
            imageError ? "image-error" : ""
          }`}
          src={imageError ? assets.image_coming_soon : url + "/images/" + image}
          alt={getFoodName()}
          onError={handleImageError}
        />

        {!isDisabled && itemQuantity > 0 ? (
          <AnimatePresence>
            {showCounterControls ? (
              <motion.div
                key="counter"
                className="food-item-counter"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                <img
                  onClick={handleRemoveFromCart}
                  src={assets.remove_icon_red}
                  alt="Remove"
                />
                <p>{itemQuantity}</p>
                <img
                  onClick={handleAddToCart}
                  src={assets.add_icon_green}
                  alt="Add"
                />
              </motion.div>
            ) : (
              <motion.div
                key="cart"
                className="food-item-counter-cart"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={handleSimpleCounterClick}
              >
                {itemQuantity}
              </motion.div>
            )}
          </AnimatePresence>
        ) : !isDisabled ? (
          <img
            className="add"
            onClick={handleAddIconClick}
            src={assets.add_icon_white}
            alt="Add"
          />
        ) : null}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p className={isDisabled ? "disabled-text" : ""} title={getFoodName()}>
            {/* ✅ FOLOSEȘTE FUNCȚIA NOUĂ PENTRU NUME TRUNCAT */}
            {getTruncatedFoodName()}
            {isTranslating && (
              <span className="translating-indicator"> 🔄</span>
            )}
          </p>
        </div>
        <div className="food-item-desc-container">
          <p
            className={`food-item-desc ${isDisabled ? "disabled-text" : ""}`}
          >
            {getDescription().length > 70
              ? getDescription().slice(0, 70) + "..."
              : getDescription()}
            {isTranslating && (
              <span className="translating-indicator"> 🔄</span>
            )}
          </p>
        </div>
        <div
          className={`food-item-price-container ${
            isDisabled ? "disabled-text" : ""
          }`}
        >
          {hasDiscount ? (
            <div className="discount-price-wrapper">
              <span className="original-price">{price} €</span>
              <span className="discounted-price">{parseFloat(discountedPrice).toFixed(2)} €</span>
            </div>
          ) : (
            <span className="regular-price">{price} €</span>
          )}
        </div>
      </div>

      {/* Translation Error Indicator (doar pentru debugging) */}
      {translationError && (
        <div className="translation-error-indicator" title={translationError}>
          ⚠️
        </div>
      )}
    </div>
  );
};

export default FoodItem;