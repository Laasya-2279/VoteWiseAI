'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { trackQuizCompleted } from '@/lib/analytics';

const FALLBACK_QUESTIONS = [
  { id: 'q1', question: 'What is the minimum age required to vote in Indian elections?', options: ['16 years', '18 years', '21 years', '25 years'] },
  { id: 'q2', question: 'What does EVM stand for?', options: ['Electronic Verification Machine', 'Electronic Voting Machine', 'Election Validation Mechanism', 'Electoral Vote Manager'] },
  { id: 'q3', question: 'What is NOTA in Indian elections?', options: ['A political party', 'None Of The Above option on ballot', 'National Online Tracking Application', 'Nomination Of The Applicant'] },
  { id: 'q4', question: 'Who appoints the Chief Election Commissioner of India?', options: ['Prime Minister', 'Parliament', 'President of India', 'Supreme Court'] },
  { id: 'q5', question: 'What is the Model Code of Conduct?', options: ['A set of laws passed by Parliament', 'Guidelines for voter behavior', 'Rules for parties and candidates during elections', 'Code for counting votes'] },
  { id: 'q6', question: 'How many seats are there in the Lok Sabha?', options: ['500', '543', '545', '550'] },
  { id: 'q7', question: 'What does VVPAT stand for?', options: ['Voter Verified Paper Audit Trail', 'Virtual Voting and Paper Technology', 'Verified Vote Print and Track', 'Vote Validation Protocol and Test'] },
  { id: 'q8', question: 'Which article establishes the Election Commission?', options: ['Article 280', 'Article 324', 'Article 356', 'Article 370'] },
  { id: 'q9', question: 'What is the term of the Lok Sabha?', options: ['4 years', '5 years', '6 years', 'No fixed term'] },
  { id: 'q10', question: 'Who is the Returning Officer (RO)?', options: ['A party representative', 'An officer for conduct of election in a constituency', 'A voter who returns ballots', 'A Supreme Court judge'] },
];

const CORRECT_ANSWERS = { q1: 1, q2: 1, q3: 1, q4: 2, q5: 2, q6: 1, q7: 0, q8: 1, q9: 1, q10: 1 };
const EXPLANATIONS = {
  q1: 'As per Article 326, citizens 18+ can vote.', q2: 'EVM = Electronic Voting Machine, used since 1999.',
  q3: 'NOTA lets voters reject all candidates (2013).', q4: 'The President appoints under Article 324.',
  q5: 'MCC governs party/candidate conduct during elections.', q6: 'Lok Sabha has 543 elected seats.',
  q7: 'VVPAT provides paper receipt of the vote cast.', q8: 'Article 324 establishes the ECI.',
  q9: 'Normal term is 5 years from first meeting.', q10: 'RO conducts election in a constituency.',
};

export default function QuizPage() {
  const [questions, setQuestions] = useState(FALLBACK_QUESTIONS);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [startTime] = useState(Date.now());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    (async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
        const res = await fetch(`${API_BASE}/quiz/questions`);
        const data = await res.json();
        if (data.questions?.length > 0) { setQuestions(data.questions); }
      } catch { /* use fallback */ }
    })();
  }, []);

  const handleAnswer = useCallback((selectedIndex) => {
    const q = questions[currentQ];
    const correct = CORRECT_ANSWERS[q.id] === selectedIndex;
    setAnswers((prev) => ({ ...prev, [q.id]: { selectedIndex, correct } }));
    setFeedback({ correct, correctIndex: CORRECT_ANSWERS[q.id] });

    setTimeout(() => {
      setFeedback(null);
      if (currentQ < questions.length - 1) {
        setCurrentQ((prev) => prev + 1);
      } else {
        setShowResult(true);
        const score = Object.values({ ...answers, [q.id]: { selectedIndex, correct } }).filter((a) => a.correct).length;
        const timeTaken = Math.round((Date.now() - startTime) / 1000);
        trackQuizCompleted(score, questions.length, timeTaken);
      }
    }, 1500);
  }, [currentQ, questions, answers, startTime]);

  const score = Object.values(answers).filter((a) => a.correct).length;
  const progress = ((currentQ + (showResult ? 1 : 0)) / questions.length) * 100;

  if (showResult) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto glass-card p-8 text-center">
          <span className="text-6xl" aria-hidden="true">{score >= 8 ? '🏆' : score >= 5 ? '👍' : '📚'}</span>
          <h1 className="font-display text-4xl font-bold mt-4 mb-2">Quiz Complete!</h1>
          <p className="text-5xl font-bold text-gradient mb-2">{score}/{questions.length}</p>
          <p className="text-gray-400 mb-8">{score >= 8 ? 'Excellent! You know your elections!' : score >= 5 ? 'Good effort! Keep learning!' : 'Keep exploring to improve!'}</p>
          <div className="text-left space-y-4 mt-6">
            <h2 className="text-lg font-semibold">Review Answers</h2>
            {questions.map((q, i) => {
              const ans = answers[q.id];
              return (
                <div key={q.id} className={`p-4 rounded-xl border ${ans?.correct ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                  <p className="text-sm font-medium mb-1">{i + 1}. {q.question}</p>
                  <p className="text-xs text-gray-400">Your answer: {q.options[ans?.selectedIndex]} {ans?.correct ? '✓ Correct' : '✗ Wrong'}</p>
                  {!ans?.correct && <p className="text-xs text-saffron-400 mt-1">{EXPLANATIONS[q.id]}</p>}
                </div>
              );
            })}
          </div>
          <button onClick={() => { setCurrentQ(0); setAnswers({}); setShowResult(false); }} className="btn-primary w-full !py-4 mt-8" aria-label="Retake quiz" id="btn-retake">Retake Quiz</button>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }} className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Election <span className="text-gradient">Quiz</span></h1>
          <p className="text-gray-400">Test your knowledge about Indian elections</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Question {currentQ + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label={`Quiz progress: ${Math.round(progress)} percent`}>
            <motion.div className="h-full gradient-saffron rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass-card p-8">
            <h2 className="text-xl font-semibold mb-6">{q.question}</h2>
            <div className="space-y-3" role="radiogroup" aria-label={`Question ${currentQ + 1}: ${q.question}`}>
              {q.options.map((opt, i) => {
                const isSelected = feedback && answers[q.id]?.selectedIndex === i;
                const isCorrect = feedback && CORRECT_ANSWERS[q.id] === i;
                let optionStyle = 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20';
                if (feedback) {
                  if (isCorrect) { optionStyle = 'bg-green-500/20 border-green-500'; }
                  else if (isSelected && !answers[q.id]?.correct) { optionStyle = 'bg-red-500/20 border-red-500'; }
                  else { optionStyle = 'bg-white/5 border-white/5 opacity-50'; }
                }
                return (
                  <button
                    key={i}
                    onClick={() => !feedback && handleAnswer(i)}
                    disabled={!!feedback}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${optionStyle} disabled:cursor-default`}
                    role="radio"
                    aria-checked={isSelected || false}
                    aria-label={`Option ${i + 1}: ${opt}${isCorrect && feedback ? ' (Correct answer)' : ''}`}
                    id={`option-${currentQ}-${i}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCorrect && feedback ? 'border-green-400 text-green-400' : isSelected && feedback ? 'border-red-400 text-red-400' : 'border-gray-500 text-gray-500'}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {feedback && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-3 rounded-xl text-sm ${feedback.correct ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`} role="alert">
                {feedback.correct ? '✓ Correct!' : `✗ Wrong — ${EXPLANATIONS[q.id]}`}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
