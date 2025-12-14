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

// ✅ MODIFICAT: Funcție helper pentru verificarea userului după split bill - FĂRĂ dezactivare
const checkAndDeactivateUserAfterSplit = async (userId) => {
  try {
    console.log(`🔍 [checkAndDeactivateUserAfterSplit] START - Checking user ${userId}`);
    
    // VERIFICĂ MAI ÎNTÂI DACĂ USERUL E ACTIV
    const user = await userModel.findById(userId);
    if (!user) {
      console.log(`❌ [checkAndDeactivateUserAfterSplit] User ${userId} not found`);
      return false;
    }
    
    // ✅ IMPORTANT: NU mai facem userul inactiv aici!
    // Doar logăm starea și lăsăm orderController să se ocupe de dezactivare
    
    // Verifică dacă mai are comenzi neplătite în orderModel
    const unpaidOrders = await orderModel.find({ 
      userId: userId, 
      payment: false 
    });
    
    console.log(`📊 [checkAndDeactivateUserAfterSplit] Found ${unpaidOrders.length} unpaid orders`);
    
    // Verifică dacă mai are split bills neplătite
    const unpaidSplits = await SplitPayment.find({
      userId: userId,
      status: 'pending'
    });

    console.log(`📊 [checkAndDeactivateUserAfterSplit] Found ${unpaidSplits.length} unpaid split bills`);
    
    // ✅ SCHIMBARE: Doar logăm, NU facem userul inactiv
    const totalUnpaid = unpaidOrders.length + unpaidSplits.length;
    
    if (totalUnpaid === 0) {
      console.log(`✅ [checkAndDeactivateUserAfterSplit] User ${userId} could be deactivated (no unpaid orders/splits)`);
      console.log(`   • BUT: Letting orderController handle deactivation`);
      console.log(`   • Current isActive: ${user.isActive}`);
      return true;
    } else {
      console.log(`⚠️ [checkAndDeactivateUserAfterSplit] User ${userId} still has ${totalUnpaid} unpaid items:`, {
        orders: unpaidOrders.length,
        splits: unpaidSplits.length
      });
      console.log(`   • User should remain ACTIVE`);
      console.log(`   • Current isActive: ${user.isActive}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Error in checkAndDeactivateUserAfterSplit:", error);
    return false;
  }
};

const splitBillController = {
    // ✅ PLATĂ SPLIT BILL CU CARD
    paySplitBillWithCard: async (req, res) => {
        const frontend_url = getBaseUrl(req);

        try {
            const {
                items,
                amount,
                tipAmount,
                originalOrderIds,
                userId,
                tableNo,
                promoCode,
                promoDiscount
            } = req.body;

            console.log(`💳 [paySplitBillWithCard] Starting for user ${userId}, ${items.length} items, amount: ${amount}`);

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

            // Calculează suma totală pentru Stripe (în RON)
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

            // Crează sesiunea Stripe
            const session = await stripe.checkout.sessions.create({
                line_items: line_items,
                mode: "payment",
                success_url: `${frontend_url}/verify?success=true&type=split&orderIds=${originalOrderIds.join(',')}&userId=${userId}&promoCode=${promoCode || ''}`,
                cancel_url: `${frontend_url}/my-orders`,
                metadata: {
                    userId,
                    tableNo: tableNo || 'Unknown',
                    originalOrderIds: JSON.stringify(originalOrderIds),
                    items: JSON.stringify(items),
                    itemCount: items.length.toString(),
                    amount: amount.toString(),
                    tipAmount: tipAmount?.toString() || '0',
                    promoCode: promoCode || '',
                    promoDiscount: promoDiscount?.toString() || '0',
                    paymentType: 'split_bill'
                }
            });

            // Salvează split payment în așteptare
            const splitPayment = new SplitPayment({
                userId,
                originalOrderIds,
                items,
                amount,
                tipAmount: tipAmount || 0,
                tableNo,
                stripeSessionId: session.id,
                paymentMethod: 'card',
                status: 'pending',
                metadata: {
                    promoCode,
                    promoDiscount,
                    itemsCount: items.length,
                    originalItems: items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            });

            await splitPayment.save();

            console.log(`✅ [paySplitBillWithCard] Split payment ${splitPayment._id} saved for user ${userId}`);

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

    // ✅ PLATĂ SPLIT BILL CU CASH
    paySplitBillWithCash: async (req, res) => {
        try {
            const {
                items,
                amount,
                originalOrderIds,
                userId,
                tableNo,
                tipAmount,
                promoCode,
                promoDiscount
            } = req.body;

            console.log(`💵 [paySplitBillWithCash] Starting for user ${userId}, ${items.length} items, amount: ${amount}`);

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

            // INCREMENTEAZĂ PROMO CODE USAGE (dacă există)
            if (promoCode && promoCode !== "null" && promoCode !== "undefined") {
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
                console.log(`📊 Order ${order._id} payment status before:`, order.payment);
                console.log(`📊 Items before:`, order.items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    status: item.status,
                    paidBy: item.paidBy?.length || 0
                })));

                items.forEach(splitItem => {
                    const orderItem = order.items.find(item => 
                        item._id.toString() === splitItem._id || 
                        item.foodId === splitItem.foodId ||
                        (item.name === splitItem.name && item.price === splitItem.price)
                    );
                    
                    if (orderItem) {
                        console.log(`🍽️ [paySplitBillWithCash] Processing item: ${orderItem.name}, quantity: ${orderItem.quantity}`);
                        
                        // Inițializează paidBy dacă nu există
                        if (!orderItem.paidBy) {
                            orderItem.paidBy = [];
                        }

                        // Verifică dacă utilizatorul a plătit deja pentru acest item
                        const existingPaymentIndex = orderItem.paidBy.findIndex(
                            payment => payment.userId === userId
                        );

                        if (existingPaymentIndex >= 0) {
                            // Actualizează plățile existente
                            orderItem.paidBy[existingPaymentIndex].amount += splitItem.price * splitItem.quantity;
                            orderItem.paidBy[existingPaymentIndex].quantity += splitItem.quantity;
                            orderItem.paidBy[existingPaymentIndex].paymentDate = new Date();
                            console.log(`💰 Updated existing payment for user ${userId} on item "${orderItem.name}"`);
                        } else {
                            // Adaugă noua plată
                            orderItem.paidBy.push({
                                userId,
                                amount: splitItem.price * splitItem.quantity,
                                quantity: splitItem.quantity,
                                paymentDate: new Date(),
                                paymentMethod: 'cash'
                            });
                            console.log(`💰 Added new payment for user ${userId} on item "${orderItem.name}": ${splitItem.price * splitItem.quantity}`);
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

                // ✅ ADĂUGĂ: Apelează updatePaymentStatus dacă există
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
                console.log(`📊 Items after:`, order.items.map(item => ({
                    name: item.name,
                    status: item.status,
                    paidBy: item.paidBy?.map(p => ({ userId: p.userId, amount: p.amount })) || []
                })));
            }

            // Salvează split payment pentru istoric
            const splitPayment = new SplitPayment({
                userId,
                originalOrderIds,
                items,
                amount,
                tipAmount: tipAmount || 0,
                tableNo,
                paymentMethod: 'cash',
                status: 'completed',
                metadata: {
                    promoCode,
                    promoDiscount,
                    paidItems: items.map(item => ({
                        itemId: item._id,
                        name: item.name,
                        quantity: item.quantity,
                        originalQuantity: item.originalQuantity,
                        amount: item.price * item.quantity
                    }))
                }
            });

            await splitPayment.save();
            console.log(`✅ [paySplitBillWithCash] Split payment ${splitPayment._id} saved`);

            // ✅ VERIFICĂ DUPĂ PLATĂ DACĂ USERUL MAI ARE COMENZI NEPLĂTITE
            if (userId) {
                await checkAndDeactivateUserAfterSplit(userId);
            }

            res.json({
                success: true,
                message: 'Split bill cash payment recorded successfully',
                data: {
                    amountPaid: amount,
                    itemsPaid: items.length,
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

    // ✅ VERIFICARE SPLIT BILL (pentru Stripe webhook sau manual)
    verifySplitBill: async (req, res) => {
        const { orderIds, success, userId, promoCode, type } = req.body;
        
        console.log(`🔍 [verifySplitBill] Starting verification for user ${userId}, orderIds: ${orderIds}`);
        
        try {
            if (success === "true" && type === "split") {
                if (promoCode && promoCode !== "null" && promoCode !== "undefined") {
                    try {
                        const promoCodeDoc = await PromoCode.findOne({ code: promoCode });
                        if (promoCodeDoc) {
                            await PromoCode.findByIdAndUpdate(promoCodeDoc._id, {
                                $inc: { usedCount: 1 }
                            });
                            console.log(`✅ Split bill promo code usage incremented: ${promoCode}`);
                        }
                    } catch (promoError) {
                        console.error("❌ Error incrementing split bill promo code:", promoError);
                    }
                }

                // Găsește split payment-ul după orderIds
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
                            console.log(`📊 Order ${order._id} payment status before:`, order.payment);

                            splitPayment.items.forEach(splitItem => {
                                const orderItem = order.items.find(item => 
                                    item._id.toString() === splitItem._id || 
                                    item.foodId === splitItem.foodId ||
                                    (item.name === splitItem.name && item.price === splitItem.price)
                                );
                                
                                if (orderItem) {
                                    console.log(`🍽️ [verifySplitBill] Processing item: ${orderItem.name}`);
                                    
                                    if (!orderItem.paidBy) {
                                        orderItem.paidBy = [];
                                    }

                                    orderItem.paidBy.push({
                                        userId,
                                        amount: splitItem.price * splitItem.quantity,
                                        quantity: splitItem.quantity,
                                        paymentDate: new Date(),
                                        paymentMethod: 'card',
                                        stripeSessionId: splitPayment.stripeSessionId
                                    });

                                    // Calculează totalul plătit pentru acest item
                                    const totalPaid = orderItem.paidBy.reduce((sum, payment) => 
                                        sum + (payment.amount || 0), 0);
                                    const itemTotal = orderItem.price * orderItem.quantity;
                                    
                                    console.log(`💰 Item "${orderItem.name}" paid: ${totalPaid}/${itemTotal}`);
                                    
                                    orderItem.status = totalPaid >= itemTotal ? 'fully_paid' : 'partially_paid';
                                } else {
                                    console.log(`⚠️ [verifySplitBill] Item not found in order:`, splitItem);
                                }
                            });

                            // ✅ ADĂUGĂ: Apelează updatePaymentStatus dacă există
                            if (typeof order.updatePaymentStatus === 'function') {
                                console.log(`🔄 [verifySplitBill] Calling updatePaymentStatus for order ${order._id}`);
                                order.updatePaymentStatus();
                            } else {
                                console.log(`⚠️ [verifySplitBill] updatePaymentStatus not available, using fallback logic`);
                                // Fallback logic
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
                            
                            console.log(`📊 Order ${order._id} payment status after:`, order.payment);
                            console.log(`📊 Payment details:`, {
                                paymentType: order.paymentDetails?.paymentType,
                                fullyPaidByUser: order.paymentDetails?.fullyPaidByUser,
                                totalPaid: order.totalPaid,
                                remainingAmount: order.remainingAmount
                            });
                        }
                    }

                    // ✅ VERIFICĂ DUPĂ PLATĂ DACĂ USERUL MAI ARE COMENZI NEPLĂTITE
                    if (userId) {
                        await checkAndDeactivateUserAfterSplit(userId);
                    }

                    console.log(`✅ [verifySplitBill] Split bill payment verified for orders: ${orderIds}`);
                    res.json({ 
                        success: true, 
                        message: "Split bill payment verified successfully" 
                    });
                } else {
                    console.log(`❌ [verifySplitBill] Split payment not found for orderIds: ${orderIds}, userId: ${userId}`);
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
            const paymentDetails = [];
            const usersInvolved = new Set();

            order.items.forEach(item => {
                const itemTotal = item.price * item.quantity;
                totalAmount += itemTotal;

                let itemPaid = 0;
                if (item.paidBy && item.paidBy.length > 0) {
                    item.paidBy.forEach(payment => {
                        itemPaid += payment.amount || 0;
                        usersInvolved.add(payment.userId);
                        
                        paymentDetails.push({
                            itemName: item.name,
                            userId: payment.userId,
                            amount: payment.amount,
                            quantity: payment.quantity,
                            paymentMethod: payment.paymentMethod,
                            paymentDate: payment.paymentDate
                        });
                    });
                }
                paidAmount += itemPaid;
            });

            const remainingAmount = totalAmount - paidAmount;
            const paymentProgress = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

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