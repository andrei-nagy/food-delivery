import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  // Informații de bază
  name: { 
    type: String, 
    required: [true, "Product name is required"],
    trim: true
  },
  description: { 
    type: String, 
    required: [true, "Product description is required"],
    trim: true
  },
  price: { 
    type: Number, 
    required: [true, "Product price is required"],
    min: [0, "Price cannot be negative"]
  },
  discountPercentage: { 
    type: Number, 
    default: 0,
    min: [0, "Discount cannot be negative"],
    max: [100, "Discount cannot exceed 100%"]
  },
  discountedPrice: { 
    type: Number, 
    default: 0,
    min: [0, "Discounted price cannot be negative"]
  },
  image: { 
    type: String, 
    required: [true, "Product image is required"]
  },
  category: { 
    type: String, 
    required: [true, "Product category is required"],
    trim: true
  },
  
  // Badge-uri și categorii speciale
  isBestSeller: { 
    type: Boolean, 
    default: false 
  },
  isNewAdded: { 
    type: Boolean, 
    default: false 
  },
  isVegan: { 
    type: Boolean, 
    default: false 
  },
  
  // Informații nutriționale - CORECTAT cu valori default explicite
  nutrition: {
    calories: { 
      type: Number, 
      default: 0,
      min: [0, "Calories cannot be negative"]
    },
    protein: { 
      type: Number, 
      default: 0,
      min: [0, "Protein cannot be negative"]
    },
    carbs: { 
      type: Number, 
      default: 0,
      min: [0, "Carbs cannot be negative"]
    },
    fat: { 
      type: Number, 
      default: 0,
      min: [0, "Fat cannot be negative"]
    },
    fiber: { 
      type: Number, 
      default: 0,
      min: [0, "Fiber cannot be negative"]
    },
    sugar: { 
      type: Number, 
      default: 0,
      min: [0, "Sugar cannot be negative"]
    }
  },
  
  // Informații despre preparare - CORECTAT cu valori default explicite
  preparation: {
    cookingTime: { 
      type: String, 
      default: "",
      trim: true
    },
    spiceLevel: { 
      type: String, 
      default: "",
      trim: true
    },
    servingSize: { 
      type: String, 
      default: "",
      trim: true
    },
    difficulty: { 
      type: String, 
      default: "",
      trim: true
    }
  },
  
  // Informații dietetice - CORECTAT cu valori default explicite
  dietaryInfo: {
    isGlutenFree: { 
      type: Boolean, 
      default: false 
    },
    isDairyFree: { 
      type: Boolean, 
      default: false 
    },
    isVegetarian: { 
      type: Boolean, 
      default: false 
    },
    isSpicy: { 
      type: Boolean, 
      default: false 
    },
    containsNuts: { 
      type: Boolean, 
      default: false 
    }
  },
  
  // Lista de alergeni - CORECTAT
  allergens: [{
    type: String,
    trim: true
  }],
  
  // Lista de ingrediente - CORECTAT
  ingredients: [{
    type: String,
    trim: true
  }],
  
  // Extra opțiuni - CORECTAT
  extras: [{
    name: { 
      type: String, 
      required: [true, "Extra option name is required"],
      trim: true
    },
    price: { 
      type: Number, 
      required: [true, "Extra option price is required"],
      min: [0, "Extra price cannot be negative"]
    }
  }],
  
  // Timp de preparare estimat (în minute) pentru sortare/filtrare
  estimatedPrepTime: { 
    type: Number, 
    default: 0,
    min: [0, "Preparation time cannot be negative"]
  },
  
  // Nivel de picant numeric pentru sortare (0 = deloc picant, 5 = foarte picant)
  spiceLevelNumber: { 
    type: Number, 
    default: 0, 
    min: [0, "Spice level cannot be negative"], 
    max: [5, "Spice level cannot exceed 5"] 
  },
  
  // Data creării și ultimei actualizări
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  // Activează virtuals și transformări
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware pentru a calcula prețul redus și a actualiza updatedAt - CORECTAT
foodSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  console.log("🔄 FoodSchema pre-save middleware triggered");
  console.log("📊 Current data:", {
    price: this.price,
    discountPercentage: this.discountPercentage,
    preparation: this.preparation,
    dietaryInfo: this.dietaryInfo
  });
  
  // Calculează prețul redus
  if (this.discountPercentage > 0 && this.discountPercentage <= 100) {
    this.discountedPrice = this.price * (1 - this.discountPercentage / 100);
    console.log("💰 Discounted price calculated:", this.discountedPrice);
  } else {
    this.discountedPrice = this.price;
    console.log("💰 No discount applied, using original price");
  }
  
  // Calculează timpul estimat de preparare din string - CORECTAT
  if (this.preparation && this.preparation.cookingTime) {
    const timeMatch = this.preparation.cookingTime.match(/(\d+)-(\d+)/);
    if (timeMatch) {
      this.estimatedPrepTime = Math.ceil((parseInt(timeMatch[1]) + parseInt(timeMatch[2])) / 2);
      console.log("⏱️ Estimated prep time (range):", this.estimatedPrepTime);
    } else {
      const singleTimeMatch = this.preparation.cookingTime.match(/(\d+)/);
      if (singleTimeMatch) {
        this.estimatedPrepTime = parseInt(singleTimeMatch[1]);
        console.log("⏱️ Estimated prep time (single):", this.estimatedPrepTime);
      } else {
        this.estimatedPrepTime = 0;
        console.log("⏱️ No valid cooking time found");
      }
    }
  } else {
    this.estimatedPrepTime = 0;
  }
  
  // Calculează nivelul numeric de picant - CORECTAT
  if (this.dietaryInfo && this.dietaryInfo.isSpicy && this.preparation && this.preparation.spiceLevel) {
    if (this.preparation.spiceLevel.includes('🌶️🌶️🌶️')) {
      this.spiceLevelNumber = 5;
    } else if (this.preparation.spiceLevel.includes('🌶️🌶️')) {
      this.spiceLevelNumber = 3;
    } else if (this.preparation.spiceLevel.includes('🌶️')) {
      this.spiceLevelNumber = 2;
    } else {
      this.spiceLevelNumber = 1;
    }
    console.log("🌶️ Spice level calculated:", this.spiceLevelNumber);
  } else {
    this.spiceLevelNumber = 0;
    console.log("🌶️ No spice detected");
  }
  
  // ASIGURĂ că toate câmpurile nested au valori default dacă sunt undefined
  if (!this.nutrition) {
    this.nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    };
  }
  
  if (!this.preparation) {
    this.preparation = {
      cookingTime: "",
      spiceLevel: "",
      servingSize: "",
      difficulty: ""
    };
  }
  
  if (!this.dietaryInfo) {
    this.dietaryInfo = {
      isGlutenFree: false,
      isDairyFree: false,
      isVegetarian: false,
      isSpicy: false,
      containsNuts: false
    };
  }
  
  console.log("✅ Final data before save:", {
    nutrition: this.nutrition,
    preparation: this.preparation,
    dietaryInfo: this.dietaryInfo,
    allergens: this.allergens,
    ingredients: this.ingredients
  });
  
  next();
});

// Middleware pentru findOneAndUpdate - CORECTAT
foodSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  
  const update = this.getUpdate();
  console.log("🔄 findOneAndUpdate middleware triggered");
  console.log("📊 Update data:", update);
  
  // Procesează discountPercentage dacă este în update
  if (update.$set && update.$set.discountPercentage !== undefined) {
    const price = update.$set.price || this._conditions.price;
    const discountPercentage = update.$set.discountPercentage;
    
    if (discountPercentage > 0 && discountPercentage <= 100) {
      update.$set.discountedPrice = price * (1 - discountPercentage / 100);
    } else {
      update.$set.discountedPrice = price;
    }
    console.log("💰 Updated discounted price:", update.$set.discountedPrice);
  }
  
  next();
});

// Index pentru căutare rapidă - CORECTAT
foodSchema.index({ name: 'text', description: 'text' });
foodSchema.index({ category: 1 });
foodSchema.index({ isBestSeller: -1 });
foodSchema.index({ isNewAdded: -1 });
foodSchema.index({ 'dietaryInfo.isVegan': 1 });
foodSchema.index({ estimatedPrepTime: 1 });
foodSchema.index({ spiceLevelNumber: 1 });
foodSchema.index({ 'nutrition.calories': 1 });
foodSchema.index({ 'dietaryInfo.isGlutenFree': 1 });
foodSchema.index({ 'dietaryInfo.isVegetarian': 1 });

// Virtual pentru a verifica dacă produsul are discount
foodSchema.virtual('hasDiscount').get(function() {
  return this.discountPercentage > 0;
});

// Virtual pentru rating mediu (dacă vei adăuga ratings mai târziu)
foodSchema.virtual('averageRating').get(function() {
  // Poți adăuga logica pentru rating mai târziu
  return 0;
});

// Metodă pentru a obține toate informațiile într-un format organizat - CORECTAT
foodSchema.methods.getFoodDetails = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    price: this.price,
    discountPercentage: this.discountPercentage,
    discountedPrice: this.discountedPrice,
    hasDiscount: this.hasDiscount,
    image: this.image,
    category: this.category,
    badges: {
      isBestSeller: this.isBestSeller,
      isNewAdded: this.isNewAdded,
      isVegan: this.isVegan
    },
    nutrition: this.nutrition || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    },
    preparation: this.preparation || {
      cookingTime: "",
      spiceLevel: "",
      servingSize: "",
      difficulty: ""
    },
    dietaryInfo: this.dietaryInfo || {
      isGlutenFree: false,
      isDairyFree: false,
      isVegetarian: false,
      isSpicy: false,
      containsNuts: false
    },
    allergens: this.allergens || [],
    ingredients: this.ingredients || [],
    extras: this.extras || [],
    quickInfo: {
      calories: (this.nutrition && this.nutrition.calories) || 0,
      servingSize: (this.preparation && this.preparation.servingSize) || "",
      isSpicy: (this.dietaryInfo && this.dietaryInfo.isSpicy) || false,
      spiceLevel: (this.preparation && this.preparation.spiceLevel) || ""
    },
    preparationTime: this.estimatedPrepTime,
    spiceLevel: this.spiceLevelNumber
  };
};

// Metodă statică pentru a găsi produse by category - CORECTAT
foodSchema.statics.findByCategory = function(category) {
  return this.find({ category: new RegExp(category, 'i') });
};

// Metodă statică pentru a găsi best sellers - CORECTAT
foodSchema.statics.findBestSellers = function() {
  return this.find({ isBestSeller: true });
};

// Metodă statică pentru a găsi new arrivals - CORECTAT
foodSchema.statics.findNewArrivals = function() {
  return this.find({ isNewAdded: true });
};

// Metodă statică pentru a găsi produse vegane - CORECTAT
foodSchema.statics.findVegan = function() {
  return this.find({ isVegan: true });
};

// Metodă pentru a actualiza doar câmpurile specificate - CORECTAT
foodSchema.methods.updateFields = async function(updateData) {
  try {
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        this[key] = updateData[key];
      }
    });
    
    return await this.save();
  } catch (error) {
    console.error("❌ Error updating food fields:", error);
    throw error;
  }
};

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);
export default foodModel;