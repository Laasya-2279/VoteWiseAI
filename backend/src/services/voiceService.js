/**
 * Voice Service — Google Cloud Text-to-Speech and Speech-to-Text
 */
const { logger } = require('../utils/logger');

let ttsClient;
let sttClient;

/**
 * Initialize TTS client lazily
 */
function getTTSClient() {
  if (!ttsClient) {
    const textToSpeech = require('@google-cloud/text-to-speech');
    ttsClient = new textToSpeech.TextToSpeechClient();
    logger.info('Google Cloud TTS client initialized');
  }
  return ttsClient;
}

/**
 * Initialize STT client lazily
 */
function getSTTClient() {
  if (!sttClient) {
    const speech = require('@google-cloud/speech');
    sttClient = new speech.SpeechClient();
    logger.info('Google Cloud STT client initialized');
  }
  return sttClient;
}

/**
 * Convert text to speech using Google Cloud TTS
 * @param {string} text - Text to synthesize
 * @returns {Promise<Buffer>} Audio buffer (MP3)
 */
async function synthesizeSpeech(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Text is required for speech synthesis');
  }

  const client = getTTSClient();

  const request = {
    input: { text: text.substring(0, 5000) },
    voice: {
      languageCode: process.env.GOOGLE_TTS_LANGUAGE_CODE || 'en-IN',
      name: process.env.GOOGLE_TTS_VOICE_NAME || 'en-IN-Wavenet-D',
      ssmlGender: 'MALE',
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0,
    },
  };

  const [response] = await client.synthesizeSpeech(request);
  logger.info('TTS synthesis completed', { textLength: text.length });
  return response.audioContent;
}

/**
 * Convert audio to text using Google Cloud STT
 * @param {Buffer} audioBuffer - Audio data
 * @param {string} encoding - Audio encoding (default: WEBM_OPUS)
 * @returns {Promise<string>} Transcribed text
 */
async function transcribeSpeech(audioBuffer, encoding = 'WEBM_OPUS') {
  if (!audioBuffer || audioBuffer.length === 0) {
    throw new Error('Audio data is required for transcription');
  }

  const client = getSTTClient();

  const request = {
    audio: {
      content: audioBuffer.toString('base64'),
    },
    config: {
      encoding,
      sampleRateHertz: 48000,
      languageCode: process.env.GOOGLE_STT_LANGUAGE_CODE || 'en-IN',
      model: 'latest_long',
      enableAutomaticPunctuation: true,
    },
  };

  const [response] = await client.recognize(request);
  const transcript = response.results
    ?.map((r) => r.alternatives?.[0]?.transcript)
    .filter(Boolean)
    .join(' ') || '';

  logger.info('STT transcription completed', { transcriptLength: transcript.length });
  return transcript;
}

module.exports = {
  synthesizeSpeech,
  transcribeSpeech,
  getTTSClient,
  getSTTClient,
};
