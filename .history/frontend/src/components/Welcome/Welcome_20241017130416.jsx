import React, { useEffect } from 'react';
import './Welcome.css';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            const landingContent = document.querySelector('.landing-content');
            if (landingContent) {
                landingContent.style.opacity = 1; // Fade-in effect
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleExploreClick = () => {
        navigate('/home'); // Navighează la pagina Home
    };

    return (
        <div className="landing-container">
            <div className="landing-content">
                <h1>Welcome to Orderly!</h1>
                <p className="tagline">Scan. Order. Relax.</p>
                <p className="description">
                    Discover a new way to enjoy your dining experience with our innovative solution.
                    Just scan the QR code, place your order, and relax while we take care of the rest.
                </p>
                <button className="explore-button" onClick={handleExploreClick}>
                    Get Started
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
