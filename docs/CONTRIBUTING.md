# Contributing to Gigster Garage

Welcome! This guide covers how to set up your local development environment and run the quality checks before submitting changes.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run all checks (before committing)
npm run check
```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Follow the existing code patterns and conventions documented in `replit.md`.

### 3. Run Quality Checks

Before committing, run all checks:

```bash
npm run check
```

This runs:
- TypeScript type checking
- ESLint linting
- Build verification

### 4. Commit and Push

```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run check` | Run all quality checks |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint linting |
| `npm run db:push` | Push database schema changes |

---

## Quality Gates

All code must pass these checks before merging:

### 1. TypeScript (Required)

No type errors allowed.

```bash
npm run typecheck
```

### 2. Linting (Required)

Follow ESLint rules.

```bash
npm run lint
```

### 3. Build (Required)

Code must build successfully.

```bash
npm run build
```

---

## Code Style Guidelines

### TypeScript

- Use explicit types for function parameters and return values
- Prefer `interface` over `type` for object shapes
- Use `type` for unions and function types

### React

- Use functional components with hooks
- Co-locate related components in the same file when small
- Add `data-testid` attributes to interactive elements

### Styling

- Use Tailwind CSS utility classes
- Use CSS variables from `index.css` for colors
- Support both light and dark modes

### Imports

- Use `@/` alias for client imports
- Use `@shared/` for shared types
- Group imports: external, internal, relative

---

## File Structure

```
├── client/               # Frontend React app
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilities
│   │   ├── pages/        # Page components
│   │   └── App.tsx       # Main app
├── server/               # Backend Express app
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data layer
│   └── index.ts          # Server entry
├── shared/               # Shared types
│   └── schema.ts         # Database schema
└── docs/                 # Documentation
```

---

## Testing Checklist

Before submitting a PR, manually test:

### Core Flows
- [ ] Login/logout works
- [ ] Dashboard loads without errors
- [ ] Create invoice flow completes
- [ ] Create proposal flow completes
- [ ] Client creation works

### Responsiveness
- [ ] Desktop (1440px) - layout correct
- [ ] Mobile (390px) - no overflow, usable

### Dark Mode
- [ ] Toggle dark mode
- [ ] All components readable
- [ ] No color contrast issues

### Accessibility
- [ ] Tab through interactive elements
- [ ] Focus visible on all elements
- [ ] Icon buttons have labels

---

## Commit Message Format

Use conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code change without feature/fix
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```
feat(invoices): add PDF export button
fix(auth): handle session expiration correctly
docs(readme): update installation steps
```

---

## Pull Request Guidelines

1. **Title**: Use conventional commit format
2. **Description**: Explain what and why
3. **Screenshots**: Include before/after for UI changes
4. **Testing**: Describe what you tested
5. **Checklist**: Complete all quality checks

### PR Template

```markdown
## What
Brief description of changes.

## Why
Context and motivation.

## Testing
How you verified the changes.

## Screenshots
Before/after if applicable.

## Checklist
- [ ] TypeScript passes
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] Dark mode works
```

---

## Getting Help

- Check `replit.md` for project-specific patterns
- Review existing code for examples
- Ask in team chat for architectural questions

---

## Release Process

1. Merge approved PRs to `main`
2. Run full test suite
3. Deploy via Replit publish
4. Monitor for errors post-deploy
