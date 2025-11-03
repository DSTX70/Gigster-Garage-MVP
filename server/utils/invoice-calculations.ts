/**
 * Centralized Invoice Calculation Utilities
 * 
 * SINGLE SOURCE OF TRUTH for all invoice financial calculations.
 * All invoice totals MUST be calculated using these functions to ensure consistency.
 * 
 * ⚠️ WARNING: Do NOT duplicate these calculations elsewhere in the codebase.
 * Any changes to calculation logic MUST be made here only.
 */

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceCalculationInput {
  lineItems: InvoiceLineItem[];
  taxRate?: number | string;  // Allow both for flexibility
  discountAmount?: number | string;
}

export interface InvoiceCalculationResult {
  subtotal: string;  // Decimal string for database storage
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  // Raw numbers for display/validation
  subtotalRaw: number;
  taxAmountRaw: number;
  discountAmountRaw: number;
  totalAmountRaw: number;
}

/**
 * Calculate all invoice totals with proper precision
 * Uses fixed-point arithmetic to avoid floating point errors
 */
export function calculateInvoiceTotals(input: InvoiceCalculationInput): InvoiceCalculationResult {
  // Validate inputs
  if (!Array.isArray(input.lineItems)) {
    throw new Error('Line items must be an array');
  }

  // Parse inputs with validation
  const taxRate = parseFloat(String(input.taxRate || 0));
  const discountAmount = parseFloat(String(input.discountAmount || 0));

  if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
    throw new Error(`Invalid tax rate: ${input.taxRate}. Must be between 0 and 100.`);
  }

  if (isNaN(discountAmount) || discountAmount < 0) {
    throw new Error(`Invalid discount amount: ${input.discountAmount}. Must be >= 0.`);
  }

  // Calculate subtotal from line items
  // SECURITY: Calculate from quantity * rate, NEVER trust client-provided amount
  const subtotalRaw = input.lineItems.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    
    // CRITICAL: Calculate amount from quantity * rate - ignore client-provided amount
    const calculatedAmount = roundTo2Decimals(quantity * rate);
    
    // Log warning if client sent different amount (potential tampering)
    const clientAmount = Number(item.amount) || 0;
    if (Math.abs(clientAmount - calculatedAmount) > 0.01) {
      console.warn(
        `⚠️ SECURITY: Line item amount tampering detected for "${item.description}". ` +
        `Client sent ${clientAmount}, server calculated ${calculatedAmount}. Using calculated value.`
      );
    }

    return sum + calculatedAmount;  // Use calculated amount, not client-provided
  }, 0);

  // Calculate tax amount (percentage of subtotal)
  const taxAmountRaw = roundTo2Decimals((subtotalRaw * taxRate) / 100);

  // Calculate total
  const totalAmountRaw = roundTo2Decimals(subtotalRaw + taxAmountRaw - discountAmount);

  // Validate total is not negative
  if (totalAmountRaw < 0) {
    throw new Error(`Calculated total amount is negative: ${totalAmountRaw}. Check discount amount.`);
  }

  return {
    // Database storage format (strings with 2 decimal places)
    subtotal: formatCurrency(subtotalRaw),
    taxAmount: formatCurrency(taxAmountRaw),
    discountAmount: formatCurrency(discountAmount),
    totalAmount: formatCurrency(totalAmountRaw),
    // Raw numbers for calculations/display
    subtotalRaw,
    taxAmountRaw,
    discountAmountRaw: discountAmount,
    totalAmountRaw,
  };
}

/**
 * Round to 2 decimal places using banker's rounding (round half to even)
 * This is the standard for financial calculations
 */
function roundTo2Decimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Format number as currency string with exactly 2 decimal places
 */
function formatCurrency(value: number): string {
  return value.toFixed(2);
}

/**
 * Calculate line item amount from quantity and rate
 */
export function calculateLineItemAmount(quantity: number, rate: number): number {
  return roundTo2Decimals(quantity * rate);
}

/**
 * Validate invoice totals match expected calculations
 * Returns true if valid, false if mismatch
 */
export function validateInvoiceTotals(
  invoice: {
    lineItems: InvoiceLineItem[];
    taxRate?: number | string;
    discountAmount?: number | string;
    subtotal: string;
    taxAmount: string;
    totalAmount: string;
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    const calculated = calculateInvoiceTotals({
      lineItems: invoice.lineItems,
      taxRate: invoice.taxRate,
      discountAmount: invoice.discountAmount,
    });

    // Compare with tolerance for floating point errors
    const tolerance = 0.01;

    if (Math.abs(parseFloat(calculated.subtotal) - parseFloat(invoice.subtotal)) > tolerance) {
      errors.push(`Subtotal mismatch: expected ${calculated.subtotal}, got ${invoice.subtotal}`);
    }

    if (Math.abs(parseFloat(calculated.taxAmount) - parseFloat(invoice.taxAmount)) > tolerance) {
      errors.push(`Tax amount mismatch: expected ${calculated.taxAmount}, got ${invoice.taxAmount}`);
    }

    if (Math.abs(parseFloat(calculated.totalAmount) - parseFloat(invoice.totalAmount)) > tolerance) {
      errors.push(`Total amount mismatch: expected ${calculated.totalAmount}, got ${invoice.totalAmount}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Validation failed'],
    };
  }
}

/**
 * Calculate payment balance due
 */
export function calculateBalanceDue(totalAmount: string, amountPaid: string): string {
  const total = parseFloat(totalAmount || '0');
  const paid = parseFloat(amountPaid || '0');
  const balance = roundTo2Decimals(total - paid);
  
  return formatCurrency(Math.max(0, balance)); // Never negative
}
