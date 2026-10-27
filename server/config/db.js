const mongoose = require('mongoose');

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
  console.log(`[Folio DB] Connecting to MongoDB Atlas at: ${maskedUri}`);

  mongoose.set('strictQuery', false);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });

    isConnected = true;
    console.log(`✨ [Folio DB] Successfully connected to MongoDB Atlas.`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);
    console.log(`   Ready State: Connected (1)`);
    return conn;
  } catch (err) {
    isConnected = false;
    console.error(`❌ [Folio DB] MongoDB Atlas connection failed.`);
    console.error(`   Error: ${err.message}`);

    if (err.message.includes('whitelist') || err.message.includes('Could not connect to any servers')) {
      console.error(`\n⚠️  [Atlas Network Access Notice]`);
      console.error(`   Your current IP address is not whitelisted in MongoDB Atlas.`);
      console.error(`   Go to MongoDB Atlas Console -> Network Access -> Add IP Address -> 'Allow Access from Anywhere' (0.0.0.0/0) or add your current IP.`);
    }

    throw err;
  }
};

const getDBMode = () => ({
  isConnected,
  useEmbeddedFallback: false,
  type: isConnected ? 'mongodb-atlas' : 'disconnected',
  host: mongoose.connection?.host || null,
  name: mongoose.connection?.name || null
});

module.exports = {
  connectDB,
  getDBMode,
  isFallback: () => !isConnected
};
