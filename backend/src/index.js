/**
 * VoteWise AI Backend — Express Server Entry Point
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { logger } = require('./utils/logger');
const { validateEnv } = require('./utils/envValidator');
const { initializeFirebase } = require('./config/firebase');
const { globalLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes/api');

// Validate environment
validateEnv();

const app = express();
const PORT = process.env.PORT || 8080;

// ─── Security ──────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'maps.googleapis.com', 'www.googletagmanager.com'],
      connectSrc: ["'self'", 'wss:', '*.firebaseio.com', '*.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'maps.gstatic.com', '*.googleusercontent.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
    },
  },
}));
app.disable('x-powered-by');

// ─── CORS ──────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Parsers ───────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.raw({ type: 'audio/*', limit: '10mb' }));

// ─── Rate Limiting ─────────────────────────────────────────
app.use(globalLimiter);

// ─── Routes ────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── Error Handling ────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Initialize Firebase & Start Server ────────────────────
let server;
async function startServer() {
  try {
    initializeFirebase();
    server = app.listen(PORT, () => {
      logger.info(`VoteWise AI backend running on port ${PORT}`, {
        env: process.env.NODE_ENV || 'development',
        port: PORT,
      });
    });
    return server;
  } catch (error) {
    logger.error('Server startup failed', error);
    process.exit(1);
  }
}

// Only start if this is the main module (not imported for testing)
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
