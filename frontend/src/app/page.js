'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const QUICK_ACTIONS = [
  { id: 'action-guide', title: 'Guide Me', description: 'Learn the complete election process step by step', icon: '📖', href: '/guide/', color: 'from-saffron-500 to-saffron-700' },
  { id: 'action-eligibility', title: 'Check Eligibility', description: 'Find out if you can vote and how to register', icon: '✅', href: '/eligibility/', color: 'from-tricolor-green to-emerald-700' },
  { id: 'action-phases', title: 'Explore Phases', description: 'See voting dates and states for all 7 phases', icon: '🗺️', href: '/phase-map/', color: 'from-navy-600 to-navy-800' },
  { id: 'action-quiz', title: 'Quiz Me', description: 'Test your knowledge about Indian elections', icon: '🧠', href: '/quiz/', color: 'from-accent-cyan to-teal-600' },
];

const ELECTION_STATS = [
  { label: 'Total Seats', value: '543', icon: '🏛️' },
  { label: 'Voting Phases', value: '7', icon: '📅' },
  { label: 'Eligible Voters', value: '96.8 Cr', icon: '👥' },
  { label: 'Polling Stations', value: '10.5 L', icon: '🗳️' },
];

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setIsLoaded(true); }, []);

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="gradient-hero min-h-[85vh] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-20 left-10 w-72 h-72 bg-saffron-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-navy-500 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-tricolor-green rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 max-w-4xl"
        >
          {/* India Map Silhouette */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-8xl mb-6"
            aria-hidden="true"
          >
            🇮🇳
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-gradient">VoteWise</span>{' '}
            <span className="text-white">AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-2xl mx-auto">
            Your intelligent guide to Indian elections
          </p>
          <p className="text-base text-gray-400 mb-10 max-w-xl mx-auto">
            Understand the election process, check your eligibility, explore voting phases, and test your knowledge — all powered by AI.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/assistant/" className="btn-primary text-lg !px-8 !py-4" id="hero-cta-assistant" aria-label="Start chatting with VoteWise AI assistant">
              💬 Ask VoteWise AI
            </a>
            <a href="/timeline/" className="btn-secondary text-lg !px-8 !py-4" id="hero-cta-timeline" aria-label="View the election timeline">
              📊 View Timeline
            </a>
          </div>
        </motion.div>

        {/* Live Election Status Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="absolute bottom-8 left-0 right-0 flex justify-center"
        >
          <div className="glass-card px-6 py-3 flex items-center gap-3" role="status" aria-label="Current election status">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true" />
            <span className="text-sm text-gray-300">2024 Lok Sabha Elections — Results Declared</span>
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-y border-white/5" aria-label="Election statistics">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {ELECTION_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="text-center"
            >
              <span className="text-2xl" aria-hidden="true">{stat.icon}</span>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="py-16 px-4" aria-label="Quick actions">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            What would you like to <span className="text-gradient">explore</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUICK_ACTIONS.map((action, i) => (
              <motion.a
                key={action.id}
                id={action.id}
                href={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-card p-6 group cursor-pointer hover:border-white/20 transition-all duration-300"
                aria-label={`${action.title}: ${action.description}`}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') { window.location.href = action.href; } }}
                role="link"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`} aria-hidden="true">
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                <p className="text-sm text-gray-400">{action.description}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Mic Button */}
      <a
        href="/assistant/"
        className="mic-button"
        id="floating-mic"
        aria-label="Open voice assistant"
        title="Open voice assistant"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      </a>
    </div>
  );
}
