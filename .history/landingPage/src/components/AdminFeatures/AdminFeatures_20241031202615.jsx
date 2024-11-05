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
        Where Restaurant Management Meet {" "}
          <span className="h2 features__text-gradient">Innovation</span>
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
            <h3 className='text-reg'>User Friendly</h3>
            <p className='text-reg'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis
              asperiores natus ad molestiae aliquid explicabo. Iste eaque quo et
              commodi.
            </p>
          </div>
        </motion.div>
        {/* Column Two */}
        <motion.div className="column" custom={1} variants={featureVariants}>
          <div className="card_adminFeatures">
            <div className="icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3 className='text-reg'>Super Secure</h3>
            <p className='text-reg'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis
              asperiores natus ad molestiae aliquid explicabo. Iste eaque quo et
              commodi.
            </p>
          </div>
        </motion.div>
        {/* Column Three */}
        <motion.div className="column" custom={2} variants={featureVariants}>
          <div className="card_adminFeatures">
            <div className="icon">
              <i className="fa-solid fa-headset"></i>
            </div>
            <h3 className='text-reg'>Quick Support</h3>
            <p className='text-reg'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis
              asperiores natus ad molestiae aliquid explicabo. Iste eaque quo et
              commodi.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AdminFeatures;
