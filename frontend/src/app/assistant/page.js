'use client';
import { motion } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import { trackQueryMade, trackVoiceInputUsed } from '@/lib/analytics';

const SUGGESTED_QUESTIONS = [
  'How does the voting process work?',
  'What is the Model Code of Conduct?',
  'Am I eligible to vote at age 17?',
  'What does NOTA mean?',
  'When is phase 3 voting?',
  'How many seats are in Lok Sabha?',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Namaste! 🙏 I am VoteWise AI, your guide to Indian elections. Ask me anything about the voting process, eligibility, election phases, or any election-related topic!', source: 'system', intent: 'welcome' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSend = useCallback(async (query) => {
    const text = query || input.trim();
    if (!text || isLoading) { return; }

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setIsLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
      const res = await fetch(`${API_BASE}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();

      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: data.response || 'I could not process that request.',
        source: data.source || 'unknown',
        intent: data.intent || 'unknown',
        chunksUsed: data.chunksUsed || [],
      }]);

      setDebugInfo({
        intent: data.intent,
        confidence: data.intentConfidence,
        source: data.source,
        chunksUsed: data.chunksUsed || [],
        responseTimeMs: data.responseTimeMs,
      });

      trackQueryMade(data.intent, data.responseTimeMs, data.chunksUsed?.length || 0);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: 'I apologize, but I am having trouble connecting to the server. Please try again shortly.',
        source: 'error',
        intent: 'error',
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [input, isLoading, scrollToBottom]);

  const handleMicToggle = useCallback(async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setMessages((prev) => [...prev, { role: 'assistant', text: 'Voice input is not supported in your browser. Please type your question instead.', source: 'system', intent: 'error' }]);
        trackVoiceInputUsed(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        setInput(transcript);
        trackVoiceInputUsed(true);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        trackVoiceInputUsed(false);
      };

      recognition.onend = () => { setIsListening(false); };
      recognition.start();
    } catch (err) {
      setIsListening(false);
      trackVoiceInputUsed(false);
    }
  }, [isListening, handleSend]);

  return (
    <div className="pt-20 min-h-screen flex">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
        <div className="text-center py-6">
          <h1 className="font-display text-3xl font-bold mb-2">
            <span className="text-gradient">VoteWise</span> Assistant
          </h1>
          <p className="text-gray-400 text-sm">AI-powered election guide — ask anything about Indian elections</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4" aria-live="polite" aria-label="Chat conversation">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${msg.role === 'user' ? 'gradient-saffron text-white shadow-lg shadow-saffron-500/20' : 'glass-card border border-white/10'}`}>
                {msg.role === 'assistant' && msg.source !== 'system' ? (
                  <div className="space-y-4">
                    {msg.text.split('\n\n').map((section, idx) => {
                      if (section.toLowerCase().includes('direct answer:')) {
                        return (
                          <div key={idx} className="pb-3 border-b border-white/5">
                            <p className="text-white font-medium leading-relaxed">
                              {section.replace(/direct answer:?\s*/i, '').replace(/\*\*/g, '')}
                            </p>
                          </div>
                        );
                      }
                      if (section.toLowerCase().includes('supporting points') || section.toLowerCase().includes('supporting context')) {
                        return (
                          <div key={idx} className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-saffron-400">Supporting Context</p>
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {section.replace(/supporting points from context:?\s*/i, '').replace(/supporting context:?\s*/i, '').replace(/\*\*/g, '')}
                            </p>
                          </div>
                        );
                      }
                      if (section.toLowerCase().includes('confidence level') || section.toLowerCase().includes('confidence:')) {
                        const confidence = section.match(/\d+%/)?.[0] || 'High';
                        return (
                          <div key={idx} className="flex items-center gap-2 pt-2">
                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-saffron-500 transition-all duration-1000" 
                                style={{ width: confidence }}
                              />
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium">Confidence: {confidence}</p>
                          </div>
                        );
                      }
                      return <p key={idx} className="text-sm leading-relaxed whitespace-pre-wrap">{section.replace(/\*\*/g, '')}</p>;
                    })}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                )}
                {msg.source && msg.role === 'assistant' && msg.source !== 'system' && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span aria-hidden="true">📄</span>
                    Source: {msg.source}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start" aria-busy="true" aria-label="VoteWise AI is thinking">
              <div className="glass-card px-5 py-3 flex gap-1">
                <span className="w-2 h-2 bg-saffron-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-saffron-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-saffron-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 pb-4">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="px-3 py-2 rounded-full text-xs bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                aria-label={`Ask: ${q}`}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="pb-6 pt-2">
          <div className="flex gap-3 items-center">
            <button
              onClick={handleMicToggle}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-white/5 hover:bg-white/10'}`}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              aria-pressed={isListening}
              id="mic-toggle"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
            <label htmlFor="chat-input" className="sr-only">Type your question about Indian elections</label>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleSend(); } }}
              placeholder="Ask about Indian elections..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-all"
              aria-label="Type your question about Indian elections"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="btn-primary !px-5 !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
              id="send-button"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      {debugInfo && (
        <aside className="hidden xl:block w-72 border-l border-white/5 p-4 overflow-y-auto" role="complementary" aria-label="Query debug information">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Debug Info</h3>
          <div className="space-y-3 text-xs">
            <div><span className="text-gray-500">Intent:</span> <span className="text-saffron-400 ml-1">{debugInfo.intent}</span></div>
            <div><span className="text-gray-500">Confidence:</span> <span className="text-white ml-1">{debugInfo.confidence}</span></div>
            <div><span className="text-gray-500">Source:</span> <span className="text-white ml-1">{debugInfo.source}</span></div>
            <div><span className="text-gray-500">Response Time:</span> <span className="text-white ml-1">{debugInfo.responseTimeMs}ms</span></div>
            <div>
              <span className="text-gray-500">Chunks Used:</span>
              <div className="mt-1 space-y-1">
                {debugInfo.chunksUsed.map((c, i) => (
                  <div key={i} className="bg-white/5 rounded px-2 py-1 text-gray-300">{c}</div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
