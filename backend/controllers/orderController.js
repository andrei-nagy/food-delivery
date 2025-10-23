import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import OrderCounter from "../models/orderCounter.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
  const getFrontendUrl = () => {
        const origin = req.get('origin') || req.get('referer') || '';
        
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return "http://localhost:3000";
        }
        return "https://orderly-app.com"; // SAU domeniul tău real de frontend
    };

    const frontend_url = getFrontendUrl();
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

        // ✅ ȘTERGE cartItems după salvarea comenzii
        if (req.body.userId) {
            await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
        }

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "ron",
                product_data: {
                    name: 'Total Amount'
                },
                unit_amount: req.body.amount * 100 * 4.5
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
        console.log(error);
        res.json({
            success: false,
            message: "Error placing order"
        });
    }
};

const payOrder = async (req, res) => {
    // ✅ Folosește aceeași logică ca în frontend
    const getFrontendUrl = () => {
        const origin = req.get('origin') || req.get('referer') || '';
        
        // Dacă e localhost, folosește localhost:3000 (frontend)
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return "http://localhost:3000";
        }
        // Altfol folosește domeniul de producție
        return "https://orderly-app.com"; // SAU "https://api.orderly-app.com" dacă asta e frontend-ul tău
    };

    const frontend_url = getFrontendUrl();

    try {
        const { orders, amount, userId } = req.body;

        if (!orders || orders.length === 0) {
            return res.status(400).json({ success: false, message: "No orders provided." });
        }

        // ✅ ȘTERGE cartItems pentru utilizator
        if (userId) {
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
        }

        const line_items = [{
            price_data: {
                currency: "ron",
                product_data: {
                    name: `Total for orders: ${orders.join(", ")}`,
                },
                unit_amount: Math.round(amount * 100 * 4.5) // ✅ Adaugă Math.round
            },
            quantity: 1
        }];

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: "payment",
            success_url: `${frontend_url}/verify?success=true&orderIds=${orders.join(",")}`,
            cancel_url: `${frontend_url}/verify?success=false`,
        });

        console.log("🟢 [payOrder] Stripe session created for:", frontend_url);
        
        res.json({
            success: true,
            session_url: session.url
        });
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

        // ✅ ȘTERGE cartItems după salvarea comenzii
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

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success == "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error verifying order" });
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