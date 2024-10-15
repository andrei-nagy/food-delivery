import axios from "axios";
import { createContext, useEffect, useState } from "react";


export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});
    // const currentUrl = window.location.href;
    // const wordToCheck = 'localhost'; 
    // var url = '';
    // if (currentUrl.includes(wordToCheck)) {
    //     alert('intru')
    //      url = "https://localhost:4000";
    // } else {
    //     alert('intru 2') 
    //      url = "https://food-delivery-5mm6.onrender.com";
    // }
 
    // const url = 'https://localhost:4000';
    const url = "https://food-delivery-5mm6.onrender.com";
    const [token, setToken] = useState("");
    const [food_list, setFoodList] = useState([]);
    const [foodCategory_list, setFoodCategoryList] = useState([]);
    const tableNumber = localStorage.getItem('tableNumber');

    const addToCart = async (itemId, quantity) => {
        // Actualizare coș în state
        setCartItems((prev) => {
            const currentQuantity = prev[itemId] || 0; // Obține cantitatea curentă din coș
            const newQuantity = currentQuantity + quantity; // Calculează noua cantitate
            return { ...prev, [itemId]: newQuantity }; // Returnează un nou obiect de stări cu cantitatea actualizată
        });
    
        // Actualizare coș pe server
        if (token) {
            await axios.post(url + "/api/cart/add", { itemId, newQuantity: (prev[itemId] || 0) + quantity }, { headers: { token } });
        }
    };
    

    


    const removeFromCart = async (itemId) => {
        setCartItems((prev) => {
            const newCartItems = { ...prev };
            if (newCartItems[itemId]) {
                newCartItems[itemId] = newCartItems[itemId] > 1 ? newCartItems[itemId] - 1 : 0;
            }
            return newCartItems;
        });

        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
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
        tableNumber
    }

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;
