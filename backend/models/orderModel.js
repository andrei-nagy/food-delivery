import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'food', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    selectedExtras: [{
        name: { type: String, required: true },
        price: { type: Number, required: true }
    }],
    itemTotal: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: [orderItemSchema],
    amount: { type: Number, required: true },
    tableNo: { type: Number, required: true },
    status: { type: String, default: "Food processing" },
    date: { type: Date, default: Date.now },
    payment: { type: Boolean, default: false },
    userData: { type: Object, required: true },
    orderNumber: { type: Number, unique: true },
    paymentMethod: { type: String, required: true },
    orderRating: { type: Number, default: 0 },
    specialInstructions: { type: String }
})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;