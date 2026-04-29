/**
 * API Integration Tests — every endpoint with supertest
 */
const request = require('supertest');

// Mock Firebase Admin before app loads
jest.mock('firebase-admin', () => {
  const mockDoc = { id: 'test-doc-id' };
  const mockFirestore = {
    collection: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({
        empty: true,
        forEach: jest.fn(),
      }),
      add: jest.fn().mockResolvedValue(mockDoc),
    }),
  };
  const mockRTDB = {
    ref: jest.fn().mockReturnValue({
      once: jest.fn().mockResolvedValue({
        val: jest.fn().mockReturnValue({
          stage1: { name: 'Announcement', description: 'Election announced' },
        }),
      }),
    }),
  };
  const mockAuth = {
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-user-123' }),
  };

  return {
    initializeApp: jest.fn(),
    credential: {
      applicationDefault: jest.fn(),
      cert: jest.fn(),
    },
    firestore: jest.fn(() => mockFirestore),
    database: jest.fn(() => mockRTDB),
    auth: jest.fn(() => mockAuth),
  };
});

// Mock Vertex AI
jest.mock('@google-cloud/vertexai', () => ({
  VertexAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          candidates: [{
            content: { parts: [{ text: 'Mocked AI response about elections.' }] },
          }],
        },
      }),
    }),
  })),
}));

// Mock TTS
jest.mock('@google-cloud/text-to-speech', () => ({
  TextToSpeechClient: jest.fn().mockImplementation(() => ({
    synthesizeSpeech: jest.fn().mockResolvedValue([{ audioContent: Buffer.from('fake-audio') }]),
  })),
}));

// Mock STT
jest.mock('@google-cloud/speech', () => ({
  SpeechClient: jest.fn().mockImplementation(() => ({
    recognize: jest.fn().mockResolvedValue([{
      results: [{ alternatives: [{ transcript: 'How do I vote' }] }],
    }]),
  })),
}));

const { app } = require('../src/index');

describe('API Endpoints', () => {
  describe('GET /api/health', () => {
    it('returns 200 with ok status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body.service).toBe('votewise-ai-backend');
    });
  });

  describe('POST /api/query', () => {
    it('returns 200 with query response', async () => {
      const res = await request(app)
        .post('/api/query')
        .send({ query: 'How does voting work in India?' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('response');
      expect(res.body).toHaveProperty('intent');
      expect(res.body).toHaveProperty('source');
      expect(res.body).toHaveProperty('chunksUsed');
      expect(res.body).toHaveProperty('confidence');
    });

    it('returns 400 for missing query', async () => {
      const res = await request(app)
        .post('/api/query')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 for empty query', async () => {
      const res = await request(app)
        .post('/api/query')
        .send({ query: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/tts', () => {
    it('returns audio for valid text', async () => {
      const res = await request(app)
        .post('/api/tts')
        .send({ text: 'Hello voter' });
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('audio/mpeg');
    });

    it('returns 400 for missing text', async () => {
      const res = await request(app)
        .post('/api/tts')
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/stt', () => {
    it('returns transcript for audio data', async () => {
      const res = await request(app)
        .post('/api/stt')
        .send({ audio: Buffer.from('fake-audio').toString('base64') });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('transcript');
    });

    it('returns 400 for missing audio', async () => {
      const res = await request(app)
        .post('/api/stt')
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/eligibility', () => {
    it('returns eligible for valid adult citizen', async () => {
      const res = await request(app)
        .post('/api/eligibility')
        .send({ age: 20, state: 'Delhi', citizenship: 'Indian' });
      expect(res.status).toBe(200);
      expect(res.body.eligible).toBe(true);
    });

    it('returns not eligible for underage', async () => {
      const res = await request(app)
        .post('/api/eligibility')
        .send({ age: 16, state: 'Delhi', citizenship: 'Indian' });
      expect(res.status).toBe(200);
      expect(res.body.eligible).toBe(false);
    });

    it('returns 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/eligibility')
        .send({ age: 20 });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/timeline', () => {
    it('returns timeline stages', async () => {
      const res = await request(app).get('/api/timeline');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('stages');
      expect(Array.isArray(res.body.stages)).toBe(true);
    });
  });

  describe('GET /api/phases', () => {
    it('returns election phases', async () => {
      const res = await request(app).get('/api/phases');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('phases');
    });
  });

  describe('GET /api/glossary', () => {
    it('returns glossary terms', async () => {
      const res = await request(app).get('/api/glossary');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('terms');
    });
  });

  describe('GET /api/quiz/questions', () => {
    it('returns 10 quiz questions', async () => {
      const res = await request(app).get('/api/quiz/questions');
      expect(res.status).toBe(200);
      expect(res.body.questions).toHaveLength(10);
    });
  });

  describe('POST /api/quiz/score', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/quiz/score')
        .send({ answers: [{ questionId: 'q1', selectedIndex: 1 }] });
      expect(res.status).toBe(401);
    });

    it('returns score with valid auth', async () => {
      const res = await request(app)
        .post('/api/quiz/score')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ answers: [{ questionId: 'q1', selectedIndex: 1 }], timeTaken: 30 });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('score');
      expect(res.body).toHaveProperty('total');
    });

    it('returns 400 for missing answers', async () => {
      const res = await request(app)
        .post('/api/quiz/score')
        .set('Authorization', 'Bearer valid-test-token')
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('404 handling', () => {
    it('returns 404 for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
