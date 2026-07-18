# Contributing to StadiumAI

We welcome contributions! Please follow these steps to contribute.

## Development Setup
1. Fork the repository.
2. Clone your fork locally.
3. Run `npm install` to install dependencies.
4. Set up your `.env.local` based on `docs/DEPLOYMENT.md`.
5. Run `npm run dev` to start the local server.

## Code Style Guidelines
- **TypeScript**: Strict typing is required. No `any` types.
- **Linting**: Ensure `npm run lint` passes without errors.
- **Formatting**: We use Prettier. Code will be formatted on commit.
- **Accessibility**: All UI components must use semantic HTML and include proper ARIA attributes.

## Pull Request Process
1. Create a feature branch (`git checkout -b feature/amazing-feature`).
2. Commit your changes (`git commit -m 'feat: add amazing feature'`).
3. Push to the branch (`git push origin feature/amazing-feature`).
4. Open a Pull Request against the `main` branch.
5. Ensure all CI checks pass.
6. Await review from a core team member.

## Issue Reporting
Use the provided GitHub Issue templates to report bugs or request features. Please provide as much context, including OS and browser versions, as possible.
