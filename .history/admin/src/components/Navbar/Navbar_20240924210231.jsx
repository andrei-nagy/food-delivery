import React from 'react'
import './Navbar.css'
import {assets} from '../../assets/assets'

const Navbar = () => {
    return (
        <div className="navbar">
            <img className="logo" src={assets.logo} alt="" />
            <img src={assets} alt="" className="profile" />
        </div>
    )
}

export default Navbar