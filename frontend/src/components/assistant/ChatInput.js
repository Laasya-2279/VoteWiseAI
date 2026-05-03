/**
 * @fileoverview Chat Input component for the AI assistant.
 * @module ChatInput
 */

import PropTypes from 'prop-types';
import { useState } from 'react';

/**
 * Renders the text input and voice controls for chat.
 * @param {Object} props - Component props
 * @param {Function} props.onSend - Callback for sending text
 * @param {boolean} props.isLoading - Whether message is being sent
 * @param {boolean} props.isRecording - Whether audio is being recorded
 * @param {Function} props.onStartRecord - Callback to start recording
 * @param {Function} props.onStopRecord - Callback to stop recording
 * @returns {JSX.Element}
 */
export default function ChatInput({ onSend, isLoading, isRecording, onStartRecord, onStopRecord }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      const text = await onStopRecord();
      if (text) onSend(text);
    } else {
      onStartRecord();
    }
  };

  return (
    <div className="p-4 md:p-6 border-t border-white/10 bg-[#0D111C]/50 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3">
        <button
          type="button"
          onClick={handleVoiceToggle}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
          aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
          id="btn-voice-input"
        >
          {isRecording ? '⏹' : '🎤'}
        </button>
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isRecording ? "Listening..." : "Ask about voter ID, registration, phases..."}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-saffron-500/50 transition-all"
          disabled={isLoading || isRecording}
          aria-label="Chat input message"
          id="chat-input-field"
        />
        
        <button
          type="submit"
          disabled={!input.trim() || isLoading || isRecording}
          className="w-12 h-12 rounded-xl bg-saffron-500 text-white flex items-center justify-center hover:bg-saffron-600 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-saffron-500/20"
          aria-label="Send message"
          id="btn-send-message"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
}

ChatInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isRecording: PropTypes.bool.isRequired,
  onStartRecord: PropTypes.func.isRequired,
  onStopRecord: PropTypes.func.isRequired
};
