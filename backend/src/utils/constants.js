/**
 * @fileoverview Domain constants for VoteWise AI backend.
 * Provides a single source of truth for election logic, limits, and paths.
 * @module constants
 */

const INTENT_TYPES = Object.freeze({
  ELIGIBILITY: 'eligibility_query',
  REGISTRATION: 'registration_query',
  TIMELINE: 'timeline_query',
  PROCESS: 'process_query',
  GLOSSARY: 'glossary_query',
  QUIZ: 'quiz_query',
  MAP: 'map_query',
  GENERAL: 'general_query',
  UNKNOWN: 'unknown',
});

const ELECTION_PHASES = Object.freeze({
  MIN: 1,
  MAX: 7,
});

const QUERY_LIMITS = Object.freeze({
  MAX_QUERY_LENGTH: 1000,
  MAX_TTS_LENGTH: 5000,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX: 200,
  VOICE_LIMIT_WINDOW_MS: 60 * 1000,
  VOICE_LIMIT_MAX: 30,
});

const FIREBASE_PATHS = Object.freeze({
  TIMELINE: '/timeline',
  PHASES: '/phases',
  GLOSSARY: '/glossary',
  QUIZ_SCORES: 'quiz_scores',
  ELECTION_KNOWLEDGE: 'election_knowledge',
});

const ECI_LINKS = Object.freeze({
  VOTER_PORTAL: 'https://voters.eci.gov.in',
  FORM_6: 'https://voters.eci.gov.in/home',
  FORM_6_SIGNUP: 'https://voters.eci.gov.in/signup',
  ECI_MAIN: 'https://www.eci.gov.in',
});

const INDIAN_STATES = Object.freeze([
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
  'Chandigarh', 'Andaman and Nicobar',
]);

const STATUS_CODES = Object.freeze({
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
});

module.exports = {
  INTENT_TYPES,
  ELECTION_PHASES,
  QUERY_LIMITS,
  FIREBASE_PATHS,
  ECI_LINKS,
  INDIAN_STATES,
  STATUS_CODES,
};
