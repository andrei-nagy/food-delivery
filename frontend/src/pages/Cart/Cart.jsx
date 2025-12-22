import React, { useContext, useState, useEffect, useRef } from "react";
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

// Component pentru noul design al butonului floating checkout
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
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add("mc-ripple");

    const ripple = button.getElementsByClassName("mc-ripple")[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  };

  if (!show || isDisabled) return null;

  return (
    <div className="modern-checkout-container">
      <button
        className={`modern-checkout-button ${isProcessing ? 'mc-processing' : ''}`}
        onClick={(e) => {
          createRipple(e);
          if (!isProcessing) onClick();
        }}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <div className="mc-processing-state">
            <div className="mc-spinner"></div>
            <span className="mc-processing-text">{t("cart.processing_order")}</span>
          </div>
        ) : (
          <div className="mc-content">
            <div className="mc-left">
              <div className="mc-icon">
               <FaShoppingCart />

              </div>
              <div className="mc-text">
                <span className="mc-title">{t("cart.place_order")}</span>
                <span className="mc-subtitle">{itemCount} {t("cart.items")}</span>
              </div>
            </div>
            <div className="mc-right">
              {/* {itemCount > 0 && (
                <div className="mc-item-count">
                  <span className="mc-count-number">{itemCount}</span>
                  <span className="mc-count-label">{t("cart.items")}</span>
                </div>
              )} */}
              <div className="mc-total-amount">
                {formatPrice(totalAmount)}
              </div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
};

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

  const { t, i18n } = useTranslation();

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
  const [selectedFood, setSelectedFood] = useState(null);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [selectedFoodQuantity, setSelectedFoodQuantity] = useState(1);
  const [selectedFoodInstructions, setSelectedFoodInstructions] = useState("");
  const [popularProducts, setPopularProducts] = useState([]);
  const [displayedPopularProducts, setDisplayedPopularProducts] = useState([]);
  const { currentLanguage } = useLanguage();
  const [translatedProductNames, setTranslatedProductNames] = useState({});
  const [isTranslatingProductNames, setIsTranslatingProductNames] =
    useState(false);

  const [translatedPopularProducts, setTranslatedPopularProducts] = useState(
    {}
  );
  const [isTranslatingPopular, setIsTranslatingPopular] = useState(false);
  const [translatedDescriptions, setTranslatedDescriptions] = useState({});
  const [isTranslatingDescriptions, setIsTranslatingDescriptions] =
    useState(false);

  const swipeData = useRef({});
  const [swipeOffsets, setSwipeOffsets] = useState({});

  const tableNumber = localStorage.getItem("tableNumber") || null;

  const isCartEmpty = Object.keys(cartItems).length === 0;

  const isDisabled = billRequested || userBlocked;
  
  const currency = restaurantData?.currency || '€';
  const currencyPosition = restaurantData?.currencyPosition || 'after';

  const formatPrice = (priceValue, showCurrency = true) => {
    if (!priceValue && priceValue !== 0) return '';
    
    const numericPrice = typeof priceValue === 'string' 
      ? parseFloat(priceValue) 
      : priceValue;
    
    const formattedPrice = numericPrice.toFixed(2);
    
    if (!showCurrency) {
      return formattedPrice;
    }
    
    const nbsp = '\u00A0';
    
    if (currencyPosition === 'before') {
      return `${currency}${nbsp}${formattedPrice}`;
    } else {
      return `${formattedPrice}${nbsp}${currency}`;
    }
  };

  const getBlockedMessage = () => {
    if (userBlocked) {
      return {
        icon: "⏰",
        text: t("cart.session_expired"),
        warningText: t("cart.session_expired_warning"),
      };
    }
    if (billRequested) {
      return {
        icon: "🔒",
        text: t("cart.bill_requested"),
        warningText: t("cart.bill_requested_warning"),
      };
    }
    return null;
  };

  const blockedMessage = getBlockedMessage();

  useEffect(() => {
    document.body.classList.add("cart-page");
    return () => {
      document.body.classList.remove("cart-page");
    };
  }, []);

  useEffect(() => {
    setData((data) => ({ ...data, tableNo: tableNumber }));
    setShowFloatingCheckout(!isCartEmpty && !isDisabled);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    setShowFloatingCheckout(!isCartEmpty && !isDisabled);
  }, [isCartEmpty, cartItems, isDisabled]);

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

  useEffect(() => {
    if (food_list.length > 0 && !isDisabled) {
      translateProductNames();
    }
  }, [currentLanguage, food_list.length, isDisabled]);

  const getTranslatedProductName = (foodItem) => {
    if (!foodItem) return "";

    const foodId = foodItem._id;
    const translatedName = translatedProductNames[foodId];

    return currentLanguage !== "ro" && translatedName
      ? translatedName
      : foodItem.name || "";
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

  useEffect(() => {
    if (food_list.length > 0 && !isDisabled) {
      translateProductDescriptions();
    }
  }, [currentLanguage, food_list.length, isDisabled]);

  const getTranslatedDescription = (foodItem) => {
    if (!foodItem) return "";

    const foodId = foodItem._id;
    const translatedDescription = translatedDescriptions[foodId];

    return currentLanguage !== "ro" && translatedDescription
      ? translatedDescription
      : foodItem.description || "";
  };

  const translatePopularProductNames = async () => {
    if (currentLanguage === "ro" || !displayedPopularProducts.length) {
      setTranslatedPopularProducts({});
      setIsTranslatingPopular(false);
      return;
    }

    setIsTranslatingPopular(true);

    try {
      const productNamesToTranslate = [];
      const productIdMap = {};

      displayedPopularProducts.forEach((product, index) => {
        if (product?.name?.trim()) {
          productNamesToTranslate.push(product.name);
          productIdMap[index] = product.id || product.name;
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
          const translatedNames = translatedCombinedText.split(" ||| ");

          const newTranslatedProducts = {};
          Object.keys(productIdMap).forEach((index) => {
            const productId = productIdMap[index];
            const translatedName =
              translatedNames[index] || productNamesToTranslate[index];
            if (translatedName && productId) {
              newTranslatedProducts[productId] = translatedName;
            }
          });

          setTranslatedPopularProducts(newTranslatedProducts);
        }
      }
    } catch (error) {
      console.error("❌ Error translating popular products:", error);
    } finally {
      setIsTranslatingPopular(false);
    }
  };

  useEffect(() => {
    if (displayedPopularProducts.length > 0 && !isDisabled) {
      translatePopularProductNames();
    }
  }, [currentLanguage, displayedPopularProducts.length, isDisabled]);

  const getTranslatedPopularProductName = (product) => {
    const productId = product.id || product.name;
    const translatedName = translatedPopularProducts[productId];

    return currentLanguage !== "ro" && translatedName
      ? translatedName
      : product.name;
  };

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const response = await axios.get(`${url}/api/order/list`);
        if (response.data.success) {
          const orders = response.data.data.filter(
            (order) => order.status === "Delivered"
          );

          const productCountMap = {};
          const productDetailsMap = {};

          orders.forEach((order) => {
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach((item) => {
                if (item && typeof item === "object") {
                  const productName = item.name;
                  const productId = item.baseFoodId || item.foodId;

                  if (productName && productId) {
                    productCountMap[productName] =
                      (productCountMap[productName] || 0) + 1;

                    if (!productDetailsMap[productName]) {
                      productDetailsMap[productName] = {
                        id: productId,
                        name: productName,
                        price: item.price || 0,
                        image: item.image || "",
                        count: 0,
                      };
                    }
                  }
                }
              });
            }
          });

          const popularProductsData = Object.entries(productCountMap)
            .map(([name, count]) => {
              const product = productDetailsMap[name];
              return product
                ? {
                    ...product,
                    count,
                  }
                : null;
            })
            .filter(Boolean)
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);

          setPopularProducts(popularProductsData);
        }
      } catch (error) {
        console.error("Error fetching popular products:", error);
      }
    };

    if (!isCartEmpty && !isDisabled) {
      fetchPopularProducts();
    }
  }, [url, isCartEmpty, isDisabled]);

  useEffect(() => {
    if (popularProducts.length > 0 && !isDisabled) {
      const shuffled = [...popularProducts].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 6);
      setDisplayedPopularProducts(selected);
    }
  }, [popularProducts, isDisabled]);

  const handleAddPopularProduct = (product) => {
    if (!canAddToCart()) {
      return;
    }

    try {
      if (!product || typeof product !== "object") {
        console.error("Invalid product object:", product);
        toast.error("Error adding product to cart");
        return;
      }

      const productName = product.name || "Unknown Product";
      const productId = product.id || product._id;

      if (!productId) {
        console.error("Product ID missing:", product);
        toast.error("Product information incomplete");
        return;
      }

      const completeFoodItem = food_list.find((item) => {
        if (!item || typeof item !== "object") return false;
        return item._id === productId || item.name === productName;
      });

      if (completeFoodItem && typeof completeFoodItem === "object") {
        setSelectedFood(completeFoodItem);
        setSelectedFoodQuantity(1);
        setSelectedFoodInstructions("");
        setIsFoodModalOpen(true);
      } else {
        const fallbackItem = {
          _id: productId,
          name: productName,
          price: Number(product.price) || 0,
          image: product.image || "",
          description: product.description || "Popular item",
          category: product.category || "Popular",
        };

        setSelectedFood(fallbackItem);
        setSelectedFoodQuantity(1);
        setSelectedFoodInstructions("");
        setIsFoodModalOpen(true);
      }
    } catch (error) {
      console.error("Error in handleAddPopularProduct:", error);
      toast.error("Failed to add product to cart");
    }
  };

  const findFoodItem = (itemId, cartItem) => {
    let baseFoodId = "";

    if (itemId) {
      const parts = itemId.split("__");
      baseFoodId = parts[0];
    }

    const foodItem = food_list.find((item) => item._id === baseFoodId);

    if (!foodItem && baseFoodId) {
      const alternativeItem = food_list.find(
        (item) => item._id.includes(baseFoodId) || baseFoodId.includes(item._id)
      );
      return alternativeItem || null;
    }

    return foodItem || null;
  };

  const getItemPriceWithDiscount = (foodItem, cartItem) => {
    if (!foodItem)
      return {
        unitPrice: 0,
        totalPrice: 0,
        hasDiscount: false,
        discountPercentage: 0,
        originalPrice: 0,
      };

    const rawPrice = parseFloat(foodItem.price) || 0;
    const discountPercentage = parseFloat(foodItem.discountPercentage) || 0;

    const discountedPrice =
      discountPercentage > 0
        ? rawPrice * (1 - discountPercentage / 100)
        : rawPrice;

    const extrasPrice = cartItem?.itemData?.extrasPrice || 0;

    return {
      unitPrice: discountedPrice + extrasPrice,
      totalPrice: (discountedPrice + extrasPrice) * (cartItem?.quantity || 1),
      hasDiscount: discountPercentage > 0,
      discountPercentage,
      originalPrice: rawPrice + extrasPrice,
    };
  };

  const getOriginalSubtotal = () => {
    let originalSubtotal = 0;

    Object.keys(cartItems).forEach((itemId) => {
      const cartItem = cartItems[itemId];
      if (cartItem && cartItem.quantity > 0) {
        const foodItem = findFoodItem(itemId, cartItem);
        if (foodItem) {
          const priceInfo = getItemPriceWithDiscount(foodItem, cartItem);
          originalSubtotal += priceInfo.originalPrice * cartItem.quantity;
        }
      }
    });

    return originalSubtotal;
  };

  const getTotalDiscountAmount = () => {
    let totalDiscount = 0;

    Object.keys(cartItems).forEach((itemId) => {
      const cartItem = cartItems[itemId];
      if (cartItem && cartItem.quantity > 0) {
        const foodItem = findFoodItem(itemId, cartItem);
        if (foodItem) {
          const priceInfo = getItemPriceWithDiscount(foodItem, cartItem);
          if (priceInfo.hasDiscount) {
            const originalTotal = priceInfo.originalPrice * cartItem.quantity;
            const discountedTotal = priceInfo.totalPrice;
            const itemDiscount = originalTotal - discountedTotal;
            totalDiscount += itemDiscount;
          }
        }
      }
    });

    return totalDiscount;
  };

  const getItemInstructions = (itemId) => {
    const cartItem = cartItems[itemId];
    return cartItem?.specialInstructions || "";
  };

  const openFoodModal = (itemId, cartItem) => {
    if (!canAddToCart()) {
      return;
    }

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

  const getPopularProductQuantity = (product) => {
    if (!product || typeof product !== "object") return 0;

    const productId = product.id || product._id;
    const productName = product.name;

    if (!productId && !productName) return 0;

    for (const [itemId, itemData] of Object.entries(cartItems)) {
      const baseFoodId = itemId.split("__")[0];

      if (productId && baseFoodId === productId) {
        return itemData.quantity;
      }

      if (productName) {
        const foodItem = findFoodItem(itemId, itemData);
        if (foodItem && foodItem.name === productName) {
          return itemData.quantity;
        }
      }
    }

    return 0;
  };

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

    if (!canAddToCart()) {
      return;
    }

    if (orderPlaced) return;

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
      }
    });

    const totalAmount = getTotalCartAmount();

    const orderData = {
      userId: token,
      items: orderItems,
      amount: totalAmount,
      tableNo: tableNumber,
      userData: data,
      specialInstructions: specialInstructions,
      paymentMethod: paymentMethod || "cashPOS",
    };

    try {
      const selectedPaymentMethod = paymentMethod || "cashPOS";

      if (selectedPaymentMethod === "creditCard") {
        const response = await axios.post(url + "/api/order/place", orderData, {
          headers: { token },
        });

        if (response.data.success) {
          window.location.replace(response.data.session_url);
        } else {
          alert("Error processing payment.");
          setIsPlacingOrder(false);
        }
      } else {
        const response = await axios.post(
          url + "/api/order/place-cash",
          orderData,
          { headers: { token } }
        );

        if (response.data.success) {
          setOrderPlaced(true);
          setShowFloatingCheckout(false);

          navigate("/thank-you", {
            state: {
              tableNo: orderData.tableNo,
              orderId: response.data.orderId,
            },
          });
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
  };

  const handleTouchStart = (e, id) => {
    if (isDisabled) return;

    swipeData.current[id] = {
      startX: e.touches[0].clientX,
      currentX: e.touches[0].clientX,
      isSwiping: false,
    };
  };

  const handleTouchMove = (e, id) => {
    if (isDisabled) return;

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
    if (isDisabled) return;

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

  const handleDeleteClick = (id) => {
    if (isDisabled) {
      if (billRequested) {
        toast.error(t("cart.cannot_modify_cart_bill"));
      } else if (userBlocked) {
        toast.error(t("cart.cannot_modify_cart_session"));
      }
      return;
    }
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      removeItemCompletely(itemToDelete);
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
        </button>

        <h1 className="cart-title">{t("cart.your_order")}</h1>

        {!isCartEmpty && !isDisabled ? (
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
      
      {/* Warning Banner pentru Session Expired sau Bill Requested */}
      {isDisabled && blockedMessage && (
        <motion.div
          className="cart-bill-warning"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="cart-bill-warning-content">
            <span className="cart-bill-warning-icon">
              {blockedMessage.icon}
            </span>
            <div className="cart-bill-warning-text">
              <strong>{blockedMessage.text}</strong>
              <span>{blockedMessage.warningText}</span>
            </div>
          </div>
        </motion.div>
      )}

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
            {t("cart.empty_cart_title")}
          </motion.h2>

          <motion.p
            className="empty-cart-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {t("cart.empty_cart_description")}
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
            <span>{t("cart.browse_menu")}</span>
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
          {/* Cart Items List */}
          <div className="cart-items-section">
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
                              <div className="item-main-info">
                                <h3 className="item-name">
                                  {t("cart.product_loading")}
                                </h3>
                                <p className="item-description">
                                  {t("cart.loading_description")}
                                </p>
                              </div>
                              <div className="item-bottom-row">
                                <p className="item-price">
                                  {cartItem.quantity} x ? €
                                </p>
                                <div
                                  className={`quantity-controls ${
                                    isDisabled ? "disabled-controls" : ""
                                  }`}
                                >
                                  <button
                                    onClick={() => removeFromCart(itemId, 1)}
                                    className="quantity-button-order decrease"
                                    aria-label="Decrease quantity"
                                    disabled={isDisabled}
                                  >
                                    <FaMinus />
                                  </button>
                                  <span className="quantity-display">
                                    {cartItem.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateCartItemQuantity(
                                        itemId,
                                        cartItem.quantity + 1,
                                        itemInstructions
                                      )
                                    }
                                    className="quantity-button-order increase"
                                    aria-label="Increase quantity"
                                    disabled={isDisabled}
                                  >
                                    <FaPlus />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                        <div className="item-divider"></div>
                      </React.Fragment>
                    );
                  }

                  const priceInfo = getItemPriceWithDiscount(
                    foodItem,
                    cartItem
                  );

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
                        {!isDisabled && (
                          <div
                            className="cart-item-swipe-background"
                            onClick={() => handleDeleteClick(itemId)}
                          >
                            <FaTrash className="swipe-trash-icon" />
                          </div>
                        )}

                        <div
                          className={`cart-item ${
                            isDisabled ? "bill-requested-item" : ""
                          }`}
                          onTouchStart={(e) => handleTouchStart(e, itemId)}
                          onTouchMove={(e) => handleTouchMove(e, itemId)}
                          onTouchEnd={() => handleTouchEnd(itemId)}
                          onClick={() => resetSwipe(itemId)}
                          style={{
                            transform: `translateX(${
                              swipeOffsets[itemId] || 0
                            }px)`,
                            transition: "transform 0.3s ease",
                          }}
                        >
                          <button
                            className="item-image-button"
                            onClick={() => openFoodModal(itemId, cartItem)}
                            disabled={isDisabled}
                          >
                            <img
                              src={url + "/images/" + foodItem.image}
                              alt={foodItem.name}
                              className="item-image"
                              onError={(e) => {
                                e.target.src = assets.image_coming_soon;
                                e.target.style.objectFit = "cover";
                              }}
                            />
                          </button>
                          <div className="item-details">
                            <button
                              className="item-name-button"
                              onClick={() => openFoodModal(itemId, cartItem)}
                              disabled={isDisabled}
                            >
                              <h3
                                className={`item-name ${
                                  isDisabled ? "disabled-text" : ""
                                }`}
                              >
                                {getTranslatedProductName(foodItem)}
                                {isTranslatingProductNames && (
                                  <span className="translating-indicator">
                                    {" "}
                                  </span>
                                )}
                              </h3>
                            </button>

                            <button
                              className="item-description-button"
                              onClick={() => openFoodModal(itemId, cartItem)}
                              disabled={isDisabled}
                            >
                              <p
                                className={`item-description ${
                                  isDisabled ? "disabled-text" : ""
                                }`}
                              >
                                {getTranslatedDescription(foodItem)}
                                {isTranslatingDescriptions && (
                                  <span className="translating-indicator">
                                    {" "}
                                  </span>
                                )}
                              </p>
                            </button>

                            {itemInstructions && (
                              <div className="item-special-instructions">
                                <span className="instructions-label">
                                  {t("cart.note")}{" "}
                                </span>
                                {itemInstructions}
                              </div>
                            )}

                            {cartItem.selectedOptions &&
                              cartItem.selectedOptions.length > 0 && (
                                <div className="item-extras">
                                  <span className="extras-label">
                                    {t("cart.extras")}{" "}
                                  </span>
                                  {cartItem.selectedOptions.join(", ")}
                                  <span className="extras-price">
                                    (+
                                    {formatPrice(cartItem.itemData?.extrasPrice || 0)}
                                  </span>
                                </div>
                              )}

                            <div className="item-price-section">
                              {priceInfo.hasDiscount ? (
                                <div className="discount-price-wrapper-cart">
                                  <span className="original-price-line">
                                    {formatPrice(priceInfo.originalPrice * cartItem.quantity)}
                                  </span>
                                  <span className="discounted-price-cart">
                                    {formatPrice(priceInfo.totalPrice)}
                                  </span>
                                  <div className="discount-badge-cart">
                                    -{priceInfo.discountPercentage}%
                                  </div>
                                </div>
                              ) : (
                                <span className="regular-price-cart">
                                  {formatPrice(priceInfo.totalPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div
                            className={`quantity-controls ${
                              isDisabled ? "disabled-controls" : ""
                            }`}
                          >
                            <button
                              onClick={() => removeFromCart(itemId, 1)}
                              className="quantity-button-order decrease"
                              aria-label="Decrease quantity"
                              disabled={isDisabled}
                            >
                              <FaMinus />
                            </button>
                            <span className="quantity-display">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateCartItemQuantity(
                                  itemId,
                                  cartItem.quantity + 1,
                                  itemInstructions
                                )
                              }
                              className="quantity-button-order increase"
                              aria-label="Increase quantity"
                              disabled={isDisabled}
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

            {/* Add More Button */}
            {!isDisabled && (
              <div className="add-more-button-container">
                <button
                  className="add-more-button-cart"
                  onClick={() => navigate("/category/All")}
                >
                  <FaPlus />
                  <span>{t("cart.add_more_items")}</span>
                </button>
              </div>
            )}
          </div>

          {/* Popular Products Section */}
          {!isCartEmpty &&
            displayedPopularProducts.length > 0 &&
            !isDisabled && (
              <motion.div
                className="popular-products-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="section-title">{t("cart.other_products")}</h2>
                <p className="section-subtitle">{t("cart.popular_choices")}</p>

                <div className="popular-products-grid">
                  {displayedPopularProducts.map((product, index) => {
                    if (!product || typeof product !== "object") {
                      return null;
                    }

                    const quantityInCart = getPopularProductQuantity(product);

                    const completeFoodItem = food_list.find(
                      (item) =>
                        item._id === (product.id || product._id) ||
                        item.name === product.name
                    );

                    const getProductPriceInfo = () => {
                      if (!completeFoodItem) {
                        return {
                          hasDiscount: false,
                          originalPrice: product.price || 0,
                          discountedPrice: product.price || 0,
                          discountPercentage: 0,
                        };
                      }

                      const rawPrice =
                        parseFloat(completeFoodItem.price) ||
                        parseFloat(product.price) ||
                        0;
                      const discountPercentage =
                        parseFloat(completeFoodItem.discountPercentage) || 0;

                      const discountedPrice =
                        discountPercentage > 0
                          ? rawPrice * (1 - discountPercentage / 100)
                          : rawPrice;

                      return {
                        hasDiscount: discountPercentage > 0,
                        originalPrice: rawPrice,
                        discountedPrice: discountedPrice,
                        discountPercentage: discountPercentage,
                      };
                    };

                    const priceInfo = getProductPriceInfo();

                    return (
                      <motion.div
                        key={product.id || product.name || `popular-${index}`}
                        className="popular-product-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                        }}
                      >
                        <div
                          className="popular-product-image"
                          onClick={() => handleAddPopularProduct(product)}
                        >
                          <img
                            src={
                              product.image
                                ? `${url}/images/${product.image}`
                                : assets.image_coming_soon
                            }
                            alt={product.name || "Popular product"}
                            onError={(e) => {
                              e.target.src = assets.image_coming_soon;
                              e.target.style.objectFit = "contain";
                              e.target.style.padding = "10px";
                            }}
                          />

                          {quantityInCart > 0 ? (
                            <div className="popular-product-quantity-badge emerald">
                              <span className="quantity-number">
                                {quantityInCart}
                              </span>
                            </div>
                          ) : (
                            <button
                              className="add-popular-product-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddPopularProduct(product);
                              }}
                              aria-label={`Add ${product.name} to cart`}
                            >
                              <FaPlus />
                            </button>
                          )}

                          {priceInfo.hasDiscount && (
                            <div className="popular-product-discount-badge">
                              -{priceInfo.discountPercentage}%
                            </div>
                          )}
                        </div>

                        <div className="popular-product-info">
                          <h4
                            className="popular-product-name"
                            onClick={() => handleAddPopularProduct(product)}
                          >
                            {getTranslatedPopularProductName(product)}
                            {isTranslatingPopular && (
                              <span className="translating-indicator"></span>
                            )}
                          </h4>

                          <div className="popular-product-price-container">
                            {priceInfo.hasDiscount ? (
                              <div className="popular-product-price-with-discount">
                                <span className="popular-product-original-price">
                                  {formatPrice(priceInfo.originalPrice)}
                                </span>
                                <span className="popular-product-price discounted">
                                  {formatPrice(priceInfo.discountedPrice)}
                                </span>
                              </div>
                            ) : (
                              <span className="popular-product-price">
                                {formatPrice(priceInfo.originalPrice)}
                              </span>
                            )}
                          </div>

                          <div className="popular-product-stats">
                            <span className="order-count">
                              {t("cart.ordered_times", {
                                count: product.count || 0,
                              })}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

          {/* Special Instructions globale */}
          {!isDisabled && (
            <div className="special-instructions-section">
              <h2 className="section-title">
                {t("cart.special_instructions")}
              </h2>
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

          {/* Order Summary */}
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
                  <span className="discount-amount">
                    -{formatPrice(getTotalDiscountAmount())}
                  </span>
                </div>
              )}

              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>{t("cart.total")}</span>
                <span>
                  {formatPrice(getOriginalSubtotal() - getTotalDiscountAmount())}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Checkout Button */}
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
              <h3>{t("cart.remove_item")}</h3>
              <p>{t("cart.remove_confirmation")}</p>
              <div className="modal-actions">
                <button className="cancel-button" onClick={cancelDelete}>
                  {t("cart.cancel")}
                </button>
                <button className="confirm-button" onClick={confirmDelete}>
                  {t("cart.remove")}
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
              <h3>{t("cart.clear_cart")}</h3>
              <p>{t("cart.clear_cart_confirmation")}</p>
              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowConfirmClear(false)}
                >
                  {t("cart.cancel")}
                </button>
                <button className="confirm-button" onClick={handleClearCart}>
                  {t("cart.clear_all")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food Modal */}
      <FoodModal
        food={selectedFood}
        closeModal={closeFoodModal}
        isOpen={isFoodModalOpen}
        initialQuantity={selectedFoodQuantity}
        initialInstructions={selectedFoodInstructions}
        cartItemId={Object.keys(cartItems).find((id) => {
          const item = cartItems[id];
          const foodItem = findFoodItem(id, item);
          return foodItem && foodItem._id === selectedFood?._id;
        })}
      />
    </motion.div>
  );
};

export default Cart;