/**
 * @fileoverview Authentication Context for VoteWise AI.
 * Manages Google Sign-in, session state, and route protection.
 * @module AuthContext
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import logger from '@/utils/logger';

const AuthContext = createContext({});

/**
 * Context Provider component that wraps the app and provides auth state.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
        // Redirect to login if not authenticated and not already on login page
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  /**
   * Initiates Google Sign-in popup.
   */
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      logger.error('Login failed:', error);
    }
  };

  /**
   * Signs the user out of the application.
   */
  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      logger.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to consume the AuthContext.
 * @returns {Object} Auth state and methods
 */
export const useAuth = () => useContext(AuthContext);

