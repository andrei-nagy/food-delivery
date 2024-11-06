import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';
import './ContactForm.css'; // Importul CSS-ului
import { motion } from 'framer-motion';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
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
            'YOUR_SERVICE_ID',           // Replace with your actual Service ID
            'YOUR_TEMPLATE_ID',           // Replace with your actual Template ID
            formData,
            'YOUR_USER_ID'                // Replace with your actual User ID
        )
        .then((response) => {
            toast.success("Email sent successfully!");
            setFormData({ name: '', email: '', message: '' });
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
        id="adminfeatures"
      >
        <div className="features__heading-container">
          <h2 className="h2 features__heading">
          Ready to start {" "}
            <span className="h2 features__text-gradient">a new beginning?</span>
          </h2>
          <p className="text-reg features__subheading">
          Unlock the full potential of your restaurant with Orderly's Admin Management Panel—your all-in-one solution for seamless control, real-time insights, and powerful customization.
          </p>
        </div>
        <div className="contact-container">
            
        <form onSubmit={handleSubmit} className="contact-form">
            <h2>Contact Us</h2>

            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your Message"
                    required
                />
            </div>

            <button type="submit">Send Message</button>
        </form>
    </div>
    </motion.section>
    );
};

export default ContactForm;
