import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { 
        type: [{
            name: String,
            price: Number,
            quantity: Number,
            image: String,
            foodId: String,
            specialInstructions: String,
            extrasPrice: { type: Number, default: 0 },
            baseFoodId: String,
            
            // ✅ CÂMPURI PENTRU SPLIT BILL
            paidBy: [{
                userId: { type: String, required: true },
                amount: { type: Number, required: true },
                quantity: { type: Number, required: true },
                paymentMethod: String,
                paymentDate: { type: Date, default: Date.now },
                stripeSessionId: String,
                isPartialPayment: { type: Boolean, default: false }
            }],
            
            sharedWith: [{ type: String }], // userId-uri cu care este partajat item-ul
            status: { 
                type: String, 
                enum: ['unpaid', 'partially_paid', 'fully_paid'], 
                default: 'unpaid' 
            }
        }], 
        required: true 
    },
    amount: { type: Number, required: true },
    tableNo: { type: Number, required: true },
    status: { type: String, default: "Food processing" },
    date: { type: Date, default: Date.now },
    payment: { type: Boolean, default: false },
    userData: { type: Object, required: true },
    orderNumber: { type: Number, unique: true },
    paymentMethod: { type: String, required: false },
    orderRating: { type: Number, default: 0 },
    specialInstructions: { type: String },
    
    // ✅ CÂMPURI PENTRU SPLIT BILL
    splitBillEnabled: { type: Boolean, default: false },
    totalPaid: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    
    // ✅ CÂMPURI PENTRU DETALII PLATĂ
    paymentDetails: {
        paidBy: [{
            userId: String,
            amount: Number,
            paymentMethod: String,
            paymentDate: Date,
            isFullPayment: Boolean,
            itemsPaid: [{
                itemId: String,
                name: String,
                quantity: Number,
                amount: Number
            }]
        }],
        paymentType: {
            type: String,
            enum: ['full', 'split', 'partial', 'mixed'],
            default: 'full'
        },
        fullyPaidByUser: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

// ✅ METODE HELPER PENTRU VERIFICARE PLĂȚI
orderSchema.methods.isFullyPaid = function() {
    // Dacă payment este false, clar nu e plătit
    if (!this.payment) return false;
    
    // Dacă nu are items, nu putem verifica
    if (!this.items || this.items.length === 0) return true;
    
    // Verifică fiecare item
    for (const item of this.items) {
        if (item.paidBy && item.paidBy.length > 0) {
            // Calculează total plătit pentru acest item
            const totalPaid = item.paidBy.reduce((sum, payment) => 
                sum + (payment.amount || 0), 0);
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            
            // Dacă item-ul nu este complet plătit, order-ul nu e complet plătit
            if (totalPaid < itemTotal) {
                return false;
            }
        } else {
            // Item-ul nu are plăți înregistrate
            return false;
        }
    }
    
    return true;
};

orderSchema.methods.getPaymentStatus = function() {
    if (!this.payment) return 'unpaid';
    
    if (!this.items || this.items.length === 0) return 'paid';
    
    let allFullyPaid = true;
    let anyPartiallyPaid = false;
    let anyUnpaid = false;
    
    for (const item of this.items) {
        if (item.paidBy && item.paidBy.length > 0) {
            const totalPaid = item.paidBy.reduce((sum, payment) => 
                sum + (payment.amount || 0), 0);
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            
            if (totalPaid >= itemTotal) {
                // Item complet plătit
            } else if (totalPaid > 0) {
                // Item parțial plătit
                anyPartiallyPaid = true;
                allFullyPaid = false;
            } else {
                // Item neplătit
                anyUnpaid = true;
                allFullyPaid = false;
            }
        } else {
            // Item fără plăți
            anyUnpaid = true;
            allFullyPaid = false;
        }
    }
    
    if (allFullyPaid) return 'fully_paid';
    if (anyPartiallyPaid) return 'partially_paid';
    if (anyUnpaid) return 'unpaid';
    return 'unknown';
};

orderSchema.methods.isFullyPaidByUser = function(userId) {
    // Verifică dacă un anumit user a plătit complet pentru toate item-urile
    if (!this.items || this.items.length === 0) return false;
    
    for (const item of this.items) {
        if (item.paidBy && item.paidBy.length > 0) {
            // Găsește plățile făcute de acest user
            const userPayments = item.paidBy.filter(payment => 
                payment.userId === userId);
            const totalPaidByUser = userPayments.reduce((sum, payment) => 
                sum + (payment.amount || 0), 0);
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            
            // Dacă userul nu a plătit tot pentru acest item
            if (totalPaidByUser < itemTotal) {
                return false;
            }
        } else {
            // Item fără plăți
            return false;
        }
    }
    
    return true;
};

orderSchema.methods.getTotalPaidByUser = function(userId) {
    // Calculează totalul plătit de un anumit user
    let total = 0;
    
    if (this.items && this.items.length > 0) {
        for (const item of this.items) {
            if (item.paidBy && item.paidBy.length > 0) {
                const userPayments = item.paidBy.filter(payment => 
                    payment.userId === userId);
                const userTotal = userPayments.reduce((sum, payment) => 
                    sum + (payment.amount || 0), 0);
                total += userTotal;
            }
        }
    }
    
    return total;
};

orderSchema.methods.updatePaymentStatus = function() {
    // Actualizează status-ul order-ului bazat pe plățile item-urilor
    
    if (!this.items || this.items.length === 0) {
        this.payment = false;
        return;
    }
    
    let allItemsFullyPaid = true;
    
    for (const item of this.items) {
        if (item.paidBy && item.paidBy.length > 0) {
            const totalPaid = item.paidBy.reduce((sum, payment) => 
                sum + (payment.amount || 0), 0);
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            
            if (totalPaid >= itemTotal) {
                item.status = 'fully_paid';
            } else if (totalPaid > 0) {
                item.status = 'partially_paid';
                allItemsFullyPaid = false;
            } else {
                item.status = 'unpaid';
                allItemsFullyPaid = false;
            }
        } else {
            item.status = 'unpaid';
            allItemsFullyPaid = false;
        }
    }
    
    // Actualizează payment status-ul order-ului
    this.payment = allItemsFullyPaid;
    
    // Actualizează totalPaid și remainingAmount
    if (this.items && this.items.length > 0) {
        const totalOrderAmount = this.items.reduce((sum, item) => 
            sum + ((item.price || 0) * (item.quantity || 1)), 0);
        
        const totalPaidAmount = this.items.reduce((sum, item) => {
            if (item.paidBy && item.paidBy.length > 0) {
                const itemPaid = item.paidBy.reduce((itemSum, payment) => 
                    itemSum + (payment.amount || 0), 0);
                return sum + itemPaid;
            }
            return sum;
        }, 0);
        
        this.totalPaid = totalPaidAmount;
        this.remainingAmount = Math.max(0, totalOrderAmount - totalPaidAmount);
    }
    
    // Actualizează paymentType
    if (allItemsFullyPaid) {
        // Verifică dacă toate item-urile au fost plătite de același user
        const allUserIds = new Set();
        this.items.forEach(item => {
            if (item.paidBy) {
                item.paidBy.forEach(payment => {
                    allUserIds.add(payment.userId);
                });
            }
        });
        
        if (allUserIds.size === 1) {
            this.paymentDetails.paymentType = 'full';
            this.paymentDetails.fullyPaidByUser = true;
        } else {
            this.paymentDetails.paymentType = 'split';
            this.paymentDetails.fullyPaidByUser = false;
        }
    } else if (this.totalPaid > 0) {
        this.paymentDetails.paymentType = 'partial';
        this.paymentDetails.fullyPaidByUser = false;
    } else {
        this.paymentDetails.paymentType = 'full';
        this.paymentDetails.fullyPaidByUser = false;
    }
};

// ✅ INDEX-URI PENTRU PERFORMANȚĂ
orderSchema.index({ userId: 1, payment: 1 });
orderSchema.index({ tableNo: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.paidBy.userId': 1 });

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;