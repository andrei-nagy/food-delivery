import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";
import ImageUploadSection from "./sections/ImageUploadSection";
import ExtraOptionsSection from "./sections/ExtraOptionsSection";

const ProductModal = ({ isOpen, onClose, onProductAdded }) => {
    const [image, setImage] = useState(null);
    const [updatedProduct, setUpdatedProduct] = useState({
        name: "", category: "", price: "", discountPercentage: 0, discountedPrice: 0,
        description: "", ingredients: "", isBestSeller: false, isNewAdded: false, isVegan: false,
        extras: [], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
        preparation: { cookingTime: "", spiceLevel: "", servingSize: "", difficulty: "" },
        dietaryInfo: { isGlutenFree: false, isDairyFree: false, isVegetarian: false, isSpicy: false, containsNuts: false },
        allergens: []
    });
    const [extraName, setExtraName] = useState("");
    const [extraPrice, setExtraPrice] = useState("");
    const [list, setList] = useState([]);
    const { url } = useUrl();

    const getCategoryList = async () => {
        try {
            const response = await axios.get(`${url}/api/categories/listcategory`);
            if (response.data.success) {
                setList(response.data.data);
            } else {
                toast.error(response.data.message, { theme: "dark" });
            }
        } catch (error) {
            console.error("Error fetching categories", error);
            toast.error("Error fetching categories", { theme: "dark" });
        }
    };

    useEffect(() => {
        getCategoryList();
    }, []);

    const handlePriceBlur = (e) => {
        let priceValue = parseFloat(e.target.value);
        if (isNaN(priceValue) || priceValue < 0) priceValue = 0;
        setUpdatedProduct({ ...updatedProduct, price: priceValue.toFixed(2) });
        calculateDiscountedPrice(priceValue, updatedProduct.discountPercentage);
    };

    const handleDiscountBlur = (e) => {
        let discountValue = parseFloat(e.target.value);
        if (isNaN(discountValue) || discountValue < 0) discountValue = 0;
        if (discountValue > 100) {
            discountValue = 100;
            toast.warning("Discount cannot exceed 100%", { theme: "dark" });
        }
        setUpdatedProduct({ ...updatedProduct, discountPercentage: discountValue });
        calculateDiscountedPrice(updatedProduct.price, discountValue);
    };

    const calculateDiscountedPrice = (price, discount) => {
        const numericPrice = parseFloat(price) || 0;
        const numericDiscount = parseFloat(discount) || 0;
        let discountedPrice = numericPrice;
        if (numericDiscount > 0 && numericDiscount <= 100) {
            discountedPrice = numericPrice * (1 - numericDiscount / 100);
        }
        setUpdatedProduct(prev => ({ ...prev, discountedPrice: discountedPrice.toFixed(2) }));
    };

    const addExtra = () => {
        if (!extraName.trim() || !extraPrice) {
            toast.error("Please fill both extra name and price", { theme: "dark" });
            return;
        }
        const numericPrice = parseFloat(extraPrice);
        if (isNaN(numericPrice)) {
            toast.error("Please enter a valid price", { theme: "dark" });
            return;
        }
        const newExtra = { name: extraName.trim(), price: numericPrice.toFixed(2) };
        setUpdatedProduct(prev => ({ ...prev, extras: [...prev.extras, newExtra] }));
        setExtraName(""); setExtraPrice("");
        toast.success("Extra option added successfully!", { theme: "dark" });
    };

    const removeExtra = (index) => {
        setUpdatedProduct(prev => ({ ...prev, extras: prev.extras.filter((_, i) => i !== index) }));
        toast.info("Extra option removed", { theme: "dark" });
    };

    const handleAddProduct = async (event) => {
        event.preventDefault();

        // DEBUGGING COMPLET
        console.log("🔍 === DEBUG PRODUCT DATA ===");
        console.log("Full product state:", JSON.parse(JSON.stringify(updatedProduct)));
        console.log("Nutrition:", updatedProduct.nutrition);
        console.log("Preparation:", updatedProduct.preparation);
        console.log("DietaryInfo:", updatedProduct.dietaryInfo);
        console.log("Allergens:", updatedProduct.allergens);

        const productPrice = parseFloat(updatedProduct.price);
        if (isNaN(productPrice) || productPrice <= 0) {
            toast.error("Please enter a valid product price", { theme: "dark" });
            return;
        }

        if (!image) {
            toast.error("Please upload a product image", { theme: "dark" });
            return;
        }

        const formData = new FormData();
        formData.append("name", updatedProduct.name);
        formData.append("description", updatedProduct.description);
        formData.append("ingredients", updatedProduct.ingredients);
        formData.append("price", productPrice);
        formData.append("discountPercentage", updatedProduct.discountPercentage);
        formData.append("category", updatedProduct.category);
        formData.append("image", image);
        formData.append("isBestSeller", updatedProduct.isBestSeller);
        formData.append("isNewAdded", updatedProduct.isNewAdded);
        formData.append("isVegan", updatedProduct.isVegan);
        formData.append("extras", JSON.stringify(updatedProduct.extras));
        formData.append("nutrition", JSON.stringify(updatedProduct.nutrition));
        formData.append("preparation", JSON.stringify(updatedProduct.preparation));
        formData.append("dietaryInfo", JSON.stringify(updatedProduct.dietaryInfo));
        formData.append("allergens", JSON.stringify(updatedProduct.allergens));

        // DEBUG: Verifică formData
        console.log("📋 === FORM DATA CONTENTS ===");
        for (let [key, value] of formData.entries()) {
            console.log(key + ":", value);
        }

        try {
            const response = await axios.post(`${url}/api/food/add`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log("✅ === SERVER RESPONSE ===");
            console.log("Response:", response.data);

            if (response.data.success) {
                setImage(null);
                setUpdatedProduct({
                    name: "", category: "", price: "", discountPercentage: 0, discountedPrice: 0,
                    description: "", ingredients: "", isBestSeller: false, isNewAdded: false, isVegan: false,
                    extras: [], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
                    preparation: { cookingTime: "", spiceLevel: "", servingSize: "", difficulty: "" },
                    dietaryInfo: { isGlutenFree: false, isDairyFree: false, isVegetarian: false, isSpicy: false, containsNuts: false },
                    allergens: []
                });
                setExtraName(""); setExtraPrice("");
                toast.success(response.data.message, { theme: "dark" });
                onProductAdded();
                onClose();
            } else {
                toast.error(response.data.message, { theme: "dark" });
            }
        } catch (error) {
            console.error("❌ === ERROR DETAILS ===");
            console.error("Error:", error);
            console.error("Error response:", error.response?.data);
            toast.error("Error adding product", { theme: "dark" });
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <motion.div
                className="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[95vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
                    <h3 className="text-2xl font-bold text-white">Create New Product</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form className="p-6 space-y-6" onSubmit={handleAddProduct}>
                    {/* Image Upload */}
                    <ImageUploadSection image={image} onImageChange={setImage} />

                    {/* Basic Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-white">Product Name</label>
                            <input
                                type="text"
                                maxLength="100"
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter product name"
                                value={updatedProduct.name}
                                onChange={(e) => setUpdatedProduct({ ...updatedProduct, name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-white">Price (€)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 no-arrows"
                                placeholder="0.00"
                                value={updatedProduct.price}
                                onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: e.target.value })}
                                onBlur={handlePriceBlur}
                                required
                                step="0.01"
                                min="0"
                            />
                        </div>

                        {/* Discount Percentage */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-white">Discount Percentage</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 no-arrows"
                                    placeholder="0"
                                    value={updatedProduct.discountPercentage}
                                    onChange={(e) => setUpdatedProduct({ ...updatedProduct, discountPercentage: e.target.value })}
                                    onBlur={handleDiscountBlur}
                                    step="1"
                                    min="0"
                                    max="100"
                                />
                                <span className="absolute right-3 top-3 text-gray-400">%</span>
                            </div>
                            {updatedProduct.discountPercentage > 0 && (
                                <div className="text-green-400 text-sm">
                                    Discounted Price: {updatedProduct.discountedPrice} €
                                </div>
                            )}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-white">Category</label>
                            <select
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                value={updatedProduct.category}
                                onChange={(e) => setUpdatedProduct({ ...updatedProduct, category: e.target.value })}
                                required
                            >
                                <option value="" disabled>Select category</option>
                                {list.map((category) => (
                                    <option key={category._id} value={category.menu_name}>
                                        {category.menu_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-white">Product Tags</label>
                            <div className="grid grid-cols-3 gap-2">
                                <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={updatedProduct.isBestSeller}
                                        onChange={(e) => setUpdatedProduct({ ...updatedProduct, isBestSeller: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-white">Best Seller</span>
                                </label>

                                <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={updatedProduct.isNewAdded}
                                        onChange={(e) => setUpdatedProduct({ ...updatedProduct, isNewAdded: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-white">New Arrival</span>
                                </label>

                                <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={updatedProduct.isVegan}
                                        onChange={(e) => setUpdatedProduct({ ...updatedProduct, isVegan: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-white">Vegan</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">Description</label>
                        <textarea
                            rows="3"
                            maxLength="500"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                            placeholder="Describe your product..."
                            value={updatedProduct.description}
                            onChange={(e) => setUpdatedProduct({ ...updatedProduct, description: e.target.value })}
                        />
                    </div>

                    {/* Ingredients */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">Ingredients</label>
                        <textarea
                            rows="3"
                            maxLength="1000"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                            placeholder="List the ingredients (separated by commas)..."
                            value={updatedProduct.ingredients}
                            onChange={(e) => setUpdatedProduct({ ...updatedProduct, ingredients: e.target.value })}
                        />
                        <p className="text-gray-400 text-xs">Separate ingredients with commas (e.g., Tomato sauce, Mozzarella, Basil)</p>
                    </div>

                    {/* Nutrition Information - DIRECT IN MODAL */}
                    <div className="space-y-4">
                        <label className="block text-lg font-semibold text-white">Nutrition Information</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Calories</label>
                                <input
                                    type="number"
                                    value={updatedProduct.nutrition.calories || ''}
                                    onChange={(e) => setUpdatedProduct(prev => ({
                                        ...prev,
                                        nutrition: { 
                                            ...prev.nutrition, 
                                            calories: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 
                                        }
                                    }))}
                                    placeholder="0"
                                    min="0"
                                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Protein (g)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={updatedProduct.nutrition.protein || ''}
                                    onChange={(e) => setUpdatedProduct(prev => ({
                                        ...prev,
                                        nutrition: { 
                                            ...prev.nutrition, 
                                            protein: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 
                                        }
                                    }))}
                                    placeholder="0"
                                    min="0"
                                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Carbs (g)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={updatedProduct.nutrition.carbs || ''}
                                    onChange={(e) => setUpdatedProduct(prev => ({
                                        ...prev,
                                        nutrition: { 
                                            ...prev.nutrition, 
                                            carbs: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 
                                        }
                                    }))}
                                    placeholder="0"
                                    min="0"
                                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Fat (g)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={updatedProduct.nutrition.fat || ''}
                                    onChange={(e) => setUpdatedProduct(prev => ({
                                        ...prev,
                                        nutrition: { 
                                            ...prev.nutrition, 
                                            fat: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 
                                        }
                                    }))}
                                    placeholder="0"
                                    min="0"
                                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Fiber (g)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={updatedProduct.nutrition.fiber || ''}
                                    onChange={(e) => setUpdatedProduct(prev => ({
                                        ...prev,
                                        nutrition: { 
                                            ...prev.nutrition, 
                                            fiber: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 
                                        }
                                    }))}
                                    placeholder="0"
                                    min="0"
                                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Sugar (g)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={updatedProduct.nutrition.sugar || ''}
                                    onChange={(e) => setUpdatedProduct(prev => ({
                                        ...prev,
                                        nutrition: { 
                                            ...prev.nutrition, 
                                            sugar: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 
                                        }
                                    }))}
                                    placeholder="0"
                                    min="0"
                                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preparation Information - DIRECT IN MODAL */}
                    <div className="space-y-4">
                        <label className="block text-lg font-semibold text-white">Preparation Information</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Spice Level</label>
                                <select
                                    value={updatedProduct.preparation.spiceLevel}
                                    onChange={(e) => setUpdatedProduct(prev => ({
                                        ...prev,
                                        preparation: { ...prev.preparation, spiceLevel: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select spice level</option>
                                    <option value="Mild">Mild</option>
                                    <option value="Medium 🌶️">Medium 🌶️</option>
                                    <option value="Hot 🌶️🌶️">Hot 🌶️🌶️</option>
                                    <option value="Very Hot 🌶️🌶️🌶️">Very Hot 🌶️🌶️🌶️</option>
                                    <option value="Extreme 🌶️🌶️🌶️🌶️🌶️">Extreme 🌶️🌶️🌶️🌶️🌶️</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Serving Size</label>
                                <input
                                    type="text"
                                    value={updatedProduct.preparation.servingSize}
                                    onChange={(e) => setUpdatedProduct(prev => ({
                                        ...prev,
                                        preparation: { ...prev.preparation, servingSize: e.target.value }
                                    }))}
                                    placeholder="ex: 350g"
                                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dietary Information - DIRECT IN MODAL */}
                    <div className="space-y-4">
                        <label className="block text-lg font-semibold text-white">Dietary Information</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={updatedProduct.dietaryInfo.isGlutenFree}
                                    onChange={(e) => setUpdatedProduct(prev => ({
                                        ...prev,
                                        dietaryInfo: { ...prev.dietaryInfo, isGlutenFree: e.target.checked }
                                    }))}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-white">Gluten Free</span>
                            </label>

                            <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={updatedProduct.dietaryInfo.isDairyFree}
                                    onChange={(e) => setUpdatedProduct(prev => ({
                                        ...prev,
                                        dietaryInfo: { ...prev.dietaryInfo, isDairyFree: e.target.checked }
                                    }))}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-white">Dairy Free</span>
                            </label>

                            <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={updatedProduct.dietaryInfo.isVegetarian}
                                    onChange={(e) => setUpdatedProduct(prev => ({
                                        ...prev,
                                        dietaryInfo: { ...prev.dietaryInfo, isVegetarian: e.target.checked }
                                    }))}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-white">Vegetarian</span>
                            </label>

                            <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={updatedProduct.dietaryInfo.isSpicy}
                                    onChange={(e) => setUpdatedProduct(prev => ({
                                        ...prev,
                                        dietaryInfo: { ...prev.dietaryInfo, isSpicy: e.target.checked }
                                    }))}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-white">Spicy</span>
                            </label>

                            <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={updatedProduct.dietaryInfo.containsNuts}
                                    onChange={(e) => setUpdatedProduct(prev => ({
                                        ...prev,
                                        dietaryInfo: { ...prev.dietaryInfo, containsNuts: e.target.checked }
                                    }))}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-white">Contains Nuts</span>
                            </label>
                        </div>
                    </div>

                    {/* Allergens - DIRECT IN MODAL */}
                    <div className="space-y-4">
                        <label className="block text-lg font-semibold text-white">Allergens</label>
                        
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={updatedProduct.allergens.find(a => typeof a === 'string' && a.startsWith('NEW:'))?.replace('NEW:', '') || ''}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    setUpdatedProduct(prev => {
                                        const otherAllergens = prev.allergens.filter(a => !(typeof a === 'string' && a.startsWith('NEW:')));
                                        if (newValue.trim()) {
                                            return { ...prev, allergens: [...otherAllergens, `NEW:${newValue}`] };
                                        }
                                        return { ...prev, allergens: otherAllergens };
                                    });
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const input = e.target;
                                        const value = input.value.trim();
                                        if (value) {
                                            setUpdatedProduct(prev => ({
                                                ...prev,
                                                allergens: [...prev.allergens.filter(a => !(typeof a === 'string' && a.startsWith('NEW:'))), value]
                                            }));
                                            input.value = '';
                                        }
                                    }
                                }}
                                placeholder="Add allergen (e.g., Nuts, Gluten)"
                                className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const input = document.querySelector('input[placeholder*="Add allergen"]');
                                    const value = input.value.trim();
                                    if (value) {
                                        setUpdatedProduct(prev => ({
                                            ...prev,
                                            allergens: [...prev.allergens.filter(a => !(typeof a === 'string' && a.startsWith('NEW:'))), value]
                                        }));
                                        input.value = '';
                                    }
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition duration-200"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {updatedProduct.allergens.filter(a => !(typeof a === 'string' && a.startsWith('NEW:'))).length > 0 && (
                            <div className="bg-gray-700/30 rounded-lg p-3">
                                <h4 className="text-sm font-medium text-white mb-2">Added Allergens:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {updatedProduct.allergens.filter(a => !(typeof a === 'string' && a.startsWith('NEW:'))).map((allergen, index) => (
                                        <div key={index} className="flex items-center bg-red-600/20 border border-red-500/50 rounded-full px-3 py-1">
                                            <span className="text-red-300 text-sm">{allergen}</span>
                                            <button
                                                type="button"
                                                onClick={() => setUpdatedProduct(prev => ({
                                                    ...prev,
                                                    allergens: prev.allergens.filter((_, i) => i !== index)
                                                }))}
                                                className="text-red-400 hover:text-red-300 ml-2"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Extra Options Section */}
                    <ExtraOptionsSection 
                        extraName={extraName}
                        setExtraName={setExtraName}
                        extraPrice={extraPrice}
                        setExtraPrice={setExtraPrice}
                        addExtra={addExtra}
                        updatedProduct={updatedProduct}
                        removeExtra={removeExtra}
                    />

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700 sticky bottom-0 bg-gray-800 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors duration-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors duration-200 font-medium flex items-center space-x-2"
                        >
                            <Plus size={20} />
                            <span>Add Product</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default ProductModal;