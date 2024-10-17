import React from 'react';
 
import './Welcome.css'; // Aici poți adăuga stiluri personalizate

const LandingPage = () => {
  return (
    <div className='header' style={{ background: `url(${backgroundImage}) no-repeat center/cover` }}>
    <div className="header-contents">
      <h2>Order your favourite food.</h2>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro voluptatem nobis deleniti obcaecati unde autem facilis mollitia quaerat, rem repudiandae sed repellat eius in molestiae harum, cupiditate quos explicabo natus.</p>
      <button>Table No. {tableNumber}</button>
    </div>
  </div>
  );
};

export default LandingPage;
