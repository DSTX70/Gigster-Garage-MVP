# iOS Safari Regression Checklist

**Version:** 1.0  
**Last Updated:** 2026-01-01  
**Purpose:** Prevent iOS Safari-specific bugs from reaching production

---

## Pre-Release Checklist

Run this checklist before any release that touches:
- Server middleware (compression, headers)
- Asset serving or static files
- API response formats
- WebSocket connections

### Test Environment
- [ ] Real iOS device (iPhone/iPad) OR BrowserStack iOS Safari
- [ ] iOS version: 17.x or latest
- [ ] Safari browser (not Chrome on iOS)
- [ ] Clear Safari cache before testing

---

## Core Flows (Must Pass)

### 1. Authentication
- [ ] Login page loads completely
- [ ] Form submission works (no decode errors)
- [ ] Session persists after app backgrounding
- [ ] Logout clears session properly

### 2. Dashboard
- [ ] Page loads without JavaScript errors
- [ ] All cards/widgets render correctly
- [ ] Touch scrolling is smooth
- [ ] Pull-to-refresh works (if implemented)

### 3. Invoices List
- [ ] List loads and displays data
- [ ] Infinite scroll/pagination works
- [ ] Filter/sort controls are tappable
- [ ] Status badges render with correct colors

### 4. Create Invoice
- [ ] Form loads completely
- [ ] Date picker opens and is usable
- [ ] Number inputs accept keyboard input
- [ ] Client selector dropdown works
- [ ] Line item add/remove works
- [ ] Save/submit succeeds

### 5. Preview/Download
- [ ] PDF preview renders (if applicable)
- [ ] Download triggers native share sheet or download
- [ ] No "Content-Type" or decode errors in console

---

## Known iOS Safari Issues

### Issue: Response Decode Error (-1015)
**Symptoms:** API requests fail with decode error, page shows blank
**Cause:** Incorrect Content-Type headers or compression issues
**Fix:** Ensure all JSON responses have `Content-Type: application/json; charset=utf-8`

### Issue: WebSocket Disconnects on Background
**Symptoms:** Real-time features stop working after tab switch
**Cause:** iOS aggressively suspends background tabs
**Fix:** Implement reconnection logic on visibility change

### Issue: Fixed Position Keyboard Overlap
**Symptoms:** Fixed footers cover input when keyboard is open
**Cause:** iOS Safari viewport behavior with virtual keyboard
**Fix:** Use `visualViewport` API or avoid fixed positioning on forms

### Issue: 100vh Height Bug
**Symptoms:** Page content extends behind Safari toolbar
**Cause:** Safari's dynamic toolbar height not accounted for
**Fix:** Use `dvh` units or JavaScript `window.innerHeight`

### Issue: Touch Delay on Buttons
**Symptoms:** Buttons feel unresponsive, 300ms delay
**Cause:** Safari waiting for double-tap zoom gesture
**Fix:** Add `touch-action: manipulation` to interactive elements

### Issue: Blob URL Downloads Fail
**Symptoms:** PDF/file downloads don't work
**Cause:** Safari blocks blob URL downloads in some contexts
**Fix:** Use server-side download endpoint with proper headers

---

## Server Configuration Checks

### Required Headers for Safari Compatibility
```javascript
// Express middleware example
app.use((req, res, next) => {
  // Prevent Safari caching issues
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  // Ensure proper encoding
  if (res.get('Content-Type')?.includes('application/json')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  
  next();
});
```

### Compression Configuration
```javascript
// If using compression middleware
app.use(compression({
  filter: (req, res) => {
    // Skip compression for small responses (Safari decode issue)
    if (req.headers['content-length'] && 
        parseInt(req.headers['content-length']) < 1024) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

---

## Console Errors to Watch For

| Error Message | Likely Cause | Action |
|---------------|--------------|--------|
| `Failed to decode response` | Content-Type mismatch | Check API headers |
| `SecurityError: The operation is insecure` | Mixed content or CORS | Check HTTPS/CORS config |
| `QuotaExceededError` | localStorage full | Implement cleanup |
| `NotAllowedError` | User gesture required | Move action to click handler |

---

## Release Notes Template

```markdown
### iOS Safari Testing - [Release Version]

**Tested on:** [Device model, iOS version]
**Tester:** [Name]
**Date:** [YYYY-MM-DD]

**Core Flows:**
- [ ] Authentication: PASS/FAIL
- [ ] Dashboard: PASS/FAIL
- [ ] Invoices List: PASS/FAIL
- [ ] Create Invoice: PASS/FAIL
- [ ] Preview/Download: PASS/FAIL

**Known Issues Found:**
- [Issue description, severity, workaround]

**Regressions Introduced:**
- None / [Description]
```

---

## Quick Debug Steps

1. **Console Errors:** Safari Dev Tools → Console tab
2. **Network Issues:** Safari Dev Tools → Network tab → check Status codes
3. **Layout Issues:** Safari Dev Tools → Elements → check computed styles
4. **JavaScript Errors:** Look for "SyntaxError" which may indicate bundling issues

---

## Resources

- [Safari Web Content Guide](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/Introduction/Introduction.html)
- [WebKit Bug Tracker](https://bugs.webkit.org/)
- [Can I Use - Safari](https://caniuse.com/)
