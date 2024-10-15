import React, { useContext, useState } from 'react';
import './WaiterModal.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const WaiterModalCart = ({ show, onClose }) => {
  const { url, setToken } = useContext(StoreContext);
  const [actionName, setActionName] = useState('');  // Stocăm acțiunea selectată
  const tableNumber = localStorage.getItem("tableNumber");
  const navigate = useNavigate();

  if (!show) return null;

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  // Funcția de trimitere a acțiunii
  const submitAction = async (action) => {
    try {
      const response = await axios.post(`${url}/api/waiterorders/add`, {
        action: action,
        tableNo: tableNumber,
      });

      if (response.data.success) {
        setActionName(''); // Resetare acțiune selectată
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

  // Funcție pentru a gestiona click-ul pe butoane
  const handleActionClick = (action) => {
    setActionName(action);
    submitAction(action);  // Trimite acțiunea direct
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Call a Waiter</h2>
        <button className="close-button" onClick={onClose}>&times;</button>

        <div className="action-buttons">
          <button type="button" className="action-btn" onClick={() => handleActionClick('Call a waiter')}>
            Call a Waiter
          </button>
          <button type="button" className="action-btn" onClick={() => handleActionClick('I want to pay')}>
            I Want to Pay
          </button>
          <button type="button" className="action-btn" onClick={() => handleActionClick('I need help')}>
            I Need Help
          </button>
        </div>

        {/* Elimină butonul de submit */}
         {/* Butonul de submit */}
         <button type='button' className="submit-btn" onClick={logout}>Logout</button>
      </div>
    </div>
  );
};

export default WaiterModalCart;
