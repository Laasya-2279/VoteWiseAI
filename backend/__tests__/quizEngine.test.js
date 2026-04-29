/**
 * Quiz Engine Tests — scoring, edge cases, question retrieval
 */
const { getQuestions, calculateScore, QUIZ_QUESTIONS } = require('../src/services/quizEngine');

describe('Quiz Engine', () => {
  describe('getQuestions', () => {
    it('returns 10 questions', () => {
      const questions = getQuestions();
      expect(questions).toHaveLength(10);
    });

    it('does not expose correct answers', () => {
      const questions = getQuestions();
      questions.forEach((q) => {
        expect(q).not.toHaveProperty('correctIndex');
        expect(q).not.toHaveProperty('explanation');
      });
    });

    it('each question has id, question, and options', () => {
      const questions = getQuestions();
      questions.forEach((q) => {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('question');
        expect(q).toHaveProperty('options');
        expect(q.options.length).toBe(4);
      });
    });
  });

  describe('calculateScore', () => {
    it('returns perfect score 10/10 for all correct answers', () => {
      const answers = QUIZ_QUESTIONS.map((q) => ({
        questionId: q.id,
        selectedIndex: q.correctIndex,
      }));
      const result = calculateScore(answers);
      expect(result.score).toBe(10);
      expect(result.total).toBe(10);
    });

    it('returns 0/10 for all wrong answers', () => {
      const answers = QUIZ_QUESTIONS.map((q) => ({
        questionId: q.id,
        selectedIndex: (q.correctIndex + 1) % 4,
      }));
      const result = calculateScore(answers);
      expect(result.score).toBe(0);
      expect(result.total).toBe(10);
    });

    it('calculates partial score correctly', () => {
      const answers = [
        { questionId: 'q1', selectedIndex: QUIZ_QUESTIONS[0].correctIndex },
        { questionId: 'q2', selectedIndex: (QUIZ_QUESTIONS[1].correctIndex + 1) % 4 },
        { questionId: 'q3', selectedIndex: QUIZ_QUESTIONS[2].correctIndex },
      ];
      const result = calculateScore(answers);
      expect(result.score).toBe(2);
    });

    it('returns results with explanation for each answer', () => {
      const answers = [{ questionId: 'q1', selectedIndex: 0 }];
      const result = calculateScore(answers);
      expect(result.results[0]).toHaveProperty('explanation');
      expect(result.results[0]).toHaveProperty('correct');
      expect(result.results[0]).toHaveProperty('correctIndex');
    });

    it('handles empty array', () => {
      const result = calculateScore([]);
      expect(result.score).toBe(0);
      expect(result.total).toBe(10);
    });

    it('handles non-array input', () => {
      const result = calculateScore(null);
      expect(result.score).toBe(0);
      expect(result.results).toEqual([]);
    });

    it('handles invalid question IDs', () => {
      const answers = [{ questionId: 'nonexistent', selectedIndex: 0 }];
      const result = calculateScore(answers);
      expect(result.score).toBe(0);
    });

    it('handles invalid selectedIndex', () => {
      const answers = [{ questionId: 'q1', selectedIndex: -1 }];
      const result = calculateScore(answers);
      expect(result.score).toBe(0);
      expect(result.results[0].correct).toBe(false);
    });

    it('handles missing questionId', () => {
      const answers = [{ selectedIndex: 0 }];
      const result = calculateScore(answers);
      expect(result.score).toBe(0);
    });
  });
});
