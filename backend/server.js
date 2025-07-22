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
const port = process.env.PORT || 4000

const allowedOrigins = ['https://demo.orderly-app.com']

// middleware
app.use(express.json())

app.use(cors({
  origin: function(origin, callback){
    // permit cererile fara origin (ex: curl)
    if(!origin) return callback(null, true)
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`
      return callback(new Error(msg), false)
    }
    return callback(null, true)
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true
}))

// raspunde la OPTIONS preflight
app.options('*', cors())

//db connection
connectDB()

//Function for delete old users at every 10 minutes
cron.schedule('*/10 * * * *', async () => {
    console.log('Verificare utilizatori cu token-uri expirate...')
    await deactivateExpiredUsers()
})

//api endpoints
app.use("/api/food", foodRouter)
app.use("/images", express.static('uploads'))
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/categories", categoryRouter)
app.use("/api/waiterorders", waiterRouter)
app.use('/admin', adminRouter)
app.use('/admin/personalization', customizationRoute)
app.use('/api', validateAuthRouter)

app.get("/", (req, res) => {
    res.send("API Working")
})

app.listen(port, '0.0.0.0', () => {
    console.log(`Server Started on http://0.0.0.0:${port}`)
})
