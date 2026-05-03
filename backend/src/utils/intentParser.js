/**
 * @fileoverview Intent classification for VoteWise AI assistant.
 * Parses user queries into structured intent objects for routing
 * to the appropriate Firebase data source.
 * @module intentParser
 */

const { INDIAN_STATES, INTENT_TYPES } = require('./constants');

const INTENT_PATTERNS = {
  [INTENT_TYPES.PROCESS]: [
    /how\s+(does|do|to)\s+(\w+\s+)*(vote|voting|election)/i,
    /how\s+do\s+i\s+vote/i,
    /voting\s+(process|procedure|steps?)/i,
    /election\s+(process|procedure|steps?|system)/i,
    /how\s+(is|are)\s+(election|vote)/i,
    /what\s+(is|are)\s+(the\s+)?(election|voting)\s+(process|steps?)/i,
    /\bevm\b|\bvvpat\b|\bballot\b/i,
    /model\s+code\s+of\s+conduct/i,
    /campaigning\s+rules?/i,
    /nomination\s+(process|filing)/i,
    /how\s+to\s+register/i,
    /voter\s+(registration|id|card)/i,
    /polling\s+station/i,
  ],
  [INTENT_TYPES.ELIGIBILITY]: [
    /eligib(le|ility)/i,
    /can\s+i\s+vote/i,
    /am\s+i\s+(eligible|allowed)/i,
    /who\s+can\s+vote/i,
    /age\s+(to|for)\s+vot(e|ing)/i,
    /voting\s+age/i,
    /minimum\s+age/i,
    /qualify\s+(to|for)\s+vot/i,
    /nri\s+vot(e|ing)/i,
    /citizen(ship)?\s+(required|requirement|eligib)/i,
  ],
  [INTENT_TYPES.TIMELINE]: [
    /timeline/i,
    /when\s+(is|are|does|will)\s+(the\s+)?(election|voting|phase)/i,
    /election\s+(date|schedule|calendar|timeline)/i,
    /voting\s+date/i,
    /phase\s+\d/i,
    /schedule/i,
    /what\s+date/i,
    /announcement\s+date/i,
    /counting\s+date/i,
    /result\s+date/i,
  ],
  [INTENT_TYPES.GLOSSARY]: [
    /what\s+(is|does|are)\s+(a\s+)?(evm|vvpat|nota|mcc|adr|eci|deo|ro|blo)/i,
    /define\s/i,
    /meaning\s+of/i,
    /glossary/i,
    /explain\s+(the\s+)?(term|word|acronym)/i,
    /full\s+form/i,
    /stands?\s+for/i,
    /abbreviation/i,
    /returning\s+officer/i,
    /booth\s+level\s+officer/i,
    /district\s+election\s+officer/i,
    /what\s+(is|are)\s+(evm|vvpat|nota|mcc|epic|fptp|blo|deo|ro|eci|adr)/i,
  ],
};

const ENTITY_PATTERNS = {
  zone: /(?:north|south|east|west|central|north-?east)\s*(?:india|zone|region)?/i,
  phase: /phase\s*(\d+)/i,
  state: /(?:in|of|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
  term: /(?:what\s+is|define|meaning\s+of|explain)\s+(?:a\s+|an\s+|the\s+)?(\w+(?:\s+\w+){0,3})/i,
};

/**
 * Calculates match score for a specific intent.
 * @param {string} query - Cleaned user query
 * @param {string} intent - Intent type to check
 * @returns {number} Confidence score (0-1)
 */
const calculateIntentScore = (query, intent) => {
  const patterns = INTENT_PATTERNS[intent];
  if (!patterns) {
    return 0;
  }
  
  let matchCount = 0;
  for (const pattern of patterns) {
    if (pattern.test(query)) {
      matchCount++;
    }
  }
  
  return matchCount > 0 ? Math.min(matchCount / 2, 1) : 0;
};

/**
 * Classify a query into one of the defined intents.
 * @param {string} query - User's input query
 * @returns {{ intent: string, confidence: number, entities: object }} Classification results
 */
function classifyIntent(query) {
  if (!query || typeof query !== 'string') {
    return { intent: INTENT_TYPES.UNKNOWN, confidence: 0, entities: {} };
  }

  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return { intent: INTENT_TYPES.UNKNOWN, confidence: 0, entities: {} };
  }

  const safeQuery = trimmed.length > 1000 ? trimmed.substring(0, 1000) : trimmed;
  let bestIntent = INTENT_TYPES.UNKNOWN;
  let bestScore = 0;

  const intentsToCheck = [
    INTENT_TYPES.GLOSSARY,
    INTENT_TYPES.PROCESS,
    INTENT_TYPES.ELIGIBILITY,
    INTENT_TYPES.TIMELINE,
  ];

  for (const intent of intentsToCheck) {
    const score = calculateIntentScore(safeQuery, intent);
    if (score > bestScore || (score === bestScore && intent === INTENT_TYPES.GLOSSARY)) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  const entities = extractEntities(safeQuery);
  const confidence = bestIntent === INTENT_TYPES.UNKNOWN ? 0 : Math.round(bestScore * 100) / 100;

  return { intent: bestIntent, confidence, entities };
}

/**
 * Extract entities (state, phase, zone, term) from a query string.
 * @param {string} query - User query
 * @returns {Object} Extracted entities
 */
function extractEntities(query) {
  const entities = {};

  const zoneMatch = query.match(ENTITY_PATTERNS.zone);
  if (zoneMatch) {
    entities.zone = zoneMatch[0].trim().toLowerCase();
  }

  const phaseMatch = query.match(ENTITY_PATTERNS.phase);
  if (phaseMatch) {
    entities.phase = parseInt(phaseMatch[1], 10);
  }

  for (const state of INDIAN_STATES) {
    if (query.toLowerCase().includes(state.toLowerCase())) {
      entities.state = state;
      break;
    }
  }

  const termMatch = query.match(ENTITY_PATTERNS.term);
  if (termMatch) {
    entities.term = termMatch[1].trim();
  }

  return entities;
}

/**
 * Get all supported intents.
 * @returns {string[]} List of supported intent strings
 */
function getSupportedIntents() {
  return Object.values(INTENT_TYPES);
}

module.exports = {
  classifyIntent,
  extractEntities,
  getSupportedIntents,
  INTENT_PATTERNS,
  INDIAN_STATES,
};

