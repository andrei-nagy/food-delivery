import React, { useState, useEffect } from 'react';
import axios from 'axios';
import mongoose from 'mongoose';

const AdminCustomizationPage = ({ url }) => {
    const [customizationData, setCustomizationData] = useState({
        restaurantId: new mongoose.Types.ObjectId().toString(), // Generăm un ID valid ObjectId
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

    // Funcția de fetch pentru datele de personalizare
    const fetchCustomizationData = async () => {
        setLoading(true);
        try {
            // Verificăm dacă restaurantId este valid
            if (!mongoose.Types.ObjectId.isValid(customizationData.restaurantId)) {
                console.log('Invalid restaurantId, generating a new one.');
                setCustomizationData(prevData => ({
                    ...prevData,
                    restaurantId: new mongoose.Types.ObjectId().toString(),
                }));
                return; // Ieșim din funcție dacă ID-ul nu este valid
            }

            const response = await axios.get(`${url}/admin/personalization?restaurantId=${customizationData.restaurantId}`); // Trimite restaurantId ca parametru

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
    }, [customizationData.restaurantId]);

    // Funcția de adăugare a personalizării
    const addCustomizationData = async () => {
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            await axios.post(`${url}/admin/personalization/add`, customizationData); // Folosește ruta de adăugare
            setSuccessMessage('Customization added successfully.');
        } catch (error) {
            console.error('Error adding customization:', error);
            setErrorMessage('Failed to add customization.');
        } finally {
            setLoading(false);
        }
    };

    // Funcția de actualizare a personalizării
    const updateCustomizationData = async () => {
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            await axios.post(`${url}/admin/personalization`, customizationData); // Folosește ruta de actualizare
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
        
        // Verificăm dacă există personalizare și alegem funcția corectă
        if (customizationData.restaurantId) {
            updateCustomizationData();
        } else {
            addCustomizationData();
        }
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
                    <label htmlFor="restaurantId">Restaurant ID:</label>
                    <input
                        type="text"
                        name="restaurantId"
                        value={customizationData.restaurantId}
                        readOnly // Nu permite utilizatorului să schimbe ID-ul generat
                    />
                </div>

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
