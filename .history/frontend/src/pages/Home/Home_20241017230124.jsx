import React, { useState, useEffect } from 'react';
import './Home.css';
import Header from '../../components/Header/Header';
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import CheckUser from '../../components/CheckUser/CheckUser';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [category, setCategory] = useState("All");
  const [isValidUser, setIsValidUser] = useState(null); // null pentru că la început nu știm dacă e validat
  const navigate = useNavigate(); 
  const token = localStorage.getItem("token");
  const tableNumber = localStorage.getItem("tableNumber");
  // Funcție care va primi rezultatul validării din CheckUser
  const handleValidation = (isValid) => {
    setIsValidUser(isValid);
  };

  // Efect pentru a face navigarea după validare
  useEffect(() => {
    if (isValidUser === false && token && tableNumber) {
      navigate('/welcome'); // Redirecționăm utilizatorul dacă nu este valid
    }
  }, [isValidUser, navigate]);

  return (
    <div>
      <CheckUser url="http://localhost:4000" onValidation={handleValidation} />

      {/* Afișează conținutul doar dacă user-ul este validat */}
      {isValidUser === true && token && tableNumber ? (
        <>
          <Header />
          <ExploreMenu category={category} setCategory={setCategory} />
          <FoodDisplay category={category} />
        </>
      ) : null}
    </div>
  );
};

export default Home;