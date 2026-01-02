import express from 'express';
import { registerAdmin, loginAdmin, updateCustomization, getCustomization, getAllAdminAccounts, removeAccount, updateAccount, createQRCode, getQrCodes, removeQrCode, changePassword, updateProfile, getCurrentUser } from '../controllers/adminController.js';
import promoCodeController from '../controllers/promoCodeController.js'; 

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
adminRouter.post('/change-password', changePassword);
adminRouter.post('/update-profile', updateProfile);

adminRouter.get('/promo-codes', promoCodeController.getAllPromoCodes);
adminRouter.post('/promo-codes', promoCodeController.createPromoCode);  
adminRouter.put('/promo-codes/:id', promoCodeController.updatePromoCode);
adminRouter.delete('/promo-codes/:id', promoCodeController.deletePromoCode);
adminRouter.patch('/promo-codes/:id/toggle', promoCodeController.togglePromoCode);

adminRouter.post('/promo-codes/validate', promoCodeController.validatePromoCode);
adminRouter.get('/current-user', getCurrentUser);

export default adminRouter;