import React, { useContext, useEffect, useState } from 'react';
import './ThankYou.css'; // Stiluri
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/StoreContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios pentru a face cereri HTTP
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ThankYou = () => {


  const { url } = useContext(StoreContext);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Schimbă limba
  };



  const location = useLocation();
  const tableNo = location.state?.tableNo || {};
  const orderId = location.state?.orderId; // Presupunem că orderId este trimis în location.state
  const navigate = useNavigate(); // Pentru navigare între pagini
  const [rating, setRating] = useState(0); // Stocăm evaluarea utilizatorului

  useEffect(() => {
    window.scrollTo(0, 0);
    // Verificăm dacă reload-ul este necesar
    const isReloadNeeded = localStorage.getItem("isReloadNeeded");

    if (isReloadNeeded) {
      localStorage.removeItem("isReloadNeeded"); // Ștergem flag-ul pentru a preveni un alt reload
      window.location.reload();
    }
    // Verificăm dacă există deja un rating pentru această comandă
    const fetchRating = async () => {
      try {
        const response = await axios.get(url + "/api/order/${orderId}/rating");
        if (response.data.success && response.data.rating > 0) {
          setRating(response.data.rating); // Setăm ratingul din baza de date
        }
      } catch (error) {
        console.error("Error fetching rating:", error);
      }
    };

    fetchRating(); // Chemăm funcția pentru a prelua ratingul existent
  }, [orderId]);

  const handleRating = async (value) => {
    setRating(value); // Setăm ratingul selectat
    toast.info(`You rated ${value} stars! Thank you for your feedback!`);

    // Trimitem ratingul la server pentru a fi salvat în baza de date
    try {
      await axios.post(url + '/api/order/update-rating', {
        orderId: orderId, // ID-ul comenzii pentru care trimitem ratingul
        rating: value
      });
      // toast.success("Rating submitted successfully!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      // toast.error("Error submitting rating.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="thank-you-container">
        {/* <h1>🎉 Thank you! 🎉</h1><br /> */}
        <h1>{t('thank_you_title')}</h1><br />
        <p>{t('order_placed')}</p><br />
        <p>
          {t('order_placed_description_first')}
        </p><br />
        <p>
          {t('order_placed_description_2')}
        </p>
        <br />
        <p>Bon appétit! 🍽️</p><br />

        {/* Secțiunea de evaluare */}
        <div className="rate-application">
          <p><strong>{t('rate_out_application')}</strong></p><br />
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={rating >= star ? "star filled" : "star"}
                onClick={() => handleRating(star)}
                style={{ cursor: rating > 0 ? "default" : "pointer" }} // Blochează ratingul dacă există deja
              >
                ★
              </span>
            ))}
          </div>
          {rating > 0 && <p>You have already rated this order: {rating} stars</p>}
        </div><br />

        {/* Butoane pentru navigare */}
        <div className="thank-you-buttons">
          <Link to={`/category/All`} >
            <button>{t('view_our_menu')}</button>
          </Link>
          {/* <button onClick={() => navigate('/myorders')}>Track my order status</button> */}
        </div>
      </div>
    </motion.div>
  );
};

export default ThankYou;
