const { generateEmbedding } = require('../src/services/embeddingService');

jest.mock('../src/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

describe('Embedding Service', () => {
  test('generates keyword array correctly', async () => {
    const res = await generateEmbedding('Hello world test query');
    expect(res).toContain('hello');
    expect(res).toContain('world');
    expect(res).toContain('test');
    expect(res).toContain('query');
  });
});
