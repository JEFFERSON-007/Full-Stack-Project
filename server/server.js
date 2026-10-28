const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB, getDBMode } = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth.routes');
const notesRoutes = require('./routes/notes.routes');
const collectionsRoutes = require('./routes/collections.routes');
const mindmapsRoutes = require('./routes/mindmaps.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// System Health & Diagnostics Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDBMode();
  res.json({
    status: 'ok',
    name: 'Folio API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/mindmaps', mindmapsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Folio Server Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server strictly after database connection
const startServer = async () => {
  try {
    // 1. Establish connection to MongoDB first
    await connectDB();

    // 2. Start Express listener only after successful database connection
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🌿 Folio Personal Knowledge Workspace Server Running`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🛠️  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error(`\n🛑 Server startup aborted: Failed to establish MongoDB connection.`);
    console.error(`   Error details: ${err.message}`);
    console.error(`   Please ensure local MongoDB Community Server is running on port 27017 or verify server/.env.\n`);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
