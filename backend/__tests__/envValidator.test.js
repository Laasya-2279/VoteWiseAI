const { validateEnv } = require('../src/utils/envValidator');

describe('Env Validator', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('throws when required vars are missing', () => {
    delete process.env.FIREBASE_PROJECT_ID;
    expect(() => validateEnv()).toThrow('Missing required environment variables');
  });

  it('passes when required vars are present', () => {
    process.env.FIREBASE_PROJECT_ID = 'test';
    process.env.GOOGLE_CLOUD_PROJECT = 'test';
    expect(() => validateEnv()).not.toThrow();
  });
});
