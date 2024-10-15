import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const url = "https://food-delivery-5mm6.onrender.com";
    const [token, setToken] = useState("");
    const [food_list, setFoodList] = useState([]);
    const [foodCategory_list, setFoodCategoryList] = useState([]);
    const tableNumber = localStorage.getItem('tableNumber');

    const loadCartFromLocalStorage = () => {
        const storedCartItems = localStorage.getItem('cartItems');
        if (storedCartItems) {
            setCartItems(JSON.parse(storedCartItems));
        }
    };

    const saveCartToLocalStorage = (items) => {
        localStorage.setItem('cartItems', JSON.stringify(items));
    };

    const addToCart = async (itemId, quantity) => {
        setCartItems((prev) => {
            const newCartItems = {
                ...prev,
                [itemId]: (prev[itemId] || 0) + quantity,
            };
            saveCartToLocalStorage(newCartItems); // Salvează în localStorage
            return newCartItems;
        });

        if (token) {
            await axios.post(url + "/api/cart/add", { itemId, quantity }, { headers: { token } });
        }
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => {
            const newCartItems = {
                ...prev,
                [itemId]: prev[itemId] > 1 ? prev[itemId] - 1 : 0,
            };
            saveCartToLocalStorage(newCartItems); // Salvează în localStorage
            return newCartItems;
        });

        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
        }
    };

    useEffect(() => {
        loadCartFromLocalStorage(); // Încărcăm cartItems din localStorage
    }, []);

    const fetchFoodList = async () => {
        const response = await axios.get(url + "/api/food/list");
        setFoodList(response.data.data);
    };

    const fetchFoodCategoryList = async () => {
        const response = await axios.get(url + "/api/categories/listcategory");
        setFoodCategoryList(response.data.data);
    };

    const loadCartData = async (token) => {
        const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
        setCartItems(response.data.cartData);
    };

    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            await fetchFoodCategoryList();
            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"));
                await loadCartData(localStorage.getItem("token"));
            }
        }
        loadData();
    }, []);

    const contextValue = {
        food_list,
        foodCategory_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        url,
        token,
        setToken,
        tableNumber,
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
