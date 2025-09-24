import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
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
    default: [
      { name: "Extra Cheese", price: 1.50 },
      { name: "Extra Sauce", price: 0.75 }
    ]
  }
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);
export default foodModel;