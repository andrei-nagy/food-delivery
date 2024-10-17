import express from 'express';
import { getCustomization, updateCustomization, addCustomization } from '../controllers/customizationController.js';
import multer from "multer";

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
customizationRouter.get('/', getCustomization); // GET /admin/personalization

// Route pentru a adăuga o nouă personalizare
customizationRouter.post('/add', upload.single("image"), addCustomization); // POST /admin/personalization/add

// Route pentru a actualiza datele de personalizare
customizationRouter.post('/update', updateCustomization); // POST /admin/personalization

export default customizationRouter;
