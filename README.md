# Archflow

Archflow is an AI-assisted system architecture workspace for people who want to learn, understand, and iterate on software diagrams without needing to be perfect at system design on day one.

The product is built around one core idea:

- users should leave with a clearer mental model of the system, not just a pretty AI output

That means Archflow optimizes for trust, inspectability, presentability, and iteration speed.

## What Archflow Helps With

- turn a natural-language product idea into a visual system diagram
- understand why a technology was chosen
- understand which units are connected, in which direction, and through which named flow
- ask the architecture assistant what is missing, weak, or worth verifying in the current diagram
- stage suggested technologies into Architectural Review before they touch the live diagram
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

### AI Diagram Generation
- Generate complete system architecture diagrams from free-form natural language prompts
- AI auto-infers missing layers (auth, storage, queues, etc.) and suggests appropriate technologies
- Surgical editing — replace individual nodes without regenerating the entire diagram
- Auto-layout spaces nodes into clean category lanes for readability

### AI Architecture Assistant
- Chat-based assistant that understands the full diagram context (nodes, edges, rules)
- Explains why specific technologies were chosen and flags gaps, risks, or missing layers
- Stages proposed additions into Architectural Review instead of mutating the diagram directly
- Chat history survives page refreshes via draft persistence

### Architectural Review System
- Dedicated review drawer showing deterministic architecture findings
- Review signals use `SOLID` / `CHECK` / `RISK` labels (not HIGH/MEDIUM/LOW)
- Staged suggestions can be accepted or declined individually
- Accept-and-connect flow — approved suggestions are added to the diagram with rule-aware connection sanitization
- Connection rules engine validates every edge against canonical category rules (e.g. frontend→database is blocked)

### Interactive Diagram Canvas
- Full React Flow-powered canvas with zoom, pan, snap-to-grid
- Flow visibility modes: `FLOW_CONTEXT` (focused), `FLOW_ALL` (full labels), `FLOW_HIDE` (clean)
- Protocol-labeled edges with animated flow simulation
- Selected connections are emphasized visually on the canvas
- Drag-and-drop tech from the library panel directly onto the canvas

### Node Details Sidebar
- Displays role, reason, and category for each selected node
- Lists assumptions and review risks
- Shows incoming and outgoing connected flows
- Suggests same-category replacement technologies

### Connection Details Sidebar
- Shows source → target endpoints with protocol and category badges
- Displays connection spec, why it fits, assumptions, and review risks
- Confidence signals derived from deterministic rule checks
- One-click disconnect button to delete the connection

### Version History
- Full version snapshots stored as the diagram evolves
- Restore any previous version with a single click
- Diff-aware context preserved for architecture assistant queries

### Tech Inventory
- Built-in technology catalog organized by category (frontend, backend, database, queue, auth, storage, external, devops)
- User-registered custom technologies
- Drag-and-drop from inventory onto the canvas

### Export & Sharing
- PNG export with high-resolution (2x) pixel rendering
- JSON export for programmatic use
- Real-time cloud save with autosave
- Collaboration via email invite with shared diagram access

## Architecture Assistant Flow

The architecture assistant is meant to feel helpful without becoming a black-box auto-editor.

- users ask questions in chat such as what is missing, how strong the diagram is, or why a specific technology belongs
- the assistant answers in chat first, then stages any proposed additions into `ARCHITECTURAL_REVIEW`
- users decide what to accept or decline in review instead of having the AI mutate the live diagram on its own
- accepted suggestions are added into the diagram and connected through a sanitized, rule-aware flow
- assistant chat history and pending review suggestions are restored after refresh so in-progress review work is not lost

This keeps the product collaborative: the assistant can move fast, but the user still stays in control of what becomes part of the architecture.

## Architecture Assistant Reliability

Archflow does not treat architecture review as pure chat.

The assistant works through a layered reliability model:

- deterministic review checks catch concrete issues like invalid edge direction, missing app layers, isolated units, queue topology gaps, generic protocols, and review-safe signed storage flows
- the architecture assistant receives those review findings as structured context before it answers
- staged suggestions are sanitized before they are accepted so invalid connections can be dropped or reversed instead of blindly added

This means the assistant is strong on mainstream system patterns, but it is still an AI-assisted reviewer rather than a perfect verifier. The goal is trustworthy guidance, not false certainty.

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

## Smoke Tests

Archflow includes automated smoke checks to catch regressions in critical flows without manual clicking.

### Editor Smoke Test (Playwright)

A Playwright browser test that verifies the core editor panels open and close correctly — AI Assistant, Review, Library, History, and the Actions menu.

```bash
cd frontend
npm run smoke:editor
```

This starts the app automatically for the test run. Covers:
- AI Assistant panel opens and closes
- Review panel opens, suggestion accept-and-connect works, panel closes
- Library panel opens and closes
- Actions menu → History panel flow

### Auth Smoke Check

Verifies auth boundaries without copying browser session state by hand:

- `/sign-in` and `/sign-up` render correctly
- Protected routes block unauthenticated access
- A scoped dev bypass allows the probe page to render locally

```bash
cd frontend
npm run auth:smoke
```

Targets `http://127.0.0.1:3000` by default. Override with:

```bash
AUTH_SMOKE_BASE_URL=http://127.0.0.1:3010 npm run auth:smoke
```

### Full Smoke Pass

```bash
cd frontend
npm run test:smoke
```

Runs auth smoke check first, then the editor smoke test.

**Practical rule:** use `npm run dev` for everyday work, `npm run smoke:editor` after meaningful editor/panel/AI/review changes, `npm run test:smoke` before shipping or merging.

## Tech Stack

### Frontend

- Next.js 15 (App Router)
- React 19
- React Flow 11
- styled-components 6
- Framer Motion 12
- html-to-image (PNG export)
- Lucide React (icons)
- Playwright (smoke tests — editor flow)

### Backend

- Node.js 22
- Express
- PostgreSQL / Neon (serverless Postgres)
- Redis / Upstash (caching, rate limiting)
- Clerk (authentication)
- OpenRouter (AI model access)
- Rate limiting with Redis-backed store
- 2-layer cache (local in-memory + Redis)
### Desktop (Mac App)

- Electron
- electron-builder (for DMG/distribution)

## Mac Desktop Application

Archflow includes a native Mac application built with Electron. The desktop version functions as a high-performance industrial workstation, providing a distraction-free environment and native features like local draft persistence.

### How it works

The desktop app is a specialized shell that:
1. Loads the production URL (`https://arch-flow.vercel.app`).
2. Injects a native bridge (`archflowDesktopStorage`) through a preload script.
3. Automatically switches the interface to "Desktop Mode" (e.g., normal cursor behavior, removed download prompts).
4. Handles local file system storage for architectural drafts that survive refreshes.

### Running Locally

To run the desktop shell in development mode:

```bash
cd desktop
npm install
npm start
```

### Building the DMG (Mac Installer)

To package the application into a redistributable Mac `.dmg` file:

```bash
cd desktop
npm run build
```

This will generate an `Archflow.dmg` and a `.zip` file in the `desktop/dist/` directory.

**Note on Packaging:**
- The build process uses `electron-builder`.
- It bundles the `main.js`, `preload.js`, and local assets.
- For production distribution, the app points to the live Vercel deployment, allowing for instant frontend updates without requiring users to download a new DMG for every small change.

### Troubleshooting Unsigned Mac Builds

Because early development builds are not yet notarized by Apple, you may see a warning when opening the `.dmg` or the `.app`.

1. **Gatekeeper Bypass**: If you see a "damaged" or "cannot be opened" message, run this in your terminal:
   ```bash
   sudo xattr -cr /Applications/Archflow.app
   ```
2. **Right-Click Open**: Instead of double-clicking, **Right-Click** the app and choose **Open**. This allows you to bypass the security block.
3. **Security Settings**: Alternatively, go to **System Settings > Privacy & Security** and click **"Open Anyway"** near the bottom of the page.

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

### Dev Server

```bash
cd frontend
npm run dev
```

Starts the Next.js development server on port 3000.

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
