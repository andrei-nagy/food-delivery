import React, { useEffect } from 'react';
import './ThankYou.css'; // Stiluri
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
const ThankYou = () => {

  const location = useLocation();
  const tableNo = location.state || {}; 


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
    <h1>🎉 Thank You for Your Order! 🎉</h1>
    <p>Your order has been placed successfully.</p>
    <p>
      We are preparing your delicious meal, and it will be served at <strong>Table {typeof tableNo === 'object' ? JSON.stringify(tableNo) : tableNo.tableNo}</strong> shortly.
    </p>
    <p>
      If you have any questions or need further assistance, feel free to let us know. 
      We're here to make your dining experience exceptional!
    </p>
    <p>Bon appétit! 🍽️</p>
  </div>
  );
};

export default ThankYou;