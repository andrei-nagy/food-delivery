import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    menu_name: {type:String, required: true},
    description: {type:String, required: true},
    image: {type:String, required: true},
    isActive: {type: Boolean, required: true, default: true}
})

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema)

export default categoryModel;
