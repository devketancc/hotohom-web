import { logger } from './logger';

export function handleApiError(error: unknown): string {
  logger.error('API Error occurred', error);

  if (error instanceof Error) {
    return error.message;
  }
  
  // Generic fallback error message
  return 'An unexpected error occurred. Please try again later.';
}
