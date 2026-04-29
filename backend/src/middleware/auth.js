/**
 * Firebase Auth middleware — verifies Bearer token on protected routes
 */
const { getAuth } = require('../config/firebase');
const { logger } = require('../utils/logger');

/**
 * Verify Firebase ID token from Authorization header
 */
async function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing Bearer token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Auth token verification failed', { message: error.message });
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

module.exports = { verifyAuth };
