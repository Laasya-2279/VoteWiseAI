/**
 * @fileoverview Election Knowledge Quiz Page.
 * @module QuizPage
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '@/hooks/useQuiz';

/**
 * Main Quiz Page component.
 * @returns {JSX.Element}
 */
export default function QuizPage() {
  const {
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
  } = useQuiz();

  if (questions.length === 0 && isLoaded) {
    return (
      <div className="pt-24 px-4 text-center">
        <p className="text-gray-400">Loading questions...</p>
      </div>
    );
  }

  if (showResult) {
    return (
      <QuizResult 
        score={score} 
        total={questions.length} 
        questions={questions} 
        answers={answers} 
        onRestart={restartQuiz} 
      />
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
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Quiz progress">
            <motion.div className="h-full gradient-saffron rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          {q && (
            <motion.div key={q.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass-card p-8">
              <h2 className="text-xl font-semibold mb-6">{q.question}</h2>
              <div className="space-y-3" role="radiogroup" aria-label={`Question ${currentQ + 1}`}>
                {q.options.map((opt, i) => {
                  const isSelected = feedback && answers[q.id]?.selectedIndex === i;
                  const isCorrect = feedback && feedback.correctIndex === i;
                  let optionStyle = 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20';
                  
                  if (feedback) {
                    if (isCorrect) optionStyle = 'bg-green-500/20 border-green-500';
                    else if (isSelected) optionStyle = 'bg-red-500/20 border-red-500';
                    else optionStyle = 'bg-white/5 border-white/5 opacity-50';
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => !feedback && handleAnswer(i)}
                      disabled={!!feedback}
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${optionStyle} disabled:cursor-default`}
                      role="radio"
                      aria-checked={isSelected}
                      id={`option-${currentQ}-${i}`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCorrect && feedback ? 'border-green-400 text-green-400' : 
                          isSelected && feedback ? 'border-red-400 text-red-400' : 'border-gray-500 text-gray-500'
                        }`}>
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
                  {feedback.correct ? '✓ Correct!' : `✗ Wrong — ${feedback.explanation}`}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Quiz Results component.
 * @param {Object} props - Component props
 * @returns {JSX.Element}
 */
function QuizResult({ score, total, questions, answers, onRestart }) {
  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto glass-card p-8 text-center">
        <span className="text-6xl" aria-hidden="true">{score >= 8 ? '🏆' : score >= 5 ? '👍' : '📚'}</span>
        <h1 className="font-display text-4xl font-bold mt-4 mb-2">Quiz Complete!</h1>
        <p className="text-5xl font-bold text-gradient mb-2">{score}/{total}</p>
        <p className="text-gray-400 mb-8">{score >= 8 ? 'Excellent! You know your elections!' : score >= 5 ? 'Good effort! Keep learning!' : 'Keep exploring to improve!'}</p>
        
        <div className="text-left space-y-4 mt-6">
          <h2 className="text-lg font-semibold border-b border-white/5 pb-2">Review Answers</h2>
          {questions.map((q, i) => {
            const ans = answers[q.id];
            return (
              <div key={q.id} className={`p-4 rounded-xl border ${ans?.correct ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <p className="text-sm font-medium mb-1">{i + 1}. {q.question}</p>
                <p className="text-xs text-gray-400">
                  Your answer: <span className="text-white">{q.options[ans?.selectedIndex] || 'Skipped'}</span> {ans?.correct ? '✓' : '✗'}
                </p>
              </div>
            );
          })}
        </div>
        
        <button onClick={onRestart} className="btn-primary w-full !py-4 mt-8" id="btn-retake">Retake Quiz</button>
      </motion.div>
    </div>
  );
}
