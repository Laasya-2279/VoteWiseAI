/**
 * @fileoverview API client — centralized fetch wrapper for backend calls.
 * @module api
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Generic fetch wrapper with error handling.
 * @param {string} endpoint - API endpoint relative to base
 * @param {Object} [options={}] - Fetch options
 * @returns {Promise<Response>} Fetch response
 * @throws {Error} If response is not OK
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Sends a chat query to the RAG pipeline.
 * @param {string} query - User question
 * @returns {Promise<Object>} Backend response data
 */
export async function postQuery(query) {
  try {
    const res = await apiFetch('/query', { method: 'POST', body: JSON.stringify({ query }) });
    return res.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Synthesizes text to speech.
 * @param {string} text - Text to convert
 * @returns {Promise<ArrayBuffer>} Audio buffer
 */
export async function postTTS(text) {
  try {
    const res = await apiFetch('/tts', { method: 'POST', body: JSON.stringify({ text }) });
    return res.arrayBuffer();
  } catch (error) {
    throw error;
  }
}

/**
 * Transcribes audio blob to text (STT).
 * @param {Blob} audioBlob - Recorded audio
 * @returns {Promise<Object>} Transcription result
 */
export async function postSTT(audioBlob) {
  try {
    const reader = new FileReader();
    const base64 = await new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
    const res = await apiFetch('/stt', { method: 'POST', body: JSON.stringify({ audio: base64 }) });
    return res.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Checks voter eligibility.
 * @param {Object} data - Form data (age, citizenship, state)
 * @returns {Promise<Object>} Eligibility result
 */
export async function postEligibility(data) {
  try {
    const res = await apiFetch('/eligibility', { method: 'POST', body: JSON.stringify(data) });
    return res.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches the election timeline.
 * @returns {Promise<Object>} Timeline data
 */
export async function getTimeline() {
  try {
    const res = await apiFetch('/timeline');
    return res.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches election phases.
 * @returns {Promise<Object>} Phase data
 */
export async function getPhases() {
  try {
    const res = await apiFetch('/phases');
    return res.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches the election glossary.
 * @returns {Promise<Object>} Glossary terms
 */
export async function getGlossary() {
  try {
    const res = await apiFetch('/glossary');
    return res.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches quiz questions from the backend.
 * @returns {Promise<Object>} Question list
 */
export async function getQuizQuestions() {
  try {
    const res = await apiFetch('/quiz/questions');
    return res.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Submits a quiz score to be saved.
 * @param {Object} answers - User answers
 * @param {number} timeTaken - Duration in seconds
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Submission result
 */
export async function postQuizScore(answers, timeTaken, token) {
  try {
    const res = await apiFetch('/quiz/score', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ answers, timeTaken }),
    });
    return res.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Performs a health check on the backend.
 * @returns {Promise<Object>} Health status
 */
export async function getHealth() {
  try {
    const res = await apiFetch('/health');
    return res.json();
  } catch (error) {
    throw error;
  }
}

