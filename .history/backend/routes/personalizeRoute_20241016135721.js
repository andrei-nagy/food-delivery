import express from 'express';
import {updateCustomization, getCustomization } from '../controllers/adminController.js';

const customizationRoute = express.Router();

// Rutele pentru admin

customizationRoute.post('/', updateCustomization); // Ruta pentru actualizare
customizationRoute.get('/', getCustomization); // Ruta pentru obținerea datelor de personalizare

export default customizationRoute;
