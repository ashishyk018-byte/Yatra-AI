
require('dotenv').config();

const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const vlogRoutes = require('./routes/vlogRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON requests
app.use(express.json());

// Serve frontend files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Health check API
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'TripGuide'
  });
});

// Vlog API routes
app.use('/api/vlogs', vlogRoutes);

// Frontend fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to MongoDB before starting the server
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`TripGuide running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error.message);
    process.exit(1);
  }
}

startServer();
