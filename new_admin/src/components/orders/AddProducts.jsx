import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom"; // Adaugă useSearchParams
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaMinus, FaTrash, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AddProducts = () => { // Șterge props-urile
  const [searchParams] = useSearchParams(); // Adaugă acest hook
  const tableNo = searchParams.get("tableNo");
  const userId = searchParams.get("userId");
  const token = searchParams.get("token");
  
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cashPOS");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { url } = useUrl();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("URL Parameters:", { tableNo, userId, token });
    
    if (tableNo && userId && token) {
      fetchProducts();
    } else {
      console.error("Missing parameters:", { tableNo, userId, token });
      setIsLoading(false);
    }
  }, [tableNo, userId, token]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // Folosește endpoint-ul corect pentru produse (adaptat din componenta Cart)
      const response = await axios.get(`${url}/api/food/list`);

      if (response.data.success) {
        setProducts(response.data.data);
        setFilteredProducts(response.data.data);
      } else {
        console.error("Failed to fetch products");
        toast.error("Failed to load products", { theme: "dark" });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error loading products", { theme: "dark" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        (product.description &&
          product.description.toLowerCase().includes(term)) ||
        (product.category && product.category.toLowerCase().includes(term))
    );

    setFilteredProducts(filtered);
  };

  const handleAddProduct = (product) => {
    // Verifică dacă produsul este deja în listă
    const existingIndex = selectedProducts.findIndex(
      (p) => p._id === product._id
    );

    if (existingIndex >= 0) {
      // Dacă există deja, mărește cantitatea
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingIndex].quantity += 1;
      setSelectedProducts(updatedProducts);
    } else {
      // Dacă nu există, adaugă produsul cu cantitatea 1
      setSelectedProducts((prev) => [
        ...prev,
        {
          ...product,
          quantity: 1,
          itemSpecialInstructions: "",
        },
      ]);
    }

    toast.success(`${product.name} added to order`, { theme: "dark" });
  };

  const updateProductQuantity = (productId, quantity) => {
    if (quantity < 1) {
      // Dacă cantitatea este 0, elimină produsul
      setSelectedProducts((prev) =>
        prev.filter((item) => item._id !== productId)
      );
      return;
    }

    setSelectedProducts((prev) =>
      prev.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const updateProductInstructions = (productId, instructions) => {
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item._id === productId
          ? { ...item, itemSpecialInstructions: instructions }
          : item
      )
    );
  };

  const removeProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.filter((item) => item._id !== productId)
    );
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

const placeOrder = async () => {
  if (selectedProducts.length === 0) {
    toast.error("Please add at least one product", { theme: "dark" });
    return;
  }

  setIsPlacingOrder(true);

  try {
    
    if (!token) {
      toast.error("You need to login first", { theme: "dark" });
      navigate("/login");
      return;
    }

    // CORECT: Structură corectă care corespunde cu așteptările serverului
    const orderData = {
      userId: userId,
      tableNo: parseInt(tableNo),
      items: selectedProducts.map(product => ({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        description: product.description,
        quantity: product.quantity
        // Poți include și alte câmpuri dacă există în produse
      })),
      amount: totalAmount, // ← OBLIGATORIU
      userData: { 
        tableNo: parseInt(tableNo) // ← OBLIGATORIU (doar tableNo, așa cere serverul)
      },
      paymentMethod: paymentMethod, // ← OBLIGATORIU (required în schema)
      specialInstructions: specialInstructions || ""
    };

    console.log("AddProducts sends:", orderData);
    console.log(`${url}/api/order/place-cash`)
    const response = await axios.post(`${url}/api/order/place-cash`, orderData, {
      headers: { token }
    });
console.log(token)
    console.log("Server response:", response.data);

    if (response.data.success) {
      toast.success("Order added successfully!", { theme: "dark" });
      
      setTimeout(() => {
        navigate("/close-order");
      }, 1500);
    } else {
      console.error("Server returned error:", response.data);
      toast.error(`Failed to add order: ${response.data.message || "Unknown error"}`, { theme: "dark" });
    }
  } catch (error) {
    console.error("Full error details:", error);
    
    if (error.response) {
      console.error("Server error response:", error.response.data);
      console.error("Status code:", error.response.status);
      
      toast.error(`Server error: ${error.response.data.message || error.response.status}`, { theme: "dark" });
    } else if (error.request) {
      console.error("No response received:", error.request);
      toast.error("No response from server", { theme: "dark" });
    } else {
      console.error("Error:", error.message);
      toast.error(`Error: ${error.message}`, { theme: "dark" });
    }
  } finally {
    setIsPlacingOrder(false);
  }
};
  const totalAmount = selectedProducts.reduce((total, product) => {
    return total + product.price * product.quantity;
  }, 0);

  if (!tableNo || !userId) {
    return (
      <div className="text-center py-10 text-red-500">
        Missing table number or user ID. Please go back and try again.
        <div>TableNo: {tableNo || "undefined"}</div>
        <div>UserId: {userId || "undefined"}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 text-white">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 bg-gray-800 rounded hover:bg-gray-700"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Add Products to Table {tableNo}</h1>
      </div>

      {/* Căutare produse */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full p-3 bg-gray-800 text-white rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
          <span className="absolute left-3 top-3 text-gray-400">🔍</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de produse disponibile */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Available Products</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:bg-gray-700 transition-colors"
                whileHover={{ y: -5 }}
                onClick={() => handleAddProduct(product)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={`${url}/images/${product.image}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.isBestSeller && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                      Best Seller
                    </div>
                  )}
                  {product.isNewAdded && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                      New
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <span className="text-yellow-400 font-bold">
                      {product.price} €
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-3">
                    {product.description && product.description.length > 80
                      ? `${product.description.substring(0, 80)}...`
                      : product.description || "No description available"}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                      {product.category || "Uncategorized"}
                    </span>
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddProduct(product);
                      }}
                    >
                      Add to Order
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              No products found. Try a different search term.
            </div>
          )}
        </div>

        {/* Coșul de produse selectate */}
        <div className="bg-gray-800 p-6 rounded-lg h-fit sticky top-6">
          <h2 className="text-xl font-semibold mb-4">Current Order</h2>

          {selectedProducts.length === 0 ? (
            <p className="text-gray-400">No products selected yet.</p>
          ) : (
            <>
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {selectedProducts.map((product) => (
                  <div key={product._id} className="bg-gray-700 p-3 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{product.name}</h4>
                      <button
                        onClick={() => removeProduct(product._id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            updateProductQuantity(
                              product._id,
                              product.quantity - 1
                            )
                          }
                          className="bg-gray-600 w-6 h-6 rounded flex items-center justify-center"
                        >
                          <FaMinus />
                        </button>
                        <span className="mx-2">{product.quantity}</span>
                        <button
                          onClick={() =>
                            updateProductQuantity(
                              product._id,
                              product.quantity + 1
                            )
                          }
                          className="bg-gray-600 w-6 h-6 rounded flex items-center justify-center"
                        >
                          <FaPlus />
                        </button>
                      </div>

                      <span className="font-semibold">
                        {(product.price * product.quantity).toFixed(2)} €
                      </span>
                    </div>

                    <input
                      type="text"
                      placeholder="Special instructions for this item"
                      value={product.itemSpecialInstructions}
                      onChange={(e) =>
                        updateProductInstructions(product._id, e.target.value)
                      }
                      className="w-full p-2 bg-gray-600 text-white rounded text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block mb-2">
                  General Instructions for Order:
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full p-2 bg-gray-600 text-white rounded"
                  rows="3"
                  placeholder="Any special instructions for the entire order..."
                />
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Payment Method:</h3>
                <label className="block mb-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cashPOS"
                    checked={paymentMethod === "cashPOS"}
                    onChange={handlePaymentMethodChange}
                    className="mr-2"
                  />
                  Cash / POS
                </label>
                <label className="block">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="creditCard"
                    checked={paymentMethod === "creditCard"}
                    onChange={handlePaymentMethodChange}
                    className="mr-2"
                  />
                  Credit Card
                </label>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between text-lg font-semibold mb-4">
                  <span>Total:</span>
                  <span>{totalAmount.toFixed(2)} €</span>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={isPlacingOrder}
                  className="w-full bg-green-600 text-white font-semibold py-3 rounded hover:bg-green-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {isPlacingOrder ? "Placing Order..." : "Submit Order"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProducts;
