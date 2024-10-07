import express from "express";
import { addWaiterRequest, listWaiterOrders} from "../controllers/waiterController.js";
import multer from "multer";

const waiterRouter = express.Router();

waiterRouter.post('/add', addWaiterRequest);
waiterRouter.get('/listwaiterrequests', listWaiterOrders);





export default waiterRouter;