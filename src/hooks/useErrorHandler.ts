/**
 * useErrorHandler Hook
 * Custom hook for consistent error handling across the application
 */

import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useToast } from './use-toast';
import {
  parseError,
  shouldLogout,
  shouldIgnoreError,
  formatValidationErrors,
  isValidationError,
  type ParsedError,
} from '../lib/error-handler';
import { clearAuthSession } from '../services';

interface UseErrorHandlerOptions {
  /** Custom error message to override the default */
  customMessage?: string;
  /** Whether to show a toast notification (default: true) */
  showToast?: boolean;
  /** Custom callback to execute after error is handled */
  onError?: (error: ParsedError) => void;
  /** Whether to automatically logout on auth errors (default: true) */
  autoLogout?: boolean;
}

export const useErrorHandler = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * Main error handling function
   */
  const handleError = useCallback(
    (error: unknown, options: UseErrorHandlerOptions = {}) => {
      const {
        customMessage,
        showToast: shouldShowToast = true,
        onError,
        autoLogout = true,
      } = options;

      // Parse the error
      const parsedError = parseError(error);

      // Check if we should ignore this error
      if (shouldIgnoreError(parsedError)) {
        return parsedError;
      }

      // Handle logout if needed
      if (autoLogout && shouldLogout(parsedError)) {
        clearAuthSession();
        navigate({ to: '/auth/login', replace: true });
      }

      // Prepare toast message
      let description = customMessage || parsedError.message;

      // Format validation errors nicely
      if (isValidationError(parsedError.code) && parsedError.validationErrors) {
        description = formatValidationErrors(parsedError.validationErrors);
      }

      // Show toast notification
      if (shouldShowToast) {
        toast({
          variant: 'destructive',
          title: parsedError.title,
          description,
          duration: 5000,
        });
      }

      // Call custom error handler
      if (onError) {
        onError(parsedError);
      }

      // Log error in development
      if (import.meta.env.DEV) {
        console.error('Error handled:', {
          original: error,
          parsed: parsedError,
        });
      }

      return parsedError;
    },
    [toast, navigate]
  );

  /**
   * Handle validation errors specifically
   */
  const handleValidationError = useCallback(
    (error: unknown, fieldMap?: Record<string, string>) => {
      const parsedError = parseError(error);

      if (isValidationError(parsedError.code) && parsedError.validationErrors) {
        // Map backend field names to frontend field names if provided
        const errors = fieldMap
          ? parsedError.validationErrors.map((err) => ({
              ...err,
              field: fieldMap[err.field] || err.field,
            }))
          : parsedError.validationErrors;

        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: formatValidationErrors(errors),
          duration: 5000,
        });

        return errors;
      }

      // Not a validation error, handle normally
      handleError(error);
      return null;
    },
    [handleError, toast]
  );

  /**
   * Show success toast
   */
  const showSuccess = useCallback(
    (title: string, description?: string) => {
      toast({
        variant: 'success',
        title,
        description,
        duration: 3000,
      });
    },
    [toast]
  );

  /**
   * Show info toast
   */
  const showInfo = useCallback(
    (title: string, description?: string) => {
      toast({
        title,
        description,
        duration: 3000,
      });
    },
    [toast]
  );

  return {
    handleError,
    handleValidationError,
    showSuccess,
    showInfo,
  };
};
