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
  const { cartItems, addToCart, removeFromCart, url, updateCartItemQuantity } =
    useContext(StoreContext);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showCounterControls, setShowCounterControls] = useState(false);
  const timerRef = useRef(null);

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

  const openFoodModal = () => {
    // Just call the parent's onClick handler
    if (onClick) {
      onClick({ id, name, price, description, image });
    }
  };

  // Funcție nouă pentru a deschide modalul când se apasă pe iconița Add
  const handleAddIconClick = (e) => {
    e.stopPropagation();
    openFoodModal();
  };

  // Funcție pentru a deschide modalul când se apasă pe counter
  const handleCounterClick = (e) => {
    e.stopPropagation();
    openFoodModal(); // Schimbat: acum deschide modalul în loc să arate controalele
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
    setSelectedQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantityModal = () => {
    setSelectedQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handleAddToOrder = async () => {
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
          className="food-item-category"
          onClick={openFoodModal}
          style={{ cursor: "pointer" }}
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
            <img
              className="food-item-img"
              src={url + "/images/" + image}
              alt={name}
            />

            {cartItems && cartItems[id] > 0 ? (
              <AnimatePresence>
                {/* Eliminat controalele de +/- și lăsat doar counter-ul care deschide modalul */}
                <motion.div
                  key="cart"
                  className="food-item-counter-cart"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  onClick={handleCounterClick} // Acum deschide modalul
                >
                  {cartItems[id]}
                </motion.div>
              </AnimatePresence>
            ) : (
              <img
                className="add"
                onClick={handleAddIconClick}
                src={assets.add_icon_white}
                alt="Add"
              />
            )}
          </div>

          <div className="food-item-info">
            <div className="food-item-name-price">
              <p className="food-item-name">{name}</p>
              <p className="food-item-price">{price} €</p>
            </div>
            <p className="food-item-desc">
              {description.length > 70
                ? description.slice(0, 70) + "..."
                : description}
            </p>
          </div>
        </div>

        {/* Folosim FoodModal în loc de modalul vechi */}
        {isModalOpen && selectedFood && (
          <FoodModal 
            food={selectedFood} 
            closeModal={closeFoodModal} 
            isOpen={isModalOpen}
          />
        )}

        {/* Modal mic pentru informații nutriționale */}
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