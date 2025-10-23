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
import dotenv from "dotenv"

// 🔥 ADAUGĂ ACEST COD PENTRU A FORȚA RELOAD
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Funcție pentru a șterge cache-ul modulelor
const clearModuleCache = () => {
  console.log("🧹 Clearing module cache...");
  Object.keys(require.cache).forEach((key) => {
    // Șterge cache doar pentru fișierele noastre, nu node_modules
    if (key.includes('/controllers/') || key.includes('/routes/')) {
      delete require.cache[key];
      console.log(`🗑️  Cleared cache for: ${key.split('/').pop()}`);
    }
  });
};

// Apelează imediat la start
clearModuleCache();

dotenv.config()

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

// CORS Config
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true)
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    } else {
      console.log(`❌ CORS blocked request from: ${origin}`)
      return callback(new Error('Not allowed by CORS'), false)
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*'],
  credentials: true,
  optionsSuccessStatus: 204
}

app.use(cors(corsOptions))

// DB Connection
connectDB()

// Cron Job
cron.schedule('*/1 * * * *', async () => {
  console.log('🕓 Verificare utilizatori cu token-uri expirate...')
  await deactivateExpiredUsers()
})

// 🔥 ENDPOINT PENTRU RELOAD MANUAL (development)
app.post("/api/reload", (req, res) => {
  clearModuleCache();
  
  // Reimportează modulele pentru a forța reîncărcarea
  import('./routes/cartRoute.js')
    .then(() => console.log("✅ Cart routes reloaded"))
    .catch(err => console.error("❌ Error reloading cart routes:", err));
    
  res.json({ success: true, message: "Server modules reloaded" });
});

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

// Static files
app.use("/images", express.static("uploads"))

// Health Check
app.get("/", (req, res) => {
  res.send("API Working - CART CONTROLLER UPDATED!")
})

// Start Server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀🚀🚀 SERVER STARTED WITH UPDATED CART CONTROLLER! 🚀🚀🚀`)
  console.log(`🚀 Server started on http://0.0.0.0:${port}`)
})