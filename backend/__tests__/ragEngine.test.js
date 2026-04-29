/**
 * RAG Engine Tests — retrieval, fallback, source tagging
 */
const { retrieveChunks, generateGroundedResponse } = require('../src/services/ragEngine');

// Mock Firestore
const mockGet = jest.fn();
const mockCollection = jest.fn(() => ({ get: mockGet }));
const mockFirestore = { collection: mockCollection };

// Mock Vertex AI
jest.mock('@google-cloud/vertexai', () => ({
  VertexAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          candidates: [{
            content: {
              parts: [{ text: 'The Election Commission of India oversees all elections.' }],
            },
          }],
        },
      }),
    }),
  })),
}));

describe('RAG Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('retrieveChunks', () => {
    it('returns an array of relevant chunks', async () => {
      const mockDocs = [
        {
          id: 'doc1',
          data: () => ({
            title: 'Voting Process',
            content: 'The voting process in India involves EVMs',
            tags: ['voting', 'process', 'evm'],
            source: 'ECI',
          }),
        },
        {
          id: 'doc2',
          data: () => ({
            title: 'Voter Registration',
            content: 'Citizens must register to vote',
            tags: ['registration', 'voter'],
            source: 'ECI',
          }),
        },
      ];
      mockGet.mockResolvedValue({
        empty: false,
        forEach: (cb) => mockDocs.forEach(cb),
      });

      const chunks = await retrieveChunks('How does voting work?', mockFirestore);
      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.length).toBeLessThanOrEqual(3);
    });

    it('returns empty array for empty query', async () => {
      const chunks = await retrieveChunks('', mockFirestore);
      expect(chunks).toEqual([]);
    });

    it('returns empty array for null query', async () => {
      const chunks = await retrieveChunks(null, mockFirestore);
      expect(chunks).toEqual([]);
    });

    it('handles empty Firestore collection', async () => {
      mockGet.mockResolvedValue({ empty: true, forEach: jest.fn() });
      const chunks = await retrieveChunks('test query', mockFirestore);
      expect(chunks).toEqual([]);
    });

    it('handles Firestore errors gracefully', async () => {
      mockGet.mockRejectedValue(new Error('Firestore unavailable'));
      const chunks = await retrieveChunks('test query', mockFirestore);
      expect(chunks).toEqual([]);
    });

    it('each chunk has expected fields', async () => {
      const mockDocs = [{
        id: 'doc1',
        data: () => ({
          title: 'EVM Explanation',
          content: 'EVM is an Electronic Voting Machine',
          tags: ['evm'],
          source: 'ECI',
        }),
      }];
      mockGet.mockResolvedValue({
        empty: false,
        forEach: (cb) => mockDocs.forEach(cb),
      });

      const chunks = await retrieveChunks('What is EVM?', mockFirestore);
      expect(chunks[0]).toHaveProperty('title');
      expect(chunks[0]).toHaveProperty('content');
    });
  });

  describe('generateGroundedResponse', () => {
    it('returns response with all required fields', async () => {
      const chunks = [
        { id: 'c1', title: 'ECI Role', content: 'ECI oversees elections in India.' },
      ];
      const result = await generateGroundedResponse('What is ECI?', chunks, 'glossary_query');
      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('intent');
      expect(result).toHaveProperty('source');
      expect(result).toHaveProperty('chunksUsed');
      expect(result).toHaveProperty('confidence');
      expect(Array.isArray(result.chunksUsed)).toBe(true);
    });

    it('handles empty chunks with no_context source', async () => {
      const result = await generateGroundedResponse('random question', []);
      expect(result.source).toBe('no_context');
      expect(result.confidence).toBe(0);
      expect(result.response).toContain('could not find');
    });

    it('handles null chunks', async () => {
      const result = await generateGroundedResponse('test', null);
      expect(result.source).toBe('no_context');
    });

    it('response always includes source field', async () => {
      const result = await generateGroundedResponse('test', []);
      expect(typeof result.source).toBe('string');
      expect(result.source.length).toBeGreaterThan(0);
    });
  });
});
