import React from "react";
import { motion } from "framer-motion";
import "./AdminFeatures.css";
import { features } from "../../utils/constants";
import { AtomIcon, BeeIcon, ClubIcon, PiggyBankIcon } from '@heroicons/react/solid';

const IconCard = ({ icon }) => {
  return (
    <div className="flex w-full flex-col items-center gap-6 md:max-w-[280px] md:items-start">
      {icon}
      <div className="flex max-w-[280px] flex-col items-center gap-4 text-center md:items-start md:gap-6 md:text-start">
        <p className="text-xl font-semibold tracking-tight">
          Headline
        </p>
        <p className="text-slate-500">
          We've done it carefully and simply. Combined with the ingredients makes for beautiful landings.
        </p>
      </div>
    </div>
  );
};

const AdminFeatures = () => {
  // Animation Variants
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

  return (
    <motion.section
      className="features"
      initial="hidden"
      whileInView="visible" // Animația secțiunii la vizibilitate
      viewport={{ once: true }} // Declanșează o singură dată la prima apariție
      variants={sectionVariants}
      id="features"
    >
       <div
        className="flex w-full min-w-full max-w-lg flex-1 items-center justify-center rounded-2xl bg-slate-50 py-32 lg:min-w-[370px]"
      >
        <img
          src="https://www.tailframes.com/images/illustration.webp"
          alt=""
          width={183}
          height={345}
          sizes="100vw"
          className="h-[172px] w-[91px] md:h-[345px] md:w-[183px]"
        />
      </div>
      <div className="flex flex-col gap-6 lg:gap-12">
        <div className="flex max-w-lg flex-col gap-4">
          <h3 className="text-4xl font-semibold tracking-tight">
            Here is your new
            <br />
            wireframe kit, welcome!
          </h3>
          <p className="text-lg font-normal tracking-tight text-slate-500">
            We've done it carefully and simply.
            <br />
            Combined with the ingredients makes for beautiful landings.
          </p>
        </div>
        <div className="grid w-full grid-flow-row justify-items-start gap-12 md:grid-cols-2 xl:gap-x-32">
          <IconCard  />
          <IconCard  />
          <IconCard  />
          <IconCard  />
        </div>
      </div>
      <div className="features__overlay-gradient"></div>
    </motion.section>
  );
};

export default AdminFeatures;
