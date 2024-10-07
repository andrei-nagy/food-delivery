import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";



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
    const email = "andrei.xfr@gmail.com";
    const password = "12345678";

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User doesn't exist." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials." });
        }

        // Actualizează numărul mesei
        user.tableNumber = tableNumber;
        await user.save();

        const token = createToken(user._id);
        res.json({ success: true, token, redirect: '/' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

const generateRandomEmail = () => {
    const randomString = Math.random().toString(36).substring(2, 11); // generează un string aleatoriu
    return `${randomString}@example.com`;  // poate fi personalizat cu orice domeniu
};


// login automat pentru un utilizator prestabilit
const autoRegister = async (req, res) => {
    const { tableNumber } = req.query;
    const email = generateRandomEmail();
    const password = "12345678"; // this is for testing
    const name = 'Customer Account'
    try {
       
        // Hashing-ul parolei
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generare token și expirare peste 2 ore
        const token = createToken(email);
        const tokenExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 ore

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword,
            token: token,
            tokenExpiry: tokenExpiry,
            tableNumber: tableNumber
        });

        const user = await newUser.save();
        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        // Verificare dacă utilizatorul există deja
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists!?" });
        }

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
        const token = createToken(email);
        const tokenExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 ore

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword,
            token: token,
            tokenExpiry: tokenExpiry
        });

        const user = await newUser.save();
        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

export { loginUser, registerUser, autoLogin, autoRegister };