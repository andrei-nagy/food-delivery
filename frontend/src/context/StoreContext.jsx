import axios from "axios";
import { createContext, useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

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
  const [userBlocked, setUserBlocked] = useState(false);

  // State-uri pentru sistemul de bill (notă de plată) - ACUM SINCRONIZATE
  const [billRequested, setBillRequested] = useState(false);
  const [billRequestTime, setBillRequestTime] = useState(null);

  // ✅ NOU: State-uri pentru sistemul de timp de sesiune
  const [sessionTimeLeft, setSessionTimeLeft] = useState("");
  const [sessionExpiry, setSessionExpiry] = useState(null);

  const intervalRef = useRef(null);
  const previousOrderStatusRef = useRef({});
  const ordersIntervalRef = useRef(null);
  const statusPollingIntervalRef = useRef(null);
  const sessionTimerRef = useRef(null);

  const getApiUrl = () => {
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://localhost:4000";
    }
    return "https://api.orderly-app.com";
  };

  const url = getApiUrl();

  // ==================== SESSION TIME MANAGEMENT SYSTEM ====================

  // ✅ FUNCȚIE PENTRU A ACTUALIZA TIMPUL SESIUNII ÎN CONTEXT
  const updateSessionTime = (newExpiry) => {
    setSessionExpiry(newExpiry);
    
    // Calculează timpul rămas imediat
    if (newExpiry) {
      const now = new Date();
      const expiry = new Date(newExpiry);
      const difference = expiry - now;

      if (difference <= 0) {
        setSessionTimeLeft("Expired");
      } else {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
          setSessionTimeLeft(`${hours}h ${minutes}m`);
        } else if (minutes > 0) {
          setSessionTimeLeft(`${minutes}m`);
        } else {
          setSessionTimeLeft("0m");
        }
      }
    } else {
      setSessionTimeLeft("");
    }
  };

  // ✅ FUNCȚIE PENTRU A CALCULA ȘI ACTUALIZA TIMPUL RĂMAS
  const calculateAndSetTime = (expiryDate = sessionExpiry) => {
    if (!expiryDate) {
      setSessionTimeLeft("");
      return;
    }

    const now = new Date();
    const expiry = new Date(expiryDate);
    const difference = expiry - now;

    if (difference <= 0) {
      setSessionTimeLeft("Expired");
    } else {
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setSessionTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setSessionTimeLeft(`${minutes}m`);
      } else {
        setSessionTimeLeft("0m");
      }
    }
  };

  // ✅ EFECT PENTRU TIMER-UL AUTOMAT AL SESIUNII
  useEffect(() => {
    if (sessionExpiry) {
      // Actualizează imediat
      calculateAndSetTime();

      // Setează interval pentru actualizări continue
      sessionTimerRef.current = setInterval(() => {
        calculateAndSetTime();
      }, 60000); // Actualizează la fiecare minut

      return () => {
        if (sessionTimerRef.current) {
          clearInterval(sessionTimerRef.current);
        }
      };
    } else {
      setSessionTimeLeft("");
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    }
  }, [sessionExpiry]);

  // ==================== USER STATUS POLLING SYSTEM ====================

  const checkUserStatus = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      setUserBlocked(false);
      setSessionExpiry(null);
      setSessionTimeLeft("");
      return;
    }

    try {
      const response = await axios.post(
        `${url}/api/user/check-status`,
        {},
        {
          headers: { userId },
        }
      );

      const { isActive, tokenExpiry } = response.data;
      const now = new Date();

      // ✅ VERIFICĂ DACA STATUSUL S-A SCHIMBAT ÎNAINTE DE A SETA
      const newBlockedStatus = isActive === false || new Date(tokenExpiry) < now;
      
      // ✅ PREVENIRE SETAREA DUPLĂ A ACELUIAȘI STATUS
      if (userBlocked !== newBlockedStatus) {
        setUserBlocked(newBlockedStatus);
      }
      
      // ✅ ACTUALIZEAZĂ TIMPUL SESIUNII
      if (tokenExpiry) {
        const newExpiry = new Date(tokenExpiry);
        setSessionExpiry(newExpiry);
        calculateAndSetTime(newExpiry);
      }
      
    } catch (error) {
      console.error(
        "Eroare la verificarea stării utilizatorului:",
        error.response?.data || error.message
      );
      // ✅ SETEAZĂ DOAR DACĂ E NECESAR
      if (!userBlocked) {
        setUserBlocked(true);
      }
    }
  };

  const startStatusPolling = () => {
    // Verifică imediat la start
    checkUserStatus();
    
    statusPollingIntervalRef.current = setInterval(() => {
      checkUserStatus();
    }, 30000);

    return statusPollingIntervalRef.current;
  };

  const stopStatusPolling = () => {
    if (statusPollingIntervalRef.current) {
      clearInterval(statusPollingIntervalRef.current);
      statusPollingIntervalRef.current = null;
    }
  };

  const forceStatusCheck = () => {
    checkUserStatus();
  };

  // ==================== BILL MANAGEMENT SYSTEM ====================

  const checkBillStatus = () => {
    const tableNumber = localStorage.getItem("tableNumber");
    if (!tableNumber) return false;

    const savedBillRequest = localStorage.getItem(
      `billRequested_${tableNumber}`
    );
    const savedBillTime = localStorage.getItem(
      `billRequestTime_${tableNumber}`
    );

    if (savedBillRequest === "true" && savedBillTime) {
      const requestTime = new Date(savedBillTime);
      const currentTime = new Date();
      const diffInMinutes = (currentTime - requestTime) / (1000 * 60);

      if (diffInMinutes < 30) {
        setBillRequested(true);
        setBillRequestTime(requestTime);
        return true;
      } else {
        // Șterge starea veche dacă a expirat
        localStorage.removeItem(`billRequested_${tableNumber}`);
        localStorage.removeItem(`billRequestTime_${tableNumber}`);
        setBillRequested(false);
        setBillRequestTime(null);
        return false;
      }
    }
    return false;
  };

  const markBillAsRequested = () => {
    const tableNumber = localStorage.getItem("tableNumber");
    if (!tableNumber) {
      toast.error("Table number not found");
      return false;
    }

    const now = new Date();
    setBillRequested(true);
    setBillRequestTime(now);

    localStorage.setItem(`billRequested_${tableNumber}`, "true");
    localStorage.setItem(`billRequestTime_${tableNumber}`, now.toISOString());

    // Forțează re-renderizarea componentelor
    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
    }, 100);

    return true;
  };

  const resetBillRequest = () => {
    const tableNumber = localStorage.getItem("tableNumber");
    if (!tableNumber) return;

    setBillRequested(false);
    setBillRequestTime(null);
    localStorage.removeItem(`billRequested_${tableNumber}`);
    localStorage.removeItem(`billRequestTime_${tableNumber}`);

    // Forțează re-renderizarea componentelor
    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
    }, 100);

    toast.info("Bill request cancelled");
  };

  // ✅ FUNCȚIE CENTRALIZATĂ PENTRU VERIFICARE BILL
  const canAddToCart = (showToast = true) => {
    if (billRequested) {
      if (showToast) {
        toast.error(
          "Cannot add items. Bill has been requested. Please cancel the bill request first."
        );
      }
      return false;
    }
    
    if (userBlocked) {
      if (showToast) {
        toast.error(
          "Cannot add items. Session has expired. Please refresh the page."
        );
      }
      return false;
    }
    
    return true;
  };

  const getTimeSinceBillRequest = () => {
    if (!billRequestTime) return null;

    const now = new Date();
    const diffInMinutes = Math.floor((now - billRequestTime) / (1000 * 60));

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes === 1) return "1 minute ago";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return "1 hour ago";
    return `${diffInHours} hours ago`;
  };

  // ==================== CART MANAGEMENT ====================

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
    setUserBlocked(true);
    setSessionExpiry(null);
    setSessionTimeLeft("");
    setNotification(
      "Sesiunea a expirat. Vă rugăm să vă autentificați din nou."
    );
  };

  const getUserId = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      return userId;
    }

    const tableNumber = localStorage.getItem("tableNumber");
    if (tableNumber) {
      return "table_" + tableNumber;
    }

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

  const isUserAuthenticated = () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const tableNumber = localStorage.getItem("tableNumber");
    return !!(token && userId && tableNumber);
  };

  const startOrdersPolling = () => {
    fetchUserOrders();
    ordersIntervalRef.current = setInterval(fetchUserOrders, 5000);
  };

  const startCartPolling = () => {
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
      console.error("❌ [DEBUG] Error in fetchUserOrders:", error);
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

    if (Object.keys(previousOrderStatusRef.current).length === 0) {
      previousOrderStatusRef.current = newStatusMap;
      setPreviousOrderStatus(newStatusMap);
      return;
    }

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

    const notificationObj = { id: Date.now(), message };
    setNotification(notificationObj);

    setTimeout(() => {
      setNotification(null);
    }, 10000);
  };

  // ==================== CART OPERATIONS ====================

  // ✅ SETCARTITEMS SECURIZAT - verifică întotdeauna bill-ul și session-ul
  const secureSetCartItems = (newCartItems) => {
    if (!canAddToCart(false)) {
      return false;
    }
    setCartItems(newCartItems);
    return true;
  };

  const addToCart = async (
    itemId,
    quantity = 1,
    specialInstructions = "",
    selectedOptions = [],
    itemData = null
  ) => {
    // ✅ Verifică dacă poate adăuga în coș (bill requested sau session expired)
    if (!canAddToCart()) {
      return false;
    }

    const tableNumber = localStorage.getItem("tableNumber");

    if (!tableNumber) {
      console.error("❌ No table number found");
      return false;
    }

    // ✅ 1. OPRIM TEMPORAR POLLING-UL
    setIsUpdatingCart(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // ✅ 2. UPDATE IMEDIAT LOCAL (pentru feedback instant)
    setCartItems((prev) => {
      const newCart = { ...prev };

      if (!newCart[itemId]) {
        newCart[itemId] = {
          quantity: quantity,
          specialInstructions: specialInstructions,
          selectedOptions: selectedOptions,
          itemData: itemData || {
            baseFoodId: itemId.split("__")[0],
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

      return newCart;
    });

    // ✅ 3. TRIMITE LA SERVER (în background)
    try {
      const response = await axios.post(url + "/api/cart/add-by-table", {
        tableNumber: parseInt(tableNumber),
        itemId: itemId,
        quantity: quantity,
        specialInstructions: specialInstructions,
        selectedOptions: selectedOptions,
        itemData: itemData,
      });

      // ✅ 4. ACTUALIZEAZĂ CU RĂSPUNSUL SERVERULUI (doar dacă e necesar)
      if (response.data.success && response.data.cartData) {
        const validatedCart = validateCartStructure(response.data.cartData);
        setCartItems(validatedCart);
      }

      return true;
    } catch (error) {
      console.error("❌ TABLE CART SYNC ERROR:", error);
      return false;
    } finally {
      // ✅ 5. RESTARTEAZĂ POLLING-UL DUPĂ 1.5 SECUNDE
      setTimeout(() => {
        setIsUpdatingCart(false);
        startCartPolling();
      }, 1500);
    }
  };

  const removeFromCart = async (itemId, quantity = 1) => {
    try {
      const tableNumber = localStorage.getItem("tableNumber");
      if (!tableNumber) {
        toast.error("Please select a table first");
        return false;
      }

      // ✅ 1. ACTUALIZEAZĂ LOCAL STATE FIRST (pentru feedback imediat)
      setCartItems((prev) => {
        const newCart = { ...prev };
        if (newCart[itemId]) {
          const newQuantity = newCart[itemId].quantity - quantity;

          if (newQuantity <= 0) {
            delete newCart[itemId];
          } else {
            newCart[itemId] = {
              ...newCart[itemId],
              quantity: newQuantity,
            };
          }
        }
        return newCart;
      });

      // ✅ 2. TRIMITE LA BACKEND CU TABLE NUMBER
      const response = await axios.post(url + "/api/cart/remove", {
        userId: "table_" + tableNumber,
        itemId,
        quantity,
      });

      return true;
    } catch (error) {
      console.error("❌ Error removing from cart:", error);
      toast.error("Error updating item");
      return false;
    }
  };

  const removeItemCompletely = async (itemId) => {
    try {
      const tableNumber = localStorage.getItem("tableNumber");
      if (!tableNumber) {
        toast.error("Please select a table first");
        return false;
      }

      // ✅ 1. ȘTERGE IMEDIAT DIN STATE-UL LOCAL
      setCartItems((prev) => {
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
      });

      // ✅ 2. TRIMITE LA BACKEND PENTRU ȘTERGERE COMPLETĂ CU TABLE NUMBER
      const response = await axios.post(
        url + "/api/cart/remove-item-completely",
        {
          userId: "table_" + tableNumber,
          itemId,
        }
      );

      return true;
    } catch (error) {
      console.error("❌ Error removing item completely:", error);
      toast.error("Error removing item");
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const tableNumber = localStorage.getItem("tableNumber");

      if (!tableNumber) {
        toast.error("Please select a table first");
        return false;
      }

      // ✅ OPREȘTE POLLING-UL TEMPORAR
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // ✅ ȘTERGE IMEDIAT DIN STATE-UL LOCAL
      setCartItems({});
      localStorage.removeItem("cartItems");

      // ✅ TRIMITE TABLE NUMBER
      const response = await axios.post(url + "/api/cart/clear", {
        userId: "table_" + tableNumber,
      });

      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      }

      // ✅ RESTARTEAZĂ POLLING DUPĂ 3 SECUNDE
      setTimeout(() => {
        startCartPolling();
      }, 3000);

      return true;
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
    // ✅ Verifică dacă poate modifica coșul (bill requested sau session expired)
    if (!canAddToCart()) {
      return false;
    }

    try {
      const tableNumber = localStorage.getItem("tableNumber");
      if (!tableNumber) {
        toast.error("Please select a table first");
        return false;
      }

      // ✅ OPREȘTE POLLING-UL TEMPORAR
      setIsUpdatingCart(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // ✅ 1. UPDATE IMEDIAT LOCAL FIRST
      setCartItems((prev) => {
        const updatedCart = { ...prev };

        if (newQuantity <= 0) {
          delete updatedCart[itemId];
        } else {
          updatedCart[itemId] = {
            ...updatedCart[itemId],
            quantity: newQuantity,
            specialInstructions: specialInstructions,
          };
        }

        return updatedCart;
      });

      const currentCartItem = cartItems[itemId];
      if (!currentCartItem) {
        console.error("❌ [UPDATE] Item not found in cart");
        return false;
      }

      // Calculează diferența față de cantitatea anterioară
      const currentQuantity = currentCartItem.quantity || 0;
      const quantityDifference = newQuantity - currentQuantity;

      if (quantityDifference === 0) {
        return true;
      }

      if (quantityDifference > 0) {
        // Adaugă diferența
        await axios.post(url + "/api/cart/add-by-table", {
          tableNumber: parseInt(tableNumber),
          itemId: itemId,
          quantity: quantityDifference,
          specialInstructions: specialInstructions,
          selectedOptions: currentCartItem.selectedOptions || [],
          itemData: currentCartItem.itemData || {
            baseFoodId: itemId.split("__")[0],
            unitPrice: 0,
            extrasPrice: 0,
          },
        });
      } else {
        // Elimină diferența
        const removeQuantity = Math.abs(quantityDifference);
        await axios.post(url + "/api/cart/remove", {
          userId: "table_" + tableNumber,
          itemId: itemId,
          quantity: removeQuantity,
        });
      }

      return true;
    } catch (error) {
      console.error("❌ [UPDATE] Error updating cart item:", error);

      if (error.response) {
        console.error("❌ [UPDATE] Server error:", error.response.data);
        toast.error("Failed to update quantity");
      } else {
        toast.error("Network error - please try again");
      }
      return false;
    } finally {
      // ✅ RESTARTEAZĂ POLLING-UL
      setTimeout(() => {
        setIsUpdatingCart(false);
        startCartPolling();
      }, 3000);
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;

    Object.keys(cartItems).forEach((itemId) => {
      const cartItem = cartItems[itemId];

      if (cartItem && cartItem.quantity > 0) {
        // ✅ FOLOSEȘTE unitPrice DIN itemData DACA EXISTA
        const unitPrice = cartItem.itemData?.unitPrice || 0;

        if (unitPrice > 0) {
          // ✅ Dacă avem unitPrice din itemData, folosim-l
          let itemTotal = unitPrice * cartItem.quantity;

          if (cartItem.selectedOptions && cartItem.selectedOptions.length > 0) {
            cartItem.selectedOptions.forEach((optionName) => {
              const extra = cartItem.itemData?.extras?.find(
                (extra) => extra.name === optionName
              ) || { price: 0 };

              if (extra) {
                itemTotal += extra.price * cartItem.quantity;
              }
            });
          }

          totalAmount += itemTotal;
        } else {
          // ✅ FALLBACK: folosește logica veche dacă nu avem unitPrice în itemData
          const baseFoodId = itemId.split("__")[0];
          const foodItem = food_list.find((item) => item._id === baseFoodId);

          if (foodItem) {
            // ✅ Verifică dacă produsul are discount
            const itemPrice = foodItem.discountedPrice || foodItem.price;
            let itemTotal = itemPrice * cartItem.quantity;

            if (
              cartItem.selectedOptions &&
              cartItem.selectedOptions.length > 0
            ) {
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

  // ==================== EFFECTS ====================

  useEffect(() => {
    // Verifică starea notei de plată la inițializare
    checkBillStatus();

    const tokenFromStorage = localStorage.getItem("token");
    if (tokenFromStorage) {
      setToken(tokenFromStorage);
    }

    // Ascultă pentru schimbări în localStorage (pentru sincronizare între tab-uri/componente)
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith("billRequested_")) {
        checkBillStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Gestionare polling pentru status utilizator
    if (isUserAuthenticated()) {
      startStatusPolling();
    } else {
      stopStatusPolling();
      setUserBlocked(false);
      setSessionExpiry(null);
      setSessionTimeLeft("");
    }

    return () => {
      stopStatusPolling();
    };
  }, [token]);

  useEffect(() => {
    if (token) {
      startCartPolling();
      startOrdersPolling();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (ordersIntervalRef.current) {
        clearInterval(ordersIntervalRef.current);
      }
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [token]);

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
    setCartItems: secureSetCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalItemCount,
    updateCartItemQuantity,
    removeItemCompletely,
    clearCart,
    url,
    token,
    setToken,
    tableNumber,
    notification,
    setNotification,
    userOrders,
    fetchUserOrders,
    getUserId,
    clearLocalCartAndLogout,
    fetchCartFromServer,
    clearCartCache,
    // User status polling
    userBlocked,
    setUserBlocked,
    checkUserStatus,
    forceStatusCheck,
    startStatusPolling,
    stopStatusPolling,
    isUserAuthenticated,
    // Bill management
    billRequested,
    billRequestTime,
    markBillAsRequested,
    resetBillRequest,
    canAddToCart,
    getTimeSinceBillRequest,
    checkBillStatus,
    // ✅ NOU: Session time management
    sessionTimeLeft,
    sessionExpiry,
    updateSessionTime,
    calculateAndSetTime,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;