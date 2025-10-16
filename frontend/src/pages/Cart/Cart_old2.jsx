import React, { useContext, useState, useEffect, useRef } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaMinus, FaTrash, FaArrowLeft, FaTag, FaCreditCard, FaMoneyBillWave, FaLock, FaStar, FaCrown } from "react-icons/fa";
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
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showFloatingCheckout, setShowFloatingCheckout] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  const tableNumber = localStorage.getItem("tableNumber") || null;

  const promoCodes = {
    DISCOUNT10: 10,
    SAVE5: 5,
    OFF20: 20,
    PREMIUM15: 15,
  };

  const isCartEmpty = Object.values(cartItems).reduce((a, b) => a + b, 0) === 0;

  useEffect(() => {
    // Simulate premium user check
    setIsPremiumUser(Math.random() > 0.5);
    setShowFloatingCheckout(!isCartEmpty);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    setShowFloatingCheckout(!isCartEmpty);
  }, [isCartEmpty]);

  const applyPromoCode = () => {
    if (promoCodes[promoCode]) {
      setDiscount(promoCodes[promoCode]);
      toast.success(`Promo code applied! ${promoCodes[promoCode]}€ discount`);
    } else {
      toast.error("Invalid Promo Code");
      setDiscount(0);
    }
  };

  const placeOrder = async (event) => {
    if (event) event.preventDefault();
    if (orderPlaced) return;

    if (!paymentMethod) {
      setPaymentError("Please select a payment method.");
      setTimeout(() => {
        const paymentSection = document.getElementById('payment-method-section');
        if (paymentSection) paymentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    setIsPlacingOrder(true);

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        const quantity = cartItems[item._id];
        orderItems.push({
          foodId: item._id,
          name: item.name,
          price: item.price,
          quantity: quantity,
          itemTotal: (item.price * quantity).toFixed(2),
          image: item.image
        });
      }
    });

    const totalAmount = getTotalCartAmount() - discount;

    const orderData = {
      userId: token,
      items: orderItems,
      amount: totalAmount,
      tableNo: tableNumber,
      userData: { tableNo: tableNumber },
      specialInstructions: specialInstructions
    };

    try {
      if (paymentMethod === "creditCard") {
        const response = await axios.post(url + "/api/order/place", orderData, {
          headers: { token },
        });
        if (response.data.success)
          window.location.replace(response.data.session_url);
        else {
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
          setTimeout(() => {
            setShowFloatingCheckout(false);
            setTimeout(() => {
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

  const confirmDelete = () => {
    if (itemToDelete) {
      removeItemCompletely(itemToDelete);
      setItemToDelete(null);
    }
  };

  const getTotalItems = () => {
    return Object.values(cartItems).reduce((a, b) => a + b, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="cart-premium"
    >
      {/* Premium Header */}
      <div className="cart-header-premium">
        <div className="header-content">
          <button className="back-btn-premium" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div className="header-center">
            <h1 className="cart-title-premium">Your Order</h1>
            {tableNumber && (
              <div className="table-badge-premium">
                <span>Table {tableNumber}</span>
              </div>
            )}
          </div>
          {!isCartEmpty && (
            <button className="clear-btn-premium" onClick={() => setShowConfirmClear(true)}>
              <FaTrash />
            </button>
          )}
        </div>
      </div>

      {isCartEmpty ? (
        <motion.div
          className="empty-cart-premium"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="empty-cart-illustration">
            <img src={assets.empty_cart2} alt="Empty cart" className="empty-cart-img-premium" />
            <div className="floating-elements">
              <div className="floating-element element-1">🍕</div>
              <div className="floating-element element-2">🍔</div>
              <div className="floating-element element-3">🥗</div>
            </div>
          </div>
          <h2>Your cart feels lonely</h2>
          <p>Add some delicious items to get started</p>
          <motion.button
            className="browse-menu-btn-premium"
            onClick={() => navigate("/category/All")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus />
            Browse Menu
          </motion.button>
        </motion.div>
      ) : (
        <div className="cart-content-premium">
          {/* Premium User Banner */}
          {isPremiumUser && (
            <div className="premium-banner">
              <div className="premium-content">
                <FaCrown className="crown-icon" />
                <div className="premium-text">
                  <span className="premium-title">Premium Member</span>
                  <span className="premium-subtitle">Enjoy exclusive discounts and priority service</span>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="order-items-section-premium">
            <div className="section-header-premium">
              <h3>Your Order</h3>
              <div className="items-count-badge">{getTotalItems()} items</div>
            </div>
            <div className="order-items-list-premium">
              <AnimatePresence>
                {food_list
                  ?.filter((item) => item && item._id && cartItems[item._id] > 0)
                  .map((item, index) => {
                    const quantity = cartItems[item._id];
                    return (
                      <motion.div
                        key={item._id}
                        className="order-item-premium"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className="item-image-premium">
                          <img src={url + "/images/" + item.image} alt={item.name} />
                          {item.isPopular && (
                            <div className="popular-badge">
                              <FaStar />
                              Popular
                            </div>
                          )}
                        </div>
                        
                        <div className="item-main-content-premium">
                          <div className="item-header-premium">
                            <h4 className="item-name-premium">{item.name}</h4>
                            <div className="item-price-premium">{item.price} €</div>
                          </div>
                          
                          <p className="item-description-premium">{item.description}</p>
                          
                          <div className="item-footer-premium">
                            <div className="quantity-controls-premium">
                              <button
                                onClick={() => updateCartItemQuantity(item._id, quantity - 1)}
                                className="quantity-btn-premium minus"
                              >
                                <FaMinus />
                              </button>
                              <span className="quantity-display-premium">{quantity}</span>
                              <button
                                onClick={() => updateCartItemQuantity(item._id, quantity + 1)}
                                className="quantity-btn-premium plus"
                              >
                                <FaPlus />
                              </button>
                            </div>
                            
                            <div className="item-total-section-premium">
                              <div className="item-total-premium">
                                {(item.price * quantity).toFixed(2)} €
                              </div>
                              <button
                                className="remove-item-premium"
                                onClick={() => setItemToDelete(item._id)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>

            <motion.button
              className="add-more-btn-premium"
              onClick={() => navigate("/category/All")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus />
              Add More Items
            </motion.button>
          </div>

          {/* Special Instructions */}
          <div className="instructions-section-premium">
            <h3>Special Instructions</h3>
            <div className="input-container-premium">
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests, dietary requirements, or allergies..."
                rows={3}
                className="premium-textarea"
              />
              <div className="char-count">{specialInstructions.length}/200</div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-premium">
            <div className="summary-header-premium">
              <h3>Order Summary</h3>
              <div className="summary-badge-premium">{getTotalItems()} items</div>
            </div>
            
            <div className="summary-content-premium">
              <div className="summary-line-premium">
                <span>Subtotal</span>
                <span>{getTotalCartAmount().toFixed(2)} €</span>
              </div>
              
              {discount > 0 && (
                <motion.div 
                  className="summary-line-premium discount-line-premium"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>Discount</span>
                  <span className="discount-amount-premium">-{discount} €</span>
                </motion.div>
              )}

              <div className="summary-divider-premium"></div>

              <div className="summary-line-premium total-line-premium">
                <span>Total Amount</span>
                <span className="total-amount-premium">
                  {(getTotalCartAmount() - discount).toFixed(2)} €
                </span>
              </div>
            </div>

            {/* Promo Code Section */}
            <div className="promo-section-premium">
              <h4>Apply Promo Code</h4>
              <div className="promo-input-group-premium">
                <FaTag className="promo-icon-premium" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="promo-input-premium"
                />
                <button onClick={applyPromoCode} className="promo-apply-btn-premium">
                  Apply
                </button>
              </div>
              <div className="promo-suggestions">
                <span>Try: </span>
                <button onClick={() => setPromoCode("DISCOUNT10")}>DISCOUNT10</button>
                <button onClick={() => setPromoCode("SAVE5")}>SAVE5</button>
                {isPremiumUser && (
                  <button onClick={() => setPromoCode("PREMIUM15")}>PREMIUM15</button>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div id="payment-method-section" className="payment-section-premium">
            <h3>Select Payment Method</h3>
            {paymentError && (
              <motion.div 
                className="payment-error-premium"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                {paymentError}
              </motion.div>
            )}
            
            <div className="payment-options-premium">
              <motion.label 
                className={`payment-option-premium ${paymentMethod === 'creditCard' ? 'selected' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="creditCard"
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setPaymentError("");
                  }}
                  checked={paymentMethod === "creditCard"}
                />
                <div className="payment-option-content-premium">
                  <div className="payment-icon-container">
                    <FaCreditCard className="payment-icon-premium" />
                  </div>
                  <div className="payment-details">
                    <div className="payment-title-premium">Credit/Debit Card</div>
                    <div className="payment-subtitle-premium">Pay securely online</div>
                  </div>
                  <div className="payment-badge-premium">Recommended</div>
                </div>
              </motion.label>

              <motion.label 
                className={`payment-option-premium ${paymentMethod === 'cashPOS' ? 'selected' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cashPOS"
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setPaymentError("");
                  }}
                  checked={paymentMethod === "cashPOS"}
                />
                <div className="payment-option-content-premium">
                  <div className="payment-icon-container">
                    <FaMoneyBillWave className="payment-icon-premium" />
                  </div>
                  <div className="payment-details">
                    <div className="payment-title-premium">Cash / POS Terminal</div>
                    <div className="payment-subtitle-premium">Pay at the restaurant</div>
                  </div>
                </div>
              </motion.label>
            </div>

            {paymentMethod === 'creditCard' && (
              <motion.div 
                className="payment-security-premium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="security-header">
                  <FaLock className="lock-icon-premium" />
                  <span>Secured by </span>
                  <img src={assets.stripe_logo} alt="Stripe" className="stripe-logo-premium" />
                </div>
                <div className="payment-badges-premium">
                  <img src={assets.visa_logo} alt="Visa" />
                  <img src={assets.mastercard_logo} alt="Mastercard" />
                  <img src={assets.apple_pay} alt="Apple Pay" />
                  <img src={assets.google_pay} alt="Google Pay" />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Floating Checkout */}
      {showFloatingCheckout && (
        <motion.div 
          className={`floating-checkout-premium ${(isPlacingOrder || orderPlaced) ? 'placing-order' : ''}`}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="floating-content-premium">
            {!(isPlacingOrder || orderPlaced) ? (
              <>
                <div className="floating-info-premium">
                  <div className="floating-details">
                    <span className="item-count-premium">{getTotalItems()} items</span>
                    <span className="total-price-premium">{(getTotalCartAmount() - discount).toFixed(2)} €</span>
                  </div>
                  {discount > 0 && (
                    <div className="discount-badge-floating">
                      You save {discount} €
                    </div>
                  )}
                </div>
                <motion.button 
                  className="checkout-btn-premium"
                  onClick={placeOrder}
                  disabled={isPlacingOrder}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {paymentMethod === "creditCard" ? "Pay Now" : "Place Order"}
                </motion.button>
              </>
            ) : (
              <div className="order-placed-confirmation-premium">
                <div className="success-animation-premium">
                  <div className="checkmark">✓</div>
                </div>
                <span>Order Placed Successfully!</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Confirmation Modals */}
      <AnimatePresence>
        {itemToDelete && (
          <motion.div
            className="modal-overlay-premium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setItemToDelete(null)}
          >
            <motion.div
              className="modal-premium"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-icon-premium delete">
                <FaTrash />
              </div>
              <h3>Remove Item</h3>
              <p>Are you sure you want to remove this item from your cart?</p>
              <div className="modal-actions-premium">
                <button className="btn-secondary-premium" onClick={() => setItemToDelete(null)}>
                  Cancel
                </button>
                <button className="btn-primary-premium" onClick={confirmDelete}>
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showConfirmClear && (
          <motion.div
            className="modal-overlay-premium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmClear(false)}
          >
            <motion.div
              className="modal-premium"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-icon-premium clear">
                <FaTrash />
              </div>
              <h3>Clear Cart</h3>
              <p>Are you sure you want to clear your entire cart? This action cannot be undone.</p>
              <div className="modal-actions-premium">
                <button className="btn-secondary-premium" onClick={() => setShowConfirmClear(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-primary-premium" 
                  onClick={() => {
                    Object.keys(cartItems).forEach(removeItemCompletely);
                    setShowConfirmClear(false);
                  }}
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



