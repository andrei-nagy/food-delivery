import React from 'react'
import './Header.css'
 

const Header = () => {

  const tableNumber = localStorage.getItem("tableNumber");
  const images = [
    '/header_img1.png',
    '/header_img2.png',
    '/header_img3.png',
  ];

  
  return (
    <div className='header'>
        <div className="header-contents">
            <h2>Order you favourite food.</h2>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro voluptatem nobis deleniti obcaecati unde autem facilis mollitia quaerat, rem repudiandae sed repellat eius in molestiae harum, cupiditate quos explicabo natus.</p>
        <button>Table No. {tableNumber}</button>
        </div>
    </div>
  )
}

export default Header