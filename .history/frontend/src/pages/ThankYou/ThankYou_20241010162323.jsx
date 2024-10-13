import React, { useEffect } from 'react';
import './ThankYou.css'; // Stiluri
import { toast } from 'react-toastify';
const ThankYou = () => {
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

  return (
    <div className="thank-you-container">
        
      <h1>Thank you for your order!</h1>
      <p>Your order has been placed successfully.</p>
    </div>
  );
};

export default ThankYou;
