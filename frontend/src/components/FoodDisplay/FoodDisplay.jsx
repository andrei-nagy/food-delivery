// ❌ eliminăm importurile slick
import React, { useContext, useState, useEffect, useRef } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { useTranslation } from "react-i18next";
import { FaArrowRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import FoodModal from "../FoodItem/FoodModal";
import { motion } from "framer-motion";
import FoodItemBestSeller from "../FoodItem/FoodItemBestSeller";

// ✅ Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const FoodDisplay = ({ category }) => {
  const { food_list, getTotalCartAmount, cartItems } = useContext(StoreContext);
  const navigate = useNavigate();
  const cartItemCount = Object.values(cartItems).reduce((a, b) => a + b, 0);

  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [groupedFood, setGroupedFood] = useState({});
  const [bestSellers, setBestSellers] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(window.scrollY);

  const swiperRef = useRef(null);

  const { t } = useTranslation();

  // ✅ Buton floating
  useEffect(() => {
    if (cartItemCount > 0) {
      setShouldRender(true);
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 4000);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(false);
    }
  }, [cartItemCount]);

  // ✅ Scroll handler floating button
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY && cartItemCount > 0) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, cartItemCount]);

  // ✅ Grupare categorii și Best Sellers
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
              autoplay={{ delay: 4000, disableOnInteraction: false }}
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
                      swiperRef={swiperRef} // 🔑 transmitem swiperRef
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
          />
        )}
      </div>

      {shouldRender && (
        <div
          className={`floating-checkout-home ${isVisible ? "visible" : ""}`}
          onClick={() => {
            navigate("/cart");
            window.scrollTo(0, 0);
          }}
        >
          <div className="floating-checkout-left column">
            <span className="floating-checkout-count">{cartItemCount}</span>
            <span className="floating-checkout-cta">View Order</span>
            <span className="floating-checkout-total">
              {getTotalCartAmount().toFixed(2)} €
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FoodDisplay;
