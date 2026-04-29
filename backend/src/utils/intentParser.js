/**
 * Intent Parser — classifies user queries into actionable intents
 * and extracts relevant entities.
 *
 * Intents: process_query, eligibility_query, timeline_query,
 *          candidate_query, results_query, glossary_query, unknown
 */

const INTENT_PATTERNS = {
  process_query: [
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
  eligibility_query: [
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
  timeline_query: [
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
  candidate_query: [
    /candidate/i,
    /who\s+is\s+(running|contesting|standing)/i,
    /contestants?/i,
    /party\s+(list|candidates?)/i,
    /lok\s+sabha\s+(seat|member|mp)/i,
    /constituency\s+candidate/i,
    /mla|mp\s+candidate/i,
    /independent\s+candidate/i,
  ],
  results_query: [
    /result/i,
    /who\s+won/i,
    /winner/i,
    /vote\s+count(ing)?/i,
    /tally/i,
    /margin\s+of\s+victory/i,
    /seat\s+(count|tally|won)/i,
    /majority/i,
    /coalition/i,
    /hung\s+parliament/i,
  ],
  glossary_query: [
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

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
  'Chandigarh', 'Andaman and Nicobar',
];

/**
 * Classify a query into one of the defined intents
 * @param {string} query - User's input query
 * @returns {{ intent: string, confidence: number, entities: object }}
 */
function classifyIntent(query) {
  if (query === null || query === undefined || typeof query !== 'string') {
    return { intent: 'unknown', confidence: 0, entities: {} };
  }

  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return { intent: 'unknown', confidence: 0, entities: {} };
  }

  // Truncate very long input to prevent regex DoS
  const safeQuery = trimmed.length > 1000 ? trimmed.substring(0, 1000) : trimmed;

  let bestIntent = 'unknown';
  let bestScore = 0;

  // Score each intent — glossary gets tie-break priority
  const intentOrder = ['glossary_query', 'process_query', 'eligibility_query', 'timeline_query', 'candidate_query', 'results_query'];

  for (const intent of intentOrder) {
    const patterns = INTENT_PATTERNS[intent];
    if (!patterns) { continue; }
    let matchCount = 0;
    for (const pattern of patterns) {
      if (pattern.test(safeQuery)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      const score = Math.min(matchCount / 2, 1);
      // glossary_query wins on equal scores (listed first)
      if (score > bestScore || (score === bestScore && intent === 'glossary_query')) {
        bestScore = score;
        bestIntent = intent;
      }
    }
  }

  const entities = extractEntities(safeQuery);
  const confidence = bestIntent === 'unknown' ? 0 : Math.round(bestScore * 100) / 100;

  return { intent: bestIntent, confidence, entities };
}

/**
 * Extract entities from a query string
 * @param {string} query - User query
 * @returns {{ zone?: string, phase?: number, state?: string, term?: string }}
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

  // Match known Indian states
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
 * Get all supported intents
 * @returns {string[]}
 */
function getSupportedIntents() {
  return [...Object.keys(INTENT_PATTERNS), 'unknown'];
}

module.exports = {
  classifyIntent,
  extractEntities,
  getSupportedIntents,
  INTENT_PATTERNS,
  INDIAN_STATES,
};
