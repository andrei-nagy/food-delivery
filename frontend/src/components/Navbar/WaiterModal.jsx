import React, { useContext, useState } from 'react';
import './WaiterModal.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaTimes, FaComments, FaMoneyBillWave, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';

const WaiterModalCart = ({ show, onClose }) => {
  const { url, setToken, token } = useContext(StoreContext);
  const [actionName, setActionName] = useState('');
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
        onClose();
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleActionClick = (action) => {
    setActionName(action);
    submitAction(action);
  };

  return (
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
          
          <button type="button" className="action-btn need-help" onClick={() => handleActionClick('I need help')}>
            <div className="action-icon-wrapper">
              <FaQuestionCircle className="action-icon" />
            </div>
            <span className="action-label">{t('need_help')}</span>
          </button>
          
          <button type="button" className="action-btn live-chat" onClick={() => handleActionClick('Live chat')}>
            <div className="action-icon-wrapper">
              <FaComments className="action-icon" />
            </div>
            <span className="action-label">Live chat</span>
          </button>
        </div>

        {/* {token && (
          <div className="logout-section">
            <button type="button" className="logout-btn" onClick={logout}>
              <FaSignOutAlt className="logout-icon" />
              {t('logout')}
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default WaiterModalCart;