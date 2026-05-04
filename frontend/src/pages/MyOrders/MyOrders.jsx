import React, { useContext, useState, useEffect } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FoodModal from "../../components/FoodItem/FoodModal";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useLanguage } from "../../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { assets } from "../../assets/assets";
import WaiterModalCart from "../../components/Navbar/WaiterModal";

import OrderList from "../../components/MyOrders/OrderList";
import OrderSummary from "../../components/MyOrders/OrderSummary";
import TipsSection from "../../components/MyOrders/TipsSection";
import PaymentSection from "../../components/MyOrders/PaymentSection";
import EmptyOrdersState from "../../components/MyOrders/EmptyOrdersState";
import BillRequestedNotification from "../../components/MyOrders/BillRequestedNotification";
import SplitBillModal from "../../components/MyOrders/SplitBillModal";
import PaidOrdersSection from "../../components/MyOrders/PaidOrdersSection";
import PaidItemsSection from "../../components/MyOrders/PaidItemsSection";
import { FaArrowLeft, FaTag, FaCheckCircle, FaPercent } from "react-icons/fa";

// ─── Modern Floating Buttons ─────────────────────────────────────────────────
const ModernFloatingButtons = ({
  show, billRequested, isProcessing, itemCount, totalAmount,
  onPay, onSplitBill, paymentMethod, t
}) => {
  const createRipple = (event) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top  = `${event.clientY - button.getBoundingClientRect().top  - radius}px`;
    circle.classList.add("mripple");
    const ripple = button.getElementsByClassName("mripple")[0];
    if (ripple) ripple.remove();
    button.appendChild(circle);
  };

  if (!show || billRequested) return null;

  return (
    <div className="mfloating-buttons">
      {/* Split Bill */}
      <button
        className={`mfloating-button msplit-bill-btn ${isProcessing ? 'mprocessing' : ''}`}
        onClick={(e) => { createRipple(e); onSplitBill(); }}
        disabled={isProcessing || paymentMethod === 'cashPOS'}
        title={paymentMethod === 'cashPOS' ? t("my_orders.split_bill_cash_only", "Split bill is only available for card payment") : ""}
      >
        {isProcessing ? (
          <div className="mprocessing-state">
            <div className="mspinner" />
            <span className="mprocessing-text">{t("my_orders.processing", "Processing...")}</span>
          </div>
        ) : (
          <div className="mbtn-content">
            <div className="mbtn-left">
              <div className="mbtn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10M18 20V4M6 20V16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="mbtn-text">
                <span className="mbtn-title">{t("my_orders.split_bill", "Split Bill")}</span>
                <span className="mbtn-subtitle">{t("my_orders.pay_partial", "Pay only your part")}</span>
              </div>
            </div>
          </div>
        )}
        {paymentMethod === 'creditCard' && !isProcessing && <div className="mpayment-indicator" />}
      </button>

      {/* Pay Order */}
      <button
        className={`mfloating-button mpay-btn ${isProcessing ? 'mprocessing' : ''}`}
        onClick={(e) => { createRipple(e); onPay(); }}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <div className="mprocessing-state">
            <div className="mspinner" />
            <span className="mprocessing-text">{t("my_orders.placing_order", "Placing order...")}</span>
          </div>
        ) : (
          <div className="mbtn-content">
            <div className="mbtn-left">
              <div className="mbtn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 9V5H4V19H20V14.5M9 11H15M12 8V14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="mbtn-text">
                <span className="mbtn-title">{t("my_orders.pay_order", "Pay Order")}</span>
                <span className="mbtn-subtitle">
                  {paymentMethod === 'creditCard'
                    ? t("my_orders.pay_now", "Pay now")
                    : t("my_orders.request_bill", "Request bill")}
                </span>
              </div>
            </div>
            <div className="mbtn-right">
              <div className="mamount">€{totalAmount.toFixed(2)}</div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MyOrders = () => {
  const {
    token, food_list, url,
    billRequested, markBillAsRequested, resetBillRequest, getTimeSinceBillRequest,
  } = useContext(StoreContext);

  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────
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
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showFloatingCheckout, setShowFloatingCheckout] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [selectedFoodQuantity, setSelectedFoodQuantity] = useState(1);
  const [selectedFoodInstructions, setSelectedFoodInstructions] = useState("");

  const [translatedProductNames, setTranslatedProductNames] = useState({});
  const [translatedDescriptions, setTranslatedDescriptions] = useState({});
  const [isTranslatingProductNames, setIsTranslatingProductNames] = useState(false);
  const [isTranslatingDescriptions, setIsTranslatingDescriptions] = useState(false);

  const [allOrders, setAllOrders] = useState([]);
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [paidOrders, setPaidOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [tipPercentage, setTipPercentage] = useState(0);
  const [customTipAmount, setCustomTipAmount] = useState("");
  const [showTipsSection, setShowTipsSection] = useState(false);

  const [showWaiterModal, setShowWaiterModal] = useState(false);
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const [isProcessingSplitBill, setIsProcessingSplitBill] = useState(false);

  const tableNumber = localStorage.getItem("tableNumber") || null;

  // ── Helpers ────────────────────────────────────────────────
  const isItemFullyPaid = (item) => {
    if (item.status === 'fully_paid') return true;
    if (item.paidBy?.length > 0) {
      const totalPaid = item.paidBy.reduce((sum, p) => sum + (p.amount || 0), 0);
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      return Math.abs(totalPaid - itemTotal) < 0.01 || totalPaid >= itemTotal;
    }
    return false;
  };

  const getFlatUnpaidItems = () =>
    unpaidOrders.flatMap(order =>
      order.items.filter(item => !isItemFullyPaid(item)).map(item => ({
        ...item,
        uniqueId: `${order._id}_${item._id}_${Date.now()}`,
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderDate: order.date,
      }))
    );

  const orderItems = getFlatUnpaidItems();
  const isCartEmpty = orderItems.length === 0;

  const separatePaidAndUnpaidOrders = (orders) => {
    const unpaid = [], paid = [];
    orders.forEach(order => {
      if (order.items?.some(item => !isItemFullyPaid(item))) unpaid.push(order);
      else paid.push(order);
    });
    return { unpaidOrders: unpaid, paidOrders: paid };
  };

  // ── Effects ────────────────────────────────────────────────
  useEffect(() => {
    document.body.classList.add("cart-page");
    return () => document.body.classList.remove("cart-page");
  }, []);

  useEffect(() => {
    if (food_list.length > 0) {
      translateProductNames();
      translateProductDescriptions();
    }
  }, [currentLanguage, food_list.length]);

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(url + "/api/order/userOrders", {}, { headers: { token } });
        const ordersData = response.data?.data || response.data || [];
        setAllOrders(ordersData);
        const { unpaidOrders: unpaid, paidOrders: paid } = separatePaidAndUnpaidOrders(ordersData);
        setUnpaidOrders(unpaid);
        setPaidOrders(paid);
        setData(d => ({ ...d, tableNo: tableNumber }));
      } catch (error) {
        console.error("Error fetching orders", error);
        setAllOrders([]); setUnpaidOrders([]); setPaidOrders([]);
        toast.error(t("my_orders.promo_error", "Failed to load orders"));
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchAllOrders();
    else { setIsLoading(false); setAllOrders([]); setUnpaidOrders([]); setPaidOrders([]); }
  }, [url, token, tableNumber, t]);

  useEffect(() => {
    setShowFloatingCheckout(!isCartEmpty && !billRequested);
  }, [isCartEmpty, orderItems, billRequested]);

  // ── Translations ───────────────────────────────────────────
  const translateProductNames = async () => {
    if (currentLanguage === "ro" || !food_list.length) { setTranslatedProductNames({}); setIsTranslatingProductNames(false); return; }
    setIsTranslatingProductNames(true);
    try {
      const names = [], idMap = {};
      food_list.forEach((food, i) => { if (food?.name?.trim()) { names.push(food.name); idMap[i] = food._id; } });
      if (names.length) {
        const combined = names.join(" ||| ");
        const resp = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLanguage}&dt=t&q=${encodeURIComponent(combined)}`);
        if (resp.ok) {
          const data = await resp.json();
          const translated = (data[0]?.map(i => i[0]).join("") || combined).split(" ||| ");
          const result = {};
          Object.keys(idMap).forEach(i => { if (translated[i] && idMap[i]) result[idMap[i]] = translated[i]; });
          setTranslatedProductNames(result);
        }
      }
    } catch (e) { console.error("Error translating names:", e); }
    finally { setIsTranslatingProductNames(false); }
  };

  const translateProductDescriptions = async () => {
    if (currentLanguage === "ro" || !food_list.length) { setTranslatedDescriptions({}); setIsTranslatingDescriptions(false); return; }
    setIsTranslatingDescriptions(true);
    try {
      const descs = [], idMap = {};
      food_list.forEach((food, i) => { if (food?.description?.trim()) { descs.push(food.description); idMap[i] = food._id; } });
      if (descs.length) {
        const combined = descs.join(" ||| ");
        const resp = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLanguage}&dt=t&q=${encodeURIComponent(combined)}`);
        if (resp.ok) {
          const data = await resp.json();
          const translated = (data[0]?.map(i => i[0]).join("") || combined).split(" ||| ");
          const result = {};
          Object.keys(idMap).forEach(i => { if (translated[i] && idMap[i]) result[idMap[i]] = translated[i]; });
          setTranslatedDescriptions(result);
        }
      }
    } catch (e) { console.error("Error translating descriptions:", e); }
    finally { setIsTranslatingDescriptions(false); }
  };

  const getTranslatedProductName = (foodItem) => {
    if (!foodItem) return "";
    return currentLanguage !== "ro" && translatedProductNames[foodItem._id] ? translatedProductNames[foodItem._id] : foodItem.name || "";
  };

  const getTranslatedDescription = (foodItem) => {
    if (!foodItem) return "";
    return currentLanguage !== "ro" && translatedDescriptions[foodItem._id] ? translatedDescriptions[foodItem._id] : foodItem.description || "";
  };

  // ── Food Item Helpers ──────────────────────────────────────
  const findFoodItem = (itemId) => {
    const item = orderItems.find(i => i.uniqueId === itemId);
    if (item) {
      return food_list.find(food =>
        food._id === item.foodId || food._id === item._id ||
        food._id === item.baseFoodId || (food.name && item.name && food.name === item.name)
      ) || item;
    }
    return null;
  };

  const getItemPriceWithDiscount = (foodItem, cartItem) => {
    if (!foodItem) return { unitPrice: 0, totalPrice: 0, hasDiscount: false, discountPercentage: 0, originalPrice: 0 };
    const rawPrice = parseFloat(foodItem.price) || 0;
    const discountPct = parseFloat(foodItem.discountPercentage) || 0;
    const discountedPrice = discountPct > 0 ? rawPrice * (1 - discountPct / 100) : rawPrice;
    const extrasPrice = cartItem?.extrasPrice || 0;
    return {
      unitPrice: discountedPrice + extrasPrice,
      totalPrice: (discountedPrice + extrasPrice) * (cartItem?.quantity || 1),
      hasDiscount: discountPct > 0,
      discountPercentage: discountPct,
      originalPrice: rawPrice + extrasPrice,
    };
  };

  // ── Calculations ───────────────────────────────────────────
  const getTotalOrderAmount = () =>
    orderItems.reduce((total, item) => {
      const foodItem = findFoodItem(item.uniqueId);
      if (foodItem) return total + getItemPriceWithDiscount(foodItem, item).totalPrice;
      return total + item.price * item.quantity;
    }, 0);

  const getOriginalSubtotal = () =>
    orderItems.reduce((total, item) => {
      const foodItem = findFoodItem(item.uniqueId);
      if (foodItem) return total + getItemPriceWithDiscount(foodItem, item).originalPrice * item.quantity;
      return total + item.price * item.quantity;
    }, 0);

  const getTotalProductDiscountAmount = () => {
    let totalDiscount = 0;
    orderItems.forEach(item => {
      if (item?.quantity > 0) {
        const foodItem = findFoodItem(item.uniqueId);
        if (foodItem) {
          const priceInfo = getItemPriceWithDiscount(foodItem, item);
          if (priceInfo.hasDiscount) totalDiscount += priceInfo.originalPrice * item.quantity - priceInfo.totalPrice;
        }
      }
    });
    return totalDiscount;
  };

  const getTotalOrderItemCount = () => orderItems.reduce((total, item) => total + item.quantity, 0);

  const calculateTipAmount = () => {
    const subtotal = getTotalOrderAmount() - discount;
    if (tipPercentage > 0) return (subtotal * tipPercentage) / 100;
    if (customTipAmount) return parseFloat(customTipAmount) || 0;
    return 0;
  };

  const getFinalTotalAmount = () => getTotalOrderAmount() - (discount || 0) + calculateTipAmount();

  // ── Promo ──────────────────────────────────────────────────
  const applyPromoCode = async () => {
    if (!promoCode.trim()) { setPromoError(t("my_orders.promo_error", "Please enter a promo code")); return; }
    try {
      const response = await axios.post(`${url}/admin/promo-codes/validate`, { code: promoCode.trim(), orderAmount: getTotalOrderAmount() });
      if (response.data.success) {
        const promoData = response.data.data;
        setDiscount(promoData.discountAmount);
        setAppliedPromoCode(promoData.code);
        setIsPromoApplied(true);
        setPromoError("");
        toast.success(t("my_orders.promo_applied", { amount: promoData.discountAmount.toFixed(2) }));
      } else {
        setPromoError(response.data.message);
        setIsPromoApplied(false); setAppliedPromoCode(""); setDiscount(0);
      }
    } catch { setPromoError(t("my_orders.promo_error", "Invalid or expired promo code")); setIsPromoApplied(false); setAppliedPromoCode(""); setDiscount(0); }
  };

  const removePromoCode = () => { setPromoCode(""); setAppliedPromoCode(""); setIsPromoApplied(false); setDiscount(0); setPromoError(""); };

  // ── Modal helpers ──────────────────────────────────────────
  const openFoodModal = (itemId) => {
    const foodItem = findFoodItem(itemId);
    if (foodItem) {
      const item = orderItems.find(i => i.uniqueId === itemId);
      setSelectedFood(foodItem);
      setSelectedFoodQuantity(item.quantity);
      setSelectedFoodInstructions(item.specialInstructions || "");
      setIsFoodModalOpen(true);
    }
  };

  const closeFoodModal = () => { setIsFoodModalOpen(false); setSelectedFood(null); setSelectedFoodQuantity(1); setSelectedFoodInstructions(""); };

  // ── Tips ───────────────────────────────────────────────────
  const handleTipSelection = (percentage) => { setTipPercentage(percentage); setCustomTipAmount(""); };
  const handleCustomTipChange = (e) => {
    const value = e.target.value;
    if (value === "" || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) { setCustomTipAmount(value); setTipPercentage(0); }
  };

  // ── Payment ────────────────────────────────────────────────
  const handlePaymentMethodChange = (event) => {
    const method = event.target.value;
    setPaymentMethod(method);
    if (method === "creditCard") { setShowTipsSection(true); setTipPercentage(0); setCustomTipAmount(""); }
    else { setShowTipsSection(false); setTipPercentage(0); setCustomTipAmount(""); }
    if (paymentError) setPaymentError("");
  };

  const handleClearCart = async () => { setUnpaidOrders([]); setShowConfirmClear(false); toast.success(t("my_orders.clear_all", "All unpaid orders cleared")); };

  const getUserId = () => {
    if (token) {
      try { const payload = JSON.parse(atob(token.split('.')[1])); return payload.id || payload.userId || payload._id; } catch {}
    }
    const userData = localStorage.getItem('userData');
    if (userData) {
      try { const parsed = JSON.parse(userData); return parsed._id || parsed.id || parsed.userId; } catch {}
    }
    return null;
  };

  // ── Place Order ────────────────────────────────────────────
  const placeOrder = async (event) => {
    if (event) event.preventDefault();
    if (orderPlaced || billRequested) return;

    if (!paymentMethod) {
      setPaymentError(t("my_orders.payment_error", "Please select a payment method."));
      setTimeout(() => { document.getElementById("payment-method-section")?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 100);
      return;
    } else { setPaymentError(""); }

    setIsPlacingOrder(true);

    const tipAmount   = calculateTipAmount();
    const totalAmount = getFinalTotalAmount();
    const orderIds    = allOrders.map(order => order._id);
    const userId      = getUserId();

    const orderData = {
      tableNo: tableNumber, userData: data, items: orderItems, amount: totalAmount,
      tipAmount, tipPercentage, specialInstructions, orders: orderIds,
      promoCode: isPromoApplied ? appliedPromoCode : null, promoDiscount: discount, userId
    };

    try {
      if (paymentMethod === "creditCard") {
        const response = await axios.post(url + "/api/order/pay-order", orderData, { headers: { token } });
        if (response.data.success) window.location.replace(response.data.session_url);
        else { alert(t("my_orders.promo_error", "Error: ") + (response.data.message || "")); setIsPlacingOrder(false); }
      } else if (paymentMethod === "cashPOS") {
        try {
          const response = await axios.post(url + "/api/order/pay-order-cash", orderData, { headers: { token } });
          if (response.data.success) {
            markBillAsRequested();
            setUnpaidOrders([]); setIsPromoApplied(false); setAppliedPromoCode(""); setDiscount(0); setPromoCode("");
            setShowWaiterModal(true); window.scrollTo(0, 0);
            toast.success(t("my_orders.pay_order", "Order placed!"));
          } else { alert(t("my_orders.promo_error", "Error: ") + (response.data.message || "")); setIsPlacingOrder(false); }
        } catch {
          markBillAsRequested(); setShowWaiterModal(true); window.scrollTo(0, 0);
          if (isPromoApplied && appliedPromoCode) {
            try { await axios.patch(`${url}/admin/promo-codes/${appliedPromoCode}/increment-usage`, {}, { headers: { token } }); } catch {}
          }
          setUnpaidOrders([]); setIsPromoApplied(false); setAppliedPromoCode(""); setDiscount(0); setPromoCode("");
        }
      }
    } catch (error) {
      console.error("Order error:", error);
      if (error.response) alert(t("my_orders.promo_error", "Error: ") + (error.response.data.message || "Server error"));
      else if (error.request) alert(t("my_orders.promo_error", "Network error."));
      else alert(t("my_orders.promo_error", "Error: ") + error.message);
      setIsPlacingOrder(false);
    }
  };

  // ── Split Bill ─────────────────────────────────────────────
  const handleSplitBillClick = () => {
    if (!paymentMethod || paymentMethod !== "creditCard") {
      setPaymentMethod("creditCard"); setShowTipsSection(true); setTipPercentage(0); setCustomTipAmount("");
    }
    setShowSplitBillModal(true);
  };

  const placeSplitBillOrder = async (selectedItems, selectedTotal, proportionalDiscount = 0) => {
    if (!paymentMethod) { setPaymentError(t("my_orders.payment_error", "Please select a payment method.")); return; }
    setIsProcessingSplitBill(true);

    const originalTotal = getTotalOrderAmount();
    const tipAmount = calculateTipAmount();
    const selectedSubtotal = selectedTotal + proportionalDiscount;
    const proportionalTip = originalTotal > 0 ? (selectedSubtotal / originalTotal) * tipAmount : 0;
    const userId = getUserId();

    const splitBillData = {
      items: selectedItems.map(item => ({
        _id: item._id, foodId: item.foodId, name: item.name,
        price: item.price, quantity: item.quantity, originalQuantity: item.originalQuantity,
        specialInstructions: item.specialInstructions
      })),
      amount: selectedTotal, subtotal: selectedSubtotal, promoDiscount: proportionalDiscount,
      tipAmount: proportionalTip, originalOrderIds: allOrders.map(o => o._id),
      userId, tableNo: tableNumber, paymentMethod,
      promoCode: isPromoApplied ? appliedPromoCode : null, isPromoApplied
    };

    try {
      if (paymentMethod === "creditCard") {
        const response = await axios.post(url + "/api/split-bill/pay-split-bill", splitBillData, { headers: { token } });
        if (response.data.success) { toast.success(t("my_orders.split_bill_success", { amount: selectedTotal.toFixed(2) })); window.location.replace(response.data.session_url); }
      } else if (paymentMethod === "cashPOS") {
        const response = await axios.post(url + "/api/split-bill/pay-split-bill-cash", splitBillData, { headers: { token } });
        if (response.data.success) {
          markBillAsRequested();
          const paidItemIds = selectedItems.map(item => item._id);
          const updatedUnpaidOrders = unpaidOrders.map(order => {
            const remaining = order.items.filter(item => !paidItemIds.includes(item._id) || !isItemFullyPaid(item));
            return remaining.length === 0 ? null : { ...order, items: remaining };
          }).filter(Boolean);
          setUnpaidOrders(updatedUnpaidOrders);

          setTimeout(async () => {
            try {
              const updated = await axios.post(url + "/api/order/userOrders", {}, { headers: { token } });
              const ordersData = updated.data?.data || updated.data || [];
              setAllOrders(ordersData);
              const { unpaidOrders: unpaid, paidOrders: paid } = separatePaidAndUnpaidOrders(ordersData);
              setUnpaidOrders(unpaid); setPaidOrders(paid);
            } catch {}
          }, 2000);

          setShowWaiterModal(true);
          toast.success(t("my_orders.split_payment_success", `Your part (${selectedTotal.toFixed(2)} €) has been requested!`));
          setIsProcessingSplitBill(false);
        }
      }
    } catch (error) {
      console.error("Split bill error:", error);
      toast.error(t("my_orders.promo_error", "Error processing split bill"));
      setIsProcessingSplitBill(false);
    }
  };

  const getPaidItems = () =>
    allOrders.flatMap(order =>
      order.items.filter(isItemFullyPaid).map(item => ({
        ...item, orderId: order._id, orderNumber: order.orderNumber, orderDate: order.date
      }))
    );

  const paidItems = getPaidItems();

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString("en-GB")} ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  };

  // ── Loading ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="cart-container">
        <div className="loading-state">
          <motion.div className="smooth-spinner" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
          <span>{t("my_orders.loading_orders", "Loading orders...")}</span>
        </div>
      </motion.div>
    );
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
      className="cart-container" id="my-orders-page"
    >
      {/* Header */}
      <div className="cart-header-section-orders">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /><span>{t("my_orders.back", "Back")}</span>
        </button>
        <div className="cart-title-wrapper">
          <h1 className="cart-title">{t("my_orders.orders", "My Orders")}</h1>
        </div>
        <div className="back-button-placeholder" />
      </div>

      {/* Empty State */}
      {isCartEmpty && paidOrders.length === 0 ? (
        <EmptyOrdersState navigate={navigate} t={t} />
      ) : (
        <div className="cart-content">
          <BillRequestedNotification
            billRequested={billRequested}
            getTimeSinceBillRequest={getTimeSinceBillRequest}
            resetBillRequest={resetBillRequest}
            t={t}
          />

          {unpaidOrders.length > 0 && (
            <div className="unpaid-orders-section">
              <OrderList
                orders={unpaidOrders} isPaid={false} food_list={food_list}
                findFoodItem={findFoodItem} getItemPriceWithDiscount={getItemPriceWithDiscount}
                getTranslatedProductName={getTranslatedProductName} isTranslatingProductNames={isTranslatingProductNames}
                formatDateTime={formatDateTime} openFoodModal={openFoodModal}
                url={url} assets={assets} t={t} isItemFullyPaid={isItemFullyPaid}
              />
            </div>
          )}

          {paidItems.length > 0 && (
            <PaidItemsSection
              paidItems={paidItems} food_list={food_list}
              findFoodItem={findFoodItem} getItemPriceWithDiscount={getItemPriceWithDiscount}
              getTranslatedProductName={getTranslatedProductName}
              formatDateTime={formatDateTime} t={t} url={url} assets={assets}
            />
          )}

          {unpaidOrders.length > 0 && (
            <OrderSummary
              billRequested={billRequested}
              getOriginalSubtotal={getOriginalSubtotal}
              getTotalProductDiscountAmount={getTotalProductDiscountAmount}
              getTotalOrderAmount={getTotalOrderAmount}
              isPromoApplied={isPromoApplied} discount={discount}
              getFinalTotalAmount={getFinalTotalAmount}
              promoCode={promoCode} setPromoCode={setPromoCode}
              applyPromoCode={applyPromoCode} removePromoCode={removePromoCode}
              calculateTipAmount={calculateTipAmount} promoError={promoError}
              appliedPromoCode={appliedPromoCode} t={t}
            />
          )}

          {unpaidOrders.length > 0 && (
            <TipsSection
              showTipsSection={showTipsSection} billRequested={billRequested}
              tipPercentage={tipPercentage} customTipAmount={customTipAmount}
              getTotalOrderAmount={getTotalOrderAmount} discount={discount}
              handleTipSelection={handleTipSelection} handleCustomTipChange={handleCustomTipChange}
              setTipPercentage={setTipPercentage} calculateTipAmount={calculateTipAmount}
              getFinalTotalAmount={getFinalTotalAmount} t={t}
            />
          )}

          {unpaidOrders.length > 0 && (
            <PaymentSection
              billRequested={billRequested} paymentMethod={paymentMethod}
              paymentError={paymentError} handlePaymentMethodChange={handlePaymentMethodChange} t={t}
            />
          )}
        </div>
      )}

      {/* Split Bill Modal */}
      <SplitBillModal
        isOpen={showSplitBillModal} onClose={() => setShowSplitBillModal(false)}
        orderItems={orderItems} findFoodItem={findFoodItem}
        getItemPriceWithDiscount={getItemPriceWithDiscount}
        getTranslatedProductName={getTranslatedProductName}
        placeSplitBillOrder={placeSplitBillOrder} isProcessing={isProcessingSplitBill}
        paidItems={paidOrders.flatMap(order => order.items)} t={t} url={url} assets={assets}
        unpaidOrders={unpaidOrders} paymentMethod={paymentMethod}
        appliedPromoCode={appliedPromoCode} isPromoApplied={isPromoApplied} discount={discount}
      />

      {/* Floating Buttons */}
      <ModernFloatingButtons
        show={showFloatingCheckout && unpaidOrders.length > 0}
        billRequested={billRequested} isProcessing={isPlacingOrder || isProcessingSplitBill}
        itemCount={getTotalOrderItemCount()} totalAmount={getFinalTotalAmount()}
        onPay={placeOrder} onSplitBill={handleSplitBillClick}
        paymentMethod={paymentMethod} t={t}
      />

      {/* Confirm Clear Modal */}
      <AnimatePresence>
        {showConfirmClear && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="confirmation-modal" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.2 }}>
              <h3>{t("my_orders.clear_all_orders", "Clear All Orders")}</h3>
              <p>{t("my_orders.clear_confirmation", "Are you sure you want to clear all unpaid orders?")}</p>
              <div className="modal-actions">
                <button className="cancel-button" onClick={() => setShowConfirmClear(false)}>{t("my_orders.cancel", "Cancel")}</button>
                <button className="confirm-button" onClick={handleClearCart}>{t("my_orders.clear_all", "Clear All")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiter Modal */}
      <WaiterModalCart
        show={showWaiterModal}
        onClose={() => { setShowWaiterModal(false); setIsPlacingOrder(false); setIsProcessingSplitBill(false); }}
        paymentDetails={{
          totalAmount: getFinalTotalAmount().toFixed(2),
          itemCount: getTotalOrderItemCount(),
          paymentMethod: paymentMethod === "cashPOS" ? "Cash/POS" : "Credit Card",
          orders: allOrders.map(o => o._id),
          isSplitBill: false
        }}
      />

      {/* Food Modal */}
      <FoodModal
        food={selectedFood} closeModal={closeFoodModal} isOpen={isFoodModalOpen}
        initialQuantity={selectedFoodQuantity} initialInstructions={selectedFoodInstructions}
        cartItemId={
          selectedFood
            ? Object.keys(orderItems).find(id => { const item = orderItems.find(i => i.uniqueId === id); return item && item._id === selectedFood?._id; })
            : null
        }
      />
    </motion.div>
  );
};

export default MyOrders;