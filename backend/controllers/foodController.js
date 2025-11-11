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
        parsedExtras = [];
      }
    } else if (Array.isArray(extras)) {
      parsedExtras = extras;
    }

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

    const priceValue = parseFloat(price);
    const discountValue = parseFloat(discountPercentage) || 0;
    let discountedPrice = priceValue;
    
    if (discountValue > 0 && discountValue <= 100) {
      discountedPrice = priceValue * (1 - discountValue / 100);
    }

    const newFood = new foodModel({
      name,
      description,
      ingredients: ingredients || "",
      price: priceValue,
      discountPercentage: discountValue,
      discountedPrice: discountedPrice,
      category,
      image: req.file.filename,
      isBestSeller: isBestSeller === 'true' || isBestSeller === true,
      isNewAdded: isNewAdded === 'true' || isNewAdded === true,
      isVegan: isVegan === 'true' || isVegan === true,
      extras: parsedExtras
    });

    const savedFood = await newFood.save();
    
    res.json({ success: true, message: "Food added successfully", data: savedFood });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding food: " + error.message });
  }
};

const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    res.json({ success: false, message: "Error retrieving food list" });
  }
};

const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) {
      return res.json({ success: false, message: "Food not found" });
    }
    
    if (food.image) {
      fs.unlink(`uploads/${food.image}`, (err) => {
        if (err) console.error("Error deleting image:", err);
      });
    }

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    res.json({ success: false, message: "Error removing food" });
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
    
    let parsedExtras = [];
    if (extras && typeof extras === 'string') {
      try {
        parsedExtras = JSON.parse(extras);
      } catch (error) {
        parsedExtras = [];
      }
    } else if (Array.isArray(extras)) {
      parsedExtras = extras;
    }
    
    if (!id || !name || !description || !price || !category) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: id, name, description, price, or category" 
      });
    }

    const priceValue = parseFloat(price);
    const discountValue = parseFloat(discountPercentage) || 0;
    let discountedPrice = priceValue;
    
    if (discountValue > 0 && discountValue <= 100) {
      discountedPrice = priceValue * (1 - discountValue / 100);
    }

    const updateData = {
      name,
      description,
      ingredients: ingredients || "",
      category,
      price: priceValue,
      discountPercentage: discountValue,
      discountedPrice: discountedPrice,
      isBestSeller: isBestSeller === 'true' || isBestSeller === true,
      isNewAdded: isNewAdded === 'true' || isNewAdded === true,
      isVegan: isVegan === 'true' || isVegan === true,
      extras: parsedExtras
    };
    
    if (req.file) {
      const oldFood = await foodModel.findById(id);
      if (oldFood && oldFood.image) {
        const oldImagePath = `uploads/${oldFood.image}`;
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Error deleting old image:", err);
        });
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
    res.status(500).json({ 
      success: false, 
      message: "Error updating product.", 
      error: error.message 
    });
  }
};

export { addFood, listFood, removeFood, updateFood };