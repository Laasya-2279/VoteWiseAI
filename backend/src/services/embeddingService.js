const { logger } = require('../utils/logger');

/**
 * Generate an embedding for the given text.
 * Uses a local embedding fallback (keyword extraction) to act as a vector,
 * avoiding dependency on paid embedding APIs while maintaining structure.
 */
async function generateEmbedding(text) {
  const keywords = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);
    
  logger.info('Generated local embedding (keywords)', { count: keywords.length });
  return keywords;
}

module.exports = { generateEmbedding };
