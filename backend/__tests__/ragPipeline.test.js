const { ragPipeline } = require('../src/services/ragPipeline');
const embeddingService = require('../src/services/embeddingService');
const retrieverService = require('../src/services/retrieverService');
const promptBuilder = require('../src/services/promptBuilder');
const llmService = require('../src/services/llmService');

jest.mock('../src/services/embeddingService');
jest.mock('../src/services/retrieverService');
jest.mock('../src/services/promptBuilder');
jest.mock('../src/services/llmService');
jest.mock('../src/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

describe('RAG Pipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns error for empty query', async () => {
    const res = await ragPipeline('');
    expect(res.response).toContain('Please provide a valid question');
  });

  test('returns fallback if no documents retrieved', async () => {
    embeddingService.generateEmbedding.mockResolvedValue(['test']);
    retrieverService.retrieveTopK.mockResolvedValue([]);
    const res = await ragPipeline('test query');
    expect(res.source).toBe('no_context');
  });

  test('returns llm response for successful flow', async () => {
    const docs = [{ id: '1', title: 'test doc', content: 'test content' }];
    embeddingService.generateEmbedding.mockResolvedValue(['test']);
    retrieverService.retrieveTopK.mockResolvedValue(docs);
    promptBuilder.buildPrompt.mockReturnValue('mock prompt');
    llmService.generateWithRetry.mockResolvedValue('LLM Output');

    const res = await ragPipeline('test query');
    expect(res.response).toBe('LLM Output');
    expect(res.chunksUsed).toEqual(['1']);
    expect(res.confidence).toBeLessThanOrEqual(1);
  });

  test('returns fallback chunks if LLM fails', async () => {
    const docs = [{ id: '1', title: 'test doc', content: 'test content' }];
    embeddingService.generateEmbedding.mockResolvedValue(['test']);
    retrieverService.retrieveTopK.mockResolvedValue(docs);
    promptBuilder.buildPrompt.mockReturnValue('mock prompt');
    llmService.generateWithRetry.mockRejectedValue(new Error('LLM Failed'));

    const res = await ragPipeline('test query');
    expect(res.source).toBe('fallback_chunks');
    expect(res.response).toContain('test content');
  });

  test('returns error object if pipeline fails entirely', async () => {
    embeddingService.generateEmbedding.mockRejectedValue(new Error('Critical error'));
    const res = await ragPipeline('test query');
    expect(res.source).toBe('error');
    expect(res.response).toContain('unable to retrieve information');
  });
});
