import express from "express"
import { addToCart,removeFromCart,getCart, updateCart, removeItemCompletely } from "../controllers/cartController.js"
import authMiddleware from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.post("/remove", authMiddleware, removeFromCart);
cartRouter.post("/get", authMiddleware, getCart);
cartRouter.post("/update", authMiddleware, updateCart);
cartRouter.post("/remove-item-completely", removeItemCompletely);



export default cartRouter