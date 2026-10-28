const mongoose = require('mongoose');
const dns = require('dns');

// Ensure reliable SRV resolution on cellular and hotspot connections
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    const errorMsg = 'MONGODB_URI is not defined in server/.env';
    console.error(`❌ [Folio DB] Configuration error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Mask credentials for secure logging
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  const isAtlas = uri.includes('mongodb+srv') || uri.includes('cluster');
  console.log(`[Folio DB] Connecting to ${isAtlas ? 'MongoDB Atlas' : 'MongoDB (Local / Compass)'} at: ${maskedUri}`);

  mongoose.set('strictQuery', false);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });

    isConnected = true;
    console.log(`✨ [Folio DB] Successfully connected to ${isAtlas ? 'MongoDB Atlas' : 'MongoDB (Local / Compass)'}.`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);
    console.log(`   Ready State: Connected (1)`);
    return conn;
  } catch (err) {
    isConnected = false;
    console.error(`❌ [Folio DB] MongoDB connection failed.`);
    console.error(`   Error: ${err.message}`);

    if (err.message.includes('whitelist') || err.message.includes('Could not connect to any servers')) {
      console.error(`\n⚠️  [Atlas Network Access Notice]`);
      console.error(`   Your current IP address is not whitelisted in MongoDB Atlas.`);
      console.error(`   Go to MongoDB Atlas Console -> Network Access -> Add IP Address -> 'Allow Access from Anywhere' (0.0.0.0/0) or add your current IP.`);
    }

    throw err;
  }
};

const getDBMode = () => {
  const uri = process.env.MONGODB_URI || '';
  const isAtlas = uri.includes('mongodb+srv') || uri.includes('cluster');
  return {
    isConnected,
    useEmbeddedFallback: false,
    type: isConnected ? (isAtlas ? 'mongodb-atlas' : 'mongodb-local') : 'disconnected',
    host: mongoose.connection?.host || null,
    name: mongoose.connection?.name || null
  };
};

module.exports = {
  connectDB,
  getDBMode,
  isFallback: () => !isConnected
};
