import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminRegister = ({ url }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [securityToken, setSecurityToken] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (securityToken !== '123456789') {
            toast.error("Invalid Security Token");
            return;
        }

        try {
            const response = await axios.post(`${url}/admin/register`, { email, password, securityToken });
            if (response.data.success) {
                toast.success("Account created successfully");
                navigate('/');  // Redirect to main page
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("An error occurred while registering");
        }
    };

    return (
        <div>
            <h2>Admin Register</h2>
            <form onSubmit={handleRegister}>
                <div>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div>
                    <label>Security Token:</label>
                    <input type="text" value={securityToken} onChange={(e) => setSecurityToken(e.target.value)} required />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default AdminRegister;
