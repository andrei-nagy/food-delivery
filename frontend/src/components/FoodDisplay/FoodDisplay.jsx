import React, { useContext, useState, useEffect } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { useTranslation } from "react-i18next";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import FoodModal from "../FoodItem/FoodModal"; // ✅ nou
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FoodItemBestSeller from "../FoodItem/FoodItemBestSeller";

const FoodDisplay = ({ category }) => {
  const { food_list, getTotalCartAmount, cartItems } = useContext(StoreContext);
  const navigate = useNavigate();
  const cartItemCount = Object.values(cartItems).reduce((a, b) => a + b, 0);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { t, i18n } = useTranslation();

  const [groupedFood, setGroupedFood] = useState({});
  const [bestSellers, setBestSellers] = useState([]);

  // ✅ pentru modal global
  const [selectedFood, setSelectedFood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
const [lastScrollY, setLastScrollY] = useState(window.scrollY);
const [lastCartChange, setLastCartChange] = useState(Date.now());

useEffect(() => {
  if (cartItemCount > 0) {
    setShouldRender(true);
    setIsVisible(true);
    setLastCartChange(Date.now());

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000); // dispare după 4 secunde

    return () => clearTimeout(timer);
  } else {
    setShouldRender(false);
  }
}, [cartItemCount]);
useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY < lastScrollY) {
      // Scroll UP → arată butonul
      if (cartItemCount > 0) {
        setIsVisible(true);
      }
    } else if (currentScrollY > lastScrollY) {
      // Scroll DOWN → ascunde butonul
      setIsVisible(false);
    }

    setLastScrollY(currentScrollY);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [lastScrollY, cartItemCount]);

  useEffect(() => {
    if (cartItemCount > 0 && !isModalOpen) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 200);
    }
  }, [cartItemCount, isModalOpen]);

  useEffect(() => {
    const groupByCategory = () => {
      const groups = food_list.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {});
      setGroupedFood(groups);
    };

    const extractBestSellers = () => {
      const best = food_list.filter((item) => item.isBestSeller);
      setBestSellers(best);
    };

    if (food_list.length > 0) {
      groupByCategory();
      extractBestSellers();
    }
  }, [food_list]);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 1000,
    autoplay: true,
    autoplaySpeed: 3500,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: false,
    adaptiveHeight: false,
  variableWidth: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

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

            {bestSellers.length > 0 && (
  <Slider key={bestSellers.length} {...sliderSettings} className="best-sellers-slider">
    {bestSellers.map((item) => (
      <div key={item._id} className="best-seller-item">
        <FoodItemBestSeller
          {...item}
          openModal={(food) => {
            setSelectedFood(food);
            setIsModalOpen(true);
          }}
        />
      </div>
    ))}
  </Slider>
)}

          </>
        )}

        {Object.keys(groupedFood).length > 0 ? (
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
                    {groupedFood[cat].map((item, index) => (
                      <FoodItem
                        key={item._id}
                        id={item._id}
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
          })
        ) : (
          <p>No food found.</p>
        )}

        {/* ✅ Modal Global */}
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
