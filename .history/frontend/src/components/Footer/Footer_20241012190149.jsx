import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'


const Footer = () => {
    return (
        <div className='footer' id='footer'>
            <div className="footer-content">
                <div className="footer-content-left">
                    <img src={assets.logo3} alt="" className='logo-footer'/>
                    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolore dignissimos debitis ipsam possimus libero, maxime amet et facere cupiditate ullam corrupti id aliquam explicabo itaque enim temporibus deleniti quia inventore.</p>
                    <div className="footer-social-icons">
                        <img src={assets.facebook_icon} alt="" />
                        <img src={assets.twitter_icon} alt="" />
                        <img src={assets.linkedin_icon} alt="" />
                    </div>
                </div>
                <div className="footer-content-center">
                    <h2>COMPANY NAME</h2>
                    <ul>
                        <li>Home</li>
                        <li>About us</li>
                        <li>Delivery</li>
                        <li>Privacy policy</li>
                    </ul>
                </div>
                <div className="footer-content-right">
                    <h2>GET IN TOUCH</h2>
                    <ul>
                        <li>+1 256 569 856</li>
                        <li>andreixfr@gmail.com</li>
                    </ul>
                </div>
            </div>
            <hr />
            <p className="footer-copyright">
                Copyright 2024 @ Andrei Nagy - All Rights Reserved
            </p>
        </div>
    )
}

export default Footer