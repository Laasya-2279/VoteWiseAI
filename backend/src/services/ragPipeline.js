const { generateEmbedding } = require('./embeddingService');
const { retrieveTopK } = require('./retrieverService');
const { buildPrompt } = require('./promptBuilder');
const { generateWithRetry } = require('./llmService');
const { logger } = require('../utils/logger');

/**
 * The unified modular RAG Pipeline.
 */
async function ragPipeline(query, intent = 'unknown') {
  const result = {
    response: '',
    intent,
    source: 'election_knowledge',
    chunksUsed: [],
    confidence: 0,
  };

  try {
    // 1. Receive user query
    if (!query || query.trim().length === 0) {
      result.response = "Please provide a valid question.";
      return result;
    }

    // 2. Generate embedding
    const embedding = await generateEmbedding(query);
    
    // 3. Retrieve top-k documents & 4. Rank and filter
    const documents = await retrieveTopK(embedding, 3);
    
    if (documents.length === 0) {
      // Fallback: graceful message if retrieval fails
      result.response = "I don't know the answer to that based on the available context. Please try rephrasing.";
      result.source = 'no_context';
      return result;
    }
    
    // 5. Construct grounded prompt
    const prompt = buildPrompt(query, documents);
    
    // 6. Call Gemini API
    try {
      // If Gemini fails -> retry once
      const llmResponse = await generateWithRetry(prompt, 1);
      
      // 7. Return response
      result.response = llmResponse;
      result.chunksUsed = documents.map(d => d.id || d.title);
      result.confidence = Math.min(documents.length / 3, 1);
      
    } catch (llmError) {
      logger.error('LLM generation failed, falling back to safe response', llmError);
      // Fallback: return safe response if LLM completely fails
      result.response = documents.map(c => `**${c.title || c.id}**: ${c.content}`).join('\n\n');
      result.source = 'fallback_chunks';
      result.chunksUsed = documents.map(d => d.id || d.title);
      result.confidence = 0.3;
    }
    
  } catch (err) {
    logger.error('RAG Pipeline failed entirely', err);
    result.response = "I'm currently unable to retrieve information. Please try again later.";
    result.source = 'error';
  }
  
  return result;
}

module.exports = { ragPipeline };
