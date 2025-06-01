import type { Handle } from '@sveltejs/kit';

// Server-side hook to log errors
export const handle: Handle = async ({ event, resolve }) => {
  try {
    // Forward the request to the endpoint
    const response = await resolve(event);
    return response;
  } catch (error: any) {
    // Log the error on the server
    console.error('[SERVER ERROR]', error);
    
    // Log additional error details
    if (error.code) console.error('[SERVER ERROR] Code:', error.code);
    if (error.message) console.error('[SERVER ERROR] Message:', error.message);
    if (error.stack) console.error('[SERVER ERROR] Stack:', error.stack);
    
    // Re-throw the error to be handled by SvelteKit
    throw error;
  }
};
