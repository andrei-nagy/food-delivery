import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUrl } from "../context/UrlContext";
import ImageUploadSection from "./sections/ImageUploadSection";
import NutritionSection from "./sections/NutritionSection";
import PreparationSection from "./sections/PreparationSection";
import DietaryInfoSection from "./sections/DietaryInfoSection";
import AllergensSection from "./sections/AllergensSection";
import ExtraOptionsSection from "./sections/ExtraOptionsSection";

const EditProductModal = ({ isOpen, onClose, product, onProductUpdated }) => {
  const [updatedProduct, setUpdatedProduct] = useState({
    name: "",
    category: "",
    price: "",
    discountPercentage: 0,
    discountedPrice: 0,
    description: "",
    ingredients: [],
    isBestSeller: false,
    isNewAdded: false,
    isVegan: false,
    extras: [],
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
    },
    preparation: {
      cookingTime: "",
      spiceLevel: "",
      servingSize: "",
      difficulty: "",
    },
    dietaryInfo: {
      isGlutenFree: false,
      isDairyFree: false,
      isVegetarian: false,
      isSpicy: false,
      containsNuts: false,
    },
    allergens: [],
    image: null,
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
      }
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  useEffect(() => {
    if (product) {
      const productNutrition = product.nutrition || {};

      console.log("📥 INIT - Original product nutrition:", product.nutrition);
      console.log("📥 INIT - Processed nutrition:", {
        calories: productNutrition.calories || 0,
        protein: productNutrition.protein || 0,
        carbs: productNutrition.carbs || 0,
        fat: productNutrition.fat || 0,
        fiber: productNutrition.fiber || 0,
        sugar: productNutrition.sugar || 0,
      });

      // NORMALIZEAZĂ ingredients să fie întotdeauna array
      const normalizedIngredients = Array.isArray(product.ingredients) 
        ? product.ingredients 
        : (product.ingredients || '').split(',').map(item => item.trim()).filter(item => item !== '');

      setUpdatedProduct({
        name: product.name,
        category: product.category,
        description: product.description,
        ingredients: normalizedIngredients, // Folosește array-ul normalizat
        price: product.price.toFixed(2),
        discountPercentage: product.discountPercentage || 0,
        discountedPrice: product.discountedPrice || product.price,
        image: null,
        isBestSeller: product.isBestSeller || false,
        isNewAdded: product.isNewAdded || false,
        isVegan: product.isVegan || false,
        extras: product.extras || [],
        // ASIGURĂ obiect complet pentru nutrition
        nutrition: {
          calories: parseInt(productNutrition.calories) || 0,
          protein: parseInt(productNutrition.protein) || 0,
          carbs: parseInt(productNutrition.carbs) || 0,
          fat: parseInt(productNutrition.fat) || 0,
          fiber: parseInt(productNutrition.fiber) || 0,
          sugar: parseInt(productNutrition.sugar) || 0,
        },
        preparation: product.preparation || {
          cookingTime: "",
          spiceLevel: "",
          servingSize: "",
          difficulty: "",
        },
        dietaryInfo: product.dietaryInfo || {
          isGlutenFree: false,
          isDairyFree: false,
          isVegetarian: false,
          isSpicy: false,
          containsNuts: false,
        },
        allergens: product.allergens || [],
      });
    }
    getCategoryList();
  }, [product]);

  // Adaugă useEffect pentru a monitoriza schimbările în updatedProduct
  useEffect(() => {
    console.log("🔄 UPDATED PRODUCT STATE CHANGED:", {
      nutrition: updatedProduct.nutrition,
      preparation: updatedProduct.preparation,
      dietaryInfo: updatedProduct.dietaryInfo,
      allergens: updatedProduct.allergens,
      ingredients: updatedProduct.ingredients
    });
  }, [
    updatedProduct.nutrition,
    updatedProduct.preparation,
    updatedProduct.dietaryInfo,
    updatedProduct.allergens,
    updatedProduct.ingredients
  ]);

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
    setUpdatedProduct((prev) => ({
      ...prev,
      discountedPrice: discountedPrice.toFixed(2),
    }));
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
    setUpdatedProduct((prev) => ({
      ...prev,
      extras: [...prev.extras, newExtra],
    }));
    setExtraName("");
    setExtraPrice("");
    toast.success("Extra option added successfully!", { theme: "dark" });
  };

  const removeExtra = (index) => {
    setUpdatedProduct((prev) => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index),
    }));
    toast.info("Extra option removed", { theme: "dark" });
  };

const handleNutritionChange = (field, value) => {
  console.log("🔄 Nutrition change:", field, value);
  setUpdatedProduct(prev => ({
    ...prev,
    nutrition: {
      ...prev.nutrition,
      [field]: value
    }
  }));
};

// Funcție pentru a actualiza informațiile despre preparare (câmp cu câmp)
const handlePreparationChange = (field, value) => {
  console.log("🔄 Preparation change:", field, value);
  setUpdatedProduct(prev => ({
    ...prev,
    preparation: {
      ...prev.preparation,
      [field]: value
    }
  }));
};

// Funcție pentru a actualiza informațiile dietetice (câmp cu câmp)
const handleDietaryInfoChange = (field, value) => {
  console.log("🔄 DietaryInfo change:", field, value);
  setUpdatedProduct(prev => ({
    ...prev,
    dietaryInfo: {
      ...prev.dietaryInfo,
      [field]: value
    }
  }));
};
  // Funcție helper pentru a converti ingredients în string pentru afișare
  const getIngredientsDisplayValue = () => {
    return Array.isArray(updatedProduct.ingredients) 
      ? updatedProduct.ingredients.join(', ') 
      : updatedProduct.ingredients || '';
  };

  // Funcție pentru a procesa ingredients la schimbare
  const handleIngredientsChange = (value) => {
    // Salvează ca string pentru editare, dar va fi procesat ca array la submit
    setUpdatedProduct(prev => ({
      ...prev,
      ingredients: value
    }));
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    console.log("🚀 ===== START HANDLE UPDATE PRODUCT =====");
    
    // DEBUG: Verifică starea actuală
    console.log("🔍 BEFORE SEND - updatedProduct:", {
      nutrition: updatedProduct.nutrition,
      preparation: updatedProduct.preparation,
      dietaryInfo: updatedProduct.dietaryInfo,
      allergens: updatedProduct.allergens,
      ingredients: updatedProduct.ingredients
    });

    // CONVERTEȘTE ingredients în array (dacă este string)
    let ingredientsArray = [];
    if (typeof updatedProduct.ingredients === 'string') {
      ingredientsArray = updatedProduct.ingredients
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');
    } else if (Array.isArray(updatedProduct.ingredients)) {
      ingredientsArray = updatedProduct.ingredients;
    }

    console.log("🔧 Processed ingredients:", ingredientsArray);

    // ASIGURĂ că nutrition este obiect valid
    const nutritionToSend = {
      calories: parseInt(updatedProduct.nutrition?.calories) || 0,
      protein: parseInt(updatedProduct.nutrition?.protein) || 0,
      carbs: parseInt(updatedProduct.nutrition?.carbs) || 0,
      fat: parseInt(updatedProduct.nutrition?.fat) || 0,
      fiber: parseInt(updatedProduct.nutrition?.fiber) || 0,
      sugar: parseInt(updatedProduct.nutrition?.sugar) || 0,
    };

    const formData = new FormData();
    
    // Câmpuri de bază
    formData.append("id", product._id);
    formData.append("name", updatedProduct.name);
    formData.append("category", updatedProduct.category);
    formData.append("price", parseFloat(updatedProduct.price));
    formData.append("discountPercentage", parseFloat(updatedProduct.discountPercentage));
    formData.append("description", updatedProduct.description);
    
    // CORECTAT: Trimite ingredients ca JSON string array
    formData.append("ingredients", JSON.stringify(ingredientsArray));
    
    formData.append("isBestSeller", updatedProduct.isBestSeller);
    formData.append("isNewAdded", updatedProduct.isNewAdded);
    formData.append("isVegan", updatedProduct.isVegan);
    
    // CORECTAT: Extras deja este array, doar stringify
    formData.append("extras", JSON.stringify(updatedProduct.extras));

    // CORECTAT: Trimite întotdeauna obiecte validate
    formData.append("nutrition", JSON.stringify(nutritionToSend));
    formData.append("preparation", JSON.stringify(updatedProduct.preparation));
    formData.append("dietaryInfo", JSON.stringify(updatedProduct.dietaryInfo));
    formData.append("allergens", JSON.stringify(updatedProduct.allergens || []));

    if (updatedProduct.image instanceof File) {
      formData.append("image", updatedProduct.image);
    }

    // DEBUG: Verifică FormData final
    console.log("=== FINAL FORM DATA ===");
    for (let [key, value] of formData.entries()) {
      console.log(`📦 ${key}:`, value);
    }

    try {
      const response = await axios.post(`${url}/api/food/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success(response.data.message, { theme: "dark" });
        onProductUpdated();
        onClose();
      } else {
        toast.error(response.data.message, { theme: "dark" });
      }
    } catch (error) {
      console.error("💥 Error updating product:", error);
      toast.error(error.response?.data?.message || "Error updating product", { 
        theme: "dark" 
      });
    }
  };

  if (!isOpen || !product) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[95vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <h3 className="text-2xl font-bold text-white">Edit Product</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form className="p-6 space-y-6" onSubmit={handleUpdateProduct}>
          {/* Image Upload */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-white">
              Product Image
            </label>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Current Image */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Current Image
                </label>
                <div className="w-full h-48 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src={`${url}/images/` + product.image}
                    alt="Current product"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* New Image */}
              <div className="space-y-2 flex-1">
                <label className="block text-sm font-medium text-gray-400">
                  New Image (optional)
                </label>
                <ImageUploadSection
                  image={updatedProduct.image}
                  onImageChange={(file) =>
                    setUpdatedProduct((prev) => ({ ...prev, image: file }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Basic Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Product Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter product name"
                value={updatedProduct.name}
                onChange={(e) =>
                  setUpdatedProduct({ ...updatedProduct, name: e.target.value })
                }
                required
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Price (€)
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 no-arrows"
                placeholder="0.00"
                value={updatedProduct.price}
                onChange={(e) =>
                  setUpdatedProduct({
                    ...updatedProduct,
                    price: e.target.value,
                  })
                }
                onBlur={handlePriceBlur}
                required
                step="0.01"
                min="0"
              />
            </div>

            {/* Discount Percentage */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Discount Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 no-arrows"
                  placeholder="0"
                  value={updatedProduct.discountPercentage}
                  onChange={(e) =>
                    setUpdatedProduct({
                      ...updatedProduct,
                      discountPercentage: e.target.value,
                    })
                  }
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
              <label className="block text-sm font-medium text-white">
                Category
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={updatedProduct.category}
                onChange={(e) =>
                  setUpdatedProduct({
                    ...updatedProduct,
                    category: e.target.value,
                  })
                }
                required
              >
                <option value="" disabled>
                  Select category
                </option>
                {list.map((category) => (
                  <option key={category._id} value={category.menu_name}>
                    {category.menu_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Product Tags
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updatedProduct.isBestSeller}
                    onChange={(e) =>
                      setUpdatedProduct({
                        ...updatedProduct,
                        isBestSeller: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-white">Best Seller</span>
                </label>

                <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updatedProduct.isNewAdded}
                    onChange={(e) =>
                      setUpdatedProduct({
                        ...updatedProduct,
                        isNewAdded: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-white">New Arrival</span>
                </label>

                <label className="flex items-center p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updatedProduct.isVegan}
                    onChange={(e) =>
                      setUpdatedProduct({
                        ...updatedProduct,
                        isVegan: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-white">Vegan</span>
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Description
            </label>
            <textarea
              rows="3"
              maxLength="500"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Describe your product..."
              value={updatedProduct.description}
              onChange={(e) =>
                setUpdatedProduct({
                  ...updatedProduct,
                  description: e.target.value,
                })
              }
            />
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Ingredients
            </label>
            <textarea
              rows="3"
              maxLength="1000"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="List the ingredients (separated by commas)..."
              value={getIngredientsDisplayValue()}
              onChange={(e) => handleIngredientsChange(e.target.value)}
            />
            <p className="text-gray-400 text-xs">
              Separate ingredients with commas (e.g., Tomato sauce, Mozzarella,
              Basil)
            </p>
          </div>

          {/* Nutrition Information */}
          <NutritionSection
            nutrition={updatedProduct.nutrition}
            setNutrition={handleNutritionChange}
          />

          {/* Preparation Information */}
          <PreparationSection
            preparation={updatedProduct.preparation}
            setPreparation={handlePreparationChange}
          />

          {/* Dietary Information */}
          <DietaryInfoSection
            dietaryInfo={updatedProduct.dietaryInfo}
            setDietaryInfo={handleDietaryInfoChange}
          />

          {/* Allergens */}
          <AllergensSection
            allergens={updatedProduct.allergens}
            setAllergens={(newAllergens) =>
              setUpdatedProduct((prev) => ({
                ...prev,
                allergens: newAllergens,
              }))
            }
          />

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
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Update Product</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditProductModal;