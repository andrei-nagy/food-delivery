import React, { useContext, useState, useEffect, useRef } from "react";
import "./FoodItemCategory.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { useLanguage } from "../../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

const FoodItemCategory = ({
  id,
  name,
  price,
  description,
  image,
  isBestSeller,
  isNewAdded,
  isVegan,
  category,
  discountPercentage,
  discountedPrice,
  onClick,
}) => {
  const { cartItems, url, billRequested, userBlocked } =
    useContext(StoreContext);
  const { currentLanguage } = useLanguage();

  const [imageError, setImageError] = useState(false);
  const [translatedContent, setTranslatedContent] = useState({
    foodName: "",
    description: "",
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState("");

  // Combină ambele condiții pentru a bloca interacțiunea
  const isDisabled = billRequested || userBlocked;
  const hasDiscount = discountPercentage > 0;
  const translationEnabled = currentLanguage !== "ro";

  // ✅ CALCULEAZĂ FORȚAT discountPercentage și discountedPrice
  const rawDiscountPercentage = parseFloat(discountPercentage) || 0;
  const rawPrice = parseFloat(price) || 0;

  // ✅ CALCULEAZĂ discountedPrice INDIFERENT de ce vine din props
  const calculatedDiscountedPrice =
    rawDiscountPercentage > 0
      ? rawPrice * (1 - rawDiscountPercentage / 100)
      : rawPrice;

  // ✅ Verifică dacă ar TREBUI să afișeze discount (indiferent de ce vine din backend)
  const shouldShowDiscount = rawDiscountPercentage > 0;

  // === FUNCȚII PENTRU TRADUCERE ===
  const translateText = async (text, targetLang) => {
    if (!text.trim() || !targetLang || targetLang === "ro") {
      return text;
    }

    // Dacă textul este prea scurt sau conține doar numere/simboluri, nu traduce
    if (text.length < 2 || /^[\d\s\W]+$/.test(text)) {
      return text;
    }

    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
          text
        )}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const translatedText = data[0]?.[0]?.[0] || text;

      return translatedText;
    } catch (error) {
      console.error(
        "Translation error for text:",
        text.substring(0, 50),
        error
      );
      setTranslationError("Translation failed");
      return text;
    }
  };

  // Funcție pentru traducerea rapidă a conținutului
  const translateContent = async () => {
    if (!translationEnabled || !name || currentLanguage === "ro") {
      setTranslatedContent({
        foodName: "",
        description: "",
      });
      return;
    }

    setIsTranslating(true);
    setTranslationError("");

    try {
      const translations = {
        foodName: "",
        description: "",
      };

      // Colectează toate textele care trebuie traduse
      const textsToTranslate = [];
      if (name) textsToTranslate.push(name);
      if (description) textsToTranslate.push(description);

      if (textsToTranslate.length > 0) {
        // Combină toate textele într-un singur request
        const combinedText = textsToTranslate.join(" ||| ");

        const response = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLanguage}&dt=t&q=${encodeURIComponent(
            combinedText
          )}`
        );

        if (response.ok) {
          const data = await response.json();
          const translatedCombinedText =
            data[0]?.map((item) => item[0]).join("") || combinedText;
          const translatedTexts = translatedCombinedText.split(" ||| ");

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
      console.error("Error translating content:", error);
      setTranslationError("Translation service unavailable");
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
        foodName: "",
        description: "",
      });
    }
  }, [currentLanguage, name, description, translationEnabled]);

  // === FUNCȚII PENTRU A OBȚINE CONȚINUTUL TRADUS ===
  const getFoodName = () => {
    return translationEnabled && translatedContent.foodName
      ? translatedContent.foodName
      : name;
  };

  const getDescription = () => {
    return translationEnabled && translatedContent.description
      ? translatedContent.description
      : description;
  };

  // ✅ FUNCȚIE CORECTĂ: Caută toate variantele produsului în coș
  const getItemQuantity = () => {
    if (!cartItems || !id) return 0;

    let totalQuantity = 0;

    Object.keys(cartItems).forEach((key) => {
      if (key.startsWith(id)) {
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

  // Mesajul care va apărea când utilizatorul este blocat
  const getBlockedMessage = () => {
    if (userBlocked) {
      return {
        icon: "⏰",
        text: "Session Expired",
      };
    }
    if (billRequested) {
      return {
        icon: "🔒",
        text: "Bill Requested",
      };
    }
    return null;
  };

  const blockedMessage = getBlockedMessage();

  const handleAddIconClick = (e) => {
    e.stopPropagation();

    if (isDisabled) {
      return;
    }

    // ✅ Apelează direct onClick prop fără a seta state local
    if (onClick) {
      const foodData = {
        _id: id,
        name,
        price: rawPrice,
        description,
        image,
        isBestSeller,
        isNewAdded,
        isVegan,
        category,
        extras: [],
        discountPercentage: rawDiscountPercentage,
        discountedPrice: calculatedDiscountedPrice,
      };
      onClick(foodData);
    }
  };

  const handleCounterClick = (e) => {
    e.stopPropagation();

    if (isDisabled) {
      return;
    }

    // ✅ Apelează direct onClick prop fără a seta state local
    if (onClick) {
      const foodData = {
        _id: id,
        name,
        price: rawPrice,
        description,
        image,
        isBestSeller,
        isNewAdded,
        isVegan,
        category,
        extras: [],
        discountPercentage: rawDiscountPercentage,
        discountedPrice: calculatedDiscountedPrice,
      };
      onClick(foodData);
    }
  };

  const handleCardClick = () => {
    if (isDisabled) {
      return;
    }

    // ✅ Apelează direct onClick prop fără a seta state local
    if (onClick) {
      const foodData = {
        _id: id,
        name,
        price: rawPrice,
        description,
        image,
        isBestSeller,
        isNewAdded,
        isVegan,
        category,
        extras: [],
        discountPercentage: rawDiscountPercentage,
        discountedPrice: calculatedDiscountedPrice,
      };
      onClick(foodData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className={`food-item-category ${
          isDisabled ? "bill-requested-disabled" : ""
        }`}
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

          {/* ✅ Afișează badge-ul bazat pe calculul FORȚAT */}
          {shouldShowDiscount && (
            <div className="discount-badge">-{rawDiscountPercentage}%</div>
          )}

          {isDisabled && blockedMessage && (
            <div className="bill-requested-overlay">
              <div className="bill-requested-message">
                <span className="repeat-product-bill-icon">
                  {blockedMessage.icon}
                </span>
                <span>{blockedMessage.text}</span>
              </div>
            </div>
          )}

          <img
            className={`food-item-img ${isDisabled ? "disabled-image" : ""} ${
              imageError ? "image-error" : ""
            }`}
            src={
              imageError ? assets.image_coming_soon : url + "/images/" + image
            }
            alt={getFoodName()}
            onError={handleImageError}
            onClick={handleCardClick}
          />

          {!isDisabled && itemQuantity > 0 ? (
            <AnimatePresence>
              <motion.div
                key="cart"
                className="food-item-counter-cart"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                onClick={handleCounterClick}
              >
                {itemQuantity}
              </motion.div>
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
            <p className={isDisabled ? "disabled-text" : ""}>
              {getFoodName()}
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
                <span className="discounted-price">
                  {" "}
                  {parseFloat(discountedPrice).toFixed(2)} €
                </span>
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
    </motion.div>
  );
};

export default FoodItemCategory;
