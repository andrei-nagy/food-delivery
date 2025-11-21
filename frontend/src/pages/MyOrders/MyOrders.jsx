import React, { useContext, useState, useEffect, useRef } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FoodModal from "../../components/FoodItem/FoodModal";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useLanguage } from "../../context/LanguageContext";

import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaArrowLeft,
  FaCreditCard,
  FaMoneyBillWave,
  FaLock,
  FaHandHoldingHeart,
  FaCheckCircle,
  FaClock,
  FaTag,
  FaCheckCircle as FaCheck,
  FaPercent,
} from "react-icons/fa";
import { assets } from "../../assets/assets";
import WaiterModalCart from "../../components/Navbar/WaiterModal";

const MyOrders = () => {
  const {
    token,
    food_list,
    url,
    billRequested,
    markBillAsRequested,
    resetBillRequest,
    getTimeSinceBillRequest,
  } = useContext(StoreContext);

  const { t } = useTranslation();

  // ✅ STATE-URI NOI PENTRU PROMO CODE
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
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
const { currentLanguage } = useLanguage();
const [translatedProductNames, setTranslatedProductNames] = useState({});
const [translatedDescriptions, setTranslatedDescriptions] = useState({});
const [isTranslatingProductNames, setIsTranslatingProductNames] = useState(false);
const [isTranslatingDescriptions, setIsTranslatingDescriptions] = useState(false);

  // State-uri pentru comenzile neplătite
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State-uri pentru sistemul de tips
  const [tipPercentage, setTipPercentage] = useState(0);
  const [customTipAmount, setCustomTipAmount] = useState("");
  const [showTipsSection, setShowTipsSection] = useState(false);

  // State pentru WaiterModal
  const [showWaiterModal, setShowWaiterModal] = useState(false);

  const tableNumber = localStorage.getItem("tableNumber") || null;

  // Înlocuim cartItems cu produsele din comenzile neplătite
  const orderItems = unpaidOrders.flatMap((order) =>
    order.items.map((item) => ({
      ...item,
      orderId: order._id,
      uniqueId: `${order._id}_${item._id}`,
    }))
  );

  const isCartEmpty = orderItems.length === 0;

  useEffect(() => {
    document.body.classList.add("cart-page");
    return () => {
      document.body.classList.remove("cart-page");
    };
  }, []);

  // Adaugă funcțiile pentru traducerea numelor produselor
const translateProductNames = async () => {
  if (currentLanguage === 'ro' || !food_list.length) {
    setTranslatedProductNames({});
    setIsTranslatingProductNames(false);
    return;
  }

  setIsTranslatingProductNames(true);

  try {
    const productNamesToTranslate = [];
    const productIdMap = {};

    food_list.forEach((food, index) => {
      if (food?.name?.trim()) {
        productNamesToTranslate.push(food.name);
        productIdMap[index] = food._id;
      }
    });

    if (productNamesToTranslate.length > 0) {
      const combinedText = productNamesToTranslate.join(' ||| ');
      
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLanguage}&dt=t&q=${encodeURIComponent(combinedText)}`
      );

      if (response.ok) {
        const data = await response.json();
        const translatedCombinedText = data[0]?.map(item => item[0]).join('') || combinedText;
        const translatedNamesArray = translatedCombinedText.split(' ||| ');

        const newTranslatedProductNames = {};
        Object.keys(productIdMap).forEach((index) => {
          const foodId = productIdMap[index];
          const translatedName = translatedNamesArray[index] || productNamesToTranslate[index];
          if (translatedName && foodId) {
            newTranslatedProductNames[foodId] = translatedName;
          }
        });

        setTranslatedProductNames(newTranslatedProductNames);
      }
    }
  } catch (error) {
    console.error('❌ Error translating product names:', error);
  } finally {
    setIsTranslatingProductNames(false);
  }
};

// Adaugă funcția pentru traducerea descrierilor
const translateProductDescriptions = async () => {
  if (currentLanguage === 'ro' || !food_list.length) {
    setTranslatedDescriptions({});
    setIsTranslatingDescriptions(false);
    return;
  }

  setIsTranslatingDescriptions(true);

  try {
    const descriptionsToTranslate = [];
    const descriptionIdMap = {};

    food_list.forEach((food, index) => {
      if (food?.description?.trim()) {
        descriptionsToTranslate.push(food.description);
        descriptionIdMap[index] = food._id;
      }
    });

    if (descriptionsToTranslate.length > 0) {
      const combinedText = descriptionsToTranslate.join(' ||| ');
      
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLanguage}&dt=t&q=${encodeURIComponent(combinedText)}`
      );

      if (response.ok) {
        const data = await response.json();
        const translatedCombinedText = data[0]?.map(item => item[0]).join('') || combinedText;
        const translatedDescriptionsArray = translatedCombinedText.split(' ||| ');

        const newTranslatedDescriptions = {};
        Object.keys(descriptionIdMap).forEach((index) => {
          const foodId = descriptionIdMap[index];
          const translatedDescription = translatedDescriptionsArray[index] || descriptionsToTranslate[index];
          if (translatedDescription && foodId) {
            newTranslatedDescriptions[foodId] = translatedDescription;
          }
        });

        setTranslatedDescriptions(newTranslatedDescriptions);
      }
    }
  } catch (error) {
    console.error('❌ Error translating product descriptions:', error);
  } finally {
    setIsTranslatingDescriptions(false);
  }
};

// Adaugă efectele pentru traducere
useEffect(() => {
  if (food_list.length > 0) {
    translateProductNames();
    translateProductDescriptions();
  }
}, [currentLanguage, food_list.length]);

// Adaugă funcțiile pentru a obține numele și descrierile traduse
const getTranslatedProductName = (foodItem) => {
  if (!foodItem) return "";
  
  const foodId = foodItem._id;
  const translatedName = translatedProductNames[foodId];
  
  return currentLanguage !== 'ro' && translatedName 
    ? translatedName 
    : foodItem.name || "";
};

const getTranslatedDescription = (foodItem) => {
  if (!foodItem) return "";
  
  const foodId = foodItem._id;
  const translatedDescription = translatedDescriptions[foodId];
  
  return currentLanguage !== 'ro' && translatedDescription 
    ? translatedDescription 
    : foodItem.description || "";
};

  // ✅ FUNCȚIE ÎMBUNĂTĂȚITĂ: Găsește informațiile complete despre mâncare din food_list
  const findFoodItem = (itemId) => {
    const item = orderItems.find((item) => item.uniqueId === itemId);
    if (item) {
      // Încearcă mai multe metode de a găsi produsul în food_list
      const foodItem = food_list.find((food) => {
        const match =
          food._id === item.foodId ||
          food._id === item._id ||
          food._id === item.baseFoodId ||
          (food.name && item.name && food.name === item.name);

        return match;
      });

      return foodItem || item;
    }

    return null;
  };

  // ✅ FUNCȚIE: Calculează prețul cu discount pentru un item (la fel ca în Cart)
  const getItemPriceWithDiscount = (foodItem, cartItem) => {
    if (!foodItem) {
      return {
        unitPrice: 0,
        totalPrice: 0,
        hasDiscount: false,
        discountPercentage: 0,
        originalPrice: 0,
      };
    }

    const rawPrice = parseFloat(foodItem.price) || 0;
    const discountPercentage = parseFloat(foodItem.discountPercentage) || 0;

    // Calculează prețul cu discount
    const discountedPrice =
      discountPercentage > 0
        ? rawPrice * (1 - discountPercentage / 100)
        : rawPrice;

    // Adaugă prețul extraselor (dacă există)
    const extrasPrice = cartItem?.extrasPrice || 0;

    const result = {
      unitPrice: discountedPrice + extrasPrice,
      totalPrice: (discountedPrice + extrasPrice) * (cartItem?.quantity || 1),
      hasDiscount: discountPercentage > 0,
      discountPercentage,
      originalPrice: rawPrice + extrasPrice,
    };

    return result;
  };

  // ✅ CALCULEAZĂ TOTALUL REAL (cu discount-urile aplicate)
  const getTotalOrderAmount = () => {
    return orderItems.reduce((total, item) => {
      const foodItem = findFoodItem(item.uniqueId);
      if (foodItem) {
        const priceInfo = getItemPriceWithDiscount(foodItem, item);
        return total + priceInfo.totalPrice;
      }
      // Fallback la prețul original din item dacă nu găsim foodItem
      return total + item.price * item.quantity;
    }, 0);
  };

  // ✅ CALCULEAZĂ SUBTOTAL-UL ORIGINAL (fără discount-uri)
  const getOriginalSubtotal = () => {
    return orderItems.reduce((total, item) => {
      const foodItem = findFoodItem(item.uniqueId);
      if (foodItem) {
        const priceInfo = getItemPriceWithDiscount(foodItem, item);
        return total + priceInfo.originalPrice * item.quantity;
      }
      return total + item.price * item.quantity;
    }, 0);
  };

  // ✅ CALCULEAZĂ DISCOUNT-UL TOTAL DIN PRODUSE
  const getTotalProductDiscountAmount = () => {
    let totalDiscount = 0;

    orderItems.forEach((item) => {
      if (item && item.quantity > 0) {
        const foodItem = findFoodItem(item.uniqueId);
        if (foodItem) {
          const priceInfo = getItemPriceWithDiscount(foodItem, item);
          if (priceInfo.hasDiscount) {
            const originalTotal = priceInfo.originalPrice * item.quantity;
            const discountedTotal = priceInfo.totalPrice;
            const itemDiscount = originalTotal - discountedTotal;
            totalDiscount += itemDiscount;
          }
        }
      }
    });

    return totalDiscount;
  };

  // Calculează numărul total de items
  const getTotalOrderItemCount = () => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  // ✅ CALCULEAZĂ TOTALUL FINAL CU PROMO CODE ȘI TIPS
  const getFinalTotalAmount = () => {
    const subtotal = getTotalOrderAmount();
    const tipAmount = calculateTipAmount();
    const promoDiscount = discount || 0;
    return subtotal - promoDiscount + tipAmount;
  };

  // ✅ FUNCȚIE NOUĂ pentru aplicarea promo code-ului DIN BAZA DE DATE
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    try {
      const response = await axios.post(`${url}/admin/promo-codes/validate`, {
        code: promoCode.trim(),
        orderAmount: getTotalOrderAmount(),
      });

      if (response.data.success) {
        const promoData = response.data.data;
        const discountAmount = promoData.discountAmount;

        setDiscount(discountAmount);
        setAppliedPromoCode(promoData.code);
        setIsPromoApplied(true);
        setPromoError("");

        toast.success(
          t("my_orders.promo_applied", { amount: discountAmount.toFixed(2) })
        );
      } else {
        setPromoError(response.data.message);
        setIsPromoApplied(false);
        setAppliedPromoCode("");
        setDiscount(0);
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      setPromoError(t("my_orders.promo_error"));
      setIsPromoApplied(false);
      setAppliedPromoCode("");
      setDiscount(0);
    }
  };

  // ✅ FUNCȚIE NOUĂ pentru eliminarea promo code-ului
  const removePromoCode = () => {
    setPromoCode("");
    setAppliedPromoCode("");
    setIsPromoApplied(false);
    setDiscount(0);
    setPromoError("");
  };

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
    setShowFloatingCheckout(!isCartEmpty && !billRequested);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    setShowFloatingCheckout(!isCartEmpty && !billRequested);
  }, [isCartEmpty, orderItems, billRequested]);

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
    const subtotal = getTotalOrderAmount() - discount;
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

  const handlePaymentMethodChange = (event) => {
    const method = event.target.value;
    setPaymentMethod(method);

    if (method === "creditCard") {
      setShowTipsSection(true);
      setTipPercentage(0);
      setCustomTipAmount("");
    } else {
      setShowTipsSection(false);
      setTipPercentage(0);
      setCustomTipAmount("");
    }

    if (paymentError) setPaymentError("");
  };

  const handleClearCart = async () => {
    try {
      setUnpaidOrders([]);
      setShowConfirmClear(false);
      toast.success("All unpaid orders cleared");
    } catch (error) {
      console.error("Error clearing unpaid orders:", error);
      toast.error("Error clearing orders");
    }
  };

  // ✅ FUNCȚIA PLACEORDER
  const placeOrder = async (event) => {
    if (event) event.preventDefault();

    if (orderPlaced || billRequested) return;

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
    const totalAmount = getFinalTotalAmount();
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
      promoCode: isPromoApplied ? appliedPromoCode : null,
      promoDiscount: discount,
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
          markBillAsRequested();
          window.location.replace(response.data.session_url);
        } else {
          alert("Error processing payment.");
          setIsPlacingOrder(false);
        }
      } else if (paymentMethod === "cashPOS") {
        // Pentru plata cash, deschide WaiterModal pentru a notifica ospătarul
        setShowWaiterModal(true);
        markBillAsRequested();
        window.scrollTo(0, 0);
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
          <span>{t("my_orders.loading_orders")}</span>
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
        {/* <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> */}
          {/* <span>{t("my_orders.back")}</span> */}
        {/* </button> */}

        <h1 className="cart-title">{t("my_orders.orders")}</h1>
        {/* <div className="clear-cart-placeholder"></div> */}
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
            {t("my_orders.no_unpaid_orders")}
          </motion.h2>

          <motion.p
            className="empty-cart-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {t("my_orders.no_orders_description")}
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
            <span>{t("my_orders.browse_menu")}</span>
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
          {/* Notification for already requested bill */}
          {billRequested && (
            <motion.div
              className="bill-requested-notification"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="notification-content">
                <FaCheckCircle className="notification-icon" />
                <div className="notification-text">
                  <h3>{t("my_orders.bill_request_sent")}</h3>
                  <p>
                    {t("my_orders.waiter_notified", { time: getTimeSinceBillRequest() })}
                  </p>
                </div>
              </div>
              <button
                className="reset-request-button"
                onClick={resetBillRequest}
                title="Cancel bill request"
              >
                <FaClock />
                <span>{t("my_orders.cancel_request")}</span>
              </button>
            </motion.div>
          )}

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
                        {t("my_orders.order_from")} {formatDateTime(order.date)}
                      </h6>
                    </div>

                    {/* Order Items */}
                    {order.items.map((item, itemIndex) => {
                      const uniqueId = `${order._id}_${item._id}_${itemIndex}`;
                      
                      // ✅ FOLOSEȘTE DIRECT baseFoodId PENTRU A GĂSI PRODUSUL
                      const foodItem = food_list.find(food => food._id === item.baseFoodId);
                      
                      // ✅ CALCULEAZĂ PREȚUL
                      let priceInfo = null;
                      
                      if (foodItem) {
                        priceInfo = getItemPriceWithDiscount(foodItem, item);
                      }

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
                                    e.target.src = assets.image_coming_soon;
                                    e.target.style.objectFit = "cover";
                                  }}
                                />
                                {/* ✅ BADGE-UL DE DISCOUNT PE POZĂ - POZIȚIE CORECTĂ */}
                                {foodItem && priceInfo && priceInfo.hasDiscount && (
                                  <div className="discount-badge-image">
                                    -{priceInfo.discountPercentage}%
                                  </div>
                                )}
                              </button>
                              <div className="item-details">
                                <button
                                  className="item-name-button"
                                  onClick={() => openFoodModal(uniqueId)}
                                >
                                  <h3 className="item-name">
  {getTranslatedProductName(foodItem) || item.name}
  {isTranslatingProductNames && (
    <span className="translating-indicator"> 🔄</span>
  )}
</h3>
                                </button>
                                {item.specialInstructions && (
                                  <div className="item-special-instructions">
                                    <span className="instructions-label">
                                      {t("my_orders.note")}{" "}
                                    </span>
                                    {item.specialInstructions}
                                  </div>
                                )}

                                {/* ✅ AFIȘEAZĂ PREȚUL */}
                                {foodItem && priceInfo ? (
                                  priceInfo.hasDiscount ? (
                                    <div className="item-price-container">
                                      <div className="discount-price-wrapper">
                                        <span className="original-price">
                                          {(priceInfo.originalPrice * item.quantity).toFixed(2)} €
                                        </span>
                                        <span className="final-price">
                                          {priceInfo.totalPrice.toFixed(2)} €
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="item-price">
                                      {priceInfo.totalPrice.toFixed(2)} €
                                    </p>
                                  )
                                ) : (
                                  <p className="item-price">
                                    {(item.price * item.quantity).toFixed(2)} €
                                  </p>
                                )}
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
          </div>

          {/* Order Summary */}
          <div className="order-summary-section-cart">
            <h2 className="section-title">{t("my_orders.order_summary")}</h2>

            {/* ✅ SECȚIUNEA PENTRU PROMO CODE */}
            {!billRequested && (
              <div className="promo-code-section">
                <div className="promo-code-input-container">
                  <div className="promo-input-wrapper">
                    <FaTag className="promo-icon" />
                    <input
                      type="text"
                      className="promo-code-input"
                      placeholder={t("my_orders.enter_promo_code")}
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={isPromoApplied}
                    />
                    {!isPromoApplied ? (
                      <button
                        className="apply-promo-button"
                        onClick={applyPromoCode}
                      >
                        {t("my_orders.apply")}
                      </button>
                    ) : (
                      <button
                        className="remove-promo-button"
                        onClick={removePromoCode}
                      >
                        {t("my_orders.remove")}
                      </button>
                    )}
                  </div>
                  {promoError && (
                    <div className="promo-error-message">{promoError}</div>
                  )}
                  {isPromoApplied && (
                    <div className="promo-success-message">
                      <FaCheck className="success-icon" />
                      <span dangerouslySetInnerHTML={{
                        __html: t("my_orders.promo_success", { code: appliedPromoCode })
                      }} />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="summary-details">
              <div className="summary-row">
                <span>{t("my_orders.subtotal")}</span>
                {/* ✅ Folosim subtotal-ul ORIGINAL (fără discount) */}
                <span>{getOriginalSubtotal().toFixed(2)} €</span>
              </div>

              {/* ✅ SECȚIUNEA PENTRU DISCOUNT-UL TOTAL DIN PRODUSELE CU REDUCERE */}
              {getTotalProductDiscountAmount() > 0 && (
                <div className="summary-row discount-row">
                  <span className="discount-label">{t("my_orders.product_discounts")}</span>
                  <span className="discount-amount">
                    -{getTotalProductDiscountAmount().toFixed(2)} €
                  </span>
                </div>
              )}

              {/* ✅ SECȚIUNEA PENTRU REDUCEREA OBTINUTĂ DIN PROMO CODE */}
              {isPromoApplied && (
                <div className="summary-row promo-discount">
                  <span className="promo-label">{t("my_orders.promo_discount")}</span>
                  <span className="promo-discount-amount">
                    -{discount.toFixed(2)}€
                  </span>
                </div>
              )}

              {/* ✅ SECȚIUNEA PENTRU TOTALUL ECONOMISIT */}
              {(getTotalProductDiscountAmount() > 0 || isPromoApplied) && (
                <div className="summary-row saved-amount">
                  <span className="saved-label">{t("my_orders.total_saved")}</span>
                  <span className="saved-amount-value">
                    {(getTotalProductDiscountAmount() + discount).toFixed(2)} €
                  </span>
                </div>
              )}

              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>{t("my_orders.total")}</span>
                <span>{getFinalTotalAmount().toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Show tips section only if bill hasn't been requested yet */}
          {showTipsSection && !billRequested && (
            <motion.div
              className="cart-tips-section active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="cart-tips-title">
                <FaHandHoldingHeart className="cart-tips-icon" />
                {t("my_orders.add_tip")}
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
                        {t("my_orders.tip_percentage", { percentage })}
                      </span>
                      <span className="cart-tips-amount">
                        {percentage === 0
                          ? t("my_orders.no_tip")
                          : t("my_orders.tip_amount", { 
                              amount: (((getTotalOrderAmount() - discount) * percentage) / 100).toFixed(2)
                            })}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Custom Tip Section */}
              <div className="custom-tip-section">
                <label className="custom-tip-label">
                  {t("my_orders.custom_tip")}
                </label>
                <div className="custom-tip-input-wrapper">
                  <div className="custom-tip-input-container">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={customTipAmount}
                      onChange={handleCustomTipChange}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e" || e.key === "E") {
                          e.preventDefault();
                        }
                      }}
                      onFocus={() => {
                        setTipPercentage(0);
                        if (!customTipAmount) setCustomTipAmount("");
                      }}
                      onBlur={(e) => {
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
                        (parseFloat(customTipAmount) /
                          (getTotalOrderAmount() - discount)) *
                        100
                      ).toFixed(1)}% of order)`}
                  </div>
                </div>
              </div>

              <div className="cart-tips-summary">
                <div className="cart-tips-summary-row">
                  <span>{t("my_orders.subtotal_label")}</span>
                  <span>{(getTotalOrderAmount() - discount).toFixed(2)} €</span>
                </div>

                {calculateTipAmount() > 0 && (
                  <div className="cart-tips-summary-row">
                    <span>{t("my_orders.tip_label")}</span>
                    <span>+{calculateTipAmount().toFixed(2)} €</span>
                  </div>
                )}

                <div className="cart-tips-summary-row total-with-tip">
                  <span>{t("my_orders.total_with_tip")}</span>
                  <span>{getFinalTotalAmount().toFixed(2)} €</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment Method Section - Hide if bill already requested */}
          {!billRequested && (
            <div className="cart-payment-section" id="payment-method-section">
              <h2 className="cart-payment-title">{t("my_orders.select_payment_method")}</h2>

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
                        {t("my_orders.credit_debit_card")}
                      </span>
                      <span className="cart-payment-option-subtitle">
                        {t("my_orders.pay_online")}
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
                        {t("my_orders.cash_pos")}
                      </span>
                      <span className="cart-payment-option-subtitle">
                        {t("my_orders.pay_at_table")}
                      </span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="cart-payment-security">
                <div className="cart-payment-security-info">
                  <FaLock className="cart-lock-icon" />
                  <span>{t("my_orders.secure_payment")}</span>
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
                <div className="cart-payment-feature">{t("my_orders.ssl_encrypted")}</div>
                <div className="cart-payment-feature">{t("my_orders.pci_compliant")}</div>
                <div className="cart-payment-feature">{t("my_orders.secure_3d")}</div>
                <div className="cart-payment-feature">{t("my_orders.money_back")}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Checkout Button - Hide if bill already requested */}
      {showFloatingCheckout && !billRequested && (
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
                <div className="checkout-text">{t("my_orders.pay_order")}</div>
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
                <span>{t("my_orders.processing_order")}...</span>
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
              <h3>{t("my_orders.clear_all_orders")}</h3>
              <p>{t("my_orders.clear_confirmation")}</p>
              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowConfirmClear(false)}
                >
                  {t("my_orders.cancel")}
                </button>
                <button className="confirm-button" onClick={handleClearCart}>
                  {t("my_orders.clear_all")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <WaiterModalCart
        show={showWaiterModal}
        onClose={() => {
          setShowWaiterModal(false);
          setIsPlacingOrder(false);
        }}
        paymentDetails={{
          totalAmount: getFinalTotalAmount().toFixed(2),
          itemCount: getTotalOrderItemCount(),
          paymentMethod: "Cash/POS",
          orders: unpaidOrders.map((order) => order._id),
        }}
      />

      <FoodModal
        food={selectedFood}
        closeModal={closeFoodModal}
        isOpen={isFoodModalOpen}
        initialQuantity={selectedFoodQuantity}
        initialInstructions={selectedFoodInstructions}
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