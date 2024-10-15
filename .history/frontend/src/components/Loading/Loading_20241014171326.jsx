// components/Loading/Loading.jsx
import React from 'react';
import './Loading.css';  // Poți adăuga stiluri personalizate pentru loader
import { assets } from '../../assets/assets';

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div> {/* Poți înlocui cu un gif sau o animație */}

      <img className='logo-loading' src={assets.original_logo}></img>
      <p>Please hold on, we’re setting everything up just for you.</p>
    </div>
  );
};

export default Loading;
