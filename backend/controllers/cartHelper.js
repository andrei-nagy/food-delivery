// cartHelper.js
import userModel from "../models/userModel.js";

export const clearUserCart = async (userId) => {
    try {
        let userData;

        if (userId.startsWith('table_')) {
            const tableNumber = userId.replace('table_', '');
            userData = await userModel.findOne({ 
                tableNumber: tableNumber, 
                isActive: true 
            });
            
            if (!userData) {
                console.log(`❌ No active user found for table ${tableNumber}`);
                return { success: false, message: "No active user found for this table" };
            }
        } else {
            userData = await userModel.findById(userId);
        }
        
        if (!userData) {
            return { success: false, message: "User not found" };
        }

        // Verifică dacă cart-ul conține date înainte de ștergere
        console.log(`🛒 Cart before clearing for user ${userData._id}:`, userData.cartData);

        await userModel.findByIdAndUpdate(
            userData._id,
            { cartData: {} },
            { new: true }
        );

        console.log(`✅ Cart cleared successfully for user ${userData._id}`);
        return { success: true, message: "Cart cleared successfully" };
    } catch (error) {
        console.error("🔴 Error clearing cart:", error);
        return { success: false, message: "Error clearing cart" };
    }
};