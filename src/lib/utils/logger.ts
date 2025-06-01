import { browser } from '$app/environment';

/**
 * Logger utility that logs to both the console and the server
 * In browser context, it logs to the console
 * In server context, it logs to the terminal
 */
export const logger = {
  info: (message: string, ...args: any[]) => {
    if (browser) {
      console.info(`[INFO] ${message}`, ...args);
    } else {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (browser) {
      console.warn(`[WARN] ${message}`, ...args);
    } else {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, error?: any, ...args: any[]) => {
    if (browser) {
      console.error(`[ERROR] ${message}`, error, ...args);
    } else {
      console.error(`[ERROR] ${message}`, error, ...args);
      
      // Log additional error details in server context
      if (error) {
        if (error.code) console.error(`[ERROR] Code: ${error.code}`);
        if (error.message) console.error(`[ERROR] Message: ${error.message}`);
        if (error.stack) console.error(`[ERROR] Stack: ${error.stack}`);
      }
    }
  }
};
