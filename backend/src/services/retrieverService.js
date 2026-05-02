const { getFirestore } = require('../config/firebase');
const { logger } = require('../utils/logger');

/**
 * Retrieve and rank top-k documents from Firestore based on the embedding vector.
 */
async function retrieveTopK(embeddingVector, k = 3) {
  try {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('election_knowledge').get();
    
    if (snapshot.empty) {
      logger.warn('No documents in election_knowledge collection');
      return [];
    }

    const docs = [];
    snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));

    // Rank documents based on embedding vector (keywords)
    const scored = docs.map(doc => {
      let score = 0;
      const contentLower = (doc.content || '').toLowerCase();
      const titleLower = (doc.title || '').toLowerCase();
      const tags = (doc.tags || []).map(t => t.toLowerCase());

      for (const keyword of embeddingVector) {
        if (titleLower.includes(keyword)) score += 3;
        if (tags.includes(keyword)) score += 2;
        if (contentLower.includes(keyword)) score += 1;
      }
      return { ...doc, _score: score };
    });

    // Filter, sort, and prefer most relevant documents
    const relevantDocs = scored.filter(d => d._score > 0).sort((a, b) => b._score - a._score);
    
    // Remove duplicates to limit context size efficiently
    const uniqueDocs = [];
    const seenContents = new Set();
    
    for (const doc of relevantDocs) {
      if (!seenContents.has(doc.content)) {
        seenContents.add(doc.content);
        uniqueDocs.push(doc);
      }
    }

    const topK = uniqueDocs.slice(0, k);
    logger.info('Retrieved and ranked documents', { count: topK.length, topScore: topK[0]?._score || 0 });
    
    return topK;
  } catch (error) {
    logger.error('Retrieval failed', error);
    return [];
  }
}

module.exports = { retrieveTopK };
