import React from 'react';
import './Welcome.css';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
    const navigate = useNavigate();

    const handleExploreClick = () => {
        navigate('/home'); // Navighează la pagina Home (sau orice altă pagină dorești)
    };

    return (
        <div className="welcome-container">
            <div className="welcome-content">
                <h1>Welcome to Orderly!</h1>
                <p>Personalize your business and explore new possibilities.</p>
                <button className="explore-button" onClick={handleExploreClick}>
                    Explore the Menu
                </button>
            </div>
        </div>
    );
};

export default Welcome;
