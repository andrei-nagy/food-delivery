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
  setExtensionStatus,
  checkInactiveOrders  // ✅ ADAUGĂ ACEST IMPORT
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";
import userModel from "../models/userModel.js";

const userRouter = express.Router();

// Rute existente
userRouter.post("/login", loginUser);
userRouter.get("/login", autoLogin);
userRouter.post("/register", autoRegister);
userRouter.post('/check-status', checkUserStatus);
userRouter.get('/count', getUserCount);
userRouter.get('/list', getAllUsers);
userRouter.put('/update-status/:id', updateUserStatus);
userRouter.post('/extend-time', extendTokenTime);
userRouter.post('/extend-session-expired', extendTokenSessionExpired);

// ✅ RUTE PENTRU EXTENSION STATUS
userRouter.get('/extension-status', checkExtensionStatus);
userRouter.post('/set-extension-status', setExtensionStatus);

// ✅ RUTĂ NOUĂ PENTRU VERIFICAREA UTILIZATORULUI INACTIV CU COMENZI PLĂTITE
userRouter.get('/check-inactive-orders', checkInactiveOrders);
// În backend (routes/user.js sau similar)

userRouter.get('/check-inactive-orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.query.userId;
    
    // 1. Găsește userul
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ 
        success: false, 
        message: 'User not found',
        shouldRedirect: false 
      });
    }
    
    // 2. Verifică dacă userul este inactiv
    const isUserInactive = user.isActive === false;
    
    // 3. Găsește toate comenzile userului
    const orders = await orderModel.find({ userId: userId });
    
    // 4. Verifică dacă toate comenzile sunt plătite
    const allOrdersPaid = orders.length > 0 && 
                         orders.every(order => order.paymentStatus === true);
    
    // 5. Determină dacă trebuie redirect
    const shouldRedirectToOrderCompleted = isUserInactive && allOrdersPaid;
    
    console.log(`🔍 [API] User ${userId}: inactive=${isUserInactive}, allPaid=${allOrdersPaid}, redirect=${shouldRedirectToOrderCompleted}`);
    
    res.json({
      success: true,
      userInactive: isUserInactive,
      allOrdersPaid: allOrdersPaid,
      shouldRedirectToOrderCompleted: shouldRedirectToOrderCompleted,
      orderCount: orders.length,
      paidCount: orders.filter(o => o.paymentStatus).length
    });
    
  } catch (error) {
    console.error('❌ [API] Error checking inactive orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      shouldRedirect: false 
    });
  }
});
export default userRouter;