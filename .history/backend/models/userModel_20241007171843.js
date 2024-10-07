import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    tableNumber: { type: Number },  // Nou atribut
    token: { type: String, unique: true },        // Nou atribut
    tokenExpiry: { type: Date },    // Nou atribut
}, { minimize: false });

const userModel = mongoose.model.user || mongoose.model("user", userSchema);

export default userModel;
