import React, { useState, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const RestaurantCustomization = () => {
    const { token, url } = useContext(StoreContext);
    const [restaurantName, setRestaurantName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    const handleSaveCustomization = async () => {
        try {
            const response = await axios.post(url + '/api/personalize', {
                restaurantName,
                logoUrl,
            }, {
                headers: { token }
            });

            if (response.data.success) {
                alert('Personalization saved successfully!');
            }
        } catch (error) {
            console.error('Error saving personalization:', error);
            alert('An error occurred while saving the personalization.');
        }
    };

    return (
        <div>
            <h2>Customize Your Restaurant</h2>
            <label>
                Restaurant Name:
                <input 
                    type="text" 
                    value={restaurantName} 
                    onChange={(e) => setRestaurantName(e.target.value)} 
                />
            </label>
            <br />
            <label>
                Logo URL:
                <input 
                    type="text" 
                    value={logoUrl} 
                    onChange={(e) => setLogoUrl(e.target.value)} 
                />
            </label>
            <br />
            <button onClick={handleSaveCustomization}>Save</button>
        </div>
    );
};

export default RestaurantCustomization;
