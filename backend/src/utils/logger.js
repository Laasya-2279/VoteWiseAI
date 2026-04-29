/**
 * Logger utility — replaces all console.log usage in production code.
 * Structured JSON logging with severity levels.
 */
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = process.env.NODE_ENV === 'test'
  ? LOG_LEVELS.ERROR
  : LOG_LEVELS.DEBUG;

/**
 * Sanitize data to prevent logging sensitive information
 * @param {*} data - Data to sanitize
 * @returns {*} Sanitized data
 */
function sanitize(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  const sensitiveKeys = ['password', 'token', 'authorization', 'cookie', 'secret', 'key', 'apiKey', 'api_key'];
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  for (const k of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
      sanitized[k] = '[REDACTED]';
    } else if (typeof sanitized[k] === 'object' && sanitized[k] !== null) {
      sanitized[k] = sanitize(sanitized[k]);
    }
  }
  return sanitized;
}

function formatMessage(level, message, meta) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta: sanitize(meta) } : {}),
  });
}

const logger = {
  debug(message, meta) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      process.stdout.write(formatMessage('DEBUG', message, meta) + '\n');
    }
  },
  info(message, meta) {
    if (currentLevel <= LOG_LEVELS.INFO) {
      process.stdout.write(formatMessage('INFO', message, meta) + '\n');
    }
  },
  warn(message, meta) {
    if (currentLevel <= LOG_LEVELS.WARN) {
      process.stderr.write(formatMessage('WARN', message, meta) + '\n');
    }
  },
  error(message, meta) {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      const logMeta = meta instanceof Error
        ? { error: meta.message, stack: meta.stack }
        : meta;
      process.stderr.write(formatMessage('ERROR', message, logMeta) + '\n');
    }
  },
};

module.exports = { logger, sanitize, LOG_LEVELS };
