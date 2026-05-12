<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/archflow-cyberpunk%20system%20design-00ff9d?style=for-the-badge&labelColor=0a0a0a">
    <img alt="Archflow" src="https://img.shields.io/badge/archflow-cyberpunk%20system%20design-00ff9d?style=for-the-badge&labelColor=0a0a0a">
  </picture>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-All_Rights_Reserved-red?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js 15">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/Node-22-339933?style=flat-square&logo=node.js" alt="Node.js 22">
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Redis-Upstash-FF4438?style=flat-square&logo=redis" alt="Redis">
  <img src="https://img.shields.io/badge/Electron-Mac-47848F?style=flat-square&logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/version-1.5-00ff9d?style=flat-square" alt="Version 1.5">
  <img src="https://img.shields.io/badge/status-active-00ff9d?style=flat-square" alt="Status: Active">
</p>

---

# Archflow

**Archflow** is a production-grade AI system design generator. Describe any application — Instagram, YouTube, fintech, e-commerce, IoT — and get an accurate, fully-connected architecture diagram with real technology names, proper protocols, and all layers wired.

> from "build me Instagram" to a complete, production-ready system diagram in seconds

Archflow optimizes for **accuracy**, **completeness**, and **zero friction** — every AI-generated diagram has all nodes connected with valid protocols, no warnings, and no isolated components.

---

## System Architecture

```mermaid
flowchart TB
  subgraph Client["Client Layer"]
    WEB["Web Browser"]
    DESKTOP["Mac Desktop (Electron)"]
  end

  subgraph Frontend["Frontend (Next.js 15 / React 19)"]
    UI["React Flow Canvas<br/>Diagram Editor"]
    PANELS["AI Assistant Panel<br/>Review Panel<br/>Library Panel<br/>History Panel"]
    RENDER["styled-components<br/>Framer Motion<br/>html-to-image"]
  end

  subgraph Backend["Backend (Express / Node.js 22)"]
    API["REST API Routes"]
    GEN["Diagram Generator<br/>(OpenRouter AI)"]
    RULES["Connection Rules Engine<br/>Review Signals (SOLID/CHECK/RISK)"]
    EVAL["Internal Eval Harness"]
  end

  subgraph Data["Data Layer"]
    DB[("PostgreSQL<br/>(Neon)")]
    CACHE[("Redis<br/>(Upstash)")]
  end

  subgraph Auth["Auth"]
    CLERK["Clerk<br/>Authentication"]
  end

  subgraph AI["AI"]
    OR["OpenRouter<br/>AI Model Access"]
  end

  WEB --> UI
  DESKTOP --> UI
  UI --> PANELS
  PANELS --> API
  API --> GEN
  API --> RULES
  API --> CLERK
  API --> DB
  API --> CACHE
  GEN --> OR
  EVAL --> GEN
  RULES --> EVAL
```

---

## Table of Contents

- [What Archflow Helps With](#what-archflow-helps-with)
- [Product Principles](#product-principles)
- [User-Facing Features](#user-facing-features)
- [Architecture Assistant Flow](#architecture-assistant-flow)
- [Architecture Assistant Reliability](#architecture-assistant-reliability)
- [Connection Clarity](#connection-clarity)
- [Review Language](#review-language)
- [What We Intentionally Avoid](#what-we-intentionally-avoid)
- [Internal Quality Loop](#internal-quality-loop)
- [Smoke Tests](#smoke-tests)
- [Tech Stack](#tech-stack)
- [Mac Desktop Application](#mac-desktop-application)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Why This Direction Matters](#why-this-direction-matters)
- [License](#license)

---

## What Archflow Helps With

- turn a natural-language product idea into a visual system diagram
- understand **why** a technology was chosen
- understand which units are connected, in which direction, and through which named flow
- ask the architecture assistant what is missing, weak, or worth verifying in the current diagram
- stage suggested technologies into Architectural Review before they touch the live diagram
- inspect assumptions and potential risks in the architecture
- replace one part of the system without regenerating everything
- keep diagrams readable with automatic layout and grouped categories
- compare versions and continue improving the same system over time
- export diagrams for sharing and documentation

---

## Product Principles

- **AI output is always clean** — every generated diagram has all nodes connected with valid protocols, zero warnings, zero isolated components
- **Rules for manual editing, not AI policing** — connection mode (Strict/Guided/Sandbox) applies when users manually modify diagrams, not to AI output
- **Surgical iteration over full regeneration** — changing one part of the system should not blow away the rest
- **Architecture score as a signal, not a grade** — the score helps gauge completeness, it's not a gamified ranking
- **Flow clarity over label overload** — connections should be understandable without turning the canvas into a wall of overlapping text

---

## User-Facing Features

### Premium Technical Design Language
- **High-Fidelity Visual Excellence:** A beautiful cyberpunk-inspired, monochrome interface designed for serious system thinking.
- **Flat UI/UX System:** Completely shadowless components (`box-shadow` and `drop-shadow` fully excised globally) paired with crisp borders, rounded corners, and native typography.
- **Optimized Landing Pathways:** Direct access pathways to web sandboxes or standalone macOS workstation binaries (`Archflow.zip`).

### AI Diagram Generation
- Generate production-grade system architecture from any prompt — famous companies (Instagram, Netflix, Uber, YouTube, WhatsApp, Twitter, Facebook, Slack, Amazon, Discord, Figma), application types (e-commerce, fintech, SaaS, realtime, IoT, healthcare, analytics), or custom descriptions
- **Known architecture database** — 14+ famous company stacks with real technology names, not generic placeholders
- **Domain-specific patterns** — e-commerce, social media, video streaming, fintech, SaaS multi-tenant, realtime collaboration, IoT, healthcare, and analytics platforms each get appropriate tech choices
- **Zero isolated node guarantee** — auto-fix layer ensures every generated node is connected with proper protocol labels
- **Smart auto-wiring** — missing auth layer, observability stack, queue consumers, and cache layers are detected and connected automatically
- **Deterministic generation engine** — temperature 0.2 with `response_format: json_object` ensures consistent, reproducible outputs instead of random tech selections
- **JSON repair on failure** — if the AI returns malformed JSON, retries with the exact parse error for a corrected response
- Surgical editing — replace individual nodes without regenerating the entire diagram
- Auto-layout spaces nodes into clean category lanes for readability

### AI Architecture Assistant
- Chat-based assistant that understands the full diagram context (nodes, edges, rules)
- **Context Budget Guard:** Intelligent serialization monitoring prevents token overflow by validating review/chat context payloads (capped gracefully at 28,000 characters) with clear human-readable feedback.
- Explains why specific technologies were chosen and flags gaps, risks, or missing layers
- Stages proposed additions into Architectural Review instead of mutating the diagram directly
- Chat history survives page refreshes via draft persistence

### Architectural Review System
- Dedicated review drawer with architecture score (0–100 with letter grade A–F), finding counts, and layer coverage stats
- **Architecture score** — computed from critical/warning/info findings plus layer coverage (auth, cache, queue, observability, storage, etc.)
- **Connection mode selector** — Strict (block invalid connections), Guided (flag unusual patterns), Sandbox (zero warnings for free sketching)
  - Strict/Guided/Sandbox modes apply to manual diagram editing only — AI-generated output is always clean
- Review signals use `SOLID` / `CHECK` / `RISK` labels (not HIGH/MEDIUM/LOW)
- 20+ deterministic checks including: direct client-to-database, missing application/auth/observability layers, queue topology gaps, isolated nodes, generic protocols, single-datastore pressure, central backend choke points, missing CDN/traffic management, missing cache layer, missing async processing
- Staged suggestions can be accepted or declined individually
- Accept-and-connect flow — approved suggestions are added to the diagram with rule-aware connection sanitization
- Connection rules engine validates every edge against full 9×9 category matrix (81 rules covering all category pairs)

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

---

## Architecture Assistant Flow

The architecture assistant is meant to feel helpful without becoming a black-box auto-editor.

```
 User asks a question (what's missing, how strong, why a technology)
        │
        ▼
 Assistant answers in chat
        │
        ▼
 Assistant stages additions into ARCHITECTURAL_REVIEW
        │
        ▼
 User reviews — accept or decline each suggestion
        │
        ▼
 Accepted suggestions are added to the diagram
 via sanitized, rule-aware connection flow
```

- users ask questions in chat such as what is missing, how strong the diagram is, or why a specific technology belongs
- the assistant answers in chat first, then stages any proposed additions into `ARCHITECTURAL_REVIEW`
- users decide what to accept or decline in review instead of having the AI mutate the live diagram on its own
- accepted suggestions are added into the diagram and connected through a sanitized, rule-aware flow
- assistant chat history and pending review suggestions are restored after refresh so in-progress review work is not lost

This keeps the product collaborative: the assistant can move fast, but the user still stays in control of what becomes part of the architecture.

---

## Architecture Assistant Reliability

Archflow does not treat architecture review as pure chat.

The assistant works through a **layered reliability model**:

- deterministic review checks catch concrete issues like invalid edge direction, missing app layers, isolated units, queue topology gaps, generic protocols, and review-safe signed storage flows
- the architecture assistant receives those review findings as structured context before it answers
- staged suggestions are sanitized before they are accepted so invalid connections can be dropped or reversed instead of blindly added

This means the assistant is strong on mainstream system patterns, but it is still an AI-assisted reviewer rather than a perfect verifier. The goal is trustworthy guidance, not false certainty.

---

## Connection Clarity

Connections are important enough that they cannot be treated like tiny edge decorations.

Archflow now handles flow understanding in a layered way:

- the canvas shows focused connection context instead of trying to show every label at once
- selecting a unit reveals all of that unit's connected flows in `UNIT_DETAILS`
- selecting a single flow opens `CONNECTION_DETAILS`
- selected flows are emphasized visually on the canvas so users can immediately see the exact path being discussed
- full-canvas labeling still exists through `FLOW_ALL`, but the default interaction favors readability over density

This is intentional. The goal is not to make the canvas say everything at once. The goal is to make the right relationship obvious at the right moment.

---

## Review Language

Archflow avoids score-heavy wording in the product UI.

Instead of confidence labels like `HIGH`, `MEDIUM`, and `LOW`, the editor uses:

- `SOLID`
- `CHECK`
- `RISK`

These are **review signals**, not grades. They exist to help users understand where a unit or flow feels well-supported and where it deserves another look.

---

## What We Intentionally Avoid

Archflow avoids the following design patterns:

- **Score-chasing behavior** — the architecture score (A–F) exists in the review panel as a quick health signal, not a gamified ranking. The focus stays on understanding the findings, not optimizing a number.
- **Black-box AI mutations** — the AI never directly modifies your diagram. Everything it suggests goes through the Architectural Review panel for your approval.
- **Generic placeholders** — the system uses real technology names (KAFKA, not GENERIC_QUEUE; POSTGRESQL, not USER_DATABASE).
- **Protocols as nodes** — HTTP, HTTPS, gRPC, etc. are edge labels only, never generated as components.
- **App-prefixed names** — REDIS, not INSTAGRAM_REDIS.

---

## Internal Quality Loop

Archflow now includes an internal evaluation harness for maintainers. This is **not** a user-facing scoring system.

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

### Important Files

| File | Purpose |
|------|---------|
| `backend/evals/matrix.json` | Prompt matrix configuration |
| `backend/evals/README.md` | Eval system documentation |
| `backend/src/scripts/eval-harness.js` | CLI workflow entry point |
| `backend/src/lib/evalHarness.js` | Core eval harness logic |
| `backend/src/lib/diagramGenerator.js` | Diagram generation logic |

### Useful Commands

Generate eval prompts (no API calls):
```bash
cd backend
npm run eval:harness -- --generate-only
```

This creates:
- `backend/evals/generated-prompts.json`
- `backend/evals/latest-report.json`
- `backend/evals/latest-report.md`

Run a real evaluation pass:
```bash
cd backend
npm run eval:harness -- --max-prompts 12 --runs 2
```

---

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

> **Practical rule:** use `npm run dev` for everyday work, `npm run smoke:editor` after meaningful editor/panel/AI/review changes, `npm run test:smoke` before shipping or merging.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| Next.js 15 (App Router) | Framework |
| React 19 | UI library |
| React Flow 11 | Diagram canvas |
| styled-components 6 | Styling |
| Framer Motion 12 | Animations |
| html-to-image | PNG export |
| Lucide React | Icons |
| Playwright | Smoke tests |

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js 22 | Runtime |
| Express | HTTP framework |
| PostgreSQL / Neon | Database |
| Redis / Upstash | Caching & rate limiting |
| Clerk | Authentication |
| OpenRouter | AI model access |

### Desktop (Mac App)

| Technology | Purpose |
|------------|---------|
| Electron | Desktop shell |
| electron-builder | DMG distribution |

---

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

1. **Gatekeeper Bypass:** If you see a "damaged" or "cannot be opened" message, run this in your terminal:
   ```bash
   sudo xattr -cr /Applications/Archflow.app
   ```
2. **Right-Click Open:** Instead of double-clicking, **Right-Click** the app and choose **Open**. This allows you to bypass the security block.
3. **Security Settings:** Alternatively, go to **System Settings > Privacy & Security** and click **"Open Anyway"** near the bottom of the page.

---

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

---

## Project Structure

```text
archflow/
├── backend/
│   ├── evals/                  # Internal prompt matrix and eval outputs
│   ├── src/
│   │   ├── config/             # Environment validation
│   │   ├── db/                 # Schema, pool, initialization, migrations
│   │   ├── lib/
│   │   │   ├── diagramGenerator.js   # AI generation + auto-fix layer + known architectures
│   │   │   ├── openRouter.js         # OpenRouter API client, streaming, JSON repair
│   │   │   ├── reviewDiagram.js      # Review context building, suggestion normalization
│   │   │   ├── connectionRules.js    # 81-rule category connection matrix
│   │   │   ├── tech.js               # 110+ technology catalog + categorization
│   │   │   ├── evalHarness.js        # Internal eval harness
│   │   │   └── ...                   # Redis, logger, AI failure logging
│   │   ├── middleware/          # Clerk auth, request validation
│   │   ├── routes/              # AI generation/review, diagrams CRUD, inventory, settings
│   │   └── scripts/             # CLI eval harness, DB migration
├── frontend/
│   ├── app/                    # Next.js App Router (dashboard, diagram editor, settings)
│   ├── components/
│   │   ├── diagram/            # Editor, review panel, prompt bar, synthesis terminal, node/edge UIs
│   │   └── ui/                 # Shared components (toast, badge, modal, button, etc.)
│   └── lib/
│       ├── api.js              # API client + SSE streaming
│       ├── diagramIntelligence.js  # 850+ line rules engine (20+ deterministic checks, trust profiles)
│       ├── templates.js        # Template options (SaaS, e-commerce, mobile, realtime, microservices)
│       └── ...                 # Theme, display names, edge layout
├── desktop/                    # Electron Mac desktop shell
└── README.md
```

---

## Why This Direction Matters

Archflow gets stronger when it behaves like a clear architecture copilot:

- AI helps create and edit the system
- rules help keep results sane
- UI helps users understand what happened
- focused flow inspection keeps connection meaning readable
- internal evaluation helps us improve quality without guessing

That combination is the real moat, not a flashy score.

---

## License

All Rights Reserved.

This repository is proprietary. You may not use, modify, distribute, or sell this code without explicit permission.
