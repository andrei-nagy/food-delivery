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

// Middleware pentru logging detaliat
// Middleware pentru a parsa JSON string din form-data
foodRouter.use((req, res, next) => {
  if (req.body.extras && typeof req.body.extras === 'string') {
    try {
      req.body.extras = JSON.parse(req.body.extras);
    } catch (error) {
      console.error("Error parsing extras JSON:", error);
      req.body.extras = [];
    }
  }
  next();
});

foodRouter.post("/add", upload.single("image"), (req, res, next) => {
  console.log("=== /add REQUEST DETAILS ===");
  console.log("Files:", req.file);
  console.log("Body:", req.body);
  console.log("Extras field type:", typeof req.body.extras);
  console.log("Extras field value:", req.body.extras);
  console.log("============================");
  next();
}, addFood);

foodRouter.get('/list', listFood);

foodRouter.post('/remove', removeFood);

foodRouter.post('/update', upload.single("image"), (req, res, next) => {
  console.log("=== /update REQUEST DETAILS ===");
  console.log("Files:", req.file);
  console.log("Body:", req.body);
  console.log("Extras field type:", typeof req.body.extras);
  console.log("Extras field value:", req.body.extras);
  console.log("==============================");
  next();
}, updateFood);

export default foodRouter;