import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userAdminModel from '../models/userAdminModel.js';
import customizationModel from '../models/customizationModel.js';
import mongoose from "mongoose";
import qrCodeModel from '../models/qrCodeModel.js';

// ── Roluri valide în sistem ────────────────────────────────────
const VALID_ROLES = ['Admin', 'Waiter', 'Orderly'];

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// ── REGISTER ─────────────────────────────────────────────────
const registerAdmin = async (req, res) => {
    const { name, email, password, securityToken, userRole } = req.body;

    if (securityToken !== '123456789') {
        return res.json({ success: false, message: 'Invalid security token.' });
    }

    if (!VALID_ROLES.includes(userRole)) {
        return res.json({ success: false, message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
    }

    try {
        const userExists = await userAdminModel.findOne({ email });
        if (userExists) {
            return res.json({ success: false, message: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userAdminModel({ name, email, password: hashedPassword, securityToken, userRole });
        await newUser.save();

        res.json({ success: true, message: 'Account created successfully.' });
    } catch (error) {
        console.error('REGISTER ADMIN ERROR:', error);
        res.status(500).json({ success: false, message: error.message || 'Error creating account' });
    }
};

// ── LOGIN ─────────────────────────────────────────────────────
const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userAdminModel.findOne({ email });
        if (!user) return res.json({ success: false, message: 'User does not exist.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.json({ success: false, message: 'Invalid credentials.' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });

        res.json({
            success:  true,
            token,
            userRole: user.userRole,
            userName: user.name,
        });
    } catch (error) {
        res.json({ success: false, message: 'Error logging in.' });
    }
};

// ── GET ALL ADMIN ACCOUNTS ────────────────────────────────────
const getAllAdminAccounts = async (req, res) => {
    try {
        const users = await userAdminModel.find({}, '-password');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching admin accounts:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching admin accounts.' });
    }
};

// ── UPDATE ACCOUNT ────────────────────────────────────────────
const updateAccount = async (req, res) => {
    const { id, name, email, userRole, password } = req.body;

    if (userRole && !VALID_ROLES.includes(userRole)) {
        return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
    }

    const updateData = {};
    if (name)     updateData.name     = name;
    if (email)    updateData.email    = email;
    if (userRole) updateData.userRole = userRole;
    if (password) updateData.password = await hashPassword(password);

    try {
        const updatedUser = await userAdminModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedUser) return res.status(404).json({ success: false, message: "User not found." });
        res.json({ success: true, message: "Account updated successfully!", data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating account.", error });
    }
};

// ── REMOVE ACCOUNT ────────────────────────────────────────────
const removeAccount = async (req, res) => {
    try {
        await userAdminModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: 'Account Removed' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Error removing account' });
    }
};

// ── CUSTOMIZATION (legacy — folosit din adminRoute) ───────────
const updateCustomization = async (req, res) => {
    let { restaurantId, restaurantName, logoUrl, primaryColor, secondaryColor, slogan, contactEmail, contactPhone } = req.body;
    try {
        if (!restaurantId) restaurantId = new mongoose.Types.ObjectId();
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

const getCustomization = async (req, res) => {
    try {
        const restaurantId = req.query.restaurantId;
        const customizationData = await customizationModel.findOne({ restaurantId });
        if (!customizationData) return res.status(200).json({ success: true, data: null });
        return res.status(200).json({ success: true, data: customizationData });
    } catch (error) {
        console.error('Error fetching customization data:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching customization data.' });
    }
};

// ── QR CODES ──────────────────────────────────────────────────
const createQRCode = async (req, res) => {
    const { tableNo, createdByUserName, qrImage, createdOn } = req.body;
    try {
        const qrExists = await qrCodeModel.findOne({ tableNo });
        if (qrExists) return res.json({ success: false, message: 'QR Code already exists.' });
        const newQRCode = new qrCodeModel({ tableNo, createdByUserName, qrImage, createdOn: createdOn || new Date() });
        await newQRCode.save();
        res.json({ success: true, message: 'QR Code saved successfully!' });
    } catch (error) {
        console.error('Error details:', error);
        res.json({ success: false, message: `Error creating QR code: ${error.message}` });
    }
};

const getQrCodes = async (req, res) => {
    try {
        const qrCodes = await qrCodeModel.find();
        return res.status(200).json({ success: true, data: qrCodes });
    } catch (error) {
        console.error('Error fetching QR codes:', error);
        return res.status(500).json({ success: false, message: 'Server error while fetching QR codes.' });
    }
};

const removeQrCode = async (req, res) => {
    try {
        await qrCodeModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: 'Qr Code Removed' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Error removing QR code' });
    }
};

// ── PASSWORD / PROFILE ────────────────────────────────────────
const changePassword = async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
    try {
        const user = await userAdminModel.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) return res.json({ success: false, message: 'Current password is incorrect.' });
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Server error while changing password.' });
    }
};

const updateProfile = async (req, res) => {
    const { userId, name, email } = req.body;
    try {
        if (email) {
            const existing = await userAdminModel.findOne({ email, _id: { $ne: userId } });
            if (existing) return res.json({ success: false, message: 'Email is already in use by another account.' });
        }
        const user = await userAdminModel.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        if (name)  user.name  = name;
        if (email) user.email = email;
        await user.save();
        res.json({
            success: true,
            message: 'Profile updated successfully.',
            data: { _id: user._id, name: user.name, email: user.email, userRole: user.userRole, createdOn: user.createdOn },
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Server error while updating profile.' });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) return res.status(401).json({ success: false, message: 'User not authenticated.' });
        const user = await userAdminModel.findById(userId).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching user data.' });
    }
};

export {
    registerAdmin, loginAdmin,
    updateCustomization, getCustomization,
    getAllAdminAccounts, removeAccount, updateAccount,
    createQRCode, getQrCodes, removeQrCode,
    changePassword, updateProfile, getCurrentUser,
};