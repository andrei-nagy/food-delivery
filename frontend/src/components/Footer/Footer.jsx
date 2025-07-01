import React, { useContext, useState, useEffect } from 'react';
import './Footer.css';
import axios from 'axios';  // Importă axios pentru cereri API
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';

const Footer = () => {
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
        <div className='footer' id='footer'>
            <div className="footer-content">
                <div className="footer-content-left">
                    <img src={assets.original_logo} alt="logo" className='logo-footer' />
                    <p>Orderly, the innovative app designed to revolutionize the dining experience for restaurants, beach bars, and beyond! Our platform streamlines the management process for restaurant owners while enhancing customer satisfaction through a seamless and efficient service.</p>
                    <div className="footer-social-icons">
                        <img src={assets.facebook_icon} alt="facebook" />
                        <img src={assets.twitter_icon} alt="twitter" />
                        <img src={assets.linkedin_icon} alt="linkedin" />
                    </div>
                </div>
                <div className="footer-content-center">
                    <h2>About us</h2>
                    <ul>
                        <li>Home</li>
                        <li>About us</li>
                        <li>Delivery</li>
                        <li>Privacy policy</li>
                    </ul>
                </div>
                <div className="footer-content-right">
                    <h2>GET IN TOUCH</h2>
                    <ul>
                        <li>{data.contactPhone}</li>
                        <li>{data.contactEmail}</li>
                    </ul>
                </div>
            </div>
            <hr />
            <div>
                <p className="footer-copyright">
                    Powered by <img className='powered-logo' src={assets.original_logo} alt="powered-logo" />
                </p>
            </div>
        </div>
    );
}

export default Footer;
