import express from 'express';
import { getCustomization, updateCustomization, addCustomization } from '../controllers/customizationController.js';
import multer from "multer";

const customizationRouter = express.Router();
//Image storage engine

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({ storage: storage })



// Route for fetching customization data
customizationRouter.get('/', getCustomization); // GET /admin/personalization

// Route for adding a new customization
customizationRouter.post('/add', upload.single("image"), addCustomization); // POST /admin/personalization/add

// Route for updating customization data
customizationRouter.post('/', updateCustomization); // POST /admin/personalization

export default customizationRouter;
