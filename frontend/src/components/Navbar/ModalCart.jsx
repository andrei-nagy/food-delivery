import React, { useContext, useEffect, useState } from 'react';
import './ModalCart.css';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaTimes, FaMinus, FaPlus } from 'react-icons/fa';
import CartItem from '../CartItems/CartItems'; // presupunând că e în același folder
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';


const ModalCart = ({ show, onClose, cartItems, food_list, checkoutHandler }) => {
  const { url, removeFromCart, getTotalCartAmount, token, updateCartItemQuantity, removeItemCompletely } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const [totalAmount, setTotalAmount] = useState("0.00");
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Schimbă limba
  };

  const handleSwipe = {
  startX: 0,
  currentX: 0,
  threshold: 40, 
};
  const handleTouchStart = (e) => {
    handleSwipe.startX = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    handleSwipe.currentX = e.touches[0].clientX;
  };

  const handleTouchEnd = (itemId, e) => {
  const deltaX = handleSwipe.startX - handleSwipe.currentX;
  const elementWidth = e.target.offsetWidth;  // sau alt mod de a ajunge la container

  if (deltaX > elementWidth * 0.5) {  // 50% din lățimea elementului
    removeFromCart(itemId);
  }
};

  const fetchOrders = async () => {
    try {
      const response = await axios.post(url + "/api/order/userOrders", {}, { headers: { token } });
      if (response.data && response.data.data) {
        setOrders(response.data.data);
      } else {
        setOrders([]); // Default dacă nu primim date
      }
    } catch (error) {
      console.error("Error fetching orders", error);
      setOrders([]); // Default în caz de eroare
    }
  };



  useEffect(() => {
    if (!orders || orders.length === 0) {
      setTotalAmount("0.00");
      return;
    }

    const total = orders.reduce((sum, order) => {
      if (!order.items || !Array.isArray(order.items)) return sum;

      const orderTotal = order.items.reduce((itemSum, item) => {
        return itemSum + (item.price * item.quantity);
      }, 0);

      return sum + orderTotal;
    }, 0);

    setTotalAmount(total.toFixed(2));
  }, [orders]);

  useEffect(() => {
    fetchOrders();
  }, [token, url]);

  if (!show) return null;

  const isCartEmpty = Object.values(cartItems).every((count) => count === 0);

  const calculateTotal = () => {
    if (!orders || orders.length === 0) return "0.00";

    return orders.reduce((total, order) => {
      if (!order.items || !Array.isArray(order.items)) return total;

      const orderTotal = order.items.reduce((itemTotal, item) => {
        return itemTotal + (item.price * item.quantity);
      }, 0);

      return total + orderTotal;
    }, 0).toFixed(2);
  };

  const renderCartItems = () => {
    return (
      <AnimatePresence>
        {food_list.map((item) => {
          if (cartItems[item._id] > 0) {
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: "hidden" }}
                layout
              >
                <CartItem
                  item={item}
                  quantity={cartItems[item._id]}
                  removeFromCart={removeFromCart}
                  updateCartItemQuantity={updateCartItemQuantity}
                  removeItemCompletely={removeItemCompletely}
                  url={url}
                />
              </motion.div>
            );
          }
          return null;
        })}
      </AnimatePresence>
    );
  };



  return (
    <div className="modal-overlay-order" onClick={onClose}>
      <div className="modal-content-order" onClick={(e) => e.stopPropagation()}>
        <div className="header-orders">
          {isCartEmpty ? (
            <div className="menu-button-myorders" onClick={() => onClose()}>
              <span className='arrow-back-modal'><FaArrowLeft /></span>  <span className='back-text-button'>{t('back')}</span>
            </div>
          ) : (
            <div className="menu-button-myorders" onClick={() => { navigate('/'); onClose(); }}>
              <span className='arrow-back-modal'><FaArrowLeft /></span> <span className='back-text-button'>{t('view_menu')}</span>
            </div>
          )}
          <div className="close-menu-button-myorders" onClick={onClose}>
            <FaTimes />
          </div>
        </div>

        {isCartEmpty ? (
          <div className="empty-cart-message">
            <p>{t('no_items')}</p>
             <Link to={`/category/All`} >
            <button className="view-menu-button" onClick={() => {onClose(); }}>
              {t('view_menu')}
            </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {renderCartItems()}
            </div>

            <div className='checkout-section-orders'>
              <div className="cart-total-details">
                <b>Total</b>
                <b>{getTotalCartAmount() === 0 ? '0.00' : getTotalCartAmount().toFixed(2)} €</b>
              </div>
              <button className="checkout-button-orders" onClick={checkoutHandler}>
                {t('total_order')} {getTotalCartAmount() === 0 ? '0.00' : getTotalCartAmount().toFixed(2)}€
              </button>
              <button className="actual-bill-button-orders" onClick={checkoutHandler} disabled={true}>
                {t('actual_bill')}: {totalAmount}€
              </button>
              <div className="payment-options">
                <img src={assets.visa_logo} alt="Visa" className="payment-option" />
                <img src={assets.mastercard_logo} alt="Mastercard" className="payment-option" />
                <img src={assets.apple_pay} alt="Apple Pay" className="payment-option" />
                <img src={assets.google_pay} alt="Google Pay" className="payment-option" />
              </div>
              <p className="payment-security-note">
                Secured payments powered by
                <img src={assets.stripe_logo} alt="Stripe Logo" className="stripe-logo" />
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModalCart;
