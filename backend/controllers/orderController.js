import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import OrderCounter from "../models/orderCounter.js";
import Stripe from "stripe";
import dotenv from 'dotenv';
import { clearUserCart } from "./cartHelper.js";

dotenv.config();

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeKey);

// ✅ Funcție helper care primește req ca parametru
const getBaseUrl = (req) => {
    const origin = req.headers.origin;
    
    if (origin) {
        return origin;
    }
    
    const host = req.headers.host;
    if (host) {
        const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
        const protocol = isLocalhost ? 'http' : 'https';
        return `${protocol}://${host}`;
    }
    
    return "http://localhost:5173";
};

const placeOrder = async (req, res) => {
    // ✅ Folosește funcția cu req ca parametru
    const frontend_url = getBaseUrl(req);
    
    try {
        let counter = await OrderCounter.findOne();

        if (!counter) {
            counter = new OrderCounter({ counter: 1 });
            await counter.save();
        }

        const orderNumber = counter.counter;

        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            tableNo: req.body.tableNo,
            userData: req.body.userData,
            orderNumber: orderNumber,
            paymentMethod: 'Online card',
            specialInstructions: req.body.specialInstructions
        });

        await newOrder.save();
        
        counter.counter += 1;
        await counter.save();

        // ✅ NU se șterge coșul aici pentru card - se va șterge doar după plată cu succes

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "ron",
                product_data: {
                    name: 'Total Amount'
                },
                unit_amount: Math.round(req.body.amount * 100 * 5.08)
            },
            quantity: 1
        }));

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: "payment",
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        });

        res.json({
            success: true,
            session_url: session.url
        });
    } catch (error) {
        console.log("🔴 Error in placeOrder:", error);
        res.json({
            success: false,
            message: "Error placing order"
        });
    }
};

const payOrder = async (req, res) => {
    // ✅ Folosește funcția cu req ca parametru
    const frontend_url = getBaseUrl(req);

    try {
        const { orders, amount, userId } = req.body;

        if (!orders || orders.length === 0) {
            return res.status(400).json({ success: false, message: "No orders provided." });
        }

        // ✅ NU se șterge coșul aici pentru card

        const line_items = [{
            price_data: {
                currency: "ron",
                product_data: {
                    name: `Total for orders: ${orders.join(", ")}`,
                },
                unit_amount: Math.round(amount * 100 * 5.08)
            },
            quantity: 1
        }];

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: "payment",
            success_url: `${frontend_url}/verify?success=true&orderIds=${orders.join(",")}`,
            cancel_url: `${frontend_url}/verify?success=false`,
        });

        res.json({
            success: true,
            session_url: session.url
        });
        const result = await clearUserCart(userId);

    } catch (error) {
        console.log("🔴 [payOrder] Error:", error);
        res.json({
            success: false,
            message: "Error processing payment"
        });
    }
};

const placeOrderCash = async (req, res) => {
    try {
        let counter = await OrderCounter.findOne();

        if (!counter) {
            counter = new OrderCounter({ counter: 1 });
            await counter.save();
        }

        const orderNumber = counter.counter;

        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            tableNo: req.body.tableNo,
            userData: req.body.userData,
            orderNumber: orderNumber,
            payment: false,
            paymentMethod: 'Cash / POS',
            specialInstructions: req.body.specialInstructions
        });

        await newOrder.save();
        counter.counter += 1;
        await counter.save();

        // ✅ ȘTERGE cartItems după salvarea comenzii - pentru cash
        if (req.body.userId) {
            await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
        }

        res.json({
            success: true,
            message: "Order placed successfully (cash/POS)",
            orderId: newOrder._id
        });
    } catch (error) {
        console.log("Error in placeOrderCash:", error);
        res.json({
            success: false,
            message: "Error placing order"
        });
    }
};

const verifyOrder = async (req, res) => {
    const { orderId, success, orderIds } = req.body;
    try {
        if (success == "true") {
            // Procesează un singur orderId
            if (orderId) {
                await orderModel.findByIdAndUpdate(orderId, { payment: true });
                const order = await orderModel.findById(orderId);
                
                // Șterge cart-ul pentru utilizatorul comenzii
                if (order && order.userId) {
                    const result = await clearUserCart(order.userId);
                    console.log(`✅ Cart cleared for user ${order.userId}:`, result);
                }
            }
            
            // Procesează multiple orderIds (pentru payOrder)
            if (orderIds) {
                const orderIdArray = orderIds.split(',');
                for (const id of orderIdArray) {
                    await orderModel.findByIdAndUpdate(id, { payment: true });
                    const order = await orderModel.findById(id);
                    
                    if (order && order.userId) {
                        const result = await clearUserCart(order.userId);
                        console.log(`✅ Cart cleared for user ${order.userId}:`, result);
                    }
                }
            }
            
            res.json({ success: true, message: "Paid" });
        } else {
            // Șterge comenziile dacă plata a eșuat
            if (orderId) {
                await orderModel.findByIdAndDelete(orderId);
            }
            if (orderIds) {
                const orderIdArray = orderIds.split(',');
                for (const id of orderIdArray) {
                    await orderModel.findByIdAndDelete(id);
                }
            }
            res.json({ success: false, message: "Not Paid" });
        }
    } catch (error) {
        console.log("🔴 Error in verifyOrder:", error);
        res.json({ success: false, message: "Error verifying order" });
    }
};

const getOrderRating = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await orderModel.findById(orderId);
        if (order) {
            res.json({ success: true, rating: order.orderRating || 0 });
        } else {
            res.json({ success: false, message: "Order not found" });
        }
    } catch (error) {
        console.error("Error fetching order:", error);
        res.json({ success: false, message: "Error fetching order" });
    }
};

const updateOrderRating = async (req, res) => {
    const { orderId, rating } = req.body;
    try {
        if (rating >= 1 && rating <= 5) {
            await orderModel.findByIdAndUpdate(orderId, { orderRating: rating });
            res.json({ success: true, message: "Order rating updated successfully!" });
        } else {
            res.json({ success: false, message: "Rating must be between 1 and 5." });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating rating" });
    }
};

const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching user orders" });
    }
};

const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching orders" });
    }
};

const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating status" });
    }
};

const updatePaymentStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { payment: req.body.payment });
        res.json({ success: true, message: "Payment status updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating payment status" });
    }
};

export { 
    placeOrderCash, 
    placeOrder, 
    verifyOrder, 
    userOrders, 
    listOrders, 
    updateStatus, 
    updateOrderRating, 
    getOrderRating, 
    updatePaymentStatus, 
    payOrder 
};