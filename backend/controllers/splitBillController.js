import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import SplitPayment from "../models/splitPaymentModel.js";
import Stripe from "stripe";
import dotenv from "dotenv";
import { clearUserCart } from "./cartHelper.js";
import PromoCode from "../models/promoCodeModel.js";

dotenv.config();

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeKey);

// Helper pentru URL-ul de bază
const getBaseUrl = (req) => {
    const origin = req.headers.origin;
    if (origin) return origin;

    const host = req.headers.host;
    if (host) {
        const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
        const protocol = isLocalhost ? "http" : "https";
        return `${protocol}://${host}`;
    }

    return "http://localhost:5173";
};

// ✅ MODIFICAT: Funcție helper pentru calculul discountului proporțional
const calculateProportionalPromoDiscount = (items, totalOrderAmount, promoDiscount, promoCode) => {
  try {
    if (!promoCode || !promoDiscount || promoDiscount <= 0 || totalOrderAmount <= 0) {
      return 0;
    }
    
    // Calculează subtotal-ul selectat
    const selectedSubtotal = items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    // Calculează discountul proporțional
    const discountPercentage = promoDiscount / totalOrderAmount;
    const proportionalDiscount = selectedSubtotal * discountPercentage;
    
    console.log('📊 [calculateProportionalPromoDiscount]', {
      selectedSubtotal,
      totalOrderAmount,
      promoDiscount,
      discountPercentage,
      proportionalDiscount
    });
    
    return proportionalDiscount;
  } catch (error) {
    console.error('❌ Error calculating proportional promo discount:', error);
    return 0;
  }
};

const splitBillController = {
    // ✅ PLATĂ SPLIT BILL CU CARD - MODIFICAT PENTRU PROMO DISCOUNT
    paySplitBillWithCard: async (req, res) => {
        const frontend_url = getBaseUrl(req);

        try {
            const {
                items,
                amount,
                subtotal, // ✅ ADĂUGAT: Subtotal fără discount
                promoDiscount, // ✅ Discount proporțional calculat pe frontend
                tipAmount,
                originalOrderIds,
                userId,
                tableNo,
                promoCode,
                isPromoApplied
            } = req.body;

            console.log(`💳 [paySplitBillWithCard] START - User ${userId}`, {
                itemsCount: items?.length || 0,
                amount,
                subtotal,
                promoDiscount,
                tipAmount,
                promoCode,
                isPromoApplied,
                originalOrders: originalOrderIds?.length || 0
            });

            // Validare
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No items selected for payment'
                });
            }

            if (!originalOrderIds || !Array.isArray(originalOrderIds)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid order references'
                });
            }

            // Verifică dacă order-urile există
            const orders = await orderModel.find({ _id: { $in: originalOrderIds } });
            if (orders.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Orders not found'
                });
            }

            console.log(`📊 [paySplitBillWithCard] Found ${orders.length} orders`);

            // ✅ CALCULEAZĂ TOTALUL COMENZII ORIGINALE PENTRU VERIFICARE
            let totalOrderAmount = 0;
            for (const order of orders) {
                order.items.forEach(item => {
                    totalOrderAmount += item.price * item.quantity;
                });
            }
            
            console.log('💰 [paySplitBillWithCard] Order totals:', {
                totalOrderAmount,
                selectedSubtotal: subtotal,
                receivedPromoDiscount: promoDiscount
            });

            // Calculează suma totală pentru Stripe (în RON) - folosește amount care deja include discountul
            const totalAmountInRon = amount * 5.08; // Convertire EUR la RON
            const line_items = [{
                price_data: {
                    currency: "ron",
                    product_data: {
                        name: `Split Bill Payment - ${items.length} items`,
                        description: `Table ${tableNo || 'Unknown'}`
                    },
                    unit_amount: Math.round(totalAmountInRon * 100),
                },
                quantity: 1,
            }];

            // Adaugă tip-ul separat dacă există
            if (tipAmount && tipAmount > 0) {
                const tipAmountInRon = tipAmount * 5.08;
                line_items.push({
                    price_data: {
                        currency: "ron",
                        product_data: {
                            name: "Tip",
                            description: "Thank you for your generosity!"
                        },
                        unit_amount: Math.round(tipAmountInRon * 100),
                    },
                    quantity: 1,
                });
            }

            // ✅ CREEAZĂ DESCRIERE PENTRU METADATA
            const sessionDescription = `Split Bill: ${items.length} items`;
            if (promoCode && isPromoApplied) {
                sessionDescription += ` | Promo: ${promoCode} (-${promoDiscount?.toFixed(2) || '0'}€)`;
            }

            // Crează sesiunea Stripe
            const session = await stripe.checkout.sessions.create({
                line_items: line_items,
                mode: "payment",
                success_url: `${frontend_url}/verify?success=true&type=split&orderIds=${originalOrderIds.join(',')}&userId=${userId}&promoCode=${promoCode || ''}&promoDiscount=${promoDiscount || 0}`,
                cancel_url: `${frontend_url}/my-orders`,
                metadata: {
                    userId,
                    tableNo: tableNo || 'Unknown',
                    originalOrderIds: JSON.stringify(originalOrderIds),
                    items: JSON.stringify(items),
                    itemCount: items.length.toString(),
                    amount: amount.toString(),
                    subtotal: (subtotal || amount).toString(), // ✅ Trimitem și subtotal-ul
                    promoDiscount: (promoDiscount || 0).toString(), // ✅ Trimitem discountul
                    tipAmount: tipAmount?.toString() || '0',
                    promoCode: promoCode || '',
                    isPromoApplied: (isPromoApplied || false).toString(),
                    paymentType: 'split_bill'
                }
            });

            // Salvează split payment în așteptare
            const splitPayment = new SplitPayment({
                userId,
                originalOrderIds,
                items,
                amount, // Total cu discount aplicat
                subtotal: subtotal || amount, // Subtotal fără discount
                promoDiscount: promoDiscount || 0, // Discount proporțional
                tipAmount: tipAmount || 0,
                tableNo,
                stripeSessionId: session.id,
                paymentMethod: 'card',
                status: 'pending',
                metadata: {
                    promoCode,
                    isPromoApplied: isPromoApplied || false,
                    itemsCount: items.length,
                    originalItems: items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.price * item.quantity
                    }))
                }
            });

            await splitPayment.save();

            console.log(`✅ [paySplitBillWithCard] Split payment saved:`, {
                id: splitPayment._id,
                userId,
                amount,
                subtotal: splitPayment.subtotal,
                promoDiscount: splitPayment.promoDiscount,
                itemsCount: items.length
            });

            res.json({
                success: true,
                session_url: session.url,
                sessionId: session.id,
                message: 'Split bill payment session created'
            });

        } catch (error) {
            console.error('❌ Error in paySplitBillWithCard:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process split bill payment',
                error: error.message
            });
        }
    },

    // ✅ PLATĂ SPLIT BILL CU CASH - MODIFICAT PENTRU PROMO DISCOUNT
    paySplitBillWithCash: async (req, res) => {
        try {
            const {
                items,
                amount,
                subtotal, // ✅ ADĂUGAT: Subtotal fără discount
                promoDiscount, // ✅ Discount proporțional calculat pe frontend
                originalOrderIds,
                userId,
                tableNo,
                tipAmount,
                promoCode,
                isPromoApplied
            } = req.body;

            console.log(`💵 [paySplitBillWithCash] START - User ${userId}`, {
                itemsCount: items?.length || 0,
                amount,
                subtotal,
                promoDiscount,
                tipAmount,
                promoCode,
                isPromoApplied,
                originalOrders: originalOrderIds?.length || 0
            });

            // Validare
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No items selected for payment'
                });
            }

            // Verifică dacă order-urile există
            const orders = await orderModel.find({ _id: { $in: originalOrderIds } });
            if (orders.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Orders not found'
                });
            }

            console.log(`📊 [paySplitBillWithCash] Processing ${orders.length} orders`);

            // ✅ CALCULEAZĂ TOTALUL COMENZII ORIGINALE PENTRU VERIFICARE
            let totalOrderAmount = 0;
            for (const order of orders) {
                order.items.forEach(item => {
                    totalOrderAmount += item.price * item.quantity;
                });
            }
            
            console.log('💰 [paySplitBillWithCash] Order totals:', {
                totalOrderAmount,
                selectedSubtotal: subtotal,
                receivedPromoDiscount: promoDiscount
            });

            // ✅ INCREMENTEAZĂ PROMO CODE USAGE (dacă există și este aplicat)
            if (promoCode && isPromoApplied && promoCode !== "null" && promoCode !== "undefined") {
                try {
                    console.log(`🔄 [paySplitBillWithCash] Looking for promo code: ${promoCode}`);
                    const promoCodeDoc = await PromoCode.findOne({
                        code: promoCode.toUpperCase().trim(),
                    });

                    if (promoCodeDoc) {
                        console.log(
                            `✅ [paySplitBillWithCash] Found promo code: ${promoCodeDoc.code}, current usage: ${promoCodeDoc.usedCount}`
                        );

                        const updatedPromo = await PromoCode.findByIdAndUpdate(
                            promoCodeDoc._id,
                            { $inc: { usedCount: 1 } },
                            { new: true }
                        );

                        console.log(
                            `✅ [paySplitBillWithCash] Promo code usage incremented to: ${updatedPromo.usedCount}`
                        );
                    } else {
                        console.log(`❌ [paySplitBillWithCash] Promo code not found: ${promoCode}`);
                    }
                } catch (promoError) {
                    console.error(
                        "❌ [paySplitBillWithCash] Error incrementing promo code usage:",
                        promoError
                    );
                }
            }

            // Actualizează fiecare order cu plățile parțiale
            for (const order of orders) {
                console.log(`📝 [paySplitBillWithCash] Processing order: ${order._id}`);
                console.log(`📊 Order payment status before:`, order.payment);

                items.forEach(splitItem => {
                    const orderItem = order.items.find(item => 
                        item._id.toString() === splitItem._id || 
                        item.foodId === splitItem.foodId ||
                        (item.name === splitItem.name && item.price === splitItem.price)
                    );
                    
                    if (orderItem) {
                        console.log(`🍽️ [paySplitBillWithCash] Processing item: ${orderItem.name}, quantity: ${splitItem.quantity}`);
                        
                        // Inițializează paidBy dacă nu există
                        if (!orderItem.paidBy) {
                            orderItem.paidBy = [];
                        }

                        // ✅ CALCULEAZĂ SUMA PENTRU ACEST ITEM (cu discount aplicat proporțional)
                        const itemSubtotal = splitItem.price * splitItem.quantity;
                        
                        // Aplică discount proporțional acestui item
                        let itemPromoDiscount = 0;
                        if (promoDiscount > 0 && subtotal > 0) {
                            const itemShare = itemSubtotal / subtotal;
                            itemPromoDiscount = promoDiscount * itemShare;
                        }
                        
                        const itemFinalAmount = Math.max(0, itemSubtotal - itemPromoDiscount);
                        
                        console.log(`💰 Item "${orderItem.name}" calculation:`, {
                            itemSubtotal,
                            itemPromoDiscount,
                            itemFinalAmount
                        });

                        // Verifică dacă utilizatorul a plătit deja pentru acest item
                        const existingPaymentIndex = orderItem.paidBy.findIndex(
                            payment => payment.userId === userId
                        );

                        if (existingPaymentIndex >= 0) {
                            // Actualizează plățile existente
                            orderItem.paidBy[existingPaymentIndex].amount += itemFinalAmount;
                            orderItem.paidBy[existingPaymentIndex].quantity += splitItem.quantity;
                            orderItem.paidBy[existingPaymentIndex].paymentDate = new Date();
                            console.log(`💰 Updated existing payment for user ${userId} on item "${orderItem.name}"`);
                        } else {
                            // Adaugă noua plată
                            orderItem.paidBy.push({
                                userId,
                                amount: itemFinalAmount,
                                quantity: splitItem.quantity,
                                paymentDate: new Date(),
                                paymentMethod: 'cash',
                                promoDiscount: itemPromoDiscount // ✅ Salvează discountul aplicat acestui item
                            });
                            console.log(`💰 Added new payment for user ${userId} on item "${orderItem.name}": ${itemFinalAmount} (with ${itemPromoDiscount} discount)`);
                        }

                        // Calculează totalul plătit pentru acest item
                        const totalPaid = orderItem.paidBy.reduce((sum, payment) => 
                            sum + (payment.amount || 0), 0);
                        const itemTotal = orderItem.price * orderItem.quantity;
                        
                        console.log(`💰 Item "${orderItem.name}" paid: ${totalPaid}/${itemTotal}`);
                        
                        // Actualizează statusul item-ului
                        orderItem.status = totalPaid >= itemTotal ? 'fully_paid' : 'partially_paid';
                    } else {
                        console.log(`⚠️ [paySplitBillWithCash] Item not found in order:`, splitItem);
                    }
                });

                // ✅ ADĂUGĂ: Apelează updatePaymentStatus
                if (typeof order.updatePaymentStatus === 'function') {
                    console.log(`🔄 [paySplitBillWithCash] Calling updatePaymentStatus for order ${order._id}`);
                    order.updatePaymentStatus();
                } else {
                    console.log(`⚠️ [paySplitBillWithCash] updatePaymentStatus not available, using fallback logic`);
                    // Fallback logic
                    const allItemsFullyPaid = order.items.every(item => 
                        item.status === 'fully_paid'
                    );
                    order.payment = allItemsFullyPaid;
                    
                    if (allItemsFullyPaid) {
                        order.paymentDate = new Date();
                        order.paymentMethod = 'split_cash';
                    }
                }

                await order.save();
                
                console.log(`📊 Order ${order._id} payment status after:`, order.payment);
            }

            // Salvează split payment pentru istoric
            const splitPayment = new SplitPayment({
                userId,
                originalOrderIds,
                items,
                amount, // Total cu discount aplicat
                subtotal: subtotal || amount, // Subtotal fără discount
                promoDiscount: promoDiscount || 0, // Discount proporțional
                tipAmount: tipAmount || 0,
                tableNo,
                paymentMethod: 'cash',
                status: 'completed',
                metadata: {
                    promoCode,
                    isPromoApplied: isPromoApplied || false,
                    paidItems: items.map(item => ({
                        itemId: item._id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        amount: item.price * item.quantity
                    }))
                }
            });

            await splitPayment.save();
            console.log(`✅ [paySplitBillWithCash] Split payment ${splitPayment._id} saved with promo discount: ${promoDiscount || 0}`);

            res.json({
                success: true,
                message: 'Split bill cash payment recorded successfully',
                data: {
                    amountPaid: amount,
                    itemsPaid: items.length,
                    promoDiscount: promoDiscount || 0,
                    orderIds: originalOrderIds,
                    paymentStatus: 'processed'
                }
            });

        } catch (error) {
            console.error('❌ Error in paySplitBillWithCash:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process split bill cash payment',
                error: error.message
            });
        }
    },

    // ✅ VERIFICARE SPLIT BILL - MODIFICAT PENTRU PROMO DISCOUNT
    verifySplitBill: async (req, res) => {
        const { orderIds, success, userId, promoCode, promoDiscount, type } = req.body;
        
        console.log(`🔍 [verifySplitBill] START verification:`, {
            orderIds,
            userId,
            promoCode,
            promoDiscount,
            type
        });
        
        try {
            if (success === "true" && type === "split") {
                // ✅ INCREMENTEAZĂ PROMO CODE USAGE (dacă există)
                if (promoCode && promoCode !== "null" && promoCode !== "undefined" && promoDiscount > 0) {
                    try {
                        const promoCodeDoc = await PromoCode.findOne({ 
                            code: promoCode.toUpperCase().trim() 
                        });
                        
                        if (promoCodeDoc) {
                            const updatedPromo = await PromoCode.findByIdAndUpdate(
                                promoCodeDoc._id,
                                { $inc: { usedCount: 1 } },
                                { new: true }
                            );
                            console.log(`✅ Split bill promo code usage incremented: ${promoCode} -> ${updatedPromo.usedCount}`);
                        } else {
                            console.log(`⚠️ Promo code not found: ${promoCode}`);
                        }
                    } catch (promoError) {
                        console.error("❌ Error incrementing split bill promo code:", promoError);
                    }
                }

                // Găsește split payment-ul
                const orderIdArray = orderIds.split(',');
                const splitPayment = await SplitPayment.findOne({
                    originalOrderIds: { $all: orderIdArray },
                    userId: userId,
                    status: 'pending'
                });

                if (splitPayment) {
                    console.log(`✅ [verifySplitBill] Found split payment: ${splitPayment._id}`);

                    // Actualizează split payment-ul ca completat
                    splitPayment.status = 'completed';
                    splitPayment.paymentDate = new Date();
                    await splitPayment.save();

                    // Actualizează order-urile originale
                    for (const orderId of orderIdArray) {
                        const order = await orderModel.findById(orderId);
                        if (order) {
                            console.log(`📝 [verifySplitBill] Processing order: ${order._id}`);

                            splitPayment.items.forEach(splitItem => {
                                const orderItem = order.items.find(item => 
                                    item._id.toString() === splitItem._id || 
                                    item.foodId === splitItem.foodId ||
                                    (item.name === splitItem.name && item.price === splitItem.price)
                                );
                                
                                if (orderItem) {
                                    console.log(`🍽️ [verifySplitBill] Processing item: ${orderItem.name}`);
                                    
                                    // ✅ CALCULEAZĂ DISCOUNTUL PENTRU ACEST ITEM
                                    const itemSubtotal = splitItem.price * splitItem.quantity;
                                    let itemPromoDiscount = 0;
                                    
                                    if (splitPayment.promoDiscount > 0 && splitPayment.subtotal > 0) {
                                        const itemShare = itemSubtotal / splitPayment.subtotal;
                                        itemPromoDiscount = splitPayment.promoDiscount * itemShare;
                                    }
                                    
                                    const itemFinalAmount = Math.max(0, itemSubtotal - itemPromoDiscount);
                                    
                                    if (!orderItem.paidBy) {
                                        orderItem.paidBy = [];
                                    }

                                    // Adaugă plată cu discount
                                    orderItem.paidBy.push({
                                        userId,
                                        amount: itemFinalAmount,
                                        quantity: splitItem.quantity,
                                        paymentDate: new Date(),
                                        paymentMethod: 'card',
                                        stripeSessionId: splitPayment.stripeSessionId,
                                        promoDiscount: itemPromoDiscount // ✅ Salvează discountul
                                    });

                                    // Calculează totalul plătit pentru acest item
                                    const totalPaid = orderItem.paidBy.reduce((sum, payment) => 
                                        sum + (payment.amount || 0), 0);
                                    const itemTotal = orderItem.price * orderItem.quantity;
                                    
                                    console.log(`💰 Item "${orderItem.name}" paid: ${totalPaid}/${itemTotal} (with ${itemPromoDiscount} discount)`);
                                    
                                    orderItem.status = totalPaid >= itemTotal ? 'fully_paid' : 'partially_paid';
                                }
                            });

                            // Actualizează statusul order-ului
                            if (typeof order.updatePaymentStatus === 'function') {
                                console.log(`🔄 [verifySplitBill] Calling updatePaymentStatus for order ${order._id}`);
                                order.updatePaymentStatus();
                            } else {
                                const allItemsFullyPaid = order.items.every(item => 
                                    item.status === 'fully_paid'
                                );
                                order.payment = allItemsFullyPaid;
                                
                                if (allItemsFullyPaid) {
                                    order.paymentDate = new Date();
                                    order.paymentMethod = 'split_card';
                                }
                            }

                            await order.save();
                            console.log(`✅ [verifySplitBill] Order ${order._id} updated successfully`);
                        }
                    }

                    console.log(`✅ [verifySplitBill] Split bill payment verified for orders: ${orderIds}`);
                    res.json({ 
                        success: true, 
                        message: "Split bill payment verified successfully" 
                    });
                } else {
                    console.log(`❌ [verifySplitBill] Split payment not found`);
                    res.status(404).json({ 
                        success: false, 
                        message: "Split payment not found" 
                    });
                }
            } else {
                console.log(`❌ [verifySplitBill] Payment failed or invalid type`);
                res.json({ 
                    success: false, 
                    message: "Split bill payment failed" 
                });
            }
        } catch (error) {
            console.error('❌ Error in verifySplitBill:', error);
            res.status(500).json({ 
                success: false, 
                message: "Error verifying split bill payment" 
            });
        }
    },

    // ✅ OBȚINE STATUSUL SPLIT BILL PENTRU O COMANDĂ
    getSplitBillStatus: async (req, res) => {
        try {
            const { orderId } = req.params;
            const userId = req.body.userId;

            console.log(`🔍 [getSplitBillStatus] Getting status for order ${orderId}, user ${userId}`);

            const order = await orderModel.findById(orderId);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            // Calculează statistici
            let totalAmount = 0;
            let paidAmount = 0;
            let promoDiscountApplied = 0;
            const paymentDetails = [];
            const usersInvolved = new Set();

            order.items.forEach(item => {
                const itemTotal = item.price * item.quantity;
                totalAmount += itemTotal;

                let itemPaid = 0;
                if (item.paidBy && item.paidBy.length > 0) {
                    item.paidBy.forEach(payment => {
                        itemPaid += payment.amount || 0;
                        promoDiscountApplied += payment.promoDiscount || 0; // ✅ Adună discounturile aplicate
                        usersInvolved.add(payment.userId);
                        
                        paymentDetails.push({
                            itemName: item.name,
                            userId: payment.userId,
                            amount: payment.amount,
                            promoDiscount: payment.promoDiscount || 0,
                            quantity: payment.quantity,
                            paymentMethod: payment.paymentMethod,
                            paymentDate: payment.paymentDate
                        });
                    });
                }
                paidAmount += itemPaid;
            });

            const remainingAmount = totalAmount - paidAmount - promoDiscountApplied;
            const paymentProgress = totalAmount > 0 ? ((paidAmount + promoDiscountApplied) / totalAmount) * 100 : 0;

            // Verifică dacă order-ul este complet plătit
            let isOrderFullyPaid = false;
            if (typeof order.isFullyPaid === 'function') {
                isOrderFullyPaid = order.isFullyPaid();
            } else {
                isOrderFullyPaid = order.payment === true;
            }

            res.json({
                success: true,
                data: {
                    orderId,
                    tableNo: order.tableNo,
                    totalAmount,
                    paidAmount,
                    promoDiscountApplied,
                    remainingAmount,
                    paymentProgress: Math.round(paymentProgress * 100) / 100,
                    usersInvolved: Array.from(usersInvolved),
                    paymentDetails,
                    isOrderFullyPaid: isOrderFullyPaid,
                    orderPaymentStatus: order.payment,
                    items: order.items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.price * item.quantity,
                        status: item.status || 'unpaid',
                        paidBy: item.paidBy || []
                    }))
                }
            });

        } catch (error) {
            console.error('❌ Error in getSplitBillStatus:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get split bill status',
                error: error.message
            });
        }
    },

    // Helper pentru a obține modelul (pentru orderController)
    getModel: () => SplitPayment
};

export default splitBillController;