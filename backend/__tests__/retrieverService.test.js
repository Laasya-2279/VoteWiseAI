const { retrieveTopK } = require('../src/services/retrieverService');
const { getFirestore } = require('../src/config/firebase');

jest.mock('../src/config/firebase');
jest.mock('../src/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

describe('Retriever Service', () => {
  test('returns empty if snapshot empty', async () => {
    getFirestore.mockReturnValue({
      collection: () => ({ get: jest.fn().mockResolvedValue({ empty: true }) })
    });
    const res = await retrieveTopK(['test']);
    expect(res).toEqual([]);
  });

  test('returns ranked documents', async () => {
    const mockDocs = {
      empty: false,
      forEach: cb => {
        cb({ id: '1', data: () => ({ title: 'test doc', content: 'test content' }) });
        cb({ id: '2', data: () => ({ title: 'other', content: 'irrelevant' }) });
      }
    };
    getFirestore.mockReturnValue({
      collection: () => ({ get: jest.fn().mockResolvedValue(mockDocs) })
    });

    const res = await retrieveTopK(['test'], 1);
    expect(res.length).toBe(1);
    expect(res[0].id).toBe('1');
  });
});
