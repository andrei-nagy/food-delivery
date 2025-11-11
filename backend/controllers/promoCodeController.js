import PromoCode from "../models/promoCodeModel.js";

const promoCodeController = {
  // ✅ Obține toate promo codes (public - ca /admin/qrcodes)
  getAllPromoCodes: async (req, res) => {
    console.log("🎯 [PROMO CONTROLLER] GET /admin/promo-codes - START");
    
    try {
      console.log("🔄 [PROMO CONTROLLER] Before database query");
      
      const promoCodes = await PromoCode.find()
        .sort({ createdAt: -1 });

      console.log("✅ [PROMO CONTROLLER] Found:", promoCodes.length, "codes");
      
      res.json({
        success: true,
        data: promoCodes
      });
      
    } catch (error) {
      console.error("❌ [PROMO CONTROLLER] ERROR:", error);
      res.json({
        success: false,
        message: "Error fetching promo codes"
      });
    }
  },

  // ✅ Creează promo code nou (public - ca /admin/create-qrcode)
  createPromoCode: async (req, res) => {
    console.log("🎯 [PROMO CONTROLLER] POST /admin/promo-codes - START");
    
    try {
      const {
        code,
        description,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount,
        startDate,
        endDate,
        usageLimit,
        applicableCategories,
        excludedProducts
      } = req.body;

      // Verifică dacă codul există deja
      const existingCode = await PromoCode.findOne({ 
        code: code.toUpperCase().trim() 
      });
      
      if (existingCode) {
        return res.json({
          success: false,
          message: "Promo code already exists"
        });
      }

      const promoCode = new PromoCode({
        code: code.toUpperCase().trim(),
        description,
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount || 0,
        maxDiscountAmount: maxDiscountAmount || null,
        startDate: startDate || new Date(),
        endDate,
        usageLimit: usageLimit || null,
        applicableCategories: applicableCategories || [],
        excludedProducts: excludedProducts || []
        // FĂRĂ createdBy - exact ca în createQRCode
      });

      await promoCode.save();

      console.log("✅ [PROMO CONTROLLER] Promo code created:", promoCode.code);
      
      res.json({
        success: true,
        message: "Promo code created successfully",
        data: promoCode
      });

    } catch (error) {
      console.error("❌ [PROMO CONTROLLER] Create error:", error);
      res.json({
        success: false,
        message: "Error creating promo code"
      });
    }
  },

  // ✅ Actualizează promo code (public - ca /admin/update)
  updatePromoCode: async (req, res) => {
    console.log("🎯 [PROMO CONTROLLER] PUT /admin/promo-codes/:id - START");
    
    try {
      const { id } = req.params;
      
      const promoCode = await PromoCode.findByIdAndUpdate(
        id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!promoCode) {
        return res.json({
          success: false,
          message: "Promo code not found"
        });
      }

      console.log("✅ [PROMO CONTROLLER] Promo code updated:", promoCode.code);
      
      res.json({
        success: true,
        message: "Promo code updated successfully",
        data: promoCode
      });

    } catch (error) {
      console.error("❌ [PROMO CONTROLLER] Update error:", error);
      res.json({
        success: false,
        message: "Error updating promo code"
      });
    }
  },

  // ✅ Șterge promo code (public - ca /admin/remove-qrcode)
  deletePromoCode: async (req, res) => {
    console.log("🎯 [PROMO CONTROLLER] DELETE /admin/promo-codes/:id - START");
    
    try {
      const { id } = req.params;
      
      const promoCode = await PromoCode.findByIdAndDelete(id);

      if (!promoCode) {
        return res.json({
          success: false,
          message: "Promo code not found"
        });
      }

      console.log("✅ [PROMO CONTROLLER] Promo code deleted:", promoCode.code);
      
      res.json({
        success: true,
        message: "Promo code deleted successfully"
      });

    } catch (error) {
      console.error("❌ [PROMO CONTROLLER] Delete error:", error);
      res.json({
        success: false,
        message: "Error deleting promo code"
      });
    }
  },

  // ✅ Activează/Dezactivează promo code (public)
  togglePromoCode: async (req, res) => {
    console.log("🎯 [PROMO CONTROLLER] PATCH /admin/promo-codes/:id/toggle - START");
    
    try {
      const { id } = req.params;
      
      const promoCode = await PromoCode.findById(id);
      
      if (!promoCode) {
        return res.json({
          success: false,
          message: "Promo code not found"
        });
      }

      promoCode.isActive = !promoCode.isActive;
      await promoCode.save();

      console.log("✅ [PROMO CONTROLLER] Promo code toggled:", promoCode.code, "to", promoCode.isActive);
      
      res.json({
        success: true,
        message: `Promo code ${promoCode.isActive ? 'activated' : 'deactivated'} successfully`,
        data: promoCode
      });

    } catch (error) {
      console.error("❌ [PROMO CONTROLLER] Toggle error:", error);
      res.json({
        success: false,
        message: "Error toggling promo code"
      });
    }
  },

  // ✅ Verificare promo code (public - pentru frontend customer)
  validatePromoCode: async (req, res) => {
    console.log("🎯 [PROMO CONTROLLER] POST /admin/promo-codes/validate - START");
    
    try {
      const { code, orderAmount = 0 } = req.body;
      
      if (!code) {
        return res.json({
          success: false,
          message: "Promo code is required"
        });
      }

      const promoCode = await PromoCode.findOne({ 
        code: code.toUpperCase().trim(),
        isActive: true
      });

      if (!promoCode) {
        return res.json({
          success: false,
          message: "Invalid promo code"
        });
      }

      // Verifică validitatea
      const validityCheck = promoCode.isValid(orderAmount);
      if (!validityCheck.valid) {
        return res.json({
          success: false,
          message: validityCheck.message
        });
      }

      // Calculează discount-ul
      const discountAmount = promoCode.calculateDiscount(orderAmount);
      const finalAmount = orderAmount - discountAmount;

      console.log("✅ [PROMO CONTROLLER] Promo code validated:", code);
      
      res.json({
        success: true,
        data: {
          code: promoCode.code,
          description: promoCode.description,
          discountType: promoCode.discountType,
          discountValue: promoCode.discountValue,
          discountAmount: discountAmount,
          finalAmount: finalAmount,
          minOrderAmount: promoCode.minOrderAmount,
          maxDiscountAmount: promoCode.maxDiscountAmount
        }
      });

    } catch (error) {
      console.error("❌ [PROMO CONTROLLER] Validation error:", error);
      res.json({
        success: false,
        message: "Error validating promo code"
      });
    }
  },

  // ✅ Incrementează contorul de utilizări (public)
  incrementUsage: async (req, res) => {
    console.log("🎯 [PROMO CONTROLLER] PATCH /admin/promo-codes/:id/increment-usage - START");
    
    try {
      const { id } = req.params;
      
      const promoCode = await PromoCode.findByIdAndUpdate(
        id,
        { $inc: { usedCount: 1 } },
        { new: true }
      );

      if (!promoCode) {
        return res.json({
          success: false,
          message: "Promo code not found"
        });
      }

      console.log("✅ [PROMO CONTROLLER] Usage incremented for:", promoCode.code);
      
      res.json({
        success: true,
        message: "Usage count incremented",
        data: promoCode
      });

    } catch (error) {
      console.error("❌ [PROMO CONTROLLER] Increment usage error:", error);
      res.json({
        success: false,
        message: "Error incrementing usage count"
      });
    }
  }
};

export default promoCodeController;