import express from 'express';
import { registerAdmin, loginAdmin, updateCustomization, getCustomization, getAllAdminAccounts } from '../controllers/adminController.js';

const adminRouter = express.Router();

// Rutele pentru admin
adminRouter.post('/register', registerAdmin);
adminRouter.post('/login', loginAdmin);
adminRouter.post('/personalize/update', updateCustomization); // Ruta pentru actualizare
adminRouter.get('/personalize', getCustomization); // Ruta pentru obținerea datelor de personalizare
adminRouter.get('/admins', getAllAdminAccounts)

export default adminRouter;
