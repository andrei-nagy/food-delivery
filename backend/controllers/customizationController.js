import customizationModel from '../models/customizationModel.js';

const addCustomization = async (req, res) => {
    const image = req.file ? req.file.filename : null;
    
    // Parse all fields from req.body
    const {
        restaurantName,
        primaryColor = '#ffffff',
        secondaryColor = '#000000',
        slogan,
        contactEmail,
        contactPhone,
        deleteAccountHours = '24',
        securityToken,
        currency = 'EUR',
        defaultLanguage = 'en',
        timezone = 'Europe/Bucharest',
        taxRate = '19',
        serviceCharge = '0',
        address,
        city,
        country = 'Romania',
        postalCode,
        website,
        facebook,
        instagram,
        reservationEnabled = true,
        takeawayEnabled = true,
        deliveryEnabled = false,
        minOrderAmount = '0',
        deliveryFee = '0',
        vatNumber,
        companyNumber,
        receiptFooter = 'Thank you for visiting us!',
        ratingEnabled = true,
        tipsEnabled = true,
        logoPosition = 'center',
        themeStyle = 'modern',
        menuLayout = 'grid',
        qrCodeEnabled = true,
        autoPrintEnabled = false
    } = req.body;

    const openingHours = JSON.parse(req.body.openingHours || '{}');

    try {
        const newCustomization = new customizationModel({
            restaurantName,
            image,
            primaryColor,
            secondaryColor,
            slogan,
            contactEmail,
            contactPhone,
            deleteAccountHours,
            securityToken,
            currency,
            defaultLanguage,
            timezone,
            taxRate,
            serviceCharge,
            address,
            city,
            country,
            postalCode,
            website,
            facebook,
            instagram,
            reservationEnabled: reservationEnabled === 'true' || reservationEnabled === true,
            takeawayEnabled: takeawayEnabled === 'true' || takeawayEnabled === true,
            deliveryEnabled: deliveryEnabled === 'true' || deliveryEnabled === true,
            minOrderAmount,
            deliveryFee,
            vatNumber,
            companyNumber,
            receiptFooter,
            ratingEnabled: ratingEnabled === 'true' || ratingEnabled === true,
            tipsEnabled: tipsEnabled === 'true' || tipsEnabled === true,
            logoPosition,
            themeStyle,
            menuLayout,
            qrCodeEnabled: qrCodeEnabled === 'true' || qrCodeEnabled === true,
            autoPrintEnabled: autoPrintEnabled === 'true' || autoPrintEnabled === true,
            openingHours
        });

        await newCustomization.save();
        res.json({
            success: true,
            message: 'Customization Added Successfully'
        });
    } catch (error) {
        console.log('Error adding customization:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding customization'
        });
    }
};

const updateCustomization = async (req, res) => {
    const image = req.file ? req.file.filename : undefined;
    
    // Parse all fields from req.body
    const {
        id,
        restaurantName,
        primaryColor,
        secondaryColor,
        slogan,
        contactEmail,
        contactPhone,
        deleteAccountHours,
        securityToken,
        currency,
        defaultLanguage,
        timezone,
        taxRate,
        serviceCharge,
        address,
        city,
        country,
        postalCode,
        website,
        facebook,
        instagram,
        reservationEnabled,
        takeawayEnabled,
        deliveryEnabled,
        minOrderAmount,
        deliveryFee,
        vatNumber,
        companyNumber,
        receiptFooter,
        ratingEnabled,
        tipsEnabled,
        logoPosition,
        themeStyle,
        menuLayout,
        qrCodeEnabled,
        autoPrintEnabled
    } = req.body;

    const openingHours = JSON.parse(req.body.openingHours || '{}');

    try {
        const updateData = {
            restaurantName,
            primaryColor,
            secondaryColor,
            slogan,
            contactEmail,
            contactPhone,
            deleteAccountHours,
            securityToken,
            currency,
            defaultLanguage,
            timezone,
            taxRate,
            serviceCharge,
            address,
            city,
            country,
            postalCode,
            website,
            facebook,
            instagram,
            reservationEnabled: reservationEnabled === 'true' || reservationEnabled === true,
            takeawayEnabled: takeawayEnabled === 'true' || takeawayEnabled === true,
            deliveryEnabled: deliveryEnabled === 'true' || deliveryEnabled === true,
            minOrderAmount,
            deliveryFee,
            vatNumber,
            companyNumber,
            receiptFooter,
            ratingEnabled: ratingEnabled === 'true' || ratingEnabled === true,
            tipsEnabled: tipsEnabled === 'true' || tipsEnabled === true,
            logoPosition,
            themeStyle,
            menuLayout,
            qrCodeEnabled: qrCodeEnabled === 'true' || qrCodeEnabled === true,
            autoPrintEnabled: autoPrintEnabled === 'true' || autoPrintEnabled === true,
            openingHours,
            updatedAt: Date.now()
        };

        // Add image only if a new one was uploaded
        if (image) {
            updateData.image = image;
        }

        const customization = await customizationModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, upsert: true }
        );

        res.status(200).json({ 
            success: true, 
            message: 'Customization Updated Successfully',
            data: customization 
        });
    } catch (error) {
        console.error('Error updating customization:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating customization.' 
        });
    }
};

const getCustomization = async (req, res) => {
    try {
        const customizationData = await customizationModel.findOne();

        if (!customizationData) {
            return res.status(200).json({
                success: true,
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            data: customizationData,
        });
    } catch (error) {
        console.error('Error fetching customization data:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching customization data.',
        });
    }
};

export { addCustomization, updateCustomization, getCustomization };