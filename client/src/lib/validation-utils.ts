import { ZodError } from "zod";

/**
 * Enhanced validation error handling utilities
 * Provides consistent error formatting and user-friendly messages
 */

export interface ValidationErrorDetails {
  field: string;
  message: string;
  code?: string;
}

/**
 * Formats Zod validation errors into user-friendly messages
 */
export function formatValidationErrors(error: ZodError): ValidationErrorDetails[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
}

/**
 * Creates a comprehensive error message from validation errors
 */
export function createValidationErrorMessage(errors: ValidationErrorDetails[]): string {
  if (errors.length === 1) {
    return errors[0].message;
  }
  
  const errorList = errors
    .map(err => `• ${err.message}`)
    .join('\n');
  
  return `Please fix the following errors:\n${errorList}`;
}

/**
 * Enhanced API error handler with better error messages
 */
export function handleApiError(error: any): string {
  // Handle network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return "Unable to connect to the server. Please check your internet connection.";
  }
  
  // Handle HTTP errors with JSON response
  if (error.message && error.message.includes(':')) {
    const [statusCode, message] = error.message.split(': ', 2);
    const status = parseInt(statusCode);
    
    switch (status) {
      case 400:
        return message || "Invalid request. Please check your input and try again.";
      case 401:
        return "You are not authorized to perform this action. Please log in.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return message || "A conflict occurred. This item may already exist.";
      case 422:
        return message || "The data provided is invalid or incomplete.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "A server error occurred. Please try again later.";
      default:
        return message || "An unexpected error occurred. Please try again.";
    }
  }
  
  // Handle validation errors from server
  if (error.details && Array.isArray(error.details)) {
    return createValidationErrorMessage(error.details);
  }
  
  // Fallback for unknown errors
  return error.message || "An unexpected error occurred. Please try again.";
}

/**
 * Form field validation helpers
 */
export const fieldValidators = {
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return null;
  },

  phone: (value: string) => {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,20}$/;
    if (!phoneRegex.test(value)) {
      return "Please enter a valid phone number";
    }
    return null;
  },

  currency: (value: string) => {
    const amount = parseFloat(value);
    if (isNaN(amount) || amount < 0) {
      return "Please enter a valid amount";
    }
    return null;
  },

  date: (value: string) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return "Please enter a valid date";
    }
    return null;
  },

  futureDate: (value: string) => {
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(date.getTime())) {
      return "Please enter a valid date";
    }
    if (date <= today) {
      return "Date must be in the future";
    }
    return null;
  },

  url: (value: string) => {
    if (!value) return null; // Allow empty URLs
    try {
      new URL(value);
      return null;
    } catch {
      return "Please enter a valid URL (e.g., https://example.com)";
    }
  }
};

/**
 * Business logic validation helpers
 */
export const businessValidators = {
  contractDates: (effectiveDate: string, expirationDate: string) => {
    if (!effectiveDate || !expirationDate) return null;
    
    const effective = new Date(effectiveDate);
    const expiration = new Date(expirationDate);
    
    if (expiration <= effective) {
      return "Expiration date must be after effective date";
    }
    return null;
  },

  invoiceDates: (invoiceDate: string, dueDate: string) => {
    if (!invoiceDate || !dueDate) return null;
    
    const invoice = new Date(invoiceDate);
    const due = new Date(dueDate);
    
    if (due < invoice) {
      return "Due date must be on or after invoice date";
    }
    return null;
  },

  lineItemCalculation: (lineItems: Array<{quantity: number, rate: number, amount: number}>) => {
    for (const item of lineItems) {
      const calculated = item.quantity * item.rate;
      if (Math.abs(calculated - item.amount) > 0.01) {
        return "Line item amounts don't match quantity × rate calculations";
      }
    }
    return null;
  }
};