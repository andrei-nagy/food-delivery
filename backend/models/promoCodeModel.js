import mongoose from "mongoose";

const promoSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableCategories: [{
    type: String
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pentru căutare rapidă după cod și status
promoSchema.index({ code: 1, isActive: 1 });
promoSchema.index({ endDate: 1 });

// Middleware pentru actualizarea updatedAt
promoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Metodă pentru verificarea validității promo code-ului
promoSchema.methods.isValid = function(orderAmount = 0) {
  const now = new Date();
  
  if (!this.isActive) {
    return { valid: false, message: "Promo code is not active" };
  }
  
  if (now < this.startDate) {
    return { valid: false, message: "Promo code is not yet active" };
  }
  
  if (now > this.endDate) {
    return { valid: false, message: "Promo code has expired" };
  }
  
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: "Promo code usage limit reached" };
  }
  
  if (orderAmount < this.minOrderAmount) {
    return { 
      valid: false, 
      message: `Minimum order amount of ${this.minOrderAmount} € required` 
    };
  }
  
  return { valid: true, message: "Promo code is valid" };
};

// Metodă pentru calcularea discount-ului
promoSchema.methods.calculateDiscount = function(orderAmount) {
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else {
    discount = this.discountValue;
    // Pentru discount fix, nu poate depăși valoarea comenzii
    if (discount > orderAmount) {
      discount = orderAmount;
    }
  }
  
  return discount;
};

export default mongoose.model("PromoCode", promoSchema);