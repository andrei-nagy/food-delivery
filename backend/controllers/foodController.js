import foodModel from "../models/foodModel.js";
import fs from "fs";

// În foodController.js - modifică funcția safeParseJSON
const safeParseJSON = (str, defaultValue = {}) => {
  console.log(`🔄 Parsing:`, str, `Type:`, typeof str);
  
  // Dacă este deja object, returnează-l direct
  if (typeof str === 'object' && str !== null) {
    console.log("✅ Already an object, returning directly");
    return str;
  }
  
  // Dacă este undefined, null sau string "undefined"
  if (!str || str === 'undefined' || str === 'null' || str === '' || str === '""') {
    console.log("⚠️ Empty or undefined value, returning default");
    return defaultValue;
  }
  
  // Dacă este string, încearcă parsing
  if (typeof str === 'string') {
    try {
      // Încearcă parsing direct
      const parsed = JSON.parse(str);
      console.log("✅ Direct JSON parse successful:", parsed);
      
      // CORECTARE CRITICĂ: Dacă rezultatul este un array gol, returnează defaultValue
      if (Array.isArray(parsed) && parsed.length === 0) {
        console.log("🔄 Empty array detected, returning default object");
        return defaultValue;
      }
      
      return parsed;
    } catch (error) {
      console.log("❌ Direct JSON parse failed, trying cleanup...");
      
      // Încearcă cleanup pentru string-uri problematice
      try {
        // Înlocuiește 'undefined' cu null
        let cleanStr = str.replace(/undefined/g, 'null');
        
        // Adaugă ghilimele pentru keys dacă lipsec
        cleanStr = cleanStr.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
        
        // Înlocuiește single quotes cu double quotes
        cleanStr = cleanStr.replace(/'/g, '"');
        
        const parsed = JSON.parse(cleanStr);
        console.log("✅ Cleaned JSON parse successful:", parsed);
        
        // CORECTARE CRITICĂ: și aici
        if (Array.isArray(parsed) && parsed.length === 0) {
          console.log("🔄 Empty array detected, returning default object");
          return defaultValue;
        }
        
        return parsed;
      } catch (secondError) {
        console.log("❌ Cleaned JSON parse also failed:", secondError);
        return defaultValue;
      }
    }
  }
  
  console.log("⚠️ Unknown type, returning default");
  return defaultValue;
};

const addFood = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      ingredients, 
      price, 
      discountPercentage, 
      category, 
      isBestSeller, 
      isNewAdded, 
      isVegan, 
      extras,
      nutrition,
      preparation,
      dietaryInfo,
      allergens
    } = req.body;
    
    console.log("📥 ADD FOOD - Received data:", {
      name,
      price,
      nutrition: typeof nutrition,
      preparation: typeof preparation,
      dietaryInfo: typeof dietaryInfo,
      allergens: typeof allergens
    });

    // Validare câmpuri obligatorii
    if (!name || !description || !price || !category) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: name, description, price, or category" 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Image is required" 
      });
    }

    // Validare preț
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid price value" 
      });
    }

    // Calcul preț redus
    const discountValue = parseFloat(discountPercentage) || 0;
    let discountedPrice = priceValue;
    
    if (discountValue > 0 && discountValue <= 100) {
      discountedPrice = priceValue * (1 - discountValue / 100);
    }

    // Parse data cu safe fallback - CORECTAT
    const parsedExtras = safeParseJSON(extras, []);
    const parsedNutrition = safeParseJSON(nutrition, {
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0
    });
    const parsedPreparation = safeParseJSON(preparation, {
      cookingTime: "", spiceLevel: "", servingSize: "", difficulty: ""
    });
    const parsedDietaryInfo = safeParseJSON(dietaryInfo, {
      isGlutenFree: false, isDairyFree: false, isVegetarian: false, 
      isSpicy: false, containsNuts: false
    });
    const parsedAllergens = safeParseJSON(allergens, []);

    console.log("✅ ADD FOOD - Parsed nutrition:", parsedNutrition);
    console.log("✅ ADD FOOD - Parsed preparation:", parsedPreparation);
    console.log("✅ ADD FOOD - Parsed dietaryInfo:", parsedDietaryInfo);
    console.log("✅ ADD FOOD - Parsed allergens:", parsedAllergens);

    // Procesare boolean values
    const isBestSellerBool = isBestSeller === 'true' || isBestSeller === true || isBestSeller === '1';
    const isNewAddedBool = isNewAdded === 'true' || isNewAdded === true || isNewAdded === '1';
    const isVeganBool = isVegan === 'true' || isVegan === true || isVegan === '1';

    // Validare extras
    const validatedExtras = Array.isArray(parsedExtras) ? parsedExtras.map(extra => ({
      name: extra?.name || '',
      price: parseFloat(extra?.price) || 0
    })).filter(extra => extra.name && extra.price > 0) : [];

    // Validare informații nutriționale - CORECTAT CU VERIFICĂRI DE SAFETY
    const validatedNutrition = {
      calories: parseFloat(parsedNutrition?.calories) || 0,
      protein: parseFloat(parsedNutrition?.protein) || 0,
      carbs: parseFloat(parsedNutrition?.carbs) || 0,
      fat: parseFloat(parsedNutrition?.fat) || 0,
      fiber: parseFloat(parsedNutrition?.fiber) || 0,
      sugar: parseFloat(parsedNutrition?.sugar) || 0
    };

    // Validare informații despre preparare
    const validatedPreparation = {
      cookingTime: parsedPreparation?.cookingTime || "",
      spiceLevel: parsedPreparation?.spiceLevel || "",
      servingSize: parsedPreparation?.servingSize || "",
      difficulty: parsedPreparation?.difficulty || ""
    };

    // Validare informații dietetice
    const validatedDietaryInfo = {
      isGlutenFree: parsedDietaryInfo?.isGlutenFree === true || parsedDietaryInfo?.isGlutenFree === 'true' || parsedDietaryInfo?.isGlutenFree === '1',
      isDairyFree: parsedDietaryInfo?.isDairyFree === true || parsedDietaryInfo?.isDairyFree === 'true' || parsedDietaryInfo?.isDairyFree === '1',
      isVegetarian: parsedDietaryInfo?.isVegetarian === true || parsedDietaryInfo?.isVegetarian === 'true' || parsedDietaryInfo?.isVegetarian === '1',
      isSpicy: parsedDietaryInfo?.isSpicy === true || parsedDietaryInfo?.isSpicy === 'true' || parsedDietaryInfo?.isSpicy === '1',
      containsNuts: parsedDietaryInfo?.containsNuts === true || parsedDietaryInfo?.containsNuts === 'true' || parsedDietaryInfo?.containsNuts === '1'
    };

    // Validare alergeni
    const validatedAllergens = Array.isArray(parsedAllergens) ? 
      parsedAllergens.filter(allergen => 
        allergen && typeof allergen === 'string' && allergen.trim() !== ''
      ).map(allergen => allergen.trim()) : [];

    console.log("✅ ADD FOOD - Final validated nutrition:", validatedNutrition);

    const newFood = new foodModel({
      name: name.trim(),
      description: description.trim(),
      ingredients: ingredients ? ingredients.trim() : "",
      price: priceValue,
      discountPercentage: discountValue,
      discountedPrice: parseFloat(discountedPrice.toFixed(2)),
      category: category.trim(),
      image: req.file.filename,
      isBestSeller: isBestSellerBool,
      isNewAdded: isNewAddedBool,
      isVegan: isVeganBool,
      extras: validatedExtras,
      nutrition: validatedNutrition,
      preparation: validatedPreparation,
      dietaryInfo: validatedDietaryInfo,
      allergens: validatedAllergens
    });

    console.log("💾 ADD FOOD - Saving to database with nutrition:", newFood.nutrition);

    const savedFood = await newFood.save();
    
    res.json({ 
      success: true, 
      message: "Food added successfully", 
      data: savedFood 
    });
  } catch (error) {
    console.error("❌ Error adding food:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error adding food: " + error.message 
    });
  }
};

const updateFood = async (req, res) => {
  try {
    const { 
      id, 
      name, 
      description, 
      ingredients, 
      category, 
      price, 
      discountPercentage, 
      isBestSeller, 
      isNewAdded, 
      isVegan, 
      extras,
      nutrition,
      preparation,
      dietaryInfo,
      allergens
    } = req.body;
    
    console.log("📥 UPDATE FOOD - Raw data types:", {
      nutrition: typeof nutrition,
      preparation: typeof preparation, 
      dietaryInfo: typeof dietaryInfo,
      allergens: typeof allergens
    });
    console.log("📥 UPDATE FOOD - Raw nutrition:", nutrition);


    console.log("🔍 UPDATE FOOD - Raw nutrition value:", nutrition);
console.log("🔍 UPDATE FOOD - Raw nutrition type:", typeof nutrition);
console.log("🔍 UPDATE FOOD - Is nutrition an array?", Array.isArray(nutrition));


    // Validare câmpuri obligatorii
    if (!id || !name || !description || !price || !category) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: id, name, description, price, or category" 
      });
    }

    // Validare preț
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid price value" 
      });
    }

    // Calcul preț redus
    const discountValue = parseFloat(discountPercentage) || 0;
    let discountedPrice = priceValue;
    
    if (discountValue > 0 && discountValue <= 100) {
      discountedPrice = priceValue * (1 - discountValue / 100);
    }

    // Parse data cu safe fallback - CORECTAT CU VALORI DEFAULT EXPLICITE
    const parsedExtras = safeParseJSON(extras, []);
    const parsedNutrition = safeParseJSON(nutrition, {
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0
    });
    const parsedPreparation = safeParseJSON(preparation, {
      cookingTime: "", spiceLevel: "", servingSize: "", difficulty: ""
    });
    const parsedDietaryInfo = safeParseJSON(dietaryInfo, {
      isGlutenFree: false, isDairyFree: false, isVegetarian: false, 
      isSpicy: false, containsNuts: false
    });
    const parsedAllergens = safeParseJSON(allergens, []);

    console.log("✅ UPDATE FOOD - Parsed nutrition:", parsedNutrition);

    // Procesare boolean values
    const isBestSellerBool = isBestSeller === 'true' || isBestSeller === true || isBestSeller === '1';
    const isNewAddedBool = isNewAdded === 'true' || isNewAdded === true || isNewAdded === '1';
    const isVeganBool = isVegan === 'true' || isVegan === true || isVegan === '1';

    // Validare extras
    const validatedExtras = Array.isArray(parsedExtras) ? parsedExtras.map(extra => ({
      name: extra?.name || '',
      price: parseFloat(extra?.price) || 0
    })).filter(extra => extra.name && extra.price > 0) : [];

    // Validare informații nutriționale - CORECTAT CU VERIFICĂRI DE SAFETY
    const validatedNutrition = {
      calories: parseFloat(parsedNutrition?.calories) || 0,
      protein: parseFloat(parsedNutrition?.protein) || 0,
      carbs: parseFloat(parsedNutrition?.carbs) || 0,
      fat: parseFloat(parsedNutrition?.fat) || 0,
      fiber: parseFloat(parsedNutrition?.fiber) || 0,
      sugar: parseFloat(parsedNutrition?.sugar) || 0
    };

    // Validare informații despre preparare
    const validatedPreparation = {
      cookingTime: parsedPreparation?.cookingTime || "",
      spiceLevel: parsedPreparation?.spiceLevel || "",
      servingSize: parsedPreparation?.servingSize || "",
      difficulty: parsedPreparation?.difficulty || ""
    };

    // Validare informații dietetice
    const validatedDietaryInfo = {
      isGlutenFree: parsedDietaryInfo?.isGlutenFree === true || parsedDietaryInfo?.isGlutenFree === 'true' || parsedDietaryInfo?.isGlutenFree === '1',
      isDairyFree: parsedDietaryInfo?.isDairyFree === true || parsedDietaryInfo?.isDairyFree === 'true' || parsedDietaryInfo?.isDairyFree === '1',
      isVegetarian: parsedDietaryInfo?.isVegetarian === true || parsedDietaryInfo?.isVegetarian === 'true' || parsedDietaryInfo?.isVegetarian === '1',
      isSpicy: parsedDietaryInfo?.isSpicy === true || parsedDietaryInfo?.isSpicy === 'true' || parsedDietaryInfo?.isSpicy === '1',
      containsNuts: parsedDietaryInfo?.containsNuts === true || parsedDietaryInfo?.containsNuts === 'true' || parsedDietaryInfo?.containsNuts === '1'
    };

    // Validare alergeni
    const validatedAllergens = Array.isArray(parsedAllergens) ? 
      parsedAllergens.filter(allergen => 
        allergen && typeof allergen === 'string' && allergen.trim() !== ''
      ).map(allergen => allergen.trim()) : [];

    console.log("✅ UPDATE FOOD - Final validated nutrition:", validatedNutrition);

    const updateData = {
      name: name.trim(),
      description: description.trim(),
      ingredients: ingredients ? ingredients.trim() : "",
      category: category.trim(),
      price: priceValue,
      discountPercentage: discountValue,
      discountedPrice: parseFloat(discountedPrice.toFixed(2)),
      isBestSeller: isBestSellerBool,
      isNewAdded: isNewAddedBool,
      isVegan: isVeganBool,
      extras: validatedExtras,
      nutrition: validatedNutrition,
      preparation: validatedPreparation,
      dietaryInfo: validatedDietaryInfo,
      allergens: validatedAllergens,
      updatedAt: new Date()
    };
    
    console.log("💾 UPDATE FOOD - Final update data nutrition:", updateData.nutrition);

    // Procesare imagine nouă dacă este furnizată
    if (req.file) {
      console.log("🖼️ New image provided:", req.file.filename);
      const oldFood = await foodModel.findById(id);
      if (oldFood && oldFood.image) {
        const oldImagePath = `uploads/${oldFood.image}`;
        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error("Error deleting old image:", err);
            else console.log("🗑️ Old image deleted successfully");
          });
        }
      }
      
      updateData.image = req.file.filename;
    } else {
      console.log("🖼️ No new image provided, keeping existing one");
    }

    // Verifică dacă produsul există
    const existingProduct = await foodModel.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    console.log("🔄 Updating product in database...");

    const product = await foodModel.findByIdAndUpdate(
      id, 
      updateData, 
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found after update" 
      });
    }

    console.log("✅ Product updated successfully:", product._id);
    console.log("✅ Updated product nutrition:", product.nutrition);

    res.json({
      success: true,
      message: "Product updated successfully!",
      data: product
    });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating product", 
      error: error.message 
    });
  }
};

const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({}).sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      data: foods,
      count: foods.length 
    });
  } catch (error) {
    console.error("Error retrieving food list:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error retrieving food list" 
    });
  }
};

const removeFood = async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "Food ID is required" 
      });
    }

    const food = await foodModel.findById(id);
    if (!food) {
      return res.status(404).json({ 
        success: false, 
        message: "Food not found" 
      });
    }
    
    // Șterge imaginea din sistemul de fișiere
    if (food.image) {
      const imagePath = `uploads/${food.image}`;
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error("Error deleting image:", err);
        });
      }
    }

    await foodModel.findByIdAndDelete(id);
    
    res.json({ 
      success: true, 
      message: "Food removed successfully" 
    });
  } catch (error) {
    console.error("Error removing food:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error removing food" 
    });
  }
};

export { addFood, listFood, removeFood, updateFood };