import React from 'react';
import { motion } from 'framer-motion';
import './AdminFeatures.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


// Variabile de animație
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const featureVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
};

const AdminFeatures = () => {
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
        Master Your Restaurant’s {" "}
          <span className="h2 features__text-gradient">Workflow</span>
        </h2>
        <p className="text-reg features__subheading">
        Unlock the full potential of your restaurant with Orderly's Admin Management Panel—your all-in-one solution for seamless control, real-time insights, and powerful customization.
        </p>
      </div>
      <div className="row_adminFeatures">
        {/* Column One */}
        <motion.div className="column" custom={0} variants={featureVariants}>
          <div className="card_adminFeatures">
            <div className="icon">
              <i className="fa-solid fa-user"></i>
            </div>
            <h3 className='text-reg'>Effortless Restaurant Management</h3>
            <p className='text-reg'>
            Orderly's Admin Panel makes managing a restaurant simple and intuitive.
             Customize all aspects of your restaurant operations, from hours of operation to daily menus and beyond.
            </p>
          </div>
        </motion.div>
        {/* Column Two */}
        <motion.div className="column" custom={1} variants={featureVariants}>
          <div className="card_adminFeatures">
            <div className="icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3 className='text-reg'>Real-Time Order Notifications</h3>
            <p className='text-reg'>
            tay on top of every order with instant notifications.
             Orderly ensures managers and staff are always aware of new orders, making workflow smoother and more efficient.
            </p>
          </div>
        </motion.div>
        {/* Column Three */}
        <motion.div className="column" custom={2} variants={featureVariants}>
          <div className="card_adminFeatures">
            <div className="icon">
              <i className="fa-solid fa-headset"></i>
            </div>
            <h3 className='text-reg'>24/7 Support & Ticketing System</h3>
            <p className='text-reg'>
            Need assistance? Orderly's dedicated support is available 24/7. Use the integrated ticketing system to submit requests and get prompt help whenever you need it.
            </p>
          </div>
        </motion.div>
         {/* Column Four */}
         <motion.div className="column" custom={3} variants={featureVariants}>
          <div className="card_adminFeatures">
            <div className="icon">
              <i className="fa-solid fa-headset"></i>
            </div>
            <h3 className='text-reg'>Enhanced Security and User Roles</h3>
            <p className='text-reg'>
            Orderly provides a secure environment with two distinct user roles: Admin and Waiter.
             This ensures a streamlined experience, allowing managers to control access and maintain data integrity.</p>
          </div>
        </motion.div>
                 {/* Column Five */}
                 <motion.div className="column" custom={4} variants={featureVariants}>
          <div className="card_adminFeatures">
            <div className="icon">
              <i className="fa-solid fa-headset"></i>
            </div>
            <h3 className='text-reg'>Complete Product Control</h3>
            <p className='text-reg'>
            asily add, edit, and manage products within your restaurant's offerings.
             Keep your menu updated and aligned with customer preferences effortlessly.</p>
          </div>
        </motion.div>
          {/* Column Six */}
          <motion.div className="column" custom={5} variants={featureVariants}>
          <div className="card_adminFeatures">
            <div className="icon">
              <i className="fa-solid fa-headset"></i>
            </div>
            <h3 className='text-reg'>Comprehensive Statistics & Reports</h3>
            <p className='text-reg'>Gain deep insights into orders, sales, and product performance, including best-sellers.
                 Generate detailed PDF reports with a single click, making data analysis quick and easy.</p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AdminFeatures;
