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

 useEffect(() => {
  if (foodCategory_list.length > 0) {
    setIsLoading(false);
  }
}, [foodCategory_list]);
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
