import customizationModel from '../models/customizationModel.js';
import mongoose from "mongoose";



// Actualizează personalizarea unui restaurant
const updateCustomization = async (req, res) => {
    let { restaurantId, restaurantName, logoUrl, primaryColor, secondaryColor, slogan, contactEmail, contactPhone } = req.body;

    try {
        // Generăm un restaurantId dacă lipsește din request
        if (!restaurantId) {
            restaurantId = new mongoose.Types.ObjectId();
        }

        const customization = await customizationModel.findOneAndUpdate(
            { restaurantId },
            { restaurantName, logoUrl, primaryColor, secondaryColor, slogan, contactEmail, contactPhone, updatedAt: Date.now() },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: customization });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating customization.' });
    }
};



// Funcția pentru a returna personalizarea unui restaurant
const getCustomization = async (req, res) => {
    try {
        const restaurantId = req.query.restaurantId; // Presupunem că restaurantId este trimis ca parametru de query

        const customizationData = await customizationModel.findOne({ restaurantId });

        // Dacă nu există personalizare pentru restaurant, trimitem un răspuns gol
        if (!customizationData) {
            return res.status(200).json({
                success: true,
                data: null // Trimitem null pentru a indica că nu există personalizare
            });
        }

        // Trimite datele de personalizare dacă sunt găsite
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

export {updateCustomization, getCustomization };
