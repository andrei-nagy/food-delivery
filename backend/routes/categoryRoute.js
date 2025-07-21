import express from "express";
import { addCategory, listFoodCategory, removeFoodCategory, updateCategory } from "../controllers/categoryController.js";
import multer from "multer";

const categoryRouter = express.Router();

//Image storage engine

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({ storage: storage })


categoryRouter.post(
  "/addcategory",
  (req, res, next) => {
    upload.single("image")(req, res, function(err) {
      if (err) {
        console.error("Multer error:", err);
        return res.status(500).json({ success: false, message: "Upload failed", error: err.message });
      }
      next();
    });
  },
  addCategory
);
categoryRouter.get('/listcategory', listFoodCategory);
categoryRouter.post('/removecategory', removeFoodCategory)
categoryRouter.post("/update", upload.single("image"), updateCategory);




export default categoryRouter;