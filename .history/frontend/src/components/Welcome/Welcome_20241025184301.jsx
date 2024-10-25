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
console.log(data)
        fetchCustomization();
    }, [url]);

  
    return (
        <div className="welcome-container">
            <div className="welcome-content">
                <h5>Welcome to {data.restaurantName}!</h1>
                <p>{data.slogan}</p>
                <p>
                    Currently, our restaurant is closed for service. We operate on a schedule that ensures the highest quality and fresh offerings.
                    Please check back with us soon to enjoy our full menu. We apologize for any inconvenience and appreciate your understanding.
                </p>
                <button 
                    className="explore-button"
                    onClick={() => window.location.href = `tel:${data.contactPhone}`}
                >
                    Contact Us
                </button>
            </div>
        </div>
    );
};

export default Welcome;
