import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import OrderCounter from "../models/orderCounter.js";
import Stripe from "stripe";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
            payment: false  // Setăm comanda ca neplătită inițial (plata se face la livrare)
        });

        await newOrder.save();
        counter.counter += 1;
        await counter.save();

        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        res.json({
            success: true,
            message: "Order placed successfully (cash/POS)"
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
};


const placeOrder = async (req, res) => {

    const frontend_url = "https://food-delivery-frontend-vruc.onrender.com";

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
            orderNumber: orderNumber

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

        // line_items.push({
        //     price_data: {
        //         currency: "ron",
        //         product_data: {
        //             name: "Delivery Charges"
        //         },
        //         unit_amount: 2 * 100 * 4.5
        //     },
        //     quantity: 1
        // })

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

export { placeOrder, placeOrderCash, verifyOrder, userOrders, listOrders, updateStatus }
