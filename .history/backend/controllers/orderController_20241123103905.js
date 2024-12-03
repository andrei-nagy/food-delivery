import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import OrderCounter from "../models/orderCounter.js";
import Stripe from "stripe";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



const placeOrder = async (req, res) => {

    // const currentUrl = window.location.href;
    // const wordToCheck = 'localhost'; 

    // if (currentUrl.includes(wordToCheck)) {
    //     const frontend_url = "https://localhost:5173";
    // } else {
    const frontend_url = "https://food-delivery-frontend-vruc.onrender.com";
    // }




    try {
        let counter = await OrderCounter.findOne();

        // Dacă nu există un document pentru contor, îl creăm
        if (!counter) {
            counter = new OrderCounter({ counter: 1 });
            await counter.save();
        }

        // Incrementează contorul și setează orderNumber pentru comanda curentă
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

        })

        await newOrder.save();
        // Actualizăm contorul pentru următoarea comandă
        counter.counter += 1;
        await counter.save();

        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} })

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "ron",
                product_data: {
                    name: 'Total Amount'
                },
                unit_amount: req.body.amount * 100 * 4.5
            },
            quantity: 1
        }))

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: "payment",
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        })


        res.json({
            success: true,
            session_url: session.url
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        })
    }

}
const payOrder = async (req, res) => {

    // const currentUrl = window.location.href;
    // const wordToCheck = 'localhost'; 

    // if (currentUrl.includes(wordToCheck)) {
    //     const frontend_url = "https://localhost:5173";
    // } else {
    const frontend_url = "https://food-delivery-frontend-vruc.onrender.com";
    // }




    try {

        const { orders, amount } = req.body; // Primește lista de comenzi și suma totală

        if (!orders || orders.length === 0) {
            return res.status(400).json({ success: false, message: "No orders provided." });
        }
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} })



        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "ron",
                product_data: {
                    name: `Total for orders: ${orders.join(", ")}`,

                },
                unit_amount: req.body.amount * 100 * 4.5
            },
            quantity: 1
        }))

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: "payment",
            success_url: `${frontend_url}/verify?success=true&orderIds=${orders.join(",")}`,
            cancel_url: `${frontend_url}/verify?success=false`,
        })

        // Dacă plata are succes, actualizăm fiecare orderId
  
            for (const orderId of orders) {
                await orderModel.findByIdAndUpdate(orderId, { payment: true });
            }
        
        res.json({
            success: true,
            session_url: session.url
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        })
    }

}
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

        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} })

        res.json({
            success: true,
            message: "Order placed successfully (cash/POS)",
            orderId: newOrder._id
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
};
const getOrderRating = async (req, res) => {
    const { orderId } = req.params; // Asigură-te că extragi din params
    console.log("Received orderId:", orderId); // Verifică ce ID primești
    try {
        const order = await orderModel.findById(orderId);
        console.log("Fetched order:", order); // Verifică ce obiect este returnat
        if (order) {
            res.json({ success: true, rating: order.orderRating || 0 });
        } else {
            res.json({ success: false, message: "Order not found" });
        }
    } catch (error) {
        console.error("Error fetching order:", error);
        res.json({ success: false, message: error.message });
    }
};
const updateOrderRating = async (req, res) => {
    const { orderId, rating } = req.body; // Primim orderId și ratingul
    try {
        if (rating >= 1 && rating <= 5) { // Validăm ratingul să fie între 1 și 5
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
            res.json({ success: true, message: "Paid" })
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error })
    }
}

// user orders for frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}



//listing orders for admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}



//api for updating order status 

const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status updated" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error" })
    }
}
const updatePaymentStatus = async (req, res) => {
    try {
        // Update the payment field, not status
        await orderModel.findByIdAndUpdate(req.body.orderId, { payment: req.body.payment });
        res.json({ success: true, message: "Payment status updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};


export { placeOrderCash, placeOrder, verifyOrder, userOrders, listOrders, updateStatus, updateOrderRating, getOrderRating, updatePaymentStatus, payOrder }
