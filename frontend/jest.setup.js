import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/link
jest.mock('next/link', () => {
  const React = require('react');
  return React.forwardRef(function MockLink({ children, href, ...rest }, ref) {
    return React.createElement('a', { href, ref, ...rest }, children);
  });
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target, prop) => {
      const React = require('react');
      return React.forwardRef(function MotionComponent(props, ref) {
        const { initial, animate, exit, whileHover, whileTap, transition, variants, ...rest } = props;
        return React.createElement(prop, { ref, ...rest });
      });
    },
  }),
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({ start: jest.fn(), set: jest.fn() }),
  useInView: () => true,
}));

// Suppress act warnings in test output
const originalError = globalThis.console.error;
globalThis.console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('act(')) { return; }
  originalError.call(globalThis.console, ...args);
};
