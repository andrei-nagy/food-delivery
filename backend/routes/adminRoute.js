import express from 'express';
import { registerAdmin, loginAdmin, updateCustomization, getCustomization, getAllAdminAccounts, removeAccount, updateAccount, createQRCode, getQrCodes, removeQrCode } from '../controllers/adminController.js';

const adminRouter = express.Router();

// Rutele pentru admin
adminRouter.post('/register', registerAdmin);
adminRouter.post('/login', loginAdmin);
adminRouter.post('/personalize/update', updateCustomization); // Ruta pentru actualizare
adminRouter.get('/personalize', getCustomization); // Ruta pentru obținerea datelor de personalizare
adminRouter.get('/admins', getAllAdminAccounts)
adminRouter.post('/remove', removeAccount);
adminRouter.post('/create-qrcode', createQRCode);
adminRouter.get('/qrcodes', getQrCodes);
adminRouter.post('/remove-qrcode', removeQrCode);
adminRouter.post('/update', updateAccount);


export default adminRouter;
