const { generateWithRetry } = require('../src/services/llmService');

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      candidates: [{ content: { parts: [{ text: 'Mock LLM Response' }] } }]
    })
  })
);

jest.mock('../src/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

describe('LLM Service', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('generates response', async () => {
    const res = await generateWithRetry('test prompt');
    expect(res).toBe('Mock LLM Response');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('throws error if no API key', async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(generateWithRetry('test')).rejects.toThrow('GEMINI_API_KEY is not defined');
  });
});
