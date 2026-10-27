require('dotenv').config();
const mongoose = require('mongoose');
const net = require('net');

const uri = process.env.MONGODB_URI;
console.log('Testing MongoDB Atlas connection...');
console.log('URI:', uri ? uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') : 'UNDEFINED');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000
}).then(() => {
  console.log('\n======================================================');
  console.log('✅ Connection to MongoDB Atlas SUCCESSFUL!');
  console.log('   Cluster Host: ', mongoose.connection.host);
  console.log('   Database Name:', mongoose.connection.name);
  console.log('   ReadyState:   ', mongoose.connection.readyState, '(Connected)');
  console.log('======================================================\n');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Connection to MongoDB Atlas FAILED!');
  console.error('   Error Message:', err.message);

  console.log('\n🔍 Running network diagnostics on port 27017...');
  const testSocket = new net.Socket();
  testSocket.setTimeout(4000);
  testSocket.connect(27017, 'portquiz.net', () => {
    console.log('   ✅ Outbound port 27017 is open.');
    console.log('   💡 Check if your IP is whitelisted in MongoDB Atlas or if password has special characters.');
    testSocket.destroy();
    process.exit(1);
  });
  testSocket.on('timeout', () => {
    console.log('\n🚫 DIAGNOSTIC RESULT: CAMPUS / LOCAL WI-FI IS BLOCKING PORT 27017');
    console.log('   College campus networks (such as 14.139.*.*) block non-standard database ports like 27017.');
    console.log('   📱 WORKAROUND: Connect your laptop to a Mobile Hotspot (phone cellular data).');
    console.log('   🌐 IN ATLAS: In Network Access, click "+ ADD IP ADDRESS" -> choose "0.0.0.0/0 (Allow Access from Anywhere)".\n');
    testSocket.destroy();
    process.exit(1);
  });
  testSocket.on('error', () => {
    testSocket.destroy();
    process.exit(1);
  });
});
