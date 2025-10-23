import express from "express";
import { addFood, listFood, removeFood, updateFood } from "../controllers/foodController.js";
import multer from "multer";
import path from 'path';

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
  console.log("=== PARSING EXTRAS MIDDLEWARE ===");
  console.log("Request body keys:", Object.keys(req.body));
  console.log("Extras field exists:", 'extras' in req.body);
  console.log("Extras field type:", typeof req.body.extras);
  console.log("Extras field value:", req.body.extras);
  
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
  console.log("=== /add REQUEST DETAILS ===");
  console.log("Files:", req.file);
  console.log("Body:", req.body);
  console.log("Extras after parsing:", req.body.extras);
  console.log("============================");
  next();
}, addFood);

foodRouter.get('/list', listFood);

foodRouter.post('/remove', removeFood);

foodRouter.post('/update', upload.single("image"), parseExtras, (req, res, next) => {
  console.log("=== /update REQUEST DETAILS ===");
  console.log("Files:", req.file);
  console.log("Body:", req.body);
  console.log("Extras after parsing:", req.body.extras);
  console.log("==============================");
  next();
}, updateFood);

export default foodRouter;