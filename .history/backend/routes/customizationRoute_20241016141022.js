import express from 'express';
import { getCustomization, updateCustomization, addCustomization } from '../controllers/customizationController.js';

const customizationRouter = express.Router();

// Route for fetching customization data
customizationRouter.get('/', getCustomization); // GET /admin/personalization

// Route for adding a new customization
customizationRouter.post('/add', addCustomization); // POST /admin/personalization/add

// Route for updating customization data
customizationRouter.post('/', updateCustomization); // POST /admin/personalization

export default customizationRouter;
