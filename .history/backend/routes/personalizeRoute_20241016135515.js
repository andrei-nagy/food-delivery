import express from 'express';
import { registerAdmin, loginAdmin, updateCustomization, getCustomization } from '../controllers/adminController.js';

const customizationRoute = express.Router();

// Rutele pentru admin

customizationRoute.post('/personalize/update', updateCustomization); // Ruta pentru actualizare
customizationRoute.get('/personalize', getCustomization); // Ruta pentru obținerea datelor de personalizare

export default customizationRoute;
