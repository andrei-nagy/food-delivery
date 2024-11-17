import React from 'react';
import './Welcome.css';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';  // Importă axios pentru cereri API
import { assets } from '../../assets/assets';


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
        securityToken: '',
        openingHours: ''
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
                <img src={url + "/images/" + data.image} alt="Restaurant Logo" className="welcome-logo" /> {/* Adaugă logo-ul */}

                <h3>Welcome to {data.restaurantName}!</h3>
                {/* <p>{data.slogan}</p> */}
                <p>
                o enhance your experience, scan the QR code to view the menu, place your order and relax. We are committed to providing you with the freshest dishes and an enjoyable dining experience!

                </p>
                <div className="schedule">
                    <h4>Business Hours:</h4>
                    <p>
                        Monday to Friday: {data.openingHours?.weekdays?.open
                            ? `${data.openingHours.weekdays.open} AM - ${data.openingHours.weekdays.close} PM`
                            : "Closed"}
                    </p>
                    <p>
                        Saturday: {data.openingHours?.saturday?.open
                            ? `${data.openingHours.saturday.open} AM - ${data.openingHours.saturday.close} PM`
                            : "Closed"}
                    </p>
                    <p>
                        Sunday: {data.openingHours?.sunday?.open && data.openingHours?.sunday?.close
                            ? `${data.openingHours.sunday.open} AM - ${data.openingHours.sunday.close} PM`
                            : "Closed"}
                    </p>
                </div>
                <button
                    className="contact-button"
                    onClick={() => window.location.href = `tel:${data.contactPhone}`}
                >
                    Contact Us
                </button>
            </div>
        </div>
    );
};

export default Welcome;
