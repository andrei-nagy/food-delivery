import React, { useEffect, useState } from 'react';
import './Header.css';
import { assets } from '../../assets/assets'; // Presupunând că asta e calea către fișierul assets
import { useTranslation } from 'react-i18next';

const Header = () => {

  const tableNumber = localStorage.getItem("tableNumber");

  // Listează toate imaginile de fundal disponibile din assets
  const images = [
    assets.header_img1, // Poza 1 din assets
    assets.header_img2, // Poza 2 din assets
    assets.header_img3, // Poza 3 din assets
    assets.header_img4, // Poza 3 din assets
  ];

  // Stare pentru a reține imaginea aleatorie
  const [backgroundImage, setBackgroundImage] = useState('');
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Schimbă limba
  };

  useEffect(() => {
    // Selectează o imagine aleatorie din listă
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setBackgroundImage(randomImage);
  }, []); // Se va executa o singură dată, la montarea componentului

  return (
    <div className='header header-radius' style={{ background: `url(${backgroundImage}) no-repeat center/cover` }}>
      <div className="header-contents">
        <h2>{t('order_your_food')}</h2>
        <p>{t('your_food_description')}</p>
        <button>{t('table')} {tableNumber}</button>
      </div>
    </div>
  );
}

export default Header;
