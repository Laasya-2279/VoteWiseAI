/**
 * API Routes — all backend endpoints for VoteWise AI
 */
const express = require('express');
const { body, validationResult } = require('express-validator');
const { logger } = require('../utils/logger');
const { classifyIntent } = require('../utils/intentParser');
const { checkEligibility } = require('../utils/eligibilityChecker');
const { retrieveChunks, generateGroundedResponse } = require('../services/ragEngine');
const { synthesizeSpeech, transcribeSpeech } = require('../services/voiceService');
const { getQuestions, calculateScore, saveScore } = require('../services/quizEngine');
const { getFirestore, getRealtimeDB } = require('../config/firebase');
const { verifyAuth } = require('../middleware/auth');
const { voiceLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * Validation error handler
 */
function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  return null;
}

// ─── Health Check ──────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'votewise-ai-backend' });
});

// ─── Query (RAG + Intent) ──────────────────────────────────
router.post(
  '/query',
  [body('query').isString().trim().notEmpty().withMessage('Query is required')],
  async (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) { return; }

    try {
      const { query } = req.body;
      const startTime = Date.now();

      // Classify intent
      const { intent, confidence, entities } = classifyIntent(query);

      // Retrieve and generate
      const firestore = getFirestore();
      const chunks = await retrieveChunks(query, firestore);
      const result = await generateGroundedResponse(query, chunks, intent);

      const responseTime = Date.now() - startTime;

      res.json({
        ...result,
        intent,
        intentConfidence: confidence,
        entities,
        responseTimeMs: responseTime,
      });
    } catch (error) {
      logger.error('Query endpoint failed', error);
      res.status(503).json({
        error: 'Service temporarily unavailable',
        response: 'I am having trouble processing your request right now. Please try again in a moment.',
        intent: 'unknown',
        source: 'error',
        chunksUsed: [],
        confidence: 0,
      });
    }
  }
);

// ─── Text-to-Speech ────────────────────────────────────────
router.post(
  '/tts',
  voiceLimiter,
  [body('text').isString().trim().notEmpty().withMessage('Text is required')],
  async (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) { return; }

    try {
      const audioBuffer = await synthesizeSpeech(req.body.text);
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length,
      });
      res.send(audioBuffer);
    } catch (error) {
      logger.error('TTS endpoint failed', error);
      res.status(503).json({ error: 'Text-to-speech service unavailable' });
    }
  }
);

// ─── Speech-to-Text ────────────────────────────────────────
router.post(
  '/stt',
  voiceLimiter,
  async (req, res) => {
    try {
      if (!req.body || !Buffer.isBuffer(req.body) && !req.body.audio) {
        return res.status(400).json({ error: 'Audio data is required' });
      }

      const audioData = req.body.audio
        ? Buffer.from(req.body.audio, 'base64')
        : req.body;

      const transcript = await transcribeSpeech(audioData);
      res.json({ transcript, success: true });
    } catch (error) {
      logger.error('STT endpoint failed', error);
      res.status(503).json({ error: 'Speech-to-text service unavailable' });
    }
  }
);

// ─── Eligibility Check ────────────────────────────────────
router.post(
  '/eligibility',
  [
    body('age').notEmpty().withMessage('Age is required'),
    body('state').isString().trim().notEmpty().withMessage('State is required'),
    body('citizenship').isString().trim().notEmpty().withMessage('Citizenship is required'),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) { return; }

    try {
      const { age, state, citizenship } = req.body;
      const result = checkEligibility({ age, state, citizenship });
      res.json(result);
    } catch (error) {
      logger.error('Eligibility endpoint failed', error);
      res.status(500).json({ error: 'Eligibility check failed' });
    }
  }
);

// ─── Timeline ──────────────────────────────────────────────
router.get('/timeline', async (_req, res) => {
  try {
    const rtdb = getRealtimeDB();
    if (!rtdb) {
      return res.status(503).json({ error: 'Realtime Database not configured' });
    }
    const snapshot = await rtdb.ref('/timeline').once('value');
    const data = snapshot.val() || {};
    const stages = Object.entries(data).map(([id, val]) => ({ id, ...val }));
    res.json({ stages });
  } catch (error) {
    logger.error('Timeline endpoint failed', error);
    res.status(503).json({ error: 'Timeline service unavailable' });
  }
});

// ─── Phases ────────────────────────────────────────────────
router.get('/phases', async (_req, res) => {
  try {
    const rtdb = getRealtimeDB();
    if (!rtdb) {
      return res.status(503).json({ error: 'Realtime Database not configured' });
    }
    const snapshot = await rtdb.ref('/phases').once('value');
    const data = snapshot.val() || {};
    const phases = Object.entries(data).map(([id, val]) => ({ id, ...val }));
    res.json({ phases });
  } catch (error) {
    logger.error('Phases endpoint failed', error);
    res.status(503).json({ error: 'Phases service unavailable' });
  }
});

// ─── Glossary ──────────────────────────────────────────────
router.get('/glossary', async (_req, res) => {
  try {
    const rtdb = getRealtimeDB();
    if (!rtdb) {
      return res.status(503).json({ error: 'Realtime Database not configured' });
    }
    const snapshot = await rtdb.ref('/glossary').once('value');
    const data = snapshot.val() || {};
    const terms = Object.entries(data).map(([id, val]) => ({ id, ...val }));
    res.json({ terms });
  } catch (error) {
    logger.error('Glossary endpoint failed', error);
    res.status(503).json({ error: 'Glossary service unavailable' });
  }
});

// ─── Quiz Questions ────────────────────────────────────────
router.get('/quiz/questions', (_req, res) => {
  try {
    const questions = getQuestions();
    res.json({ questions });
  } catch (error) {
    logger.error('Quiz questions endpoint failed', error);
    res.status(500).json({ error: 'Failed to load quiz questions' });
  }
});

// ─── Quiz Score (Authenticated) ────────────────────────────
router.post(
  '/quiz/score',
  verifyAuth,
  [
    body('answers').isArray({ min: 1 }).withMessage('Answers array is required'),
    body('timeTaken').optional().isNumeric(),
  ],
  async (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) { return; }

    try {
      const { answers, timeTaken } = req.body;
      const { score, total, results } = calculateScore(answers);
      const firestore = getFirestore();
      const docId = await saveScore(firestore, req.user.uid, score, total, timeTaken);

      res.json({ score, total, results, docId, percentage: Math.round((score / total) * 100) });
    } catch (error) {
      logger.error('Quiz score endpoint failed', error);
      res.status(500).json({ error: 'Failed to save quiz score' });
    }
  }
);

module.exports = router;
