import customizationModel from '../models/customizationModel.js';

const parseBool = (val, fallback = false) => {
    if (val === undefined || val === null) return fallback;
    if (typeof val === 'boolean') return val;
    return val === 'true';
};

const parseFeatures = (body) => {
    const raw = body.features
        ? (typeof body.features === 'string' ? JSON.parse(body.features) : body.features)
        : {};

    return {
        menuEnabled:             parseBool(raw.menuEnabled,             true),
        qrCodeEnabled:           parseBool(raw.qrCodeEnabled,           true),
        ordersEnabled:           parseBool(raw.ordersEnabled,           true),
        categoriesEnabled:       parseBool(raw.categoriesEnabled,       true),
        analyticsEnabled:        parseBool(raw.analyticsEnabled,        false),
        salesReportEnabled:      parseBool(raw.salesReportEnabled,      false),
        promoCodesEnabled:       parseBool(raw.promoCodesEnabled,       false),
        ratingEnabled:           parseBool(raw.ratingEnabled,           false),
        tipsEnabled:             parseBool(raw.tipsEnabled,             false),
        ordersHistoryEnabled:    parseBool(raw.ordersHistoryEnabled,    false),
        reservationEnabled:      parseBool(raw.reservationEnabled,      false),
        takeawayEnabled:         parseBool(raw.takeawayEnabled,         false),
        deliveryEnabled:         parseBool(raw.deliveryEnabled,         false),
        waiterRequestsEnabled:   parseBool(raw.waiterRequestsEnabled,   false),
        autoPrintEnabled:        parseBool(raw.autoPrintEnabled,        false),
        multiLanguageEnabled:    parseBool(raw.multiLanguageEnabled,    false),
        dianaAiEnabled:          parseBool(raw.dianaAiEnabled,          false),
    };
};

// Helper: calculează features defaults pentru un plan dat,
// păstrând override-urile manuale existente
const applyPlanDefaults = (plan, existingFeatures = {}) => {
    const f = existingFeatures;
    return {
        menuEnabled:          plan >= 1 ? (f.menuEnabled          ?? true)  : false,
        qrCodeEnabled:        plan >= 1 ? (f.qrCodeEnabled        ?? true)  : false,
        ordersEnabled:        plan >= 1 ? (f.ordersEnabled        ?? true)  : false,
        categoriesEnabled:    plan >= 1 ? (f.categoriesEnabled    ?? true)  : false,
        analyticsEnabled:     plan >= 2 ? (f.analyticsEnabled     ?? true)  : false,
        salesReportEnabled:   plan >= 2 ? (f.salesReportEnabled   ?? true)  : false,
        promoCodesEnabled:    plan >= 2 ? (f.promoCodesEnabled    ?? true)  : false,
        ratingEnabled:        plan >= 2 ? (f.ratingEnabled        ?? true)  : false,
        tipsEnabled:          plan >= 2 ? (f.tipsEnabled          ?? true)  : false,
        ordersHistoryEnabled: plan >= 2 ? (f.ordersHistoryEnabled ?? true)  : false,
        reservationEnabled:   plan >= 3 ? (f.reservationEnabled   ?? true)  : false,
        takeawayEnabled:      plan >= 3 ? (f.takeawayEnabled      ?? true)  : false,
        deliveryEnabled:      plan >= 3 ? (f.deliveryEnabled      ?? false) : false,
        waiterRequestsEnabled:plan >= 3 ? (f.waiterRequestsEnabled?? true)  : false,
        autoPrintEnabled:     plan >= 3 ? (f.autoPrintEnabled     ?? false) : false,
        multiLanguageEnabled: plan >= 3 ? (f.multiLanguageEnabled ?? false) : false,
        dianaAiEnabled:       plan >= 3 ? (f.dianaAiEnabled       ?? true)  : false,
    };
};

const PLAN_LABELS = ['Disabled', 'Light', 'Standard', 'Premium'];

// ── ADD ───────────────────────────────────────────────────────
const addCustomization = async (req, res) => {
    const image = req.file ? req.file.filename : null;
    const openingHours = JSON.parse(req.body.openingHours || '{}');
    const features = parseFeatures(req.body);

    const {
        restaurantName, primaryColor = '#ffffff', secondaryColor = '#000000',
        slogan, contactEmail, contactPhone, deleteAccountHours = '24', securityToken,
        currency = 'EUR', defaultLanguage = 'en', timezone = 'Europe/Bucharest',
        taxRate = '19', serviceCharge = '0', address, city, country = 'Romania',
        postalCode, website, facebook, instagram, minOrderAmount = '0',
        deliveryFee = '0', vatNumber, companyNumber,
        receiptFooter = 'Thank you for visiting us!',
        logoPosition = 'center', themeStyle = 'modern', menuLayout = 'grid',
        partnerPlan = 1,
    } = req.body;

    try {
        const plan = Number(partnerPlan);
        const doc = new customizationModel({
            restaurantName, image, primaryColor, secondaryColor, slogan,
            contactEmail, contactPhone, deleteAccountHours, securityToken,
            currency, defaultLanguage, timezone, taxRate, serviceCharge,
            address, city, country, postalCode, website, facebook, instagram,
            minOrderAmount, deliveryFee, vatNumber, companyNumber, receiptFooter,
            logoPosition, themeStyle, menuLayout, openingHours,
            partnerPlan: plan,
            partnerPlanLabel: PLAN_LABELS[plan] ?? 'Light',
            features: applyPlanDefaults(plan, features),
        });
        await doc.save();
        res.json({ success: true, message: 'Customization Added Successfully' });
    } catch (error) {
        console.error('Error adding customization:', error);
        res.status(500).json({ success: false, message: 'Error adding customization' });
    }
};

// ── UPDATE ────────────────────────────────────────────────────
const updateCustomization = async (req, res) => {
    const image = req.file ? req.file.filename : undefined;
    const openingHours = JSON.parse(req.body.openingHours || '{}');
    const features = parseFeatures(req.body);

    const {
        id, restaurantName, primaryColor, secondaryColor, slogan,
        contactEmail, contactPhone, deleteAccountHours, securityToken,
        currency, defaultLanguage, timezone, taxRate, serviceCharge,
        address, city, country, postalCode, website, facebook, instagram,
        minOrderAmount, deliveryFee, vatNumber, companyNumber, receiptFooter,
        logoPosition, themeStyle, menuLayout, partnerPlan,
    } = req.body;

    try {
        const plan = Number(partnerPlan ?? 1);
        const updateData = {
            restaurantName, primaryColor, secondaryColor, slogan,
            contactEmail, contactPhone, deleteAccountHours, securityToken,
            currency, defaultLanguage, timezone, taxRate, serviceCharge,
            address, city, country, postalCode, website, facebook, instagram,
            minOrderAmount, deliveryFee, vatNumber, companyNumber, receiptFooter,
            logoPosition, themeStyle, menuLayout, openingHours,
            partnerPlan: plan,
            partnerPlanLabel: PLAN_LABELS[plan] ?? 'Light',
            features,
            updatedAt: Date.now(),
        };
        if (image) updateData.image = image;

        const customization = await customizationModel.findByIdAndUpdate(
            id, updateData, { new: true, upsert: true }
        );
        res.status(200).json({ success: true, message: 'Customization Updated Successfully', data: customization });
    } catch (error) {
        console.error('Error updating customization:', error);
        res.status(500).json({ success: false, message: 'Error updating customization.' });
    }
};

// ── UPDATE PLAN ───────────────────────────────────────────────
// Folosim findByIdAndUpdate în loc de doc.save() ca să evităm
// crash-ul din pre-save hook când features subdocumentul e gol/undefined
const updatePartnerPlan = async (req, res) => {
    const { id, partnerPlan } = req.body;
    const plan = Number(partnerPlan);

    if (!id || isNaN(plan) || ![0,1,2,3].includes(plan)) {
        return res.status(400).json({ success: false, message: 'Invalid id or partnerPlan value (0–3).' });
    }

    try {
        // Fetch features existente ca să păstrăm override-urile manuale
        const existing = await customizationModel.findById(id).lean();
        if (!existing) return res.status(404).json({ success: false, message: 'Customization not found.' });

        const existingFeatures = existing.features ?? {};
        const newFeatures = applyPlanDefaults(plan, existingFeatures);

        const updated = await customizationModel.findByIdAndUpdate(
            id,
            {
                partnerPlan: plan,
                partnerPlanLabel: PLAN_LABELS[plan] ?? 'Light',
                features: newFeatures,
                updatedAt: Date.now(),
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: `Plan updated to ${PLAN_LABELS[plan]}`,
            data: updated,
        });
    } catch (error) {
        console.error('Error updating partner plan:', error);
        res.status(500).json({ success: false, message: 'Error updating partner plan.' });
    }
};

// ── UPDATE FEATURE FLAGS ──────────────────────────────────────
const updateFeatureFlags = async (req, res) => {
    const { id, features } = req.body;
    if (!id || !features) {
        return res.status(400).json({ success: false, message: 'id and features are required.' });
    }
    try {
        const parsedFeatures = parseFeatures({ features });
        const customization = await customizationModel.findByIdAndUpdate(
            id,
            { features: parsedFeatures, updatedAt: Date.now() },
            { new: true }
        );
        if (!customization) return res.status(404).json({ success: false, message: 'Not found.' });
        res.status(200).json({ success: true, message: 'Feature flags updated.', data: customization });
    } catch (error) {
        console.error('Error updating feature flags:', error);
        res.status(500).json({ success: false, message: 'Error updating feature flags.' });
    }
};

// ── GET ───────────────────────────────────────────────────────
const getCustomization = async (req, res) => {
    try {
        const data = await customizationModel.findOne();
        if (!data) return res.status(200).json({ success: true, data: null });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching customization data:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

export { addCustomization, updateCustomization, updatePartnerPlan, updateFeatureFlags, getCustomization };