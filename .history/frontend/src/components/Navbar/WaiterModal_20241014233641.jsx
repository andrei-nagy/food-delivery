import React, { useContext, useState } from 'react';
import './WaiterModal.css';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';
import axios from 'axios'
import { toast } from 'react-toastify'

const WaiterModalCart = ({ show, onClose }) => {
  const { url } = useContext(StoreContext);
  const [actionName, setActionName] = useState('');  // Stocăm acțiunea selectată
  const [tableNo, setTableNo] = useState('');  // Stocăm numărul mesei
  const tableNumber = localStorage.getItem("tableNumber");

  const [data, setData] = useState({
    action: "",
    tableNo: "",
})

  if (!show) return null;

  // Funcția de submit (de exemplu, va trimite datele la backend sau va face ceva în continuare)
  // Funcția de submit (de exemplu, va trimite datele la backend sau va face ceva în continuare)
const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!actionName) {
      alert('Please select an action and enter your table number.');
      return;
    }
  
    try {
      // Trimitere date sub formă de JSON
      const response = await axios.post(`${url}/api/waiterorders/add`, {
        action: actionName,
        tableNo: tableNumber,
      });
  
      if (response.data.success) {
        setActionName(''); // Resetare acțiune selectată
        // setTableNo('');    // Resetare număr masă
         // Închide modalul
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
  
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
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

       

          {/* Butonul de submit */}
          <button type="submit" className="submit-btn" onClick={logout}>Logout</button>
          <button type="submit" className="submit-btn">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default WaiterModalCart;
