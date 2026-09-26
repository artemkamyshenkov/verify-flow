# Monorepo Bootstrap Design

## Goal

Create the smallest working monorepo foundation for the cross-device verification project. The result should make the web and backend applications independently understandable and runnable without introducing infrastructure needed only by future iterations.

## Scope

This bootstrap includes:

- a private root package managed by pnpm 12.6.0;
- a pnpm workspace containing `apps/web` and `apps/backend`;
- a React and TypeScript web application built with Vite;
- a Fastify and TypeScript backend application;
- root scripts that delegate development, build, and type-check tasks to workspace packages;
- minimal documentation for installation and local startup.

It intentionally excludes the `Session` model, `CreateSession`, realtime communication, persistence, shared packages, task orchestrators, containers, and deployment configuration.

## Repository Structure

```text
verify/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── backend/
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .gitignore
└── README.md
```

Each application owns its dependencies and TypeScript configuration. No shared package or shared TypeScript configuration is introduced until duplication demonstrates a real need.

## Workspace Configuration

The root `package.json` is private and pins `pnpm@12.6.0` through `packageManager`. It contains orchestration scripts only; application dependencies remain in their respective workspaces.

`pnpm-workspace.yaml` includes `apps/*`. Native pnpm filtering and recursive commands are sufficient at this scale, so Nx and Turborepo are unnecessary.

## Web Application

The web workspace uses the standard Vite React TypeScript template. The bootstrap keeps only enough UI to prove that the application starts and builds. It does not call the backend yet; that belongs to the subsequent CreateSession vertical slice.

## Backend Application

The backend workspace uses Fastify with TypeScript and a minimal executable entry point. It exposes a simple health endpoint solely to verify that the HTTP server starts and responds. Domain routes and session state are deferred to the next vertical slice.

Development runs TypeScript directly with a lightweight development runner. Production build output is emitted as JavaScript and executed by Node.js.

## Local Development

Developers can run each application separately through pnpm filters. A root development command runs both workspaces concurrently using pnpm's built-in recursive execution rather than adding a process-orchestration dependency.

Default local ports are distinct. Cross-origin configuration is not added during bootstrap because the web application does not yet call the backend. CORS will be introduced with the first browser-to-backend request, where its exact origin can be configured intentionally.

## Failure Handling

The backend should fail visibly if its port is unavailable or startup throws. No retry or graceful-shutdown framework is needed for this bootstrap. The web application relies on Vite's standard development error reporting.

## Verification

The bootstrap is complete when:

1. one root install produces a single lockfile;
2. both development servers start from root-level scripts;
3. the web application renders in a browser;
4. the backend health endpoint returns a successful response;
5. both workspaces pass their build and TypeScript checks;
6. no product-domain functionality has been introduced.

## Risks and Assumptions

- pnpm 12.6.0 is available in the developer environment and is the version pinned by the repository.
- Running workspace development scripts concurrently is sufficient for two applications; richer orchestration can be added only if a concrete need appears.
- The health endpoint is infrastructure verification, not the beginning of the verification domain model.
