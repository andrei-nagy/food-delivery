import React, { useEffect, useState } from 'react';
import './Header.css'
 

const Header = () => {

  const tableNumber = localStorage.getItem("tableNumber");
  const images = [
    '/header_img1.jpg',
    '/header_img2.jpg',
    '/header_img3.jpg',
  ];

    // Stare pentru a reține imaginea aleatorie
    const [backgroundImage, setBackgroundImage] = useState('');

    useEffect(() => {
      // Selectează o imagine aleatorie din listă
      const randomImage = images[Math.floor(Math.random() * images.length)];
      setBackgroundImage(randomImage);
    }, []); // Se va executa o singură dată, la montarea componentului

    
  return (
    <div className='header'  style={{ background: `url(${backgroundImage})` }}>
        <div className="header-contents">
            <h2>Order you favourite food.</h2>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro voluptatem nobis deleniti obcaecati unde autem facilis mollitia quaerat, rem repudiandae sed repellat eius in molestiae harum, cupiditate quos explicabo natus.</p>
        <button>Table No. {tableNumber}</button>
        </div>
    </div>
  )
}

export default Header