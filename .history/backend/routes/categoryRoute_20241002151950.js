import express from "express";
import { addCategory, listFoodCategory, removeFoodCategory } from "../controllers/categoryController.js";
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


categoryRouter.post("/category", upload.single("image"), addCategory)
categoryRouter.get('/listcategory', listFoodCategory);
categoryRouter.post('/removecategory', removeFoodCategory)




export default categoryRouter;