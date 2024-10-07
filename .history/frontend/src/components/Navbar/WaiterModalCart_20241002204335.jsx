import React, { useContext, useState } from 'react';
import './WaiterModalCart.css';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';
import axios from 'axios'
import { toast } from 'react-toastify'

const WaiterModalCart = ({ show, onClose }) => {
  const { url } = useContext(StoreContext);
  const [actionName, setActionName] = useState('');  // Stocăm acțiunea selectată
  const [tableNo, setTableNo] = useState('');  // Stocăm numărul mesei

  const [data, setData] = useState({
    action: "",
    tableNo: "",
})

  if (!show) return null;

  // Funcția de submit (de exemplu, va trimite datele la backend sau va face ceva în continuare)
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (tableNo) {
      console.log(`Action: ${actionName}, Table No: ${tableNo}`);
      // Poți adăuga funcționalitatea de submit aici, ex: trimite la backend
      const formData = new FormData();
      formData.append("action", {actionName});
      formData.append("tableNo", {tableNo});
 
      const response = await axios.post(`${url}/api/waiterorders/add`, formData);
      if(response.data.success){
        setData({
            action: "",
            tableNo: ""
        })
  
        toast.success(response.data.message)
    } else {
        toast.error(response.data.message)
    }

    } else {
      alert('Please enter your table number.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}> {/* Adăugăm funcționalitate pe overlay */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Oprim propagarea click-ului pe modal */}
        <h2>Call a Waiter</h2>
        <button className="close-button" onClick={onClose}>&times;</button>

        <form onSubmit={handleSubmit} className="waiter-form">
          {/* Butoanele pentru acțiuni */}
          <div className="action-buttons">
            <button type="button" className="action-btn" onClick={() => setActionName('Call a waiter')}>
              Call a Waiter
            </button>
            <button type="button" className="action-btn" onClick={() => setActionName('I want to pay')}>
              I Want to Pay
            </button>
            <button type="button" className="action-btn" onClick={() => setActionName('I need help')}>
              I Need Help
            </button>
          </div>

          {/* Câmp ascuns pentru acțiunea selectată */}
          <input type="hidden" name="action_name" value={actionName} />

          {/* Câmpul pentru numărul mesei */}
          <div className="table-number-field">
            <label htmlFor="tableNo">Table No.</label>
            <input 
              type="text"
              id="tableNo"
              name="tableNo"
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
              placeholder="Enter your table number"
              required
            />
          </div>

          {/* Butonul de submit */}
          <button type="submit" className="submit-btn">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default WaiterModalCart;
