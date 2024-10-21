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


categoryRouter.post("/addcategory", upload.single("image"), addCategory)
categoryRouter.get('/listcategory', listFoodCategory);
categoryRouter.post('/removecategory', removeFoodCategory)
categoryRouter.post('/update', updateCategory)



export default categoryRouter;