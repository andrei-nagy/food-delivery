import React, { useContext, useState } from 'react';
import './WaiterModal.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';

const WaiterModalCart = ({ show, onClose }) => {
  const { url, setToken, token } = useContext(StoreContext);
  const [actionName, setActionName] = useState('');
  const tableNumber = localStorage.getItem("tableNumber");
  const navigate = useNavigate();

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
            <span className='back-text-button'>Go back</span>
          </div>
          <div className="close-menu-button-myorders" onClick={onClose}>
            <span></span>
          </div>
        </div>
        
        {/* Mesaj profesional de introducere */}
        <div className="assistance-message">
          <p>How can we assist you today? Please select an option below.</p>
        </div>
        
        <div className="action-buttons">
          <button type="button" className="action-btn call-waiter" onClick={() => handleActionClick('Call a waiter')}>
            <img src={assets.waiter_icon} alt="" />
            Call a Waiter
          </button>
          <button type="button" className="action-btn pay-bill" onClick={() => handleActionClick('I want to pay')}>
            <span className="icon">&#x1F4B5;</span> {/* Iconă de bani */}
            I Want to Pay
          </button>
          <button type="button" className="action-btn need-help" onClick={() => handleActionClick('I need help')}>
            <span className="icon">&#x2753;</span> {/* Iconă de ajutor */}
            I Need Help
          </button>
        </div>
  
        {token ? <button type='button' className="submit-btn" onClick={logout}>Logout</button> : null}
      </div>
    </div>
  );
  
};

export default WaiterModalCart;
