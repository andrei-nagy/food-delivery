// server.js - VERSIUNE ULTIMĂ
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import waiterRouter from "./routes/waiterRoute.js";
import adminRouter from "./routes/adminRoute.js";
import customizationRoute from "./routes/customizationRoute.js";
import validateAuthRouter from "./routes/validateAuthRoute.js";
import { deactivateExpiredUsers } from "./controllers/userController.js";
import splitBillRouter from './routes/splitBillRoute.js';
import cron from "node-cron";

const app = express();
const PORT = 4000;

// ====== CONFIGURARE ======
app.set('trust proxy', true);
app.use(express.json());

// CORS
app.use(cors({
  origin: [
    'https://demo.orderly-app.com',
    'https://admin.orderly-app.com', 
    'https://admin.orderly.ro',
    'https://api.orderly.ro',
    'https://demo.orderly.ro',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177'
  ],
  credentials: true
}));

// ====== MONGODB CONNECTOR CU LOGURI DETALIATE ======
let isMongoConnected = false;
let mongoConnectionAttempts = 0;

const connectMongoWithRetry = async () => {
  mongoConnectionAttempts++;
  console.log(`\n🔗 ===== MONGODB CONNECTION ATTEMPT #${mongoConnectionAttempts} =====`);
  
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error("❌ CRITICAL: MONGODB_URI not found in environment!");
    console.log("📌 Checking all environment variables:");
    Object.keys(process.env).forEach(key => {
      if (key.includes('MONGO') || key.includes('DB') || key.includes('URI')) {
        const value = process.env[key];
        const preview = value ? value.substring(0, 30) + '...' : 'empty';
        console.log(`   ${key}: ${preview}`);
      }
    });
    return false;
  }
  
  console.log("✅ MONGODB_URI found in environment");
  console.log(`📏 URI length: ${MONGODB_URI.length} characters`);
  
  // Analizează URI-ul
  try {
    const url = new URL(MONGODB_URI);
    console.log(`🔍 URI Analysis:`);
    console.log(`   Protocol: ${url.protocol}`);
    console.log(`   Hostname: ${url.hostname}`);
    console.log(`   Port: ${url.port || 'default'}`);
    console.log(`   Path: ${url.pathname}`);
    console.log(`   Search: ${url.search || 'none'}`);
  } catch (parseError) {
    console.log(`❌ Cannot parse URI: ${parseError.message}`);
  }
  
  // IMPORTANT: Forțează IPv4 și înlătură SRV dacă nu merge
  let connectionUri = MONGODB_URI;
  let connectionOptions = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 15000,
    family: 4, // FORȚAT IPv4
    maxPoolSize: 5,
    retryWrites: true,
    retryReads: true,
    // Debug options
    monitorCommands: true // Permite logging de comenzi
  };
  
  // Metode de conectare diferite
  const methods = [
    { 
      name: "Standard IPv4", 
      uri: connectionUri, 
      options: connectionOptions,
      description: "Standard MongoDB+srv with IPv4"
    },
    { 
      name: "Without SRV", 
      uri: connectionUri.replace('mongodb+srv://', 'mongodb://'), 
      options: { ...connectionOptions, srv: false },
      description: "Direct TCP connection without SRV"
    },
    { 
      name: "With explicit hosts", 
      uri: buildExplicitHostsUri(connectionUri),
      options: { ...connectionOptions, srv: false },
      description: "Using hardcoded IP addresses"
    },
    { 
      name: "IPv6 allowed", 
      uri: connectionUri, 
      options: { ...connectionOptions, family: null },
      description: "Allow both IPv4 and IPv6"
    }
  ];
  
  for (const method of methods) {
    console.log(`\n🔄 METHOD: ${method.name}`);
    console.log(`📝 ${method.description}`);
    
    // Maskează parola pentru logging
    const maskedUri = method.uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
    console.log(`📋 URI: ${maskedUri}`);
    console.log(`⚙️ Options:`, JSON.stringify(method.options, null, 2));
    
    try {
      mongoose.set('strictQuery', false);
      
      // Închide orice conexiune existentă
      if (mongoose.connection.readyState !== 0) {
        console.log(`🔌 Closing existing connection (state: ${mongoose.connection.readyState})`);
        await mongoose.disconnect();
      }
      
      console.log(`⏳ Attempting connection (timeout: ${method.options.serverSelectionTimeoutMS}ms)...`);
      const startTime = Date.now();
      
      // Adaugă event listeners pentru debug
      mongoose.connection.on('connecting', () => {
        console.log(`   📡 Event: connecting`);
      });
      
      mongoose.connection.on('connected', () => {
        console.log(`   ✅ Event: connected`);
      });
      
      mongoose.connection.on('open', () => {
        console.log(`   🔓 Event: open`);
      });
      
      mongoose.connection.on('disconnecting', () => {
        console.log(`   📡 Event: disconnecting`);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log(`   🔌 Event: disconnected`);
      });
      
      mongoose.connection.on('close', () => {
        console.log(`   🔒 Event: close`);
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log(`   🔄 Event: reconnected`);
      });
      
      mongoose.connection.on('error', (err) => {
        console.log(`   ❌ Event: error - ${err.message}`);
      });
      
      // Încearcă conexiunea
      await mongoose.connect(method.uri, method.options);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ ${method.name} SUCCESS in ${duration}ms!`);
      console.log(`📊 Connection details:`);
      console.log(`   Host: ${mongoose.connection.host}`);
      console.log(`   Port: ${mongoose.connection.port}`);
      console.log(`   Database: ${mongoose.connection.name}`);
      console.log(`   Ready State: ${mongoose.connection.readyState}`);
      console.log(`   Model count: ${Object.keys(mongoose.models).length}`);
      
      // Testează conexiunea cu un ping
      try {
        const pingResult = await mongoose.connection.db.admin().ping();
        console.log(`   🏓 Ping test: ${JSON.stringify(pingResult)}`);
      } catch (pingError) {
        console.log(`   ⚠️ Ping failed: ${pingError.message}`);
      }
      
      isMongoConnected = true;
      
      return true;
      
    } catch (error) {
      const endTime = Date.now();
            const startTime = Date.now();

      const duration = endTime - startTime;
      
      console.log(`❌ ${method.name} FAILED after ${duration}ms`);
      console.log(`   Error name: ${error.name}`);
      console.log(`   Error message: ${error.message}`);
      console.log(`   Error code: ${error.code || 'N/A'}`);
      
      // Log detalii suplimentare pentru anumite erori
      if (error.name === 'MongoServerSelectionError') {
        console.log(`   🔍 Server selection failed details:`);
        if (error.reason) {
          console.log(`      Type: ${error.reason.type}`);
          console.log(`      Servers: ${error.reason.servers?.size || 0}`);
        }
      }
      
      if (error.message.includes('whitelist') || error.message.includes('network access')) {
        console.log(`\n   🚨 IP WHITELIST ISSUE DETECTED!`);
        console.log(`   Current whitelist in MongoDB Atlas should include:`);
        console.log(`   1. Your server IP (from /api/my-ip)`);
        console.log(`   2. The 3 IPs Hostico mentioned: 65.62.241.107, .127, .116`);
        console.log(`   3. Plus any IPs from DNS resolution`);
        
        // Obține IP-urile actuale din DNS
        try {
          const dns = await import('dns/promises');
          console.log(`   🔍 Current DNS resolution for MongoDB:`);
          const hosts = [
            'cluster0.bvfdufd.mongodb.net',
            'ac-eu3t3dn-shard-00-00.bvfdufd.mongodb.net'
          ];
          for (const host of hosts) {
            try {
              const addresses = await dns.resolve4(host);
              console.log(`      ${host}: ${addresses.join(', ')}`);
            } catch (dnsError) {
              console.log(`      ${host}: DNS error - ${dnsError.message}`);
            }
          }
        } catch (dnsImportError) {
          console.log(`   🔍 Cannot check DNS: ${dnsImportError.message}`);
        }
      }
      
      if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        console.log(`   🔍 DNS resolution error detected`);
        console.log(`   The hostname cannot be resolved to IP addresses`);
        console.log(`   Try: nslookup cluster0.bvfdufd.mongodb.net`);
      }
      
      if (error.message.includes('timed out') || error.message.includes('timeout')) {
        console.log(`   ⏰ Timeout error - connection took too long`);
        console.log(`   This usually means:`);
        console.log(`   1. Firewall blocking the connection`);
        console.log(`   2. Network routing issues`);
        console.log(`   3. MongoDB servers not responding`);
      }
      
      // Detașează conexiunea
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
      } catch (disconnectError) {
        // Ignoră erori la deconectare
      }
    }
  }
  
  console.log("\n❌ ALL CONNECTION METHODS FAILED");
  console.log("📊 SUMMARY:");
  console.log(`   Attempts: ${mongoConnectionAttempts}`);
  console.log(`   MongoDB URI: ${MONGODB_URI ? 'Set' : 'Not set'}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`   Server IP: ${await getServerIP()}`);
  
  console.log("\n🔧 TROUBLESHOOTING STEPS:");
  console.log("1. ✅ Check MongoDB Atlas whitelist has ALL required IPs");
  console.log("2. ✅ Ask Hostico to verify firewall rules are active");
  console.log("3. ✅ Test with: telnet 65.62.241.107 27017 from server");
  console.log("4. ✅ Consider using SQLite as fallback database");
  
  isMongoConnected = false;
  return false;
};

// Funcție helper pentru URI cu host-uri explicite
function buildExplicitHostsUri(originalUri) {
  try {
    const url = new URL(originalUri);
    const hosts = [
      'ac-eu3t3dn-shard-00-00.bvfdufd.mongodb.net:27017',
      'ac-eu3t3dn-shard-00-01.bvfdufd.mongodb.net:27017',
      'ac-eu3t3dn-shard-00-02.bvfdufd.mongodb.net:27017'
    ];
    
    return `mongodb://${url.username}:${url.password}@${hosts.join(',')}${url.pathname}${url.search}`;
  } catch (error) {
    return originalUri.replace('mongodb+srv://', 'mongodb://');
  }
}

// Funcție pentru a obține IP-ul serverului
async function getServerIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'Unknown';
  }
}

// ====== ENDPOINT SUPLIMENTAR PENTRU DIAGNOSTICARE ======
app.get('/api/mongo-debug', async (req, res) => {
  try {
    // Test DNS
    const dns = await import('dns/promises');
    const hosts = [
      'cluster0.bvfdufd.mongodb.net',
      'ac-eu3t3dn-shard-00-00.bvfdufd.mongodb.net',
      'ac-eu3t3dn-shard-00-01.bvfdufd.mongodb.net',
      'ac-eu3t3dn-shard-00-02.bvfdufd.mongodb.net'
    ];
    
    const dnsResults = [];
    for (const host of hosts) {
      try {
        const addresses = await dns.resolve4(host);
        dnsResults.push({ host, success: true, addresses });
      } catch (dnsError) {
        dnsResults.push({ host, success: false, error: dnsError.message });
      }
    }
    
    // Test port connectivity
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const portTests = [];
    const testIPs = ['65.62.241.107', '65.62.241.127', '65.62.241.116'];
    
    for (const ip of testIPs) {
      try {
        await execAsync(`timeout 3 nc -z ${ip} 27017`);
        portTests.push({ ip, port: 27017, status: 'OPEN' });
      } catch (error) {
        portTests.push({ ip, port: 27017, status: 'CLOSED/BLOCKED' });
      }
    }
    
    res.json({
      success: true,
      timestamp: new Date(),
      mongoDB: {
        connected: isMongoConnected,
        state: mongoose.connection?.readyState || 0,
        stateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection?.readyState || 0],
        attempts: mongoConnectionAttempts
      },
      dnsResolution: dnsResults,
      portTests: portTests,
      serverIP: await getServerIP(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoURI: !!process.env.MONGODB_URI,
        mongoURILength: process.env.MONGODB_URI?.length || 0
      },
      instructions: [
        '1. Check ALL IPs from DNS resolution are in MongoDB whitelist',
        '2. Ask Hostico to verify firewall allows these IPs: ' + testIPs.join(', '),
        '3. If ports are CLOSED, Hostico firewall is blocking',
        '4. Consider SQLite fallback if MongoDB continues to fail'
      ]
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ====== MIDDLEWARE CU FALLBACK ======
app.use((req, res, next) => {
  // Allow debug endpoints always
  const publicEndpoints = [
    '/', '/api/test', '/api/my-ip', '/api/db-status',
    '/images', '/api/health', '/api/network-info'
  ];
  
  const isPublic = publicEndpoints.some(endpoint => req.path.startsWith(endpoint));
  
  if (isPublic) {
    return next();
  }
  
  // For other endpoints, check MongoDB
  if (!isMongoConnected && req.path.startsWith('/api/')) {
    console.log(`⛔ Blocking ${req.path} - MongoDB offline`);
    
    // Return mock data for GET requests
    if (req.method === 'GET') {
      return res.json({
        success: true,
        data: getMockData(req.path),
        demo: true,
        message: "Running in demo mode - MongoDB disconnected",
        instructions: [
          "Visit /api/my-ip to get server IP",
          "Add IP to MongoDB Atlas whitelist",
          "Restart app after 5 minutes"
        ]
      });
    }
    
    // For POST/PUT/DELETE, return error
    return res.status(503).json({
      success: false,
      error: "Database unavailable",
      message: "MongoDB connection failed. Please contact support.",
      retryUrl: "/api/db-status"
    });
  }
  
  next();
});

// Mock data function
function getMockData(path) {
  if (path.includes('/api/food')) {
    return [
      { _id: "1", name: "Pizza Margherita", price: 25, category: "Pizza", image: "/images/pizza.jpg" },
      { _id: "2", name: "Burger Classic", price: 20, category: "Burger", image: "/images/burger.jpg" },
      { _id: "3", name: "Caesar Salad", price: 18, category: "Salad", image: "/images/salad.jpg" }
    ];
  }
  
  if (path.includes('/api/categories')) {
    return ["Pizza", "Burger", "Salad", "Drinks", "Dessert"];
  }
  
  return { message: "Demo data", path: path };
}

// ====== DEBUG ENDPOINTS ======
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server OK',
    mongoDB: isMongoConnected ? '✅ Connected' : '❌ Disconnected',
    time: new Date().toISOString()
  });
});

app.get('/api/my-ip', async (req, res) => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    
    res.json({
      success: true,
      serverIp: data.ip,
      timestamp: new Date(),
      critical: `ADD THIS TO MONGODB ATLAS: ${data.ip}/32`,
      steps: [
        `1. Copy: ${data.ip}/32`,
        "2. MongoDB Atlas → Security → Network Access",
        "3. ADD IP ADDRESS",
        "4. Paste the IP",
        "5. Click CONFIRM (important!)",
        "6. Wait 5 minutes",
        "7. Restart app in cPanel"
      ]
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      fallbackIp: req.ip
    });
  }
});

app.get('/api/db-status', (req, res) => {
  res.json({
    mongoConnected: isMongoConnected,
    connectionState: mongoose.connection?.readyState || 0,
    stateMeaning: {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    }[mongoose.connection?.readyState || 0],
    attempts: mongoConnectionAttempts,
    timestamp: new Date()
  });
});

app.get('/api/network-info', async (req, res) => {
  try {
    const os = await import('os');
    const nets = os.default.networkInterfaces();
    
    const ips = [];
    for (const name in nets) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          ips.push(`${name}: ${net.address}`);
        }
      }
    }
    
    res.json({
      serverIPs: ips,
      requestIP: req.ip,
      forwardedFor: req.headers['x-forwarded-for']
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// ====== ROUTES ======
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/waiterorders", waiterRouter);
app.use("/admin", adminRouter);
app.use("/admin/personalization", customizationRoute);
app.use("/api", validateAuthRouter);
app.use('/api/split-bill', splitBillRouter);

// Static files
app.use("/images", express.static("uploads"));

// Home page
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Orderly API</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .card { 
          background: #f5f5f5; 
          padding: 20px; 
          margin: 20px 0; 
          border-radius: 8px;
          border-left: 4px solid ${isMongoConnected ? '#4CAF50' : '#f44336'};
        }
        code { background: #eee; padding: 2px 6px; border-radius: 3px; }
        a { color: #2196F3; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>🚀 Orderly API</h1>
      
      <div class="card">
        <h2>Database Status: 
          <span class="${isMongoConnected ? 'success' : 'error'}">
            ${isMongoConnected ? '✅ CONNECTED' : '❌ DISCONNECTED'}
          </span>
        </h2>
        <p>Connection attempts: ${mongoConnectionAttempts}</p>
        <p>Server time: ${new Date()}</p>
      </div>
      
      <h2>Debug Endpoints:</h2>
      <ul>
        <li><a href="/api/test">/api/test</a> - Basic status</li>
        <li><a href="/api/my-ip">/api/my-ip</a> - <strong>GET SERVER IP FOR MONGODB</strong></li>
        <li><a href="/api/db-status">/api/db-status</a> - Database connection details</li>
        <li><a href="/api/network-info">/api/network-info</a> - Network information</li>
      </ul>
      
      ${!isMongoConnected ? `
      <div class="card" style="background: #fff3cd; border-left-color: #ff9800;">
        <h2>⚠️ ACTION REQUIRED</h2>
        <p>MongoDB is not connected. Follow these steps:</p>
        <ol>
          <li>Click <a href="/api/my-ip" target="_blank">/api/my-ip</a> to get your server IP</li>
          <li>Go to <a href="https://cloud.mongodb.com" target="_blank">MongoDB Atlas</a></li>
          <li>Navigate to <strong>Security → Network Access</strong></li>
          <li>Add your IP in format: <code>IP_ADDRESS/32</code></li>
          <li><strong>Click CONFIRM button</strong> (important!)</li>
          <li>Wait 5 minutes for propagation</li>
          <li>Restart this application in cPanel</li>
        </ol>
        <p><strong>Quick test:</strong> Add <code>0.0.0.0/0</code> temporarily to see if it works.</p>
      </div>
      ` : ''}
    </body>
    </html>
  `);
});

// ====== START SERVER ======
const startServer = async () => {
  console.log('=== ORDERLY API STARTING ===');
  console.log(`Port: ${PORT}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
  
  // Try to connect to MongoDB
  await connectMongoWithRetry();
  
  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server started: http://0.0.0.0:${PORT}`);
    console.log(`🌐 Public URL: https://api.orderly.ro`);
    console.log(`📊 MongoDB: ${isMongoConnected ? '✅ Connected' : '❌ Disconnected'}`);
    
    if (!isMongoConnected) {
      console.log('\n⚠️  CRITICAL: MongoDB not connected!');
      console.log('📌 Get your IP: https://api.orderly.ro/api/my-ip');
      console.log('📌 Add it to MongoDB Atlas whitelist');
      console.log('📌 Or contact Hostico about MongoDB access');
    }
  });
  
  // Setup retry mechanism for MongoDB
  setInterval(async () => {
    if (!isMongoConnected && mongoConnectionAttempts < 5) {
      console.log('\n🔄 Retrying MongoDB connection...');
      await connectMongoWithRetry();
    }
  }, 30000); // Retry every 30 seconds
  
  // Setup cron only if MongoDB is connected
  if (isMongoConnected) {
    cron.schedule('*/1 * * * *', async () => {
      console.log('🕓 Checking expired users...');
      try {
        await deactivateExpiredUsers();
      } catch (error) {
        console.error('Cron job error:', error.message);
      }
    });
  }
};

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});