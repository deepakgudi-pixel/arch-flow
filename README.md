# Archflow

Archflow is an AI-assisted system architecture workspace for people who want to learn, understand, and iterate on software diagrams without needing to be perfect at system design on day one.

The product is built around one core idea:

- users should leave with a clearer mental model of the system, not just a pretty AI output

That means Archflow optimizes for trust, inspectability, presentability, and iteration speed.

## What Archflow Helps With

- turn a natural-language product idea into a visual system diagram
- understand why a technology was chosen
- understand which units are connected, in which direction, and through which named flow
- inspect assumptions and potential risks in the architecture
- replace one part of the system without regenerating everything
- keep diagrams readable with automatic layout and grouped categories
- compare versions and continue improving the same system over time
- export diagrams for sharing and documentation

## Product Principles

- Trust over novelty: the app should feel dependable, not magical-but-random
- Learning over scoring: users should understand the architecture, not chase a number
- Surgical iteration over full regeneration: changing one part of the system should not blow away the rest
- Internal evaluation for us, review language for users: quality control belongs behind the scenes, not as a gamified user score
- Flow clarity over label overload: connections should be understandable without turning the canvas into a wall of overlapping text

## User-Facing Features

- AI diagram generation from free-form prompts
- Auto-arrange that spaces nodes into cleaner category lanes
- Node details sidebar with:
  - why this was chosen
  - assumptions
  - review risks
  - connected incoming and outgoing flows
  - same-category replacement suggestions
- Connection details sidebar for selected flows
- Flow visibility modes:
  - `FLOW_CONTEXT` for focused inspection
  - `FLOW_ALL` for full connection labeling
  - `FLOW_HIDE` for a cleaner canvas
- Architecture review drawer with findings, all-clear state, and areas to verify
- Version history with snapshot restore and diff-aware context
- PNG and JSON export
- Tech inventory with built-in and generated modules
- Collaboration and invite support

## Connection Clarity

Connections are important enough that they cannot be treated like tiny edge decorations.

Archflow now handles flow understanding in a layered way:

- the canvas shows focused connection context instead of trying to show every label at once
- selecting a unit reveals all of that unit's connected flows in `UNIT_DETAILS`
- selecting a single flow opens `CONNECTION_DETAILS`
- selected flows are emphasized visually on the canvas so users can immediately see the exact path being discussed
- full-canvas labeling still exists through `FLOW_ALL`, but the default interaction favors readability over density

This is intentional. The goal is not to make the canvas say everything at once. The goal is to make the right relationship obvious at the right moment.

## Review Language

Archflow avoids score-heavy wording in the product UI.

Instead of confidence labels like `HIGH`, `MEDIUM`, and `LOW`, the editor uses:

- `SOLID`
- `CHECK`
- `RISK`

These are review signals, not grades. They exist to help users understand where a unit or flow feels well-supported and where it deserves another look.

## What We Intentionally Avoid

Archflow does not aim to be a public "architecture grading" product.

We intentionally avoid a user-facing score like `78/100` because that usually creates the wrong behavior:

- people optimize for the score instead of understanding the system
- the app feels rigid and judgey
- AI starts looking like it is grading itself

Instead, the product surfaces:

- findings
- assumptions
- risks
- suggested edits
- clear flow context

That keeps the app educational and useful without turning it into a black-box evaluator.

## Internal Quality Loop

Archflow now includes an internal evaluation harness for maintainers. This is not a user-facing scoring system.

The harness exists to help us answer questions like:

- are model outputs getting more consistent?
- did a prompt change make diagrams worse?
- are important architecture layers being missed?
- do repeated runs stay structurally similar?

It works by:

- generating prompt sets from a small matrix instead of hand-writing dozens of prompts
- optionally mining real prompt text from `diagram_versions`
- running prompts multiple times
- scoring results with deterministic architecture checks
- writing both JSON and Markdown reports for quick review

Important files:

- [backend/evals/matrix.json](/Users/deepak/Downloads/arch/backend/evals/matrix.json)
- [backend/evals/README.md](/Users/deepak/Downloads/arch/backend/evals/README.md)
- [backend/src/scripts/eval-harness.js](/Users/deepak/Downloads/arch/backend/src/scripts/eval-harness.js)
- [backend/src/lib/evalHarness.js](/Users/deepak/Downloads/arch/backend/src/lib/evalHarness.js)
- [backend/src/lib/diagramGenerator.js](/Users/deepak/Downloads/arch/backend/src/lib/diagramGenerator.js)

Useful commands:

```bash
cd backend
npm run eval:harness -- --generate-only
```

This creates:

- `backend/evals/generated-prompts.json`
- `backend/evals/latest-report.json`
- `backend/evals/latest-report.md`

To run a real evaluation pass:

```bash
cd backend
npm run eval:harness -- --max-prompts 12 --runs 2
```

## Local Auth Verification

Archflow also includes a maintainer auth smoke check for local development. This is meant to catch auth regressions early without needing to manually click through sign-in every time.

What it verifies:

- `/sign-in` renders
- `/sign-up` renders
- a protected probe route blocks logged-out access
- the same protected probe can render under a tightly scoped local development bypass

Important files:

- [frontend/scripts/auth-smoke.mjs](/Users/deepak/Downloads/arch/frontend/scripts/auth-smoke.mjs)
- [frontend/middleware.js](/Users/deepak/Downloads/arch/frontend/middleware.js)
- [frontend/app/auth-smoke-probe/page.js](/Users/deepak/Downloads/arch/frontend/app/auth-smoke-probe/page.js)

Important safety note:

- the bypass is development-only
- it only applies to `/auth-smoke-probe`
- it only works on local hostnames
- it requires a specific header token
- production does not expose this path as a usable bypass

Run it with the frontend dev server active:

```bash
cd frontend
npm run dev
```

In another terminal:

```bash
cd frontend
npm run auth:smoke
```

By default it targets `http://127.0.0.1:3000`.

If you want to point the smoke test at a different local port:

```bash
cd frontend
AUTH_SMOKE_BASE_URL=http://127.0.0.1:3010 npm run auth:smoke
```

If you ever want to test a real authenticated page instead of the built-in probe, you can still override the target path or provide a real auth cookie through environment variables. The probe exists so the default check works out of the box without copying browser session state by hand.

## Tech Stack

### Frontend

- Next.js 14
- React 18
- React Flow
- styled-components
- Framer Motion

### Backend

- Node.js
- Express
- PostgreSQL / Neon
- Redis / Upstash
- Clerk
- OpenRouter

## Getting Started

### Prerequisites

- Node.js 22.16.x recommended
- PostgreSQL database
- Clerk project
- OpenRouter API key

### Backend Environment

Create `backend/.env`:

```env
PORT=4000
NEON_DB_URL=postgresql://user:password@host.neon.tech/archflow?sslmode=require
CLERK_SECRET_KEY=sk_test_xxx
CLERK_JWT_KEY=your_clerk_jwt_public_key
OPENROUTER_API_KEY=sk-or-v1-xxx

REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

### Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Install Dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Run the App

```bash
cd backend && npm run dev
```

In another terminal:

```bash
cd frontend && npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Project Structure

```text
archflow/
├── backend/
│   ├── evals/              # Internal prompt matrix and eval outputs
│   ├── src/
│   │   ├── db/             # Schema, pool, initialization
│   │   ├── lib/            # Shared generation, rules, logging, eval helpers
│   │   ├── routes/         # AI, diagrams, inventory, settings, users
│   │   └── scripts/        # Maintainer CLI workflows
├── frontend/
│   ├── app/                # Next.js App Router pages
│   ├── components/
│   │   ├── diagram/        # Editor, review, history, node UI
│   │   └── ui/             # Shared UI components
│   └── lib/                # API client, theme, diagram intelligence
└── OPTIMIZATION_LOG.md     # Product reasoning and implementation history
```

## Why This Direction Matters

Archflow gets stronger when it behaves like a clear architecture copilot:

- AI helps create and edit the system
- rules help keep results sane
- UI helps users understand what happened
- focused flow inspection keeps connection meaning readable
- internal evaluation helps us improve quality without guessing

That combination is the real moat, not a flashy score.

## License

MIT
