import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'


const Footer = () => {


    //New version
    return (
        <div className='footer' id='footer'>
            <div className="footer-content">
                <div className="footer-content-left">
                    <img src={assets.original_logo} alt="" className='logo-footer'/>
                    <p>Orderly, the innovative app designed to revolutionize the dining experience for restaurants, beach bars, and beyond! Our platform streamlines the management process for restaurant owners while enhancing customer satisfaction through a seamless and efficient service.</p>
                    <div className="footer-social-icons">
                        <img src={assets.facebook_icon} alt="" />
                        <img src={assets.twitter_icon} alt="" />
                        <img src={assets.linkedin_icon} alt="" />
                    </div>
                </div>
                <div className="footer-content-center">
                    <h2>About us</h2>
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
            <div>
            <p className="footer-copyright">
               Powered by   <img className='powered-logo' src={assets.original_logo}></img>
            </p>
            </div>
        </div>
    )
}

export default Footer