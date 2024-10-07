import mongoose from "mongoose";

const callWaiterSchema = new mongoose.Schema({
    menu_name: {type:String, required: true},
    description: {type:String, required: true},
    image: {type:String, required: true},
})

const waiterModel = mongoose.models.waiterOrders || mongoose.model("waiterOrders", callWaiterSchema)

export default waiterModel;
