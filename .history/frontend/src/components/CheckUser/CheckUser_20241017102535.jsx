import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CheckUser = ({ url }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const tableNumber = localStorage.getItem('tableNumber');

        // Dacă token și tableNumber sunt găsite în localStorage
        if (token && tableNumber) {
            const verifyUser = async () => {
                try {
                    const response = await axios.post(`${url}/api/validate`, { token, tableNumber });

                    if (response.data.success) {
                        // Șterge token și tableNumber din localStorage
                        localStorage.removeItem('token');
                        localStorage.removeItem('tableNumber');

                        // Redirecționează către pagina /welcome
                        navigate('/welcome');
                    } else {
                        console.log('User not found or validation failed.');
                    }
                } catch (error) {
                    console.error('Error validating user:', error);
                }
            };

            verifyUser();
        }
    }, [navigate, url]);

    return null; // Sau un loader sau altceva dacă e nevoie
};

export default CheckUser;
