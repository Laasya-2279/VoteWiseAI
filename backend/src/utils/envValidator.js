/**
 * Environment variable validator — throws on startup if critical vars are missing.
 */
const { logger } = require('./logger');

const REQUIRED_VARS = [
  'FIREBASE_PROJECT_ID',
  'GOOGLE_CLOUD_PROJECT',
];

const OPTIONAL_VARS = [
  'PORT',
  'NODE_ENV',
  'CORS_ORIGIN',
  'FIREBASE_DATABASE_URL',
  'VERTEX_AI_LOCATION',
  'VERTEX_AI_MODEL',
  'GOOGLE_TTS_VOICE_NAME',
  'GOOGLE_TTS_LANGUAGE_CODE',
  'GOOGLE_STT_LANGUAGE_CODE',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX',
  'VOICE_RATE_LIMIT_MAX',
];

/**
 * Validate environment variables on startup
 * @throws {Error} If required variables are missing
 */
function validateEnv() {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error(msg);
    throw new Error(msg);
  }

  const presentOptional = OPTIONAL_VARS.filter((v) => process.env[v]);
  logger.info('Environment validated', {
    required: REQUIRED_VARS.length,
    optional: `${presentOptional.length}/${OPTIONAL_VARS.length}`,
  });
}

module.exports = { validateEnv, REQUIRED_VARS, OPTIONAL_VARS };
