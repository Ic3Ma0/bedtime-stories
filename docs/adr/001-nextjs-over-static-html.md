# ADR 001: Next.js over Static HTML

## Status

Accepted

## Context

The project was originally planned as a pure HTML + CSS + JavaScript application (zero build, Tailwind CDN, GitHub Pages deployment). The motivation was minimal complexity and zero server cost.

However, the actual codebase was initialized with Next.js + TypeScript before the documentation was updated.

## Decision

We will proceed with **Next.js + TypeScript** as the core stack, abandoning the pure HTML approach.

## Consequences

### Positive

- Full SSR / API Routes / Server Actions available when needed
- Type safety via TypeScript
- Component-based architecture scales better if the project grows
- Rich ecosystem (shadcn/ui, NextAuth if needed later, etc.)

### Negative

- Build step required — cannot deploy as raw HTML to GitHub Pages without `output: 'export'`
- Higher cognitive load for contributors unfamiliar with React/Next.js
- Node.js runtime required for development

## Alternatives Considered

- **Static HTML (original plan)**: Rejected. The project is already a Next.js codebase; reverting would waste existing work.
- **Astro**: Considered briefly as a middle ground. Rejected — team already familiar with Next.js, no compelling advantage for this use case.

## Notes

Deployment strategy remains flexible. Next.js supports static export, Vercel, or self-hosted Node.js. We will decide later based on actual needs.
