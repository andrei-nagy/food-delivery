import foodModel from "../models/foodModel.js";
import fs from "fs";


console.log("🔥 addFood file loaded");

const addFood = async (req, res) => {
  console.log("=== START addFood ===");
  console.log("Request body:", req.body);
  console.log("Request file:", req.file ? req.file.filename : "No file");
  
  try {
    const { name, description, price, category, isBestSeller, isNewAdded, isVegan, extras } = req.body;
    
    // DEBUG: Log all request body keys
    console.log("All body keys:", Object.keys(req.body));
    console.log("Extras field type:", typeof extras);
    console.log("Extras field value:", extras);
    
    // PROCESEAZĂ EXTRASELE - VARIANTĂ SIMPLIFICATĂ
    let parsedExtras = [];
    
    try {
      if (typeof extras === 'string') {
        parsedExtras = JSON.parse(extras);
      } else if (Array.isArray(extras)) {
        parsedExtras = extras;
      }
      console.log("Parsed extras:", parsedExtras);
    } catch (error) {
      console.error("Error parsing extras:", error);
    }
    
    // Dacă tot nu avem extrase, folosește cele default din model
    if (!parsedExtras || parsedExtras.length === 0) {
      console.log("Using default extras from model");
      // Lăsăm modelul să aplice extrasele default
      parsedExtras = undefined; // Sau [] pentru array gol
    }
    
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

    console.log("Creating new food object");
    const newFood = new foodModel({
      name,
      description,
      price: parseFloat(price),
      category,
      image: req.file.filename,
      isBestSeller: isBestSeller === 'true' || isBestSeller === true,
      isNewAdded: isNewAdded === 'true' || isNewAdded === true,
      isVegan: isVegan === 'true' || isVegan === true,
      extras: parsedExtras // Poate fi undefined pentru a folosi default-ul
    });

    console.log("Food object to save:", newFood);
    await newFood.save();
    console.log("Food saved successfully with extras:", newFood.extras);
    
    res.json({ success: true, message: "Food added successfully", data: newFood });
  } catch (error) {
    console.error("Error in addFood:", error);
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
    console.log("🔥  4 addFood function");

    try {
        const { id, name, description, category, price, isBestSeller, isNewAdded, isVegan, extras } = req.body;
        
        let parsedExtras = [];
        
        // Parse extras if provided
        if (extras) {
            try {
                parsedExtras = typeof extras === 'string' ? JSON.parse(extras) : extras;
                
                // Validate extras structure
                if (Array.isArray(parsedExtras)) {
                    parsedExtras = parsedExtras.map(extra => ({
                        name: extra.name || '',
                        price: parseFloat(extra.price) || 0
                    })).filter(extra => extra.name.trim() !== ''); // Remove extras with empty names
                } else {
                    parsedExtras = [];
                }
            } catch (error) {
                console.error("Error parsing extras:", error);
                parsedExtras = [];
            }
        }
        
        const updateData = {
            name,
            description,
            category,
            price: parseFloat(price),
            isBestSeller: isBestSeller === 'true' || isBestSeller === true,
            isNewAdded: isNewAdded === 'true' || isNewAdded === true,
            isVegan: isVegan === 'true' || isVegan === true,
            extras: parsedExtras
        };
        
        // Add image to update data if a new image was uploaded
        if (req.file) {
            // Delete old image if exists
            const oldFood = await foodModel.findById(id);
            if (oldFood && oldFood.image) {
                fs.unlink(`uploads/${oldFood.image}`, (err) => {
                    if (err) console.error("Error deleting old image:", err);
                });
            }
            
            updateData.image = req.file.filename;
        }

        const product = await foodModel.findByIdAndUpdate(id, updateData, {
            new: true, // Return the updated document
            runValidators: true // Run model validators on update
        });

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
            message: "Error updating product.", 
            error: error.message 
        });
    }
};

export { addFood, listFood, removeFood, updateFood };