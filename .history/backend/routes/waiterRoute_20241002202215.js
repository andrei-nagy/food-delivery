import express from "express";
import { listWaiterOrders} from "../controllers/waiterController.js";
import multer from "multer";

const waiterRouter = express.Router();

waiterRouter.get('/listwaiterorders', listWaiterOrders);





export default waiterRouter;