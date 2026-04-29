// Jest setup — set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '8081';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.GOOGLE_CLOUD_PROJECT = 'test-project';
process.env.FIREBASE_DATABASE_URL = 'https://test-project-default-rtdb.firebaseio.com';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX = '200';
process.env.VOICE_RATE_LIMIT_MAX = '30';
process.env.VERTEX_AI_LOCATION = 'asia-south1';
process.env.VERTEX_AI_MODEL = 'gemini-1.5-pro';
process.env.GOOGLE_TTS_LANGUAGE_CODE = 'en-IN';
process.env.GOOGLE_TTS_VOICE_NAME = 'en-IN-Wavenet-D';
process.env.GOOGLE_STT_LANGUAGE_CODE = 'en-IN';
