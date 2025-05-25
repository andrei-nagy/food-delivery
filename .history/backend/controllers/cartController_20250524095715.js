import userModel from "../models/userModel.js";



export const updateCart = async (req, res) => {
    try {
      const userId = req.user.id;  // presupunem că ai token care seteză req.user
      const { itemId, newQuantity, specialInstructions } = req.body;
  
      if (newQuantity < 0) return res.status(400).json({ error: "Cantitate invalidă" });
  
 
      
      const cart = await CartModel.findOne({ userId });
  
      if (!cart) {
        // Creezi un coș dacă nu există
        const newCart = new CartModel({ userId, items: [] });
        await newCart.save();
        return res.status(200).json({ message: "Coș creat" });
      }
  
      const itemIndex = cart.items.findIndex(i => i.itemId.toString() === itemId);
  
      if (itemIndex > -1) {
        if (newQuantity === 0) {
          // elimină itemul
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = newQuantity;
          if (specialInstructions !== undefined) {
            cart.items[itemIndex].specialInstructions = specialInstructions;
          }
        }
      } else {
        if (newQuantity > 0) {
          cart.items.push({ itemId, quantity: newQuantity, specialInstructions });
        }
      }
  
      await cart.save();
  
      return res.status(200).json({ message: "Cart updated", cart });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  };
// Add items to user cart
const addToCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;
        if (!cartData[req.body.itemId]) {
            cartData[req.body.itemId] = 1;
        } else {
            cartData[req.body.itemId] += 1;
        }
        await userModel.findByIdAndUpdate(req.body.userId, { cartData })
        res.json({ success: true, message: "Added To Cart" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Remove items from user cart
const removeFromCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;
        if (cartData[req.body.itemId] > 0) {
            cartData[req.body.itemId] -= 1;
        }

        await userModel.findByIdAndUpdate(req.body.userId, { cartData });
        res.json({ success: true, message: "Removed from cart" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}


// Fetch user cart data
const getCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let cartData = userData.cartData || {}; // fallback dacă e undefined
        res.json({ success: true, cartData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};



export { addToCart, removeFromCart, getCart }