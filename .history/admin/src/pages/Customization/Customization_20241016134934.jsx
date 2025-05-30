import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminCustomizationPage = ({ url }) => {
    const [customizationData, setCustomizationData] = useState({
        restaurantId: '',         // Restaurant ID - poate fi dintr-un user autenticat sau setat manual
        restaurantName: '',
        logoUrl: '',
        primaryColor: '#ffffff',   // Valoarea implicită
        secondaryColor: '#000000', // Valoarea implicită
        slogan: '',
        contactEmail: '',
        contactPhone: '',
    });

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Separating fetchCustomizationData logic
    const fetchCustomizationData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/admin/personalize?restaurantId=YOUR_RESTAURANT_ID`); // Trimite restaurantId ca parametru

            if (response.data.data) {
                setCustomizationData(response.data.data); // Populează datele dacă există personalizare
            } else {
                console.log('No customization data found. Ready to create new customization.');
            }
        } catch (error) {
            console.error('Error fetching customization data:', error);
            setErrorMessage('Failed to fetch customization data.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch customization data on component mount
    useEffect(() => {
        fetchCustomizationData();
    }, []);

    // Separating updateCustomizationData logic
    const updateCustomizationData = async () => {
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');
    
        try {
            await axios.post(`${url}/admin/personalize/update`, customizationData);
            setSuccessMessage('Customization updated successfully.');
        } catch (error) {
            console.error('Error updating customization:', error);
            setErrorMessage('Failed to update customization.');
        } finally {
            setLoading(false);
        }
    };
    
    // Funcție pentru a trimite datele
    const handleSubmit = (e) => {
        e.preventDefault();
        updateCustomizationData();
    };

    // Funcție pentru a actualiza datele de personalizare pe baza input-ului utilizatorului
    const handleChange = (e) => {
        setCustomizationData({
            ...customizationData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="admin-customization-page">
            <h1>Customize Your Restaurant</h1>
            {loading && <p>Loading...</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="restaurantName">Restaurant Name:</label>
                    <input
                        type="text"
                        name="restaurantName"
                        value={customizationData.restaurantName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="logoUrl">Logo URL:</label>
                    <input
                        type="text"
                        name="logoUrl"
                        value={customizationData.logoUrl}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="primaryColor">Primary Color:</label>
                    <input
                        type="color"
                        name="primaryColor"
                        value={customizationData.primaryColor}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="secondaryColor">Secondary Color:</label>
                    <input
                        type="color"
                        name="secondaryColor"
                        value={customizationData.secondaryColor}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="slogan">Slogan:</label>
                    <input
                        type="text"
                        name="slogan"
                        value={customizationData.slogan}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="contactEmail">Contact Email:</label>
                    <input
                        type="email"
                        name="contactEmail"
                        value={customizationData.contactEmail}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="contactPhone">Contact Phone:</label>
                    <input
                        type="text"
                        name="contactPhone"
                        value={customizationData.contactPhone}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Customization'}
                </button>
            </form>
        </div>
    );
};

export default AdminCustomizationPage;
