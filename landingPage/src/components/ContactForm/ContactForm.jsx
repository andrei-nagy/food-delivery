import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';
import './ContactForm.css'; // Importul CSS-ului
import { motion } from 'framer-motion';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        restaurantName: '',
        message: '',
        contactPhone: '',
        contactEmail: ''
    });

    // Variabile de animație
const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        emailjs.send(
            'service_jcgj69o',           // Replace with your actual Service ID
            'template_nue6nny',           // Replace with your actual Template ID
            formData,
            'Rw7daoMmQiW-EUsnH'                // Replace with your actual User ID
        )
        .then((response) => {
            toast.success("Email sent successfully!");
            setFormData({ name: '', restaurantName: '', contactPhone: '', contactEmail: '', message: '' });
        })
        .catch((error) => {
            console.error("Error sending email:", error);
            toast.error("Failed to send email. Please try again.");
        });
    };

    return (
        <motion.section
        className="adminFeatures"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
        id="requestDemo"
      >
        <div className="features__heading-container">
          <h2 className="h2 features__heading">
          Ready to start your journey with{" "}
            <span className="h2 features__text-gradient">Orderly?</span>
          </h2>
          <p className="text-reg features__subheading">
          Unlock the full digital potential of your restaurant with Orderly's App & Admin Management Panel—your all-in-one solution for seamless control, real-time insights, and powerful customization.
          </p>
        </div>
        <div className="contact-container">
            
        <form onSubmit={handleSubmit} className="contact-form">
            <h2>Contact Us</h2>

            <div className="form-group mt-5">
                <label htmlFor="name">Let’s get to know you! What’s <span className="contact__text-gradient">your full name</span>?</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                />
            </div>
        
            <div className="form-group mt-5">
                <label htmlFor="email">What’s your <span className="contact__text-gradient">Restaurant’s name</span>?</label>
                <input
                    type="text"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    placeholder="Your Restaurant Name"
                    required
                />
            </div>
            <div className="form-group mt-5">
                <label htmlFor="email">Kindly provide your <span className="contact__text-gradient">contact details</span>.</label>
                <input
                    type="text"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="Your Email"
                    required
                />
                  <input
                    type="text"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="Your phone number"
                    required
                />
            </div>
            <div className="form-group mt-5">
                <label htmlFor="message">What <span className="contact__text-gradient">services</span> are you interested in?</label>
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your Message"
                    required
                />
            </div>

            <button type="submit">Submit</button>
        </form>
    </div>
    </motion.section>
    );
};

export default ContactForm;
