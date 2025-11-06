import React, { useContext, useState, useEffect, useRef } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FoodModal from "../../components/FoodItem/FoodModal";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaArrowLeft,
  FaCreditCard,
  FaMoneyBillWave,
  FaLock,
  FaHandHoldingHeart,
} from "react-icons/fa";
import { assets } from "../../assets/assets";

const MyOrders = () => {
  const { token, food_list, url } = useContext(StoreContext);

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
  const [showFloatingCheckout, setShowFloatingCheckout] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [selectedFoodQuantity, setSelectedFoodQuantity] = useState(1);
  const [selectedFoodInstructions, setSelectedFoodInstructions] = useState("");

  // State-uri pentru comenzile neplătite
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State-uri pentru sistemul de tips - SETAT LA 0 BY DEFAULT
  const [tipPercentage, setTipPercentage] = useState(0);
  const [customTipAmount, setCustomTipAmount] = useState("");
  const [showTipsSection, setShowTipsSection] = useState(false);

  const tableNumber = localStorage.getItem("tableNumber") || null;

  const promoCodes = {
    DISCOUNT10: 10,
    SAVE5: 5,
    OFF20: 20,
  };

  // Înlocuim cartItems cu produsele din comenzile neplătite
  const orderItems = unpaidOrders.flatMap((order) =>
    order.items.map((item) => ({
      ...item,
      orderId: order._id,
      uniqueId: `${order._id}_${item._id}`, // ID unic pentru fiecare item
    }))
  );

  const isCartEmpty = orderItems.length === 0;

  useEffect(() => {
    document.body.classList.add("cart-page");
    return () => {
      document.body.classList.remove("cart-page");
    };
  }, []);

  // Fetch comenzile neplătite
  useEffect(() => {
    const fetchUnpaidOrders = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(
          url + "/api/order/userOrders",
          {},
          { headers: { token } }
        );

        // Verifică structura răspunsului
        const ordersData = response.data?.data || response.data || [];

        const unpaidOrders = Array.isArray(ordersData)
          ? ordersData.filter((order) => order && !order.payment)
          : [];

        setUnpaidOrders(unpaidOrders);
        setData((data) => ({ ...data, tableNo: tableNumber }));
      } catch (error) {
        console.error("Error fetching unpaid orders", error);
        setUnpaidOrders([]);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchUnpaidOrders();
    } else {
      setIsLoading(false);
      setUnpaidOrders([]);
    }
  }, [url, token, tableNumber]);

  useEffect(() => {
    setShowFloatingCheckout(!isCartEmpty);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    setShowFloatingCheckout(!isCartEmpty);
  }, [isCartEmpty, orderItems]);

  // Funcție pentru a găsi informațiile complete despre mâncare
  const findFoodItem = (itemId) => {
    const item = orderItems.find((item) => item.uniqueId === itemId);
    if (item) {
      // Caută în food_list pentru detalii complete
      const foodItem = food_list.find((food) => food._id === item._id);
      return foodItem || item; // Returnează foodItem dacă există, altfel item-ul de bază
    }
    return null;
  };

  const openFoodModal = (itemId) => {
    const foodItem = findFoodItem(itemId);
    if (foodItem) {
      const item = orderItems.find((item) => item.uniqueId === itemId);
      setSelectedFood(foodItem);
      setSelectedFoodQuantity(item.quantity);
      setSelectedFoodInstructions(item.specialInstructions || "");
      setIsFoodModalOpen(true);
    }
  };

  const closeFoodModal = () => {
    setIsFoodModalOpen(false);
    setSelectedFood(null);
    setSelectedFoodQuantity(1);
    setSelectedFoodInstructions("");
  };

  // Funcții pentru sistemul de tips
  const calculateTipAmount = () => {
    const subtotal = getTotalOrderAmount();
    if (tipPercentage > 0) {
      return (subtotal * tipPercentage) / 100;
    } else if (customTipAmount) {
      return parseFloat(customTipAmount) || 0;
    }
    return 0;
  };

  const handleTipSelection = (percentage) => {
    setTipPercentage(percentage);
    setCustomTipAmount("");
  };

  const handleCustomTipChange = (e) => {
    const value = e.target.value;
    if (value === "" || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
      setCustomTipAmount(value);
      setTipPercentage(0);
    }
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
    const method = event.target.value;
    setPaymentMethod(method);

    // Arată secțiunea de tips doar pentru plata cu card și setează tips-ul la 10%
    if (method === "creditCard") {
      setShowTipsSection(true);
      setTipPercentage(0); // Setează automat la 10% când se selectează cardul
      setCustomTipAmount(""); // Resetează custom tip amount
    } else {
      setShowTipsSection(false);
      setTipPercentage(0); // Resetează tips-ul pentru alte metode de plată
      setCustomTipAmount("");
    }

    if (paymentError) setPaymentError("");
  };

  const handleClearCart = async () => {
    try {
      // Aici va trebui să implementezi logica pentru ștergerea tuturor comenzilor neplătite
      // Aceasta este o implementare temporară
      setUnpaidOrders([]);
      setShowConfirmClear(false);
      toast.success("All unpaid orders cleared");
    } catch (error) {
      console.error("Error clearing unpaid orders:", error);
      toast.error("Error clearing orders");
    }
  };

  // Calculează totalul comenzilor neplătite
  const getTotalOrderAmount = () => {
    return orderItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  // Calculează numărul total de items
  const getTotalOrderItemCount = () => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculează totalul final cu discount și tips
  const getFinalTotalAmount = () => {
    const subtotal = getTotalOrderAmount();
    const tipAmount = calculateTipAmount();
    return subtotal - discount + tipAmount;
  };

  const placeOrder = async (event) => {
    if (event) event.preventDefault();

    if (orderPlaced) return;

    if (!paymentMethod) {
      setPaymentError("Please select a payment method.");
      setTimeout(() => {
        const paymentSection = document.getElementById(
          "payment-method-section"
        );
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

    const tipAmount = calculateTipAmount();
    const totalAmount = getTotalOrderAmount() - discount + tipAmount;
    const orderIds = unpaidOrders.map((order) => order._id);

    const orderData = {
      tableNo: tableNumber,
      userData: data,
      items: orderItems,
      amount: totalAmount,
      tipAmount: tipAmount,
      tipPercentage: tipPercentage,
      specialInstructions: specialInstructions,
      orders: orderIds,
    };

    try {
      if (paymentMethod === "creditCard") {
        const response = await axios.post(
          url + "/api/order/pay-order",
          orderData,
          {
            headers: { token },
          }
        );

        if (response.data.success) {
          window.location.replace(response.data.session_url);
        } else {
          alert("Error processing payment.");
          setIsPlacingOrder(false);
        }
      } else if (paymentMethod === "cashPOS") {
        // Pentru plata cash, folosește endpoint-ul tău existent sau adaptează-l
        const response = await axios.post(
          url + "/api/order/place-cash",
          orderData,
          { headers: { token } }
        );

        if (response.data.success) {
          setOrderPlaced(true);
          setShowFloatingCheckout(false);

          setTimeout(() => {
            navigate("/thank-you", {
              state: {
                tableNo: orderData.tableNo,
                orderId: response.data.orderId,
              },
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

  // Formatare dată
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-GB");
    const formattedTime = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${formattedDate} ${formattedTime}`;
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="cart-container"
      >
        <div className="loading-state">
          <motion.div
            className="smooth-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span>Loading your orders...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="cart-container"
    >
      {/* Header Section */}
      <div className="cart-header-section-orders">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
          <span>Back</span>
        </button>

        <h1 className="cart-title">Orders</h1>
        <div className="clear-cart-placeholder"></div>
      </div>

      {/* Empty Cart State */}
      {isCartEmpty && !orderPlaced ? (
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
              alt="Empty orders"
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
            No unpaid orders
          </motion.h2>

          <motion.p
            className="empty-cart-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            You don't have any unpaid orders. All your orders have been paid or
            you haven't placed any orders yet.
          </motion.p>

          <motion.button
            className="browse-menu-button"
            onClick={() => navigate("/category/All")}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(40, 167, 69, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <span>Browse Menu</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        </motion.div>
      ) : (
        <div className="cart-content">
          {/* Orders List */}
          <div className="cart-items-section">
            <div className="cart-items-list">
              <AnimatePresence>
                {unpaidOrders.map((order, orderIndex) => (
                  <div
                    key={order._id || `order-${orderIndex}`}
                    className="order-group"
                  >
                    {/* Order Header */}
                    <div className="order-header">
                      <h6 className="order-date-title">
                        Order from {formatDateTime(order.date)}
                      </h6>
                    </div>

                    {/* Order Items */}
                    {order.items.map((item, itemIndex) => {
                      const uniqueId = `${order._id}_${item._id}_${itemIndex}`;
                      const foodItem = findFoodItem(uniqueId);

                      return (
                        <React.Fragment key={uniqueId}>
                          <motion.div
                            className="cart-item-container"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            layout
                          >
                            <div className="cart-item">
                              <button
                                className="item-image-button"
                                onClick={() => openFoodModal(uniqueId)}
                              >
                                <img
                                  src={
                                    url +
                                    "/images/" +
                                    (foodItem?.image || item.image)
                                  }
                                  alt={foodItem?.name || item.name}
                                  className="item-image"
                                  onError={(e) => {
                                    e.target.src = assets.placeholder_food;
                                  }}
                                />
                              </button>
                              <div className="item-details">
                                <button
                                  className="item-name-button"
                                  onClick={() => openFoodModal(uniqueId)}
                                >
                                  <h3 className="item-name">
                                    {foodItem?.name || item.name}
                                  </h3>
                                  
                                </button>
                                {item.specialInstructions && (
                                  <div className="item-special-instructions">
                                    <span className="instructions-label">
                                      Note:{" "}
                                    </span>
                                    {item.specialInstructions}
                                  </div>
                                )}

                                <p className="item-price">
                                  {(item.price * item.quantity).toFixed(2)} €
                                </p>
                              </div>
                              <div className="myorders-quantity-display">
                                <span className="myorders-quantity-number">
                                  x{item.quantity}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                          {itemIndex < order.items.length - 1 && (
                            <div className="item-divider"></div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                ))}
              </AnimatePresence>
            </div>

            {/* <button
              className="add-more-button"
              onClick={() => navigate("/category/All")}
            >
              <FaPlus />
              <span>Add More Items</span>
            </button> */}
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <h2 className="section-title">Order Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{getTotalOrderAmount().toFixed(2)} €</span>
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
                  {getTotalOrderAmount() === 0
                    ? 0
                    : (getTotalOrderAmount() - discount).toFixed(2)}{" "}
                  €
                </span>
              </div>
            </div>
          </div>

          {showTipsSection && (
            <motion.div
              className="cart-tips-section active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="cart-tips-title">
                <FaHandHoldingHeart className="cart-tips-icon" />
                Add a Tip for Excellent Service
              </h2>

              <div className="cart-tips-options">
                {[0, 5, 10, 15, 20].map((percentage) => (
                  <label key={percentage} className="cart-tips-option">
                    <input
                      type="radio"
                      name="tipPercentage"
                      value={percentage}
                      onChange={() => handleTipSelection(percentage)}
                      checked={tipPercentage === percentage && !customTipAmount}
                    />
                    <div className="cart-tips-option-content">
                      <span className="cart-tips-percentage">
                        {percentage}%
                      </span>
                      <span className="cart-tips-amount">
                        {percentage === 0
                          ? "No tip"
                          : `${(
                              (getTotalOrderAmount() * percentage) /
                              100
                            ).toFixed(2)} €`}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Custom Tip Section - separat și mai frumos */}
              <div className="custom-tip-section">
                <label className="custom-tip-label">
                  Or enter custom amount:
                </label>
                <div className="custom-tip-input-wrapper">
                  <div className="custom-tip-input-container">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={customTipAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Permite doar numere pozitive, zero, sau șir gol
                        if (
                          value === "" ||
                          (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)
                        ) {
                          setCustomTipAmount(value);
                          setTipPercentage(0);
                        }
                      }}
                      onKeyDown={(e) => {
                        // Blochează tastele minus și 'e' (pentru exponent)
                        if (e.key === "-" || e.key === "e" || e.key === "E") {
                          e.preventDefault();
                        }
                      }}
                      onFocus={() => {
                        setTipPercentage(0);
                        if (!customTipAmount) setCustomTipAmount("");
                      }}
                      onBlur={(e) => {
                        // La ieșire din câmp, formatează valoarea și asigură-te că e pozitivă
                        const value = e.target.value;
                        if (value) {
                          const numValue = Math.max(0, parseFloat(value));
                          setCustomTipAmount(numValue.toFixed(2));
                        }
                      }}
                      className="custom-tip-input"
                    />
                    <span className="currency-symbol">€</span>
                  </div>
                  <div className="custom-tip-hint">
                    {customTipAmount &&
                      parseFloat(customTipAmount) > 0 &&
                      `(${(
                        (parseFloat(customTipAmount) / getTotalOrderAmount()) *
                        100
                      ).toFixed(1)}% of order)`}
                  </div>
                </div>
              </div>

              <div className="cart-tips-summary">
                <div className="cart-tips-summary-row">
                  <span>Subtotal:</span>
                  <span>{getTotalOrderAmount().toFixed(2)} €</span>
                </div>

                {discount > 0 && (
                  <div className="cart-tips-summary-row">
                    <span>Discount:</span>
                    <span>-{discount.toFixed(2)} €</span>
                  </div>
                )}

                {/* Tip - afișează doar dacă există tips */}
                {calculateTipAmount() > 0 && (
                  <div className="cart-tips-summary-row">
                    <span>Tip:</span>
                    <span>+{calculateTipAmount().toFixed(2)} €</span>
                  </div>
                )}

                <div className="cart-tips-summary-row total-with-tip">
                  <span>Total with tip:</span>
                  <span>{getFinalTotalAmount().toFixed(2)} €</span>
                </div>
              </div>
            </motion.div>
          )}
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
                <div className="item-count">{getTotalOrderItemCount()}</div>
                <div className="checkout-text">Pay Order</div>
                <div className="checkout-total">
                  {getFinalTotalAmount().toFixed(2)} €
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
              <h3>Clear All Orders</h3>
              <p>Are you sure you want to remove all unpaid orders?</p>
              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowConfirmClear(false)}
                >
                  Cancel
                </button>
                <button className="confirm-button" onClick={handleClearCart}>
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FoodModal
        food={selectedFood}
        closeModal={closeFoodModal}
        isOpen={isFoodModalOpen}
        initialQuantity={selectedFoodQuantity}
        initialInstructions={selectedFoodInstructions}
        // Adaptează acest prop dacă este necesar pentru comenzile neplătite
        cartItemId={
          selectedFood
            ? Object.keys(orderItems).find((id) => {
                const item = orderItems.find((item) => item.uniqueId === id);
                return item && item._id === selectedFood?._id;
              })
            : null
        }
      />
    </motion.div>
  );
};

export default MyOrders;
