// models/splitPaymentModel.js
import mongoose from 'mongoose';

const splitPaymentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    originalOrderIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order'
    }],
    items: [{
        _id: String,
        name: String,
        price: Number,
        quantity: Number,
        originalQuantity: Number,
        specialInstructions: String,
        extrasPrice: Number
    }],
    amount: {
        type: Number,
        required: true
    },
    tipAmount: {
        type: Number,
        default: 0
    },
    tableNo: Number,
    paymentMethod: {
        type: String,
        enum: ['card', 'cash'],
        required: true
    },
    stripeSessionId: String,
    stripePaymentIntentId: String,
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    metadata: {
        promoCode: String,
        promoDiscount: Number,
        paidItems: Array
    },
    paymentDate: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
});

// Index pentru performanță
splitPaymentSchema.index({ userId: 1, createdAt: -1 });
splitPaymentSchema.index({ stripeSessionId: 1 });
splitPaymentSchema.index({ originalOrderIds: 1 });

const SplitPayment = mongoose.models.SplitPayment || mongoose.model('SplitPayment', splitPaymentSchema);

export default SplitPayment;