/**
 * RAG Engine — Retrieval-Augmented Generation using Vertex AI + Firestore
 *
 * retrieveChunks: embeds query via Vertex AI, searches Firestore for relevant chunks
 * generateGroundedResponse: sends query + chunks to Gemini with strict grounding prompt
 */
const { logger } = require('../utils/logger');

let aiplatform;
let predictionClient;
let generativeModel;

/**
 * Initialize Vertex AI clients lazily
 */
function getVertexClients() {
  if (!aiplatform) {
    const { VertexAI } = require('@google-cloud/vertexai');
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.VERTEX_AI_LOCATION || 'asia-south1';

    const vertexAI = new VertexAI({ project, location });
    generativeModel = vertexAI.getGenerativeModel({
      model: process.env.VERTEX_AI_MODEL || 'gemini-1.5-pro',
    });

    aiplatform = true;
    logger.info('Vertex AI clients initialized', { project, location });
  }
  return { generativeModel };
}

/**
 * Retrieve relevant knowledge chunks from Firestore based on query
 * Uses keyword matching against tags and content fields
 *
 * @param {string} query - User's question
 * @param {object} firestore - Firestore instance
 * @returns {Promise<Array<{id: string, title: string, content: string, tags: string[], source: string}>>}
 */
async function retrieveChunks(query, firestore) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return [];
  }

  try {
    const keywords = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    if (keywords.length === 0) {
      return [];
    }

    // Query Firestore election_knowledge collection
    const snapshot = await firestore
      .collection('election_knowledge')
      .get();

    if (snapshot.empty) {
      logger.warn('No documents in election_knowledge collection');
      return [];
    }

    // Score each document by keyword relevance
    const scored = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      let score = 0;
      const contentLower = (data.content || '').toLowerCase();
      const titleLower = (data.title || '').toLowerCase();
      const tags = (data.tags || []).map((t) => t.toLowerCase());

      for (const keyword of keywords) {
        if (titleLower.includes(keyword)) { score += 3; }
        if (tags.includes(keyword)) { score += 2; }
        if (contentLower.includes(keyword)) { score += 1; }
      }

      if (score > 0) {
        scored.push({ id: doc.id, ...data, _score: score });
      }
    });

    // Sort by score descending and return top 3
    scored.sort((a, b) => b._score - a._score);
    const topChunks = scored.slice(0, 3).map(({ _score, ...chunk }) => chunk);

    logger.info('Retrieved chunks', { query: query.substring(0, 50), count: topChunks.length });
    return topChunks;
  } catch (error) {
    logger.error('Chunk retrieval failed', error);
    return [];
  }
}

/**
 * Generate a grounded response using Vertex AI Gemini
 * ONLY answers from the provided context — never from general knowledge
 *
 * @param {string} query - User's question
 * @param {Array} chunks - Retrieved knowledge chunks
 * @returns {Promise<{response: string, intent: string, source: string, chunksUsed: string[], confidence: number}>}
 */
async function generateGroundedResponse(query, chunks, intent = 'unknown') {
  const result = {
    response: '',
    intent,
    source: 'election_knowledge',
    chunksUsed: [],
    confidence: 0,
  };

  if (!chunks || chunks.length === 0) {
    result.response = 'I could not find relevant information in my knowledge base to answer your question. Please try rephrasing or ask about the Indian election process, voter eligibility, election phases, or election terminology.';
    result.source = 'no_context';
    result.confidence = 0;
    return result;
  }

  try {
    const { generativeModel } = getVertexClients();

    const contextText = chunks
      .map((c, i) => `[Source ${i + 1}: ${c.title}]\n${c.content}`)
      .join('\n\n---\n\n');

    const systemPrompt = `You are VoteWise AI, an expert assistant on Indian elections.

STRICT RULES:
- Answer ONLY from the provided context below.
- If the answer is not in the context, say: "This information is not available in my current knowledge base."
- Never answer from general knowledge.
- Always cite which source document(s) you used.
- Keep answers clear, concise, and helpful for Indian citizens.
- Use simple language that is easy to understand.

CONTEXT:
${contextText}`;

    const request = {
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nQuestion: ${query}` }] },
      ],
    };

    const response = await generativeModel.generateContent(request);
    const responseText = response.response?.candidates?.[0]?.content?.parts?.[0]?.text
      || 'I was unable to generate a response. Please try again.';

    result.response = responseText;
    result.chunksUsed = chunks.map((c) => c.id || c.title);
    result.confidence = Math.min(chunks.length / 3, 1);

    logger.info('Grounded response generated', {
      queryLength: query.length,
      chunksUsed: result.chunksUsed.length,
      confidence: result.confidence,
    });

    return result;
  } catch (error) {
    logger.error('Vertex AI generation failed', error);

    // Fallback: return chunk content directly
    result.response = chunks
      .map((c) => `**${c.title}**: ${c.content}`)
      .join('\n\n');
    result.chunksUsed = chunks.map((c) => c.id || c.title);
    result.confidence = 0.3;
    result.source = 'fallback_chunks';

    return result;
  }
}

module.exports = {
  retrieveChunks,
  generateGroundedResponse,
  getVertexClients,
};
