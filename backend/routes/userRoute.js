import express from "express";
import { loginUser, registerUser, autoLogin, autoRegister, checkUserStatus, getUserCount, getAllUsers, updateUserStatus } from "../controllers/userController.js";
import userModel from "../models/userModel.js";

const userRouter = express.Router();

// Rute
// userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Noua rută pentru login automat
userRouter.get("/login", autoLogin);


// Noua rută pentru login automat
userRouter.post("/register", autoRegister);


userRouter.post('/check-status', checkUserStatus);
userRouter.get('/count', getUserCount);
userRouter.get('/list', getAllUsers);
userRouter.put('/update-status/:id', updateUserStatus);

export default userRouter;
