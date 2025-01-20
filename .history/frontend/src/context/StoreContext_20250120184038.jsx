import axios from "axios";
import { createContext, useEffect, useState } from "react";


export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});
 // Determine the base URL based on the environment
 const currentHost = window.location.hostname;
 const url = currentHost === "localhost" || currentHost === "127.0.0.1" ? 
     "http://localhost:4000" : 
     "https://api.orderly-app.com";

    // const url = "https://food-delivery-5mm6.onrender.com";
    const [token, setToken] = useState("");
    const [food_list, setFoodList] = useState([]);
    const [foodCategory_list, setFoodCategoryList] = useState([]);
    const tableNumber = localStorage.getItem('tableNumber');

    const addToCart = async (itemId, quantity, specialInstructions ) => {
        // Obține cantitatea curentă înainte de actualizare
        const currentQuantity = cartItems[itemId] || 0;
        const newQuantity = currentQuantity + quantity;
    
        // Actualizare coș în state
        setCartItems((prev) => ({
            ...prev,
            [itemId]: newQuantity,
        }));
    
        // Actualizare coș pe server
        if (token) {
            try {
                await axios.post(url + "/api/cart/add", { itemId, newQuantity, specialInstructions  }, { headers: { token } });
            } catch (error) {
                console.error("Error adding to cart:", error);
            }
        }
    };
    
    
    

    


    const removeFromCart = async (itemId) => {
        setCartItems((prev) => {
            const newCartItems = { ...prev };
            if (newCartItems[itemId]) {
                newCartItems[itemId] = newCartItems[itemId] > 1 ? newCartItems[itemId] - 1 : 0;
                // Dacă cantitatea devine 0, poți să elimini item-ul din coș
                if (newCartItems[itemId] === 0) {
                    delete newCartItems[itemId];
                }
            }
            return newCartItems;
        });
    
        if (token) {
            try {
                await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
            } catch (error) {
                console.error("Error removing from cart:", error);
            }
        }
    };

    
 // Funcția pentru actualizarea cantității unui produs din coș
 const updateCartItemQuantity = (itemId, newQuantity) => {
    // Verificăm dacă cantitatea este 0 sau mai mică, caz în care eliminăm produsul din coș
    if (newQuantity <= 0) {
      const newCartItems = { ...cartItems };
      delete newCartItems[itemId];
      setCartItems(newCartItems);
    } else {
      // Actualizăm cantitatea produsului în coș
      setCartItems(prevItems => ({
        ...prevItems,
        [itemId]: newQuantity,
      }));
    }
  };

   
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                totalAmount += itemInfo.price * cartItems[item];
            }
        }
        return totalAmount;
    };


    const fetchFoodList = async () => {
        const response = await axios.get(url + "/api/food/list");
        setFoodList(response.data.data);

    }
    const fetchFoodCategoryList = async () => {
        const response = await axios.get(url + "/api/categories/listcategory");
        setFoodCategoryList(response.data.data);

    }

    const loadCartData = async (token) => {
            const response = await axios.post(url + "/api/cart/get", {}, {headers: {token}})
            setCartItems(response.data.cartData);
    }
    useEffect(() => {

        async function loadData() {
            await fetchFoodList();
            await fetchFoodCategoryList();
            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"));
                await loadCartData(localStorage.getItem("token")); // Încărcăm coșul de pe server

            }
        }
        loadData();
    }, [])
    const contextValue = {
        food_list,
        foodCategory_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        tableNumber,
        updateCartItemQuantity
    }

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;
