import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userAdminModel from '../models/userAdminModel.js';
import customizationModel from '../models/customizationModel.js';
import mongoose from "mongoose";
import qrCodeModel from '../models/qrCodeModel.js';

const hashPassword = async (password) => {
    const saltRounds = 10; // Numărul de runde pentru generarea salt-ului
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

const registerAdmin = async (req, res) => {
    const { name, email, password, securityToken, userRole } = req.body;

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
            name,
            email,
            password: hashedPassword,
            securityToken,
            userRole
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
        const userRole = user.userRole;
        const userName = user.name;

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ success: true, token, userRole: userRole, userName: userName });
    } catch (error) {
        res.json({ success: false, message: 'Error logging in.' });
    }
};

// Funcția pentru a returna toate conturile de admin
const getAllAdminAccounts = async (req, res) => {
    try {
        const users = await userAdminModel.find({}, '-password'); // Exclude parola din rezultat
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching admin accounts:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching admin accounts.' });
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
const updateAccount = async (req, res) => {
    const { id, name, email, userRole, password } = req.body; // Preia câmpurile necesare din request
    const updateData = { name, email, userRole }; // Creează un obiect de actualizare

    // Dacă există o parolă, hash-uiește-o înainte de a o stoca
    if (password) {
        const hashedPassword = await hashPassword(password); // Asigură-te că ai o funcție de hash pentru parolă
        updateData.password = hashedPassword; // Adaugă parola hashed la obiectul de actualizare
    }

    try {
        const updatedUser = await userAdminModel.findByIdAndUpdate(id, updateData, { new: true }); // Actualizează contul

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.json({ success: true, message: "Account updated successfully!", data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating account.", error });
    }
};


const removeAccount = async (req, res) => {
    try {
        const food = await userAdminModel.findById(req.body.id);

        await userAdminModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: 'Account Removed' })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'error' })
    }
}
const createQRCode = async (req, res) => {
    const { tableNo, createdByUserName, qrImage, createdOn } = req.body;

    try {
        const qrExists = await qrCodeModel.findOne({ tableNo });
        if (qrExists) {
            return res.json({ success: false, message: 'QR Code already exists.' });
        }

        const newQRCode = new qrCodeModel({
            tableNo,
            createdByUserName,
            qrImage,
            createdOn: createdOn || new Date()
        });

        await newQRCode.save();
        res.json({ success: true, message: 'QR Code saved successfully!' });
    } catch (error) {
        console.error('Error details:', error); // Loghează eroarea completă în consolă
        res.json({ success: false, message: `Error creating QR code: ${error.message}` });
    }
};

const getQrCodes = async (req, res) => {
    try {
        // Aduce toate înregistrările din entitate fără filtrare
        const qrCodes = await qrCodeModel.find();

        // Dacă nu există niciun cod QR, trimitem un răspuns gol
        if (!qrCodes.length) {
            return res.status(200).json({
                success: true,
                data: [] // Returnează un array gol în loc de `null` pentru consistență
            });
        }

        // Trimite toate codurile QR găsite
        return res.status(200).json({
            success: true,
            data: qrCodes,
        });
    } catch (error) {
        console.error('Error fetching QR codes:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching QR codes.',
        });
    }
};

const removeQrCode = async (req, res) => {
    try {
        const food = await qrCodeModel.findById(req.body.id);

        await qrCodeModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: 'Qr Code Removed' })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'error' })
    }
}
export { registerAdmin, loginAdmin, updateCustomization, getCustomization, getAllAdminAccounts, removeAccount, updateAccount, createQRCode, getQrCodes, removeQrCode  };
