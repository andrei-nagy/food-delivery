import customizationModel from '../models/customizationModel.js';
import mongoose from "mongoose";

// Funcția pentru a adăuga o personalizare pentru un restaurant
// add food category item 

const addCustomization = async (req, res) => {
    // let image_filename = `${req.file.image}`
    const { restaurantName, primaryColor, secondaryColor, slogan, contactEmail, contactPhone } = req.body;
    const image = req.file ? req.file.filename : null; // Obține numele fișierului din req.file

       // Verifică dacă restaurantId este valid
    // if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    //     return res.status(400).json({ success: false, message: 'Invalid restaurantId format.' });
    // }
    // console.log('Restaurant ID:', restaurantId);
         // Cream o nouă personalizare
        const newCustomization = new customizationModel({
            // restaurantId: new mongoose.Types.ObjectId(),
            restaurantName,
            image,
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
            message: 'Customization Added'
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: 'Error'
        })
    }
}


// Actualizează personalizarea unui restaurant
const updateCustomization = async (req, res) => {
    let { restaurantName, logoUrl, primaryColor, secondaryColor, slogan, contactEmail, contactPhone } = req.body;

    try {


        const customization = await customizationModel.findOneAndUpdate(
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

        const customizationData = await customizationModel.findOne();

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