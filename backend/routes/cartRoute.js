// cartRouter.js - ADAUGĂ RUTA PENTRU CLEAR CART
import express from "express"
import { 
  addToCart, 
  removeFromCart, 
  getCart, 
  updateCart, 
  removeItemCompletely, 
  debugCart, 
  migrateAllCarts, 
  getCartByTable, 
  addToCartByTable,
  clearCart // ✅ ADAUGĂ ASTA
} from "../controllers/cartController.js"

const cartRouter = express.Router();

cartRouter.post("/add", addToCart);
cartRouter.post("/remove", removeFromCart);
cartRouter.post("/get", getCart);
cartRouter.post("/update", updateCart);
cartRouter.post("/remove-item-completely", removeItemCompletely);
cartRouter.post("/clear", clearCart); // ✅ RUTĂ NOUĂ
cartRouter.post("/debug", debugCart);
cartRouter.post("/migrate-all", migrateAllCarts);
cartRouter.post("/get-by-table", getCartByTable);
cartRouter.post("/add-by-table", addToCartByTable);

export default cartRouter;