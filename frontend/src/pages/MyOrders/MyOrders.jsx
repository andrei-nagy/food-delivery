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
import FloatingCheckout from "../../components/MyOrders/FloatingCheckout";
import SplitBillModal from "../../components/MyOrders/SplitBillModal";
import PaidOrdersSection from "../../components/MyOrders/PaidOrdersSection";
import PaidItemsSection from "../../components/MyOrders/PaidItemsSection";

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
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  // State management
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
  const [unpaidOrders, setUnpaidOrders] = useState([]); // Ordini cu item-uri neplătite
  const [paidOrders, setPaidOrders] = useState([]); // Ordini complet plătite
  const [isLoading, setIsLoading] = useState(true);
  
  const [tipPercentage, setTipPercentage] = useState(0);
  const [customTipAmount, setCustomTipAmount] = useState("");
  const [showTipsSection, setShowTipsSection] = useState(false);
  
  const [showWaiterModal, setShowWaiterModal] = useState(false);

  // State-uri pentru Split Bill
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const [isProcessingSplitBill, setIsProcessingSplitBill] = useState(false);

  const tableNumber = localStorage.getItem("tableNumber") || null;

    // Funcție pentru a verifica dacă un item este complet plătit
  const isItemFullyPaid = (item) => {
    if (item.status === 'fully_paid') return true;
    
    if (item.paidBy && item.paidBy.length > 0) {
      const totalPaid = item.paidBy.reduce((sum, payment) => 
        sum + (payment.amount || 0), 0);
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      
      return Math.abs(totalPaid - itemTotal) < 0.01 || totalPaid >= itemTotal;
    }
    
    return false;
  };
  // Helper functions
  const getFlatUnpaidItems = () => {
    return unpaidOrders.flatMap(order => 
      order.items.filter(item => !isItemFullyPaid(item)).map(item => ({
        ...item,
        uniqueId: `${order._id}_${item._id}_${Date.now()}`,
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderDate: order.date,
      }))
    );
  };

  const orderItems = getFlatUnpaidItems();
  const isCartEmpty = orderItems.length === 0;

  // Effects
  useEffect(() => {
    document.body.classList.add("cart-page");
    return () => {
      document.body.classList.remove("cart-page");
    };
  }, []);

  useEffect(() => {
    if (food_list.length > 0) {
      translateProductNames();
      translateProductDescriptions();
    }
  }, [currentLanguage, food_list.length]);



  // Funcție pentru a separa ordinele plătite de cele neplătite
  const separatePaidAndUnpaidOrders = (orders) => {
    const unpaid = [];
    const paid = [];
    
    orders.forEach(order => {
      const hasUnpaidItems = order.items?.some(item => !isItemFullyPaid(item));
      
      if (hasUnpaidItems) {
        unpaid.push(order);
      } else {
        paid.push(order);
      }
    });
    
    return { unpaidOrders: unpaid, paidOrders: paid };
  };

  // Fetch all orders
  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        setIsLoading(true);
        console.log(`🔍 [MyOrders] Fetching all orders for user...`);
        
        const response = await axios.post(
          url + "/api/order/userOrders",
          {},
          { headers: { token } }
        );

        const ordersData = response.data?.data || response.data || [];
        console.log(`📥 [MyOrders] Received ${ordersData.length} orders from server`);
        
        setAllOrders(ordersData);
        
        // Separă ordinele plătite de cele neplătite
        const { unpaidOrders: unpaid, paidOrders: paid } = separatePaidAndUnpaidOrders(ordersData);
        
        console.log(`📊 [MyOrders] Separated orders:`, {
          totalOrders: ordersData.length,
          unpaidOrders: unpaid.length,
          paidOrders: paid.length,
        });
        
        setUnpaidOrders(unpaid);
        setPaidOrders(paid);
        setData((data) => ({ ...data, tableNo: tableNumber }));
      } catch (error) {
        console.error("❌ [MyOrders] Error fetching orders", error);
        setAllOrders([]);
        setUnpaidOrders([]);
        setPaidOrders([]);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchAllOrders();
    } else {
      setIsLoading(false);
      setAllOrders([]);
      setUnpaidOrders([]);
      setPaidOrders([]);
    }
  }, [url, token, tableNumber]);

  useEffect(() => {
    setShowFloatingCheckout(!isCartEmpty && !billRequested);
  }, [isCartEmpty, orderItems, billRequested]);

  // Translation functions
  const translateProductNames = async () => {
    if (currentLanguage === "ro" || !food_list.length) {
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
        const combinedText = productNamesToTranslate.join(" ||| ");
        const response = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLanguage}&dt=t&q=${encodeURIComponent(
            combinedText
          )}`
        );

        if (response.ok) {
          const data = await response.json();
          const translatedCombinedText =
            data[0]?.map((item) => item[0]).join("") || combinedText;
          const translatedNamesArray = translatedCombinedText.split(" ||| ");

          const newTranslatedProductNames = {};
          Object.keys(productIdMap).forEach((index) => {
            const foodId = productIdMap[index];
            const translatedName =
              translatedNamesArray[index] || productNamesToTranslate[index];
            if (translatedName && foodId) {
              newTranslatedProductNames[foodId] = translatedName;
            }
          });

          setTranslatedProductNames(newTranslatedProductNames);
        }
      }
    } catch (error) {
      console.error("❌ Error translating product names:", error);
    } finally {
      setIsTranslatingProductNames(false);
    }
  };

  const translateProductDescriptions = async () => {
    if (currentLanguage === "ro" || !food_list.length) {
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
        const combinedText = descriptionsToTranslate.join(" ||| ");
        const response = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLanguage}&dt=t&q=${encodeURIComponent(
            combinedText
          )}`
        );

        if (response.ok) {
          const data = await response.json();
          const translatedCombinedText =
            data[0]?.map((item) => item[0]).join("") || combinedText;
          const translatedDescriptionsArray =
            translatedCombinedText.split(" ||| ");

          const newTranslatedDescriptions = {};
          Object.keys(descriptionIdMap).forEach((index) => {
            const foodId = descriptionIdMap[index];
            const translatedDescription =
              translatedDescriptionsArray[index] ||
              descriptionsToTranslate[index];
            if (translatedDescription && foodId) {
              newTranslatedDescriptions[foodId] = translatedDescription;
            }
          });

          setTranslatedDescriptions(newTranslatedDescriptions);
        }
      }
    } catch (error) {
      console.error("❌ Error translating product descriptions:", error);
    } finally {
      setIsTranslatingDescriptions(false);
    }
  };

  const getTranslatedProductName = (foodItem) => {
    if (!foodItem) return "";
    const foodId = foodItem._id;
    const translatedName = translatedProductNames[foodId];
    return currentLanguage !== "ro" && translatedName
      ? translatedName
      : foodItem.name || "";
  };

  const getTranslatedDescription = (foodItem) => {
    if (!foodItem) return "";
    const foodId = foodItem._id;
    const translatedDescription = translatedDescriptions[foodId];
    return currentLanguage !== "ro" && translatedDescription
      ? translatedDescription
      : foodItem.description || "";
  };

  // Food item functions
  const findFoodItem = (itemId) => {
    const item = orderItems.find((item) => item.uniqueId === itemId);
    if (item) {
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
    const discountedPrice =
      discountPercentage > 0
        ? rawPrice * (1 - discountPercentage / 100)
        : rawPrice;
    const extrasPrice = cartItem?.extrasPrice || 0;

    return {
      unitPrice: discountedPrice + extrasPrice,
      totalPrice: (discountedPrice + extrasPrice) * (cartItem?.quantity || 1),
      hasDiscount: discountPercentage > 0,
      discountPercentage,
      originalPrice: rawPrice + extrasPrice,
    };
  };

  // Calculation functions - DOAR pentru item-uri neplătite
  const getTotalOrderAmount = () => {
    return orderItems.reduce((total, item) => {
      const foodItem = findFoodItem(item.uniqueId);
      if (foodItem) {
        const priceInfo = getItemPriceWithDiscount(foodItem, item);
        return total + priceInfo.totalPrice;
      }
      return total + item.price * item.quantity;
    }, 0);
  };

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

  const getTotalOrderItemCount = () => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getFinalTotalAmount = () => {
    const subtotal = getTotalOrderAmount();
    const tipAmount = calculateTipAmount();
    const promoDiscount = discount || 0;
    return subtotal - promoDiscount + tipAmount;
  };

  // Promo code functions
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

  const removePromoCode = () => {
    setPromoCode("");
    setAppliedPromoCode("");
    setIsPromoApplied(false);
    setDiscount(0);
    setPromoError("");
  };

  // Modal functions
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

  // Tips functions
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

  // Payment functions
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

  // Helper function to get userId
  const getUserId = () => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id || payload.userId || payload._id;
      } catch (error) {
        console.log("❌ Could not decode token:", error);
      }
    }
    
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        return parsedData._id || parsedData.id || parsedData.userId;
      } catch (error) {
        console.log("❌ Could not parse userData:", error);
      }
    }
    
    console.warn("⚠️ Could not find userId");
    return null;
  };

  // Place order function
  const placeOrder = async (event) => {
    if (event) event.preventDefault();

    if (orderPlaced || billRequested) return;

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

    const tipAmount = calculateTipAmount();
    const totalAmount = getFinalTotalAmount();
    const orderIds = allOrders.map((order) => order._id);
    const userId = getUserId();

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
      userId: userId
    };

    console.log("🎯 [placeOrder] Order data:", {
      paymentMethod,
      totalAmount,
      tipAmount,
      orderIds,
      promoCode: orderData.promoCode,
      userId: orderData.userId
    });

    try {
      if (paymentMethod === "creditCard") {
        console.log("💳 Processing credit card payment...");
        
        const response = await axios.post(
          url + "/api/order/pay-order",
          orderData,
          {
            headers: { token },
          }
        );

        if (response.data.success) {
          console.log("✅ Credit card payment initiated successfully");
          markBillAsRequested();
          window.location.replace(response.data.session_url);
        } else {
          console.error("❌ Credit card payment failed:", response.data.message);
          alert("Error processing payment: " + (response.data.message || "Unknown error"));
          setIsPlacingOrder(false);
        }
      } else if (paymentMethod === "cashPOS") {
        console.log("💵 Processing cash/POS payment...");
        
        try {
          const response = await axios.post(
            url + "/api/order/pay-order-cash",
            orderData,
            { headers: { token } }
          );

          if (response.data.success) {
            console.log("✅ Cash payment processed successfully");
            markBillAsRequested();
            
            setUnpaidOrders([]);
            setIsPromoApplied(false);
            setAppliedPromoCode("");
            setDiscount(0);
            setPromoCode("");
            
            setShowWaiterModal(true);
            window.scrollTo(0, 0);
            
            toast.success("Order placed successfully! Waiter has been notified.");
          } else {
            console.error("❌ Cash payment failed:", response.data.message);
            alert("Error processing cash payment: " + (response.data.message || "Unknown error"));
            setIsPlacingOrder(false);
          }
        } catch (cashError) {
          console.error("❌ Cash payment endpoint error:", cashError);
          
          console.log("🔄 Trying fallback to WaiterModal only...");
          
          markBillAsRequested();
          setShowWaiterModal(true);
          window.scrollTo(0, 0);
          
          if (isPromoApplied && appliedPromoCode) {
            try {
              console.log(`🔄 Manually incrementing promo code: ${appliedPromoCode}`);
              await axios.patch(
                `${url}/admin/promo-codes/${appliedPromoCode}/increment-usage`,
                {},
                { headers: { token } }
              );
              console.log("✅ Promo code manually incremented");
            } catch (promoError) {
              console.error("❌ Failed to manually increment promo code:", promoError);
            }
          }
          
          setUnpaidOrders([]);
          setIsPromoApplied(false);
          setAppliedPromoCode("");
          setDiscount(0);
          setPromoCode("");
        }
      }
    } catch (error) {
      console.error("🔴 Order placement error:", error);
      
      if (error.response) {
        console.error("🔴 Server response error:", error.response.data);
        alert("Error placing order: " + (error.response.data.message || "Server error"));
      } else if (error.request) {
        console.error("🔴 Network error:", error.request);
        alert("Network error. Please check your connection and try again.");
      } else {
        console.error("🔴 Unknown error:", error.message);
        alert("Error placing order: " + error.message);
      }
      
      setIsPlacingOrder(false);
    }
  };

  // Split Bill Functions
  const handleSplitBillClick = () => {
    if (!paymentMethod) {
      setPaymentError("Please select a payment method first.");
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
    }
    setShowSplitBillModal(true);
  };

  const placeSplitBillOrder = async (selectedItems, selectedTotal) => {
    if (!paymentMethod) {
      setPaymentError("Please select a payment method.");
      return;
    }

    setIsProcessingSplitBill(true);

    // Calculează tip-ul proporțional
    const originalTotal = getTotalOrderAmount();
    const tipAmount = calculateTipAmount();
    const proportionalTip = originalTotal > 0 ? (selectedTotal / originalTotal) * tipAmount : 0;

    // Pregătește datele pentru backend
    const userId = getUserId();
    const splitBillData = {
      items: selectedItems.map(item => ({
        _id: item._id,
        foodId: item.foodId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        originalQuantity: item.originalQuantity,
        specialInstructions: item.specialInstructions
      })),
      amount: selectedTotal,
      tipAmount: proportionalTip,
      originalOrderIds: allOrders.map(order => order._id),
      userId: userId,
      tableNo: tableNumber,
      paymentMethod: paymentMethod,
      promoCode: isPromoApplied ? appliedPromoCode : null,
      promoDiscount: discount
    };

    try {
      if (paymentMethod === "creditCard") {
        const response = await axios.post(
          url + "/api/split-bill/pay-split-bill",
          splitBillData,
          { headers: { token } }
        );

        if (response.data.success) {
          markBillAsRequested();
          toast.success(`Processing payment for ${selectedTotal.toFixed(2)} €`);
          window.location.replace(response.data.session_url);
        }
      } else if (paymentMethod === "cashPOS") {
        const response = await axios.post(
          url + "/api/split-bill/pay-split-bill-cash",
          splitBillData,
          { headers: { token } }
        );

        if (response.data.success) {
          markBillAsRequested();
          setShowWaiterModal(true);
          toast.success(`Your part of ${selectedTotal.toFixed(2)} € has been requested!`);
          
          // Reîncarcă orders după split bill
          const updatedOrders = await axios.post(
            url + "/api/order/userOrders",
            {},
            { headers: { token } }
          );
          
          const ordersData = updatedOrders.data?.data || updatedOrders.data || [];
          setAllOrders(ordersData);
          
          // Re-separă ordinele
          const { unpaidOrders: unpaid, paidOrders: paid } = separatePaidAndUnpaidOrders(ordersData);
          setUnpaidOrders(unpaid);
          setPaidOrders(paid);
          
          setIsProcessingSplitBill(false);
        }
      }
    } catch (error) {
      console.error("🔴 Split bill payment error:", error);
      toast.error("Error processing split bill payment");
      setIsProcessingSplitBill(false);
    }
  };
// Funcție pentru a obține item-uri plătite individual
const getPaidItems = () => {
  return allOrders.flatMap(order => 
    order.items.filter(item => isItemFullyPaid(item)).map(item => ({
      ...item,
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderDate: order.date,
    }))
  );
};

// În render, folosește:
const paidItems = getPaidItems();

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

  const totalUnpaidItemsCount = orderItems.length;
  const totalPaidItemsCount = paidOrders.flatMap(order => order.items).length;

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
        <h1 className="cart-title">{t("my_orders.orders")}</h1>

      </div>

      {/* Empty Cart State */}
      {isCartEmpty && paidOrders.length === 0 ? (
        <EmptyOrdersState navigate={navigate} t={t} />
      ) : (
        <div className="cart-content">
          {/* Notification for already requested bill */}
          <BillRequestedNotification
            billRequested={billRequested}
            getTimeSinceBillRequest={getTimeSinceBillRequest}
            resetBillRequest={resetBillRequest}
            t={t}
          />

          {/* ✅ SECȚIUNEA ORDINILOR NEPLĂTITE */}
          {unpaidOrders.length > 0 && (
            <div className="unpaid-orders-section">
              <div className="section-header">
                <h2 className="section-title">
                  {t("my_orders.unpaid_items")} ({totalUnpaidItemsCount})
                </h2>
                <p className="section-description">
                  {t("my_orders.select_items_to_pay")}
                </p>
              </div>
              
              <OrderList
                orders={unpaidOrders}
                isPaid={false}
                food_list={food_list}
                findFoodItem={findFoodItem}
                getItemPriceWithDiscount={getItemPriceWithDiscount}
                getTranslatedProductName={getTranslatedProductName}
                isTranslatingProductNames={isTranslatingProductNames}
                formatDateTime={formatDateTime}
                openFoodModal={openFoodModal}
                url={url}
                assets={assets}
                t={t}
              />
            </div>
          )}

{paidItems.length > 0 && (
  <PaidItemsSection
    paidItems={paidItems} // Folosește paidItems, nu paidOrders
    food_list={food_list}
    findFoodItem={findFoodItem}
    getItemPriceWithDiscount={getItemPriceWithDiscount}
    getTranslatedProductName={getTranslatedProductName}
    formatDateTime={formatDateTime}
    t={t}
    url={url}
    assets={assets}
  />
)}

          {/* Order Summary - DOAR PENTRU ITEM-URILE NEPLĂTITE */}
          {unpaidOrders.length > 0 && (
            <OrderSummary
              billRequested={billRequested}
              getOriginalSubtotal={getOriginalSubtotal}
              getTotalProductDiscountAmount={getTotalProductDiscountAmount}
              getTotalOrderAmount={getTotalOrderAmount}
              isPromoApplied={isPromoApplied}
              discount={discount}
              getFinalTotalAmount={getFinalTotalAmount}
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              applyPromoCode={applyPromoCode}
              removePromoCode={removePromoCode}
              calculateTipAmount={calculateTipAmount}
              promoError={promoError}
              appliedPromoCode={appliedPromoCode}
              t={t}
            />
          )}

          {/* Tips Section - DOAR DACA EXISTA ITEM-URI NEPLATITE */}
          {unpaidOrders.length > 0 && (
            <TipsSection
              showTipsSection={showTipsSection}
              billRequested={billRequested}
              tipPercentage={tipPercentage}
              customTipAmount={customTipAmount}
              getTotalOrderAmount={getTotalOrderAmount}
              discount={discount}
              handleTipSelection={handleTipSelection}
              handleCustomTipChange={handleCustomTipChange}
              setTipPercentage={setTipPercentage}
              calculateTipAmount={calculateTipAmount}
              getFinalTotalAmount={getFinalTotalAmount}
              t={t}
            />
          )}

          {/* Payment Section - DOAR DACA EXISTA ITEM-URI NEPLATITE */}
          {unpaidOrders.length > 0 && (
            <PaymentSection
              billRequested={billRequested}
              paymentMethod={paymentMethod}
              paymentError={paymentError}
              handlePaymentMethodChange={handlePaymentMethodChange}
              t={t}
            />
          )}
        </div>
      )}

      {/* Split Bill Modal */}
      <SplitBillModal
        isOpen={showSplitBillModal}
        onClose={() => setShowSplitBillModal(false)}
        orderItems={orderItems}
        findFoodItem={findFoodItem}
        getItemPriceWithDiscount={getItemPriceWithDiscount}
        getTranslatedProductName={getTranslatedProductName}
        placeSplitBillOrder={placeSplitBillOrder}
        isProcessing={isProcessingSplitBill}
        paidItems={paidOrders.flatMap(order => order.items)}
        t={t}
        url={url}
        assets={assets}
      />

      {/* Floating Checkout Button - DOAR DACA EXISTA ITEM-URI NEPLATITE */}
      <FloatingCheckout
        showFloatingCheckout={showFloatingCheckout && unpaidOrders.length > 0}
        billRequested={billRequested}
        isPlacingOrder={isPlacingOrder || isProcessingSplitBill}
        orderPlaced={orderPlaced}
        getTotalOrderItemCount={getTotalOrderItemCount}
        getFinalTotalAmount={getFinalTotalAmount}
        placeOrder={placeOrder}
        onSplitBillClick={handleSplitBillClick}
        t={t}
      />

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
          setIsProcessingSplitBill(false);
        }}
        paymentDetails={{
          totalAmount: getFinalTotalAmount().toFixed(2),
          itemCount: getTotalOrderItemCount(),
          paymentMethod: paymentMethod === "cashPOS" ? "Cash/POS" : "Credit Card",
          orders: allOrders.map((order) => order._id),
          isSplitBill: false
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