import userModel from "../models/userModel.js";



export const updateCart = async (req, res) => {
  console.log("Received updateCart request:", req.body);

  try {
    const { userId, itemId, newQuantity, specialInstructions } = req.body;

    if (!itemId || typeof newQuantity !== "number" || newQuantity < 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Mai întâi preluăm userul pentru a verifica dacă există și pentru a lua cartData
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let cartData = user.cartData || {};

    if (newQuantity === 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = newQuantity;
    }

    // Actualizăm direct în baza de date folosind findByIdAndUpdate
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { cartData },
      { new: true }  // returnează documentul actualizat
    );

    res.status(200).json({ message: "Cart updated", cartData: updatedUser.cartData });

  } catch (error) {
    console.error("Error in updateCart:", error);
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