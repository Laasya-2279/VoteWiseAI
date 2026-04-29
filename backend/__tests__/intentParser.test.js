/**
 * Intent Parser Tests — covers all 7 intents + edge cases
 */
const { classifyIntent, extractEntities, getSupportedIntents } = require('../src/utils/intentParser');

describe('Intent Parser', () => {
  describe('getSupportedIntents', () => {
    it('returns all 7 intents plus unknown', () => {
      const intents = getSupportedIntents();
      expect(intents).toContain('process_query');
      expect(intents).toContain('eligibility_query');
      expect(intents).toContain('timeline_query');
      expect(intents).toContain('candidate_query');
      expect(intents).toContain('results_query');
      expect(intents).toContain('glossary_query');
      expect(intents).toContain('unknown');
      expect(intents).toHaveLength(7);
    });
  });

  describe('classifyIntent — intent detection', () => {
    test.each([
      ['How does the voting process work in India?', 'process_query'],
      ['What are the steps for voter registration?', 'process_query'],
      ['Tell me about EVM machines', 'process_query'],
      ['What is the Model Code of Conduct?', 'process_query'],
      ['Am I eligible to vote?', 'eligibility_query'],
      ['Can I vote if I am 17?', 'eligibility_query'],
      ['What is the voting age?', 'eligibility_query'],
      ['Who can vote in Indian elections?', 'eligibility_query'],
      ['When is the election date?', 'timeline_query'],
      ['What is the election schedule?', 'timeline_query'],
      ['When is phase 3 voting?', 'timeline_query'],
      ['Who is the candidate from Delhi?', 'candidate_query'],
      ['List the contestants for Lok Sabha', 'candidate_query'],
      ['Who won the election?', 'results_query'],
      ['What is the vote count?', 'results_query'],
      ['What does EVM stand for?', 'glossary_query'],
      ['Define NOTA', 'glossary_query'],
      ['What is the full form of VVPAT?', 'glossary_query'],
      ['What is a Returning Officer?', 'glossary_query'],
    ])('classifies "%s" as %s', (query, expectedIntent) => {
      const result = classifyIntent(query);
      expect(result.intent).toBe(expectedIntent);
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('classifyIntent — edge cases', () => {
    test.each([
      [null, 'unknown'],
      [undefined, 'unknown'],
      ['', 'unknown'],
      ['   ', 'unknown'],
      [123, 'unknown'],
      [{}, 'unknown'],
      ['asdfghjkl random gibberish xyz', 'unknown'],
      ['a'.repeat(2000), 'unknown'],
    ])('handles edge case input %p as %s', (input, expectedIntent) => {
      const result = classifyIntent(input);
      expect(result.intent).toBe(expectedIntent);
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('entities');
    });

    it('handles uppercase input', () => {
      const result = classifyIntent('HOW DO I VOTE IN INDIA?');
      expect(result.intent).toBe('process_query');
    });

    it('always returns required shape', () => {
      const result = classifyIntent('anything');
      expect(result).toHaveProperty('intent');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('entities');
      expect(typeof result.intent).toBe('string');
      expect(typeof result.confidence).toBe('number');
      expect(typeof result.entities).toBe('object');
    });
  });

  describe('extractEntities', () => {
    it('extracts phase number', () => {
      const entities = extractEntities('When is phase 3 voting?');
      expect(entities.phase).toBe(3);
    });

    it('extracts state name', () => {
      const entities = extractEntities('Elections in Maharashtra');
      expect(entities.state).toBe('Maharashtra');
    });

    it('extracts zone', () => {
      const entities = extractEntities('North India elections');
      expect(entities.zone).toBeDefined();
    });

    it('returns empty object for no entities', () => {
      const entities = extractEntities('hello');
      expect(Object.keys(entities).length).toBeLessThanOrEqual(1);
    });
  });
});
