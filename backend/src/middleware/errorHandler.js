/**
 * Global error handler middleware
 */
const { logger } = require('../utils/logger');

/**
 * 404 handler — unknown routes
 */
function notFound(req, res, next) {
  const error = new Error(`Not Found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

/**
 * Central error handler
 */
function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  logger.error('Unhandled error', {
    status,
    method: req.method,
    url: req.originalUrl,
    message: err.message,
  });

  res.status(status).json({
    error: {
      message: isProd && status === 500 ? 'Internal Server Error' : err.message,
      status,
    },
  });
}

module.exports = { notFound, errorHandler };
