import React, { useContext, useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { useLanguage } from "../../context/LanguageContext";
import ModalCart from "./ModalCart";
import WaiterModalCart from "./WaiterModal";
import ModalMyOrders from "./ModalMyOrders";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ setShowLogin }) => {
  const location = useLocation();
  const isWelcomePage  = location.pathname === "/welcome";
  const isCartPage     = location.pathname === "/cart";
  const isHomePage     = location.pathname === "/";
  const isMenuPage     = location.pathname === "/category/All";
  const isMyOrdersPage = location.pathname === "/myorders";

  const [menu, setMenu] = useState(() => {
    if (location.pathname === "/") {
      if (location.hash === "#footer")       return "contact-us";
      if (location.hash === "#explore-menu") return "menu";
      return "home";
    }
    if (location.pathname === "/category/All" || location.pathname.includes("/category/"))
      return "menu";
    return "home";
  });

  const {
    url, cartItems, food_list,
    getTotalCartAmount, token, setToken, tableNumber,
  } = useContext(StoreContext);

  const [isModalOpen,         setIsModalOpen]         = useState(false);
  const [isWaiterModalOpen,   setIsWaiterModalOpen]   = useState(false);
  const [isModalMyOrdersOpen, setIsModalMyOrdersOpen] = useState(false);
  const [totalProducts,       setTotalProducts]       = useState(0);
  const [isDropdownOpen,      setIsDropdownOpen]      = useState(false);

  const { t, i18n }                             = useTranslation();
  const { currentLanguage, setCurrentLanguage } = useLanguage();

  const languageConfig = {
    en: { flag: assets.usaFlag, code: "EN", name: "English" },
    fr: { flag: assets.frFlag,  code: "FR", name: "Français" },
    es: { flag: assets.esFlag,  code: "ES", name: "Español" },
    it: { flag: assets.itFlag,  code: "IT", name: "Italiano" },
    ro: { flag: assets.roFlag,  code: "RO", name: "Română" },
    de: { flag: assets.deFlag,  code: "DE", name: "Deutsch" },
  };
  const currentLang = languageConfig[i18n.language] || languageConfig.en;

  useEffect(() => {
    const path = location.pathname;
    const hash = location.hash;
    if (path === "/") {
      if (hash === "#footer")            setMenu("contact-us");
      else if (hash === "#explore-menu") setMenu("menu");
      else                               setMenu("home");
    } else if (path === "/category/All" || path.includes("/category/")) {
      setMenu("menu");
    }
  }, [location.pathname, location.hash]);

  const fabRef   = useRef(null);
  const navigate = useNavigate();

  const getTotalCartItems = () =>
    Object.values(cartItems).reduce((total, item) => total + (item.quantity || 0), 0);

  const getDotClass = (count) => {
    if (count === 0)               return "dot zero";
    if (count > 9 && count <= 99)  return "dot large-number";
    if (count > 99)                return "dot xlarge-number";
    return "dot";
  };

  const handleCartNavigate = () => {
    if (getTotalCartItems() === 0) navigate("/category/All");
    else navigate("/cart");
    window.scrollTo(0, 0);
  };

  /* ─── isItemFullyPaid — identic cu MyOrders ─── */
  const isItemFullyPaid = (item) => {
    if (item.status === "fully_paid") return true;
    if (item.paidBy?.length > 0) {
      const totalPaid = item.paidBy.reduce((sum, p) => sum + (p.amount || 0), 0);
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      return Math.abs(totalPaid - itemTotal) < 0.01 || totalPaid >= itemTotal;
    }
    return false;
  };

  /* ─── fetchOrders — extrasă ca funcție stabilă cu useRef ─── */
  const fetchOrdersRef = useRef(null);
  fetchOrdersRef.current = async () => {
    if (!token) return;
    try {
      const res = await axios.post(
        url + "/api/order/userOrders", {},
        { headers: { token }, timeout: 5000 }
      );
      const orders = res.data?.data || [];

      const total = orders
        .filter(o => o.payment === false || o.payment === null || o.payment === undefined)
        .reduce((sum, order) => {
          const unpaidQty = (order.items || [])
            .filter(item => !isItemFullyPaid(item))
            .reduce((s, item) => s + (item.quantity || 1), 0);
          return sum + unpaidQty;
        }, 0);

      setTotalProducts(total);
    } catch (e) {
      console.error("fetchOrders error:", e);
    }
  };

  /* ─── Rulează la mount și când se schimbă token ─── */
  useEffect(() => {
    if (token) fetchOrdersRef.current();

    const observer = new IntersectionObserver(() => {}, { threshold: 0.1 });
    if (fabRef.current) observer.observe(fabRef.current);
    return () => { if (fabRef.current) observer.unobserve(fabRef.current); };
  }, [token]);

  /* ─── FIX: re-fetch imediat după plasarea comenzii ─── */
  useEffect(() => {
    const handleOrderPlaced = () => {
      // mic delay ca serverul să proceseze comanda
      setTimeout(() => fetchOrdersRef.current?.(), 800);
    };
    window.addEventListener("order:placed", handleOrderPlaced);
    return () => window.removeEventListener("order:placed", handleOrderPlaced);
  }, []);

  const handleCheckout = () => {
    navigate("/cart");
    setIsModalOpen(false);
    window.scrollTo(0, 0);
  };

  /* ── SVG icons ── */
  const IconHome = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
      <polyline points="9 21 9 12 15 12 15 21"/>
    </svg>
  );

  const IconMenu = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  );

  const IconCart = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );

  const IconPay = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
      <line x1="6" y1="15" x2="10" y2="15"/>
    </svg>
  );

  const IconAI = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a9 9 0 0 1 9 9c0 3.18-1.65 5.97-4.13 7.59L17 21H7l.13-2.41A9 9 0 0 1 3 11a9 9 0 0 1 9-9z"/>
      <line x1="9" y1="11" x2="9.01" y2="11"/>
      <line x1="12" y1="11" x2="12.01" y2="11"/>
      <line x1="15" y1="11" x2="15.01" y2="11"/>
    </svg>
  );

  const renderFooter = () => {
    if (isWelcomePage || isMyOrdersPage || isCartPage) return null;

    return (
      <div className="mf-v2">

        {/* Home */}
        <div
          className={`mf-v2-item${isHomePage ? ' active' : ''}`}
          onClick={() => navigate('/')}
        >
          <div className="mf-v2-ico">
            <IconHome />
            <div className="mf-v2-dot"></div>
          </div>
          <span className="mf-v2-lbl">{t('home_navbar')}</span>
        </div>

        {/* Meniu */}
        <div
          className={`mf-v2-item${isMenuPage ? ' active' : ''}`}
          onClick={() => { navigate('/category/All'); window.scrollTo(0, 0); }}
        >
          <div className="mf-v2-ico">
            <IconMenu />
            <div className="mf-v2-dot"></div>
          </div>
          <span className="mf-v2-lbl">{t('menu')}</span>
        </div>

        {/* Comandă */}
        <div
          className={`mf-v2-item mf-v2-order${isCartPage ? ' active' : ''}`}
          onClick={handleCartNavigate}
        >
          <div className="mf-v2-ring" style={{ position: 'relative' }}>
            <IconCart />
            {getTotalCartItems() > 0 && (
              <span className="mf-badge" style={{ top: '-6px', right: '-6px' }}>
                {getTotalCartItems()}
              </span>
            )}
          </div>
          <span className="mf-v2-lbl">
            {getTotalCartItems() === 0 ? t('menu') : t('view_order')}
          </span>
        </div>

        {/* Plată */}
        <div
          className={`mf-v2-item${isMyOrdersPage ? ' active' : ''}`}
          onClick={() => { navigate('/myorders'); window.scrollTo(0, 0); }}
        >
          <div className="mf-v2-ico" style={{ position: 'relative' }}>
            <IconPay />
            <div className="mf-v2-dot"></div>
            {totalProducts > 0 && (
              <span className="mf-badge mf-badge--teal" style={{ top: '-6px', right: '-8px' }}>
                {totalProducts}
              </span>
            )}
          </div>
          <span className="mf-v2-lbl">{t('pay')}</span>
        </div>

        {/* Acțiuni / Waiter */}
        <div
          className="mf-v2-item"
          onClick={() => setIsWaiterModalOpen(true)}
        >
          <div className="mf-v2-ico">
            <IconAI />
            <div className="mf-v2-dot"></div>
          </div>
          <span className="mf-v2-lbl">{t('actions')}</span>
        </div>

      </div>
    );
  };

  return (
    <div className={`navbar ${isWelcomePage ? 'welcome-navbar' : ''}`}>

      {isWelcomePage ? (
        <img src={assets.mainLogo} alt="Logo" className="logo" />
      ) : (
        <Link to="/"><img src={assets.mainLogo} alt="Logo" className="logo" /></Link>
      )}

      <ul className={`navbar-menu ${isWelcomePage ? 'hide-menu' : ''}`}>
        <Link to="/" onClick={() => setMenu('home')} className={menu === 'home' ? 'active' : ''}>
          {t('home_navbar')}
        </Link>
        <Link to="/category/All" onClick={() => setMenu('menu')} className={menu === 'menu' ? 'active' : ''}>
          {t('menu_navbar')}
        </Link>
      </ul>

      <div className={`navbar-right ${isWelcomePage ? 'hide-menu' : ''}`}>
        <div className="navbar-waiter desktop" onClick={() => setIsWaiterModalOpen(true)}>
          <img src={assets.icon_waiter_blue} alt="Waiter Icon" />
        </div>
        <div className="navbar-cart desktop" onClick={handleCartNavigate}>
          <img src={assets.basket_icon} alt="Cart Icon" />
          <div className={getDotClass(getTotalCartItems())}>
            {getTotalCartItems() > 0 && getTotalCartItems()}
          </div>
        </div>
        <div className="navbar-myorders desktop" onClick={() => setIsModalMyOrdersOpen(true)}>
          <img src={assets.profile_icon} alt="My Orders Icon" />
        </div>
        {!token ? (
          <button onClick={() => setShowLogin(true)} hidden>Sign in</button>
        ) : (
          <div className="navbar-profile">
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate('/myorders')}>
                <img src={assets.bag_icon} alt="" />Orders
              </li>
              <hr hidden />
            </ul>
          </div>
        )}
        <div className="language-switcher">
          <div className="language-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <span className="language-selected">
              <img src={currentLang.flag} alt={currentLang.code} className="flag" />
              {currentLang.code}
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
                      className={`dropdown-option${i18n.language === code ? ' active' : ''}`}
                      onClick={() => { setCurrentLanguage(code); setIsDropdownOpen(false); }}
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

      {renderFooter()}

      <ModalCart
        show={isModalOpen} onClose={() => setIsModalOpen(false)}
        cartItems={cartItems} food_list={food_list} checkoutHandler={handleCheckout}
      />
      <ModalMyOrders
        show={isModalMyOrdersOpen} onClose={() => setIsModalMyOrdersOpen(false)}
        cartItems={cartItems} food_list={food_list} checkoutHandler={handleCheckout}
      />
      <WaiterModalCart show={isWaiterModalOpen} onClose={() => setIsWaiterModalOpen(false)} />
    </div>
  );
};

export default Navbar;