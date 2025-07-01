import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    isBestSeller: { type: Boolean, default: false },  // Nou câmp boolean
    isNewAdded: { type: Boolean, default: false },     // Nou câmp boolean
    isVegan: { type: Boolean, default: false }         // Nou câmp boolean
})

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema)

export default foodModel;
