/**
 * @fileoverview Centralized logging utility for the frontend.
 * @module logger
 */

const logger = {
  info: (msg, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[INFO] ${msg}`, ...args);
    }
  },
  warn: (msg, ...args) => {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${msg}`, ...args);
  },
  error: (msg, ...args) => {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${msg}`, ...args);
  }
};

export default logger;
