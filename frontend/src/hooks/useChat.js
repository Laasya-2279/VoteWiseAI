/**
 * @fileoverview Custom hook for managing chat assistant state and API interactions.
 * @module useChat
 */

import { useState, useCallback } from 'react';
import { postQuery } from '@/lib/api';
import { trackQueryMade } from '@/lib/analytics';

/**
 * Hook to manage chat messages and API state.
 * @returns {Object} Chat state and handlers
 */
export function useChat() {
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'assistant', content: "Namaste! I'm your VoteWise AI assistant. How can I help you with the Indian elections today?", timestamp: new Date() }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Sends a message to the backend and updates the chat.
   * @param {string} content - User message content
   */
  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const start = Date.now();
    try {
      const data = await postQuery(content);
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        intent: data.intent,
        chunksUsed: data.chunksUsed,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      trackQueryMade(data.intent, Date.now() - start, data.chunksUsed?.length || 0);
    } catch (error) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again in a moment.",
        isError: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clears the chat history.
   */
  const clearChat = useCallback(() => {
    setMessages([messages[0]]);
  }, [messages]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat
  };
}
