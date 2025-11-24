import mongoose from "mongoose";

// ✅ Schema pentru fiecare item din coș
const cartItemSchema = new mongoose.Schema({
    quantity: { 
        type: Number, 
        required: true, 
        default: 1 
    },
    specialInstructions: { 
        type: String
    },
    selectedOptions: { 
        type: [String], 
        default: [] 
    },
    itemData: {
        baseFoodId: { 
            type: String, 
            required: true 
        },
        unitPrice: { 
            type: Number, 
            default: 0 
        },
        extrasPrice: { 
            type: Number, 
            default: 0 
        }
    }
}, { 
    _id: false,
    // ✅ FORȚEAZĂ aplicarea schemei
    strict: true 
});

// ✅ Schema principală
const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
  // ✅ CÂMP NOU PENTRU EXTENSION STATUS
  extensionInProgress: {
    type: Boolean,
    default: false
  },
      cartData: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
        // ✅ Validator custom care aplică structura
        validate: {
            validator: function(cartData) {
                if (typeof cartData !== 'object') return false;
                
                // Verifică fiecare item să respecte structura
                for (const itemId in cartData) {
                    const item = cartData[itemId];
                    if (typeof item !== 'object') return false;
                    if (typeof item.quantity !== 'number') return false;
                    if (typeof item.specialInstructions !== 'string') return false;
                    if (!Array.isArray(item.selectedOptions)) return false;
                }
                return true;
            },
            message: 'Cart data structure is invalid'
        }
    },
    tableNumber: { 
        type: Number 
    },  
    token: { 
        type: String, 
        required: true, 
        unique: true 
    },
    tokenExpiry: { 
        type: Date 
    },  
    activeSessions: { 
        type: Number, 
        default: 0 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    minimize: false,
    timestamps: true,
    // ✅ FORȚEAZĂ validarea
    strict: 'throw'
});

// ✅ MIDDLEWARE care asigură structura corectă
userSchema.pre('save', function(next) {
    if (this.cartData && typeof this.cartData === 'object') {
        const fixedCartData = {};
        
        Object.keys(this.cartData).forEach(itemId => {
            const item = this.cartData[itemId];
            
            if (typeof item === 'number') {
                // ✅ CONVERTEȘTE numere în obiecte complete
                fixedCartData[itemId] = {
                    quantity: item,
                    specialInstructions: "Nothing to add", // ✅ DEFAULT "hello"
                    selectedOptions: [],
                    itemData: {
                        baseFoodId: itemId.split('__')[0],
                        unitPrice: 0,
                        extrasPrice: 0
                    }
                };
            } else if (typeof item === 'object') {
                // ✅ ASIGURĂ structura completă
                fixedCartData[itemId] = {
                    quantity: item.quantity || 1,
                    specialInstructions: item.specialInstructions, // ✅ DEFAULT
                    selectedOptions: item.selectedOptions || [],
                    itemData: item.itemData || {
                        baseFoodId: itemId.split('__')[0],
                        unitPrice: 0,
                        extrasPrice: 0
                    }
                };
            }
        });
        
        this.cartData = fixedCartData;
    }
    next();
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;