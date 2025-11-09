import React, { useContext, useState, useEffect, useRef } from "react";
import "./FoodItemCategory.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import FoodModal from "../FoodItem/FoodModal";

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
  onClick
}) => {
  const { cartItems, addToCart, removeFromCart, url, updateCartItemQuantity, canAddToCart, billRequested } =
    useContext(StoreContext);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showCounterControls, setShowCounterControls] = useState(false);
  const [imageError, setImageError] = useState(false);
  const timerRef = useRef(null);

  // ✅ FUNCȚIE CORECTĂ: Caută toate variantele produsului în coș
  const getItemQuantity = () => {
    if (!cartItems || !id) return 0;
    
    let totalQuantity = 0;
    
    // Parcurge toate cheile din cartItems
    Object.keys(cartItems).forEach(key => {
      // Verifică dacă cheia începe cu ID-ul produsului de bază
      if (key.startsWith(id)) {
        const item = cartItems[key];
        if (typeof item === 'number') {
          totalQuantity += item;
        } else if (item && typeof item === 'object' && 'quantity' in item) {
          totalQuantity += item.quantity || 0;
        }
      }
    });
    
    return totalQuantity;
  };

  const itemQuantity = getItemQuantity();

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const handleImageError = () => {
    setImageError(true);
  };

  const openFoodModal = () => {
    if (billRequested) {
      return;
    }
    
    if (onClick) {
      onClick({ id, name, price, description, image, isBestSeller, isNewAdded, isVegan, category, extras: [] });
    }
  };

  const handleAddIconClick = (e) => {
    e.stopPropagation();
    
    if (billRequested) {
      return;
    }
    
    openFoodModal();
  };

  const handleCounterClick = (e) => {
    e.stopPropagation();
    
    if (billRequested) {
      return;
    }
    
    openFoodModal();
  };

  const closeFoodModal = () => {
    setSelectedFood(null);
    setIsModalOpen(false);
  };

  const openNutritionModal = (e) => {
    e.stopPropagation();
    setIsNutritionModalOpen(true);
  };

  const closeNutritionModal = () => {
    setIsNutritionModalOpen(false);
  };

  const handleIncreaseQuantityModal = () => {
    if (billRequested) return;
    setSelectedQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantityModal = () => {
    if (billRequested) return;
    setSelectedQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handleAddToOrder = async () => {
    if (billRequested) return;
    
    if (selectedFood) {
      await updateCartItemQuantity(
        selectedFood.id,
        selectedQuantity,
        specialInstructions
      );
    }
    closeFoodModal();
  };

  const nutritionDummyText = `
Ingrediente: Apă, făină de grâu, ulei vegetal, sare, zahăr, conservanți (E202).
Calorii: 250 kcal per porție.
Grăsimi: 10g (din care saturate 2g).
Carbohidrați: 30g (din care zaharuri 5g).
Proteine: 5g.
Sare: 1g.
`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <>
        <div
          className={`food-item-category ${billRequested ? 'bill-requested-disabled' : ''}`}
          onClick={openFoodModal}
          style={{ cursor: billRequested ? 'not-allowed' : 'pointer' }}
        >
          <div className="food-item-img-container">
            {isNewAdded && (
              <img className="new-badge" src={assets.new_icon} alt="New" />
            )}
            {isVegan && (
              <img
                className="vegan-badge"
                src={assets.vegan_icon}
                alt="Vegan"
              />
            )}
            {isBestSeller && (
              <img
                className="best-seller-badge"
                src={assets.bestseller_icon}
                alt="Best Seller"
              />
            )}
            
            {billRequested && (
              <div className="bill-requested-overlay">
                <div className="bill-requested-message">
                  <span className="repeat-product-bill-icon">🔒</span>
                  <span>Bill Requested</span>
                </div>
              </div>
            )}
            
            {/* Imaginea principală cu fallback la image_coming_soon */}
            <img
              className={`food-item-img ${billRequested ? 'disabled-image' : ''} ${imageError ? 'image-error' : ''}`}
              src={imageError ? assets.image_coming_soon : (url + "/images/" + image)}
              alt={name}
              onError={handleImageError}
            />

            {!billRequested && itemQuantity > 0 ? ( // ✅ CORECT: folosim itemQuantity
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
                  {itemQuantity} {/* ✅ CORECT: folosim itemQuantity */}
                </motion.div>
              </AnimatePresence>
            ) : !billRequested ? (
              <img
                className="add"
                onClick={handleAddIconClick}
                src={assets.add_icon_white}
                alt="Add"
              />
            ) : null}
          </div>

          <div className="food-item-info">
            <div className="food-item-name-price">
              <p className={`food-item-name ${billRequested ? 'disabled-text' : ''}`}>{name}</p>
              <p className={`food-item-price ${billRequested ? 'disabled-text' : ''}`}>{price} €</p>
            </div>
            <p className={`food-item-desc ${billRequested ? 'disabled-text' : ''}`}>
              {description.length > 70
                ? description.slice(0, 70) + "..."
                : description}
            </p>
            
            {billRequested && (
              <div className="bill-warning-message">
                Cannot add items - bill requested
              </div>
            )}
          </div>
        </div>

        {isModalOpen && selectedFood && (
          <FoodModal 
            food={selectedFood} 
            closeModal={closeFoodModal} 
            isOpen={isModalOpen}
          />
        )}

        {isNutritionModalOpen && (
          <div
            className="modal-overlay nutrition-modal-overlay"
            onClick={closeNutritionModal}
          >
            <div
              className="food-modal-content nutrition-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close-button"
                onClick={closeNutritionModal}
              >
                ✕
              </button>
              <h3>Informații nutriționale</h3>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "1rem",
                  color: "#333",
                }}
              >
                {nutritionDummyText}
              </pre>
            </div>
          </div>
        )}
      </>
    </motion.div>
  );
};

export default FoodItemCategory;