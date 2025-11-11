import React, { useContext, useState, useEffect, useRef } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FoodModal from "../../components/FoodItem/FoodModal";
import { useTranslation } from "react-i18next";
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
  FaShoppingBag,
  FaTag,
  FaCheckCircle,
  FaPercent
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
    clearCart,
    addToCart,
    canAddToCart,
    billRequested
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

  const swipeData = useRef({});
  const [swipeOffsets, setSwipeOffsets] = useState({});

  const tableNumber = localStorage.getItem("tableNumber") || null;

  const isCartEmpty = Object.keys(cartItems).length === 0;

  useEffect(() => {
    document.body.classList.add("cart-page");
    return () => {
      document.body.classList.remove("cart-page");
    };
  }, []);

  useEffect(() => {
    setData((data) => ({ ...data, tableNo: tableNumber }));
    setShowFloatingCheckout(!isCartEmpty && !billRequested);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    setShowFloatingCheckout(!isCartEmpty && !billRequested);
  }, [isCartEmpty, cartItems, billRequested]);

  // Fetch popular products
  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const response = await axios.get(`${url}/api/order/list`);
        if (response.data.success) {
          const orders = response.data.data.filter(
            (order) => order.status === "Delivered"
          );

          // Count products
          const productCountMap = {};
          const productDetailsMap = {};

          orders.forEach((order) => {
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach((item) => {
                // Asigură-te că item este un obiect valid
                if (item && typeof item === "object") {
                  const productName = item.name;
                  const productId = item.baseFoodId || item.foodId;

                  if (productName && productId) {
                    productCountMap[productName] =
                      (productCountMap[productName] || 0) + 1;

                    // Store product details for the first occurrence
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

          // Combine count with details and get top 20
          const popularProductsData = Object.entries(productCountMap)
            .map(([name, count]) => {
              const product = productDetailsMap[name];
              // Asigură-te că fiecare produs este un obiect valid
              return product
                ? {
                    ...product,
                    count,
                  }
                : null;
            })
            .filter(Boolean) // Elimină orice valori null
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);

          setPopularProducts(popularProductsData);
        }
      } catch (error) {
        console.error("Error fetching popular products:", error);
      }
    };

    if (!isCartEmpty && !billRequested) {
      fetchPopularProducts();
    }
  }, [url, isCartEmpty, billRequested]);

  // Select 6 random products from popular products
  useEffect(() => {
    if (popularProducts.length > 0 && !billRequested) {
      const shuffled = [...popularProducts].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 6);
      setDisplayedPopularProducts(selected);
    }
  }, [popularProducts, billRequested]);

  // Function to handle adding popular product to cart
  const handleAddPopularProduct = (product) => {
    // ✅ Verifică dacă nota a fost cerută înainte de a adăuga în coș
    if (!canAddToCart()) {
      return;
    }

    try {
      // Verificări extinse
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

      // Caută produsul în lista completă de mâncăruri
      const completeFoodItem = food_list.find((item) => {
        if (!item || typeof item !== "object") return false;
        return item._id === productId || item.name === productName;
      });

      if (completeFoodItem && typeof completeFoodItem === "object") {
        // Deschide modalul pentru produs în loc să-l adauge direct
        setSelectedFood(completeFoodItem);
        setSelectedFoodQuantity(1);
        setSelectedFoodInstructions("");
        setIsFoodModalOpen(true);
      } else {
        // Fallback - creează un item de bază
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

  // În funcția findFoodItem, asigură-te că incluzi câmpurile pentru discount
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

  // ✅ FUNCȚIE: Calculează prețul cu discount pentru un item
  const getItemPriceWithDiscount = (foodItem, cartItem) => {
    if (!foodItem) return {
      unitPrice: 0,
      totalPrice: 0,
      hasDiscount: false,
      discountPercentage: 0,
      originalPrice: 0
    };
    
    const rawPrice = parseFloat(foodItem.price) || 0;
    const discountPercentage = parseFloat(foodItem.discountPercentage) || 0;
    
    // Calculează prețul cu discount
    const discountedPrice = discountPercentage > 0 
      ? rawPrice * (1 - discountPercentage / 100)
      : rawPrice;
      
    // Adaugă prețul extraselor
    const extrasPrice = cartItem?.itemData?.extrasPrice || 0;
    
    return {
      unitPrice: discountedPrice + extrasPrice,
      totalPrice: (discountedPrice + extrasPrice) * (cartItem?.quantity || 1),
      hasDiscount: discountPercentage > 0,
      discountPercentage,
      originalPrice: rawPrice + extrasPrice
    };
  };

  // ✅ FUNCȚIE NOUĂ: Calculează subtotal-ul ORIGINAL (fără discount)
  const getOriginalSubtotal = () => {
    let originalSubtotal = 0;
    
    Object.keys(cartItems).forEach((itemId) => {
      const cartItem = cartItems[itemId];
      if (cartItem && cartItem.quantity > 0) {
        const foodItem = findFoodItem(itemId, cartItem);
        if (foodItem) {
          const priceInfo = getItemPriceWithDiscount(foodItem, cartItem);
          // Folosim prețul original pentru subtotal
          originalSubtotal += priceInfo.originalPrice * cartItem.quantity;
        }
      }
    });
    
    return originalSubtotal;
  };

  // ✅ FUNCȚIE NOUĂ: Calculează discount-ul total pentru toate produsele din coș
  const getTotalDiscountAmount = () => {
    let totalDiscount = 0;
    
    Object.keys(cartItems).forEach((itemId) => {
      const cartItem = cartItems[itemId];
      if (cartItem && cartItem.quantity > 0) {
        const foodItem = findFoodItem(itemId, cartItem);
        if (foodItem) {
          const priceInfo = getItemPriceWithDiscount(foodItem, cartItem);
          if (priceInfo.hasDiscount) {
            // Calculează discount-ul pentru acest item
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
    // ✅ Verifică dacă nota a fost cerută înainte de a deschide modalul
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

  // Verifică dacă un produs popular este deja în coș - VERSIUNE SIMPLĂ
  const getPopularProductQuantity = (product) => {
    if (!product || typeof product !== "object") return 0;

    const productId = product.id || product._id;
    const productName = product.name;

    if (!productId && !productName) return 0;

    // Caută în toate item-ile din coș
    for (const [itemId, itemData] of Object.entries(cartItems)) {
      const baseFoodId = itemId.split("__")[0];

      // Verifică după ID
      if (productId && baseFoodId === productId) {
        return itemData.quantity;
      }

      // Verifică după nume (fallback)
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

    // ✅ Verifică dacă nota a fost cerută înainte de a plasa comanda
    if (billRequested) {
      toast.error("Cannot place order - bill has been requested");
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

    const totalAmount = getTotalCartAmount(); // Folosește getTotalCartAmount care deja include discount-urile

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
      // Dacă nu este selectată nicio metodă de plată, folosește cashPOS ca default
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
        // Pentru cashPOS sau când nu este selectată nicio metodă
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
    // ✅ Verifică dacă nota a fost cerută înainte de a permite swipe
    if (billRequested) return;
    
    swipeData.current[id] = {
      startX: e.touches[0].clientX,
      currentX: e.touches[0].clientX,
      isSwiping: false,
    };
  };

  const handleTouchMove = (e, id) => {
    // ✅ Verifică dacă nota a fost cerută
    if (billRequested) return;
    
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
    // ✅ Verifică dacă nota a fost cerută
    if (billRequested) return;
    
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
    // ✅ Verifică dacă nota a fost cerută
    if (billRequested) {
      toast.error("Cannot modify cart - bill has been requested");
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
      {/* Bill Requested Warning Banner */}
      {billRequested && (
        <motion.div
          className="cart-bill-warning"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="cart-bill-warning-content">
            <span className="cart-bill-warning-icon">⚠️</span>
            <div className="cart-bill-warning-text">
              <strong>Bill Requested</strong>
              <span>Cannot add new items or modify cart. Please cancel the bill request first.</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header Section */}
      <div className="cart-header-section">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
          <span>Back</span>
        </button>

        <h1 className="cart-title">{t("your_order")}</h1>

        {!isCartEmpty && !billRequested ? (
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

      {/* Empty Cart State - SE AFIȘEAZĂ DOAR DACĂ NU E PLASATĂ COMANDA */}
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
            Your cart feels lonely
          </motion.h2>

          <motion.p
            className="empty-cart-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            It looks like you haven't added any items to your cart yet. Explore
            our menu and discover delicious options!
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
                                  Product Loading...
                                </h3>
                                <p className="item-description">
                                  Please wait while we load product information
                                </p>
                              </div>
                              <div className="item-bottom-row">
                                <p className="item-price">
                                  {cartItem.quantity} x ? €
                                </p>
                                <div className={`quantity-controls ${billRequested ? 'disabled-controls' : ''}`}>
                                  <button
                                    onClick={() => removeFromCart(itemId, 1)}
                                    className="quantity-button-order decrease"
                                    aria-label="Decrease quantity"
                                    disabled={billRequested}
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
                                    disabled={billRequested}
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

                  const priceInfo = getItemPriceWithDiscount(foodItem, cartItem);

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
                        {!billRequested && (
                          <div
                            className="cart-item-swipe-background"
                            onClick={() => handleDeleteClick(itemId)}
                          >
                            <FaTrash className="swipe-trash-icon" />
                          </div>
                        )}

                        <div
                          className={`cart-item ${billRequested ? 'bill-requested-item' : ''}`}
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
                            disabled={billRequested}
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
                              disabled={billRequested}
                            >
                              <h3 className={`item-name ${billRequested ? 'disabled-text' : ''}`}>{foodItem.name}</h3>
                            </button>

                            {/* DESCRIEREA SUB TITLU */}
                            <button
                              className="item-description-button"
                              onClick={() => openFoodModal(itemId, cartItem)}
                              disabled={billRequested}
                            >
                              <p className={`item-description ${billRequested ? 'disabled-text' : ''}`}>
                                {foodItem.description}
                              </p>
                            </button>

                            {/* NOTE + EXTRAS SUB DESCRIERE */}
                            {itemInstructions && (
                              <div className="item-special-instructions">
                                <span className="instructions-label">
                                  Note:{" "}
                                </span>
                                {itemInstructions}
                              </div>
                            )}

                            {cartItem.selectedOptions &&
                              cartItem.selectedOptions.length > 0 && (
                                <div className="item-extras">
                                  <span className="extras-label">Extras: </span>
                                  {cartItem.selectedOptions.join(", ")}
                                  <span className="extras-price">
                                    (+
                                    {(
                                      cartItem.itemData?.extrasPrice || 0
                                    ).toFixed(2)}{" "}
                                    €)
                                  </span>
                                </div>
                              )}

                            {/* SECȚIUNEA DE PREȚ CU DISCOUNT */}
                            <div className="item-price-section">
                              {priceInfo.hasDiscount ? (
                                <div className="discount-price-wrapper-cart">
                                  <span className="original-price-line">
                                    {(priceInfo.originalPrice * cartItem.quantity).toFixed(2)} €
                                  </span>
                                  <span className="discounted-price-cart">
                                    {priceInfo.totalPrice.toFixed(2)} €
                                  </span>
                                  <div className="discount-badge-cart">
                                    -{priceInfo.discountPercentage}%
                                  </div>
                                </div>
                              ) : (
                                <span className="regular-price-cart">
                                  {priceInfo.totalPrice.toFixed(2)} €
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={`quantity-controls ${billRequested ? 'disabled-controls' : ''}`}>
                            <button
                              onClick={() => removeFromCart(itemId, 1)}
                              className="quantity-button-order decrease"
                              aria-label="Decrease quantity"
                              disabled={billRequested}
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
                              disabled={billRequested}
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

            {/* Add More Button - doar dacă nota nu este cerută */}
            {!billRequested && (
              <div className="add-more-button-container">
                <button
                  className="add-more-button-cart"
                  onClick={() => navigate("/category/All")}
                >
                  <FaPlus />
                  <span>{t("add_more_items")}</span>
                </button>
              </div>
            )}
          </div>

          {/* Popular Products Section - DOAR DACĂ COȘUL NU ESTE GOL ȘI NOTA NU ESTE CERUTĂ */}
          {!isCartEmpty && displayedPopularProducts.length > 0 && !billRequested && (
            <motion.div
              className="popular-products-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="section-title">{t("other_products")}</h2>
              <p className="section-subtitle">{t("popular_choices")}</p>

              <div className="popular-products-grid">
                {displayedPopularProducts.map((product, index) => {
                  // Asigură-te că product este un obiect valid înainte de a-l randări
                  if (!product || typeof product !== "object") {
                    return null;
                  }

                  const quantityInCart = getPopularProductQuantity(product);

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
                      {/* Card-ul întreg este clickable pentru a deschide modalul */}
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

                        {/* Butonul de add sau cantitatea */}
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
                      </div>

                      <div className="popular-product-info">
                        <h4
                          className="popular-product-name"
                          onClick={() => handleAddPopularProduct(product)}
                        >
                          {product.name || "Popular Item"}
                        </h4>
                        <p className="popular-product-price">
                          {(product.price || 0).toFixed(2)} €
                        </p>
                        <div className="popular-product-stats">
                          <span className="order-count">
                            {t("ordered_times", { count: product.count || 0 })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Special Instructions globale - doar dacă nota nu este cerută */}
          {!billRequested && (
            <div className="special-instructions-section">
              <h2 className="section-title">{t("special_instructions")}</h2>
              <div className="instructions-input-container">
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder={t("special_instructions_placeholder")}
                  rows={3}
                  className="instructions-textarea"
                />
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="order-summary-section">
            <h2 className="section-title">{t("order_summary")}</h2>

            <div className="summary-details">
              <div className="summary-row">
                <span>{t("subtotal")}</span>
                {/* ✅ Folosim subtotal-ul ORIGINAL (fără discount) */}
                <span>{getOriginalSubtotal().toFixed(2)} €</span>
              </div>

              {/* ✅ SECȚIUNEA PENTRU DISCOUNT-UL TOTAL DIN PRODUSELE CU REDUCERE */}
              {getTotalDiscountAmount() > 0 && (
                <div className="summary-row discount-row">
                  <span className="discount-label">
                    <FaPercent className="discount-icon" />
                    Discount
                  </span>
                  <span className="discount-amount">
                    -{getTotalDiscountAmount().toFixed(2)} €
                  </span>
                </div>
              )}

              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>{t("total")}</span>
                {/* ✅ Totalul este subtotal-ul original minus discount-ul */}
                <span>
                  {(getOriginalSubtotal() - getTotalDiscountAmount()).toFixed(2)} €
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Checkout Button - doar dacă nota nu este cerută */}
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
                <div className="item-count">{getTotalItemCount()}</div>
                <div className="checkout-text"> {t("place_order")}</div>
                <div className="checkout-total">
                  {/* ✅ Folosim getTotalCartAmount() care deja include discount-urile */}
                  {getTotalCartAmount().toFixed(2)} €
                </div>
              </>
            ) : (
              <div className="order-placed-message">
                <motion.div
                  className="smooth-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>{t("processing_order")}...</span>
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
              <h3>{t("remove_item")}</h3>
              <p>{t("remove_confirmation")}</p>
              <div className="modal-actions">
                <button className="cancel-button" onClick={cancelDelete}>
                  {t("cancel")}
                </button>
                <button className="confirm-button" onClick={confirmDelete}>
                  {t("remove")}
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
              <h3>{t("clear_cart")}</h3>
              <p>{t("clear_cart_confirmation")}</p>
              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowConfirmClear(false)}
                >
                  {t("cancel")}
                </button>
                <button className="confirm-button" onClick={handleClearCart}>
                  {t("clear_all")}
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