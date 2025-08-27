import React, { useContext, useState, useEffect, useRef } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaMinus, FaTrash, FaArrowLeft } from "react-icons/fa";
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
  } = useContext(StoreContext);

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [showFloating, setShowFloating] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [data, setData] = useState({ tableNo: "" });
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const swipeData = useRef({});
  const [swipeOffsets, setSwipeOffsets] = useState({});
  const hideTimer = useRef(null);

  const tableNumber = localStorage.getItem("tableNumber") || null;

  const promoCodes = {
    DISCOUNT10: 10,
    SAVE5: 5,
    OFF20: 20,
  };

  useEffect(() => {
    setData((data) => ({ ...data, tableNo: tableNumber }));

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }, []);

  const applyPromoCode = () => {
    if (promoCodes[promoCode]) {
      setDiscount(promoCodes[promoCode]);
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

  const placeOrder = async (event) => {
    if (event) event.preventDefault();
    
    if (orderPlaced) return; // Prevent multiple clicks
    
    if (!paymentMethod) {
      setPaymentError("Please select a payment method.");
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
      return;
    } else setPaymentError("");

    setIsPlacingOrder(true); // Start animation

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0)
        orderItems.push({ ...item, quantity: cartItems[item._id] });
    });

    const totalAmount = getTotalCartAmount() - discount;

    const orderData = {
      tableNo: tableNumber,
      items: orderItems,
      userData: data,
      amount: totalAmount,
      specialInstructions,
    };

    try {
      if (paymentMethod === "creditCard") {
        const response = await axios.post(url + "/api/order/place", orderData, {
          headers: { token },
        });
        if (response.data.success)
          window.location.replace(response.data.session_url);
        else alert("Error processing payment.");
      } else if (paymentMethod === "cashPOS") {
        const response = await axios.post(
          url + "/api/order/place-cash",
          orderData,
          { headers: { token } }
        );
        if (response.data.success) {
          setOrderPlaced(true);
          
          // Wait for 3 seconds before navigating to thank you page
          setTimeout(() => {
            navigate("/thank-you", {
              state: { tableNo: orderData.tableNo, orderId: response.data.orderId },
            });
            localStorage.setItem("isReloadNeeded", "true");
          }, 1500);
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

  const startHideTimer = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setEditingItemId(null), 4000);
  };

  // swipe handlers
  const handleTouchStart = (e, id) => {
    swipeData.current[id] = {
      startX: e.touches[0].clientX,
      currentX: e.touches[0].clientX,
    };
  };

  const handleTouchMove = (e, id) => {
    const current = swipeData.current[id];
    if (!current) return;
    current.currentX = e.touches[0].clientX;
    const diff = current.currentX - current.startX;
    if (diff < 0) setSwipeOffsets((prev) => ({ ...prev, [id]: diff }));
  };

  const handleTouchEnd = (id) => {
    const current = swipeData.current[id];
    if (!current) return;
    const diff = current.currentX - current.startX;
    if (Math.abs(diff) > window.innerWidth * 0.5) removeItemCompletely(id);
    setSwipeOffsets((prev) => ({ ...prev, [id]: 0 }));
    delete swipeData.current[id];
  };

  const isCartEmpty = Object.values(cartItems).reduce((a, b) => a + b, 0) === 0;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const threshold = document.body.offsetHeight - 150;
      setShowFloating(scrollPosition > threshold);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="cart">
        {!isCartEmpty && (
          <div className="cart-header">
            <button className="cart-back-btn" onClick={() => navigate(-1)}>
              <FaArrowLeft className="arrow-left-icon" />
            </button>
            <h2 className="order-summary">Your order summary</h2>
            <button
              className="cart-clear-btn"
              onClick={() => setShowConfirmClear(true)}
            >
              <FaTrash />
            </button>
          </div>
        )}

        {isCartEmpty ? (
          <div className="cart-empty">
            <img className="empty-cart-img" src={assets.empty_cart2} alt="" />
            <button
              className="add-more-products"
              onClick={() => navigate("/category/All")}
            >
              View menu
            </button>
          </div>
        ) : (
          <>
            <div className="cart-summary-list">
              <AnimatePresence>
                {food_list
                  ?.filter((item) => item && item._id)
                  .filter((item) => (cartItems?.[item._id] || 0) > 0)
                  .map((item) => {
                    const quantity = cartItems[item._id];
                    return (
                      <React.Fragment key={item._id}>
                        <motion.div
                          className={`cart-swipe-container ${
                            item.description?.length > 50 ? "tall" : ""
                          }`}
                          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                            marginBottom: "10px",
                          }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.3 }}
                          layout
                        >
                          <div className="cart-swipe-background">
                            <FaTrash className="swipe-trash-icon" />
                          </div>

                          <div
                            className={`cart-summary-item ${
                              editingItemId === item._id ? "active-blur" : ""
                            }`}
                            onTouchStart={(e) => handleTouchStart(e, item._id)}
                            onTouchMove={(e) => handleTouchMove(e, item._id)}
                            onTouchEnd={() => handleTouchEnd(item._id)}
                            style={{
                              transform: `translateX(${
                                swipeOffsets[item._id] || 0
                              }px)`,
                              transition: swipeOffsets[item._id]
                                ? "none"
                                : "transform 0.3s ease",
                            }}
                          >
                            <img
                              src={url + "/images/" + item.image}
                              alt={item.name}
                              className="cart-item-img"
                            />
                            <div className="cart-item-info">
                              <p className="cart-item-name">
                                {item.name}{" "}
                                <br />
                                <span className="cart-item-description">
                                  {item.description}
                                </span>
                              </p>

                              <p className="cart-item-total">
                                {(item.price * quantity).toFixed(2)} €
                              </p>
                            </div>

                            <div
                              className="cart-item-buttons"
                              style={{ position: "relative" }}
                            >
                              <div className="inline-quantity-controls">
                                <button
                                  onClick={() => {
                                    updateCartItemQuantity(item._id, quantity - 1);
                                  }}
                                  className="quantity-btn-order"
                                >
                                  <FaMinus />
                                </button>
                                <span className="quantity-order">{quantity}</span>
                                <button
                                  onClick={() => {
                                    updateCartItemQuantity(item._id, quantity + 1);
                                  }}
                                  className="quantity-btn-order"
                                >
                                  <FaPlus />
                                </button>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                        <hr className="cart-separator" />
                      </React.Fragment>
                    );
                  })}
              </AnimatePresence>
            </div>

            <div className="add-more-wrapper">
              <button
                className="add-more-products"
                onClick={() => navigate("/category/All")}
              >
                Add more products 
                <span className="plus-btn">
                  <FaPlus />
                </span>
              </button>
            </div>

            <div className="special-instructions">
              <h2 className="special-instructions">Special instructions</h2>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Enter any special instructions about your order"
                rows={4}
              />
            </div>

            <div className="cart-bottom">
              <div className="cart-total">
                <h2>Cart Total</h2>
                <div>
                  <div className="cart-total-details">
                    <p>Sub-total</p>
                    <p>{getTotalCartAmount()} €</p>
                  </div>
                  <hr />
                  <div className="cart-total-details">
                    <p>Promo Code</p>
                    <p>
                      {promoCode && discount > 0
                        ? `${promoCode} (${discount} €)`
                        : 0}
                    </p>
                  </div>
                  <hr />
                  <div className="cart-total-details">
                    <b>Total</b>
                    <b>
                      {getTotalCartAmount() === 0
                        ? 0
                        : getTotalCartAmount() - discount}{" "}
                      €
                    </b>
                  </div>
                </div>

                <h3 className="payment-method-title">
                  Select your payment method:
                </h3>
                {paymentError && (
                  <p className="payment-error-message">{paymentError}</p>
                )}

                <label className="label-payment-method">
                  <input
                    className="payment-method"
                    type="radio"
                    name="paymentMethod"
                    value="creditCard"
                    onChange={handlePaymentMethodChange}
                    checked={paymentMethod === "creditCard"}
                  />
                  Pay online by credit card
                </label>
                <label className="label-payment-method">
                  <input
                    className="payment-method"
                    type="radio"
                    name="paymentMethod"
                    value="cashPOS"
                    onChange={handlePaymentMethodChange}
                    checked={paymentMethod === "cashPOS"}
                  />
                  Pay cash / POS
                </label>
                <div className="payment-options">
                  <img
                    src={assets.visa_logo}
                    alt="Visa"
                    className="payment-option"
                  />
                  <img
                    src={assets.mastercard_logo}
                    alt="Mastercard"
                    className="payment-option"
                  />
                  <img
                    src={assets.apple_pay}
                    alt="Apple Pay"
                    className="payment-option"
                  />
                  <img
                    src={assets.google_pay}
                    alt="Google Pay"
                    className="payment-option"
                  />
                </div>
                <p className="payment-security-note">
                  Secured payments powered by
                  <img
                    src={assets.stripe_logo}
                    alt="Stripe Logo"
                    className="stripe-logo"
                  />
                </p>
                <form
                  onSubmit={placeOrder}
                  className={`place-order ${showFloating ? "hide" : "show"}`}
                >
                  <button type="submit" disabled={isPlacingOrder}>
                    {paymentMethod === "creditCard"
                      ? "PROCEED TO PAYMENT"
                      : "PLACE ORDER"}
                  </button>
                </form>
              </div>

              <div className="cart-promocode">
                <p>If you have a promo code, enter it here</p>
                <div className="cart-promocode-input">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={handlePromoCodeChange}
                    placeholder="Enter promo code"
                  />
                  <button
                    className="promo-code-button"
                    type="button"
                    onClick={applyPromoCode}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {!isCartEmpty && (
          <div 
            className={`floating-checkout ${isPlacingOrder ? 'placing-order' : ''}`} 
            onClick={placeOrder}
          >
            <div className="floating-checkout-left">
              <span className="floating-checkout-count">
                {Object.values(cartItems).reduce((a, b) => a + b, 0)}
              </span>{" "}
              <span className="floating-checkout-cta">
                {paymentMethod === "creditCard"
                  ? "Proceed to Payment"
                  : "Place Order"}
              </span>
              <span className="floating-checkout-total">
                {(getTotalCartAmount() - discount).toFixed(2)} €
              </span>
              <span className="order-confirmation">Order Placed!</span>
            </div>
          </div>
        )}
      </div>
      <AnimatePresence>
        {showConfirmClear && (
          <motion.div
            className="confirm-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="confirm-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3>Are you sure you want to clear your cart?</h3>
              <div className="confirm-buttons">
                <button
                  className="confirm-yes"
                  onClick={() => {
                    Object.keys(cartItems).forEach((id) =>
                      removeItemCompletely(id)
                    );
                    setShowConfirmClear(false);
                  }}
                >
                  Yes
                </button>
                <button
                  className="confirm-no"
                  onClick={() => setShowConfirmClear(false)}
                >
                  No
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