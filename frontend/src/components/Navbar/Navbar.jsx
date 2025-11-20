import React, { useContext, useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import ModalCart from "./ModalCart";
import WaiterModalCart from "./WaiterModal";
import ModalMyOrders from "./ModalMyOrders";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ setShowLogin }) => {
  const location = useLocation();
  const isWelcomePage = location.pathname === "/welcome";
  const isCartPage = location.pathname === "/cart";
  const isHomePage = location.pathname === "/";
  const isMenuPage = location.pathname === "/category/All";
  const isMyOrdersPage = location.pathname === "/myorders";

  // 🔥 STARE INIȚIALĂ DIRECTĂ
  const [menu, setMenu] = useState(() => {
    if (location.pathname === "/") {
      if (location.hash === "#footer") return "contact-us";
      if (location.hash === "#explore-menu") return "menu";
      return "home";
    } else if (location.pathname === "/category/All" || location.pathname.includes("/category/")) {
      return "menu";
    }
    return "home";
  });

  const {
    url,
    cartItems,
    food_list,
    getTotalCartAmount,
    token,
    setToken,
    tableNumber,
  } = useContext(StoreContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isModalMyOrdersOpen, setIsModalMyOrdersOpen] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation();

  // 🔥 CONFIGURAȚIE LIMBI
  const languageConfig = {
    en: { flag: assets.usaFlag, code: "EN", name: "English" },
    fr: { flag: assets.frFlag, code: "FR", name: "Français" },
    es: { flag: assets.esFlag, code: "ES", name: "Español" },
    it: { flag: assets.itFlag, code: "IT", name: "Italiano" },
    de: { flag: assets.deFlag, code: "DE", name: "Deutsch" },
    ro: { flag: assets.roFlag, code: "RO", name: "Română" }

  };

  const currentLang = languageConfig[i18n.language] || languageConfig.en;

  // 🔥 ACTUALIZEAZĂ STARE CÂND SE SCHIMBĂ URL-UL
  useEffect(() => {
    const path = location.pathname;
    const hash = location.hash;
    
    if (path === "/") {
      if (hash === "#footer") {
        setMenu("contact-us");
      } else if (hash === "#explore-menu") {
        setMenu("menu");
      } else {
        setMenu("home");
      }
    } else if (path === "/category/All" || path.includes("/category/")) {
      setMenu("menu");
    }
  }, [location.pathname, location.hash]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    sessionStorage.setItem("language", lng);
    setIsDropdownOpen(false);
  };

  const [isVisible, setIsVisible] = useState(false);
  const fabRef = useRef(null);

  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((total, item) => {
      return total + (item.quantity || 0);
    }, 0);
  };

  const getDotClass = (count) => {
    if (count === 0) return "dot zero";
    if (count > 9 && count <= 99) return "dot large-number";
    if (count > 99) return "dot xlarge-number";
    return "dot";
  };

  const getDotProductsClass = (count) => {
    if (count === 0) return "dotProducts empty";
    if (count > 9 && count <= 99) return "dotProducts large-number";
    if (count > 99) return "dotProducts xlarge-number";
    return "dotProducts";
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/userOrders",
        {},
        { headers: { token }, timeout: 5000 }
      );

      const unpaidOrders = response.data.data.filter((order) => !order.payment);

      if (response.data && Array.isArray(response.data.data)) {
        const total = unpaidOrders.reduce((sum, order) => {
          if (Array.isArray(order.items)) {
            return (
              sum +
              order.items.reduce(
                (itemSum, item) => itemSum + (item.quantity || 0),
                0
              )
            );
          }
          return sum;
        }, 0);

        setTotalProducts(total);
      }
    } catch (error) {
      // console.error("Error fetching orders", error);
    }
  };

  useEffect(() => {
    const savedLanguage = sessionStorage.getItem("language");
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }

    if (token) {
      fetchOrders();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (fabRef.current) {
      observer.observe(fabRef.current);
    }

    return () => {
      if (fabRef.current) {
        observer.unobserve(fabRef.current);
      }
    };
  }, [token, i18n]);

  const handleOpenWaiterModal = () => {
    setIsWaiterModalOpen(true);
  };

  const handleCloseWaiterModal = () => {
    setIsWaiterModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleOpenModalMyOrders = () => {
    setIsModalMyOrdersOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseModalMyOrders = () => {
    setIsModalMyOrdersOpen(false);
  };

  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/cart");
    handleCloseModal();
    window.scrollTo(0, 0);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  // Funcții pentru navigare cu scroll
  const scrollToSection = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className={`navbar ${isWelcomePage ? "welcome-navbar" : ""}`}>
      {isWelcomePage ? (
        <img src={assets.mainLogo} alt="Logo" className="logo" />
      ) : (
        <Link to="/">
          <img src={assets.mainLogo} alt="Logo" className="logo" />
        </Link>
      )}

      <ul className={`navbar-menu ${isWelcomePage ? "hide-menu" : ""}`}>
        <Link
          to="/"
          onClick={() => setMenu("home")}
          className={menu === "home" ? "active" : ""}
        >
          {t("home_navbar")}
        </Link>
        <Link
          to="/category/All"
          onClick={() => setMenu("menu")}
          className={menu === "menu" ? "active" : ""}
        >
          {t("menu_navbar")}
        </Link>
      </ul>

      <div className={`navbar-right ${isWelcomePage ? "hide-menu" : ""}`}>
        <div className="navbar-waiter desktop" onClick={handleOpenWaiterModal}>
          <img src={assets.icon_waiter_blue} alt="Waiter Icon" />
        </div>

        <div className="navbar-cart desktop" onClick={() => navigate("/cart")}>
          <img src={assets.basket_icon} alt="Cart Icon" />
          <div className={getDotClass(getTotalCartItems())}>
            {getTotalCartItems() > 0 && getTotalCartItems()}
          </div>
        </div>

        <div
          className="navbar-myorders desktop"
          onClick={handleOpenModalMyOrders}
        >
          <img src={assets.profile_icon} alt="My Orders Icon" />
          <div className={getTotalCartItems() === 0 ? "" : "dot"}></div>
        </div>

        {!token ? (
          <button onClick={() => setShowLogin(true)} hidden>
            Sign in
          </button>
        ) : (
          <div className="navbar-profile">
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate("/myorders")}>
                <img src={assets.bag_icon} alt="" />
                Orders
              </li>
              <hr hidden />
            </ul>
          </div>
        )}

        <div className="language-switcher">
          <div className="language-dropdown" onClick={toggleDropdown}>
            <span className="language-selected">
              <img src={currentLang.flag} alt={currentLang.code} className="flag" />
              {currentLang.code}
              {/* <img
                className={`arrow_down_language ${
                  isDropdownOpen ? "rotated" : ""
                }`}
                src={assets.arrow_down}
                alt="arrow"
              /> */}
            </span>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  className="dropdown-options"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  {Object.entries(languageConfig).map(([code, lang]) => (
                    <div
                      key={code}
                      className={`dropdown-option ${
                        i18n.language === code ? "active" : ""
                      }`}
                      onClick={() => changeLanguage(code)}
                    >
                      <img src={lang.flag} alt={lang.code} className="flag" />
                      {lang.code}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {!isWelcomePage && (
        <div className="mobile-footer mobile">
          <div className="mobile-footer-item" onClick={() => navigate("/")}>
            <img
              src={
                isHomePage ? assets.new_home_selected : assets.new_home_normal
              }
              alt="Home Icon"
            />
            <span> {t("home_navbar")}</span>
          </div>

          <div
            className="mobile-footer-item"
            onClick={() => {
              navigate("/category/All");
              window.scrollTo(0, 0);
            }}
          >
            <img
              src={
                isMenuPage ? assets.new_menu_selected : assets.new_menu_normal
              }
              alt="Menu Icon"
              className="navbar-menu-icon"
            />
            <span> {t("menu")}</span>
          </div>

          <div
            className={
              getTotalCartItems() === 0
                ? "mobile-footer-item"
                : "mobile-footer-item dot"
            }
            onClick={() => {
              navigate("/cart");
              window.scrollTo(0, 0);
            }}
          >
            <img
              src={
                isCartPage ? assets.new_cart_selected : assets.new_cart_normal
              }
              alt="Order Icon"
              className="navbar-order-icon"
            />
            <div className={getDotClass(getTotalCartItems())}>
              {getTotalCartItems() > 0 && getTotalCartItems()}
            </div>
            <span> {t("view_order")}</span>
          </div>

          <div
            className={
              getTotalCartItems() === 0 && totalProducts === 0
                ? "mobile-footer-item"
                : "mobile-footer-item dot"
            }
            onClick={() => {
              navigate("/myorders");
              window.scrollTo(0, 0);
            }}
          >
            <img
              src={
                isMyOrdersPage ? assets.new_pay_selected : assets.new_pay_normal
              }
              alt="Pay Icon"
              className="navbar-pay-icon"
            />
            <span> {t("pay")}</span>
            <div className={getDotProductsClass(totalProducts)}>
              {totalProducts > 0 && totalProducts}
            </div>
          </div>

          <div className="mobile-footer-item" onClick={handleOpenWaiterModal}>
            <img src={assets.new_ai} alt="Actions Icon" />
            <span> {t("actions")}</span>
          </div>
        </div>
      )}

      <ModalCart
        show={isModalOpen}
        onClose={handleCloseModal}
        cartItems={cartItems}
        food_list={food_list}
        checkoutHandler={handleCheckout}
      />
      <ModalMyOrders
        show={isModalMyOrdersOpen}
        onClose={handleCloseModalMyOrders}
        cartItems={cartItems}
        food_list={food_list}
        checkoutHandler={handleCheckout}
      />
      <WaiterModalCart
        show={isWaiterModalOpen}
        onClose={handleCloseWaiterModal}
      />
    </div>
  );
};

export default Navbar;