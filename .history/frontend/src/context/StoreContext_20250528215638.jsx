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

    const [token, setToken] = useState("");
    const [food_list, setFoodList] = useState([]);
    const [foodCategory_list, setFoodCategoryList] = useState([]);
    const tableNumber = localStorage.getItem('tableNumber');
    



    useEffect(() => {
        const fetchCart = async () => {
            if (!token) return;
    
            try {
                const response = await axios.post(
                    url + "/api/cart/get",
                    {},
                    { headers: { token } }
                );
    
                if (response.data.cartData) {
                    setCartItems(response.data.cartData);
                }
            } catch (error) {
                console.error("Error fetching cart:", error);
            }
        };
    
        fetchCart();
    }, [token]);

    const addToCart = async (itemId, quantity, specialInstructions ) => {
        const currentQuantity = cartItems[itemId] || 0;
        const newQuantity = currentQuantity + quantity;
    
        setCartItems((prev) => ({
            ...prev,
            [itemId]: newQuantity,
        }));
    console.log("Adding to cart:", itemId, "Quantity:", newQuantity);

        if (token) {
            try {
                await axios.post(url + "/api/cart/add", { itemId, newQuantity, specialInstructions  }, { headers: { token } });
            } catch (error) {
                console.error("Error adding to cart:", error);
            }
        }
    };
    
    const removeFromCart = async (itemId, quantity = 1) => {
        setCartItems((prev) => {
            const newCartItems = { ...prev };
            if (newCartItems[itemId]) {
                newCartItems[itemId] = newCartItems[itemId] - quantity;
                if (newCartItems[itemId] <= 0) {
                    delete newCartItems[itemId];
                }
            }
            return newCartItems;
        });
    
        if (token) {
            try {
                await axios.post(url + "/api/cart/remove", { itemId, quantity }, { headers: { token } });
            } catch (error) {
                console.error("Error removing from cart:", error);
            }
        }
    };

    const removeItemCompletely = async (itemId) => {
        try {
          await axios.post(url + "/api/cart/remove-item-completely", {
            itemId,
            userId: localStorage.getItem("userId")
          }, {
            headers: { token }
          });
      
          setCartItems((prev) => {
            const updatedCart = { ...prev };
            delete updatedCart[itemId];
            return updatedCart;
          });
        } catch (err) {
          console.error("Error removing item completely:", err);
        }
      };
      
    const updateCartItemQuantity = async (itemId, newQuantity, specialInstructions = "") => {
    
        // Copiem local cart-ul
        const updatedCart = { ...cartItems };
    
        if (newQuantity <= 0) {
            delete updatedCart[itemId];
        } else {
            updatedCart[itemId] = newQuantity;
        }
    
        // Actualizăm local UI-ul rapid
        setCartItems(updatedCart);
    
        if (token) {
            try {
                const response = await axios.post(
                    url + "/api/cart/update",
                    { itemId, newQuantity, specialInstructions },
                    { headers: { token } }
                );

    
                // Actualizăm cart-ul local cu ce vine de la server pentru sincronizare
                if (response.data.cartData) {
                    setCartItems(response.data.cartData);
                    localStorage.setItem("cartItems", JSON.stringify(response.data.cartData));
                } else {
                    console.warn("Server response did not contain cartData");
                }
    
            } catch (error) {
                console.error("Error updating cart on server:", error);
                // Optional rollback:
                // console.log("Rolling back cartItems to previous state");
                // setCartItems(cartItems);
            }
        } else {
            console.warn("No token found, skipping server update");
        }
    };
    

      
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo) {  
                    totalAmount += itemInfo.price * cartItems[item];
                }
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
        try {
          const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
          if (response.data.cartData) {
            setCartItems(response.data.cartData);

            localStorage.setItem("cartItems", JSON.stringify(response.data.cartData));
          }
        } catch (e) {
          console.error("Failed to load cart data", e);
        }
      }
      

    // Set token from localStorage la montare componentă
    useEffect(() => {
        const tokenFromStorage = localStorage.getItem("token");
        if (tokenFromStorage) {
            setToken(tokenFromStorage);
        }
    }, []);

    // Când token se schimbă (setat), încărcăm coșul de pe server
    useEffect(() => {
        if (token) {
            loadCartData(token);
        }
    }, [token]);

    // Dacă nu există token, încercăm să încărcăm coșul din localStorage
    useEffect(() => {
        if (!token) {
            const savedCart = localStorage.getItem("cartItems");
            if (savedCart) {
                try {
                    setCartItems(JSON.parse(savedCart));
                    console.log("Loaded cart from localStorage");
                } catch {
                    console.warn("Failed to parse cart from localStorage");
                }
            }
        }
    }, [token]);

    // Salvăm cartItems în localStorage la orice schimbare
    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    // La montare încărcăm lista de produse și categorii
    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            await fetchFoodCategoryList();
            // token și loadCartData se ocupă separat în celelalte useEffect-uri
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
        updateCartItemQuantity,
        removeItemCompletely
    }

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;
