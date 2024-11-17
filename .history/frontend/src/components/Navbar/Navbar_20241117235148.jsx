import React, { useContext, useState, useRef, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import ModalCart from './ModalCart';
import WaiterModalCart from './WaiterModal';
import ModalMyOrders from './ModalMyOrders';
import axios from 'axios';
import { useTranslation } from 'react-i18next';


const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const { url, cartItems, food_list, getTotalCartAmount, token, setToken, tableNumber } = useContext(StoreContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const isWelcomePage = location.pathname === '/welcome';
  const [isModalMyOrdersOpen, setIsModalMyOrdersOpen] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);  // Variabila de stare pentru totalul de produse
  const { i18n } = useTranslation();

 // Funcția pentru schimbarea limbii
 const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
};

  // Scroll detection for fab-wrapper
  const [isVisible, setIsVisible] = useState(false);
  const fabRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.post(url + "/api/order/userOrders", {}, { headers: { token }, timeout: 5000 });

      // Verificăm dacă response.data și response.data.data sunt structuri valide
      if (response.data && Array.isArray(response.data.data)) {
        const total = response.data.data.reduce((sum, order) => {
          if (Array.isArray(order.items)) {
            return sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
          }
          return sum;
        }, 0);

        setTotalProducts(total); // Stocăm totalul în starea totalProducts
      } else {
        // Logăm structura invalidă
        console.error("Invalid data structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching orders", error);
    }
  };



  useEffect(() => {

    if (token) {
      fetchOrders();
    } else {
      console.log("Token not available");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting); // Setare stare la vizibilitate
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
  }, [token]);

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
    navigate('/cart');
    handleCloseModal();
    window.scrollTo(0, 0);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  return (
    <div className={`navbar ${isWelcomePage ? 'welcome-navbar' : ''}`}>
      {isWelcomePage ? (
        <img src={assets.logo7} alt="Logo" className="logo" />
      ) : (
        <Link to='/'>
          <img src={assets.logo7} alt="Logo" className="logo" />
        </Link>
      )}

      <ul className={`navbar-menu ${isWelcomePage ? 'hide-menu' : ''}`}>
        <Link to='/' onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>Home</Link>
        <a href='#explore-menu' onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>Menu</a>
        <a href='#footer' onClick={() => setMenu("contact-us")} className={menu === "contact-us" ? "active" : ""}>Contact us</a>
      </ul>

  {/* Secțiunea de schimbare limbă */}
  <div className="language-switcher">
        <div className="language-dropdown" onClick={toggleDropdown}>
          <span className="language-selected">
            {i18n.language === 'ro' ? (
              <>
                <img src={assets.roFlag} alt="RO" className="flag" />
                RO
              </>
            ) : (
              <>
                <img src={assets.usaFlag} alt="EN" className="flag" />
                EN
              </>
            )}
          </span>
          
          {/* Dropdown-ul cu opțiuni */}
          {isDropdownOpen && (
            <div className="dropdown-options">
              <div className="dropdown-option" onClick={() => { changeLanguage('ro'); toggleDropdown(); }}>
                <img src={assets.roFlag} alt="RO" className="flag" />
                RO
              </div>
              <div className="dropdown-option" onClick={() => { changeLanguage('en'); toggleDropdown(); }}>
                <img src={assets.usaFlag} alt="EN" className="flag" />
                EN
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`navbar-right ${isWelcomePage ? 'hide-menu' : ''}`}>

        <div className="navbar-waiter desktop" onClick={handleOpenWaiterModal}>
          <img src={assets.icon_waiter_blue} alt="Waiter Icon" />

        </div>
        <div className="navbar-cart desktop" onClick={handleOpenModal}>
          <img src={assets.basket_icon} alt="Cart Icon" />
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>
        <div className="navbar-myorders desktop" onClick={handleOpenModalMyOrders}>
          <img src={assets.profile_icon} alt="My Orders Icon" />
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>
        {!token ? <button onClick={() => setShowLogin(true)} hidden>Sign in</button>
          : <div className='navbar-profile'>
            {/* <img src={assets.profile_icon} alt="" /> */}
            <ul className='nav-profile-dropdown'>
              <li onClick={() => navigate('/myorders')}><img src={assets.bag_icon} alt="" />Orders</li>
              <hr hidden />
            </ul>
          </div>
        }
      </div>
      {!isWelcomePage && (

        <div className="mobile-footer mobile">
          <div className="mobile-footer-item" onClick={() => navigate('/')}>
            <img src={assets.menu3_png} alt="Menu Icon" />
            <span>Menu</span>
          </div>

          <div className={getTotalCartAmount() === 0 ? "mobile-footer-item" : "mobile-footer-item dot"} onClick={handleOpenModal}>
            <img src={getTotalCartAmount() === 0 ? assets.order_icon_phone : assets.order_icon_phone} alt="Order Icon" />
            {getTotalCartAmount() > 0 && <span className="dot"></span>} {/* Aici apare punctul roșu */}
            <span>Order</span>
          </div>
          <div className={getTotalCartAmount() === 0 && totalProducts === 0 ? "mobile-footer-item" : "mobile-footer-item dot"} onClick={handleOpenModalMyOrders}>
            <img src={assets.mobile_payment} alt="Pay Icon" />
            <span>Pay</span>
            {totalProducts > 0 && <div className="dotProducts">{totalProducts}</div>}
          </div>

          <div className="mobile-footer-item" onClick={handleOpenWaiterModal}>
            <img src={assets.restaurant_actions} alt="Actions Icon" />
            <span>Actions</span>
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
