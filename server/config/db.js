const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnected = false;
let useEmbeddedFallback = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/folio';

  try {
    // Attempt Mongoose connection with a short timeout so we don't hang if Mongo isn't running locally
    console.log(`[Folio DB] Attempting connection to MongoDB at: ${uri}`);
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });

    isConnected = true;
    useEmbeddedFallback = false;
    console.log('✨ [Folio DB] Successfully connected to MongoDB.');
  } catch (err) {
    console.warn(`⚠️ [Folio DB] Local MongoDB unavailable (${err.message}).`);
    console.log('🚀 [Folio DB] Activating Folio Embedded Data Engine (server/data/folio-db.json).');
    console.log('   All features (Auth, Notes, Revisions, Mind Maps, Analytics) remain 100% persistent and functional without any external database installation required!');
    isConnected = false;
    useEmbeddedFallback = true;
  }
};

const getDBMode = () => ({
  isConnected,
  useEmbeddedFallback,
  type: isConnected ? 'mongodb' : 'embedded-json'
});

module.exports = {
  connectDB,
  getDBMode,
  isFallback: () => useEmbeddedFallback
};
