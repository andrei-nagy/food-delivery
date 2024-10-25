import React from 'react';
import './Welcome.css';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';  // Importă axios pentru cereri API


const Welcome = () => {
    const navigate = useNavigate();

    const handleExploreClick = () => {
        navigate('/home'); // Navighează la pagina Home (sau orice altă pagină dorești)
    };
    const { url } = useContext(StoreContext);
    const [data, setData] = useState({
        image: '',
        restaurantName: '',
        primaryColor: '#ffffff',
        secondaryColor: '#000000',
        slogan: '',
        contactEmail: '',
        contactPhone: '',
        securityToken: ''
    });

    // Function to fetch existing customization
    const fetchCustomization = async () => {
        try {
            const response = await axios.get(`${url}/admin/personalization/get`);
            if (response.data.success && response.data.data) {
                setData(response.data.data); // Setează starea doar dacă datele sunt disponibile
            } else {
                toast.error('Customization data is unavailable.');
            }
        } catch (error) {
            toast.error('Error fetching customization data: ' + error.message);
        }
    };

    useEffect(() => {

        fetchCustomization();
    }, [url]);

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
