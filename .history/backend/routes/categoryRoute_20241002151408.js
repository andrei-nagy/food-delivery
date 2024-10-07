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


categoryRouter.post("/addcategory", upload.single("image"), addFood)
categoryRouter.get('/listcategory', listFood);
categoryRouter.post('/removeremove', removeFood)




export default categoryRouter;