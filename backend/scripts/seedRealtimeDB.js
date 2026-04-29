/**
 * Seed script — populates Firebase Realtime DB with timeline, phases, and glossary
 * Run: node scripts/seedRealtimeDB.js
 */
require('dotenv').config();
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT
    ? require(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT)
    : null;
  admin.initializeApp({
    credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const rtdb = admin.database();

const TIMELINE = {
  stage1: { name: 'Announcement', order: 1, description: 'The Election Commission announces the election schedule, including dates for nomination, scrutiny, withdrawal, and polling for each phase.', duration: '1 day', status: 'completed' },
  stage2: { name: 'Model Code of Conduct', order: 2, description: 'The MCC comes into effect from announcement. All parties must follow strict guidelines on campaigning, government actions, and media usage.', duration: 'Until results', status: 'active' },
  stage3: { name: 'Nomination', order: 3, description: 'Candidates file nomination papers with the Returning Officer. They must declare assets, criminal record, and educational qualifications.', duration: '7-10 days', status: 'upcoming' },
  stage4: { name: 'Scrutiny', order: 4, description: 'Returning Officers examine all nomination papers for validity, verifying candidate eligibility and document completeness.', duration: '1-2 days', status: 'upcoming' },
  stage5: { name: 'Campaigning', order: 5, description: 'Candidates and parties campaign across constituencies. All campaigning must stop 48 hours before polling day.', duration: '2-3 weeks', status: 'upcoming' },
  stage6: { name: 'Voting Day', order: 6, description: 'Voters cast ballots using EVMs at polling stations. Polls open 7 AM to 6 PM. VVPAT provides paper verification.', duration: '1 day per phase', status: 'upcoming' },
  stage7: { name: 'Counting', order: 7, description: 'Votes counted at designated centers under CCTV. Postal ballots first, then EVM counts round by round.', duration: '1 day', status: 'upcoming' },
  stage8: { name: 'Results', order: 8, description: 'Results declared constituency by constituency. Winning candidates receive certificates of election. Government formation follows.', duration: '1 day', status: 'upcoming' },
};

const PHASES = {
  phase1: { number: 1, date: '2024-04-19', seats: 102, states: ['Tamil Nadu', 'Rajasthan', 'Uttar Pradesh', 'Uttarakhand', 'Arunachal Pradesh', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Andaman and Nicobar', 'Lakshadweep', 'Puducherry', 'Assam', 'Bihar', 'Chhattisgarh', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Tripura', 'West Bengal', 'Jammu and Kashmir'] },
  phase2: { number: 2, date: '2024-04-26', seats: 89, states: ['Kerala', 'Karnataka', 'Rajasthan', 'Assam', 'Bihar', 'Chhattisgarh', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Tripura', 'Uttar Pradesh', 'West Bengal', 'Jammu and Kashmir'] },
  phase3: { number: 3, date: '2024-05-07', seats: 94, states: ['Goa', 'Gujarat', 'Karnataka', 'Assam', 'Bihar', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Madhya Pradesh', 'Maharashtra', 'Uttar Pradesh', 'West Bengal', 'Jammu and Kashmir'] },
  phase4: { number: 4, date: '2024-05-13', seats: 96, states: ['Andhra Pradesh', 'Telangana', 'Bihar', 'Jharkhand', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Uttar Pradesh', 'West Bengal', 'Jammu and Kashmir'] },
  phase5: { number: 5, date: '2024-05-20', seats: 49, states: ['Bihar', 'Jharkhand', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Uttar Pradesh', 'West Bengal', 'Ladakh'] },
  phase6: { number: 6, date: '2024-05-25', seats: 57, states: ['Bihar', 'Haryana', 'Jharkhand', 'Madhya Pradesh', 'Odisha', 'Uttar Pradesh', 'West Bengal'] },
  phase7: { number: 7, date: '2024-06-01', seats: 57, states: ['Bihar', 'Himachal Pradesh', 'Jharkhand', 'Odisha', 'Punjab', 'Uttar Pradesh', 'West Bengal', 'Chandigarh'] },
};

const GLOSSARY = {
  evm: { term: 'EVM', fullForm: 'Electronic Voting Machine', definition: 'A standalone electronic device used to record votes. It consists of a Control Unit and Ballot Unit, is not connected to any network, and stores votes securely until counting day.' },
  vvpat: { term: 'VVPAT', fullForm: 'Voter Verifiable Paper Audit Trail', definition: 'A machine attached to the EVM that prints a paper slip showing the candidate voted for. The slip is visible for 7 seconds before dropping into a sealed box.' },
  mcc: { term: 'MCC', fullForm: 'Model Code of Conduct', definition: 'A set of guidelines for political parties and candidates to ensure fair elections. It covers conduct of parties, meetings, processions, polling day activities, and use of government machinery.' },
  adr: { term: 'ADR', fullForm: 'Association for Democratic Reforms', definition: 'A non-partisan organization that analyzes candidates backgrounds including criminal records, assets, and education qualifications to promote transparency in Indian elections.' },
  nota: { term: 'NOTA', fullForm: 'None Of The Above', definition: 'An option on the EVM allowing voters to reject all candidates. Introduced in 2013 by Supreme Court order. Even if NOTA gets the highest votes, the leading candidate still wins.' },
  ro: { term: 'RO', fullForm: 'Returning Officer', definition: 'An officer appointed by the ECI for each constituency responsible for the proper conduct of elections, scrutiny of nominations, counting, and declaration of results.' },
  deo: { term: 'DEO', fullForm: 'District Election Officer', definition: 'The officer responsible for overseeing election processes at the district level, coordinating between the ECI and constituency-level officials.' },
  eci: { term: 'ECI', fullForm: 'Election Commission of India', definition: 'An autonomous constitutional body responsible for administering election processes in India. It ensures free and fair elections and operates under Article 324.' },
  blo: { term: 'BLO', fullForm: 'Booth Level Officer', definition: 'A local government official assigned to each polling booth area responsible for maintaining the voter list, verifying new registrations, and assisting voters.' },
  epic: { term: 'EPIC', fullForm: 'Electors Photo Identity Card', definition: 'The official Voter ID card issued by the ECI. It serves as proof of identity for voting and is also accepted as a valid ID for other purposes.' },
  fptp: { term: 'FPTP', fullForm: 'First Past The Post', definition: 'The electoral system used in India where the candidate with the most votes in a constituency wins, regardless of whether they have a majority of total votes cast.' },
};

async function seedRealtimeDB() {
  await rtdb.ref('/timeline').set(TIMELINE);
  await rtdb.ref('/phases').set(PHASES);
  await rtdb.ref('/glossary').set(GLOSSARY);
  process.stdout.write('Seeded Realtime DB: timeline (8 stages), phases (7), glossary (11 terms)\n');
  process.exit(0);
}

seedRealtimeDB().catch((err) => {
  process.stderr.write(`Seed failed: ${err.message}\n`);
  process.exit(1);
});
