import mongoose from "mongoose";

const customizationSchema = new mongoose.Schema({
    restaurantName: {
        type: String,
        required: true,
        trim: true
    },
    image: {type: String, required: false},
    primaryColor: {
        type: String,
        default: '#ffffff'
    },
    secondaryColor: {
        type: String,
        default: '#000000'
    },
    slogan: {
        type: String
    },
    contactEmail: {
        type: String,
        required: true
    },
    contactPhone: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    deleteAccountHours: {
        type: String,
        default: '24',
        required: true
    },
    securityToken: {
        type: String,
        required: true
    },
    openHour: {
        type: String
    },
    closeHour: {
        type: String
    },
    openingHours: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Câmpuri noi cu validări
    currency: {
        type: String,
        default: 'EUR',
        enum: ['EUR', 'USD', 'GBP', 'RON', 'MDL', 'HUF', 'PLN', 'BGN', 'TRY', 'CHF']
    },
    defaultLanguage: {
        type: String,
        default: 'en',
        enum: ['en', 'ro', 'de', 'it', 'es', 'fr']
    },
    timezone: {
        type: String,
        default: 'Europe/Bucharest'
    },
    taxRate: {
        type: String,
        default: '19'
    },
    serviceCharge: {
        type: String,
        default: '0'
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: 'Romania'
    },
    postalCode: {
        type: String
    },
    website: {
        type: String
    },
    facebook: {
        type: String
    },
    instagram: {
        type: String
    },
    reservationEnabled: {
        type: Boolean,
        default: true
    },
    takeawayEnabled: {
        type: Boolean,
        default: true
    },
    deliveryEnabled: {
        type: Boolean,
        default: false
    },
    minOrderAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    deliveryFee: {
        type: Number,
        default: 0,
        min: 0
    },
    vatNumber: {
        type: String
    },
    companyNumber: {
        type: String
    },
    receiptFooter: {
        type: String,
        default: 'Thank you for visiting us!'
    },
    ratingEnabled: {
        type: Boolean,
        default: true
    },
    tipsEnabled: {
        type: Boolean,
        default: true
    },
    logoPosition: {
        type: String,
        default: 'center',
        enum: ['left', 'center', 'right']
    },
    themeStyle: {
        type: String,
        default: 'modern',
        enum: ['modern', 'classic', 'minimal', 'elegant']
    },
    menuLayout: {
        type: String,
        default: 'grid',
        enum: ['grid', 'list', 'cards']
    },
    qrCodeEnabled: {
        type: Boolean,
        default: true
    },
    autoPrintEnabled: {
        type: Boolean,
        default: false
    }
});

customizationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const customizationModel = mongoose.models.customization || mongoose.model("customization", customizationSchema);

export default customizationModel;