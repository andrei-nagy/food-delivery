import express from 'express';
import { registerAdmin, loginAdmin, updateCustomization } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.post('/register', registerAdmin);
adminRouter.post('/login', loginAdmin);
adminRouter.post('/personalize', updateCustomization)

export default adminRouter;
