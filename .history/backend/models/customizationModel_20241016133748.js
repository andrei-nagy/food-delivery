import mongoose from "mongoose";

const customizationSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant', // Referință către un model de restaurant dacă ai unul
        required: true
    },
    restaurantName: {
        type: String,
        required: true,
        trim: true
    },
    logoUrl: {
        type: String,
        required: false // Opțional dacă vrei să permiți să nu aibă logo
    },
    primaryColor: {
        type: String,
        required: false, // Poți salva codul culorii primare
        default: '#ffffff'
    },
    secondaryColor: {
        type: String,
        required: false, // Poți salva codul culorii secundare
        default: '#000000'
    },
    slogan: {
        type: String,
        required: false // Sloganul restaurantului
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

const customizationModel = mongoose.models.customization || mongoose.model("customization", customizationSchema)

export default customizationModel;
