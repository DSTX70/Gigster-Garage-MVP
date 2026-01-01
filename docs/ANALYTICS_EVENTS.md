# Gigster Garage Analytics Events

**Version:** 1.0  
**Last Updated:** 2026-01-01

This document defines the analytics events used throughout Gigster Garage for measuring user engagement, activation, and conversion.

---

## Event Naming Convention

Events follow the pattern: `{entity}_{action}` in snake_case.

Examples:
- `invoice_created` - User created an invoice
- `payment_succeeded` - A payment was successfully processed
- `coach_suggestion_applied` - User applied a coach suggestion

---

## Core Events

### Activation Events

| Event Name | Description | Metadata |
|------------|-------------|----------|
| `signup_complete` | User completed registration | `plan` |
| `onboarding_step_complete` | User completed an onboarding step | `step`, `stepName` |

### Document Events

| Event Name | Description | Metadata |
|------------|-------------|----------|
| `invoice_created` | User created an invoice | `entityId`, `value` |
| `invoice_sent` | User sent an invoice to client | `entityId`, `value` |
| `proposal_created` | User created a proposal | `entityId` |
| `proposal_sent` | User sent a proposal to client | `entityId` |
| `contract_created` | User created a contract | `entityId` |
| `contract_signed` | Contract was signed | `entityId` |
| `document_downloaded` | User downloaded a PDF | `entityType`, `entityId` |
| `template_used` | User started from a template | `entityId`, `entityType` |

### Payment Events

| Event Name | Description | Metadata |
|------------|-------------|----------|
| `payment_succeeded` | Payment was successful | `entityId`, `value` |
| `payment_failed` | Payment failed | `entityId`, `source` (reason) |

### Client Events

| Event Name | Description | Metadata |
|------------|-------------|----------|
| `client_created` | User added a new client | `entityId` |

### Coach Events

| Event Name | Description | Metadata |
|------------|-------------|----------|
| `coach_question_asked` | User asked the coach a question | `source` (mode: ask/draft/review) |
| `coach_suggestion_applied` | User applied a suggestion | `entityId`, `source` (action type) |

### Productivity Events

| Event Name | Description | Metadata |
|------------|-------------|----------|
| `timer_started` | User started time tracking | `entityId` (project) |
| `timer_stopped` | User stopped time tracking | `entityId`, `value` (duration in seconds) |

### Navigation Events

| Event Name | Description | Metadata |
|------------|-------------|----------|
| `page_view` | User viewed a page | `source` (path) |
| `feature_used` | User used a specific feature | `source` (feature name), `entityType` (context) |

---

## Standard Metadata Fields

Every event includes these base fields:

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | ISO 8601 timestamp |
| `sessionId` | string | Browser session identifier |
| `userId` | string? | Authenticated user ID (if logged in) |
| `demoMode` | boolean | Whether the event occurred in demo mode |

### Optional Metadata

| Field | Type | Description |
|-------|------|-------------|
| `plan` | string | User's subscription plan (Free/Pro/Enterprise) |
| `role` | string | User's role (admin/user) |
| `entityType` | string | Type of entity (invoice/proposal/client/etc) |
| `entityId` | string | ID of the relevant entity |
| `value` | number | Monetary value or duration |
| `source` | string | Context or trigger for the event |

---

## Demo Mode Handling

All events include a `demoMode: true` flag when the user is in demo mode. This allows:
- Filtering demo data from production metrics
- Analyzing demo-to-signup conversion
- Understanding demo user behavior separately

---

## Implementation Guide

### Client-Side Usage

```typescript
import analytics from '@/lib/analytics';

// Initialize on app load
analytics.init({ 
  userId: user?.id,
  isDemo: isDemoMode 
});

// Track events
analytics.trackInvoiceCreated(invoice.id, invoice.total);
analytics.trackPageView('/invoices');
analytics.trackFeatureUsed('command-palette');
```

### Event Validation

Before sending to analytics provider:
1. Ensure no PII (email, name, address) is included in metadata
2. Verify entityId references are anonymized where needed
3. Check that monetary values are in cents (for precision)

---

## Key Funnels

### Activation Funnel
1. `signup_complete`
2. `onboarding_step_complete` (step 1)
3. `client_created`
4. `invoice_created`
5. `invoice_sent`

### Payment Funnel
1. `invoice_created`
2. `invoice_sent`
3. `payment_succeeded` OR `payment_failed`

### Coach Adoption Funnel
1. `coach_question_asked`
2. `coach_suggestion_applied`
3. (repeat usage)

---

## Dashboard Metrics

### North Star Metrics
- Monthly Active Users (MAU) with `invoice_sent` event
- Payment Volume (`payment_succeeded` value sum)
- Documents Created (invoice + proposal + contract created events)

### Health Metrics
- Activation Rate: % of signups with `client_created` within 7 days
- Coach Engagement: % of users with `coach_question_asked` per week
- Payment Success Rate: `payment_succeeded` / (`payment_succeeded` + `payment_failed`)
