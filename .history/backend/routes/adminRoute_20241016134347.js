import express from 'express';
import { registerAdmin, loginAdmin, updateCustomization, getCustomization } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.post('/register', registerAdmin);
adminRouter.post('/login', loginAdmin);
adminRouter.post('/admin/personalize', updateCustomization)
adminRouter.get('/admin/personalize', getCustomization)

export default adminRouter;
