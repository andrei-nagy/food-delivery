import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  ingredients: { type: String, default: "" },
  price: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  discountedPrice: { type: Number, default: 0 },
  image: { type: String, required: true },
  category: { type: String, required: true },
  isBestSeller: { type: Boolean, default: false },
  isNewAdded: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  extras: {
    type: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    default: []
  }
});

foodSchema.pre('save', function(next) {
  if (this.discountPercentage > 0 && this.discountPercentage <= 100) {
    this.discountedPrice = this.price * (1 - this.discountPercentage / 100);
  } else {
    this.discountedPrice = this.price;
  }
  next();
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);
export default foodModel;