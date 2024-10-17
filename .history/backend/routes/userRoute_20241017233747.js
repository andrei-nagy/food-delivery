import express from "express";
import { loginUser, registerUser, autoLogin, autoRegister } from "../controllers/userController.js";
import userModel from "../models/userModel.js";

const userRouter = express.Router();

// Rute
// userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Noua rută pentru login automat
userRouter.get("/login", autoLogin);


// Noua rută pentru login automat
userRouter.post("/register", autoRegister);


userRouter.post('/check-status', async (req, res) => {
    const userId = req.headers.userId;
  
    try {
      const user = await userModel.findOne({ userId });
  
      if (user) {
        return res.status(200).json({
          isActive: user.isActive,
          tokenExpiry: user.tokenExpiry
        });
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error checking user status' });
    }
  });
  
export default userRouter;
