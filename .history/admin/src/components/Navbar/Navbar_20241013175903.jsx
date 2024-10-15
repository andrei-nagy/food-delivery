import React from 'react'
import './Navbar.css'
import {assets} from '../../assets/assets'
import { useNavigate } from 'react-router-dom';

const Navbar = () => {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken'); // Șterge token-ul din localStorage
        navigate('/admin/login');  // Redirecționează la login
    };

    return (
        <div className="navbar">
            <img className="logo" src={assets.logo} alt="" />
            <button onClick={handleLogout}>Logout</button>
            <img src={assets.profile_image} alt="" className="profile" />
        </div>
    )
}

export default Navbar