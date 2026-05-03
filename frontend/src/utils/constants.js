/**
 * @fileoverview Domain and UI constants for VoteWise AI frontend.
 * @module constants
 */

export const INTENT_TYPES = Object.freeze({
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

export const ELECTION_PHASES = Object.freeze({
  MIN: 1,
  MAX: 7,
});

export const ECI_LINKS = Object.freeze({
  VOTER_PORTAL: 'https://voters.eci.gov.in',
  FORM_6: 'https://voters.eci.gov.in/home',
  FORM_6_SIGNUP: 'https://voters.eci.gov.in/signup',
  ECI_MAIN: 'https://www.eci.gov.in',
});

export const INDIAN_STATES = Object.freeze([
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
  'Chandigarh', 'Andaman and Nicobar',
]);

export const PHASE_COLORS = Object.freeze({
  1: { bg: 'bg-red-500', text: 'text-red-400', hex: '#EF4444', label: 'Phase 1 — Apr 19' },
  2: { bg: 'bg-orange-500', text: 'text-orange-400', hex: '#F97316', label: 'Phase 2 — Apr 26' },
  3: { bg: 'bg-yellow-500', text: 'text-yellow-400', hex: '#EAB308', label: 'Phase 3 — May 7' },
  4: { bg: 'bg-green-500', text: 'text-green-400', hex: '#22C55E', label: 'Phase 4 — May 13' },
  5: { bg: 'bg-teal-500', text: 'text-teal-400', hex: '#14B8A6', label: 'Phase 5 — May 20' },
  6: { bg: 'bg-blue-500', text: 'text-blue-400', hex: '#3B82F6', label: 'Phase 6 — May 25' },
  7: { bg: 'bg-purple-500', text: 'text-purple-400', hex: '#A855F7', label: 'Phase 7 — Jun 1' },
});

export const STATE_DATA = Object.freeze([
  { name: 'Uttar Pradesh', phases: [1,2,3,4,5,6,7], seats: 80, constituencies: 80 },
  { name: 'Maharashtra', phases: [1,2,3,4,5], seats: 48, constituencies: 48 },
  { name: 'West Bengal', phases: [1,2,3,4,5,6,7], seats: 42, constituencies: 42 },
  { name: 'Bihar', phases: [1,2,3,4,5,6,7], seats: 40, constituencies: 40 },
  { name: 'Tamil Nadu', phases: [1], seats: 39, constituencies: 39 },
  { name: 'Madhya Pradesh', phases: [1,2,3,4,5,6], seats: 29, constituencies: 29 },
  { name: 'Karnataka', phases: [2,3], seats: 28, constituencies: 28 },
  { name: 'Gujarat', phases: [3], seats: 26, constituencies: 26 },
  { name: 'Rajasthan', phases: [1,2], seats: 25, constituencies: 25 },
  { name: 'Andhra Pradesh', phases: [4], seats: 25, constituencies: 25 },
  { name: 'Odisha', phases: [4,5,6,7], seats: 21, constituencies: 21 },
  { name: 'Kerala', phases: [2], seats: 20, constituencies: 20 },
  { name: 'Telangana', phases: [4], seats: 17, constituencies: 17 },
  { name: 'Jharkhand', phases: [4,5,6,7], seats: 14, constituencies: 14 },
  { name: 'Assam', phases: [1,2,3], seats: 14, constituencies: 14 },
  { name: 'Punjab', phases: [7], seats: 13, constituencies: 13 },
  { name: 'Chhattisgarh', phases: [1,2,3], seats: 11, constituencies: 11 },
  { name: 'Haryana', phases: [6], seats: 10, constituencies: 10 },
  { name: 'Delhi', phases: [6], seats: 7, constituencies: 7 },
  { name: 'Jammu and Kashmir', phases: [1,2,3,4], seats: 5, constituencies: 5 },
  { name: 'Uttarakhand', phases: [1], seats: 5, constituencies: 5 },
  { name: 'Himachal Pradesh', phases: [7], seats: 4, constituencies: 4 },
  { name: 'Goa', phases: [3], seats: 2, constituencies: 2 },
  { name: 'Tripura', phases: [1,2], seats: 2, constituencies: 2 },
  { name: 'Meghalaya', phases: [1], seats: 2, constituencies: 2 },
  { name: 'Manipur', phases: [1,2], seats: 2, constituencies: 2 },
  { name: 'Arunachal Pradesh', phases: [1], seats: 2, constituencies: 2 },
  { name: 'Nagaland', phases: [1], seats: 1, constituencies: 1 },
  { name: 'Mizoram', phases: [1], seats: 1, constituencies: 1 },
  { name: 'Sikkim', phases: [1], seats: 1, constituencies: 1 },
  { name: 'Ladakh', phases: [5], seats: 1, constituencies: 1 },
]);

export const MAP_CONFIG = Object.freeze({
  CENTER: { lat: 20.5937, lng: 78.9629 },
  ZOOM: 5,
  MAP_ID: 'votewise-india-map',
});

export const QUICK_ACTIONS = Object.freeze([
  { id: 'action-guide', title: 'Guide Me', description: 'Learn the complete election process step by step', icon: '📖', href: '/guide/', color: 'from-saffron-500 to-saffron-700' },
  { id: 'action-eligibility', title: 'Check Eligibility', description: 'Find out if you can vote and how to register', icon: '✅', href: '/eligibility/', color: 'from-tricolor-green to-emerald-700' },
  { id: 'action-phases', title: 'Explore Phases', description: 'See voting dates and states for all 7 phases', icon: '🗺️', href: '/phase-map/', color: 'from-navy-600 to-navy-800' },
  { id: 'action-quiz', title: 'Quiz Me', description: 'Test your knowledge about Indian elections', icon: '🧠', href: '/quiz/', color: 'from-accent-cyan to-teal-600' },
]);

export const ELECTION_STATS = Object.freeze([
  { label: 'Total Seats', value: '543', icon: '🏛️' },
  { label: 'Voting Phases', value: '7', icon: '📅' },
  { label: 'Eligible Voters', value: '96.8 Cr', icon: '👥' },
  { label: 'Polling Stations', value: '10.5 L', icon: '🗳️' },
]);
