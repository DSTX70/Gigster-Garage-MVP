import { z } from "zod";

export interface FieldError {
  field: string;
  message: string;
}

export interface ValidationResult {
  success: boolean;
  errors: FieldError[];
}

export function parseFieldErrors(serverError: unknown): FieldError[] {
  if (!serverError || typeof serverError !== "object") {
    return [];
  }

  const error = serverError as Record<string, unknown>;

  if (Array.isArray(error.errors)) {
    return error.errors.map((e: { field?: string; message?: string }) => ({
      field: e.field || "unknown",
      message: e.message || "Validation failed",
    }));
  }

  if (error.fieldErrors && typeof error.fieldErrors === "object") {
    return Object.entries(error.fieldErrors as Record<string, string[]>).flatMap(
      ([field, messages]) =>
        messages.map((message) => ({ field, message }))
    );
  }

  if (error.message && typeof error.message === "string") {
    return [{ field: "general", message: error.message }];
  }

  return [];
}

export function mapErrorsToForm(
  errors: FieldError[],
  setError: (name: string, error: { type: string; message: string }) => void
): void {
  errors.forEach(({ field, message }) => {
    if (field !== "general" && field !== "unknown") {
      setError(field, { type: "server", message });
    }
  });
}

export const invoiceValidation = {
  clientId: z.string().min(1, "Client is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  dueDate: z.string().min(1, "Due date is required"),
  items: z.array(
    z.object({
      description: z.string().min(1, "Description is required"),
      quantity: z.number().min(0.01, "Quantity must be greater than 0"),
      rate: z.number().min(0, "Rate must be 0 or greater"),
    })
  ).min(1, "At least one line item is required"),
  terms: z.string().optional(),
  notes: z.string().optional(),
};

export const proposalValidation = {
  clientId: z.string().min(1, "Client is required"),
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(10, "Summary should be at least 10 characters"),
  validUntil: z.string().min(1, "Valid until date is required"),
  scope: z.string().optional(),
  deliverables: z.string().optional(),
  timeline: z.string().optional(),
  pricing: z.string().optional(),
};

export const clientValidation = {
  name: z.string().min(1, "Client name is required"),
  email: z.string().email("Please enter a valid email address").or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
};

export const contractValidation = {
  clientId: z.string().min(1, "Client is required"),
  title: z.string().min(1, "Contract title is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  scope: z.string().min(1, "Scope of work is required"),
  terms: z.string().optional(),
  value: z.number().min(0, "Value must be 0 or greater").optional(),
};

export function getFieldErrorMessage(
  errors: Record<string, { message?: string }> | undefined,
  field: string
): string | undefined {
  return errors?.[field]?.message;
}

export function hasFieldError(
  errors: Record<string, unknown> | undefined,
  field: string
): boolean {
  return !!errors?.[field];
}

export const validationMessages = {
  required: (field: string) => `${field} is required`,
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must be no more than ${max} characters`,
  email: "Please enter a valid email address",
  phone: "Please enter a valid phone number",
  url: "Please enter a valid URL",
  number: "Please enter a valid number",
  positive: (field: string) => `${field} must be greater than 0`,
  date: "Please enter a valid date",
  dateInFuture: "Date must be in the future",
  dateInPast: "Date cannot be in the future",
};

export default {
  parseFieldErrors,
  mapErrorsToForm,
  invoiceValidation,
  proposalValidation,
  clientValidation,
  contractValidation,
  getFieldErrorMessage,
  hasFieldError,
  validationMessages,
};
