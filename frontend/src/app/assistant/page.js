/**
 * @fileoverview AI Assistant Page for VoteWise AI.
 * Provides a conversational interface for election-related queries.
 * Uses custom hooks for chat and voice logic.
 * @module AssistantPage
 */

'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useVoice } from '@/hooks/useVoice';
import MessageList from '@/components/assistant/MessageList';
import ChatInput from '@/components/assistant/ChatInput';

/**
 * Main Assistant Page component.
 * @returns {JSX.Element}
 */
export default function AssistantPage() {
  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const { isRecording, isSpeaking, startRecording, stopRecording, speak } = useVoice();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  /**
   * Handles auto-TTS for assistant responses if desired.
   */
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'assistant' && !lastMsg.isError && messages.length > 1) {
      // Logic for auto-speak could go here if enabled by user
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] pt-16 bg-[#0A0E1A]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0D111C]/50 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-saffron flex items-center justify-center text-xl shadow-lg shadow-saffron-500/20">
            🤖
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">VoteWise AI Assistant</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Online & Grounded</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={clearChat}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
            aria-label="Clear chat history"
            id="btn-clear-chat"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        className="flex-1 flex flex-col relative overflow-hidden"
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-saffron-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <MessageList messages={messages} isLoading={isLoading} />
        
        <ChatInput 
          onSend={sendMessage} 
          isLoading={isLoading} 
          isRecording={isRecording}
          onStartRecord={startRecording}
          onStopRecord={stopRecording}
        />
      </motion.div>

      {/* Voice Status Overlay */}
      {isSpeaking && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 glass-card px-4 py-2 flex items-center gap-3 border-saffron-500/30"
        >
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-1 h-4 bg-saffron-500 rounded-full animate-voice-bar" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <span className="text-xs font-medium text-saffron-400 uppercase tracking-wider">Assistant Speaking...</span>
        </motion.div>
      )}
    </div>
  );
}
