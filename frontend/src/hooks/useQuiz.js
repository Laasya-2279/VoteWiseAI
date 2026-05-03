/**
 * @fileoverview Custom hook for managing quiz state and scoring logic.
 * @module useQuiz
 */

import { useState, useEffect, useCallback } from 'react';
import { getQuizQuestions } from '@/lib/api';
import { trackQuizCompleted } from '@/lib/analytics';

const CORRECT_ANSWERS = { q1: 1, q2: 1, q3: 1, q4: 2, q5: 2, q6: 1, q7: 0, q8: 1, q9: 1, q10: 1 };
const EXPLANATIONS = {
  q1: 'As per Article 326, citizens 18+ can vote.', q2: 'EVM = Electronic Voting Machine, used since 1999.',
  q3: 'NOTA lets voters reject all candidates (2013).', q4: 'The President appoints under Article 324.',
  q5: 'MCC governs party/candidate conduct during elections.', q6: 'Lok Sabha has 543 elected seats.',
  q7: 'VVPAT provides paper receipt of the vote cast.', q8: 'Article 324 establishes the ECI.',
  q9: 'Normal term is 5 years from first meeting.', q10: 'RO conducts election in a constituency.',
};

/**
 * Hook to manage quiz flow.
 * @returns {Object} Quiz state and handlers
 */
export function useQuiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [startTime] = useState(Date.now());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const fetchQuestions = async () => {
      try {
        const data = await getQuizQuestions();
        if (data.questions?.length > 0) setQuestions(data.questions);
      } catch (err) {
        // Fallback or error handled by state
      }
    };
    fetchQuestions();
  }, []);

  /**
   * Handles user selecting an answer.
   * @param {number} selectedIndex - Index of selected option
   */
  const handleAnswer = useCallback((selectedIndex) => {
    const q = questions[currentQ];
    if (!q) return;

    const correct = CORRECT_ANSWERS[q.id] === selectedIndex;
    const newAnswers = { ...answers, [q.id]: { selectedIndex, correct } };
    
    setAnswers(newAnswers);
    setFeedback({ correct, correctIndex: CORRECT_ANSWERS[q.id], explanation: EXPLANATIONS[q.id] });

    setTimeout(() => {
      setFeedback(null);
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
      } else {
        setShowResult(true);
        const score = Object.values(newAnswers).filter(a => a.correct).length;
        const timeTaken = Math.round((Date.now() - startTime) / 1000);
        trackQuizCompleted(score, questions.length, timeTaken);
      }
    }, 1500);
  }, [currentQ, questions, answers, startTime]);

  /**
   * Resets the quiz.
   */
  const restartQuiz = useCallback(() => {
    setCurrentQ(0);
    setAnswers({});
    setShowResult(false);
    setFeedback(null);
  }, []);

  const score = Object.values(answers).filter(a => a.correct).length;
  const progress = questions.length > 0 ? ((currentQ + (showResult ? 1 : 0)) / questions.length) * 100 : 0;

  return {
    questions,
    currentQ,
    answers,
    showResult,
    feedback,
    score,
    progress,
    isLoaded,
    handleAnswer,
    restartQuiz
  };
}
