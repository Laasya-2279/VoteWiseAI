/**
 * @fileoverview Message List component for the AI assistant.
 * @module MessageList
 */

import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

/**
 * Renders the scrollable list of chat messages.
 * @param {Object} props - Component props
 * @param {Array} props.messages - List of message objects
 * @param {boolean} props.isLoading - Whether the assistant is thinking
 * @returns {JSX.Element}
 */
export default function MessageList({ messages, isLoading }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
      {messages.map((msg, i) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl ${
            msg.role === 'user' 
              ? 'bg-saffron-500 text-white rounded-tr-none' 
              : 'glass-card border-white/10 rounded-tl-none'
          }`}>
            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            {msg.chunksUsed && msg.chunksUsed.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Sources:</p>
                <div className="flex flex-wrap gap-1">
                  {msg.chunksUsed.map(chunk => (
                    <span key={chunk} className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-gray-400">
                      {chunk}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <p className="text-[10px] text-gray-500 mt-2 text-right">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </motion.div>
      ))}
      
      {isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
          <div className="glass-card p-4 rounded-2xl rounded-tl-none">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-saffron-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-saffron-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-saffron-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

MessageList.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    timestamp: PropTypes.instanceOf(Date).isRequired,
    chunksUsed: PropTypes.arrayOf(PropTypes.string),
    isError: PropTypes.bool
  })).isRequired,
  isLoading: PropTypes.bool.isRequired
};
