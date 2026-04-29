const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Force resolution to the root directory
const serviceAccountPath = path.resolve(__dirname, '../../service-account.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

const rtdb = admin.database();

const TIMELINE_DATA = [
  { id: 1, stage: 'Announcement', date: 'March 16, 2024', desc: 'ECI announces the full election schedule.' },
  { id: 2, stage: 'Model Code of Conduct', date: 'Immediate', desc: 'MCC comes into force across the country.' },
  { id: 3, stage: 'Nominations', date: 'Phase-wise', desc: 'Candidates file their nomination papers.' },
  { id: 4, stage: 'Voting Day', date: 'Apr 19 - Jun 1', desc: 'Citizens cast their votes in 7 phases.' },
  { id: 5, stage: 'Results', date: 'June 4, 2024', desc: 'Counting of votes and declaration of winners.' }
];

async function seed() {
  console.log('🚀 Seeding Realtime Database...');
  await rtdb.ref('timeline').set(TIMELINE_DATA);
  console.log('✅ Realtime Database seeded successfully!');
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
