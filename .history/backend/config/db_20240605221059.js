import mongoose from "mongoose";


const connectDB = async () => {
    await mongoose.connect('mongodb+srv://andreixfr:andrei0411@cluster0.7w0bswv.mongodb.net/food-delivery')
}