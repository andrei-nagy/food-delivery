import React from 'react';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Add from './pages/Add/Add';
import { List } from './pages/List/List';
import Orders from './pages/Orders/Orders';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddCategory from './pages/AddCategory/AddCategory';
import ListCategory from './pages/ListCategories/ListCategories';
import Waiter from './pages/Waiter/Waiter';
import AdminLogin from './components/Login/AdminLogin';
import AdminRegister from './components/Login/AdminRegister';

const App = () => {
    const url = "http://localhost:4000";

    return (
        <div>
            <ToastContainer></ToastContainer>
            <Navbar></Navbar>
            <hr />
            <div className="app-content">
                <Sidebar />
                <Routes>
                    <Route path="/add" element={<Add url={url} />} />
                    <Route path="/list" element={<List url={url} />} />
                    <Route path="/orders" element={<Orders url={url} />} />
                    <Route path="/addcategory" element={<AddCategory url={url} />} />
                    <Route path="/listcategory" element={<ListCategory url={url} />} />
                    <Route path="/listwaiterrequests" element={<Waiter url={url} />} />
                    <Route path="/admin/login" element={<AdminLogin url={url} />} />
                    <Route path="/admin/register" element={<AdminRegister url={url} />} />
                </Routes>
            </div>
        </div>
    );
};

export default App;
