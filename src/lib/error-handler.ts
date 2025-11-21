/**
 * Error Handling Utilities
 * Centralized error handling for the frontend application
 * Matches the backend error structure
 */

import { AxiosError } from 'axios';

/**
 * Backend error response structure
 */
export interface BackendErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp?: string;
    path?: string;
  };
}

/**
 * Validation error detail
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Frontend error codes for consistent handling
 */
export enum ErrorCode {
  // Authentication
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Authorization
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  
  // Business Logic
  UNPROCESSABLE = 'UNPROCESSABLE',
  OPERATION_FAILED = 'OPERATION_FAILED',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * HTTP Status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Parsed error object for frontend use
 */
export interface ParsedError {
  code: string;
  message: string;
  title: string;
  statusCode?: number;
  details?: any;
  validationErrors?: ValidationErrorDetail[];
}

/**
 * Check if error is from our backend
 */
export const isBackendError = (error: any): error is AxiosError<BackendErrorResponse> => {
  return (
    error?.isAxiosError &&
    error?.response?.data?.success === false &&
    typeof error?.response?.data?.error === 'object'
  );
};

/**
 * Parse error into a consistent format
 */
export const parseError = (error: unknown): ParsedError => {
  // Backend error with our format
  if (isBackendError(error)) {
    const { code, message, details } = error.response!.data.error;
    const statusCode = error.response!.status;

    return {
      code,
      message,
      title: getErrorTitle(statusCode, code),
      statusCode,
      details,
      validationErrors: isValidationError(code) ? details : undefined,
    };
  }

  // Axios error without backend format
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    
    // Network error
    if (!error.response) {
      return {
        code: ErrorCode.NETWORK_ERROR,
        message: 'Unable to connect to the server. Please check your internet connection.',
        title: 'Network Error',
      };
    }

    // Server error without our format
    return {
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      title: getErrorTitle(statusCode),
      statusCode,
    };
  }

  // Regular JavaScript error
  if (error instanceof Error) {
    return {
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.message,
      title: 'Error',
    };
  }

  // Unknown error type
  return {
    code: ErrorCode.UNKNOWN_ERROR,
    message: 'An unexpected error occurred',
    title: 'Error',
  };
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (code: string): boolean => {
  return code === ErrorCode.VALIDATION_ERROR;
};

/**
 * Get user-friendly error title based on status code or error code
 */
export const getErrorTitle = (statusCode?: number, errorCode?: string): string => {
  // Try error code first
  if (errorCode) {
    const codeMap: Record<string, string> = {
      [ErrorCode.NOT_AUTHENTICATED]: 'Authentication Required',
      [ErrorCode.INVALID_CREDENTIALS]: 'Invalid Credentials',
      [ErrorCode.TOKEN_EXPIRED]: 'Session Expired',
      [ErrorCode.FORBIDDEN]: 'Access Denied',
      [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Insufficient Permissions',
      [ErrorCode.VALIDATION_ERROR]: 'Validation Error',
      [ErrorCode.INVALID_INPUT]: 'Invalid Input',
      [ErrorCode.NOT_FOUND]: 'Not Found',
      [ErrorCode.ALREADY_EXISTS]: 'Already Exists',
      [ErrorCode.DUPLICATE_ERROR]: 'Duplicate Entry',
      [ErrorCode.UNPROCESSABLE]: 'Cannot Process Request',
      [ErrorCode.OPERATION_FAILED]: 'Operation Failed',
      [ErrorCode.INTERNAL_ERROR]: 'Server Error',
      [ErrorCode.SERVICE_UNAVAILABLE]: 'Service Unavailable',
      [ErrorCode.NETWORK_ERROR]: 'Network Error',
    };

    if (codeMap[errorCode]) {
      return codeMap[errorCode];
    }
  }

  // Fall back to status code
  switch (statusCode) {
    case HttpStatus.BAD_REQUEST:
      return 'Bad Request';
    case HttpStatus.UNAUTHORIZED:
      return 'Unauthorized';
    case HttpStatus.FORBIDDEN:
      return 'Forbidden';
    case HttpStatus.NOT_FOUND:
      return 'Not Found';
    case HttpStatus.CONFLICT:
      return 'Conflict';
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return 'Validation Error';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'Too Many Requests';
    case HttpStatus.INTERNAL_ERROR:
      return 'Server Error';
    case HttpStatus.SERVICE_UNAVAILABLE:
      return 'Service Unavailable';
    default:
      return 'Error';
  }
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors?: ValidationErrorDetail[]): string => {
  if (!errors || errors.length === 0) {
    return 'Validation failed';
  }

  if (errors.length === 1) {
    return errors[0].message;
  }

  return errors.map(e => `${e.field}: ${e.message}`).join(', ');
};

/**
 * Check if error should trigger logout
 */
export const shouldLogout = (error: ParsedError): boolean => {
  return (
    error.code === ErrorCode.NOT_AUTHENTICATED ||
    error.code === ErrorCode.TOKEN_EXPIRED ||
    error.statusCode === HttpStatus.UNAUTHORIZED
  );
};

/**
 * Check if error should be silently ignored
 */
export const shouldIgnoreError = (_error: ParsedError): boolean => {
  // Add any error codes that should be handled silently
  return false;
};
