/**
 * @fileoverview Custom hook for voice interactions (STT/TTS).
 * @module useVoice
 */

import { useState, useRef, useCallback } from 'react';
import { postSTT, postTTS } from '@/lib/api';
import { trackVoiceInputUsed } from '@/lib/analytics';

/**
 * Hook to manage voice recording and playback.
 * @returns {Object} Voice state and handlers
 */
export function useVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const audioContext = useRef(null);

  /**
   * Starts audio recording from the microphone.
   */
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Microphone access denied:', error);
    }
  }, []);

  /**
   * Stops recording and processes the audio via STT.
   * @returns {Promise<string|null>} Transcribed text or null
   */
  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      if (!mediaRecorder.current) return resolve(null);

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        try {
          const { text } = await postSTT(audioBlob);
          trackVoiceInputUsed(true);
          resolve(text);
        } catch (error) {
          trackVoiceInputUsed(false);
          resolve(null);
        } finally {
          setIsRecording(false);
        }
      };

      mediaRecorder.current.stop();
    });
  }, []);

  /**
   * Converts text to speech and plays it.
   * @param {string} text - Text to speak
   */
  const speak = useCallback(async (text) => {
    if (!text) return;
    try {
      setIsSpeaking(true);
      const buffer = await postTTS(text);
      
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const audioBuffer = await audioContext.current.decodeAudioData(buffer);
      const source = audioContext.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.current.destination);
      source.onended = () => setIsSpeaking(false);
      source.start(0);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('TTS Playback failed:', error);
      setIsSpeaking(false);
    }
  }, []);

  return {
    isRecording,
    isSpeaking,
    startRecording,
    stopRecording,
    speak
  };
}
