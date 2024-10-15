import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userAdminModel from '../models/userAdminModel.js';

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

export { registerAdmin, loginAdmin };
