import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import "dotenv/config"
import orderRouter from "./routes/orderRoute.js"
import categoryRouter from "./routes/categoryRoute.js"
import waiterRouter from "./routes/waiterRoute.js"
import cron from 'node-cron'
import { deactivateExpiredUsers } from "./controllers/userController.js"
import adminRouter from "./routes/adminRoute.js"
import customizationRoute from "./routes/customizationRoute.js"
import validateAuthRouter from "./routes/validateAuthRoute.js"

//app config
const app = express()
const port = process.env.PORT || 4000;


// middleware
app.use(express.json())
app.use(cors())

//db connection
connectDB();

//Function for delete old users at every 10 minutes
// Programare a funcției să ruleze la fiecare 10 minute
cron.schedule('*/10 * * * *', async () => {
    console.log('Verificare utilizatori cu token-uri expirate...');
    await deactivateExpiredUsers();
});

//api endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static('uploads'));
app.use("/api/user",userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/waiterorders", waiterRouter);
app.use('/admin', adminRouter);
app.use('/admin/personalization', customizationRoute)
app.use('/api', validateAuthRouter)


app.get("/", (req, res) => {
    res.send("API Working")
})

app.listen(port, '0.0.0.0', () => {
    console.log(`Server Started on http://0.0.0.0:${port}`)
});


