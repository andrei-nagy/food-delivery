import axios from "axios";
import { createContext, useEffect, useState, useRef } from "react";
export const StoreContext = createContext(null);
import { toast } from "react-toastify";

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [foodCategory_list, setFoodCategoryList] = useState([]);
  const tableNumber = localStorage.getItem("tableNumber");
const [isUpdatingCart, setIsUpdatingCart] = useState(false);
  const [notification, setNotification] = useState(null);
  const [previousOrderStatus, setPreviousOrderStatus] = useState({});
  const [userOrders, setUserOrders] = useState([]);
  const intervalRef = useRef(null);
  const previousOrderStatusRef = useRef({});

  const getApiUrl = () => {
    // Dacă suntem pe localhost în browser, folosim localhost
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://localhost:4000";
    }
    // Altfel folosim producția
    return "https://api.orderly-app.com";
  };

  const url = getApiUrl();

 

  const validateCartStructure = (cart) => {
    if (!cart || typeof cart !== "object") {
      return {};
    }

    const validatedCart = {};

    Object.keys(cart).forEach((itemId) => {
      const item = cart[itemId];

      if (typeof item === "number") {
        validatedCart[itemId] = {
          quantity: item,
          specialInstructions: "",
          selectedOptions: [],
          itemData: {
            baseFoodId: itemId.split("_")[0],
            unitPrice: 0,
            extrasPrice: 0,
          },
        };
      } else if (typeof item === "object" && item !== null) {
        validatedCart[itemId] = {
          quantity: item.quantity || 0,
          specialInstructions: item.specialInstructions || "",
          selectedOptions: item.selectedOptions || [],
          itemData: item.itemData || {
            baseFoodId: itemId.split("_")[0],
            unitPrice: 0,
            extrasPrice: 0,
          },
        };
      }
    });

    return validatedCart;
  };

  const clearLocalCartAndLogout = () => {
    setCartItems({});
    localStorage.removeItem("cartItems");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("tableNumber");
    setToken("");
    setNotification(
      "Sesiunea a expirat. Vă rugăm să vă autentificați din nou."
    );
  };

// StoreContext.jsx - CORECT
const getUserId = () => {
  console.log("🔍 DEBUG GETUSERID");
  
  // ✅ DIRECT din localStorage.userId
  const userId = localStorage.getItem('userId');
  console.log("🆔 UserId from localStorage.userId:", userId);
  
  if (userId) {
    console.log("✅ Found user ID:", userId);
    return userId;
  }

  // ✅ Fallback pentru table users
  const tableNumber = localStorage.getItem('tableNumber');
  if (tableNumber) {
    console.log("🍽️ Table user detected:", tableNumber);
    return "table_" + tableNumber;
  }

  console.log("❌ No user ID found");
  return null;
};

  const isTokenValid = () => {
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      if (payload.exp && payload.exp < currentTime) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  // const forceSyncInstructions = async (itemId, specialInstructions) => {
  //   const userId = getUserId();

  //   if (userId && isTokenValid()) {
  //     try {
  //       await axios.post(
  //         url + "/api/cart/update-instructions",
  //         {
  //           userId: userId,
  //           itemId: itemId,
  //           specialInstructions: specialInstructions,
  //         },
  //         { headers: { token } }
  //       );
  //     } catch (error) {
  //       // Error handled silently
  //     }
  //   }
  // };

const startCartPolling = () => {
  // ✅ NU PORNII POLLING DACĂ SE FAC UPDATE-URI
  if (isUpdatingCart || intervalRef.current) {
    return;
  }

  fetchCartFromServer();
  intervalRef.current = setInterval(fetchCartFromServer, 3000);
};

  const fetchCartFromServer = async () => {
    const tableNumber = localStorage.getItem("tableNumber");

    if (tableNumber) {
      try {
        const response = await axios.post(url + "/api/cart/get-by-table", {
          tableNumber: parseInt(tableNumber),
        });

        if (response.data.success) {
          const serverCart = response.data.cartData || {};

          const validatedCart = validateCartStructure(serverCart);
          setCartItems(validatedCart);
          // localStorage.setItem("cartItems", JSON.stringify(validatedCart));
        }
      } catch (error) {
        console.error("❌ Error fetching table cart:", error);
      }
    }
  };

  const loadCachedCart = () => {
    try {
      const savedCart = localStorage.getItem("cartItems");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        const validatedCart = validateCartStructure(parsedCart);
        setCartItems(validatedCart);
      }
    } catch (error) {
      // Error handled silently
    }
  };

  const clearCartCache = () => {
    setCartItems({});
    localStorage.removeItem("cartItems");
  };

  const fetchUserOrders = async () => {
    if (!token) return;

    try {
      const response = await axios.post(
        url + "/api/order/userOrders",
        {},
        { headers: { token } }
      );

      if (response.data && response.data.data) {
        const unpaidOrders = response.data.data.filter(
          (order) => !order.payment
        );
        setUserOrders(unpaidOrders);
        checkStatusChanges(unpaidOrders);
      }
    } catch (error) {
      if (error.response?.data?.clearCart) {
        clearLocalCartAndLogout();
      }
    }
  };

  const checkStatusChanges = (newOrders) => {
    const newStatusMap = {};
    newOrders.forEach((order) => {
      if (order && order._id) {
        newStatusMap[order._id] = order.status;
      }
    });

    let hasChanges = false;

    Object.keys(previousOrderStatusRef.current).forEach((orderId) => {
      if (
        newStatusMap[orderId] &&
        previousOrderStatusRef.current[orderId] !== newStatusMap[orderId]
      ) {
        showStatusNotification(newStatusMap[orderId]);
        hasChanges = true;
      }
    });

    previousOrderStatusRef.current = newStatusMap;
    setPreviousOrderStatus(newStatusMap);
  };

  const showStatusNotification = (status) => {
    let message = "";

    switch (status) {
      case "Food processing":
        message = "Comanda dumneavoastră a fost preluată și este în preparare";
        break;
      case "Out for delivery":
        message = "Comanda dumneavoastră este în curs de livrare";
        break;
      case "Delivered":
        message = "Comanda dumneavoastră a fost livrată";
        break;
      default:
        message = `Statusul comenzii s-a actualizat: ${status}`;
    }

    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 10000);
  };

  useEffect(() => {
    if (token) {
      // loadCachedCart();
      // // ✅ COMENTAT TEMPORAR pentru debugging
      startCartPolling();
      fetchUserOrders();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [token]);

  const addToCart = async (
    itemId,
    quantity,
    specialInstructions,
    selectedOptions,
    itemData
  ) => {
    const tableNumber = localStorage.getItem("tableNumber");

    if (!tableNumber) {
      return;
    }

    // ✅ UPDATE LOCAL FIRST
    setCartItems((prev) => {
      const newCart = { ...prev };

      if (!newCart[itemId]) {
        newCart[itemId] = {
          quantity: quantity,
          specialInstructions: specialInstructions || "",
          selectedOptions: selectedOptions || [],
          itemData: itemData || {
            baseFoodId: itemId.split("_")[0],
            unitPrice: 0,
            extrasPrice: 0,
          },
        };
      } else {
        newCart[itemId] = {
          ...newCart[itemId],
          quantity: newCart[itemId].quantity + quantity,
          specialInstructions:
            specialInstructions || newCart[itemId].specialInstructions,
          selectedOptions: selectedOptions || newCart[itemId].selectedOptions,
        };
      }

      // localStorage.setItem("cartItems", JSON.stringify(newCart));
      return newCart;
    });

    // ✅ SYNC TO SERVER BY TABLE NUMBER
    try {
      const response = await axios.post(url + "/api/cart/add-by-table", {
        tableNumber: parseInt(tableNumber),
        itemId: itemId,
        quantity: quantity,
        specialInstructions: specialInstructions,
        selectedOptions: selectedOptions,
        itemData: itemData,
      });
    } catch (error) {
      console.error("❌ TABLE CART SYNC ERROR:", error);
    }
  };


// StoreContext.jsx - CORECTAT

// ✅ removeFromCart - șterge doar un item (scade cantitatea)
const removeFromCart = async (itemId, quantity = 1) => {
  try {

    const tableNumber = localStorage.getItem("tableNumber"); // ✅ IA TABLE NUMBER
    if (!tableNumber) {
      toast.error("Please select a table first");
      return;
    }

    // ✅ 1. ACTUALIZEAZĂ LOCAL STATE FIRST (pentru feedback imediat)
    setCartItems(prev => {
      const newCart = { ...prev };
      if (newCart[itemId]) {
        const newQuantity = newCart[itemId].quantity - quantity;
        
        if (newQuantity <= 0) {
          delete newCart[itemId]; // Șterge item-ul dacă cantitatea devine 0
        } else {
          newCart[itemId] = {
            ...newCart[itemId],
            quantity: newQuantity
          };
        }
      }
      return newCart;
    });

    // ✅ 2. TRIMITE LA BACKEND CU TABLE NUMBER
    const response = await axios.post(url + "/api/cart/remove", {
      userId: "table_" + tableNumber, // ✅ "table_15"
      itemId,
      quantity
    });


 
  } catch (error) {
    console.error("❌ Error removing from cart:", error);
    toast.error("Error updating item");
  }
};

// ✅ removeItemCompletely - șterge complet un item (indiferent de cantitate)
const removeItemCompletely = async (itemId) => {
  try {

    const tableNumber = localStorage.getItem("tableNumber"); // ✅ IA TABLE NUMBER
    if (!tableNumber) {
      toast.error("Please select a table first");
      return;
    }

    // ✅ 1. ȘTERGE IMEDIAT DIN STATE-UL LOCAL
    setCartItems(prev => {
      const newCart = { ...prev };
      delete newCart[itemId];
      console.log("🔥 IMMEDIATE REMOVE from local state");
      return newCart;
    });

    // ✅ 2. TRIMITE LA BACKEND PENTRU ȘTERGERE COMPLETĂ CU TABLE NUMBER
    const response = await axios.post(url + "/api/cart/remove-item-completely", {
      userId: "table_" + tableNumber, // ✅ "table_15"
      itemId
    });




  } catch (error) {
    console.error("❌ Error removing item completely:", error);
    toast.error("Error removing item");
  }
};

// ✅ clearCart - șterge TOT coșul (folosește tableNumber pentru coșul shared)
const clearCart = async () => {
  try {
    console.log("🔥 [STORECONTEXT] START clearCart");
    
    const tableNumber = localStorage.getItem("tableNumber");
    console.log("🔥 [STORECONTEXT] TableNumber:", tableNumber);
    
    if (!tableNumber) {
      console.log("❌ [STORECONTEXT] No table number found");
      toast.error("Please select a table first");
      return;
    }

    // ✅ OPREȘTE POLLING-UL TEMPORAR
    if (intervalRef.current) {
      console.log("🛑 [STORECONTEXT] Stopping polling");
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // ✅ ȘTERGE IMEDIAT DIN STATE-UL LOCAL
    console.log("🗑️ [STORECONTEXT] Clearing local state");
    setCartItems({});
    localStorage.removeItem("cartItems");
    
    console.log("🔥 [STORECONTEXT] Local cart cleared");

    // ✅ TRIMITE TABLE NUMBER CA "table_15"
    console.log("🌐 [STORECONTEXT] Sending request to backend...");
    const response = await axios.post(url + "/api/cart/clear", {
      userId: "table_" + tableNumber  // ✅ "table_15"
    });

    console.log("🔥 [STORECONTEXT] Backend response:", response.data);

    if (response.data.success) {
      console.log("✅ [STORECONTEXT] Table cart cleared successfully in database");
      setCartItems(response.data.cartData || {});
    } else {
      console.log("❌ [STORECONTEXT] Backend failed:", response.data.message);
    }

    // ✅ RESTARTEAZĂ POLLING DUPĂ 3 SECUNDE
    setTimeout(() => {
      console.log("🔄 [STORECONTEXT] Restarting polling");
      startCartPolling();
    }, 3000);

  } catch (error) {
    console.error("❌ [STORECONTEXT] Error in clearCart:", error);
    
    setTimeout(() => {
      startCartPolling();
    }, 3000);
    
    throw error;
  }
};
const updateCartItemQuantity = async (
  itemId,
  newQuantity,
  specialInstructions = ""
) => {
  // ✅ OPREȘTE POLLING-UL TEMPORAR
  setIsUpdatingCart(true);
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  const tableNumber = localStorage.getItem("tableNumber"); // ✅ IA TABLE NUMBER
  if (!tableNumber) {
    toast.error("Please select a table first");
    setIsUpdatingCart(false);
    return;
  }

  const updatedCart = { ...cartItems };

  if (newQuantity <= 0) {
    delete updatedCart[itemId];
  } else {
    updatedCart[itemId] = {
      ...updatedCart[itemId],
      quantity: newQuantity,
      specialInstructions: specialInstructions,
    };
  }

  setCartItems(updatedCart);
  localStorage.setItem("cartItems", JSON.stringify(updatedCart));

  // if (specialInstructions && specialInstructions.trim() !== "") {
  //   await forceSyncInstructions(itemId, specialInstructions);
  // }

  // ✅ TRIMITE TABLE NUMBER ÎN LOC DE USER ID
  try {
    const response = await axios.post(
      url + "/api/cart/update",
      {
        userId: "table_" + tableNumber, // ✅ "table_15"
        itemId,
        newQuantity,
        specialInstructions,
      }
    );

    if (response.data.success && response.data.cartData) {
      const validatedCart = validateCartStructure(response.data.cartData);
      setCartItems(validatedCart);
      localStorage.setItem("cartItems", JSON.stringify(validatedCart));
    }
  } catch (error) {
    if (error.response?.data?.clearCart) {
      clearLocalCartAndLogout();
    }
  }

  // ✅ RESTARTEAZĂ POLLING-UL DUPĂ 5 SECUNDE
  setTimeout(() => {
    setIsUpdatingCart(false);
    startCartPolling();
  }, 5000);
};

  const getTotalCartAmount = () => {
    let totalAmount = 0;

    Object.keys(cartItems).forEach((itemId) => {
      const cartItem = cartItems[itemId];

      if (cartItem && cartItem.quantity > 0) {
        const baseFoodId = itemId.split("__")[0];
        const foodItem = food_list.find((item) => item._id === baseFoodId);

        if (foodItem) {
          let itemTotal = foodItem.price * cartItem.quantity;

          if (cartItem.selectedOptions && cartItem.selectedOptions.length > 0) {
            cartItem.selectedOptions.forEach((optionName) => {
              const extra = foodItem.extras?.find(
                (extra) => extra.name === optionName
              );
              if (extra) {
                itemTotal += extra.price * cartItem.quantity;
              }
            });
          }

          totalAmount += itemTotal;
        }
      }
    });

    return totalAmount;
  };

  const getTotalItemCount = () => {
    const total = Object.values(cartItems).reduce((total, item) => {
      if (item && typeof item.quantity === "number") {
        return total + item.quantity;
      }
      return total;
    }, 0);
    return total;
  };

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      setFoodList(response.data.data);
    } catch (error) {
      // Error handled silently
    }
  };

  const fetchFoodCategoryList = async () => {
    try {
      const response = await axios.get(url + "/api/categories/listcategory");
      setFoodCategoryList(response.data.data);
    } catch (error) {
      // Error handled silently
    }
  };

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("token");
    if (tokenFromStorage) {
      setToken(tokenFromStorage);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      await fetchFoodCategoryList();
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
    getTotalCartAmount,
    getTotalItemCount,
    url,
    token,
    setToken,
    tableNumber,
    updateCartItemQuantity,
    removeItemCompletely,
    notification,
    setNotification,
    userOrders,
    fetchUserOrders,
    getUserId,
    clearLocalCartAndLogout,
    fetchCartFromServer,
    clearCartCache,
    clearCart
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
