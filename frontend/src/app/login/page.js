'use client';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0E1A]">
        <div className="w-12 h-12 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0A0E1A] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-saffron-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-navy-600/10 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-md w-full p-10 text-center relative z-10 border border-white/10"
      >
        <div className="text-4xl mb-6">🗳️</div>
        <h1 className="text-3xl font-display font-bold mb-2">
          Welcome to <span className="text-gradient">VoteWise AI</span>
        </h1>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          Your intelligent assistant for Indian elections. Please sign in to access your dashboard, 
          track your voting status, and get personalized election guides.
        </p>

        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-xl shadow-white/5"
          id="google-signin-button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <p className="mt-8 text-[10px] text-gray-500 uppercase tracking-widest font-medium">
          Secure Authentication powered by Firebase
        </p>
      </motion.div>
    </div>
  );
}
