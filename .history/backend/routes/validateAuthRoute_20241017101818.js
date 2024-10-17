// routes/authRoutes.js
import express from 'express';
import userModel from './models/userModel.js'; // Asigură-te că modelul User este corect importat

const router = express.Router();

// Ruta pentru validarea user-ului prin token și tableNumber
router.post('/validate', async (req, res) => {
    const { token, tableNumber } = req.body;

    try {
        // Caută utilizatorul după token și tableNumber
        const user = await userModel.findOne({ token, tableNumber });

        if (user) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error finding user:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
