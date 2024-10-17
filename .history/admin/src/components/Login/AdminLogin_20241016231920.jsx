import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = ({ url }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${url}/admin/login`, { email, password });
            if (response.data.success) {
                localStorage.setItem('authToken', response.data.token); // Salvează token-ul
                toast.success("Login successful");
                navigate('/');  // Redirect la pagina principală
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("An error occurred while logging in");
        }
    };

    return (
        <div className="login-container">
        
            <form onSubmit={handleLogin} className="login-form">
            <h2 className="login-title">Admin Login</h2>
                <div className="form-group">
                    <label className="form-label">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <button type="submit" className="login-button">Login</button>
                <button type="submit" className="go-to-register-button" onClick={() => navigate('/admin/register')}>Register</button>
            </form>
        </div>
    );
};

export default AdminLogin;
