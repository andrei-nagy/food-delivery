import React, { useEffect, useState } from 'react';
import './ThankYou.css'; // Stiluri
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios pentru a face cereri HTTP

const ThankYou = () => {
  const location = useLocation();
  const tableNo = location.state?.tableNo || {};
  const orderId = location.state?.orderId; // Presupunem că orderId este trimis în location.state
  const navigate = useNavigate(); // Pentru navigare între pagini
  const [rating, setRating] = useState(0); // Stocăm evaluarea utilizatorului

  useEffect(() => {
    const isPageReloaded = localStorage.getItem('isPageReloaded');
    
    if (!isPageReloaded) {
      localStorage.setItem('isPageReloaded', 'true');
      window.location.reload();
    } else {
      localStorage.removeItem('isPageReloaded');
      toast.success("Order placed successfully!");
    }
  }, []);

  const handleRating = async (value) => {
    setRating(value); // Setăm ratingul selectat
    toast.info(`You rated ${value} stars! Thank you for your feedback!`);

    // Trimitem ratingul la server pentru a fi salvat în baza de date
    try {
      await axios.post('http://localhost:4000/api/order/update-rating', {
    
        orderId: orderId, // ID-ul comenzii pentru care trimitem ratingul
        rating: value
      });
      toast.success("Rating submitted successfully!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Error submitting rating.");
    }
  };

  return (
    <div className="thank-you-container">
      <h1>🎉 Thank You for your order! 🎉</h1><br />
      <p>Your order has been placed successfully.</p><br />
      <p>
        We are preparing your delicious meal, and it will be served at <strong>table {tableNo}</strong> shortly.
      </p>
      <p>
        If you have any questions or need further assistance, feel free to let us know. 
      </p><br />
      <p>Bon appétit! 🍽️</p><br />

      {/* Secțiunea de evaluare */}
      <div className="rate-application">
        <p><strong>Rate our application:</strong></p><br />
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span 
              key={star} 
              className={rating >= star ? "star filled" : "star"} 
              onClick={() => handleRating(star)}
            >
              ★
            </span>
          ))}
        </div>
      </div><br />

      {/* Butoane pentru navigare */}
      <div className="thank-you-buttons">
        <button onClick={() => navigate('/')}>Go back to view menu</button> 
        <button onClick={() => navigate('/myorders')}>Track my order status</button>
      </div>
    </div>
  );
};

export default ThankYou;
