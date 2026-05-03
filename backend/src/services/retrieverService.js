/**
 * @fileoverview Document retrieval service for VoteWise AI.
 * Fetches relevant knowledge from Firestore and ranks it using keyword matching.
 * @module retrieverService
 */

const { getFirestore } = require('../config/firebase');
const { logger } = require('../utils/logger');
const { FIREBASE_PATHS } = require('../utils/constants');

/**
 * Scores a document against an embedding vector.
 * @param {Object} doc - Document to score
 * @param {string[]} embeddingVector - Keywords to match
 * @returns {Object} Document with _score property
 */
const scoreDocument = (doc, embeddingVector) => {
  let score = 0;
  const contentLower = (doc.content || '').toLowerCase();
  const titleLower = (doc.title || '').toLowerCase();
  const tags = (doc.tags || []).map((t) => t.toLowerCase());

  for (const keyword of embeddingVector) {
    if (titleLower.includes(keyword)) {
      score += 3;
    }
    if (tags.includes(keyword)) {
      score += 2;
    }
    if (contentLower.includes(keyword)) {
      score += 1;
    }
  }
  return { ...doc, _score: score };
};

/**
 * Removes duplicate documents based on content.
 * @param {Array} documents - Ranked documents
 * @returns {Array} Deduplicated documents
 */
const deduplicateDocuments = (documents) => {
  const uniqueDocs = [];
  const seenContents = new Set();
  
  for (const doc of documents) {
    if (!seenContents.has(doc.content)) {
      seenContents.add(doc.content);
      uniqueDocs.push(doc);
    }
  }
  return uniqueDocs;
};

/**
 * Retrieve and rank top-k documents from Firestore based on the embedding vector.
 * @param {string[]} embeddingVector - Array of keywords
 * @param {number} [k=3] - Number of documents to return
 * @returns {Promise<Array>} Ranked documents
 */
async function retrieveTopK(embeddingVector, k = 3) {
  try {
    const firestore = getFirestore();
    const snapshot = await firestore.collection(FIREBASE_PATHS.ELECTION_KNOWLEDGE).get();
    
    if (snapshot.empty) {
      logger.warn(`No documents in ${FIREBASE_PATHS.ELECTION_KNOWLEDGE} collection`);
      return [];
    }

    const docs = [];
    snapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() }));

    const scored = docs.map((doc) => scoreDocument(doc, embeddingVector));
    const relevantDocs = scored
      .filter((d) => d._score > 0)
      .sort((a, b) => b._score - a._score);
    
    const uniqueDocs = deduplicateDocuments(relevantDocs);
    const topK = uniqueDocs.slice(0, k);

    logger.info('Retrieved and ranked documents', { count: topK.length, topScore: topK[0]?._score || 0 });
    
    return topK;
  } catch (error) {
    logger.error('Retrieval failed', error);
    return [];
  }
}

module.exports = { retrieveTopK };

