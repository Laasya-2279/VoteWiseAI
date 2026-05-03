/**
 * @fileoverview Main API router for VoteWise AI.
 * Handles chat queries, eligibility checks, voice services, and quiz submissions.
 * @module apiRoutes
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { ragPipeline } = require('../services/ragPipeline');
const { synthesizeSpeech, transcribeSpeech } = require('../services/voiceService');
const { checkEligibility } = require('../utils/eligibilityChecker');
const { classifyIntent } = require('../utils/intentParser');
const { getQuestions, calculateScore, saveScore } = require('../services/quizEngine');
const { getFirestore, getRealtimeDB } = require('../config/firebase');
const { logger } = require('../utils/logger');
const { verifyAuth } = require('../middleware/auth');
const { voiceLimiter } = require('../middleware/rateLimiter');
const { STATUS_CODES, FIREBASE_PATHS } = require('../utils/constants');

const router = express.Router();

/**
 * Validation error handler.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Object|null} Error response or null
 */
function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ error: 'Validation failed', details: errors.array() });
  }
  return null;
}

// ─── Health Check ──────────────────────────────────────────

/**
 * Health check endpoint.
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'votewise-ai-backend' });
});

// ─── Query (RAG + Intent) ──────────────────────────────────

/**
 * Handles RAG-based query processing.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const queryHandler = async (req, res) => {
  const valErr = handleValidation(req, res);
  if (valErr) {
    return;
  }

  try {
    const { query } = req.body;
    const startTime = Date.now();
    const { intent, confidence, entities } = classifyIntent(query);
    const result = await ragPipeline(query, intent);
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
    res.status(STATUS_CODES.SERVICE_UNAVAILABLE).json({
      error: 'Service temporarily unavailable',
      response: 'I am having trouble processing your request right now. Please try again later.',
      intent: 'unknown',
      source: 'error',
      chunksUsed: [],
      confidence: 0,
    });
  }
};

router.post('/query', [body('query').isString().trim().notEmpty().withMessage('Query is required')], queryHandler);

// ─── Voice Services ────────────────────────────────────────

/**
 * Handles Text-to-Speech requests.
 */
router.post('/tts', voiceLimiter, [body('text').isString().trim().notEmpty()], async (req, res) => {
  const valErr = handleValidation(req, res);
  if (valErr) {
    return;
  }

  try {
    const audioBuffer = await synthesizeSpeech(req.body.text);
    res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': audioBuffer.length });
    res.send(audioBuffer);
  } catch (error) {
    logger.error('TTS endpoint failed', error);
    res.status(STATUS_CODES.SERVICE_UNAVAILABLE).json({ error: 'TTS service unavailable' });
  }
});

/**
 * Handles Speech-to-Text requests.
 */
router.post('/stt', voiceLimiter, async (req, res) => {
  try {
    const audioData = req.body.audio ? Buffer.from(req.body.audio, 'base64') : req.body;
    if (!audioData || audioData.length === 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ error: 'Audio data is required' });
    }
    const transcript = await transcribeSpeech(audioData);
    res.json({ transcript, success: true });
  } catch (error) {
    logger.error('STT endpoint failed', error);
    res.status(STATUS_CODES.SERVICE_UNAVAILABLE).json({ error: 'STT service unavailable' });
  }
});

// ─── Domain Logic ──────────────────────────────────────────

/**
 * Handles eligibility checks.
 */
router.post('/eligibility', [
  body('age').notEmpty(),
  body('state').isString().trim().notEmpty(),
  body('citizenship').isString().trim().notEmpty(),
], (req, res) => {
  const valErr = handleValidation(req, res);
  if (valErr) {
    return;
  }

  try {
    const result = checkEligibility(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Eligibility endpoint failed', error);
    res.status(STATUS_CODES.INTERNAL_ERROR).json({ error: 'Eligibility check failed' });
  }
});

/**
 * Helper to fetch RTDB references.
 * @param {string} path - RTDB path
 * @returns {Function} Express handler
 */
const createRtdbFetcher = (path) => async (req, res) => {
  try {
    const rtdb = getRealtimeDB();
    if (!rtdb) {
      return res.status(STATUS_CODES.SERVICE_UNAVAILABLE).json({ error: 'Database not configured' });
    }
    const snapshot = await rtdb.ref(path).once('value');
    const data = snapshot.val() || {};
    res.json(Object.entries(data).map(([id, val]) => ({ id, ...val })));
  } catch (error) {
    logger.error(`RTDB fetch failed for ${path}`, error);
    res.status(STATUS_CODES.SERVICE_UNAVAILABLE).json({ error: 'Service unavailable' });
  }
};

router.get('/timeline', createRtdbFetcher(FIREBASE_PATHS.TIMELINE));
router.get('/phases', createRtdbFetcher(FIREBASE_PATHS.PHASES));
router.get('/glossary', createRtdbFetcher(FIREBASE_PATHS.GLOSSARY));

// ─── Quiz Service ──────────────────────────────────────────

router.get('/quiz/questions', (req, res) => {
  try {
    res.json({ questions: getQuestions() });
  } catch (error) {
    logger.error('Quiz questions endpoint failed', error);
    res.status(STATUS_CODES.INTERNAL_ERROR).json({ error: 'Failed to load quiz questions' });
  }
});

router.post('/quiz/score', verifyAuth, [
  body('answers').isArray({ min: 1 }),
  body('timeTaken').optional().isNumeric(),
], async (req, res) => {
  const valErr = handleValidation(req, res);
  if (valErr) {
    return;
  }

  try {
    const { answers, timeTaken } = req.body;
    const { score, total, results } = calculateScore(answers);
    const firestore = getFirestore();
    const docId = await saveScore(firestore, req.user.uid, score, total, timeTaken);

    res.json({ score, total, results, docId, percentage: Math.round((score / total) * 100) });
  } catch (error) {
    logger.error('Quiz score endpoint failed', error);
    res.status(STATUS_CODES.INTERNAL_ERROR).json({ error: 'Failed to save quiz score' });
  }
});

module.exports = router;

