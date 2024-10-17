import React from 'react';
import './Welcome.css'; // Importăm stilurile CSS

const WelcomePage = () => {
  return (
    <div className="landing-container">
      <img src="https://via.placeholder.com/100" alt="Logo" className="landing-logo" />

      <div className="landing-card">
        <h1 className="landing-welcome">Welcome to Orderly App</h1>
        <p className="landing-message">Unfortunately, the restaurant is closed at this time.</p>
        
        <div className="landing-buttons">
          <a href="#menu" className="landing-button landing-button-menu">View the Menu</a>
          <a href="#contact" className="landing-button landing-button-contact">Contact</a>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
