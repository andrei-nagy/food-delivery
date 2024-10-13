import React, { useEffect, useState } from 'react';
import './ThankYou.css'; // Stiluri
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

const ThankYou = () => {
  const location = useLocation();
  const tableNo = location.state || {};
  const navigate = useNavigate(); // Pentru navigare între pagini
  const [rating, setRating] = useState(0); // Stocăm evaluarea utilizatorului

  useEffect(() => {
    // Verificăm dacă pagina a fost deja reîncărcată folosind localStorage
    const isPageReloaded = localStorage.getItem('isPageReloaded');
    
    if (!isPageReloaded) {
      // Dacă pagina nu a fost încă reîncărcată, o reîncărcăm și setăm flag-ul
      localStorage.setItem('isPageReloaded', 'true');
      window.location.reload();
    } else {
      // Resetăm flag-ul pentru a permite o altă reîncărcare viitoare (dacă e necesar)
      localStorage.removeItem('isPageReloaded');
      toast.success("Order placed successfully!");
    }
  }, []);

  const handleRating = (value) => {
    setRating(value); // Setăm ratingul selectat
    toast.info(`You rated ${value} stars! Thank you for your feedback!`); // Afișăm un mesaj de confirmare
  };

  return (
    <div className="thank-you-container">
      <h1>🎉 Thank You for your order! 🎉</h1><br />
      <p>Your order has been placed successfully.</p><br />
      <p>
        We are preparing your delicious meal, and it will be served at <strong>table {typeof tableNo === 'object' ? JSON.stringify(tableNo.tableNo) : tableNo}</strong> shortly.
      </p>
      <p>
        If you have any questions or need further assistance, feel free to let us know. 
        We're here to make your dining experience exceptional!
      </p><br />
      <p>Bon appétit! 🍽️</p><br />

      {/* Secțiunea de evaluare */}
      <div className="rate-application">
        <p><strong>Rate our application:</strong></p>
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
