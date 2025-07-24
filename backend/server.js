// server.js
import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import categoryRouter from "./routes/categoryRoute.js"
import waiterRouter from "./routes/waiterRoute.js"
import adminRouter from "./routes/adminRoute.js"
import customizationRoute from "./routes/customizationRoute.js"
import validateAuthRouter from "./routes/validateAuthRoute.js"
import { deactivateExpiredUsers } from "./controllers/userController.js"
import cron from "node-cron"
import "dotenv/config"

const app = express()
const port = process.env.PORT || 4000

const allowedOrigins = [
  'https://demo.orderly-app.com',
  'https://admin.orderly-app.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177'
]

// Middleware
app.use(express.json())

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy does not allow access from: ${origin}`
      return callback(new Error(msg), false)
    }
    return callback(null, true)
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}))

app.options('*', cors())

// DB Connection
connectDB()

// Cron Job: dezactivează utilizatorii inactivi la fiecare 10 minute
cron.schedule('*/10 * * * *', async () => {
  console.log('Verificare utilizatori cu token-uri expirate...')
  await deactivateExpiredUsers()
})

// API Endpoints
app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/categories", categoryRouter)
app.use("/api/waiterorders", waiterRouter)
app.use("/admin", adminRouter)
app.use("/admin/personalization", customizationRoute)
app.use("/api", validateAuthRouter)

// Static files (ex: imagini produse)
app.use("/images", express.static("uploads"))

// Health check
app.get("/", (req, res) => {
  res.send("API Working")
})

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server started on http://0.0.0.0:${port}`)
})
