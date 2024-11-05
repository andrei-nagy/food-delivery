import React from "react";
import { motion } from "framer-motion";
import "./HowItWorks.css";
import mockup from "../../assets/mockup.png"; // Exemplu de imagine

const roadmapSteps = [
    {
        title: "Scan QR Code",
        description: "Start by scanning the QR code at the table.",
        image: mockup,
    },
    {
        title: "Explore Menu",
        description: "Browse the menu with images and detailed descriptions.",
        image: mockup,
    },
    {
        title: "Place Order",
        description: "Choose your favorite dishes and place an order.",
        image: mockup,
    },
    {
        title: "Enjoy Your Meal",
        description: "Sit back, relax, and enjoy your meal as it’s prepared.",
        image: mockup,
    },
    {
        title: "Call an action",
        description: "Sit back, relax, and enjoy your meal as it’s prepared.",
        image: mockup,
    }
];

const HowItWorks = () => {
    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const stepVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.9 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { delay: i * 0.2, duration: 0.4 },
        }),
    };

    const arrowVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: {
                duration: 1,
                delay: i * 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
            },
        }),
    };

    return (
        <motion.section
            className="roadmap"
            initial="hidden"
            whileInView="visible"  // Apare când secțiunea intră în vizibilitate
            viewport={{ once: true }} // Animația se va declanșa doar o dată
            variants={sectionVariants}
            id="howitworks"
        >
            <div className="roadmap__heading-container">
                <h2 className="h2 roadmap__heading">
                    Your Journey with{" "}
                    <span className="h2 roadmap__text-gradient">Orderly.</span>
                </h2>
                <p className="text-reg roadmap__subheading">
                    Follow these steps to experience seamless dining with our app.
                </p>
            </div>

            <div className="roadmap__steps-container">
                {roadmapSteps.map((step, i) => (
                    <React.Fragment key={i}>
                        {/* Step Component */}
                        <motion.div
                            className="roadmap__step"
                            custom={i}
                            variants={stepVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }} // începe când 50% din element este vizibil
                        >
                            <p className="text-large roadmap__step-title">{step.title}</p>
                            <img className="roadmap__step-image" src={step.image} alt={step.title} />
                            <p className="text-reg roadmap__step-description font-weight-600">{step.description}</p>
                        </motion.div>

                        {/* Arrow between steps */}
                        {i < roadmapSteps.length - 1 && (
                            <motion.div
                                className="roadmap__arrow"
                                custom={i} // aplică indexul pentru a seta întârzierea fiecărei săgeți
                                variants={arrowVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.5 }}
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M8 4L16 12L8 20"
                                        stroke="#ff7a00"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </motion.div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </motion.section>
    );
};

export default HowItWorks;
