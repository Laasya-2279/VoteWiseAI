/**
 * Firebase Admin SDK initialization
 * Configures Firestore, Realtime Database, and Auth
 */
const admin = require('firebase-admin');
const { logger } = require('../utils/logger');

let app;
let db;
let rtdb;
let auth;

/**
 * Initialize Firebase Admin SDK
 * Uses service account in production, project ID in test
 */
function initializeFirebase() {
  if (app) {
    return { app, db, rtdb, auth };
  }

  try {
    const config = {
      projectId: process.env.FIREBASE_PROJECT_ID,
    };

    if (process.env.FIREBASE_DATABASE_URL) {
      config.databaseURL = process.env.FIREBASE_DATABASE_URL;
    }

    // Use service account from environment variable (Best for Render/Cloud)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      config.credential = admin.credential.cert(serviceAccount);
    } 
    // Use service account file if available (Best for Local)
    else if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT && process.env.NODE_ENV !== 'test') {
      const path = require('path');
      const serviceAccountPath = path.resolve(__dirname, '../../../', process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT);
      const serviceAccount = require(serviceAccountPath);
      config.credential = admin.credential.cert(serviceAccount);
    } else if (process.env.NODE_ENV !== 'test') {
      // Use application default credentials in Cloud Run
      config.credential = admin.credential.applicationDefault();
    }

    app = admin.initializeApp(config);
    db = admin.firestore();
    auth = admin.auth();

    if (process.env.FIREBASE_DATABASE_URL) {
      rtdb = admin.database();
    }

    logger.info('Firebase Admin initialized', { projectId: config.projectId });
    return { app, db, rtdb, auth };
  } catch (error) {
    logger.error('Firebase initialization failed', error);
    throw error;
  }
}

/**
 * Get Firestore instance
 * @returns {admin.firestore.Firestore}
 */
function getFirestore() {
  if (!db) {
    initializeFirebase();
  }
  return db;
}

/**
 * Get Realtime Database instance
 * @returns {admin.database.Database}
 */
function getRealtimeDB() {
  if (!rtdb) {
    initializeFirebase();
  }
  return rtdb;
}

/**
 * Get Firebase Auth instance
 * @returns {admin.auth.Auth}
 */
function getAuth() {
  if (!auth) {
    initializeFirebase();
  }
  return auth;
}

module.exports = {
  initializeFirebase,
  getFirestore,
  getRealtimeDB,
  getAuth,
  admin,
};
