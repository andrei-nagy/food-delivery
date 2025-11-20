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
      extras 
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
      extras: validatedExtras
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
      extras 
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

    // Validare extras
    const validatedExtras = parsedExtras.map(extra => ({
      name: extra.name || '',
      price: parseFloat(extra.price) || 0
    })).filter(extra => extra.name && extra.price > 0);

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
      extras: validatedExtras
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
          extras: validatedExtras
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