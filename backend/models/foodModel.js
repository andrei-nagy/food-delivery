import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  // Informații de bază
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  discountedPrice: { type: Number, default: 0 },
  image: { type: String, required: true },
  category: { type: String, required: true },
  
  // Badge-uri și categorii speciale
  isBestSeller: { type: Boolean, default: false },
  isNewAdded: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  
  // Informații nutriționale
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 }, // în grame
    carbs: { type: Number, default: 0 }, // în grame
    fat: { type: Number, default: 0 }, // în grame
    fiber: { type: Number, default: 0 }, // în grame
    sugar: { type: Number, default: 0 } // în grame
  },
  
  // Informații despre preparare
  preparation: {
    cookingTime: { type: String, default: "" }, // ex: "15-20 minute"
    spiceLevel: { type: String, default: "" }, // ex: "Mediu 🌶️"
    servingSize: { type: String, default: "" }, // ex: "350g"
    difficulty: { type: String, default: "" } // ex: "Ușor"
  },
  
  // Informații dietetice
  dietaryInfo: {
    isGlutenFree: { type: Boolean, default: false },
    isDairyFree: { type: Boolean, default: false },
    isVegetarian: { type: Boolean, default: false },
    isSpicy: { type: Boolean, default: false },
    containsNuts: { type: Boolean, default: false }
  },
  
  // Lista de alergeni
  allergens: {
    type: [String],
    default: []
  },
  
  // Lista de ingrediente
  ingredients: {
    type: [String],
    default: []
  },
  
  // Extra opțiuni
  extras: {
    type: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    default: []
  },
  
  // Timp de preparare estimat (în minute) pentru sortare/filtrare
  estimatedPrepTime: { type: Number, default: 0 },
  
  // Nivel de picant numeric pentru sortare (0 = deloc picant, 5 = foarte picant)
  spiceLevelNumber: { type: Number, default: 0, min: 0, max: 5 },
  
  // Data creării și ultimei actualizări
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware pentru a calcula prețul redus și a actualiza updatedAt
foodSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculează prețul redus
  if (this.discountPercentage > 0 && this.discountPercentage <= 100) {
    this.discountedPrice = this.price * (1 - this.discountPercentage / 100);
  } else {
    this.discountedPrice = this.price;
  }
  
  // Calculează timpul estimat de preparare din string
  if (this.preparation.cookingTime) {
    const timeMatch = this.preparation.cookingTime.match(/(\d+)-(\d+)/);
    if (timeMatch) {
      this.estimatedPrepTime = Math.ceil((parseInt(timeMatch[1]) + parseInt(timeMatch[2])) / 2);
    } else {
      const singleTimeMatch = this.preparation.cookingTime.match(/(\d+)/);
      if (singleTimeMatch) {
        this.estimatedPrepTime = parseInt(singleTimeMatch[1]);
      }
    }
  }
  
  // Calculează nivelul numeric de picant
  if (this.dietaryInfo.isSpicy) {
    if (this.preparation.spiceLevel.includes('🌶️🌶️🌶️')) {
      this.spiceLevelNumber = 5;
    } else if (this.preparation.spiceLevel.includes('🌶️🌶️')) {
      this.spiceLevelNumber = 3;
    } else if (this.preparation.spiceLevel.includes('🌶️')) {
      this.spiceLevelNumber = 2;
    } else {
      this.spiceLevelNumber = 1;
    }
  }
  
  next();
});

// Index pentru căutare rapidă
foodSchema.index({ name: 'text', description: 'text' });
foodSchema.index({ category: 1 });
foodSchema.index({ isBestSeller: -1 });
foodSchema.index({ isNewAdded: -1 });
foodSchema.index({ 'dietaryInfo.isVegan': 1 });
foodSchema.index({ estimatedPrepTime: 1 });
foodSchema.index({ spiceLevelNumber: 1 });

// Virtual pentru a verifica dacă produsul are discount
foodSchema.virtual('hasDiscount').get(function() {
  return this.discountPercentage > 0;
});

// Metodă pentru a obține toate informațiile într-un format organizat
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
    nutrition: this.nutrition,
    preparation: this.preparation,
    dietaryInfo: this.dietaryInfo,
    allergens: this.allergens,
    ingredients: this.ingredients,
    extras: this.extras,
    quickInfo: {
      calories: this.nutrition.calories,
      servingSize: this.preparation.servingSize,
      isSpicy: this.dietaryInfo.isSpicy,
      spiceLevel: this.preparation.spiceLevel
    }
  };
};

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);
export default foodModel;