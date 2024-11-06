import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';
import './ContactForm.css'; // Importul CSS-ului

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

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
    );
};

export default ContactForm;
