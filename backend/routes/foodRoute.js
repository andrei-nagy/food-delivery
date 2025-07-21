import express from "express";
import { addFood, listFood, removeFood, updateFood } from "../controllers/foodController.js";
import multer from "multer";

const foodRouter = express.Router();

//Image storage engine

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({ storage: storage })


foodRouter.post("/add", upload.single("image"), (req, res, next) => {
  console.log("Ajuns în ruta /add");
  console.log("Fișierul primit:", req.file);
  console.log("Datele trimise:", req.body);
  next();
}, addFood);
foodRouter.get('/list', listFood);
foodRouter.post('/remove', removeFood)
foodRouter.post('/update', upload.single("image"), updateFood)
// foodRouter.get('/foods', getAllFoods);




export default foodRouter;