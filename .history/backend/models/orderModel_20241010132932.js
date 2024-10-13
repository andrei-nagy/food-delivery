import mongoose from 'mongoose'


const orderSchema = new mongoose.Schema({
    userId:{type:String, required: true},
    items:{type:Array, required: true},
    amount:{type:Number, required: true},
    tableNo:{type:Number, required: true},
    status:{type:String, default:"Food processing"},
    date:{type:Date, default: Date.now()},
    payment:{type:Boolean, default: false},
    userData:{type:Object, required: true},
    orderNumber: { type: Number, unique: true},
    paymentMethod: {type: String, required: true}
})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;