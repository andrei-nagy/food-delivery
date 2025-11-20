import userModel from "../models/userModel.js";
import tableModel from "../models/tableModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import mongoose from "mongoose";

// Funcție pentru a seta isActive pe false pentru utilizatorii cu token-uri expirate
const deactivateExpiredUsers = async () => {
  try {
    // Obține ora curentă
    const now = new Date();

    // Actualizează utilizatorii cu tokenExpiry mai mic decât ora curentă, setând isActive pe false
    const result = await userModel.updateMany(
      { tokenExpiry: { $lt: now } }, // Condiția pentru token-uri expirate
      { $set: { isActive: false } } // Actualizarea pentru setarea isActive pe false
    );

    console.log(
      `${result.modifiedCount} utilizatori au fost dezactivați (isActive = false).`
    );
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
      return res.json({ success: false, message: "User doesn't exists." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials." });
    }

    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
// login automat pentru un utilizator prestabilit
const checkUserStatus = async (req, res) => {
  const userId = req.headers.userId || req.headers.userid;
  try {
    const user = await userModel.findOne({ _id: userId });

    if (user) {
      console.log(user);
      return res.status(200).json({
        isActive: user.isActive,
        tokenExpiry: user.tokenExpiry,
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error checking user status" });
  }
};

const autoLogin = async (req, res) => {
  const { tableNumber } = req.query;
  const password = "12345678"; // Parolă fixă pentru testare

  try {
    const user = await userModel.findOne({ tableNumber, isActive: true });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist." });
    }

    if (user.activeSessions >= 6) {
      return res.json({
        success: false,
        message: "Maximum number of sessions reached.",
        code: "MAX_SESSIONS",
      });
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
        status: "occupied",
        userId: user._id, // Legăm masa de utilizatorul conectat
      });
    }
    const userId = user._id;
    await table.save(); // Salvează sau actualizează înregistrarea mesei

    res.json({ success: true, token, userId });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const generateRandomEmail = () => {
  const randomString = Math.random().toString(36).substring(2, 11); // generează un string aleatoriu
  return `${randomString}@example.com`; // poate fi personalizat cu orice domeniu
};

// login automat pentru un utilizator prestabilit
const autoRegister = async (req, res) => {
  const { tableNumber } = req.query;
  const email = generateRandomEmail();
  const password = "12345678"; // Parolă fixă pentru testare
  const name = "Customer Account";

  try {
    // Verifică dacă există deja un user activ pentru masa respectivă
    let user = await userModel.findOne({ tableNumber, isActive: true });

    if (user) {
      // Dacă există, trece direct la login
      return autoLogin(req, res);
    }

    // Generează parola criptată
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generează token JWT înainte de salvare (pentru schema required)
    const tempUser = { _id: new mongoose.Types.ObjectId() }; // creezi un ID temporar pentru token
    const token = createToken(tempUser._id);

    // Setează expirarea tokenului
    // const tokenExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 ore
    const tokenExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minute

    // Creează utilizatorul cu toate câmpurile necesare
    const newUser = new userModel({
      _id: tempUser._id, // setezi ID-ul manual ca să fie același din token
      name,
      email,
      password: hashedPassword,
      token,
      tokenExpiry,
      tableNumber,
      activeSessions: 1,
      isActive: true,
    });

    user = await newUser.save();

    // Găsește sau creează masa corespunzătoare
    let table = await tableModel.findOne({ tableNumber });

    if (!table) {
      table = new tableModel({
        tableNumber,
        status: "occupied",
        userId: user._id,
      });
    }

    await table.save();

    res.json({ success: true, token, userId: user._id });
  } catch (error) {
    console.error("Eroare la autoRegister:", error);
    res.json({ success: false, message: "Error" });
  }
};

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const getUserCount = async (req, res) => {
  try {
    const userCount = await userModel.countDocuments(); // Funcție mongoose pentru a număra utilizatorii
    res.status(200).json({ success: true, count: userCount });
  } catch (error) {
    console.error("Eroare la preluarea numărului de utilizatori:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Eroare la preluarea numărului de utilizatori",
      });
  }
};
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const userId = req.params.id;

    const user = await userModel.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find(); // Funcție mongoose pentru a prelua toate documentele
    res.status(200).json({ success: true, users }); // Trimite toate datele ca răspuns JSON
  } catch (error) {
    console.error("Eroare la preluarea utilizatorilor:", error);
    res
      .status(500)
      .json({ success: false, message: "Eroare la preluarea utilizatorilor" });
  }
};

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
      return res.json({
        success: false,
        message: "Please enter a valid email.",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password.",
      });
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
      tokenExpiry: tokenExpiry,
    });
    const user = await newUser.save();
    const token = createToken(user._id);
    const userId = user._id;
    user.token = token; // Setează token-ul în utilizator

    await user.save(); // Salvează din nou pentru a actualiza token-ul

    res.json({ success: true, token, userId });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Extend token expiry time
const extendTokenTime = async (req, res) => {
  const { userId, minutes } = req.body;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Verifică dacă user-ul este activ
    if (!user.isActive) {
      return res.json({ success: false, message: "User is not active" });
    }

    // Folosește minutes din request sau default 30 dacă nu este specificat
    const extendMinutes = minutes || 30;

    // Extinde timpul cu minutele specificate
    const newExpiry = new Date(user.tokenExpiry);
    newExpiry.setMinutes(newExpiry.getMinutes() + extendMinutes);

    // Actualizează în baza de date
    user.tokenExpiry = newExpiry;
    await user.save();

    res.json({
      success: true,
      message: `Time extended by ${extendMinutes} minutes`,
      newExpiry: newExpiry,
    });
  } catch (error) {
    console.error("Error extending token time:", error);
    res.json({ success: false, message: "Error extending time" });
  }
};
// Extend token expiry time for expired sessions (with reactivation)
const extendTokenSessionExpired = async (req, res) => {
  const { userId, minutes } = req.body;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Folosește minutes din request sau default 30 dacă nu este specificat
    const extendMinutes = minutes || 30;

    // Calculează noua dată de expirare
    const now = new Date();
    const newExpiry = new Date(now.getTime() + extendMinutes * 60 * 1000);

    // Actualizează în baza de date - setează isActive pe true și actualizează tokenExpiry
    user.isActive = true;
    user.tokenExpiry = newExpiry;
    await user.save();

    console.log(
      `User ${userId} reactivated and token extended by ${extendMinutes} minutes. New expiry: ${newExpiry}`
    );

    res.json({
      success: true,
      message: `Session reactivated and time extended by ${extendMinutes} minutes`,
      newExpiry: newExpiry,
      isActive: true,
    });
  } catch (error) {
    console.error("Error extending token time for expired session:", error);
    res.json({ success: false, message: "Error extending time" });
  }
};
export {
  loginUser,
  registerUser,
  autoLogin,
  autoRegister,
  deactivateExpiredUsers,
  checkUserStatus,
  getUserCount,
  getAllUsers,
  updateUserStatus,
  extendTokenTime,
  extendTokenSessionExpired,
};
