import mongoose from "mongoose";

const callWaiterSchema = new mongoose.Schema({
    action: { type: String, required: true },
    tableNo: { type: String, required: true },
    status:{type:String, default:"Pending"},
    createdOn: { type: Date, default: Date.now }  // Automat populat cu data și ora curente
})

const waiterModel = mongoose.models.waiterOrders || mongoose.model("waiterOrders", callWaiterSchema)

export default waiterModel;
