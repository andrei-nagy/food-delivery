import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    tableNumber: { type: Number },  
    token: { type: String, required: true, unique: true },
    tokenExpiry: { type: Date },  
    activeSessions: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { 
    minimize: false,
    timestamps: true 
});


const userModel = mongoose.model.user || mongoose.model("user", userSchema);

export default userModel;
