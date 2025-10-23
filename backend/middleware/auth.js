import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Middleware original pentru autentificare
const authMiddleware = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.json({ success: false, message: "Not Authorized. Try to login again." })
    }
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = token_decode.id;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Middleware pentru a verifica dacă utilizatorul este activ
export const checkUserActive = async (req, res, next) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).send({ 
                success: false, 
                message: "User ID este necesar",
                clearCart: true 
            });
        }

        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(401).send({
                success: false,
                message: "Utilizatorul nu a fost găsit",
                clearCart: true
            });
        }

        if (!user.isActive) {
            return res.status(401).send({
                success: false,
                message: "Cont expirat. Vă rugăm să vă autentificați din nou.",
                clearCart: true
            });
        }

        next();
    } catch (error) {
        console.error("Eroare la verificarea utilizatorului:", error);
        res.status(500).send({
            success: false,
            message: "Eroare internă server",
            clearCart: true
        });
    }
};

// Middleware combinat care face ambele verificări: auth + user active
export const authAndActiveMiddleware = async (req, res, next) => {
    const { token } = req.headers;
    
    if (!token) {
        return res.status(401).send({ 
            success: false, 
            message: "Not Authorized. Try to login again.",
            clearCart: true 
        });
    }
    
    try {
        // Verifică token-ul
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        const userId = token_decode.id;
        
        if (!userId) {
            return res.status(401).send({
                success: false,
                message: "Token invalid",
                clearCart: true
            });
        }

        // Verifică dacă utilizatorul este activ
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(401).send({
                success: false,
                message: "Utilizatorul nu a fost găsit",
                clearCart: true
            });
        }

        if (!user.isActive) {
            return res.status(401).send({
                success: false,
                message: "Cont expirat. Vă rugăm să vă autentificați din nou.",
                clearCart: true
            });
        }

        // Adaugă user ID în request pentru a fi folosit în controller
        req.body.userId = userId;
        next();
        
    } catch (error) {
        console.error("Eroare la verificarea token-ului:", error);
        res.status(401).send({
            success: false,
            message: "Token invalid sau expirat",
            clearCart: true
        });
    }
};

export default authMiddleware;