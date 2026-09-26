# Cross-device verification

Minimal pnpm monorepo for a React web application and a Fastify backend.

## Requirements

- Node.js 24.21.0
- pnpm 12.6.0

The repository-level `.npmrc` uses the public npm registry instead of the global registry configuration.

Select the pinned Node.js version with nvm:

```bash
nvm install
nvm use
```

## Install

```bash
rtk pnpm install
```

## Development

Run both applications:

```bash
rtk pnpm dev
```

- Web: <http://localhost:5173>
- Backend health check: <http://127.0.0.1:3000/health>

Run one workspace:

```bash
rtk pnpm --filter @verify/web dev
rtk pnpm --filter @verify/backend dev
```

## Checks

```bash
rtk pnpm lint
rtk pnpm typecheck
rtk pnpm test
rtk pnpm build
```

Product-domain behavior, including the session model and `CreateSession`, belongs to the next vertical slice.
