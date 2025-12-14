import express from "express";
import { addFood, listFood, removeFood, removeMultipleFoods, updateFood } from "../controllers/foodController.js";
import multer from "multer";
import path from 'path';
import authMiddleware from "../middleware/auth.js";

const foodRouter = express.Router();

// Image storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve('uploads');
    console.log("Upload destination path:", uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Middleware pentru a parsa JSON string din form-data
const parseExtras = (req, res, next) => {
  
  if (req.body.extras && typeof req.body.extras === 'string') {
    try {
      req.body.extras = JSON.parse(req.body.extras);
      console.log("✅ Successfully parsed extras:", req.body.extras);
    } catch (error) {
      console.error("❌ Error parsing extras JSON:", error);
      req.body.extras = [];
    }
  } else {
    console.log("ℹ️ Extras is already parsed or not present");
  }
  next();
};

// Rute modificate - parseExtras vine DUPĂ upload.single()
foodRouter.post("/add", upload.single("image"), parseExtras, (req, res, next) => {
  next();
}, addFood);

foodRouter.get('/list', listFood);

foodRouter.post('/remove', removeFood);
foodRouter.post('/remove-multiple', removeMultipleFoods);
foodRouter.post('/update', upload.single("image"), parseExtras, (req, res, next) => {
  next();
}, updateFood);

export default foodRouter;