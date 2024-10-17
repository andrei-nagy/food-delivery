import express from 'express';
import {updateCustomization, getCustomization } from '../controllers/adminController.js';
import { addCustomization } from '../controllers/personalizeController.js';

const customizationRoute = express.Router();

// Rutele pentru admin
customizationRoute.post('/add', addCustomization)
customizationRoute.post('/update', updateCustomization); // Ruta pentru actualizare
customizationRoute.get('/get', getCustomization); // Ruta pentru obținerea datelor de personalizare

export default customizationRoute;
