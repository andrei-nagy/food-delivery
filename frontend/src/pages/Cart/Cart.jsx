import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FoodModal from "../../components/FoodItem/FoodModal";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

import {
  FaPlus,
  FaMinus,
  FaTrash,
  FaArrowLeft,
  FaCreditCard,
  FaMoneyBillWave,
  FaLock,
  FaShoppingBag,
  FaTag,
  FaCheckCircle,
  FaPercent,
  FaShoppingCart
} from "react-icons/fa";
import { assets } from "../../assets/assets";

// ── Desktop floating checkout button (mobile version lives in Navbar) ──
const ModernCheckoutButton = ({
  show,
  isDisabled,
  isProcessing,
  itemCount,
  totalAmount,
  onClick,
  t,
  formatPrice
}) => {
  const createRipple = (event) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top  = `${event.clientY - button.getBoundingClientRect().top  - radius}px`;
    circle.classList.add("mc-ripple");
    button.getElementsByClassName("mc-ripple")[0]?.remove();
    button.appendChild(circle);
  };

  if (!show || isDisabled) return null;

  return (
    <div className="modern-checkout-container">
      <button
        className={`modern-checkout-button ${isProcessing ? "mc-processing" : ""}`}
        onClick={(e) => { createRipple(e); if (!isProcessing) onClick(); }}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <div className="mc-processing-state">
            <div className="mc-spinner" />
            <span className="mc-processing-text">{t("cart.processing_order")}</span>
          </div>
        ) : (
          <div className="mc-content">
            <div className="mc-left">
              <div className="mc-icon"><FaShoppingCart /></div>
              <div className="mc-text">
                <span className="mc-title">{t("cart.place_order")}</span>
                <span className="mc-subtitle">{itemCount} {t("cart.items")}</span>
              </div>
            </div>
            <div className="mc-right">
              <div className="mc-total-amount">{formatPrice(totalAmount)}</div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

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
    clearCart,
    addToCart,
    canAddToCart,
    billRequested,
    userBlocked,
    restaurantData,
  } = useContext(StoreContext);

  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  // ── state ──────────────────────────────────────────────────────
  const [specialInstructions, setSpecialInstructions]   = useState("");
  const [paymentMethod, setPaymentMethod]               = useState("");
  const [paymentError, setPaymentError]                 = useState("");
  const [showConfirmClear, setShowConfirmClear]         = useState(false);
  const [data, setData]                                 = useState({ tableNo: "" });
  const [isPlacingOrder, setIsPlacingOrder]             = useState(false);
  const [orderPlaced, setOrderPlaced]                   = useState(false);
  const [itemToDelete, setItemToDelete]                 = useState(null);
  const [showFloatingCheckout, setShowFloatingCheckout] = useState(false);
  const [selectedFood, setSelectedFood]                 = useState(null);
  const [isFoodModalOpen, setIsFoodModalOpen]           = useState(false);
  const [selectedFoodQuantity, setSelectedFoodQuantity] = useState(1);
  const [selectedFoodInstructions, setSelectedFoodInstructions] = useState("");
  const [popularProducts, setPopularProducts]           = useState([]);
  const [displayedPopularProducts, setDisplayedPopularProducts] = useState([]);

  const [translatedProductNames, setTranslatedProductNames]   = useState({});
  const [isTranslatingProductNames, setIsTranslatingProductNames] = useState(false);
  const [translatedPopularProducts, setTranslatedPopularProducts] = useState({});
  const [isTranslatingPopular, setIsTranslatingPopular]       = useState(false);
  const [translatedDescriptions, setTranslatedDescriptions]   = useState({});
  const [isTranslatingDescriptions, setIsTranslatingDescriptions] = useState(false);

  const swipeData   = useRef({});
  const [swipeOffsets, setSwipeOffsets] = useState({});

  const tableNumber = localStorage.getItem("tableNumber") || null;
  const isCartEmpty = Object.keys(cartItems).length === 0;
  const isDisabled  = billRequested || userBlocked;

  const currency         = restaurantData?.currency         || "€";
  const currencyPosition = restaurantData?.currencyPosition || "after";

  // ── formatPrice ────────────────────────────────────────────────
  const formatPrice = useCallback((priceValue, showCurrency = true) => {
    if (!priceValue && priceValue !== 0) return "";
    const numericPrice  = typeof priceValue === "string" ? parseFloat(priceValue) : priceValue;
    const formattedPrice = numericPrice.toFixed(2);
    if (!showCurrency) return formattedPrice;
    const nbsp = "\u00A0";
    return currencyPosition === "before"
      ? `${currency}${nbsp}${formattedPrice}`
      : `${formattedPrice}${nbsp}${currency}`;
  }, [currency, currencyPosition]);

  // ── blocked message ────────────────────────────────────────────
  const getBlockedMessage = () => {
    if (userBlocked)    return { icon: "⏰", text: t("cart.session_expired"),  warningText: t("cart.session_expired_warning") };
    if (billRequested)  return { icon: "🔒", text: t("cart.bill_requested"),   warningText: t("cart.bill_requested_warning") };
    return null;
  };
  const blockedMessage = getBlockedMessage();

  // ── placeOrder ────────────────────────────────────────────────
  const placeOrder = useCallback(async (event) => {
    if (event) event.preventDefault();
    if (!canAddToCart()) return;
    if (orderPlaced || isPlacingOrder) return;

    setIsPlacingOrder(true);

    let orderItems = [];
    Object.keys(cartItems).forEach((itemId) => {
      const cartItem = cartItems[itemId];
      if (!cartItem || cartItem.quantity <= 0) return;
      const foodItem       = findFoodItem(itemId, cartItem);
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
          extrasPrice: cartItem.itemData?.extrasPrice || 0,
        });
      } else {
        orderItems.push({
          foodId: itemId,
          baseFoodId: itemId.split("_")[0],
          name: "Product",
          price: 0,
          quantity: cartItem.quantity,
          itemTotal: "0.00",
          image: "",
          specialInstructions: itemInstructions,
          selectedOptions: cartItem.selectedOptions || [],
          extrasPrice: cartItem.itemData?.extrasPrice || 0,
        });
      }
    });

    const totalAmount = getTotalCartAmount();
    const orderData = {
      userId: token,
      items: orderItems,
      amount: totalAmount,
      tableNo: tableNumber,
      userData: data,
      specialInstructions,
      paymentMethod: paymentMethod || "cashPOS",
    };

    try {
      const selectedPaymentMethod = paymentMethod || "cashPOS";
      if (selectedPaymentMethod === "creditCard") {
        const response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
        if (response.data.success) {
          window.location.replace(response.data.session_url);
        } else {
          alert("Error processing payment.");
          setIsPlacingOrder(false);
        }
      } else {
        const response = await axios.post(url + "/api/order/place-cash", orderData, { headers: { token } });
        if (response.data.success) {
          setOrderPlaced(true);
          setShowFloatingCheckout(false);
          window.dispatchEvent(new CustomEvent("order:placed", { detail: { shortId: String(response.data.orderId || "").slice(-6).toUpperCase() } }));
          setTimeout(() => navigate("/"), 400);
          localStorage.setItem("isReloadNeeded", "true");
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
  }, [
    cartItems, token, url, tableNumber, data,
    specialInstructions, paymentMethod,
    canAddToCart, orderPlaced, isPlacingOrder,
    getTotalCartAmount, navigate
  ]);

  // ── navbar:placeOrder event ────────────────────────────────────
  useEffect(() => {
    const handleNavbarOrder = () => {
      if (isPlacingOrder || orderPlaced || isDisabled || isCartEmpty) return;
      placeOrder();
    };
    window.addEventListener("navbar:placeOrder", handleNavbarOrder);
    return () => window.removeEventListener("navbar:placeOrder", handleNavbarOrder);
  }, [placeOrder, isPlacingOrder, orderPlaced, isDisabled, isCartEmpty]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("cart:processingState", { detail: { isPlacingOrder } }));
  }, [isPlacingOrder]);

  useEffect(() => {
    document.body.classList.add("cart-page");
    return () => document.body.classList.remove("cart-page");
  }, []);

  useEffect(() => {
    setData((d) => ({ ...d, tableNo: tableNumber }));
    setShowFloatingCheckout(!isCartEmpty && !isDisabled);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  }, []);

  useEffect(() => {
    setShowFloatingCheckout(!isCartEmpty && !isDisabled);
  }, [isCartEmpty, cartItems, isDisabled]);

  // ── translations ───────────────────────────────────────────────
  const translateProductNames = async () => {
    if (currentLanguage === "ro" || !food_list.length) { setTranslatedProductNames({}); return; }
    setIsTranslatingProductNames(true);
    try {
      const names = food_list.filter(f => f?.name?.trim()).map(f => f.name);
      const idMap = {};
      food_list.forEach((f, i) => { if (f?.name?.trim()) idMap[i] = f._id; });
      const resp = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLanguage}&dt=t&q=${encodeURIComponent(names.join(" ||| "))}`);
      if (resp.ok) {
        const d = await resp.json();
        const translated = (d[0]?.map(i => i[0]).join("") || "").split(" ||| ");
        const result = {};
        Object.keys(idMap).forEach(i => { if (translated[i] && idMap[i]) result[idMap[i]] = translated[i]; });
        setTranslatedProductNames(result);
      }
    } catch (e) { console.error(e); }
    finally { setIsTranslatingProductNames(false); }
  };

  useEffect(() => {
    if (food_list.length > 0 && !isDisabled) translateProductNames();
  }, [currentLanguage, food_list.length, isDisabled]);

  const getTranslatedProductName = (foodItem) => {
    if (!foodItem) return "";
    const t_ = translatedProductNames[foodItem._id];
    return currentLanguage !== "ro" && t_ ? t_ : foodItem.name || "";
  };

  const translateProductDescriptions = async () => {
    if (currentLanguage === "ro" || !food_list.length) { setTranslatedDescriptions({}); return; }
    setIsTranslatingDescriptions(true);
    try {
      const descs = food_list.filter(f => f?.description?.trim()).map(f => f.description);
      const idMap = {};
      food_list.forEach((f, i) => { if (f?.description?.trim()) idMap[i] = f._id; });
      const resp = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLanguage}&dt=t&q=${encodeURIComponent(descs.join(" ||| "))}`);
      if (resp.ok) {
        const d = await resp.json();
        const translated = (d[0]?.map(i => i[0]).join("") || "").split(" ||| ");
        const result = {};
        Object.keys(idMap).forEach(i => { if (translated[i] && idMap[i]) result[idMap[i]] = translated[i]; });
        setTranslatedDescriptions(result);
      }
    } catch (e) { console.error(e); }
    finally { setIsTranslatingDescriptions(false); }
  };

  useEffect(() => {
    if (food_list.length > 0 && !isDisabled) translateProductDescriptions();
  }, [currentLanguage, food_list.length, isDisabled]);

  const getTranslatedDescription = (foodItem) => {
    if (!foodItem) return "";
    const t_ = translatedDescriptions[foodItem._id];
    return currentLanguage !== "ro" && t_ ? t_ : foodItem.description || "";
  };

  const translatePopularProductNames = async () => {
    if (currentLanguage === "ro" || !displayedPopularProducts.length) { setTranslatedPopularProducts({}); return; }
    setIsTranslatingPopular(true);
    try {
      const names = displayedPopularProducts.filter(p => p?.name?.trim()).map(p => p.name);
      const idMap = {};
      displayedPopularProducts.forEach((p, i) => { if (p?.name?.trim()) idMap[i] = p.id || p.name; });
      const resp = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLanguage}&dt=t&q=${encodeURIComponent(names.join(" ||| "))}`);
      if (resp.ok) {
        const d = await resp.json();
        const translated = (d[0]?.map(i => i[0]).join("") || "").split(" ||| ");
        const result = {};
        Object.keys(idMap).forEach(i => { if (translated[i] && idMap[i]) result[idMap[i]] = translated[i]; });
        setTranslatedPopularProducts(result);
      }
    } catch (e) { console.error(e); }
    finally { setIsTranslatingPopular(false); }
  };

  useEffect(() => {
    if (displayedPopularProducts.length > 0 && !isDisabled) translatePopularProductNames();
  }, [currentLanguage, displayedPopularProducts.length, isDisabled]);

  const getTranslatedPopularProductName = (product) => {
    const id = product.id || product.name;
    const t_ = translatedPopularProducts[id];
    return currentLanguage !== "ro" && t_ ? t_ : product.name;
  };

  // ── popular products ───────────────────────────────────────────
  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const response = await axios.get(`${url}/api/order/list`);
        if (response.data.success) {
          const orders = response.data.data.filter(o => o.status === "Delivered");
          const countMap = {}, detailMap = {};
          orders.forEach(order => {
            (order.items || []).forEach(item => {
              if (item && typeof item === "object" && item.name && (item.baseFoodId || item.foodId)) {
                countMap[item.name] = (countMap[item.name] || 0) + 1;
                if (!detailMap[item.name]) {
                  detailMap[item.name] = { id: item.baseFoodId || item.foodId, name: item.name, price: item.price || 0, image: item.image || "", count: 0 };
                }
              }
            });
          });
          const popular = Object.entries(countMap)
            .map(([name, count]) => detailMap[name] ? { ...detailMap[name], count } : null)
            .filter(Boolean).sort((a, b) => b.count - a.count).slice(0, 20);
          setPopularProducts(popular);
        }
      } catch (e) { console.error(e); }
    };
    if (!isCartEmpty && !isDisabled) fetchPopularProducts();
  }, [url, isCartEmpty, isDisabled]);

  useEffect(() => {
    if (popularProducts.length > 0 && !isDisabled) {
      const shuffled = [...popularProducts].sort(() => 0.5 - Math.random());
      setDisplayedPopularProducts(shuffled.slice(0, 6));
    }
  }, [popularProducts, isDisabled]);

  // ── food item helpers ──────────────────────────────────────────
  const findFoodItem = (itemId, cartItem) => {
    const baseFoodId = itemId ? itemId.split("__")[0] : "";
    const found = food_list.find(item => item._id === baseFoodId);
    if (!found && baseFoodId) return food_list.find(item => item._id.includes(baseFoodId) || baseFoodId.includes(item._id)) || null;
    return found || null;
  };

  const getItemPriceWithDiscount = (foodItem, cartItem) => {
    if (!foodItem) return { unitPrice: 0, totalPrice: 0, hasDiscount: false, discountPercentage: 0, originalPrice: 0 };
    const rawPrice          = parseFloat(foodItem.price) || 0;
    const discountPercentage = parseFloat(foodItem.discountPercentage) || 0;
    const discountedPrice   = discountPercentage > 0 ? rawPrice * (1 - discountPercentage / 100) : rawPrice;
    const extrasPrice       = cartItem?.itemData?.extrasPrice || 0;
    return {
      unitPrice: discountedPrice + extrasPrice,
      totalPrice: (discountedPrice + extrasPrice) * (cartItem?.quantity || 1),
      hasDiscount: discountPercentage > 0,
      discountPercentage,
      originalPrice: rawPrice + extrasPrice,
    };
  };

  const getOriginalSubtotal = () => {
    return Object.keys(cartItems).reduce((sum, itemId) => {
      const cartItem = cartItems[itemId];
      if (!cartItem || cartItem.quantity <= 0) return sum;
      const foodItem = findFoodItem(itemId, cartItem);
      if (!foodItem) return sum;
      return sum + getItemPriceWithDiscount(foodItem, cartItem).originalPrice * cartItem.quantity;
    }, 0);
  };

  const getTotalDiscountAmount = () => {
    return Object.keys(cartItems).reduce((sum, itemId) => {
      const cartItem = cartItems[itemId];
      if (!cartItem || cartItem.quantity <= 0) return sum;
      const foodItem = findFoodItem(itemId, cartItem);
      if (!foodItem) return sum;
      const info = getItemPriceWithDiscount(foodItem, cartItem);
      if (!info.hasDiscount) return sum;
      return sum + (info.originalPrice * cartItem.quantity - info.totalPrice);
    }, 0);
  };

  const getItemInstructions = (itemId) => cartItems[itemId]?.specialInstructions || "";

  // ── food modal ─────────────────────────────────────────────────
  const openFoodModal = (itemId, cartItem) => {
    if (!canAddToCart()) return;
    const foodItem = findFoodItem(itemId, cartItem);
    if (foodItem) {
      setSelectedFood(foodItem);
      setSelectedFoodQuantity(cartItem.quantity);
      setSelectedFoodInstructions(cartItem.specialInstructions || "");
      setIsFoodModalOpen(true);
    }
  };

  const closeFoodModal = () => {
    setIsFoodModalOpen(false);
    setSelectedFood(null);
    setSelectedFoodQuantity(1);
    setSelectedFoodInstructions("");
  };

  // ── popular product add ────────────────────────────────────────
  const handleAddPopularProduct = (product) => {
    if (!canAddToCart()) return;
    if (!product || typeof product !== "object") { toast.error("Error adding product to cart"); return; }
    const productId   = product.id || product._id;
    const productName = product.name || "Unknown Product";
    if (!productId) { toast.error("Product information incomplete"); return; }
    const completeFoodItem = food_list.find(item => item._id === productId || item.name === productName);
    const fallback = { _id: productId, name: productName, price: Number(product.price) || 0, image: product.image || "", description: product.description || "Popular item", category: product.category || "Popular" };
    setSelectedFood(completeFoodItem && typeof completeFoodItem === "object" ? completeFoodItem : fallback);
    setSelectedFoodQuantity(1);
    setSelectedFoodInstructions("");
    setIsFoodModalOpen(true);
  };

  const getPopularProductQuantity = (product) => {
    if (!product || typeof product !== "object") return 0;
    const productId   = product.id || product._id;
    const productName = product.name;
    for (const [itemId, itemData] of Object.entries(cartItems)) {
      const baseFoodId = itemId.split("__")[0];
      if (productId && baseFoodId === productId) return itemData.quantity;
      if (productName) {
        const fi = findFoodItem(itemId, itemData);
        if (fi && fi.name === productName) return itemData.quantity;
      }
    }
    return 0;
  };

  // ── swipe to delete ────────────────────────────────────────────
  const handleTouchStart = (e, id) => {
    if (isDisabled) return;
    swipeData.current[id] = { startX: e.touches[0].clientX, currentX: e.touches[0].clientX, isSwiping: false };
  };

  const handleTouchMove = (e, id) => {
    if (isDisabled) return;
    const current = swipeData.current[id];
    if (!current) return;
    current.currentX = e.touches[0].clientX;
    const diff = current.currentX - current.startX;
    if (diff < 0) {
      setSwipeOffsets(prev => ({ ...prev, [id]: Math.max(diff, -window.innerWidth * 0.2) }));
    } else {
      setSwipeOffsets(prev => ({ ...prev, [id]: Math.max(0, swipeOffsets[id] || 0) }));
    }
    current.isSwiping = true;
  };

  const handleTouchEnd = (id) => {
    if (isDisabled) return;
    const current = swipeData.current[id];
    if (!current) return;
    const diff      = current.currentX - current.startX;
    const threshold = window.innerWidth * 0.1;
    const maxSwipe  = -window.innerWidth * 0.2;
    if (diff < -threshold) {
      setSwipeOffsets(prev => ({ ...prev, [id]: maxSwipe }));
    } else if (diff > threshold) {
      setSwipeOffsets(prev => ({ ...prev, [id]: 0 }));
    } else {
      const cur = swipeOffsets[id] || 0;
      setSwipeOffsets(prev => ({ ...prev, [id]: cur < -threshold ? maxSwipe : 0 }));
    }
    delete swipeData.current[id];
  };

  const handleDeleteClick = (id) => {
    if (isDisabled) {
      toast.error(billRequested ? t("cart.cannot_modify_cart_bill") : t("cart.cannot_modify_cart_session"));
      return;
    }
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      removeItemCompletely(itemToDelete);
      setSwipeOffsets(prev => ({ ...prev, [itemToDelete]: 0 }));
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setSwipeOffsets(prev => ({ ...prev, [itemToDelete]: 0 }));
    setItemToDelete(null);
  };

  const resetSwipe = (id) => setSwipeOffsets(prev => ({ ...prev, [id]: 0 }));

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="cart-container"
    >
      {/* ── Header ── */}
      <div className="cart-header-section">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h1 className="cart-title">{t("cart.your_order")}</h1>
        {!isCartEmpty && !isDisabled ? (
          <button className="clear-cart-button" onClick={() => setShowConfirmClear(true)} aria-label="Clear cart">
            <FaTrash />
          </button>
        ) : (
          <div className="clear-cart-placeholder" />
        )}
      </div>

      {/* ── Bill / session warning ── */}
      {isDisabled && blockedMessage && (
        <motion.div
          className="cart-bill-warning"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="cart-bill-warning-content">
            <span className="cart-bill-warning-icon">{blockedMessage.icon}</span>
            <div className="cart-bill-warning-text">
              <strong>{blockedMessage.text}</strong>
              <span>{blockedMessage.warningText}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Empty cart ── */}
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
              alt="Empty cart"
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            />
            <motion.div className="empty-cart-decoration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <div className="decoration-circle circle-1" />
              <div className="decoration-circle circle-2" />
              <div className="decoration-circle circle-3" />
            </motion.div>
          </div>
          <motion.h2 className="empty-cart-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
            {t("cart.empty_cart_title")}
          </motion.h2>
          <motion.p className="empty-cart-description" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
            {t("cart.empty_cart_description")}
          </motion.p>
          <motion.button
            className="browse-menu-button"
            onClick={() => navigate("/category/All")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <span>{t("cart.browse_menu")}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </motion.div>
      ) : (
        <div className="cart-content">

          {/* ── Cart items ── */}
          <div className="cart-items-section">
            <AnimatePresence>
              {Object.keys(cartItems).map((itemId, index) => {
                const cartItem = cartItems[itemId];
                if (!cartItem || cartItem.quantity <= 0) return null;

                const foodItem         = findFoodItem(itemId, cartItem);
                const itemInstructions = getItemInstructions(itemId);

                // ── Loading skeleton item ──
                if (!foodItem) {
                  return (
                    <motion.div
                      key={itemId}
                      className="cart-item-wrapper"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                      layout
                    >
                      <div className="cart-item cart-item--loading">
                        <div className="cart-item__thumb cart-item__thumb--placeholder">
                          <FaCreditCard />
                        </div>
                        <div className="cart-item__body">
                          <p className="cart-item__name">{t("cart.product_loading")}</p>
                          <p className="cart-item__desc">{t("cart.loading_description")}</p>
                        </div>
                        <div className={`cart-item__qty-controls ${isDisabled ? "qty-controls--disabled" : ""}`}>
                          <button className="qty-btn qty-btn--minus" onClick={() => removeFromCart(itemId, 1)} disabled={isDisabled}><FaMinus /></button>
                          <span className="qty-value">{cartItem.quantity}</span>
                          <button className="qty-btn qty-btn--plus" onClick={() => updateCartItemQuantity(itemId, cartItem.quantity + 1, itemInstructions)} disabled={isDisabled}><FaPlus /></button>
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                const priceInfo = getItemPriceWithDiscount(foodItem, cartItem);

                return (
                  <motion.div
                    key={itemId}
                    className="cart-item-wrapper"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                    layout
                  >
                    {/* Swipe-to-delete red background */}
                    {!isDisabled && (
                      <div className="cart-item__swipe-bg" onClick={() => handleDeleteClick(itemId)}>
                        <FaTrash />
                        <span>{t("cart.remove")}</span>
                      </div>
                    )}

                    <div
                      className={`cart-item ${isDisabled ? "cart-item--disabled" : ""}`}
                      onTouchStart={(e) => handleTouchStart(e, itemId)}
                      onTouchMove={(e) => handleTouchMove(e, itemId)}
                      onTouchEnd={() => handleTouchEnd(itemId)}
                      onClick={() => resetSwipe(itemId)}
                      style={{ transform: `translateX(${swipeOffsets[itemId] || 0}px)`, transition: "transform 0.3s ease" }}
                    >
                      {/* ── Thumbnail ── */}
                      <button
                        className="cart-item__thumb-btn"
                        onClick={() => openFoodModal(itemId, cartItem)}
                        disabled={isDisabled}
                        aria-label={`Edit ${foodItem.name}`}
                      >
                        <img
                          src={url + "/images/" + foodItem.image}
                          alt={foodItem.name}
                          className="cart-item__thumb"
                          onError={(e) => { e.target.src = assets.image_coming_soon; e.target.style.objectFit = "cover"; }}
                        />
                        {priceInfo.hasDiscount && (
                          <span className="cart-item__thumb-badge">-{priceInfo.discountPercentage}%</span>
                        )}
                      </button>

                      {/* ── Content ── */}
                      <div className="cart-item__body">
                        {/* Name */}
                        <button
                          className="cart-item__name-btn"
                          onClick={() => openFoodModal(itemId, cartItem)}
                          disabled={isDisabled}
                        >
                          <span className={`cart-item__name ${isDisabled ? "cart-item__name--muted" : ""}`}>
                            {getTranslatedProductName(foodItem)}
                            {isTranslatingProductNames && <span className="translating-dot" />}
                          </span>
                        </button>

                        {/* Description — only if no note/extras to save space */}
                        {!itemInstructions && !(cartItem.selectedOptions?.length > 0) && (
                          <button
                            className="cart-item__desc-btn"
                            onClick={() => openFoodModal(itemId, cartItem)}
                            disabled={isDisabled}
                          >
                            <span className="cart-item__desc">
                              {getTranslatedDescription(foodItem)}
                              {isTranslatingDescriptions && <span className="translating-dot" />}
                            </span>
                          </button>
                        )}

                        {/* Extras chips */}
                        {cartItem.selectedOptions?.length > 0 && (
                          <div className="cart-item__chips">
                            {cartItem.selectedOptions.map((opt, i) => (
                              <span key={i} className="cart-item__chip cart-item__chip--extra">{opt}</span>
                            ))}
                            <span className="cart-item__chip cart-item__chip--price">
                              +{formatPrice(cartItem.itemData?.extrasPrice || 0)}
                            </span>
                          </div>
                        )}

                        {/* Special instructions */}
                        {itemInstructions && (
                          <div className="cart-item__note">
                            <span className="cart-item__note-label">{t("cart.note")}</span>
                            {itemInstructions}
                          </div>
                        )}

                        {/* Price row */}
                        <div className="cart-item__footer">
                          {priceInfo.hasDiscount ? (
                            <div className="cart-item__price-group">
                              <span className="cart-item__price-original">{formatPrice(priceInfo.originalPrice * cartItem.quantity)}</span>
                              <span className="cart-item__price-final">{formatPrice(priceInfo.totalPrice)}</span>
                            </div>
                          ) : (
                            <span className="cart-item__price-final">{formatPrice(priceInfo.totalPrice)}</span>
                          )}

                          {/* Quantity stepper */}
                          <div className={`cart-item__qty-controls ${isDisabled ? "qty-controls--disabled" : ""}`}>
                            <button
                              className="qty-btn qty-btn--minus"
                              onClick={() => removeFromCart(itemId, 1)}
                              disabled={isDisabled}
                              aria-label="Decrease quantity"
                            >
                              <FaMinus />
                            </button>
                            <span className="qty-value">{cartItem.quantity}</span>
                            <button
                              className="qty-btn qty-btn--plus"
                              onClick={() => updateCartItemQuantity(itemId, cartItem.quantity + 1, itemInstructions)}
                              disabled={isDisabled}
                              aria-label="Increase quantity"
                            >
                              <FaPlus />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* ── Desktop delete button ── */}
                      {!isDisabled && (
                        <button
                          className="cart-item__delete-btn"
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(itemId); }}
                          aria-label="Remove item"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {!isDisabled && (
              <div className="cart-add-more">
                <button className="cart-add-more__btn" onClick={() => navigate("/category/All")}>
                  <FaPlus />
                  <span>{t("cart.add_more_items")}</span>
                </button>
              </div>
            )}
          </div>

          {/* ── Popular products ── */}
          {!isCartEmpty && displayedPopularProducts.length > 0 && !isDisabled && (
            <motion.div className="popular-products-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="section-title">{t("cart.other_products")}</h2>
              <p className="section-subtitle">{t("cart.popular_choices")}</p>
              <div className="popular-products-grid">
                {displayedPopularProducts.map((product, index) => {
                  if (!product || typeof product !== "object") return null;
                  const qtyInCart = getPopularProductQuantity(product);
                  const completeFoodItem = food_list.find(item => item._id === (product.id || product._id) || item.name === product.name);
                  const rawPrice = parseFloat(completeFoodItem?.price || product.price) || 0;
                  const discountPct = parseFloat(completeFoodItem?.discountPercentage) || 0;
                  const priceInfo = {
                    hasDiscount: discountPct > 0,
                    originalPrice: rawPrice,
                    discountedPrice: discountPct > 0 ? rawPrice * (1 - discountPct / 100) : rawPrice,
                    discountPercentage: discountPct,
                  };
                  return (
                    <motion.div
                      key={product.id || product.name || `pop-${index}`}
                      className="popular-product-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="popular-product-image" onClick={() => handleAddPopularProduct(product)}>
                        <img
                          src={product.image ? `${url}/images/${product.image}` : assets.image_coming_soon}
                          alt={product.name || "Popular product"}
                          onError={(e) => { e.target.src = assets.image_coming_soon; e.target.style.objectFit = "contain"; e.target.style.padding = "10px"; }}
                        />
                        {qtyInCart > 0 ? (
                          <div className="popular-product-quantity-badge emerald">
                            <span className="quantity-number">{qtyInCart}</span>
                          </div>
                        ) : (
                          <button className="add-popular-product-btn" onClick={(e) => { e.stopPropagation(); handleAddPopularProduct(product); }} aria-label={`Add ${product.name}`}>
                            <FaPlus />
                          </button>
                        )}
                        {priceInfo.hasDiscount && <div className="popular-product-discount-badge">-{priceInfo.discountPercentage}%</div>}
                      </div>
                      <div className="popular-product-info">
                        <h4 className="popular-product-name" onClick={() => handleAddPopularProduct(product)}>
                          {getTranslatedPopularProductName(product)}
                          {isTranslatingPopular && <span className="translating-dot" />}
                        </h4>
                        <div className="popular-product-price-container">
                          {priceInfo.hasDiscount ? (
                            <div className="popular-product-price-with-discount">
                              <span className="popular-product-original-price">{formatPrice(priceInfo.originalPrice)}</span>
                              <span className="popular-product-price discounted">{formatPrice(priceInfo.discountedPrice)}</span>
                            </div>
                          ) : (
                            <span className="popular-product-price">{formatPrice(priceInfo.originalPrice)}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Special instructions ── */}
          {!isDisabled && (
            <div className="special-instructions-section">
              <h2 className="section-title">{t("cart.special_instructions")}</h2>
              <div className="instructions-input-container">
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder={t("cart.special_instructions_placeholder")}
                  rows={3}
                  className="instructions-textarea"
                />
              </div>
            </div>
          )}

          {/* ── Order summary ── */}
          <div className="order-summary-section">
            <h2 className="section-title">{t("cart.order_summary")}</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>{t("cart.subtotal")}</span>
                <span>{formatPrice(getOriginalSubtotal())}</span>
              </div>
              {getTotalDiscountAmount() > 0 && (
                <div className="summary-row discount-row">
                  <span className="discount-label">{t("cart.discount")}</span>
                  <span className="discount-amount">-{formatPrice(getTotalDiscountAmount())}</span>
                </div>
              )}
              <div className="summary-divider" />
              <div className="summary-row total">
                <span>{t("cart.total")}</span>
                <span>{formatPrice(getOriginalSubtotal() - getTotalDiscountAmount())}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── Desktop floating checkout ── */}
      <ModernCheckoutButton
        show={showFloatingCheckout && !isDisabled}
        isDisabled={isDisabled}
        isProcessing={isPlacingOrder || orderPlaced}
        itemCount={getTotalItemCount()}
        totalAmount={getTotalCartAmount()}
        onClick={placeOrder}
        t={t}
        formatPrice={formatPrice}
      />

      {/* ── Confirm delete modal ── */}
      <AnimatePresence>
        {itemToDelete && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={cancelDelete}>
            <motion.div className="confirmation-modal" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()}>
              <h3>{t("cart.remove_item")}</h3>
              <p>{t("cart.remove_confirmation")}</p>
              <div className="modal-actions">
                <button className="cancel-button" onClick={cancelDelete}>{t("cart.cancel")}</button>
                <button className="confirm-button" onClick={confirmDelete}>{t("cart.remove")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirm clear cart modal ── */}
      <AnimatePresence>
        {showConfirmClear && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="confirmation-modal" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.2 }}>
              <h3>{t("cart.clear_cart")}</h3>
              <p>{t("cart.clear_cart_confirmation")}</p>
              <div className="modal-actions">
                <button className="cancel-button" onClick={() => setShowConfirmClear(false)}>{t("cart.cancel")}</button>
                <button className="confirm-button" onClick={async () => { await clearCart(); setShowConfirmClear(false); }}>{t("cart.clear_all")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Food modal ── */}
      <FoodModal
        food={selectedFood}
        closeModal={closeFoodModal}
        isOpen={isFoodModalOpen}
        initialQuantity={selectedFoodQuantity}
        initialInstructions={selectedFoodInstructions}
        cartItemId={Object.keys(cartItems).find((id) => {
          const item = cartItems[id];
          const fi   = findFoodItem(id, item);
          return fi && fi._id === selectedFood?._id;
        })}
      />
    </motion.div>
  );
};

export default Cart;