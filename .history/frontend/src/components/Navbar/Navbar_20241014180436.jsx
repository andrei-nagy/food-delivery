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

      {/* FAB button with animated circles */}
      <div ref={fabRef} className={`fab-wrapper ${isVisible ? "visible" : ""}`}>
        {/* Cercurile animate */}
        <div className="fab-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
        
        <input id="fabCheckbox" type="checkbox" className="fab-checkbox" />
        <label className="fab" htmlFor="fabCheckbox">
          <span className="fab-plus">+</span>
        </label>
        <div className="fab-wheel">
          <div className="fab-action fab-action-1" onClick={handleOpenModal}>
            <span className="fab-tooltip">Cart</span>
            <img src={assets.basket_icon} alt="Cart Icon" />
            <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
          </div>
          <div className="fab-action fab-action-2" onClick={handleOpenWaiterModal}>
            <span className="fab-tooltip">Call a waiter</span>
            <img src={assets.icon_waiter_blue} alt="Waiter Icon" className='waiter-img' />
          </div>
        </div>
      </div>

      <div className="navbar-right">
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
      <div className="mobile-footer">
    <div className="mobile-footer-item" onClick={() => navigate('/')}>
      <img src={assets.menu_gif} alt="Menu Icon" />
      <span>Menu</span>
    </div>
    <div className={getTotalCartAmount() === 0 ? "mobile-footer-item" : "mobile-footer-item dot"} onClick={handleOpenModal}>
      <img  src={assets.order_gif} alt="Order Icon" />
      <span>Order</span>
    </div>
    <div className="mobile-footer-item" onClick={handleOpenWaiterModal}>
      <img src= {assets.actions_gif_orange} alt="Actions Icon" />
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
