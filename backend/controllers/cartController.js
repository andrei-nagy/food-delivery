import userModel from "../models/userModel.js";

const addToCart = async (req, res) => {
  try {
    const { userId, itemId, quantity, specialInstructions, selectedOptions, itemData } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    if (!itemId) {
      return res.json({ success: false, message: "Item ID is required" });
    }

    let userData = await userModel.findById(userId);
    
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};
    
    const newItemData = {
      quantity: quantity || 1,
      specialInstructions: specialInstructions,
      selectedOptions: selectedOptions || [],
      itemData: itemData || {
        baseFoodId: itemId.split('__')[0],
        unitPrice: 0,
        extrasPrice: 0
      }
    };
    
    cartData[itemId] = newItemData;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { cartData },
      { 
        new: true,
        runValidators: false
      }
    );

    if (!updatedUser) {
      return res.json({ success: false, message: "Failed to update user" });
    }
    
    res.json({ 
      success: true, 
      message: "Added To Cart",
      cartData: cartData
    });

  } catch (error) {
    res.json({ 
      success: false, 
      message: "Error: " + error.message
    });
  }
}

const getCartByTable = async (req, res) => {
    try {
        const { tableNumber } = req.body;
        
        console.log("🔍 [getCartByTable] START - Table:", tableNumber);

        // ✅ CAUTĂ DOAR USERII ACTIVI pentru această masă
        const user = await userModel.findOne({ 
            tableNumber: tableNumber, 
            isActive: true 
        });
        
        if (!user) {
            console.log("❌ [getCartByTable] No ACTIVE user found for table:", tableNumber);
            return res.json({ success: true, cartData: {} });
        }

        console.log("✅ [getCartByTable] Active user found:", {
            id: user._id,
            cartItemsCount: Object.keys(user.cartData || {}).length
        });

        res.json({ 
            success: true, 
            cartData: user.cartData || {},
            userId: user._id,
            tableNumber: user.tableNumber
        });
        
    } catch (error) {
        console.log("❌ [getCartByTable] ERROR:", error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

const addToCartByTable = async (req, res) => {
  try {
    const { tableNumber, itemId, quantity, specialInstructions, selectedOptions, itemData } = req.body;
    
    console.log("🛒 [addToCartByTable] START - Table:", tableNumber, "Item:", itemId);

    if (!tableNumber || !itemId) {
      console.log("❌ [addToCartByTable] Missing tableNumber or itemId");
      return res.json({ success: false, message: "Table number and item ID are required" });
    }

    // ✅ CAUTĂ DOAR USERII ACTIVI (la fel ca în getCartByTable)
    let user = await userModel.findOne({ 
      tableNumber: tableNumber, 
      isActive: true 
    });
    
    console.log("👤 [addToCartByTable] Active user found:", user ? user._id : "NONE");

    if (!user) {
      console.log("✅ [addToCartByTable] No active user, creating new one...");
      const randomEmail = Math.random().toString(36).substring(2, 10) + "@table.com";
      const randomPassword = Math.random().toString(36).substring(2);
      
      user = new userModel({
        name: "Table " + tableNumber,
        email: randomEmail,
        password: randomPassword,
        tableNumber: tableNumber,
        token: "temp_" + Date.now(),
        tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true // ✅ SETEAZĂ ACTIV
      });
      
      await user.save();
      console.log("✅ [addToCartByTable] New active user created:", user._id);
    }

    let cartData = user.cartData || {};
    
    console.log("📦 [addToCartByTable] BEFORE - Cart items:", Object.keys(cartData).length);

    const newItemData = {
      quantity: quantity || 1,
      specialInstructions: specialInstructions,
      selectedOptions: selectedOptions || [],
      itemData: itemData || {
        baseFoodId: itemId.split('__')[0],
        unitPrice: 0,
        extrasPrice: 0
      }
    };
    
    if (!cartData[itemId]) {
      cartData[itemId] = newItemData;
    } else {
      cartData[itemId] = {
        ...cartData[itemId],
        quantity: cartData[itemId].quantity + (quantity || 1),
        specialInstructions: specialInstructions || cartData[itemId].specialInstructions
      };
    }

    console.log("📦 [addToCartByTable] AFTER - Cart items:", Object.keys(cartData).length);

    const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      { cartData },
      { new: true }
    );
    
    console.log("💾 [addToCartByTable] Database saved successfully");
    
    res.json({ 
      success: true, 
      message: "Added to table cart",
      cartData: cartData,
      tableNumber: tableNumber
    });
    
  } catch (error) {
    console.log("❌ [addToCartByTable] ERROR:", error);
    res.json({ success: false, message: "Error" });
  }
};

const migrateAllCarts = async (req, res) => {
  try {
    const allUsers = await userModel.find({});
    let migratedCount = 0;

    for (const user of allUsers) {
      if (user.cartData && typeof user.cartData === 'object') {
        let needsMigration = false;
        const newCartData = {};

        Object.keys(user.cartData).forEach(itemId => {
          const item = user.cartData[itemId];
          
          if (typeof item === 'number') {
            newCartData[itemId] = {
              quantity: item,
              specialInstructions: "",
              selectedOptions: [],
              itemData: {
                baseFoodId: itemId.split('__')[0],
                unitPrice: 0,
                extrasPrice: 0
              }
            };
            needsMigration = true;
          } else if (typeof item === 'object') {
            newCartData[itemId] = item;
          }
        });

        if (needsMigration) {
          await userModel.findByIdAndUpdate(user._id, { cartData: newCartData });
          migratedCount++;
        }
      }
    }

    res.json({ success: true, migrated: migratedCount });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    let cartData = userData.cartData || {};
    let needsMigration = false;
    const migratedCart = {};

    Object.keys(cartData).forEach(itemId => {
      const item = cartData[itemId];
      
      if (typeof item === 'number') {
        migratedCart[itemId] = {
          quantity: item,
          specialInstructions: "",
          selectedOptions: [],
          itemData: {
            baseFoodId: itemId.split('__')[0],
            unitPrice: 0,
            extrasPrice: 0
          }
        };
        needsMigration = true;
      } else if (typeof item === 'object') {
        migratedCart[itemId] = item;
      }
    });

    if (needsMigration) {
      await userModel.findByIdAndUpdate(req.body.userId, { cartData: migratedCart });
    }
    
    res.json({ 
      success: true, 
      cartData: migratedCart
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
}

const clearCart = async (req, res) => {
  try {
    console.log("🔥 [CART_CONTROLLER] START clearCart");
    console.log("🔥 [CART_CONTROLLER] Request body:", req.body);
    
    const { userId } = req.body;
    
    console.log("🔥 [CART_CONTROLLER] UserID:", userId);
    
    if (!userId) {
      console.log("❌ [CART_CONTROLLER] No user ID provided");
      return res.json({ success: false, message: "User ID is required" });
    }
    
    let userData;

    if (userId.startsWith('table_')) {
      const tableNumber = userId.replace('table_', '');
      console.log("🍽️ [CART_CONTROLLER] Table user - tableNumber:", tableNumber);
      // ✅ ADAUGĂ isActive: true
      userData = await userModel.findOne({ 
        tableNumber: tableNumber, 
        isActive: true 
      });
    } else {
      console.log("👤 [CART_CONTROLLER] Normal user - finding by ID:", userId);
      userData = await userModel.findById(userId);
    }
    
    if (!userData) {
      console.log("❌ [CART_CONTROLLER] USER NOT FOUND");
      return res.json({ success: false, message: "User not found" });
    }

    console.log("📦 [CART_CONTROLLER] User found - ID:", userData._id);
    console.log("📦 [CART_CONTROLLER] BEFORE CLEAR - Cart items:", Object.keys(userData.cartData || {}));

    // ✅ GOLESTE COMPLET cartData
    console.log("🗑️ [CART_CONTROLLER] Clearing cartData...");
    const updatedUser = await userModel.findByIdAndUpdate(
      userData._id,
      { cartData: {} }, // ✅ SETEAZĂ CARTDATA CA OBIECT GOL
      { new: true }
    );

    console.log("📦 [CART_CONTROLLER] AFTER CLEAR - Cart items:", Object.keys(updatedUser.cartData || {}));
    console.log("✅ [CART_CONTROLLER] CART CLEARED SUCCESSFULLY");

    res.json({ 
      success: true, 
      message: "Cart cleared successfully",
      cartData: {} // ✅ RETURNEAZĂ CART GOL
    });
    
  } catch (error) {
    console.log("❌ [CART_CONTROLLER] ERROR in clearCart:", error);
    res.json({ success: false, message: "Error clearing cart" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { userId, itemId, quantity = 1 } = req.body;
    
    console.log("🗑️ REMOVE FROM CART:", { userId, itemId, quantity });
    
    let userData;

    // ✅ VERIFICĂ DACĂ E USER NORMAL SAU TABLE USER
    if (userId.startsWith('table_')) {
      // Este table user - folosește tableNumber
      const tableNumber = userId.replace('table_', '');
      console.log("🍽️ Table user - tableNumber:", tableNumber);
      // ✅ ADAUGĂ isActive: true
      userData = await userModel.findOne({ 
        tableNumber: tableNumber, 
        isActive: true 
      });
    } else {
      // Este user normal - folosește _id
      console.log("👤 Normal user - userId:", userId);
      userData = await userModel.findById(userId);
    }
    
    if (!userData) {
      console.log("❌ User not found for userId:", userId);
      return res.json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};
    
    console.log("📦 BEFORE REMOVAL:", cartData[itemId]);
    
    if (cartData[itemId]) {
      if (typeof cartData[itemId] === 'object') {
        const newQuantity = cartData[itemId].quantity - quantity;
        
        if (newQuantity <= 0) {
          delete cartData[itemId];
          console.log("✅ Item completely removed");
        } else {
          cartData[itemId] = {
            ...cartData[itemId],
            quantity: newQuantity
          };
          console.log("✅ Item quantity updated to:", newQuantity);
        }
      }
    }

    console.log("📦 AFTER REMOVAL:", cartData[itemId]);
    
    // ✅ SALVEAZĂ în baza de date
    const updatedUser = await userModel.findByIdAndUpdate(
      userData._id, // Folosește _id-ul din userData găsit
      { cartData },
      { new: true }
    );

    console.log("💾 DATABASE SAVED - Item exists:", !!updatedUser.cartData[itemId]);
    
    res.json({ 
      success: true, 
      message: "Removed from cart",
      cartData: cartData
    });
  } catch (error) {
    console.log("❌ ERROR in removeFromCart:", error);
    res.json({ success: false, message: "Error" });
  }
}

const removeItemCompletely = async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    
    console.log("🔥 REMOVE COMPLETELY - START");
    console.log("UserID:", userId);
    console.log("ItemID:", itemId);
    
    let userData;

    if (userId.startsWith('table_')) {
      const tableNumber = userId.replace('table_', '');
      // ✅ ADAUGĂ isActive: true
      userData = await userModel.findOne({ 
        tableNumber: tableNumber, 
        isActive: true 
      });
    } else {
      userData = await userModel.findById(userId);
    }
    
    if (!userData) {
      console.log("❌ USER NOT FOUND");
      return res.json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};

    console.log("📦 BEFORE DELETE - Item exists:", !!cartData[itemId]);
    console.log("📦 ALL ITEMS BEFORE:", Object.keys(cartData));

    // ✅ FORȚEAZĂ ȘTERGEREA
    if (cartData[itemId]) {
      delete cartData[itemId];
      console.log("✅ ITEM DELETED FROM CARTDATA");
    }

    console.log("📦 AFTER DELETE - Item exists:", !!cartData[itemId]);
    console.log("📦 ALL ITEMS AFTER:", Object.keys(cartData));
    
    // ✅ SALVEAZĂ ÎN BAZA DE DATE
    const updatedUser = await userModel.findByIdAndUpdate(
      userData._id,
      { cartData },
      { new: true }
    );

    console.log("💾 DATABASE SAVED - Item in DB:", !!updatedUser.cartData[itemId]);

    // ✅ RETURNEAZĂ CARTDATA ACTUALIZAT
    res.json({ 
      success: true, 
      message: "Item removed completely from cart",
      cartData: cartData // ✅ ACESTA ESTE CÂMPUL IMPORTANT!
    });
  } catch (error) {
    console.log("❌ ERROR in removeItemCompletely:", error);
    res.json({ success: false, message: "Error removing item completely" });
  }
};

const updateCart = async (req, res) => {
  try {
    const { userId, itemId, newQuantity, specialInstructions, selectedOptions } = req.body;

    let userData;

    // ✅ ADAUGĂ: Suport pentru table users (la fel ca în celelalte funcții)
    if (userId.startsWith('table_')) {
      const tableNumber = userId.replace('table_', '');
      console.log("🍽️ Table user - tableNumber:", tableNumber);
      // ✅ ADAUGĂ isActive: true
      userData = await userModel.findOne({ 
        tableNumber: tableNumber, 
        isActive: true 
      });
    } else {
      console.log("👤 Normal user - userId:", userId);
      userData = await userModel.findById(userId);
    }

    if (!userData) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    let cartData = userData.cartData || {};

    if (newQuantity === 0) {
      delete cartData[itemId];
    } else {
      const existingItem = cartData[itemId];
      
      if (typeof existingItem === 'number') {
        cartData[itemId] = {
          quantity: newQuantity,
          specialInstructions: specialInstructions || "",
          selectedOptions: selectedOptions || [],
          itemData: {
            baseFoodId: itemId.split('_')[0],
            unitPrice: 0,
            extrasPrice: 0
          }
        };
      } else {
        cartData[itemId] = {
          ...existingItem,
          quantity: newQuantity,
          specialInstructions: specialInstructions !== undefined ? specialInstructions : (existingItem?.specialInstructions || ""),
          selectedOptions: selectedOptions !== undefined ? selectedOptions : (existingItem?.selectedOptions || [])
        };
      }
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userData._id, // ✅ Folosește _id-ul din userData găsit
      { cartData },
      { new: true, runValidators: true, strict: false }
    );

    res.status(200).json({ 
      success: true,
      message: "Cart updated", 
      cartData: updatedUser.cartData 
    });

  } catch (error) {
    console.log("❌ ERROR in updateCart:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

const migrateUserCart = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    if (!user || !user.cartData) return;

    let needsMigration = false;
    const newCartData = {};

    Object.keys(user.cartData).forEach(itemId => {
      const item = user.cartData[itemId];
      
      if (typeof item === 'number') {
        newCartData[itemId] = {
          quantity: item,
          specialInstructions: "",
          selectedOptions: [],
          itemData: {
            baseFoodId: itemId.split('_')[0],
            unitPrice: 0,
            extrasPrice: 0
          }
        };
        needsMigration = true;
      } else {
        newCartData[itemId] = item;
      }
    });

    if (needsMigration) {
      await userModel.findByIdAndUpdate(userId, { cartData: newCartData });
    }
  } catch (error) {
    console.error("Migration error:", error);
  }
};

const debugCart = async (req, res) => {
  try {
    const { userId } = req.body;
    
    let userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ 
      success: true, 
      rawCartData: userData.cartData,
      message: "Debug information" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};

export { 
  addToCart, 
  removeFromCart, 
  getCart, 
  removeItemCompletely, 
  updateCart, 
  debugCart, 
  migrateAllCarts, 
  getCartByTable, 
  addToCartByTable, 
  clearCart 
};