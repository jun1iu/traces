# Design Engineering Playground

A TypeScript project for small interface components, built the way a design
engineer would build them. Each one uses shared design tokens, works with a
keyboard and a screen reader, and has motion that respects the user's settings.

## What's here

| Piece                                                             | Details worth noticing                                                                                                                                                                                           |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design tokens** (`src/app/globals.css`, `src/tokens/tokens.ts`) | Semantic colour names such as `surface`, `muted` and `accent`, never raw hex values in components. Light, dark and system themes come from one variable swap. A test fails if a token is missing from any theme. |
| **Button**                                                        | Primary, secondary, ghost and danger variants. Spring press feedback. A loading state that keeps the button's width and its accessible name, and sets `aria-busy`.                                               |
| **Segmented control**                                             | A WAI-ARIA radio group with a roving tabindex. Arrow, Home and End keys work. One shared-layout indicator glides between options.                                                                                |
| **Switch**                                                        | `role="switch"`. Works controlled or uncontrolled through `useControllableState`. The label is clickable and the description is wired to `aria-describedby`.                                                     |
| **Theme toggle**                                                  | An inline pre-paint script means no flash on reload. Reads the saved preference through `useSyncExternalStore`, so hydration stays safe.                                                                         |
| **Motion system**                                                 | Named springs and durations in `tokens.ts`. `MotionConfig reducedMotion="user"`, plus a CSS fallback for reduced motion.                                                                                         |

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Motion,
Vitest and Testing Library, ESLint, and Prettier with Tailwind class sorting.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script           | What it does                                                         |
| ---------------- | -------------------------------------------------------------------- |
| `npm run check`  | Runs typecheck, lint, format check and tests. Run it before pushing. |
| `npm test`       | Unit and accessibility tests (Vitest + Testing Library)              |
| `npm run build`  | Production build. Every page is statically prerendered.              |
| `npm run format` | Runs Prettier, which also sorts Tailwind classes                     |

## Deploying

Live at **https://playground.jun-liu.net**.

Merging to `main` deploys automatically: the server builds the `Dockerfile` and
swaps the running container. If a build fails, the running version stays up.

The image uses Next's `standalone` output and runs as the unprivileged `node`
user on a read-only filesystem.

## Structure

```
src/
  app/                 routes: / (component specimens), /tokens
  components/ui/       the reusable components and their tests
  components/site/     page chrome and demos
  hooks/               useControllableState
  lib/                 theme store, cn()
  tokens/              token metadata, motion presets, token tests
```

## Principles

1. **Tokens, not values.** Components use semantic names only, so a theme is just data.
2. **Accessible by construction.** Tests query by role and accessible name,
   the way assistive technology does. A broken label fails the build.
3. **Motion with intent.** A few named springs keep every interaction feeling
   like one system, and reduced-motion users get instant state changes.
4. **No layout shift.** Loading states, theme changes and hover effects never move
   surrounding content.

## Roadmap

- [ ] Command menu (⌘K) with fuzzy search and list virtualisation
- [ ] Tooltip and popover with collision-aware positioning
- [ ] Toast stack with swipe-to-dismiss
- [ ] Playwright visual regression and axe checks in CI
- [ ] Case-study write-ups for each component: the problem, the options, and the decision
- [x] Deploy
- [ ] Link from a portfolio
