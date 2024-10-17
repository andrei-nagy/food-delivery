import customizationModel from '../models/customizationModel.js';
import mongoose from "mongoose";

// Funcția pentru a adăuga o personalizare pentru un restaurant
// add food category item 

const addCustomization = async (req, res) => {
    let image_filename = `${req.file.image}`
    const { restaurantId, restaurantName, logoUrl, primaryColor, secondaryColor, slogan, contactEmail, contactPhone } = req.body;
 //         // Cream o nouă personalizare
        const newCustomization = new customizationModel({
            restaurantId,
            restaurantName,
            image: image_filename,
            primaryColor,
            secondaryColor,
            slogan,
            contactEmail,
            contactPhone,
            updatedAt: Date.now(),
        });
    try {
        await newCustomization.save();
        res.json({
            success: true,
            message: 'Food Category Added'
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: 'Error'
        })
    }
}
// const addCustomization = async (req, res) => {
//     const { restaurantId, restaurantName, logoUrl, primaryColor, secondaryColor, slogan, contactEmail, contactPhone } = req.body;

//     // Verificăm dacă restaurantId este furnizat
//     if (!restaurantId) {
//         return res.status(400).json({ success: false, message: 'restaurantId is required.' });
//     }

//     try {
//         // Verificăm dacă există deja o personalizare pentru acest restaurant
//         const existingCustomization = await customizationModel.findOne({ restaurantId });
        
//         if (existingCustomization) {
//             return res.status(400).json({ success: false, message: 'Customization already exists for this restaurant.' });
//         }

//         // Cream o nouă personalizare
//         const newCustomization = new customizationModel({
//             restaurantId,
//             restaurantName,
//             logoUrl,
//             primaryColor,
//             secondaryColor,
//             slogan,
//             contactEmail,
//             contactPhone,
//             updatedAt: Date.now(),
//         });

//         const customization = await newCustomization.save();

//         res.status(201).json({ success: true, data: customization });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: 'Error adding customization.' });
//     }
// };


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

export {addCustomization, updateCustomization, getCustomization };
