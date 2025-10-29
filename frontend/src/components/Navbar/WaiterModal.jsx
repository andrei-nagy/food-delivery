import React, { useContext, useState } from 'react';
import './WaiterModal.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaTimes, FaComments, FaMoneyBillWave, FaCreditCard, FaMoneyBill } from 'react-icons/fa';
import ChatBot from '../ChatBot/ChatBot';

const WaiterModalCart = ({ show, onClose }) => {
  const { url, setToken, token } = useContext(StoreContext);
  const [actionName, setActionName] = useState('');
  const [showDianaAI, setShowDianaAI] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false); // Stare pentru opțiunile de plată
  const tableNumber = localStorage.getItem("tableNumber");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  if (!show) return null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tableNumber");
    setToken("");
    navigate("/");
    window.location.reload();
  };

  const submitAction = async (action) => {
    try {
      const response = await axios.post(`${url}/api/waiterorders/add`, {
        action: action,
        tableNo: tableNumber,
      });

      if (response.data.success) {
        setActionName('');
        
        if (action === 'Ask Diana AI') {
          setShowDianaAI(true);
        } else {
          onClose();
          toast.success(response.data.message);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleActionClick = (action) => {
    if (action === 'I want to pay') {
      // Arată opțiunile de plată în loc să trimită direct
      setShowPaymentOptions(true);
    } else {
      setActionName(action);
      submitAction(action);
    }
  };

  const handlePaymentMethod = (paymentMethod) => {
    let action = '';
    if (paymentMethod === 'card') {
      action = 'Card payment';
    } else if (paymentMethod === 'cash') {
      action = 'Cash payment';
    }
    
    setActionName(action);
    submitAction(action);
    setShowPaymentOptions(false); // Închide modalul de opțiuni de plată
  };

  return (
    <>
      {/* Modalul principal */}
      <div className="modal-overlay-waiter" onClick={onClose}>
        <div className="modal-content-waiter" onClick={(e) => e.stopPropagation()}>
          <div className="header-myorders">
            <div className="menu-button-myorders" onClick={() => onClose()}>
              <FaArrowLeft />
            </div>
            <h2 className="modal-title">Assistant</h2>
            <div className="close-menu-button-myorders" onClick={onClose}>
              <FaTimes />
            </div>
          </div>

          <div className="assistance-message">
            <p>{t('can_we_assist')}</p>
          </div>

          <div className="action-buttons">
            <button type="button" className="action-btn call-waiter" onClick={() => handleActionClick('Call a waiter')}>
              <div className="action-icon-wrapper">
                <img className='waiter-icon-actions' src={assets.waiter_icon} alt="" />
              </div>
              <span className="action-label">{t('call_waiter')}</span>
            </button>
            
            <button type="button" className="action-btn pay-bill" onClick={() => handleActionClick('I want to pay')}>
              <div className="action-icon-wrapper">
                <FaMoneyBillWave className="action-icon" />
              </div>
              <span className="action-label">{t('to_pay')}</span>
            </button>
            
            <button type="button" className="action-btn live-chat" onClick={() => handleActionClick('Ask Diana AI')}>
              <div className="action-icon-wrapper">
                <FaComments className="action-icon" />
              </div>
              <span className="action-label">Ask Diana AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modalul pentru opțiunile de plată */}
      {showPaymentOptions && (
        <div className="modal-overlay-waiter" onClick={() => setShowPaymentOptions(false)}>
          <div className="modal-content-waiter payment-options-modal" onClick={(e) => e.stopPropagation()}>
            <div className="header-myorders">
              <div className="menu-button-myorders" onClick={() => setShowPaymentOptions(false)}>
                <FaArrowLeft />
              </div>
              <h2 className="modal-title">Payment Method</h2>
              <div className="close-menu-button-myorders" onClick={() => setShowPaymentOptions(false)}>
                <FaTimes />
              </div>
            </div>

            <div className="assistance-message">
              <p>How would you like to pay?</p>
            </div>

            <div className="payment-options-buttons">
              <button 
                type="button" 
                className="payment-option-btn card-payment" 
                onClick={() => handlePaymentMethod('card')}
              >
                <div className="payment-icon-wrapper">
                  <FaCreditCard className="payment-icon" />
                </div>
                <span className="payment-label">Pay by Card</span>
                <span className="payment-description">POS terminal</span>
              </button>
              
              <button 
                type="button" 
                className="payment-option-btn cash-payment" 
                onClick={() => handlePaymentMethod('cash')}
              >
                <div className="payment-icon-wrapper">
                  <FaMoneyBill className="payment-icon" />
                </div>
                <span className="payment-label">Pay by Cash</span>
                <span className="payment-description">Cash payment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modalul Diana AI */}
      <ChatBot 
        show={showDianaAI} 
        onClose={() => setShowDianaAI(false)} 
      />
    </>
  );
};

export default WaiterModalCart;