import React, { useContext, useState, useEffect, useRef } from "react";
import { StoreContext } from "../../context/StoreContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaPlus,
  FaMinus,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { toast } from "react-toastify";
import { FaHeart } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./RepeatOrder.css";

// Import assets
import { assets } from "../../assets/assets";

const RepeatOrder = () => {
  const { 
    url, 
    token, 
    addToCart, 
    canAddToCart, 
    billRequested, 
    food_list,
    userBlocked 
  } = useContext(StoreContext);
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasOrders, setHasOrders] = useState(false);
  const [hasUnpaidOrders, setHasUnpaidOrders] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [translatedContent, setTranslatedContent] = useState({
    title: '',
    add: '',
    disabled: ''
  });
  const [translatedProducts, setTranslatedProducts] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslatingProducts, setIsTranslatingProducts] = useState(false);
  
  const navigate = useNavigate();
  const swiperRef = useRef(null);
  const autoplayTimeoutRef = useRef(null);

  // Combină ambele condiții pentru a bloca interacțiunea
  const isDisabled = billRequested || userBlocked;

  useEffect(() => {
    console.log("🔄 RepeatOrder - useEffect mount");
    fetchRecentOrders();
    return () => {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
    };
  }, []);

  // === FUNCȚII PENTRU TRADUCERE ===
  const translateText = async (text, targetLang) => {
    console.log("🌐 translateText called with:", { text: text?.substring(0, 50), targetLang });
    
    if (!text?.trim() || !targetLang || targetLang === 'ro') {
      return text;
    }
    
    if (text.length < 2 || /^[\d\s\W]+$/.test(text)) {
      return text;
    }
    
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const translatedText = data[0]?.[0]?.[0] || text;
      
      return translatedText;
    } catch (error) {
      console.error('❌ Translation error for text:', text?.substring(0, 50), error);
      return text;
    }
  };

  // Funcție pentru traducerea textelor componentei
  const translateComponentTexts = async () => {
    console.log("🚀 translateComponentTexts STARTED", {
      currentLanguage,
      translationEnabled: currentLanguage !== 'ro'
    });

    if (currentLanguage === 'ro') {
      setTranslatedContent({
        title: '',
        add: '',
        disabled: ''
      });
      setIsTranslating(false);
      return;
    }
    
    setIsTranslating(true);

    try {
      const originalTitle = t("repeat_order.title");
      const originalAdd = t("repeat_order.add"); 
      const originalDisabled = t("repeat_order.disabled");

      console.log("📝 Original texts:", {
        originalTitle,
        originalAdd,
        originalDisabled
      });

      const textsToTranslate = [
        originalTitle,
        originalAdd,
        originalDisabled
      ];

      const combinedText = textsToTranslate.join(' ||| ');
      
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLanguage}&dt=t&q=${encodeURIComponent(combinedText)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const translatedCombinedText = data[0]?.map(item => item[0]).join('') || combinedText;
        const translatedTexts = translatedCombinedText.split(' ||| ');
        
        setTranslatedContent({
          title: translatedTexts[0] || originalTitle,
          add: translatedTexts[1] || originalAdd,
          disabled: translatedTexts[2] || originalDisabled
        });
      } else {
        setTranslatedContent({
          title: originalTitle,
          add: originalAdd,
          disabled: originalDisabled
        });
      }
    } catch (error) {
      console.error('❌ Error translating component texts:', error);
      const originalTitle = t("repeat_order.title");
      const originalAdd = t("repeat_order.add");
      const originalDisabled = t("repeat_order.disabled");
      
      setTranslatedContent({
        title: originalTitle,
        add: originalAdd,
        disabled: originalDisabled
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // Funcție pentru traducerea numelor produselor
  const translateProductNames = async (products) => {
    if (currentLanguage === 'ro' || !products || products.length === 0) {
      setTranslatedProducts({});
      setIsTranslatingProducts(false);
      return;
    }

    console.log("🚀 translateProductNames STARTED", {
      currentLanguage,
      productCount: products.length
    });

    setIsTranslatingProducts(true);

    try {
      const productNamesToTranslate = [];
      const productIdMap = {};

      // Colectează toate numele produselor care trebuie traduse
      products.forEach((product, index) => {
        const productId = product.foodId || product._id;
        if (product.name && product.name.trim()) {
          productNamesToTranslate.push(product.name);
          productIdMap[index] = productId;
        }
      });

      if (productNamesToTranslate.length > 0) {
        const combinedText = productNamesToTranslate.join(' ||| ');
        console.log("📦 Translating product names:", combinedText);

        const response = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLanguage}&dt=t&q=${encodeURIComponent(combinedText)}`
        );

        if (response.ok) {
          const data = await response.json();
          const translatedCombinedText = data[0]?.map(item => item[0]).join('') || combinedText;
          const translatedNames = translatedCombinedText.split(' ||| ');

          // Creează obiectul cu traducerile
          const newTranslatedProducts = {};
          Object.keys(productIdMap).forEach((index) => {
            const productId = productIdMap[index];
            const translatedName = translatedNames[index] || productNamesToTranslate[index];
            if (translatedName && productId) {
              newTranslatedProducts[productId] = translatedName;
            }
          });

          console.log("✅ Translated products:", newTranslatedProducts);
          setTranslatedProducts(newTranslatedProducts);
        }
      }
    } catch (error) {
      console.error('❌ Error translating product names:', error);
    } finally {
      setIsTranslatingProducts(false);
    }
  };

  // Efect pentru traducere automată când se schimbă limba
  useEffect(() => {
    console.log("🎯 useEffect for translation triggered", {
      currentLanguage,
      tFunctionAvailable: !!t
    });
    translateComponentTexts();
  }, [currentLanguage, t]);

  // === FUNCȚII PENTRU A OBȚINE TEXTUL TRADUS ===
  const getTranslatedTitle = () => {
    return currentLanguage !== 'ro' && translatedContent.title 
      ? translatedContent.title 
      : t("repeat_order.title");
  };

  const getTranslatedAdd = () => {
    return currentLanguage !== 'ro' && translatedContent.add 
      ? translatedContent.add 
      : t("repeat_order.add");
  };

  const getTranslatedDisabled = () => {
    return currentLanguage !== 'ro' && translatedContent.disabled 
      ? translatedContent.disabled 
      : t("repeat_order.disabled");
  };

  // Funcție pentru a obține numele tradus al produsului
  const getTranslatedProductName = (product) => {
    const productId = product.foodId || product._id;
    const translatedName = translatedProducts[productId];
    
    return currentLanguage !== 'ro' && translatedName 
      ? translatedName 
      : product.name;
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/userOrders",
        {},
        { headers: { token } }
      );

      const allOrders = response.data.data;
      if (allOrders && allOrders.length > 0) {
        const sortedOrders = allOrders
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 8);
        setRecentOrders(sortedOrders);
        setHasOrders(true);

        const hasUnpaid = sortedOrders.some(
          (order) =>
            order.payment === false ||
            order.payment === null ||
            order.payment === undefined ||
            order.status === "pending" ||
            order.status === "processing"
        );
        setHasUnpaidOrders(hasUnpaid);
      } else {
        setHasOrders(false);
        setHasUnpaidOrders(false);
      }
    } catch (error) {
      console.error("Error fetching recent orders", error);
      setHasOrders(false);
      setHasUnpaidOrders(false);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCȚIE: Găsește informațiile complete despre mâncare din food_list
  const findFoodItem = (baseFoodId) => {
    if (!baseFoodId || !food_list) return null;
    
    const foodItem = food_list.find((food) => 
      food._id === baseFoodId
    );
    
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
    
    const discountedPrice = discountPercentage > 0 
      ? rawPrice * (1 - discountPercentage / 100)
      : rawPrice;
      
    return {
      unitPrice: discountedPrice,
      totalPrice: discountedPrice * (cartItem?.quantity || 1),
      hasDiscount: discountPercentage > 0,
      discountPercentage,
      originalPrice: rawPrice
    };
  };

  // Funcție pentru gestionarea erorilor de imagine
  const handleImageError = (itemId) => {
    setImageErrors(prev => ({
      ...prev,
      [itemId]: true
    }));
  };

  const pauseAutoplayTemporarily = () => {
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.stop();

      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }

      autoplayTimeoutRef.current = setTimeout(() => {
        if (swiperRef.current && swiperRef.current.autoplay) {
          swiperRef.current.autoplay.start();
        }
      }, 3000);
    }
  };

  const handleRepeatSingleItem = async (item) => {
    if (!canAddToCart()) {
      return;
    }

    try {
      pauseAutoplayTemporarily();

      const itemId = item.foodId || item._id;
      const quantity = quantities[itemId] || 1;

      if (!itemId) {
        console.error("❌ Invalid item data - no item ID found");
        return;
      }

      if (!addToCart) {
        console.error("❌ addToCart function is not available");
        return;
      }

      addToCart(itemId, quantity);
      toast.success(t("repeat_order.item_added", { name: item.name, quantity }), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      const button = document.querySelector(`[data-item-id="${itemId}"]`);
      if (button) {
        button.classList.add("added");
        setTimeout(() => button.classList.remove("added"), 500);
      }
    } catch (error) {
      console.error("❌ Error adding item to cart:", error);
    }
  };

  const handleQuantityChange = (itemId, change) => {
    if (isDisabled) {
      if (billRequested) {
        toast.error(t("repeat_order.cannot_modify_quantities_bill"));
      } else if (userBlocked) {
        toast.error(t("repeat_order.cannot_modify_quantities_session"));
      }
      return;
    }

    pauseAutoplayTemporarily();

    setQuantities((prev) => {
      const currentQuantity = prev[itemId] || 1;
      const newQuantity = Math.max(1, currentQuantity + change);

      return {
        ...prev,
        [itemId]: newQuantity,
      };
    });
  };

  const getAllUniqueProducts = () => {
    const allProducts = [];

    recentOrders.forEach((order) => {
      if (
        order.payment === false ||
        order.payment === null ||
        order.payment === undefined ||
        order.status === "pending" ||
        order.status === "processing"
      ) {
        order.items.forEach((item) => {
          const existingIndex = allProducts.findIndex(
            (prod) => (prod.foodId || prod._id) === (item.foodId || item._id)
          );

          if (existingIndex === -1) {
            allProducts.push({
              ...item,
              orderDate: order.date,
              orderStatus: order.payment ? "completed" : "pending",
            });
          }
        });
      }
    });

    return allProducts;
  };

  // Obține produsele unice
  const uniqueProducts = getAllUniqueProducts();

  // Efect pentru traducerea produselor când se schimbă limba sau produsele
  useEffect(() => {
    if (uniqueProducts.length > 0) {
      translateProductNames(uniqueProducts);
    }
  }, [currentLanguage, uniqueProducts.length]);

  // Mesajul care va apărea când utilizatorul este blocat
  const getBlockedMessage = () => {
    if (userBlocked) {
      return {
        icon: "⏰",
        text: t("repeat_order.session_expired"),
        warningText: t("repeat_order.session_expired_warning")
      };
    }
    if (billRequested) {
      return {
        icon: "🔒", 
        text: t("repeat_order.bill_requested"),
        warningText: t("repeat_order.bill_requested_warning")
      };
    }
    return null;
  };

  const blockedMessage = getBlockedMessage();

  // Dacă toate comenzile sunt plătite, nu afișa componenta
  if (!hasUnpaidOrders) {
    return null;
  }

  if (loading) {
    return (
      <div className="repeat-order">
        <div className="repeat-order-header">
          <div className="repeat-order-header-left">
            <span className="repeat-order-title">
              {getTranslatedTitle()}{" "}
              {isTranslating && <span className="translating-indicator"> 🔄</span>}
            <FaHeart style={{ color: "orange", top: "3px", position: "relative" }} />
            </span>
            <small className="repeat-order-subtitle">
              {t("repeat_order.subtitle_loading")}
            </small>
          </div>
        </div>

        <div className="repeat-order-swiper-container">
          <div className="repeat-order-swiper-loading">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="repeat-product-card-medium-skeleton">
                <div className="repeat-product-image-medium-skeleton"></div>
                <div className="repeat-product-content-medium-skeleton">
                  <div className="repeat-product-name-medium-skeleton"></div>
                  <div className="repeat-product-meta-medium-skeleton">
                    <div className="repeat-product-price-medium-skeleton"></div>
                    <div className="repeat-product-date-medium-skeleton"></div>
                  </div>
                  <div className="repeat-product-actions-medium-skeleton">
                    <div className="quantity-selector-medium-skeleton"></div>
                    <div className="add-button-medium-skeleton"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hasOrders || recentOrders.length === 0 || uniqueProducts.length === 0) {
    return null;
  }

  return (
    <div className="repeat-order">
      <div className="repeat-order-header">
        <div className="repeat-order-header-left">
          <span className="repeat-order-title">
            {getTranslatedTitle()}{" "}
            {isTranslating && <span className="translating-indicator"> 🔄</span>}
            <FaHeart style={{ color: "orange", top: "3px", position: "relative" }} />
          </span>{" "}
          <small className="repeat-order-subtitle">
            {t("repeat_order.subtitle")}
          </small>
        </div>
      </div>

      <div className="repeat-order-swiper-container">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={1.8}
          loop={uniqueProducts.length > 3}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={600}
          pagination={{
            clickable: true,
            type: "bullets",
            el: ".swiper-pagination-medium",
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          breakpoints={{
            380: { slidesPerView: 2.0 },
            480: { slidesPerView: 2.3 },
            640: { slidesPerView: 2.8 },
            768: {
              slidesPerView: 3.3,
              spaceBetween: 18,
            },
            1024: {
              slidesPerView: 3.8,
              spaceBetween: 20,
            },
            1200: {
              slidesPerView: 4.3,
              spaceBetween: 20,
            },
            1400: {
              slidesPerView: 4.8,
              spaceBetween: 22,
            },
          }}
          className={`repeat-order-swiper-medium ${isDisabled ? 'bill-requested-swiper' : ''}`}
        >
          {uniqueProducts.map((item, index) => {
            const itemId = item.foodId || item._id;
            const quantity = quantities[itemId] || 1;
            const hasImageError = imageErrors[itemId];
            
            const foodItem = findFoodItem(item.baseFoodId);
            const priceInfo = foodItem ? getItemPriceWithDiscount(foodItem, item) : null;
            const hasDiscount = priceInfo?.hasDiscount;

            return (
              <SwiperSlide key={itemId || index}>
                <div className={`repeat-product-card-medium ${isDisabled ? 'bill-requested-card' : ''}`}>
                  <div className="repeat-product-image-section-medium">
                    <div className="repeat-product-image-container-medium">
                      {isDisabled && blockedMessage && (
                        <div className="repeat-product-bill-overlay">
                          <div className="repeat-product-bill-message">
                            <span className="repeat-product-bill-icon">{blockedMessage.icon}</span>
                            <span>{blockedMessage.text}</span>
                          </div>
                        </div>
                      )}
                      
                      {hasDiscount && !isDisabled && (
                        <div className="repeat-product-discount-badge">
                          -{priceInfo.discountPercentage}%
                        </div>
                      )}
                      
                      <img
                        src={hasImageError ? assets.image_coming_soon : `${url}/images/${item.image}`}
                        alt={getTranslatedProductName(item)}
                        className={`repeat-product-image-medium ${isDisabled ? 'disabled-image' : ''} ${hasImageError ? 'image-error-fallback' : ''}`}
                        onError={() => handleImageError(itemId)}
                      />
                    </div>
                  </div>

                  <div className="repeat-product-content-medium">
                    <div className="repeat-product-info-medium">
                      <h3 className={`repeat-product-name-medium ${isDisabled ? 'disabled-text' : ''}`}>
                        {getTranslatedProductName(item)}
                        {isTranslatingProducts && (
                          <span className="translating-indicator"> 🔄</span>
                        )}
                      </h3>

                      <div className="repeat-product-meta-medium">
                        {hasDiscount && !isDisabled ? (
                          <div className="repeat-product-price-discount-wrapper">
                            <span className="repeat-product-original-price">
                              {priceInfo.originalPrice.toFixed(2)} €
                            </span>
                            <span className="repeat-product-final-price">
                              {priceInfo.unitPrice.toFixed(2)} €
                            </span>
                          </div>
                        ) : (
                          <div className={`repeat-product-price-medium ${isDisabled ? 'disabled-text' : ''}`}>
                            {priceInfo ? priceInfo.unitPrice.toFixed(2) : item.price} €
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="repeat-product-actions-medium">
                      <div className={`quantity-selector-medium ${isDisabled ? 'disabled-controls' : ''}`}>
                        <button
                          className="qty-btn-medium qty-minus-medium"
                          onClick={() => handleQuantityChange(itemId, -1)}
                          disabled={isDisabled}
                        >
                          <FaMinus />
                        </button>
                        <span className="qty-value-medium">{quantity}</span>
                        <button
                          className="qty-btn-medium qty-plus-medium"
                          onClick={() => handleQuantityChange(itemId, 1)}
                          disabled={isDisabled}
                        >
                          <FaPlus />
                        </button>
                      </div>

                      <button
                        className={`repeat-add-btn-medium ${isDisabled ? 'repeat-add-btn-disabled' : ''}`}
                        onClick={() => handleRepeatSingleItem(item)}
                        title={isDisabled ? 
                          `${blockedMessage?.text} - ${t("repeat_order.cannot_add_items")}` : 
                          t("repeat_order.add_item_title", { quantity, name: getTranslatedProductName(item) })
                        }
                        data-item-id={itemId}
                        disabled={isDisabled}
                      >
                        {isDisabled ? getTranslatedDisabled() : getTranslatedAdd()}
                        {isTranslating && <span className="translating-indicator"> 🔄</span>}
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div className="swiper-pagination-medium"></div>
      </div>
    </div>
  );
};

export default RepeatOrder;