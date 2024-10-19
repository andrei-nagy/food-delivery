import React, { useContext, useState, useRef, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import ModalCart from './ModalCart';
import WaiterModalCart from './WaiterModal';

const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState("home");
  const { cartItems, food_list, getTotalCartAmount, token, setToken, tableNumber } = useContext(StoreContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);

  // Scroll detection for fab-wrapper
  const [isVisible, setIsVisible] = useState(false);
  const fabRef = useRef(null);

  useEffect(() => {
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
  }, []);

  const handleOpenWaiterModal = () => {
    setIsWaiterModalOpen(true);
  };

  const handleCloseWaiterModal = () => {
    setIsWaiterModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
    <div className="navbar">
      <Link to='/'><img src={assets.logo7} alt="" className="logo" /></Link>
      <ul className="navbar-menu">
        <Link to='/' onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>Home</Link>
        <a href='#explore-menu' onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>Menu</a>
        <a href='#footer' onClick={() => setMenu("contact-us")} className={menu === "contact-us" ? "active" : ""}>Contact us</a>
      </ul>

  

      <div className="navbar-right">
    
        <div className="navbar-waiter desktop" onClick={handleOpenWaiterModal}>
          <img src={assets.icon_waiter_blue} alt="Waiter Icon" />

        </div>
        <div className="navbar-cart desktop" onClick={handleOpenModal}>
          <img src={assets.basket_icon} alt="Cart Icon" />
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>
        {!token ? <button onClick={() => setShowLogin(true)} hidden>Sign in</button>
          : <div className='navbar-profile'>
            <img src={assets.profile_icon} alt="" />
            <ul className='nav-profile-dropdown'>
              <li onClick={() => navigate('/myorders')}><img src={assets.bag_icon} alt="" />Orders</li>
              <hr hidden />
            </ul>
          </div>
        }
      </div>
      <div className="mobile-footer mobile">
    <div className="mobile-footer-item" onClick={() => navigate('/')}>
      <img src={assets.menu_png} alt="Menu Icon" />
      <span>Menu</span>
    </div>
    
    <div className={getTotalCartAmount() === 0 ? "mobile-footer-item" : "mobile-footer-item dot"} onClick={handleOpenModal}>
  <img src={getTotalCartAmount() === 0 ? assets.cart_black_png : assets.cart_orange_full_v2} alt="Order Icon" />
  {getTotalCartAmount() > 0 && <span className="dot"></span>} {/* Aici apare punctul roșu */}
  <span>Order</span>
</div>

    <div className="mobile-footer-item" onClick={handleOpenWaiterModal}>
      <img src= {assets.actions_png} alt="Actions Icon" />
      <span>Actions</span>
    </div>
  </div>
      <ModalCart
        show={isModalOpen}
        onClose={handleCloseModal}
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
