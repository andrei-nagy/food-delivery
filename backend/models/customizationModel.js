import mongoose from "mongoose";

const featureFlagsSchema = new mongoose.Schema({
    // Light+
    menuEnabled:             { type: Boolean, default: true },
    qrCodeEnabled:           { type: Boolean, default: true },
    ordersEnabled:           { type: Boolean, default: true },
    categoriesEnabled:       { type: Boolean, default: true },
    // Standard+
    analyticsEnabled:        { type: Boolean, default: false },
    salesReportEnabled:      { type: Boolean, default: false },
    promoCodesEnabled:       { type: Boolean, default: false },
    ratingEnabled:           { type: Boolean, default: false },
    tipsEnabled:             { type: Boolean, default: false },
    ordersHistoryEnabled:    { type: Boolean, default: false },
    // Premium+
    reservationEnabled:      { type: Boolean, default: false },
    takeawayEnabled:         { type: Boolean, default: false },
    deliveryEnabled:         { type: Boolean, default: false },
    waiterRequestsEnabled:   { type: Boolean, default: false },
    autoPrintEnabled:        { type: Boolean, default: false },
    multiLanguageEnabled:    { type: Boolean, default: false },
    dianaAiEnabled:          { type: Boolean, default: false },
}, { _id: false });

const customizationSchema = new mongoose.Schema({
    restaurantName: { type: String, required: true, trim: true },
    image:          { type: String },
    slogan:         { type: String },
    address:        { type: String, required: true },
    city:           { type: String, required: true },
    country:        { type: String, default: 'Romania' },
    postalCode:     { type: String },
    contactEmail:   { type: String, required: true },
    contactPhone:   { type: String, required: true },
    website:        { type: String },
    facebook:       { type: String },
    instagram:      { type: String },
    vatNumber:      { type: String },
    companyNumber:  { type: String },

    // 0=Disabled, 1=Light, 2=Standard, 3=Premium
    partnerPlan: {
        type: Number,
        default: 1,
        enum: [0, 1, 2, 3],
    },
    partnerPlanLabel: {
        type: String,
        default: 'Light',
        enum: ['Disabled', 'Light', 'Standard', 'Premium'],
    },

    features: {
        type: featureFlagsSchema,
        default: () => ({}),
    },

    primaryColor:   { type: String, default: '#ffffff' },
    secondaryColor: { type: String, default: '#000000' },
    logoPosition:   { type: String, default: 'center', enum: ['left', 'center', 'right'] },
    themeStyle:     { type: String, default: 'modern', enum: ['modern', 'classic', 'minimal', 'elegant'] },
    menuLayout:     { type: String, default: 'grid', enum: ['grid', 'list', 'cards'] },

    currency: {
        type: String, default: 'EUR',
        enum: ['EUR', 'USD', 'GBP', 'RON', 'MDL', 'HUF', 'PLN', 'BGN', 'TRY', 'CHF'],
    },
    defaultLanguage: {
        type: String, default: 'en',
        enum: ['en', 'ro', 'de', 'it', 'es', 'fr'],
    },
    timezone:      { type: String, default: 'Europe/Bucharest' },
    taxRate:       { type: String, default: '19' },
    serviceCharge: { type: String, default: '0' },

    minOrderAmount: { type: Number, default: 0, min: 0 },
    deliveryFee:    { type: Number, default: 0, min: 0 },
    receiptFooter:  { type: String, default: 'Thank you for visiting us!' },

    deleteAccountHours: { type: String, default: '24', required: true },
    securityToken:      { type: String, required: true },

    openingHours: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedAt:    { type: Date, default: Date.now },
});

// pre-save doar pentru updatedAt — fără logică de features
customizationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const customizationModel =
    mongoose.models.customization ||
    mongoose.model('customization', customizationSchema);

export default customizationModel;