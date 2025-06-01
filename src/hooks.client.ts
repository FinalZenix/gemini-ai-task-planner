import { logger } from '$lib/utils/logger';

// Client-side hook to log errors
export const handleError = ({ error, event }: { error: Error & { code?: string }, event: any }) => {
  logger.error('Client-side error', error);

  // Return the error to be displayed to the user
  return {
    message: error.message || 'An unexpected error occurred',
    code: error.code || 'UNKNOWN'
  };
};
