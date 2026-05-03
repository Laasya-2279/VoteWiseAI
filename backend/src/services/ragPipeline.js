/**
 * @fileoverview Unified RAG Pipeline for VoteWise AI.
 * Orchestrates embedding generation, document retrieval, and LLM grounding.
 * @module ragPipeline
 */

const { generateEmbedding } = require('./embeddingService');
const { retrieveTopK } = require('./retrieverService');
const { buildPrompt } = require('./promptBuilder');
const { generateWithRetry } = require('./llmService');
const { logger } = require('../utils/logger');
const { INTENT_TYPES } = require('../utils/constants');

/**
 * Validates the user query input.
 * @param {string} query - Raw user query
 * @returns {boolean} True if valid
 */
const isValidQuery = (query) => typeof query === 'string' && query.trim().length > 0;

/**
 * Handles LLM generation with fallback to source documents if generation fails.
 * @param {string} query - User query
 * @param {Array} documents - Retrieved documents
 * @returns {Promise<Object>} Formatted result object
 */
const generateResponse = async (query, documents) => {
  try {
    const prompt = buildPrompt(query, documents);
    const llmResponse = await generateWithRetry(prompt, 1);

    return {
      response: llmResponse,
      chunksUsed: documents.map((d) => d.id || d.title || 'unknown'),
      confidence: Math.min(documents.length / 3, 1),
    };
  } catch (llmError) {
    logger.error('LLM generation failed, falling back to safe response', llmError);
    return {
      response: documents.map((c) => `**${c.title || c.id || 'Source'}**: ${c.content}`).join('\n\n'),
      source: 'fallback_chunks',
      chunksUsed: documents.map((d) => d.id || d.title || 'unknown'),
      confidence: 0.3,
    };
  }
};

/**
 * The unified modular RAG Pipeline.
 * @param {string} query - User query text
 * @param {string} [intent=INTENT_TYPES.UNKNOWN] - Classified intent
 * @returns {Promise<{response: string, intent: string, source: string, chunksUsed: string[], confidence: number}>}
 */
const ragPipeline = async (query, intent = INTENT_TYPES.UNKNOWN) => {
  const result = {
    response: '',
    intent,
    source: 'election_knowledge',
    chunksUsed: [],
    confidence: 0,
  };

  try {
    if (!isValidQuery(query)) {
      result.response = 'Please provide a valid question.';
      return result;
    }

    const embedding = await generateEmbedding(query);
    const documents = await retrieveTopK(embedding, 3);

    if (!documents || documents.length === 0) {
      result.response = "I don't know the answer to that based on the available context. Please try rephrasing.";
      result.source = 'no_context';
      return result;
    }

    const output = await generateResponse(query, documents);
    
    result.response = output.response;
    result.chunksUsed = output.chunksUsed || [];
    result.confidence = output.confidence || 0;
    if (output.source) {
      result.source = output.source;
    }

  } catch (err) {
    logger.error('RAG Pipeline failed entirely', err);
    result.response = "I'm currently unable to retrieve information. Please try again later.";
    result.source = 'error';
  }

  return result;
};

module.exports = { ragPipeline };


