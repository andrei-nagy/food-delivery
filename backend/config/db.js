// config/db.js
import mongoose from 'mongoose';

export const connectDB = async () => {
  console.log('\n=== MONGODB CONNECTION ATTEMPT ===');
  
  // Folosește variabila de mediu din cPanel
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ CRITICAL: MONGODB_URI not found in environment variables!');
    console.error('❌ Please set MONGODB_URI in cPanel Environment Variables');
    return;
  }
  
  console.log('✅ MONGODB_URI found in environment');
  console.log('📊 URI length:', MONGODB_URI.length);
  
  // Opțiuni moderne pentru mongoose (fără useNewUrlParser și useUnifiedTopology)
  const options = {
    serverSelectionTimeoutMS: 30000,  // 30 secunde
    socketTimeoutMS: 45000,           // 45 secunde
    connectTimeoutMS: 30000,          // 30 secunde
    family: 4,                        // Forțează IPv4
    maxPoolSize: 50,
    minPoolSize: 10,
    maxIdleTimeMS: 60000,
    retryWrites: true,
    retryReads: true,
  };
  
  try {
    mongoose.set('strictQuery', false);
    
    console.log('🔗 Connecting to MongoDB Atlas...');
    console.log('📍 Using URI (masked):', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'));
    
    await mongoose.connect(MONGODB_URI, options);
    
    console.log('✅ MongoDB connected successfully!');
    console.log(`📊 Host: ${mongoose.connection.host}`);
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`📊 Ready state: ${mongoose.connection.readyState}`);
    
    // Verifică conexiunea periodic
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Dacă este eroare de IP, oferă instrucțiuni detaliate
    if (error.message.includes('IP that isn\'t whitelisted') || error.message.includes('network access')) {
      console.error('\n=== IMPORTANT IP WHITELIST INSTRUCTIONS ===');
      console.error('1. Go to https://api.orderly.ro/api/my-ip to get your server IP');
      console.error('2. Login to MongoDB Atlas → Security → Network Access');
      console.error('3. Click "ADD IP ADDRESS"');
      console.error('4. Add your IP in format: IP_ADDRESS/32 (example: 185.xxx.xxx.xxx/32)');
      console.error('5. Wait 2-3 minutes, then restart the app in cPanel');
    }
    
    console.error('Full error object:', error);
    
    // Nu opri aplicația, permite endpoint-urile de debug
    console.log('⚠️  App continues running in degraded mode');
    return null;
  }
};