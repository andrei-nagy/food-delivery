import React, { useState, useEffect } from 'react';
import './Home.css';
import Header from '../../components/Header/Header';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import Loader from '../../components/Loader/Loader'; // 👈 import nou
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';

const Home = () => {
  const [category, setCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
const { foodCategory_list } = useContext(StoreContext);

  // Simulăm un "load"
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false); // după 1 sec, loaderul dispare
    }, 2000); // poți ajusta la cât simți că e nevoie

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Header />
          <ExploreMenu category={category} setCategory={setCategory} />
          <FoodDisplay category={category} />
        </>
      )}
    </motion.div>
  );
};

export default Home;
