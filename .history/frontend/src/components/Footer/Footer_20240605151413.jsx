import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'


const Footer = () => {
  return (
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
                <img src={assets.logo} alt="" />
                <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolore dignissimos debitis ipsam possimus libero, maxime amet et facere cupiditate ullam corrupti id aliquam explicabo itaque enim temporibus deleniti quia inventore.</p>
                <div className="footer-social-icons">
                    <img src={assets.facebook_icon} alt="" />
                    <img src={assets.twitter_icon} alt="" />
                    <img src={assets.linkedin_icon} alt="" />
                </div>
            </div>
            <div className="footer-content-center">

            </div>
            <div className="footer-content-right">

            </div>
        </div>
    </div>
  )
}

export default Footer