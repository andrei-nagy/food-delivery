// routes/splitBillRouter.js
import express from "express";
import authMiddleware from "../middleware/auth.js";
import splitBillController from "../controllers/splitBillController.js";

const splitBillRouter = express.Router();

// ✅ Split Bill cu card
splitBillRouter.post("/pay-split-bill", authMiddleware, splitBillController.paySplitBillWithCard);

// ✅ Split Bill cu cash
splitBillRouter.post("/pay-split-bill-cash", authMiddleware, splitBillController.paySplitBillWithCash);

// ✅ Verificare split bill
splitBillRouter.post("/verify-split", splitBillController.verifySplitBill);

// ✅ Obține statusul split bill
splitBillRouter.get("/status/:orderId", authMiddleware, splitBillController.getSplitBillStatus);

export default splitBillRouter;