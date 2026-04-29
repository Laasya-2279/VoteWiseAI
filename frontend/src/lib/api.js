/**
 * API client — centralized fetch wrapper for backend calls
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  return response;
}

export async function postQuery(query) {
  const res = await apiFetch('/query', { method: 'POST', body: JSON.stringify({ query }) });
  return res.json();
}

export async function postTTS(text) {
  const res = await apiFetch('/tts', { method: 'POST', body: JSON.stringify({ text }) });
  return res.arrayBuffer();
}

export async function postSTT(audioBlob) {
  const reader = new FileReader();
  const base64 = await new Promise((resolve) => {
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(audioBlob);
  });
  const res = await apiFetch('/stt', { method: 'POST', body: JSON.stringify({ audio: base64 }) });
  return res.json();
}

export async function postEligibility(data) {
  const res = await apiFetch('/eligibility', { method: 'POST', body: JSON.stringify(data) });
  return res.json();
}

export async function getTimeline() {
  const res = await apiFetch('/timeline');
  return res.json();
}

export async function getPhases() {
  const res = await apiFetch('/phases');
  return res.json();
}

export async function getGlossary() {
  const res = await apiFetch('/glossary');
  return res.json();
}

export async function getQuizQuestions() {
  const res = await apiFetch('/quiz/questions');
  return res.json();
}

export async function postQuizScore(answers, timeTaken, token) {
  const res = await apiFetch('/quiz/score', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ answers, timeTaken }),
  });
  return res.json();
}

export async function getHealth() {
  const res = await apiFetch('/health');
  return res.json();
}
