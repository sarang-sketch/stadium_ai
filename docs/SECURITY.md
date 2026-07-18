# Security Policy

## Supported Versions
Only the latest major version (main branch) receives security updates.

## Reporting a Vulnerability
If you discover a security vulnerability, please send an email to the project maintainers. Do NOT report security vulnerabilities via public GitHub issues.

## Security Features Implemented
- **Authentication & Authorization**: Firebase Auth with secure HTTP-only cookies/tokens.
- **Input Validation**: All incoming API requests and form submissions are validated using Zod.
- **Rate Limiting**: Critical endpoints (e.g., `/api/chat`, login, purchase) have strict rate limiting.
- **Headers**: Strict CSP, X-Frame-Options, and X-XSS-Protection headers configured via `next.config.ts`.
- **Data Sanitization**: React automatically escapes HTML to prevent XSS.
- **Dependency Scanning**: Routine `npm audit` checks run in CI.
