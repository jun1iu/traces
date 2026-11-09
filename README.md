# Design Engineering Playground

A TypeScript project for small interface components, built the way a design
engineer would build them. Each one uses shared design tokens, works with a
keyboard and a screen reader, and has motion that respects the user's settings.

## What's here

| Piece                                                             | Details worth noticing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design tokens** (`src/app/globals.css`, `src/tokens/tokens.ts`) | Semantic colour names such as `surface`, `muted` and `accent`, never raw hex values in components. Light, dark and system themes come from one variable swap. A test fails if a token is missing from any theme.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Button**                                                        | Primary, secondary, ghost and danger variants. Spring press feedback. A loading state that keeps the button's width and its accessible name, and sets `aria-busy`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Segmented control**                                             | A WAI-ARIA radio group with a roving tabindex. Arrow, Home and End keys work. One shared-layout indicator glides between options.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Switch**                                                        | `role="switch"`. Works controlled or uncontrolled through `useControllableState`. The label is clickable and the description is wired to `aria-describedby`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Theme toggle**                                                  | An inline pre-paint script means no flash on reload. Reads the saved preference through `useSyncExternalStore`, so hydration stays safe.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Case studies** (`/work`)                                        | Long-form write-ups of the decisions behind each piece. Each decision is set out as what I chose, what I rejected, why, and what it cost, with live comparisons built from the real components: the shipped tree-plus-timeline versus a flame graph on the same run, a colour-vision simulator (Machado et al. 2009) on a real errored run, and a live count of rows in the page. Also lists what review caught. Three studies: the Run explorer; the Returns assistant (replays one request under three step displays, and counts screen-reader updates: 25 for a live region against 2 shipped); and the design system (a loading button that keeps its accessible name, confirmed against Chromium's accessibility tree). |
| **Run explorer** (`/runs`)                                        | A data-dense tool for inspecting 5,000 AI agent runs (seeded sample data). A virtualized listbox renders only the rows in view (about 25 of 5,000) and is one Tab stop with arrow keys, j/k, Page Up/Down, Home and End. Search filters all runs in under 100 ms. Each run opens as a WAI-ARIA tree of steps beside a timeline, showing nested and parallel tool calls, with failures striped as well as coloured. An inspector shows timing, tokens, cost, input, output and errors. The selected run lives in the URL, the panes resize by mouse or keyboard, and a duration histogram with a screen-reader table marks where the selected run falls.                                                                      |
| **Returns assistant** (`/returns`)                                | A chat interface for an AI returns agent, built on [Relay Returns](https://git.jun-liu.net/jzzliu/relay-returns)' policy engine (ported to TypeScript, all nine of its test fixtures pass). Tool steps appear as they run and fold into a summary; replies stream word by word; eligible refunds become a draft awaiting human approval; outages offer a retry. Esc stops a reply, and screen readers hear one announcement per turn instead of every word. The agent is a stream of typed events, so a model-backed transport can replace the engine without changing the UI.                                                                                                                                               |
| **Motion system**                                                 | Named springs and durations in `tokens.ts`. `MotionConfig reducedMotion="user"`, plus a CSS fallback for reduced motion.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

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
  app/                 routes: /, /work (case studies), /runs (run explorer), /returns (AI assistant), /tokens
  components/case-study/  long-form layout and the live comparisons used in case studies
  components/chat/     the Returns assistant: state hook, step timeline, messages
  components/runs/     the run explorer: virtual list, step tree and timeline, inspector, stats
  components/ui/       the reusable components and their tests
  components/site/     page chrome and demos
  hooks/               useControllableState
  lib/                 theme store, cn(), relay/ (policy engine, streaming agent), runs/ (sample-data generator, stats)
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
