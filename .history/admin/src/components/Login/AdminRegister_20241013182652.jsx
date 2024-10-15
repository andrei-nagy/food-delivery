import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './AdminRegister.css';

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
        <div className="register-container">
            <h2 className="register-title">Admin Register</h2>
            <form className="register-form" onSubmit={handleRegister}>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        className="form-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Security Token:</label>
                    <input
                        type="text"
                        className="form-input"
                        value={securityToken}
                        onChange={(e) => setSecurityToken(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="register-button">Register</button>
            </form>
        </div>
    );
};

export default AdminRegister;
