import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userAdminModel from '../models/userAdminModel.js';
import customizationModel from '../models/customizationModel.js';

const registerAdmin = async (req, res) => {
    const { email, password, securityToken } = req.body;

    // Security token check
    if (securityToken !== '123456789') {
        return res.json({ success: false, message: 'Invalid security token.' });
    }

    try {
        const userExists = await userAdminModel.findOne({ email });
        if (userExists) {
            return res.json({ success: false, message: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userAdminModel({
            email,
            password: hashedPassword,
            securityToken,
        });

        await newUser.save();
        res.json({ success: true, message: 'Account created successfully.' });
    } catch (error) {
        res.json({ success: false, message: 'Error creating account.' });
    }
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userAdminModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User does not exist.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ success: true, token });
    } catch (error) {
        res.json({ success: false, message: 'Error logging in.' });
    }
};



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

export { registerAdmin, loginAdmin, updateCustomization, getCustomization };
