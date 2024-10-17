import React, { useEffect, useState } from 'react';
import './Header.css';
import { assets } from '../../assets/assets'; // Presupunând că asta e calea către fișierul assets

const Header = () => {

  const tableNumber = localStorage.getItem("tableNumber");

  // Listează toate imaginile de fundal disponibile din assets
  const images = [
    assets.header_img1, // Poza 1 din assets
    assets.header_img2, // Poza 2 din assets
    assets.header_img3, // Poza 3 din assets
  ];

  // Stare pentru a reține imaginea aleatorie
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    // Selectează o imagine aleatorie din listă
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setBackgroundImage(randomImage);
  }, []); // Se va executa o singură dată, la montarea componentului

  return (
    <div className='header' style={{ background: `url(${backgroundImage}) no-repeat center/cover` }}>
      <div className="header-contents">
        <h2>Order your favourite food.</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro voluptatem nobis deleniti obcaecati unde autem facilis mollitia quaerat, rem repudiandae sed repellat eius in molestiae harum, cupiditate quos explicabo natus.</p>
        <button>Table No. {tableNumber}</button>
      </div>
    </div>
  );
}

export default Header;
