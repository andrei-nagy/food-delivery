import express from "express";
import { addWaiterRequest, listWaiterOrders, updateStatus} from "../controllers/waiterController.js";
import multer from "multer";

const waiterRouter = express.Router();

waiterRouter.post('/add', addWaiterRequest);
waiterRouter.get('/listwaiterrequests', listWaiterOrders);

waiterRouter.post("/status", updateStatus);



export default waiterRouter;