import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
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

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const url = "http://localhost:4000";

    useEffect(() => {
        // Verifică dacă token-ul este prezent în localStorage
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            navigate('/admin/login'); // Redirecționează la login dacă nu este logat
        }
    }, [navigate]);

    return (
        <div>
            <ToastContainer />
            {isAuthenticated && <Navbar />}  {/* Afișează Navbar doar dacă e logat */}
            <hr />
            <div className="app-content">
                {isAuthenticated && <Sidebar />}  {/* Afișează Sidebar doar dacă e logat */}
                <Routes>
                    <Route path="/admin/login" element={<AdminLogin url={url} />} />
                    <Route path="/admin/register" element={<AdminRegister url={url} />} />
                    {isAuthenticated && (
                        <>
                            <Route path="/add" element={<Add url={url} />} />
                            <Route path="/list" element={<List url={url} />} />
                            <Route path="/orders" element={<Orders url={url} />} />
                            <Route path="/addcategory" element={<AddCategory url={url} />} />
                            <Route path="/listcategory" element={<ListCategory url={url} />} />
                            <Route path="/listwaiterrequests" element={<Waiter url={url} />} />
                        </>
                    )}
                </Routes>
            </div>
        </div>
    );
};

export default App;
