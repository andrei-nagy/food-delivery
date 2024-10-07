import express from "express";
import { loginUser, registerUser, autoLogin } from "../controllers/userController.js";

const userRouter = express.Router();

// Rute
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Noua rută pentru login automat
userRouter.get("/login", autoLogin);

export default userRouter;
