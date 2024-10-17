import React, { useEffect } from 'react';
import axios from 'axios';

const CheckUser = ({ url, onValidation }) => {
    useEffect(() => {
        const token = localStorage.getItem('token');
        const tableNumber = localStorage.getItem('tableNumber');

        if (token && tableNumber) {
            const verifyUser = async () => {
                try {
                    const response = await axios.post(`${url}/api/validate`, { token, '2' });
                 
                    if (response.data.success) {
                        // User valid - cheamă callback-ul și transmite că este valid
                        onValidation(true);
                    } else {
                        // User invalid - cheamă callback-ul și transmite că nu este valid
                        onValidation(false);
                    }
                } catch (error) {
                    console.error('Error validating user:', error);
                    // În caz de eroare, trimitem fals ca să nu afiseze restul componentelor
                    onValidation(false);
                }
            };

            verifyUser();
        } else {
            // Dacă nu există token sau tableNumber, trimitem invalid (false)
            onValidation(false);
        }
    }, [url, onValidation]);

    return null; // Componentă invizibilă - funcționează doar pe fundal
};

export default CheckUser;