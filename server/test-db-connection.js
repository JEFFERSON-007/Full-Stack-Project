const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/folio';

console.log('Testing connection to local MongoDB Community Server...');
console.log('Target URI:', uri);

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 4000,
  connectTimeoutMS: 4000
}).then(async (conn) => {
  console.log('\n======================================================');
  console.log('✅ Local MongoDB Community Server is RUNNING & CONNECTED!');
  console.log('   Host:          ', conn.connection.host);
  console.log('   Port:          ', conn.connection.port);
  console.log('   Database:      ', conn.connection.name);
  console.log('   ReadyState:    ', conn.connection.readyState, '(1 = Connected)');

  // Query server status for version
  try {
    const adminDb = conn.connection.db.admin();
    const buildInfo = await adminDb.buildInfo();
    console.log('   MongoDB Version:', buildInfo.version);
    console.log('   Platform:       ', buildInfo.targetMinOS || 'Windows');
  } catch (e) {
    console.log('   (Admin buildInfo skipped)');
  }

  // Count existing records in folio database
  const collections = await conn.connection.db.listCollections().toArray();
  console.log('\n📦 Existing Collections in "folio" Database:');
  for (const c of collections) {
    const count = await conn.connection.db.collection(c.name).countDocuments();
    console.log(`   - ${c.name.padEnd(16)}: ${count} documents`);
  }
  console.log('======================================================\n');
  process.exit(0);
}).catch((err) => {
  console.error('\n❌ Failed to connect to local MongoDB server!');
  console.error('   Error:', err.message);
  console.error('\n⚠️  Troubleshooting local MongoDB:');
  console.error('   1. Verify MongoDB Community Server is installed on Windows.');
  console.error('   2. Start the Windows service: net start MongoDB');
  console.error('   3. Or check Services (services.msc) -> "MongoDB Server" status.');
  process.exit(1);
});
