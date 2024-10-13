// src/pages/ThankYou.jsx
import React, { useEffect } from 'react';
import './ThankYou.css'; // Stiluri

const ThankYou = () => {
  useEffect(() => {
    // Refresh automat la montarea componentei
    window.location.reload(); // Reîncarcă pagina curentă
  }, []); // Folosim un array gol pentru a rula doar o singură dată

  return (
    <div className="thank-you-container">
      <h1>Thank you for your order!</h1>
      <p>Your order has been placed successfully.</p>
    </div>
  );
};

export default ThankYou;
