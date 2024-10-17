import React from 'react';
import './Welcome.css';

const LandingPage = () => {
    return (
        <div className="landing-container">
            <nav className="landing-nav">
                <div className="logo">Orderly</div>
                <ul className="nav-links">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
                <button className="cta-button">Get Started</button>
            </nav>

            <header className="landing-header">
                <div className="header-content">
                    <h1 className="main-heading">Welcome to Orderly</h1>
                    <p className="sub-heading">Your Smart Restaurant Solution</p>
                    <button className="explore-button">Explore Menu</button>
                </div>
            </header>

            <section id="features" className="features-section">
                <h2>Why Choose Us?</h2>
                <div className="features-cards">
                    <div className="feature-card">
                        <h3>Easy Customization</h3>
                        <p>Personalize your restaurant experience with just a few clicks.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Fast and Reliable</h3>
                        <p>Order processing at lightning speed to enhance customer experience.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Secure Payments</h3>
                        <p>We ensure secure and fast payment methods for your customers.</p>
                    </div>
                </div>
            </section>

            <footer id="contact" className="landing-footer">
                <p>Contact us: <a href="mailto:support@orderly.com">support@orderly.com</a></p>
                <p>Orderly © 2024</p>
            </footer>
        </div>
    );
};

export default LandingPage;
