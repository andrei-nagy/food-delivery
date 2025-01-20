import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Add from './pages/Add/Add';
import { List } from './pages/List/List';
import Orders from './pages/Orders/Orders';
import AddCategory from './pages/AddCategory/AddCategory';
import ListCategory from './pages/ListCategories/ListCategories';
import Waiter from './pages/Waiter/Waiter';
import AdminLogin from './components/Login/AdminLogin';
import AdminRegister from './components/Login/AdminRegister';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Customization from './pages/Customization/Customization';
import axios from 'axios';  // Import axios

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hasCustomization, setHasCustomization] = useState(false);  // Noua stare pentru personalizare
    const navigate = useNavigate();
    const location = useLocation(); 
    const url = "https://api.orderly-app.com";

    useEffect(() => {
        const token = localStorage.getItem('authToken');

        if (token) {
            setIsAuthenticated(true);

            // Verifică dacă există restaurantName din personalizare
            const checkCustomization = async () => {
                try {
                    const response = await axios.get(`${url}/admin/personalization/get`, {
                        headers: {
                            Authorization: `Bearer ${token}` // Trimite token-ul de autentificare
                        }
                    });

                    if (response.data.success && response.data.data.restaurantName) {
                        setHasCustomization(true); // Setează că există o personalizare
                    } else {
                        setHasCustomization(false); // Personalizarea nu există sau nu conține restaurantName
                    }
                } catch (error) {
                    console.error('Error fetching customization:', error);
                    setHasCustomization(false); // În cazul unei erori, considerăm că personalizarea nu există
                }
            };

            checkCustomization();
        } else {
            setIsAuthenticated(false);
            if (location.pathname === '/') {
                navigate('/admin/login');
            }
        }
    }, [navigate, location.pathname, url]);

    useEffect(() => {
        // După ce verificăm autentificarea și personalizarea
        if (isAuthenticated && !hasCustomization) {
            navigate('/personalize');
        } 
    }, [isAuthenticated, hasCustomization, navigate, location.pathname]);

    return (
        <div>
            <ToastContainer />
            {isAuthenticated && hasCustomization && <Navbar />}
            <hr />
            {isAuthenticated ? (
                <div className="app-content">
                    <Sidebar />
                    <Routes>
                        <Route path="/add" element={<Add url={url} />} />
                        <Route path="/list" element={<List url={url} />} />
                        <Route path="/orders" element={<Orders url={url} />} />
                        <Route path="/addcategory" element={<AddCategory url={url} />} />
                        <Route path="/listcategory" element={<ListCategory url={url} />} />
                        <Route path="/listwaiterrequests" element={<Waiter url={url} />} />
                        <Route path="/personalize" element={<Customization url={url} />} />
                    </Routes>
                </div>
            ) : (
                <Routes>
                    <Route path="/admin/login" element={<AdminLogin url={url} />} />
                    <Route path="/admin/register" element={<AdminRegister url={url} />} />
                </Routes>
            )}
        </div>
    );
};

export default App;
