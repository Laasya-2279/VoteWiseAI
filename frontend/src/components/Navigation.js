'use client';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function Navigation() {
  const { user, logout, loading } = useAuth();
  
  const links = [
    { href: '/', label: 'Home', id: 'nav-home' },
    { href: '/timeline/', label: 'Timeline', id: 'nav-timeline' },
    { href: '/phase-map/', label: 'Phase Map', id: 'nav-map' },
    { href: '/assistant/', label: 'Assistant', id: 'nav-assistant' },
    { href: '/eligibility/', label: 'Eligibility', id: 'nav-eligibility' },
    { href: '/quiz/', label: 'Quiz', id: 'nav-quiz' },
    { href: '/glossary/', label: 'Glossary', id: 'nav-glossary' },
    { href: '/guide/', label: 'Guide', id: 'nav-guide' },
  ];

  return (
    <nav role="navigation" aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-40 glass-card border-0 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 font-display font-bold text-xl" aria-label="VoteWise AI Home">
          <span className="text-2xl" aria-hidden="true">🗳️</span>
          <span className="text-gradient">VoteWise AI</span>
        </a>
        
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <a
              key={link.id}
              id={link.id}
              href={link.href}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label={`Navigate to ${link.label}`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {!loading && user ? (
              <motion.div 
                key="logged-in"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3"
              >
                {user.photoURL && (
                  <Image 
                    src={user.photoURL} 
                    alt={user.displayName || 'User profile'} 
                    width={32}
                    height={32}
                    className="rounded-full border border-white/10"
                  />
                )}
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 transition-all"
                  aria-label="Logout from account"
                >
                  Logout
                </button>
              </motion.div>
            ) : !loading && (
              <motion.a
                key="logged-out"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                href="/login/"
                id="nav-login"
                className="btn-primary text-sm !px-4 !py-2"
                aria-label="Sign in to your account"
              >
                Sign In
              </motion.a>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
