import express from 'express';
import {
    getCustomization,
    updateCustomization,
    addCustomization,
    updatePartnerPlan,
    updateFeatureFlags,
} from '../controllers/customizationController.js';
import multer from "multer";

const customizationRouter = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

customizationRouter.get('/get', getCustomization);
customizationRouter.post('/add', upload.single("image"), addCustomization);
customizationRouter.put('/update', upload.single("image"), updateCustomization);

// Rute noi pentru Feature Flags
customizationRouter.post('/update-plan', updatePartnerPlan);
customizationRouter.post('/update-features', updateFeatureFlags);

export default customizationRouter;