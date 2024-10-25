import express from 'express';
import { registerAdmin, loginAdmin, updateCustomization, getCustomization, getAllAdminAccounts, removeAccount } from '../controllers/adminController.js';

const adminRouter = express.Router();

// Rutele pentru admin
adminRouter.post('/register', registerAdmin);
adminRouter.post('/login', loginAdmin);
adminRouter.post('/personalize/update', updateCustomization); // Ruta pentru actualizare
adminRouter.get('/personalize', getCustomization); // Ruta pentru obținerea datelor de personalizare
adminRouter.get('/admins', getAllAdminAccounts)
adminRouter.get('/admins', getAllAdminAccounts)
foodRouter.post('/remove', removeAccount);


export default adminRouter;
