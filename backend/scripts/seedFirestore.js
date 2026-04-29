const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Force resolution to the root directory
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
    text: 'To be eligible to vote in India, you must be a citizen of India, 18 years of age or older on the qualifying date (January 1st of the year of registration), and a resident of the polling area where you want to register.',
    source: 'ECI Handbook',
    intent: 'eligibility'
  },
  {
    id: 'process-1',
    text: 'The voting process involves presenting your EPIC (Voter ID) card or an approved identity document, getting your finger inked, and casting your vote on the EVM (Electronic Voting Machine).',
    source: 'Voter Guide 2024',
    intent: 'voting_process'
  },
  {
    id: 'mcc-1',
    text: 'The Model Code of Conduct (MCC) is a set of guidelines issued by the Election Commission of India to regulate political parties and candidates during elections, ensuring free and fair polling.',
    source: 'ECI Regulations',
    intent: 'mcc'
  },
  {
    id: 'phases-1',
    text: 'The 2024 General Elections in India are conducted in 7 phases starting from April 19 to June 1, with counting scheduled for June 4.',
    source: 'Election Schedule',
    intent: 'schedule'
  }
];

async function seed() {
  console.log('🚀 Seeding Firestore...');
  const batch = db.batch();
  
  KNOWLEDGE_CHUNKS.forEach((chunk) => {
    const ref = db.collection('election_knowledge').doc(chunk.id);
    batch.set(ref, chunk);
  });

  await batch.commit();
  console.log('✅ Firestore seeded successfully!');
}

seed().catch(console.error);
