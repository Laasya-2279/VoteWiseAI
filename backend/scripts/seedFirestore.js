const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const serviceAccountPath = path.resolve(__dirname, '../../service-account.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();

const KNOWLEDGE_CHUNKS = [
  {
    id: 'eligibility-1',
    title: 'Voter Eligibility Criteria',
    content: 'To be eligible to vote in India, you must be a citizen of India, 18 years of age or older on the qualifying date (January 1st of the year of registration), and a resident of the polling area where you want to register.',
    tags: ['eligibility', 'age', 'citizen', 'voter id'],
    source: 'ECI Handbook'
  },
  {
    id: 'process-1',
    title: 'The Voting Process at Polling Stations',
    content: 'The voting process involves presenting your EPIC (Voter ID) card or an approved identity document, getting your finger inked by the polling officer, and casting your vote on the EVM (Electronic Voting Machine).',
    tags: ['voting', 'process', 'evm', 'ink', 'polling station'],
    source: 'Voter Guide 2024'
  },
  {
    id: 'mcc-1',
    title: 'Model Code of Conduct (MCC)',
    content: 'The Model Code of Conduct (MCC) is a set of guidelines issued by the Election Commission of India to regulate political parties and candidates during elections, ensuring free and fair polling.',
    tags: ['mcc', 'code of conduct', 'guidelines', 'election commission'],
    source: 'ECI Regulations'
  },
  {
    id: 'phases-1',
    title: 'Election Schedule and Phases 2024',
    content: 'The 2024 General Elections in India are conducted in 7 phases starting from April 19 to June 1, with counting scheduled for June 4.',
    tags: ['schedule', 'phases', 'dates', 'counting'],
    source: 'Election Schedule'
  }
];

async function seed() {
  console.log('🚀 Seeding Firestore with correct schema...');
  const batch = db.batch();
  
  KNOWLEDGE_CHUNKS.forEach((chunk) => {
    const ref = db.collection('election_knowledge').doc(chunk.id);
    batch.set(ref, chunk);
  });

  await batch.commit();
  console.log('✅ Firestore schema fix seeded successfully!');
}

seed().catch(console.error);
