# AGENTS.md

## Project

KicksVault is a Next.js App Router storefront for premium sneakers. It uses Prisma/PostgreSQL for persistence, custom JWT access and refresh cookies for auth, Zustand for client state, and a small admin area for shoe management.

## Commands

- Use `npm.cmd` in PowerShell, because `npm` may resolve to `npm.ps1` and fail under the local execution policy.
- Run lint with `npm.cmd run lint`.
- Run production build with `npm.cmd run build`.
- Run the dev server with `npm.cmd run dev`.

## Security Rules

- Never print, commit, or rewrite `.env` values.
- Do not trust client-provided prices. Checkout totals must come from database prices.
- Admin pages must have a server-side guard. Client UI checks are not enough.
- Order creation and stock decrement must happen in the same Prisma transaction.
- Refresh tokens are stored as bcrypt hashes. Compare cookie refresh tokens with `bcrypt.compare`.

## Code Style

- Follow the existing App Router file structure.
- Keep server-only logic in server files and interactive UI in client components.
- Keep edits scoped to the current task.
- Prefer typed request parsing with Zod for API routes.
- Avoid broad UI redesigns during security or stability work.

## Verification

Before claiming a code change is complete, run:

```powershell
npm.cmd run lint
npm.cmd run build
```
