import React, { useEffect, useState } from 'react';
import './Header.css';
import axios from 'axios';

const Header = ({ url }) => {
    const [backgroundImage, setBackgroundImage] = useState('');
    const tableNumber = localStorage.getItem("tableNumber");

    useEffect(() => {
        const fetchCustomization = async () => {
            try {
                const response = await axios.get(`${url}/admin/personalization/get`);
                if (response.data.success && response.data.data) {
                    const images = response.data.data.backgroundImages;
                    if (images && images.length > 0) {
                        const randomImage = images[Math.floor(Math.random() * images.length)];
                        setBackgroundImage(randomImage); // Setează o imagine aleatorie
                    }
                }
            } catch (error) {
                console.error('Error fetching customization data:', error);
            }
        };
        fetchCustomization();
    }, [url]);

    return (
        <div className='header' style={{ background: `url(${url}/images/${backgroundImage}) no-repeat center/cover` }}>
            <div className="header-contents">
                <h2>Order your favourite food.</h2>
                <p>Welcome to our restaurant, enjoy your meal!</p>
                <button>Table No. {tableNumber}</button>
            </div>
        </div>
    );
}

export default Header;
