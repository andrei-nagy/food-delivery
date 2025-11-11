import express from 'express';
import { registerAdmin, loginAdmin, updateCustomization, getCustomization, getAllAdminAccounts, removeAccount, updateAccount, createQRCode, getQrCodes, removeQrCode } from '../controllers/adminController.js';
import promoCodeController from '../controllers/promoCodeController.js'; 
import authMiddleware from '../middleware/auth.js'; 

const adminRouter = express.Router();

adminRouter.post('/register', registerAdmin);
adminRouter.post('/login', loginAdmin);
adminRouter.post('/personalize/update', updateCustomization);
adminRouter.get('/personalize', getCustomization);
adminRouter.get('/admins', getAllAdminAccounts);
adminRouter.post('/remove', removeAccount);
adminRouter.post('/create-qrcode', createQRCode);
adminRouter.get('/qrcodes', getQrCodes);
adminRouter.post('/remove-qrcode', removeQrCode);
adminRouter.post('/update', updateAccount);

adminRouter.get('/promo-codes', authMiddleware, promoCodeController.getAllPromoCodes);
adminRouter.post('/promo-codes', authMiddleware, promoCodeController.createPromoCode);
adminRouter.put('/promo-codes/:id', authMiddleware, promoCodeController.updatePromoCode);
adminRouter.delete('/promo-codes/:id', authMiddleware, promoCodeController.deletePromoCode);
adminRouter.patch('/promo-codes/:id/toggle', authMiddleware, promoCodeController.togglePromoCode);

export default adminRouter;