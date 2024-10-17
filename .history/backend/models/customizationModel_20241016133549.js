import mongoose from "mongoose";

const customizationSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    restaurantName: {
        type: String,
        required: true,
        trim: true
    },
    logoUrl: {
        type: String,
        required: false
    },
    primaryColor: {
        type: String,
        required: false,
        default: '#ffffff'
    },
    secondaryColor: {
        type: String,
        required: false,
        default: '#000000'
    },
    slogan: {
        type: String,
        required: false
    },
    contactEmail: {
        type: String,
        required: false
    },
    contactPhone: {
        type: String,
        required: false
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Hook pentru a genera automat un restaurantId dacă nu este furnizat
customizationSchema.pre('save', function(next) {
    if (!this.restaurantId) {
        this.restaurantId = new mongoose.Types.ObjectId();
    }
    next();
})
const customizationModel = mongoose.models.customization || mongoose.model("customization", customizationSchema);

export default customizationModel;
