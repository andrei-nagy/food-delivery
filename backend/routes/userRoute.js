import express from "express";
import { 
  loginUser, 
  registerUser, 
  autoLogin, 
  autoRegister, 
  checkUserStatus, 
  getUserCount, 
  getAllUsers, 
  updateUserStatus, 
  extendTokenTime, 
  extendTokenSessionExpired,
  checkExtensionStatus,
  setExtensionStatus 
} from "../controllers/userController.js";
import userModel from "../models/userModel.js";

const userRouter = express.Router();

// Rute
userRouter.post("/login", loginUser);
userRouter.get("/login", autoLogin);
userRouter.post("/register", autoRegister);
userRouter.post('/check-status', checkUserStatus);
userRouter.get('/count', getUserCount);
userRouter.get('/list', getAllUsers);
userRouter.put('/update-status/:id', updateUserStatus);
userRouter.post('/extend-time', extendTokenTime);
userRouter.post('/extend-session-expired', extendTokenSessionExpired);

// ✅ RUTE NOI PENTRU EXTENSION STATUS
userRouter.get('/extension-status', checkExtensionStatus);
userRouter.post('/set-extension-status', setExtensionStatus);

export default userRouter;