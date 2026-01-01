# Gigster Garage Microcopy Style Guide

**Version:** 1.0  
**Last Updated:** 2026-01-01

This guide establishes consistent voice, tone, and wording across all Gigster Garage interfaces.

---

## Brand Voice

Gigster Garage speaks as a **confident, capable partner** — not a faceless tool. We're professional but approachable, helpful without being patronizing.

### Voice Attributes

| Attribute | Do | Don't |
|-----------|----|----|
| **Confident** | "Your invoice is ready to send" | "We think your invoice might be ready" |
| **Clear** | "Add a client" | "Onboard a new customer entity" |
| **Helpful** | "Need help? Open Coach" | "Error occurred" |
| **Professional** | "Send to client" | "Blast it out!" |

---

## Button Labels

### Primary Actions

Use specific, action-oriented verbs that tell users exactly what will happen.

| Instead of | Use |
|------------|-----|
| Submit | Save / Send / Create |
| Go | View / Open / Continue |
| OK | Got it / Confirm / Done |
| Cancel | Discard / Go back / Close |

### Document Actions

| Action | Label |
|--------|-------|
| Save as draft | Save draft |
| Send to client | Send to client |
| Download file | Download PDF |
| Request payment | Request payment |
| View preview | Preview |
| Edit document | Edit |
| Delete document | Delete |

### Common Actions

| Action | Label |
|--------|-------|
| Create new item | Add [item type] |
| Open details | View details |
| Copy to clipboard | Copy |
| Remove from list | Remove |
| Start process | Start / Begin |
| Complete process | Done / Finish |

---

## Form Labels

### Field Labels
- Use sentence case: "Client name" not "Client Name"
- Be specific: "Due date" not "Date"
- Include units when relevant: "Rate (per hour)"

### Placeholders
- Show format examples: "YYYY-MM-DD"
- Keep brief: "Enter client email"
- Don't duplicate the label

### Helper Text
- Explain *why* when useful: "Used for payment reminders"
- Keep to one line maximum
- Place below the field, not above

---

## Error Messages

### Format
```
[What went wrong] + [How to fix it]
```

### Examples

| Bad | Good |
|-----|------|
| "Invalid input" | "Email address is required" |
| "Error 422" | "Please enter a valid email address" |
| "Request failed" | "Could not save. Check your connection and try again." |
| "Something went wrong" | "Could not load clients. Refresh the page to try again." |

### Tone for Errors
- Be factual, not apologetic (avoid excessive "Sorry!")
- Focus on the solution, not the problem
- Never blame the user

---

## Empty States

### Structure
1. **Icon** - Relevant visual
2. **Title** - What this section is for
3. **Description** - Brief explanation + value proposition
4. **CTA** - Primary action to populate the list

### Examples

**Clients**
> "No clients yet"  
> "Clients help you organize your work and track payments."  
> [Add your first client]

**Invoices**
> "No invoices yet"  
> "Create an invoice to request payment from a client."  
> [Create invoice]

**Templates**
> "No templates saved"  
> "Templates save time by reusing your best work."  
> [Create template]

---

## Confirmation Messages

### Success Toasts
- Be specific: "Invoice sent to john@example.com"
- Keep brief: 1 line maximum
- Use checkmark icon

### Destructive Confirmations
- State what will be deleted: "Delete invoice #1234?"
- Explain consequences: "This cannot be undone."
- Use red button for destructive action

---

## Status Labels

### Invoice Status
| Status | Label |
|--------|-------|
| draft | Draft |
| sent | Sent |
| viewed | Viewed |
| paid | Paid |
| overdue | Overdue |
| cancelled | Cancelled |

### Proposal Status
| Status | Label |
|--------|-------|
| draft | Draft |
| sent | Sent |
| viewed | Viewed |
| accepted | Accepted |
| rejected | Declined |
| expired | Expired |

### Task Status
| Status | Label |
|--------|-------|
| pending | To do |
| in_progress | In progress |
| completed | Done |
| blocked | Blocked |

---

## Numbers and Formatting

### Currency
- Always show currency symbol: "$1,234.56"
- Use locale-appropriate formatting
- Show two decimal places for invoices

### Dates
- Relative when recent: "2 hours ago", "Yesterday"
- Absolute when specific: "Jan 15, 2026"
- Full for due dates: "Due January 15, 2026"

### Counts
- "1 item" / "5 items" (not "1 item(s)")
- "No items" (not "0 items")

---

## Accessibility Copy

### Screen Reader Labels
- Icon-only buttons: Include aria-label
- "Close dialog" not just "X"
- "Delete invoice" not just "Delete"

### Link Text
- Descriptive: "View invoice details"
- Not vague: "Click here" ❌

---

## Common Phrases

| Context | Phrase |
|---------|--------|
| Loading | Loading... |
| Saving | Saving... |
| Saved | Saved |
| No results | No results found |
| Try again | Try again |
| Learn more | Learn more |
| Need help | Need help? |
| Required | Required |
| Optional | (optional) |

---

## Consistency Checklist

Before shipping, verify:
- [ ] Button labels are specific verbs
- [ ] Error messages explain how to fix
- [ ] Empty states have CTAs
- [ ] Status labels match the standard set
- [ ] Dates use consistent formatting
- [ ] Icon-only buttons have aria-labels
