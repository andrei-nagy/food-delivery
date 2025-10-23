import React, { useContext, useState, useEffect, useRef } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaMinus,
  FaTrash,
  FaArrowLeft,
  FaCreditCard,
  FaMoneyBillWave,
  FaLock,
} from "react-icons/fa";
import { assets } from "../../assets/assets";

const Cart = () => {
  const {
    cartItems,
    token,
    food_list,
    removeFromCart,
    getTotalCartAmount,
    url,
    updateCartItemQuantity,
    removeItemCompletely,
    getTotalItemCount,
    clearCart
  } = useContext(StoreContext);

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [data, setData] = useState({ tableNo: "" });
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showFloatingCheckout, setShowFloatingCheckout] = useState(false);

  const swipeData = useRef({});
  const [swipeOffsets, setSwipeOffsets] = useState({});

  const tableNumber = localStorage.getItem("tableNumber") || null;

  const promoCodes = {
    DISCOUNT10: 10,
    SAVE5: 5,
    OFF20: 20,
  };

  const isCartEmpty = Object.keys(cartItems).length === 0;

  useEffect(() => {
    document.body.classList.add("cart-page");
    return () => {
      document.body.classList.remove("cart-page");
    };
  }, []);

  useEffect(() => {
    setData((data) => ({ ...data, tableNo: tableNumber }));
    setShowFloatingCheckout(!isCartEmpty);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    setShowFloatingCheckout(!isCartEmpty);
  }, [isCartEmpty, cartItems]);

  const findFoodItem = (itemId, cartItem) => {
    let baseFoodId = "";
    
    if (itemId) {
      const parts = itemId.split('__');
      baseFoodId = parts[0];
    }
    
    const foodItem = food_list.find(item => item._id === baseFoodId);
    
    if (!foodItem && baseFoodId) {
      const alternativeItem = food_list.find(item => 
        item._id.includes(baseFoodId) || baseFoodId.includes(item._id)
      );
      return alternativeItem || null;
    }
    
    return foodItem || null;
  };

  const getItemInstructions = (itemId) => {
    const cartItem = cartItems[itemId];
    return cartItem?.specialInstructions || "";
  };

  const applyPromoCode = () => {
    if (promoCodes[promoCode]) {
      setDiscount(promoCodes[promoCode]);
      toast.success(`Promo code applied! ${promoCodes[promoCode]}€ discount`);
    } else {
      toast.error("Invalid Promo Code");
      setDiscount(0);
    }
  };

  const handlePromoCodeChange = (event) => setPromoCode(event.target.value);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    if (paymentError) setPaymentError("");
  };

  const handleClearCart = async () => {
    try {

      if (!clearCart) {
        toast.error("Clear cart function not available");
        return;
      }

      await clearCart();
      
      console.log("🔥 [CART.JSX] clearCart() completed");
      setShowConfirmClear(false);
      
    } catch (error) {
      console.error("❌ [CART.JSX] Error in handleClearCart:", error);
      toast.error("Error clearing cart");
    }
  };

const placeOrder = async (event) => {
  if (event) event.preventDefault();

  if (orderPlaced) return;

  if (!paymentMethod) {
    setPaymentError("Please select a payment method.");
    setTimeout(() => {
      const paymentSection = document.getElementById("payment-method-section");
      if (paymentSection) {
        paymentSection.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
    return;
  } else {
    setPaymentError("");
  }

  setIsPlacingOrder(true);

  let orderItems = [];
  Object.keys(cartItems).forEach((itemId) => {
    const cartItem = cartItems[itemId];
    if (cartItem && cartItem.quantity > 0) {
      const foodItem = findFoodItem(itemId, cartItem);
      const itemInstructions = getItemInstructions(itemId);
      
      if (foodItem) {
        orderItems.push({
          foodId: itemId,
          baseFoodId: foodItem._id,
          name: foodItem.name,
          price: foodItem.price,
          quantity: cartItem.quantity,
          itemTotal: (foodItem.price * cartItem.quantity).toFixed(2),
          image: foodItem.image,
          specialInstructions: itemInstructions,
          selectedOptions: cartItem.selectedOptions || [],
          extrasPrice: cartItem.itemData?.extrasPrice || 0
        });
      } else {
        orderItems.push({
          foodId: itemId,
          baseFoodId: itemId.split('_')[0],
          name: "Product",
          price: 0,
          quantity: cartItem.quantity,
          itemTotal: "0.00",
          image: "",
          specialInstructions: itemInstructions,
          selectedOptions: cartItem.selectedOptions || [],
          extrasPrice: cartItem.itemData?.extrasPrice || 0
        });
      }
    }
  });

  const totalAmount = getTotalCartAmount() - discount;

  const orderData = {
    userId: token,
    items: orderItems,
    amount: totalAmount,
    tableNo: tableNumber,
    userData: data,
    specialInstructions: specialInstructions,
  };

  try {
    if (paymentMethod === "creditCard") {
      const response = await axios.post(url + "/api/order/place", orderData, {
        headers: { token },
      });
      
      if (response.data.success) {
        // ✅ Șterge item-urile înainte de redirect
        await clearCart();
        window.location.replace(response.data.session_url);
      } else {
        alert("Error processing payment.");
        setIsPlacingOrder(false);
      }
    } else if (paymentMethod === "cashPOS") {
      const response = await axios.post(
        url + "/api/order/place-cash",
        orderData,
        { headers: { token } }
      );
      
      if (response.data.success) {
        setOrderPlaced(true);
        setTimeout(async () => {
          setShowFloatingCheckout(false);
          setTimeout(async () => {
            // ✅ Șterge item-urile înainte de navigare
            await clearCart();
            navigate("/thank-you", {
              state: {
                tableNo: orderData.tableNo,
                orderId: response.data.orderId,
              },
            });
            localStorage.setItem("isReloadNeeded", "true");
          }, 300);
        }, 2000);
      } else {
        alert("Error placing order.");
        setIsPlacingOrder(false);
      }
    }
  } catch (error) {
    console.error("Order placement error:", error);
    alert("Error placing order.");
    setIsPlacingOrder(false);
  }
};

  const handleTouchStart = (e, id) => {
    swipeData.current[id] = {
      startX: e.touches[0].clientX,
      currentX: e.touches[0].clientX,
      isSwiping: false,
    };
  };

  const handleTouchMove = (e, id) => {
    const current = swipeData.current[id];
    if (!current) return;
    current.currentX = e.touches[0].clientX;
    const diff = current.currentX - current.startX;

    if (diff < 0) {
      const maxSwipe = -window.innerWidth * 0.2;
      const offset = Math.max(diff, maxSwipe);
      setSwipeOffsets((prev) => ({ ...prev, [id]: offset }));
    } else {
      const currentOffset = swipeOffsets[id] || 0;
      if (currentOffset < 0) {
        setSwipeOffsets((prev) => ({ ...prev, [id]: currentOffset }));
      } else {
        setSwipeOffsets((prev) => ({ ...prev, [id]: 0 }));
      }
    }

    current.isSwiping = true;
  };

  const handleTouchEnd = (id) => {
    const current = swipeData.current[id];
    if (!current) return;

    const diff = current.currentX - current.startX;
    const threshold = window.innerWidth * 0.1;

    if (diff < -threshold) {
      const maxSwipe = -window.innerWidth * 0.2;
      setSwipeOffsets((prev) => ({ ...prev, [id]: maxSwipe }));
    } else if (diff > threshold) {
      setSwipeOffsets((prev) => ({ ...prev, [id]: 0 }));
    } else {
      const currentOffset = swipeOffsets[id] || 0;
      if (currentOffset < -threshold) {
        const maxSwipe = -window.innerWidth * 0.2;
        setSwipeOffsets((prev) => ({ ...prev, [id]: maxSwipe }));
      } else {
        setSwipeOffsets((prev) => ({ ...prev, [id]: 0 }));
      }
    }

    delete swipeData.current[id];
  };

  // ✅ SCHIMBAT: Folosește removeItemCompletely pentru swipe delete
  const handleDeleteClick = (id) => {
    setItemToDelete(id);
  };

  // ✅ SCHIMBAT: confirmDelete folosește removeItemCompletely
  const confirmDelete = () => {
    if (itemToDelete) {
      removeItemCompletely(itemToDelete); // ✅ Șterge COMPLET item-ul
      setSwipeOffsets((prev) => ({ ...prev, [itemToDelete]: 0 }));
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setSwipeOffsets((prev) => ({ ...prev, [itemToDelete]: 0 }));
    setItemToDelete(null);
  };

  const resetSwipe = (id) => {
    setSwipeOffsets((prev) => ({ ...prev, [id]: 0 }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="cart-container"
    >
    {/* Header Section */}
<div className="cart-header-section">
  <button className="back-button" onClick={() => navigate(-1)}>
    <FaArrowLeft />
    <span>Back</span>
  </button>
  
  <h1 className="cart-title">Your Order</h1>
  
  {/* ✅ SCHIMBARE: Folosește un div placeholder când coșul este gol */}
  {!isCartEmpty ? (
    <button
      className="clear-cart-button"
      onClick={() => setShowConfirmClear(true)}
      aria-label="Clear cart"
    >
      <FaTrash />
    </button>
  ) : (
    <div className="clear-cart-placeholder"></div>
  )}
</div>

      {/* Empty Cart State */}
      {isCartEmpty ? (
        <motion.div
          className="empty-cart-state"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="empty-cart-illustration-container">
            <motion.img
              className="empty-cart-illustration"
              src={assets.empty_cart3}
              alt="Empty cart"
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            />
            <motion.div 
              className="empty-cart-decoration"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="decoration-circle circle-1"></div>
              <div className="decoration-circle circle-2"></div>
              <div className="decoration-circle circle-3"></div>
            </motion.div>
          </div>
          
          <motion.h2
            className="empty-cart-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Your cart feels lonely
          </motion.h2>
          
          <motion.p
            className="empty-cart-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            It looks like you haven't added any items to your cart yet. 
            Explore our menu and discover delicious options!
          </motion.p>
          
          <motion.button
            className="browse-menu-button"
            onClick={() => navigate("/category/All")}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(40, 167, 69, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <span>Browse Menu</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </motion.div>
      ) : (
        <div className="cart-content">
          {/* Cart Items List */}
          <div className="cart-items-section">
            <h2 className="section-title">Items in your order</h2>
            <div className="cart-items-list">
              <AnimatePresence>
                {Object.keys(cartItems).map((itemId) => {
                  const cartItem = cartItems[itemId];
                  if (!cartItem || cartItem.quantity <= 0) return null;

                  const foodItem = findFoodItem(itemId, cartItem);
                  const itemInstructions = getItemInstructions(itemId);
                  if (!foodItem) {
                    return (
                      <React.Fragment key={itemId}>
                        <motion.div
                          className="cart-item-container"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          layout
                        >
                          <div className="cart-item">
                            <div className="item-image placeholder">
                              <FaCreditCard />
                            </div>
                            <div className="item-details">
                              <h3 className="item-name">Product Loading...</h3>
                              <p className="item-description">
                                Please wait while we load product information
                              </p>
                              <p className="item-price">
                                {cartItem.quantity} x ? €
                              </p>
                            </div>
                            <div className="quantity-controls">
                              {/* ✅ Butonul "-" folosește removeFromCart */}
                              <button
                                onClick={() => removeFromCart(itemId, 1)}
                                className="quantity-button decrease"
                                aria-label="Decrease quantity"
                              >
                                <FaMinus />
                              </button>
                              <span className="quantity-display">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => updateCartItemQuantity(
                                  itemId,
                                  cartItem.quantity + 1,
                                  itemInstructions
                                )}
                                className="quantity-button increase"
                                aria-label="Increase quantity"
                              >
                                <FaPlus />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                        <div className="item-divider"></div>
                      </React.Fragment>
                    );
                  }

                  return (
                    <React.Fragment key={itemId}>
                      <motion.div
                        className="cart-item-container"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        layout
                      >
                        {/* ✅ Swipe background folosește removeItemCompletely */}
                        <div
                          className="cart-item-swipe-background"
                          onClick={() => handleDeleteClick(itemId)}
                        >
                          <FaTrash className="swipe-trash-icon" />
                        </div>

                        <div
                          className="cart-item"
                          onTouchStart={(e) => handleTouchStart(e, itemId)}
                          onTouchMove={(e) => handleTouchMove(e, itemId)}
                          onTouchEnd={() => handleTouchEnd(itemId)}
                          onClick={() => resetSwipe(itemId)}
                          style={{
                            transform: `translateX(${swipeOffsets[itemId] || 0}px)`,
                            transition: "transform 0.3s ease",
                          }}
                        >
                          <img
                            src={url + "/images/" + foodItem.image}
                            alt={foodItem.name}
                            className="item-image"
                            onError={(e) => {
                              e.target.src = assets.placeholder_food;
                            }}
                          />
                          <div className="item-details">
                            <h3 className="item-name">{foodItem.name}</h3>

                            {itemInstructions && (
                              <div className="item-special-instructions">
                                <span className="instructions-label">Note: </span>
                                {itemInstructions}
                              </div>
                            )}

                            {cartItem.selectedOptions && cartItem.selectedOptions.length > 0 && (
                              <div className="item-extras">
                                <span className="extras-label">Extras: </span>
                                {cartItem.selectedOptions.join(', ')}
                                <span className="extras-price">
                                  (+{(cartItem.itemData?.extrasPrice || 0).toFixed(2)} €)
                                </span>
                              </div>
                            )}
                            
                            <p className="item-description">
                              {foodItem.description}
                            </p>
                            <p className="item-price">
                              {(
                                (foodItem.price + (cartItem.itemData?.extrasPrice || 0)) * 
                                cartItem.quantity
                              ).toFixed(2)} €
                            </p>
                          </div>
                          <div className="quantity-controls">
                            {/* ✅ Butonul "-" folosește removeFromCart */}
                            <button
                              onClick={() => removeFromCart(itemId, 1)}
                              className="quantity-button decrease"
                              aria-label="Decrease quantity"
                            >
                              <FaMinus />
                            </button>
                            <span className="quantity-display">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() => updateCartItemQuantity(
                                itemId,
                                cartItem.quantity + 1,
                                itemInstructions
                              )}
                              className="quantity-button increase"
                              aria-label="Increase quantity"
                              >
                              <FaPlus />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                      <div className="item-divider"></div>
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>
            </div>

            <button
              className="add-more-button"
              onClick={() => navigate("/category/All")}
            >
              <FaPlus />
              <span>Add More Items</span>
            </button>
          </div>

          {/* Special Instructions globale */}
          <div className="special-instructions-section">
            <h2 className="section-title">Special Instructions for Entire Order</h2>
            <div className="instructions-input-container">
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests or dietary requirements for the entire order?"
                rows={3}
                className="instructions-textarea"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <h2 className="section-title">Order Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{getTotalCartAmount().toFixed(2)} €</span>
              </div>
              <div className="summary-row">
                <span>Discount</span>
                <span>{discount > 0 ? `-${discount} €` : "0 €"}</span>
              </div>
              <div className="promo-code-section">
                <div className="promo-input-container">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={handlePromoCodeChange}
                    placeholder="Promo code"
                    className="promo-input"
                  />
                  <button
                    className="apply-promo-button"
                    type="button"
                    onClick={applyPromoCode}
                  >
                    Apply
                  </button>
                </div>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total</span>
                <span>
                  {getTotalCartAmount() === 0
                    ? 0
                    : (getTotalCartAmount() - discount).toFixed(2)}{" "}
                  €
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="cart-payment-section" id="payment-method-section">
            <h2 className="cart-payment-title">Select Payment Method</h2>

            {paymentError && (
              <div className="cart-payment-error">{paymentError}</div>
            )}

            <div className="cart-payment-options">
              <label className="cart-payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="creditCard"
                  onChange={handlePaymentMethodChange}
                  checked={paymentMethod === "creditCard"}
                />
                <div className="cart-payment-option-content">
                  <div className="cart-payment-icon">
                    <FaCreditCard />
                  </div>
                  <div className="cart-payment-details">
                    <span className="cart-payment-option-title">
                      Credit/Debit Card
                    </span>
                    <span className="cart-payment-option-subtitle">
                      Pay securely online with your card
                    </span>
                  </div>
                </div>
              </label>

              <label className="cart-payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cashPOS"
                  onChange={handlePaymentMethodChange}
                  checked={paymentMethod === "cashPOS"}
                />
                <div className="cart-payment-option-content">
                  <div className="cart-payment-icon">
                    <FaMoneyBillWave />
                  </div>
                  <div className="cart-payment-details">
                    <span className="cart-payment-option-title">
                      Cash or POS Terminal
                    </span>
                    <span className="cart-payment-option-subtitle">
                      Pay when you receive your order
                    </span>
                  </div>
                </div>
              </label>
            </div>

            <div className="cart-payment-security">
              <div className="cart-payment-security-info">
                <FaLock className="cart-lock-icon" />
                <span>Secure & Encrypted Payment</span>
              </div>
              <div className="cart-payment-providers">
                <div className="cart-provider-logos">
                  <img
                    src={assets.visa_logo}
                    alt="Visa"
                    className="cart-provider-logo"
                  />
                  <img
                    src={assets.mastercard_logo}
                    alt="Mastercard"
                    className="cart-provider-logo"
                  />
                  <img
                    src={assets.apple_pay}
                    alt="Apple Pay"
                    className="cart-provider-logo"
                  />
                  <img
                    src={assets.google_pay}
                    alt="Google Pay"
                    className="cart-provider-logo"
                  />
                </div>
                <img
                  src={assets.stripe_logo}
                  alt="Stripe"
                  className="cart-stripe-logo"
                />
              </div>
            </div>

            <div className="cart-payment-features">
              <div className="cart-payment-feature">SSL Encrypted</div>
              <div className="cart-payment-feature">PCI Compliant</div>
              <div className="cart-payment-feature">3D Secure</div>
              <div className="cart-payment-feature">Money Back Guarantee</div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Checkout Button */}
      {showFloatingCheckout && (
        <div
          className={`floating-checkout ${
            isPlacingOrder || orderPlaced ? "placing-order" : ""
          }`}
          onClick={!(isPlacingOrder || orderPlaced) ? placeOrder : undefined}
        >
          <div className="checkout-content">
            {!(isPlacingOrder || orderPlaced) ? (
              <>
                <div className="item-count">
                  {getTotalItemCount()}
                </div>
                <div className="checkout-text">
                  {paymentMethod === "creditCard"
                    ? "Proceed to Payment"
                    : "Place Order"}
                </div>
                <div className="checkout-total">
                  {(getTotalCartAmount() - discount).toFixed(2)} €
                </div>
              </>
            ) : (
              <div className="order-placed-message">
                <motion.div
                  className="smooth-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Processing Order...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <AnimatePresence>
        {itemToDelete && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelDelete}
          >
            <motion.div
              className="confirmation-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Remove Item</h3>
              <p>Are you sure you want to remove this item from your cart?</p>
              <div className="modal-actions">
                <button className="cancel-button" onClick={cancelDelete}>
                  Cancel
                </button>
                {/* ✅ SCHIMBAT: confirmButton folosește removeItemCompletely */}
                <button className="confirm-button" onClick={confirmDelete}>
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmClear && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="confirmation-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3>Clear Cart</h3>
              <p>Are you sure you want to remove all items from your cart?</p>
              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowConfirmClear(false)}
                >
                  Cancel
                </button>
                <button
                  className="confirm-button"
                  onClick={handleClearCart}
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Cart;