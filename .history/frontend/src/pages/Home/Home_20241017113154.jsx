import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import CheckUser from '../../components/CheckUser/CheckUser'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const [category, setCategory] = useState("All");
  const [isValidUser, setIsValidUser] = useState(null); // null pentru că la început nu știm dacă e validat
  const navigate = useNavigate();

  // Funcție care va primi rezultatul validării din CheckUser
  const handleValidation = (isValid) => {
    setIsValidUser(isValid);
  };

  return (
    <div>
      <CheckUser url="http://localhost:4000" onValidation={handleValidation} />

      {/* Afișează conținutul doar dacă user-ul este validat */}
      {isValidUser === true ? (
        <>
          <Header />
          <ExploreMenu category={category} setCategory={setCategory} />
          <FoodDisplay category={category} />
        </>
      ) : isValidUser === false ? (
        // navigate('/welcome')
        <p>EREGERGREGR</p>
      ) : (
        <p>Validating user...</p> // Loader temporar până când primim răspuns
      )}
    </div>
  );
};

export default Home;
