import React, { useContext, useState, useEffect } from 'react';
import './WaiterModal.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaTimes, FaComments, FaMoneyBillWave, FaCreditCard, FaMoneyBill, FaUtensils, FaQuestion, FaWater, FaWineGlass, FaReceipt, FaClock, FaConciergeBell } from 'react-icons/fa';
import ChatBot from '../ChatBot/ChatBot';

const WaiterModalCart = ({ show, onClose, customAction, paymentDetails }) => {
  const { url, setToken, token } = useContext(StoreContext);
  const [actionName, setActionName] = useState('');
  const [showDianaAI, setShowDianaAI] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showWaiterReasons, setShowWaiterReasons] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false); // Nou state pentru a urmări dacă am trimis deja
  const tableNumber = localStorage.getItem("tableNumber");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tableNumber");
    setToken("");
    navigate("/");
    window.location.reload();
  };

  const submitAction = async (action) => {
    try {
      const requestData = {
        action: action,
        tableNo: tableNumber,
      };

      // Adaugă paymentDetails dacă există
      if (paymentDetails) {
        requestData.paymentDetails = paymentDetails;
      }

      const response = await axios.post(`${url}/api/waiterorders/add`, requestData);

      if (response.data.success) {
        setActionName('');
        
        if (action === 'Ask Diana AI') {
          setShowDianaAI(true);
        } else {
          onClose();
          toast.success(response.data.message);
          
          // Dacă există o acțiune personalizată, o executăm
          if (customAction) {
            customAction();
          }
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
      setShowPaymentOptions(true);
    } else if (action === 'Call a waiter') {
      setShowWaiterReasons(true);
    } else {
      setActionName(action);
      submitAction(action);
    }
  };

  const handlePaymentMethod = (paymentMethod) => {
    let action = '';
    if (paymentMethod === 'card') {
      action = 'Call waiter - POS payment	';
    } else if (paymentMethod === 'cash') {
      action = 'Call waiter - Cash payment	';
    }
    
    setActionName(action);
    submitAction(action);
    setShowPaymentOptions(false);
  };

  const handleWaiterReason = (reason) => {
    let action = '';
    switch (reason) {
      case 'order':
        action = 'Call waiter - Need to order';
        break;
      case 'menu':
        action = 'Call waiter - Need menu explanation';
        break;
      case 'water':
        action = 'Call waiter - Need water';
        break;
      case 'drinks':
        action = 'Call waiter - Need drinks';
        break;
      case 'bill':
        action = 'Call waiter - Need bill';
        break;
      case 'cutlery':
        action = 'Call waiter - Need cutlery';
        break;
      case 'assistance':
        action = 'Call waiter - Need assistance';
        break;
      case 'other':
        action = 'Call waiter - Other reason';
        break;
      default:
        action = 'Call a waiter';
    }
    
    setActionName(action);
    submitAction(action);
    setShowWaiterReasons(false);
  };

  // Efectuează automat acțiunea de plată cash atunci când modalul se deschide cu paymentDetails
  useEffect(() => {
    if (show && paymentDetails && paymentDetails.paymentMethod === 'Cash/POS' && !hasAutoSubmitted) {
      setHasAutoSubmitted(true);
      submitAction('Call waiter - Cash or POS payment');
    }
  }, [show, paymentDetails, hasAutoSubmitted]);

  // Reset hasAutoSubmitted când modalul se închide
  useEffect(() => {
    if (!show) {
      setHasAutoSubmitted(false);
    }
  }, [show]);

  const waiterReasons = [
    {
      id: 'order',
      icon: FaUtensils,
      label: t('waiter_modal.want_to_order'),
      description: t('waiter_modal.place_new_order')
    },
    {
      id: 'menu',
      icon: FaQuestion,
      label: t('waiter_modal.menu_explanation'),
      description: t('waiter_modal.need_help_with_menu')
    },
    {
      id: 'water',
      icon: FaWater,
      label: t('waiter_modal.need_water'),
      description: t('waiter_modal.request_water_service')
    },
    {
      id: 'drinks',
      icon: FaWineGlass,
      label: t('waiter_modal.need_drinks'),
      description: t('waiter_modal.order_beverages')
    },
    {
      id: 'bill',
      icon: FaReceipt,
      label: t('waiter_modal.ask_for_bill'),
      description: t('waiter_modal.request_the_check')
    },
    {
      id: 'cutlery',
      icon: FaConciergeBell,
      label: t('waiter_modal.need_cutlery'),
      description: t('waiter_modal.request_utensils')
    },
    {
      id: 'assistance',
      icon: FaQuestion,
      label: t('waiter_modal.general_assistance'),
      description: t('waiter_modal.need_help_with_something')
    },
    {
      id: 'other',
      icon: FaClock,
      label: t('waiter_modal.other_reason'),
      description: t('waiter_modal.something_else')
    }
  ];

  // Mută return-ul la sfârșit, după toate hook-urile
  if (!show) return null;

  return (
    <>
      {/* Modalul principal */}
      <div className="modal-overlay-waiter" onClick={onClose}>
        <div className="modal-content-waiter" onClick={(e) => e.stopPropagation()}>
          <div className="header-myorders">
            <div className="menu-button-myorders" onClick={() => onClose()}>
            </div>
            <h2 className="modal-title">{t('waiter_modal.need_help')}</h2>
            <div className="close-menu-button-myorders" onClick={onClose}>
              <FaTimes />
            </div>
          </div>

          <div className="assistance-message">
            <p>{t('waiter_modal.how_can_we_assist')}</p>
          </div>

          <div className="action-buttons">
            <button type="button" className="action-btn call-waiter" onClick={() => handleActionClick('Call a waiter')}>
              <div className="action-icon-wrapper">
                <img className='waiter-icon-actions' src={assets.waiter_icon} alt="" />
              </div>
              <span className="action-label">{t('waiter_modal.call_waiter')}</span>
            </button>
            
            <button type="button" className="action-btn pay-bill" onClick={() => handleActionClick('I want to pay')}>
              <div className="action-icon-wrapper">
                <FaMoneyBillWave className="action-icon" />
              </div>
              <span className="action-label">{t('waiter_modal.to_pay')}</span>
            </button>
            
            <button type="button" className="action-btn live-chat" onClick={() => handleActionClick('Ask Diana AI')}>
              <div className="action-icon-wrapper">
                <FaComments className="action-icon" />
              </div>
              <span className="action-label">{t('waiter_modal.ask_diana_ai')}</span>
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
              <h2 className="modal-title">{t('waiter_modal.payment_method')}</h2>
              <div className="close-menu-button-myorders" onClick={() => setShowPaymentOptions(false)}>
                <FaTimes />
              </div>
            </div>

            <div className="assistance-message">
              <p>{t('waiter_modal.how_would_you_like_to_pay')}</p>
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
                <div className="payment-text-content">
                  <span className="payment-option-label">{t('waiter_modal.pay_by_card')}</span>
                  <span className="payment-option-description">{t('waiter_modal.pos_terminal')}</span>
                </div>
              </button>
              
              <button 
                type="button" 
                className="payment-option-btn cash-payment" 
                onClick={() => handlePaymentMethod('cash')}
              >
                <div className="payment-icon-wrapper">
                  <FaMoneyBill className="payment-icon" />
                </div>
                <div className="payment-text-content">
                  <span className="payment-option-label">{t('waiter_modal.pay_by_cash')}</span>
                  <span className="payment-option-description">{t('waiter_modal.cash_payment')}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modalul pentru motivele de chemare ospătar */}
      {showWaiterReasons && (
        <div className="modal-overlay-waiter" onClick={() => setShowWaiterReasons(false)}>
          <div className="modal-content-waiter waiter-reasons-modal" onClick={(e) => e.stopPropagation()}>
            <div className="header-myorders">
              <div className="menu-button-myorders" onClick={() => setShowWaiterReasons(false)}>
                <FaArrowLeft />
              </div>
              <h2 className="modal-title">{t('waiter_modal.call_waiter_title')}</h2>
              <div className="close-menu-button-myorders" onClick={() => setShowWaiterReasons(false)}>
                <FaTimes />
              </div>
            </div>

            <div className="assistance-message">
              <p>{t('waiter_modal.why_need_waiter')}</p>
            </div>

            <div className="waiter-reasons-buttons">
              {waiterReasons.map((reason) => (
                <button 
                  key={reason.id}
                  type="button" 
                  className="waiter-reason-btn" 
                  onClick={() => handleWaiterReason(reason.id)}
                >
                  <div className="waiter-reason-icon-wrapper">
                    <reason.icon className="waiter-reason-icon" />
                  </div>
                  <div className="waiter-reason-text-content">
                    <span className="waiter-reason-label">{reason.label}</span>
                    <span className="waiter-reason-description">{reason.description}</span>
                  </div>
                </button>
              ))}
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