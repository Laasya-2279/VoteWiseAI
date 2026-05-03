/**
 * @fileoverview Embedding Service for VoteWise AI.
 * Generates vector-like keyword representations of text for retrieval.
 * @module embeddingService
 */

const { logger } = require('../utils/logger');

/**
 * Generate an embedding for the given text.
 * Uses a local keyword extraction approach to simulate vectors.
 * @param {string} text - Input text
 * @returns {Promise<string[]>} List of keywords
 */
async function generateEmbedding(text) {
  try {
    const keywords = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);
      
    logger.info('Generated local embedding (keywords)', { count: keywords.length });
    return keywords;
  } catch (error) {
    logger.error('Embedding generation failed', error);
    return [];
  }
}

module.exports = { generateEmbedding };

