// routes/orderRouter.js - ADAUGĂ ACESTE IMPORTURI ȘI ROUTE-URI
import express from "express";
import authMiddleware from "../middleware/auth.js";
import { 
    listOrders, 
    placeOrder, 
    placeOrderCash, 
    updateOrderRating, 
    updateStatus, 
    userOrders, 
    verifyOrder,
    getOrderRating, 
    updatePaymentStatus, 
    payOrder, 
    payOrderCash,
    sendReceiptByEmail  // ✅ IMPORTĂ FUNCȚIA NOUĂ
} from "../controllers/orderController.js";

// ✅ IMPORTĂ SPLIT BILL CONTROLLER
import splitBillController from "../controllers/splitBillController.js";

const orderRouter = express.Router();

// Rute existente
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/pay-order", authMiddleware, payOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userOrders", authMiddleware, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);
orderRouter.post("/place-cash", authMiddleware, placeOrderCash);
orderRouter.post('/update-rating', updateOrderRating);
orderRouter.get('/:orderId/rating', getOrderRating);
orderRouter.post("/payment-status", updatePaymentStatus);
orderRouter.post('/pay-order-cash', authMiddleware, payOrderCash);

// ✅ RUTĂ NOUĂ PENTRU TRIMITEREA CHITANȚEI PE EMAIL
orderRouter.post('/send-receipt', authMiddleware, sendReceiptByEmail);

// ✅ RUTE NOI PENTRU SPLIT BILL
orderRouter.post("/pay-split-bill", authMiddleware, splitBillController.paySplitBillWithCard);
orderRouter.post("/pay-split-bill-cash", authMiddleware, splitBillController.paySplitBillWithCash);
orderRouter.post("/verify-split", splitBillController.verifySplitBill);
orderRouter.get("/split-status/:orderId", authMiddleware, splitBillController.getSplitBillStatus);

export default orderRouter;