import express from 'express';
import { getCustomization, updateCustomization, addCustomization } from '../controllers/customizationController.js';
import multer from 'multer';

const customizationRouter = express.Router();

// Configurarea storage-ului pentru multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads"); // Folderul în care se salvează imaginile
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nume unic pentru fișier
    }
});

const upload = multer({ storage });

// Route pentru a obține datele de personalizare
customizationRouter.get('/get', getCustomization); // GET /admin/personalization

// Route pentru a adăuga o nouă personalizare
customizationRouter.post('/add', upload.single("image"), addCustomization); // POST /admin/personalization/add

// Route pentru a actualiza datele de personalizare
customizationRouter.put('/update', upload.array("backgroundImages", 10), async (req, res) => {
    try {
        const files = req.files; // Array de fișiere încărcate
        const { restaurantName, primaryColor, secondaryColor, slogan, contactEmail, contactPhone } = req.body;

        // Logica de actualizare a personalizării
        // Poți să îți definești actualizarea în baza de date aici
        // De exemplu:
        // await updateCustomizationInDatabase({ restaurantName, primaryColor, secondaryColor, slogan, contactEmail, contactPhone, backgroundImages: files });

        // Exemplu de răspuns de succes
        res.status(200).json({ success: true, message: 'Customization updated successfully', files });
    } catch (error) {
        console.error('Error updating customization:', error);
        res.status(500).json({ success: false, message: 'Failed to update customization.' });
    }
});

export default customizationRouter;
