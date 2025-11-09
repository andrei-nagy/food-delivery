import foodModel from "../models/foodModel.js";
import fs from "fs";

console.log("🔥 addFood file loaded");

const addFood = async (req, res) => {
  console.log("=== START addFood ===");
  console.log("Request body:", req.body);
  console.log("Request file:", req.file ? req.file.filename : "No file");
  
  try {
    const { name, description, ingredients, price, category, isBestSeller, isNewAdded, isVegan, extras } = req.body;
    
    console.log("📦 RAW Extras received:", extras);
    console.log("📦 Extras type:", typeof extras);
    
    // PARSE EXTRAS DIRECT IN CONTROLLER
    let parsedExtras = [];
    if (extras && typeof extras === 'string') {
      try {
        parsedExtras = JSON.parse(extras);
        console.log("✅ Successfully parsed extras:", parsedExtras);
      } catch (error) {
        console.error("❌ Error parsing extras JSON:", error);
        parsedExtras = [];
      }
    } else if (Array.isArray(extras)) {
      parsedExtras = extras;
      console.log("✅ Extras already array:", parsedExtras);
    } else {
      console.log("ℹ️ No extras provided or invalid format");
      parsedExtras = [];
    }
    
    console.log("🎯 Final extras to save:", parsedExtras);
    
    // Validate required fields
    if (!name || !description || !price || !category) {
      console.log("Missing required fields");
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: name, description, price, or category" 
      });
    }
    
    if (!req.file) {
      console.log("No image file provided");
      return res.status(400).json({ 
        success: false, 
        message: "Image is required" 
      });
    }

    console.log("Creating new food object with extras:", parsedExtras);
    const newFood = new foodModel({
      name,
      description,
      ingredients: ingredients || "", // ✅ NOU CÂMP
      price: parseFloat(price),
      category,
      image: req.file.filename,
      isBestSeller: isBestSeller === 'true' || isBestSeller === true,
      isNewAdded: isNewAdded === 'true' || isNewAdded === true,
      isVegan: isVegan === 'true' || isVegan === true,
      extras: parsedExtras
    });

    console.log("Food object before save:", newFood);
    const savedFood = await newFood.save();
    console.log("✅ Food saved successfully!");
    console.log("✅ Final saved food:", savedFood);
    
    res.json({ success: true, message: "Food added successfully", data: savedFood });
  } catch (error) {
    console.error("❌ Error in addFood:", error);
    res.status(500).json({ success: false, message: "Error adding food: " + error.message });
  }
};

// all food list
const listFood = async (req, res) => {
    console.log("🔥  2 addFood function");

    try {
        const foods = await foodModel.find({});
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error retrieving food list" });
    }
};

// remove food item
const removeFood = async (req, res) => {
    console.log("🔥  3 addFood function");

    try {
        const food = await foodModel.findById(req.body.id);
        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }
        
        // Delete image from uploads folder
        if (food.image) {
            fs.unlink(`uploads/${food.image}`, (err) => {
                if (err) console.error("Error deleting image:", err);
            });
        }

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error removing food" });
    }
};

// update food item
const updateFood = async (req, res) => {
  console.log("=== START updateFood ===");
  console.log("Request body:", req.body);
  console.log("Request file:", req.file ? req.file.filename : "No file");

  try {
    const { id, name, description, ingredients, category, price, isBestSeller, isNewAdded, isVegan, extras } = req.body;
    
    console.log("📦 RAW Extras received in update:", extras);
    console.log("📦 Extras type:", typeof extras);
    
    // PARSE EXTRAS DIRECT IN CONTROLLER
    let parsedExtras = [];
    if (extras && typeof extras === 'string') {
      try {
        parsedExtras = JSON.parse(extras);
        console.log("✅ Successfully parsed extras in update:", parsedExtras);
      } catch (error) {
        console.error("❌ Error parsing extras JSON in update:", error);
        parsedExtras = [];
      }
    } else if (Array.isArray(extras)) {
      parsedExtras = extras;
      console.log("✅ Extras already array in update:", parsedExtras);
    } else {
      console.log("ℹ️ No extras provided or invalid format in update");
      parsedExtras = [];
    }
    
    console.log("🎯 Final extras to save in update:", parsedExtras);
    
    // Validare câmpuri obligatorii
    if (!id || !name || !description || !price || !category) {
      console.log("Missing required fields for update");
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: id, name, description, price, or category" 
      });
    }

    const updateData = {
      name,
      description,
      ingredients: ingredients || "", // ✅ NOU CÂMP
      category,
      price: parseFloat(price),
      isBestSeller: isBestSeller === 'true' || isBestSeller === true,
      isNewAdded: isNewAdded === 'true' || isNewAdded === true,
      isVegan: isVegan === 'true' || isVegan === true,
      extras: parsedExtras
    };
    
    // Adaugă imaginea în datele de update dacă a fost încărcată o imagine nouă
    if (req.file) {
      console.log("New image uploaded:", req.file.filename);
      
      // Șterge imaginea veche dacă există
      const oldFood = await foodModel.findById(id);
      if (oldFood && oldFood.image) {
        const oldImagePath = `uploads/${oldFood.image}`;
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Error deleting old image:", err);
          } else {
            console.log("✅ Old image deleted:", oldFood.image);
          }
        });
      }
      
      updateData.image = req.file.filename;
    } else {
      console.log("No new image provided, keeping existing image");
    }

    console.log("Update data:", updateData);

    const product = await foodModel.findByIdAndUpdate(
      id, 
      updateData, 
      {
        new: true, // Returnează documentul actualizat
        runValidators: true // Rulează validatori pe update
      }
    );

    if (!product) {
      console.log("❌ Product not found with id:", id);
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    console.log("✅ Product updated successfully:", product);
    res.json({
      success: true,
      message: "Product updated successfully!",
      data: product
    });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating product.", 
      error: error.message 
    });
  }
};

export { addFood, listFood, removeFood, updateFood };