import React, { useContext, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import ModalCart from './ModalCart';

const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState("home");

  const { cartItems, food_list, getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const [isModalOpen, setIsModalOpen] = useState(false); // State pentru modal

  // Funcția de deschidere a modalului
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Funcția de închidere a modalului
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  }
  return (
    <div className='navbar'>
      <Link to='/'><img src={assets.logo} alt="" className="logo" /></Link>
      <ul className="navbar-menu">
        <Link to='/' onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>Home</Link>
        <a href='#explore-menu' onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>Menu</a>
        <a href='#app-download' onClick={() => setMenu("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>Mobile-app</a>
        <a href='#footer' onClick={() => setMenu("contact-us")} className={menu === "contact-us" ? "active" : ""}>Contact us</a>
      </ul>
      <div className="navbar-right">
        <img src={assets.search_icon} alt="" />
        <div className="navbar-search-icon" onClick={handleOpenModal}>
          <img src={assets.basket_icon} alt="Cart Icon" />
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}>
          </div>
            
      <ModalCart
        show={isModalOpen}
        onClose={handleCloseModal}
        cartItems={cartItems}
        food_list={food_list}
      />
        </div>
        {!token ? <button onClick={() => setShowLogin(true)}>Sign in</button>
          : <div className='navbar-profile'>
            <img src={assets.profile_icon} alt="" />
            <ul className='nav-profile-dropdown'>
              <li onClick={() => navigate('/myorders')}><img src={assets.bag_icon} alt="" />Orders</li>
              <hr />
              <li onClick={logout}><img src={assets.logout_icon} alt="" />Logout</li>
            </ul>
          </div>
        }

      </div>
    </div>
  )
}

export default Navbar