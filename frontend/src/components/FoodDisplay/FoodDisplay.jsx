import React, { useContext, useState, useEffect, useRef } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { useTranslation } from "react-i18next";
import { FaArrowRight, FaShoppingBag } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import FoodModal from "../FoodItem/FoodModal";
import { motion } from "framer-motion";
import FoodItemBestSeller from "../FoodItem/FoodItemBestSeller";
import { assets } from '../../assets/assets'

// ✅ Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const FoodDisplay = ({ category }) => {
  const { food_list, getTotalCartAmount, cartItems } = useContext(StoreContext);
  const navigate = useNavigate();
  
  // ✅ Funcția corectată pentru a calcula numărul total de produse din coș
  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((total, item) => {
      return total + (item.quantity || 0);
    }, 0);
  };

  const cartItemCount = getTotalCartItems();
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [groupedFood, setGroupedFood] = useState({});
  const [bestSellers, setBestSellers] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const lastScrollY = useRef(0);
  const swiperRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const { t } = useTranslation();

  // Funcție pentru placeholder-uri bazate pe categorie
const getFoodPlaceholder = (category) => {
  const placeholders = {
    'Pizza': '🍕',
    'Burger': '🍔', 
    'Salad': '🥗',
    'Pasta': '🍝',
    'Dessert': '🍰',
    'Drink': '🥤',
    'Soup': '🍲',
    'Breakfast': '🥞',
    'Asian': '🍜',
    'Mexican': '🌮'
  };
  
  const emoji = placeholders[category] || '🍽️';
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'><rect width='200' height='150' fill='%23f8f9fa'/><text x='100' y='75' font-family='Arial' font-size='40' text-anchor='middle' dominant-baseline='middle'>${emoji}</text></svg>`;
};

// Sau folosește acest URL pentru o imagine generică
const GENERIC_FOOD_PLACEHOLDER = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";
  // ✅ Funcție pentru a afișa butonul smooth
  const showFloatingButton = () => {
    setIsVisible(true);
  };

  // ✅ Funcție pentru a ascunde butonul smooth
  const hideFloatingButton = () => {
    setIsVisible(false);
  };

  // ✅ Gestionează afișarea/ascunderea pe baza produselor din coș
  useEffect(() => {
    if (cartItemCount > 0) {
      setShouldRender(true);
      // Mic delay pentru a permite render-ului să se actualizeze
      setTimeout(() => {
        showFloatingButton();
      }, 100);
    } else {
      hideFloatingButton();
      // Așteaptă ca animația să se termine înainte de a seta shouldRender pe false
      setTimeout(() => {
        setShouldRender(false);
      }, 400);
    }
  }, [cartItemCount]);

  // ✅ Scroll handler cu debounce pentru performanță
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Curăță timeout-ul anterior
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Setează un nou timeout pentru a evita prea multe actualizări
      scrollTimeoutRef.current = setTimeout(() => {
        if (currentScrollY < lastScrollY.current - 50 && shouldRender) {
          // scroll în sus cu cel puțin 50px - afișează butonul
          showFloatingButton();
        } else if (currentScrollY > lastScrollY.current + 50 && isVisible) {
          // scroll în jos cu cel puțin 50px - ascunde butonul
          hideFloatingButton();
        }

        lastScrollY.current = currentScrollY;
      }, 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [shouldRender, isVisible]);

  // ✅ Curăță timeout-urile la unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // ✅ Grupare categorii + best sellers
  useEffect(() => {
    if (food_list.length > 0) {
      const groups = food_list.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {});
      setGroupedFood(groups);

      const best = food_list.filter((item) => item.isBestSeller);
      setBestSellers(best);
    }
  }, [food_list]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="food-display" id="food-display">
        {bestSellers.length > 0 && (
          <>
            <div className="category-header">
              <div className="category-header-left">
                <span className="category-title">Best Sellers</span>
                <small className="category-subtitle">
                  Must-try favorites 🔥
                </small>
              </div>
              <Link to={`/category/All`} className="view-more">
                View more <FaArrowRight className="arrow-icon auto-bounce" />
              </Link>
            </div>

            <Swiper
              modules={[Autoplay]}
              spaceBetween={20}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              slidesPerView={1.4}
              loop={true}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              speed={800}
              breakpoints={{
                1024: { slidesPerView: 2.2 },
                768: { slidesPerView: 1.2 },
              }}
              className="best-sellers-slider"
            >
              {bestSellers.map((item) => (
                <SwiperSlide key={item._id}>
                  <div className="best-seller-item">
                    <FoodItemBestSeller
                      key={item._id}
                      {...item}
                      swiperRef={swiperRef}
                      openModal={(food) => {
                        setSelectedFood(food);
                        setIsModalOpen(true);
                      }}
                     
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </>
        )}

        {Object.keys(groupedFood).length > 0 &&
          Object.keys(groupedFood).map((cat) => {
            if (
              (category === "All" || category === cat) &&
              cat !== "Best Sellers"
            ) {
              return (
                <div key={cat}>
                  <div className="category-header">
                    <span className="category-title">{cat}</span>
                    <Link
                      to={`/category/${encodeURIComponent(cat)}`}
                      className="view-more"
                    >
                      View more{" "}
                      <FaArrowRight className="arrow-icon auto-bounce" />
                    </Link>
                  </div>
                  <div className="food-display-list">
                    {groupedFood[cat].map((item) => (
                      <FoodItem
                        key={item._id}
                        {...item}
                        openModal={(food) => {
                          setSelectedFood(food);
                          setIsModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })}

        {isModalOpen && selectedFood && (
          <FoodModal
            food={selectedFood}
            closeModal={() => setIsModalOpen(false)}
            isOpen={isModalOpen}
          />
        )}
      </div>

      {shouldRender && (
        <div
          className={`floating-cart-circle ${isVisible ? "visible" : ""}`}
          onClick={() => {
            navigate("/cart");
            window.scrollTo(0, 0);
          }}
          onMouseEnter={showFloatingButton}
        >
          <div className="cart-circle-content">
            <FaShoppingBag className="cart-icon" />
            <span className="cart-count-badge">{cartItemCount}</span>
          </div>
          <div className="cart-total-price">
            {getTotalCartAmount().toFixed(2)} €
          </div>
          <div className="cart-pulse-effect"></div>
        </div>
      )}
    </motion.div>
  );
};

export default FoodDisplay;