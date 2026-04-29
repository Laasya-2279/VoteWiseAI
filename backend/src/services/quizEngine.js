/**
 * Quiz Engine — election quiz questions, scoring, and persistence
 */
const { logger } = require('../utils/logger');

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the minimum age required to vote in Indian elections?',
    options: ['16 years', '18 years', '21 years', '25 years'],
    correctIndex: 1,
    explanation: 'As per Article 326 of the Indian Constitution, every citizen who is 18 years of age or above is entitled to vote.',
  },
  {
    id: 'q2',
    question: 'What does EVM stand for?',
    options: ['Electronic Verification Machine', 'Electronic Voting Machine', 'Election Validation Mechanism', 'Electoral Vote Manager'],
    correctIndex: 1,
    explanation: 'EVM stands for Electronic Voting Machine, used in Indian elections since 1999 for casting votes electronically.',
  },
  {
    id: 'q3',
    question: 'What is NOTA in Indian elections?',
    options: ['A political party', 'None Of The Above option on ballot', 'National Online Tracking Application', 'Nomination Of The Applicant'],
    correctIndex: 1,
    explanation: 'NOTA (None Of The Above) allows voters to reject all candidates. It was introduced by the Supreme Court in 2013.',
  },
  {
    id: 'q4',
    question: 'Who appoints the Chief Election Commissioner of India?',
    options: ['Prime Minister', 'Parliament', 'President of India', 'Supreme Court'],
    correctIndex: 2,
    explanation: 'The Chief Election Commissioner is appointed by the President of India under Article 324 of the Constitution.',
  },
  {
    id: 'q5',
    question: 'What is the Model Code of Conduct?',
    options: ['A set of laws passed by Parliament', 'Guidelines for voter behavior', 'Rules for parties and candidates during elections', 'Code for counting votes'],
    correctIndex: 2,
    explanation: 'The Model Code of Conduct is a set of guidelines issued by the ECI for political parties and candidates to ensure free and fair elections.',
  },
  {
    id: 'q6',
    question: 'How many seats are there in the Lok Sabha?',
    options: ['500', '543', '545', '550'],
    correctIndex: 1,
    explanation: 'The Lok Sabha has 543 elected seats. Members are directly elected by the people from single-member constituencies.',
  },
  {
    id: 'q7',
    question: 'What does VVPAT stand for?',
    options: ['Voter Verified Paper Audit Trail', 'Virtual Voting and Paper Technology', 'Verified Vote Print and Track', 'Vote Validation Protocol and Test'],
    correctIndex: 0,
    explanation: 'VVPAT (Voter Verified Paper Audit Trail) provides a paper receipt of the vote cast, allowing voters to verify their choice.',
  },
  {
    id: 'q8',
    question: 'Which article of the Indian Constitution establishes the Election Commission?',
    options: ['Article 280', 'Article 324', 'Article 356', 'Article 370'],
    correctIndex: 1,
    explanation: 'Article 324 vests the superintendence, direction, and control of elections in the Election Commission of India.',
  },
  {
    id: 'q9',
    question: 'What is the term of the Lok Sabha?',
    options: ['4 years', '5 years', '6 years', 'No fixed term'],
    correctIndex: 1,
    explanation: 'The normal term of the Lok Sabha is 5 years from the date of its first meeting, unless dissolved earlier.',
  },
  {
    id: 'q10',
    question: 'Who is the Returning Officer (RO) in an election?',
    options: [
      'A party representative who returns results',
      'An officer responsible for conduct of election in a constituency',
      'A voter who returns ballot papers',
      'A Supreme Court judge overseeing elections',
    ],
    correctIndex: 1,
    explanation: 'The Returning Officer (RO) is appointed for each constituency and is responsible for the proper conduct of the election and declaration of results.',
  },
];

/**
 * Get quiz questions (returns questions without correct answers for client)
 * @returns {Array<{id: string, question: string, options: string[]}>}
 */
function getQuestions() {
  return QUIZ_QUESTIONS.map(({ id, question, options }) => ({
    id,
    question,
    options,
  }));
}

/**
 * Calculate score from user answers
 * @param {Array<{questionId: string, selectedIndex: number}>} answers
 * @returns {{score: number, total: number, results: Array<{questionId: string, correct: boolean, correctIndex: number, explanation: string}>}}
 */
function calculateScore(answers) {
  if (!Array.isArray(answers)) {
    return { score: 0, total: QUIZ_QUESTIONS.length, results: [] };
  }

  let score = 0;
  const results = [];

  for (const answer of answers) {
    if (!answer || typeof answer.questionId !== 'string') {
      continue;
    }

    const question = QUIZ_QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) {
      continue;
    }

    const selectedIndex = Number(answer.selectedIndex);
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= question.options.length) {
      results.push({
        questionId: answer.questionId,
        correct: false,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
      });
      continue;
    }

    const correct = selectedIndex === question.correctIndex;
    if (correct) {
      score++;
    }

    results.push({
      questionId: answer.questionId,
      correct,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
    });
  }

  return { score, total: QUIZ_QUESTIONS.length, results };
}

/**
 * Save quiz score to Firestore
 * @param {object} firestore - Firestore instance
 * @param {string} userId - Authenticated user ID
 * @param {number} score - User score
 * @param {number} total - Total questions
 * @param {number} timeTaken - Time in seconds
 * @returns {Promise<string>} Document ID
 */
async function saveScore(firestore, userId, score, total, timeTaken) {
  try {
    const docRef = await firestore.collection('quiz_scores').add({
      userId,
      score,
      total,
      timeTaken: timeTaken || 0,
      percentage: Math.round((score / total) * 100),
      completedAt: new Date().toISOString(),
    });
    logger.info('Quiz score saved', { userId, score, total, docId: docRef.id });
    return docRef.id;
  } catch (error) {
    logger.error('Failed to save quiz score', error);
    throw error;
  }
}

module.exports = {
  getQuestions,
  calculateScore,
  saveScore,
  QUIZ_QUESTIONS,
};
