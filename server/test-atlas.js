require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
console.log('Testing MongoDB Atlas connection...');
console.log('URI:', uri ? uri.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000
}).then(() => {
  console.log('✅ Connection to MongoDB Atlas SUCCESSFUL!');
  console.log('Cluster Host:', mongoose.connection.host);
  console.log('Database Name:', mongoose.connection.name);
  console.log('ReadyState:', mongoose.connection.readyState);
  process.exit(0);
}).catch(err => {
  console.error('❌ Connection to MongoDB Atlas FAILED!');
  console.error('Error Message:', err.message);
  if (err.reason) console.error('Reason:', err.reason);
  process.exit(1);
});
