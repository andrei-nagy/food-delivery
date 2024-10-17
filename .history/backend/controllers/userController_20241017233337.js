import userModel from "../models/userModel.js";
import tableModel from "../models/tableModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";




// Funcție pentru a seta isActive pe false pentru utilizatorii cu token-uri expirate
const deactivateExpiredUsers = async () => {
    try {
        // Obține ora curentă
        const now = new Date();

        // Actualizează utilizatorii cu tokenExpiry mai mic decât ora curentă, setând isActive pe false
        const result = await userModel.updateMany(
            { tokenExpiry: { $lt: now } }, // Condiția pentru token-uri expirate
            { $set: { isActive: false } }  // Actualizarea pentru setarea isActive pe false
        );

        console.log(`${result.modifiedCount} utilizatori au fost dezactivați (isActive = false).`);
    } catch (error) {
        console.error("Eroare la actualizarea utilizatorilor expirate:", error);
    }
};



//login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists." })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials." })
        }

        const token = createToken(user._id);
        res.json({ success: true, token })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}
// login automat pentru un utilizator prestabilit
const autoLogin = async (req, res) => {
    const { tableNumber } = req.query;
    const password = "12345678";  // Parolă fixă pentru testare

    try {
        const user = await userModel.findOne({ tableNumber });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist." });
        }

        if (user.activeSessions >= 6) {
            return res.json({ success: false, message: "Maximum number of sessions reached." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials." });
        }

        // Actualizează numărul mesei și crește activeSessions
        user.tableNumber = tableNumber;
        user.activeSessions += 1;
        await user.save();

        const token = createToken(user._id);

        // Verifică dacă există deja o înregistrare pentru această masă
        let table = await tableModel.findOne({ tableNumber });

        if (!table) {
            // Dacă nu există o înregistrare pentru masa respectivă, creează una nouă
            table = new tableModel({
                tableNumber: tableNumber,
                status: 'occupied',
                userId: user._id  // Legăm masa de utilizatorul conectat
            });
        } 

        await table.save();  // Salvează sau actualizează înregistrarea mesei

        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};



const generateRandomEmail = () => {
    const randomString = Math.random().toString(36).substring(2, 11); // generează un string aleatoriu
    return `${randomString}@example.com`;  // poate fi personalizat cu orice domeniu
};


// login automat pentru un utilizator prestabilit
const autoRegister = async (req, res) => {
    const { tableNumber } = req.query;
    const email = generateRandomEmail();
    const password = "12345678";  // Parolă fixă pentru testare
    const name = 'Customer Account';

    try {
        // Caută un utilizator existent pe baza tableNumber
        let user = await userModel.findOne({ tableNumber: tableNumber, isActive: true });

        if (user) {
            // Dacă contul există deja, trece la login automat
            return autoLogin(req, res);
        }

        // Hashing-ul parolei
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Setează expirarea tokenului peste 2 ore
        const tokenExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 ore

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword,
            tokenExpiry: tokenExpiry,
            tableNumber: tableNumber,
            activeSessions: 1,
            isActive: true  // Prima sesiune activă
        });

        user = await newUser.save();

        const token = createToken(user._id);
        user.token = token;

        await user.save();  // Salvează din nou pentru a actualiza token-ul

        // După înregistrare, creează un record pentru masă
        let table = await tableModel.findOne({ tableNumber });

        if (!table) {
            // Dacă nu există o înregistrare pentru masa respectivă, creează una nouă
            table = new tableModel({
                tableNumber: tableNumber,
                status: 'occupied',
                userId: user._id  // Legăm masa de utilizatorul conectat
            });
        }

        await table.save();  // Salvează înregistrarea mesei

        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};




const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        // Verificare dacă utilizatorul există deja
        const exists = await userModel.findOne({ email });
        // if (exists) {
        //     return res.json({ success: false, message: "User already exists!" });
        // }

        // Validare email și parolă
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email." });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password." });
        }

        // Hashing-ul parolei
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generare token și expirare peste 2 ore
        // const token = createToken(email);
        const tokenExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 ore

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword,
            // token: token,
            tokenExpiry: tokenExpiry
        });
        const user = await newUser.save();
        const token = createToken(user._id);
        const userId = user._id;
        user.token = token;  // Setează token-ul în utilizator

        await user.save();  // Salvează din nou pentru a actualiza token-ul
   
        res.json({ success: true, token, userId: userId });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

export { loginUser, registerUser, autoLogin, autoRegister, deactivateExpiredUsers };