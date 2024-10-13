import express from "express";
import authMiddleware from "../middleware/auth.js";
import { getOrderRating, listOrders, placeOrder, placeOrderCash, updateOrderRating, updateStatus, userOrders, verifyOrder } from "../controllers/orderController.js";



const orderRouter = express.Router();


orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userOrders", authMiddleware,userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);
orderRouter.post("/place-cash", authMiddleware, placeOrderCash);
orderRouter.post('/update-rating', updateOrderRating);
orderRouter.get('/order/:orderId/rating', getOrderRating);

export default orderRouter;