import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import CheckUser from '../../components/CheckUser/CheckUser'

const Home = () => {

  const [category, setCategory] = useState("All");


  return (
    <div>
      <CheckUser url="http://localhost:4000" />
      <Header></Header>
      <ExploreMenu category={category} setCategory={setCategory}></ExploreMenu>
      <FoodDisplay category={category}></FoodDisplay>
    </div>
  )
}

export default Home