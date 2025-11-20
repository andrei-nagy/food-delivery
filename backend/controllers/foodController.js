import foodModel from "../models/foodModel.js";
import fs from "fs";

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
    
    let parsedExtras = [];
    if (extras && typeof extras === 'string') {
      try {
        parsedExtras = JSON.parse(extras);
      } catch (error) {
        console.log("Error parsing extras:", error);
        parsedExtras = [];
      }
    } else if (Array.isArray(extras)) {
      parsedExtras = extras;
    }

    // Parse nutrition data
    let parsedNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    };
    
    if (nutrition && typeof nutrition === 'string') {
      try {
        parsedNutrition = JSON.parse(nutrition);
      } catch (error) {
        console.log("Error parsing nutrition:", error);
      }
    } else if (typeof nutrition === 'object') {
      parsedNutrition = nutrition;
    }

    // Parse preparation data
    let parsedPreparation = {
      cookingTime: "",
      spiceLevel: "",
      servingSize: "",
      difficulty: ""
    };
    
    if (preparation && typeof preparation === 'string') {
      try {
        parsedPreparation = JSON.parse(preparation);
      } catch (error) {
        console.log("Error parsing preparation:", error);
      }
    } else if (typeof preparation === 'object') {
      parsedPreparation = preparation;
    }

    // Parse dietary info
    let parsedDietaryInfo = {
      isGlutenFree: false,
      isDairyFree: false,
      isVegetarian: false,
      isSpicy: false,
      containsNuts: false
    };
    
    if (dietaryInfo && typeof dietaryInfo === 'string') {
      try {
        parsedDietaryInfo = JSON.parse(dietaryInfo);
      } catch (error) {
        console.log("Error parsing dietaryInfo:", error);
      }
    } else if (typeof dietaryInfo === 'object') {
      parsedDietaryInfo = dietaryInfo;
    }

    // Parse allergens
    let parsedAllergens = [];
    if (allergens && typeof allergens === 'string') {
      try {
        parsedAllergens = JSON.parse(allergens);
      } catch (error) {
        console.log("Error parsing allergens:", error);
        parsedAllergens = [];
      }
    } else if (Array.isArray(allergens)) {
      parsedAllergens = allergens;
    }

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

    // Procesare boolean values
    const isBestSellerBool = isBestSeller === 'true' || isBestSeller === true;
    const isNewAddedBool = isNewAdded === 'true' || isNewAdded === true;
    const isVeganBool = isVegan === 'true' || isVegan === true;

    // Validare extras
    const validatedExtras = parsedExtras.map(extra => ({
      name: extra.name || '',
      price: parseFloat(extra.price) || 0
    })).filter(extra => extra.name && extra.price > 0);

    // Validare informații nutriționale
    const validatedNutrition = {
      calories: parseFloat(parsedNutrition.calories) || 0,
      protein: parseFloat(parsedNutrition.protein) || 0,
      carbs: parseFloat(parsedNutrition.carbs) || 0,
      fat: parseFloat(parsedNutrition.fat) || 0,
      fiber: parseFloat(parsedNutrition.fiber) || 0,
      sugar: parseFloat(parsedNutrition.sugar) || 0
    };

    // Validare informații despre preparare
    const validatedPreparation = {
      cookingTime: parsedPreparation.cookingTime || "",
      spiceLevel: parsedPreparation.spiceLevel || "",
      servingSize: parsedPreparation.servingSize || "",
      difficulty: parsedPreparation.difficulty || ""
    };

    // Validare informații dietetice
    const validatedDietaryInfo = {
      isGlutenFree: parsedDietaryInfo.isGlutenFree === true || parsedDietaryInfo.isGlutenFree === 'true',
      isDairyFree: parsedDietaryInfo.isDairyFree === true || parsedDietaryInfo.isDairyFree === 'true',
      isVegetarian: parsedDietaryInfo.isVegetarian === true || parsedDietaryInfo.isVegetarian === 'true',
      isSpicy: parsedDietaryInfo.isSpicy === true || parsedDietaryInfo.isSpicy === 'true',
      containsNuts: parsedDietaryInfo.containsNuts === true || parsedDietaryInfo.containsNuts === 'true'
    };

    // Validare alergeni
    const validatedAllergens = parsedAllergens.filter(allergen => 
      allergen && typeof allergen === 'string' && allergen.trim() !== ''
    ).map(allergen => allergen.trim());

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

    const savedFood = await newFood.save();
    
    res.json({ 
      success: true, 
      message: "Food added successfully", 
      data: savedFood 
    });
  } catch (error) {
    console.error("Error adding food:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error adding food: " + error.message 
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

    // Procesare extras
    let parsedExtras = [];
    if (extras && typeof extras === 'string') {
      try {
        parsedExtras = JSON.parse(extras);
      } catch (error) {
        console.log("Error parsing extras:", error);
        parsedExtras = [];
      }
    } else if (Array.isArray(extras)) {
      parsedExtras = extras;
    }

    // Parse nutrition data
    let parsedNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    };
    
    if (nutrition && typeof nutrition === 'string') {
      try {
        parsedNutrition = JSON.parse(nutrition);
      } catch (error) {
        console.log("Error parsing nutrition:", error);
      }
    } else if (typeof nutrition === 'object') {
      parsedNutrition = nutrition;
    }

    // Parse preparation data
    let parsedPreparation = {
      cookingTime: "",
      spiceLevel: "",
      servingSize: "",
      difficulty: ""
    };
    
    if (preparation && typeof preparation === 'string') {
      try {
        parsedPreparation = JSON.parse(preparation);
      } catch (error) {
        console.log("Error parsing preparation:", error);
      }
    } else if (typeof preparation === 'object') {
      parsedPreparation = preparation;
    }

    // Parse dietary info
    let parsedDietaryInfo = {
      isGlutenFree: false,
      isDairyFree: false,
      isVegetarian: false,
      isSpicy: false,
      containsNuts: false
    };
    
    if (dietaryInfo && typeof dietaryInfo === 'string') {
      try {
        parsedDietaryInfo = JSON.parse(dietaryInfo);
      } catch (error) {
        console.log("Error parsing dietaryInfo:", error);
      }
    } else if (typeof dietaryInfo === 'object') {
      parsedDietaryInfo = dietaryInfo;
    }

    // Parse allergens
    let parsedAllergens = [];
    if (allergens && typeof allergens === 'string') {
      try {
        parsedAllergens = JSON.parse(allergens);
      } catch (error) {
        console.log("Error parsing allergens:", error);
        parsedAllergens = [];
      }
    } else if (Array.isArray(allergens)) {
      parsedAllergens = allergens;
    }

    // Validare extras
    const validatedExtras = parsedExtras.map(extra => ({
      name: extra.name || '',
      price: parseFloat(extra.price) || 0
    })).filter(extra => extra.name && extra.price > 0);

    // Validare informații nutriționale
    const validatedNutrition = {
      calories: parseFloat(parsedNutrition.calories) || 0,
      protein: parseFloat(parsedNutrition.protein) || 0,
      carbs: parseFloat(parsedNutrition.carbs) || 0,
      fat: parseFloat(parsedNutrition.fat) || 0,
      fiber: parseFloat(parsedNutrition.fiber) || 0,
      sugar: parseFloat(parsedNutrition.sugar) || 0
    };

    // Validare informații despre preparare
    const validatedPreparation = {
      cookingTime: parsedPreparation.cookingTime || "",
      spiceLevel: parsedPreparation.spiceLevel || "",
      servingSize: parsedPreparation.servingSize || "",
      difficulty: parsedPreparation.difficulty || ""
    };

    // Validare informații dietetice
    const validatedDietaryInfo = {
      isGlutenFree: parsedDietaryInfo.isGlutenFree === true || parsedDietaryInfo.isGlutenFree === 'true',
      isDairyFree: parsedDietaryInfo.isDairyFree === true || parsedDietaryInfo.isDairyFree === 'true',
      isVegetarian: parsedDietaryInfo.isVegetarian === true || parsedDietaryInfo.isVegetarian === 'true',
      isSpicy: parsedDietaryInfo.isSpicy === true || parsedDietaryInfo.isSpicy === 'true',
      containsNuts: parsedDietaryInfo.containsNuts === true || parsedDietaryInfo.containsNuts === 'true'
    };

    // Validare alergeni
    const validatedAllergens = parsedAllergens.filter(allergen => 
      allergen && typeof allergen === 'string' && allergen.trim() !== ''
    ).map(allergen => allergen.trim());

    // Procesare boolean values
    const isBestSellerBool = isBestSeller === 'true' || isBestSeller === true;
    const isNewAddedBool = isNewAdded === 'true' || isNewAdded === true;
    const isVeganBool = isVegan === 'true' || isVegan === true;

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
      allergens: validatedAllergens
    };
    
    // Procesare imagine nouă dacă este furnizată
    if (req.file) {
      const oldFood = await foodModel.findById(id);
      if (oldFood && oldFood.image) {
        const oldImagePath = `uploads/${oldFood.image}`;
        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error("Error deleting old image:", err);
          });
        }
      }
      
      updateData.image = req.file.filename;
    }

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
        message: "Product not found" 
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully!",
      data: product
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating product", 
      error: error.message 
    });
  }
};

// Funcție nouă pentru bulk import
const bulkImportFood = async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Products array is required"
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < products.length; i++) {
      try {
        const product = products[i];
        
        // Validare câmpuri obligatorii
        if (!product.name || !product.category || !product.price) {
          results.failed++;
          results.errors.push({
            index: i,
            message: "Missing required fields: name, category, or price"
          });
          continue;
        }

        // Validare preț
        const priceValue = parseFloat(product.price);
        if (isNaN(priceValue) || priceValue <= 0) {
          results.failed++;
          results.errors.push({
            index: i,
            message: "Invalid price value"
          });
          continue;
        }

        // Calcul preț redus
        const discountValue = parseFloat(product.discountPercentage) || 0;
        let discountedPrice = priceValue;
        
        if (discountValue > 0 && discountValue <= 100) {
          discountedPrice = priceValue * (1 - discountValue / 100);
        }

        // Procesare boolean values
        const isBestSellerBool = product.isBestSeller === true || product.isBestSeller === 'true';
        const isNewAddedBool = product.isNewAdded === true || product.isNewAdded === 'true';
        const isVeganBool = product.isVegan === true || product.isVegan === 'true';

        // Validare extras
        let validatedExtras = [];
        if (Array.isArray(product.extras)) {
          validatedExtras = product.extras.map(extra => ({
            name: extra.name || '',
            price: parseFloat(extra.price) || 0
          })).filter(extra => extra.name && extra.price > 0);
        }

        // Validare informații nutriționale
        const validatedNutrition = {
          calories: parseFloat(product.nutrition?.calories) || 0,
          protein: parseFloat(product.nutrition?.protein) || 0,
          carbs: parseFloat(product.nutrition?.carbs) || 0,
          fat: parseFloat(product.nutrition?.fat) || 0,
          fiber: parseFloat(product.nutrition?.fiber) || 0,
          sugar: parseFloat(product.nutrition?.sugar) || 0
        };

        // Validare informații despre preparare
        const validatedPreparation = {
          cookingTime: product.preparation?.cookingTime || "",
          spiceLevel: product.preparation?.spiceLevel || "",
          servingSize: product.preparation?.servingSize || "",
          difficulty: product.preparation?.difficulty || ""
        };

        // Validare informații dietetice
        const validatedDietaryInfo = {
          isGlutenFree: product.dietaryInfo?.isGlutenFree === true || product.dietaryInfo?.isGlutenFree === 'true',
          isDairyFree: product.dietaryInfo?.isDairyFree === true || product.dietaryInfo?.isDairyFree === 'true',
          isVegetarian: product.dietaryInfo?.isVegetarian === true || product.dietaryInfo?.isVegetarian === 'true',
          isSpicy: product.dietaryInfo?.isSpicy === true || product.dietaryInfo?.isSpicy === 'true',
          containsNuts: product.dietaryInfo?.containsNuts === true || product.dietaryInfo?.containsNuts === 'true'
        };

        // Validare alergeni
        const validatedAllergens = Array.isArray(product.allergens) ? 
          product.allergens.filter(allergen => 
            allergen && typeof allergen === 'string' && allergen.trim() !== ''
          ).map(allergen => allergen.trim()) : [];

        const newFood = new foodModel({
          name: product.name.trim(),
          description: product.description ? product.description.trim() : "",
          ingredients: product.ingredients ? product.ingredients.trim() : "",
          price: priceValue,
          discountPercentage: discountValue,
          discountedPrice: parseFloat(discountedPrice.toFixed(2)),
          category: product.category.trim(),
          image: product.image || null,
          isBestSeller: isBestSellerBool,
          isNewAdded: isNewAddedBool,
          isVegan: isVeganBool,
          extras: validatedExtras,
          nutrition: validatedNutrition,
          preparation: validatedPreparation,
          dietaryInfo: validatedDietaryInfo,
          allergens: validatedAllergens
        });

        await newFood.save();
        results.success++;
        
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: i,
          message: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk import completed: ${results.success} successful, ${results.failed} failed`,
      data: results
    });

  } catch (error) {
    console.error("Error in bulk import:", error);
    res.status(500).json({
      success: false,
      message: "Error during bulk import",
      error: error.message
    });
  }
};

export { addFood, listFood, removeFood, updateFood, bulkImportFood };