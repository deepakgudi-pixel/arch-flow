# Archflow — Architecture & Technical Guide

> **Version:** 1.5  
> **Last updated:** May 2026  
> **Purpose:** Complete technical reference for understanding, maintaining, and interviewing with this project

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [System Architecture](#2-system-architecture)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [AI Generation Pipeline](#5-ai-generation-pipeline)
6. [Review & Rules Engine](#6-review--rules-engine)
7. [Data Flow](#7-data-flow)
8. [Key Design Decisions](#8-key-design-decisions)
9. [Reliability & Security](#9-reliability--security)
10. [How to Talk About This in Interviews](#10-how-to-talk-about-this-in-interviews)

---

## 1. Product Overview

### What It Does
Archflow is an AI-assisted system architecture workspace. Users describe a system in natural language (e.g., "Instagram" or "e-commerce platform with payments"), and the AI generates a complete architecture diagram with real technology names, proper protocol labels, and all components connected.

### Core Promise
- **Accurate** — uses real technology names (KAFKA, not GENERIC_QUEUE)
- **Complete** — every node has at least one connection, every connection has a real protocol
- **Zero Warnings** — AI-generated diagrams always show clean in the review panel
- **Inspectable** — users can see why each tech was chosen and what the risks are

### Target Users
- Software engineers learning system design
- Architects prototyping new systems
- Engineering managers communicating design decisions
- Interview candidates practicing system design

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Client Layer                       │
│         Web Browser / Mac Desktop (Electron)         │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / SSE
                       ▼
┌─────────────────────────────────────────────────────┐
│               Frontend (Next.js 15)                  │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ React Flow   │  │ Review   │  │ AI Assistant   │  │
│  │ Canvas       │  │ Panel    │  │ Panel          │  │
│  └─────────────┘  └──────────┘  └────────────────┘  │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ Prompt Bar   │  │ History  │  │ Tech Inventory │  │
│  └─────────────┘  └──────────┘  └────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ REST API + SSE Streaming
                       ▼
┌─────────────────────────────────────────────────────┐
│            Backend (Express / Node.js 22)             │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ AI Routes   │  │ Diagram  │  │ CRUD Routes    │  │
│  │ generation  │  │ Review   │  │ (diagrams,     │  │
│  │ + chat      │  │          │  │ inventory,     │  │
│  │             │  │          │  │ settings,      │  │
│  │             │  │          │  │ users)         │  │
│  └──────┬──────┘  └──────────┘  └────────────────┘  │
│         │                                            │
│  ┌──────▼──────────────────────────────────────┐     │
│  │           Core Libraries                      │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │     │
│  │  │Diagram   │ │Eval      │ │Connection    │ │     │
│  │  │Generator │ │Harness   │ │Rules (81)    │ │     │
│  │  └──────────┘ └──────────┘ └──────────────┘ │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │     │
│  │  │OpenRouter│ │Tech      │ │3-Tier Cache  │ │     │
│  │  │Client    │ │Catalog   │ │L1/L2/L3      │ │     │
│  │  └──────────┘ └──────────┘ └──────────────┘ │     │
│  └─────────────────────────────────────────────┘     │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   PostgreSQL      Redis        OpenRouter
   (Neon)        (Upstash)     (AI API)
```

### Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15 (App Router) | React framework with SSR |
| Frontend | React 19 | UI library |
| Frontend | React Flow 11 | Interactive diagram canvas |
| Frontend | styled-components 6 | CSS-in-JS styling |
| Frontend | Framer Motion 12 | Animations |
| Backend | Express 4 | HTTP framework |
| Backend | Node.js 22 | Runtime |
| Backend | PostgreSQL (Neon) | Primary database |
| Backend | Redis (Upstash) | Caching + rate limiting |
| Backend | Clerk | Authentication |
| Backend | OpenRouter | AI model gateway |
| Desktop | Electron | Mac desktop shell |

---

## 3. Frontend Architecture

### Directory Structure
```
frontend/
├── app/                          # Next.js App Router
│   ├── page.js                   # Landing page (562 lines)
│   ├── layout.js                 # Root layout (Clerk, providers, styles)
│   ├── dashboard/page.js         # Dashboard (list/create/join diagrams)
│   ├── diagram/[id]/page.js      # Main diagram editor (~2550 lines)
│   ├── settings/page.js          # User settings
│   └── middleware.js              # Clerk auth middleware
├── components/
│   ├── diagram/
│   │   ├── ArchitectureDiagramSvg.js   # Landing page SVG
│   │   ├── ConnectionDetailsSidebar.js  # Edge details when selected
│   │   ├── CustomNode.js               # Custom React Flow node
│   │   ├── DiagramAssistantPanel.js    # AI chat panel
│   │   ├── EditorHeader.js             # Top navigation bar
│   │   ├── HistoryPanel.js             # Version history
│   │   ├── InviteModal.js              # Collaboration invite
│   │   ├── NodeDetailsSidebar.js       # Node details when selected
│   │   ├── PromptBar.js                # Bottom prompt input
│   │   ├── ProtocolEdge.js             # Custom edge with protocol label
│   │   ├── ReviewPanel.js              # Architecture review drawer
│   │   ├── SynthesisTerminal.js        # AI streaming overlay
│   │   ├── TechInventoryPanel.js       # Drag-and-drop tech library
│   │   ├── ZoneNode.js                 # Category background zones
│   │   └── editorStyles.js             # Shared editor styled-components
│   ├── layout/
│   │   ├── AppShell.js                 # Dashboard shell
│   │   ├── GlobalStyles.js             # Global CSS (dark theme, no shadows)
│   │   ├── MobileGate.js               # Blocks mobile access
│   │   └── PageHeader.js               # Dashboard header
│   └── ui/
│       ├── Badge.js, Button.js, Card.js, ConfirmModal.js,
│       ├── EmptyState.js, Input.js, Modal.js, Toast.js
└── lib/
    ├── api.js                      # API client + SSE streaming
    ├── diagramIntelligence.js      # 866-line rules engine
    ├── displayNames.js             # Tech label formatting
    ├── edgeLabelLayout.js          # Edge label positioning
    ├── templates.js                # Template options
    ├── theme.js                    # Design tokens (shadowless)
    └── reviewDraftStorage.js       # Persist review drafts
```

### Component Hierarchy (Diagram Editor)
```
Container
├── EditorHeader (name, save, export, panels toggle)
├── MainArea
│   ├── ConnectionDetailsSidebar (when edge selected)
│   ├── NodeDetailsSidebar (when node selected)
│   ├── CanvasWrapper
│   │   ├── ReactFlow
│   │   │   ├── CustomNode (all diagram nodes)
│   │   │   ├── ProtocolEdge (all diagram edges)
│   │   │   ├── ZoneNode (category backgrounds)
│   │   │   ├── MiniMap
│   │   │   └── Controls (zoom, layout)
│   │   └── PromptBar (bottom input)
│   └── TechInventoryPanel (right sidebar)
├── ReviewPanel / HistoryPanel / DiagramAssistantPanel (right panel)
├── SynthesisTerminal (overlay during AI generation)
├── InviteModal (collaboration modal)
├── ConfirmModal (delete/clear confirmations)
└── Toast (notifications)
```

### Key Frontend Concepts

#### React Flow Integration
The diagram uses React Flow 11 with custom node and edge types:
- `CustomNode` — displays tech name, category, icon. Category determines column position
- `ProtocolEdge` — smooth-step edge with protocol label chip, route text, pulse animation on selection
- `ZoneNode` — semi-transparent background rectangles grouping nodes by category

#### State Management (No Redux)
No external state management. Uses React built-ins:
- `useState` for UI state (panels, selections, loading)
- `useRef` for mutable values (timeouts, in-flight flags, cached snapshots)
- `useCallback` for memoized handlers
- `useEffect` for side effects (autosave, keyboard shortcuts, data loading)

#### Real-Time Streaming
AI generation uses Server-Sent Events (SSE). The `streamDiagram` function in `api.js`:
1. POSTs to `/api/ai/generate-diagram`
2. Reads the response body as a stream
3. Parses SSE `event:` and `data:` lines
4. Calls `onChunk` callback for each content chunk
5. Calls `onResult` callback when generation completes

#### No Server Shadows
The entire design system is shadowless. `box-shadow` and `drop-shadow` are globally excised. Visual hierarchy is achieved through:
- Thick borders (2-4px)
- Background contrast
- Typography weight and size
- Hover transforms (translate, not shadow)

---

## 4. Backend Architecture

### Directory Structure
```
backend/
├── src/
│   ├── index.js                   # Express app entry, route mounting
│   ├── config/
│   │   └── env.js                 # Environment variable validation
│   ├── db/
│   │   ├── pool.js                # PostgreSQL connection pool
│   │   ├── init.js                # DB initialization + migration runner
│   │   ├── schema.sql             # Full schema definition
│   │   ├── migrate.js             # Migration executor
│   │   └── migrations/            # Numbered migration files
│   ├── lib/
│   │   ├── diagramGenerator.js    # AI generation + auto-fix pipeline (668 lines)
│   │   ├── openRouter.js          # OpenRouter API client, streaming, JSON repair
│   │   ├── reviewDiagram.js       # Review context building
│   │   ├── connectionRules.js     # 81-rule category connection matrix
│   │   ├── tech.js                # 110+ technology catalog
│   │   ├── evalHarness.js         # Internal evaluation framework
│   │   ├── aiFailures.js          # AI failure logging
│   │   ├── redis.js               # Redis client (Upstash + native)
│   │   └── logger.js              # Structured JSON logging
│   ├── middleware/
│   │   ├── clerkAuth.js           # Clerk JWT verification
│   │   └── validate.js            # Request body validation
│   ├── routes/
│   │   ├── ai.js                  # AI endpoints (generation, review, tech, inference)
│   │   ├── diagrams.js            # CRUD + versions + collaborators + invites
│   │   ├── inventory.js           # Tech inventory
│   │   ├── settings.js            # User settings
│   │   └── users.js               # User sync
│   ├── services/
│   │   └── userSync.js            # Ensure user exists
│   └── scripts/
│       ├── db-migrate.js          # CLI migration runner
│       └── eval-harness.js        # CLI eval runner
├── evals/
│   ├── matrix.json                # Prompt evaluation matrix
│   ├── latest-report.json         # Latest eval results
│   └── latest-report.md           # Latest human-readable report
└── tests/
    ├── evalHarness.test.js
    └── reviewDiagram.test.js
```

### API Routes

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/ai/generate-diagram` | POST | Optional | Generate architecture from prompt (SSE stream) |
| `/api/ai/generate-tech` | POST | Required | Generate new tech entry |
| `/api/ai/review-diagram` | POST | Required | Chat-based architecture review |
| `/api/ai/infer-connection` | POST | Optional | Infer protocol between two nodes |
| `/api/diagrams` | GET | Optional | List user's diagrams |
| `/api/diagrams` | POST | Required | Create new diagram |
| `/api/diagrams/:id` | GET | Optional | Get diagram with nodes/edges |
| `/api/diagrams/:id` | PUT | Required | Save diagram |
| `/api/diagrams/:id` | DELETE | Required | Delete diagram + cascade |
| `/api/diagrams/:id/versions` | GET | Optional | List version history |
| `/api/diagrams/:id/invite` | POST | Required | Generate invite code |
| `/api/diagrams/join/:code` | POST | Optional | Join diagram via code |
| `/api/inventory` | GET | Optional | Get tech inventory |
| `/api/inventory` | POST | Required | Add custom tech |
| `/api/settings` | GET | Required | Get user settings |
| `/api/settings` | PUT | Required | Update user settings |
| `/api/users/sync` | POST | Optional | Sync Clerk user to DB |
| `/health` | GET | None | Health check |

### Database Schema

```sql
-- Core tables
users          -- id, email, connection_mode, ...
diagrams       -- id, user_id, name, nodes (JSONB), edges (JSONB)
diagram_versions  -- id, diagram_id, prompt_hash, prompt_text, nodes, edges, raw_response
diagram_collaborators  -- diagram_id, user_id (composite PK)

-- Supporting tables
user_inventory     -- Custom technologies added by user
user_settings      -- User preferences
connection_rules   -- source_category, target_category, is_valid, warning_message
ai_failures        -- Failure records with truncated payloads
schema_migrations  -- Migration tracking
```

### 3-Tier Caching

```
User Prompt → SHA256 Hash → Check L1 (Local Map)
                              │
                         Miss? → Check L2 (Redis)
                              │
                         Miss? → Check L3 (PostgreSQL)
                              │
                         Miss? → Call OpenRouter AI
                              │
                              ▼
                    Populate L1 + L2 + L3
```

- **L1 (Local Memory):** LRU Map, max 50 entries, 1-hour TTL
- **L2 (Redis):** Upstash REST API, 1-hour TTL
- **L3 (PostgreSQL):** `diagram_versions` table, persistent forever

---

## 5. AI Generation Pipeline

This is the core of the product. Understanding this pipeline is critical for interviews.

### Step-by-Step Flow

```
User Prompt ("Instagram")
       │
       ▼
1. buildDiagramUserMessage()
   - If template: prepend template-specific context
   - If no template: "Design a production-grade system for: {prompt}"
       │
       ▼
2. callOpenRouter() with DIAGRAM_SYSTEM_PROMPT + user message
   - Temperature: 0.2 (for JSON generation)
   - response_format: { type: "json_object" }
   - Streams response via SSE
   - 180s timeout, falls back to openrouter/free on failure
       │
       ▼
3. robustParseJSON()
   - Strips markdown fences
   - Attempts JSON.parse()
   - Falls back to balanced bracket extraction
   - Logs truncated error (first 500 chars) on failure
       │
       ▼
4. normalizeDiagramStructure()
   - Normalizes names (UPPERCASE, underscore)
   - Fixes categories via FIXTURE_MAP (100+ tech entries)
   - Drops nodes with invalid categories
   - Deduplicates edges
       │
       ▼
5. enforceArchitectureRules()
   - Fixes database→backend edge direction
   - Adds backend if frontend→database detected
   - Adds CLERK if ≥3 nodes and no auth (skipped for Django)
   - Adds GRAFANA + PROMETHEUS if ≥5 nodes and no observability
   - Wires KAFKA producer/consumer with proper edges
       │
       ▼
6. connectIsolatedNodes()
   - Identifies any node with zero edges
   - Connects each isolated node with appropriate protocol
   - Examples: frontend→backend (HTTPS), backend→database (SQL)
       │
       ▼
7. Edge Deduplication
   - Removes duplicate edges created by AI + auto-fix
       │
       ▼
8. generateNodesFromDiagram() + generateEdgesFromDiagram()
   - Positions nodes in category columns
   - Maps tech names to React Flow node IDs
       │
       ▼
9. Return { nodes, edges, autoFixes }
       │
       ▼
10. On failure: retry with JSON repair message
    - Sends AI the raw response + parse error + expected schema
    - Up to 2 attempts total
```

### System Prompt (Abridged)
```
You are a Staff Infrastructure Architect at a FAANG company.
Design production-grade systems for ANY application type.
Output valid JSON only.

APPROVED TECH CATALOG (110+ technologies across 9 categories)
KNOWN PRODUCTION ARCHITECTURES (14 companies)
DOMAIN-SPECIFIC PATTERNS (9 domains)
PROTOCOL MAP FOR EDGES

RULES:
1. Identify domain from prompt → apply matching pattern
2. Exact tech names only, no app prefixes
3. Max 12 nodes, roles ≤4 words, reasons ≤6 words
4. Frontend/mobile NEVER to database
5. Always include: REDIS(cache), KAFKA(async), S3(storage),
   PROMETHEUS+GRAFANA(observability) for non-trivial systems
```

### Known Architectures (14 Companies)
```
Instagram → SWIFT, KOTLIN, REACT, DJANGO, POSTGRESQL, REDIS,
            CASSANDRA, KAFKA, S3, NGINX, PROMETHEUS, GRAFANA
Netflix   → SWIFT, KOTLIN, SPRING_BOOT, CASSANDRA, DYNAMODB, KAFKA, S3
Uber      → SWIFT, KOTLIN, GO, DJANGO, CASSANDRA, REDIS, POSTGRESQL, KAFKA, S3
YouTube   → REACT, GO, PYTHON, VITESS, BIGTABLE, REDIS, KAFKA
WhatsApp  → SWIFT, KOTLIN, ERLANG, MYSQL, REDIS, KAFKA, S3
Twitter   → REACT, SCALA, JAVA, MYSQL, REDIS, KAFKA, S3
Facebook  → REACT, REACT_NATIVE, PHP, GRAPHQL, MYSQL, REDIS, CASSANDRA, KAFKA, S3
Slack     → SWIFT, KOTLIN, REACT, JAVA, POSTGRESQL, REDIS, MYSQL, KAFKA, S3
Amazon    → REACT, SPRING_BOOT, DYNAMODB, AURORA, REDIS, SQS, KAFKA, S3
Discord   → REACT_NATIVE, REACT, PYTHON, GO, POSTGRESQL, REDIS, CASSANDRA, KAFKA, S3
Notion    → SWIFT, KOTLIN, REACT, NEXT.JS, GO, POSTGRESQL, REDIS, S3
Figma     → SWIFT, KOTLIN, REACT, GO, RUST, POSTGRESQL, REDIS, S3, KAFKA
```

### Domain Patterns (9 Domains)
```
ecommerce       → REACT, EXPRESS, POSTGRESQL, REDIS, STRIPE, KAFKA, S3
social_media    → SWIFT, KOTLIN, DJANGO, POSTGRESQL, REDIS, CASSANDRA, KAFKA, S3
video_streaming → REACT, GO, POSTGRESQL, REDIS, KAFKA, S3, CDN
fintech         → REACT, SPRING_BOOT, POSTGRESQL, REDIS, KAFKA, VAULT, DATADOG
saas_multitenant → REACT, NESTJS, POSTGRESQL, REDIS, KAFKA, S3, CLERK
realtime_collab → REACT, GO, POSTGRESQL, REDIS, KAFKA, S3
iot             → FLUTTER, GO, TIMESCALEDB, KAFKA, S3
healthcare      → REACT, FASTAPI, POSTGRESQL, REDIS, KAFKA, VAULT, S3
analytics       → REACT, PYTHON, CLICKHOUSE, KAFKA, S3
```

---

## 6. Review & Rules Engine

### Architecture Review (Frontend — diagramIntelligence.js)

This is an 866-line deterministic rules engine that runs every time nodes/edges change. It produces findings that feed the review panel and the AI assistant.

```javascript
buildArchitectureReview({ nodes, edges, connectionRules, connectionMode, mode })
```

**Returns:** array of findings with `{ severity, title, detail, nodeIds, edgeIds }`

**Finding severities:**
- `critical` — architectural violations (must fix)
- `warning` — potential issues (should review)
- `info` — suggestions (could improve)

**20+ checks implemented:**
1. `NO_DATA_FLOW` — multiple nodes but no edges
2. `FRONTEND_DIRECT_TO_DATABASE` — critical violation
3. `MOBILE_DIRECT_TO_DATABASE` — critical violation
4. `MISSING_APPLICATION_LAYER` — clients exist with DB but no backend
5. `RULE_VIOLATION` — connection violates category rules
6. `GENERIC_PROTOCOL_LABEL` — edge has "CONNECTION" or "API" label
7. `ISOLATED_NODE` — node with no edges
8. `QUEUE_WITHOUT_PRODUCER` — queue with no one writing to it
9. `QUEUE_WITHOUT_CONSUMER` — queue with no one reading from it
10. `MISSING_BACKEND_LAYER` — clients with no backend or external
11. `FRONTEND_ONLY_ARCHITECTURE` — only frontend nodes
12. `NO_AUTH_LAYER` — client surfaces but no auth
13. `NO_OBSERVABILITY_LAYER` — complex system but no devops
14. `SINGLE_DATASTORE_PRESSURE` — large system, one database
15. `LIMITED_ASYNC_SCALING_PATH` — multiple backends, no queue
16. `CENTRAL_BACKEND_CHOKE_POINT` — single backend, many responsibilities
17. `MISSING_TRAFFIC_MANAGEMENT` — 6+ nodes, no NGINX/CLOUDFLARE
18. `NO_STORAGE_LAYER` — client-facing, no S3/R2
19. `MISSING_CACHE_LAYER` — multiple databases, no REDIS
20. `MISSING_ASYNC_PROCESSING` — multiple backends, no queue

### Connection Rules (81 Rules)

Every possible source_category → target_category pair has a rule:

```
mobile → backend:  ✅ valid
mobile → database: ❌ "Mobile clients must never connect directly to the database"
mobile → queue:    ❌ "Mobile clients must never connect directly to a queue"
mobile → auth:     ✅ "Direct auth integration is valid, but verify the flow"
...
backend → database: ✅ valid
backend → queue:    ✅ valid
...
database → backend: ❌ "Databases should not initiate application-layer connections"
...
queue → backend: ✅ "Queue-to-backend data flow represents consumer subscription pattern"
```

Rules are duplicated in two places:
- `backend/src/lib/connectionRules.js` — used by eval harness
- `frontend/lib/diagramIntelligence.js` — used by review panel

### Connection Modes

| Mode | Behavior |
|------|----------|
| **Strict** | Invalid connections flagged as `critical`. Only architecturally valid connections allowed. |
| **Guided** (default) | Invalid connections flagged as `warning`. Workspace stays flexible. |
| **Sandbox** | No warnings at all. Total freedom to sketch. |

### Review Signals (Node/Edge Trust Profiles)

Instead of HIGH/MEDIUM/LOW, the UI uses:
- `SOLID` — well-supported, high confidence
- `CHECK` — worth verifying, medium confidence
- `RISK` — needs attention, low confidence

Confidence scores are computed from:
- Whether the node has a `reason` from AI
- Number of critical/warning/info findings affecting the node
- Protocol specificity (generic labels lower confidence)

### Architecture Score

`buildArchitectureScore()` computes a 0–100 score with letter grade:
- **A (90+):** Production-ready
- **B (75–89):** Good, minor improvements
- **C (55–74):** Functional, needs work
- **D (35–54):** Significant gaps
- **F (<35):** Severe issues

Score factors:
- Deductions: critical (-15), warning (-8), info (-2) per finding
- Bonuses: auth (+2), cache (+3), queue (+3), storage (+2), observability (+3)
- Layer coverage: 9 categories tracked

### Relaxed Mode (Post-AI Generation)
When `mode: 'relaxed'`, the review engine returns `[]` immediately — no checks run. This ensures AI-generated diagrams always show clean in the review panel. Connection rules only apply when users manually edit.

---

## 7. Data Flow

### Diagram Generation
```
User types "Instagram" in PromptBar
       │
       ▼
Frontend calls api.streamDiagram({ description: "Instagram" })
       │
       ▼
Backend receives POST /api/ai/generate-diagram
       │
       ├── Check L1 Cache (Local Map) ──── Hit? → Return cached
       ├── Check L2 Cache (Redis) ──────── Hit? → Return + backfill L1
       ├── Check L3 Cache (PostgreSQL) ─── Hit? → Return + backfill L1+L2
       │
       ▼ Miss — Call OpenRouter AI
       │
       ├── Stream response via SSE (event: chunk)
       ├── Parse JSON
       ├── Run normalizeDiagramStructure
       ├── Run enforceArchitectureRules
       ├── Run connectIsolatedNodes
       ├── Dedup edges
       ├── Generate positioned nodes + edges
       └── Send result via SSE (event: result)
       │
       ▼
Frontend receives result
       ├── Sets nodes/edges on React Flow canvas
       ├── Saves to backend (auto-save)
       └── Opens review panel with clean state
```

### Manual Editing
```
User drags REDIS from inventory to canvas
       │
       ▼
Frontend adds node via setNodes (functional updater)
       │
       ▼
Autosave timer starts (4.5s for <24 nodes, 9s for ≥24)
       │
       ▼
User connects DJANGO → REDIS
       │
       ▼
Review engine runs buildArchitectureReview() in relaxed mode → []
Rules engine does not fire for AI output
       │
       ▼
Autosave timer fires → saveDiagram()
       │
       ├── Checks snapshot hash (skip if unchanged)
       ├── PUT /api/diagrams/:id { nodes, edges }
       └── Updates save status: "Saved to cloud"
```

---

## 8. Key Design Decisions

### Why No TypeScript?
The codebase is entirely JavaScript. This was a deliberate choice for iteration speed during early development. For a v2, TypeScript would be the first addition — the codebase is large enough to benefit from type safety, especially the diagram intelligence engine and the AI generation pipeline.

### Why No State Management Library?
React's built-in hooks (`useState`, `useRef`, `useCallback`, `useEffect`) handle the complexity well. The diagram editor doesn't have deeply nested state that would benefit from Redux or Zustand. The main page component is large (~2550 lines) and could be refactored into smaller modules, but it's functionally correct.

### Why No Testing (Unit)?
The project has Playwright smoke tests and an eval harness but no unit tests. The eval harness tests AI output quality — which is more valuable than unit tests for this product. Unit tests would catch refactoring regressions and should be added before major refactors.

### Why SSE instead of WebSockets?
The AI generation is one-directional: server → client. SSE is simpler, works over standard HTTP, has built-in browser support for reconnection, and doesn't require a WebSocket handshake. WebSockets would be overkill for this use case.

### Why No Docker?
The app has no local infrastructure dependencies. PostgreSQL is Neon (serverless), Redis is Upstash (serverless), AI is OpenRouter (cloud API). Docker would add complexity with zero benefit at the current scale.

### Air temperature 0.2 for Generation?
Low temperature produces deterministic output. Same prompt → same diagram. At 0.7 (the previous value), the same prompt could produce different tech selections across runs. For structured JSON output, determinism is more important than creativity.

### Why `response_format: json_object`?
Tells the API to structurally guarantee JSON output at the model level. Eliminates markdown fences, prose preambles, and most parse failures. Combined with temperature 0.2, makes generation highly reliable.

### Why No Client Disconnect Handling (was missing)?
The original SSE stream had no `req.on('close')` handler. If a user closed their tab, the AI generation continued running to completion, wasting API credits. Fixed by adding an AbortController that triggers on client disconnect.

---

## 9. Reliability & Security

### What We Fixed (23 Issues)

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 1 | Autosave race condition overwrites newer data | **Data loss** | Queue flush reads from refs, not stale closure |
| 2 | SSE ignores client disconnect | **Credit waste** | AbortController + req.on('close') |
| 3 | localStorage throws in Safari private browsing | **App crash** | All storage wrapped in try/catch |
| 4 | No request body size limit | **DoS vulnerability** | express.json({ limit: '1mb' }) |
| 5 | Weak invite code (Math.random) | **Security** | crypto.randomBytes(6).toString('hex') |
| 6 | JSON.parse on drag-and-drop crashes page | **App crash** | try/catch with toast on failure |
| 7 | No Delete/Backspace keyboard shortcut | **UX gap** | keydown listener for selected nodes |
| 8 | No fetch timeout — infinite loading | **UX hang** | 30s timeout on all API calls |
| 9 | Version date parsing crashes | **App crash** | Validate Date before toISOString() |
| 10 | Stale collaborator state | **Data loss** | Functional updater pattern |
| 11 | No security headers | **Security** | helmet middleware added |
| 12 | DB pool no connection limit | **Infra stability** | max:5, idleTimeout:30s, connectionTimeout:10s |
| 13 | Clipboard fails silently | **UX** | try/catch with error toast |
| 14 | Save status always green | **Misleading UX** | Tracks saving/saved/error states |
| 15 | Node role "Manual entry" | **Lazy UX** | Uses tech.description from inventory |
| 16 | Empty canvas jargon | **Bad first impression** | Human-readable message |
| 17 | Rate limiter silent disable | **Infra stability** | Memory store fallback |
| 18 | Log leaks AI response text | **Security** | Truncated to 500 chars |
| 19 | Failure payload contains full prompts | **Data privacy** | Truncated to 500/2000 chars |
| 20 | Diagram delete orphans rows | **Data hygiene** | CASCADE cleanup |
| 21 | Version timestamps wrong for non-UTC | **UX bug** | AT TIME ZONE 'UTC' in SQL |
| 22 | History panel empty flash | **UX** | Loading state + better empty message |
| 23 | Invite modal "GENERATING..." | **Misleading UX** | Shows generate/copy flow |

### Security Measures
- **Helmet** — CSP, X-Content-Type-Options, X-Frame-Options, HSTS, X-XSS-Protection
- **Rate limiting** — 10 requests/min per IP on AI endpoints
- **Auth** — Clerk JWT verification on protected routes
- **Invite codes** — cryptographically random (crypto.randomBytes, not Math.random)
- **Body limits** — 1mb max on all requests
- **Log sanitization** — AI responses truncated, user prompts truncated
- **CORS** — configured for frontend origin only

---

## 10. How to Talk About This in Interviews

### Question: "Tell me about a project you built"

**Structure:**
1. **Problem:** AI tools generate generic system designs with made-up tech names and broken connections. You can't trust the output.
2. **Solution:** Build a generation pipeline with 7 layers of defense — normalize, categorize, auto-fix architecture rules, connect orphans, deduplicate, validate, retry on failure.
3. **Technical depth:** The system prompt includes 14 known company architectures and 9 domain patterns. The auto-fix layer detects frontend→database connections and inserts a backend. The review engine has 81 connection rules and 20+ deterministic checks.
4. **Impact:** Every AI-generated diagram is fully connected with real protocols and zero warnings. The review panel shows clean output every time.

### Question: "How did you handle AI reliability?"

**Answer:**
> "LLMs are unreliable by nature. Instead of fighting that, I built a pipeline that treats AI output as untrusted input:
>
> 1. **Temperature 0.2 + JSON mode** at the API level — forces structured output
> 2. **FIXTURE_MAP** — 100+ tech names hardcoded with correct categories, overrides AI miscategorization
> 3. **Architecture rules** — post-generation fixup that catches frontend→database, missing auth, orphaned Kafka, unconnected nodes
> 4. **JSON repair** — if parsing fails, sends the raw response back with the specific parse error for a corrected attempt
> 5. **3-tier caching** — never regenerates the same prompt. Local → Redis → PostgreSQL
> 6. **Eval harness** — internal framework that scores output quality, measures stability across runs, and catches regressions"

### Question: "Why did you choose these technologies?"

**Answer:**
> "Next.js 15 for the frontend because I wanted SSR for the landing page and the App Router for clean route organization. Express on the backend because it's simple — I don't need a framework fighting me for a single-server architecture.
>
> React Flow was the only real choice for the diagram canvas — it's the most mature React diagram library with custom node/edge support.
>
> Neon and Upstash because they're serverless — I don't want to manage database infrastructure. OpenRouter as the AI gateway because it provides access to multiple models with a single API and handles fallback routing.
>
> No Docker, no Kubernetes, no message queue — because at this stage, complexity is the enemy of shipping."

### Question: "What would you do differently?"

**Answer:**
> "Three things:
>
> 1. **Add TypeScript** — the codebase is large enough that type safety would prevent real bugs, especially in the diagram intelligence engine (866 lines of plain JS).
> 2. **Add unit tests for the review engine** — the deterministic checks are critical for correctness and should have regression tests.
> 3. **Modularize the main editor page** — it's ~2550 lines in one file. It works, but it's harder to maintain than it should be."

---

## Quick Reference

### Common Commands
```bash
cd backend && npm run dev       # Start backend on port 4000
cd frontend && npm run dev       # Start frontend on port 3000
cd backend && npm run db:migrate # Run database migrations
cd backend && npm run eval:harness -- --max-prompts 12 --runs 2  # Run AI eval
cd frontend && npm run smoke:editor  # Run Playwright smoke tests
```

### Environment Variables
```env
# Backend
NEON_DB_URL=postgresql://...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_KEY=...
OPENROUTER_API_KEY=sk-or-v1-...
REDIS_URL=redis://...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Frontend
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Key Files Reference
| File | Lines | What It Does |
|------|-------|-------------|
| `backend/src/lib/diagramGenerator.js` | 668 | AI generation pipeline + auto-fix layer |
| `backend/src/lib/openRouter.js` | 276 | AI client, streaming, JSON parsing + repair |
| `backend/src/lib/connectionRules.js` | 113 | 81-rule category matrix |
| `backend/src/lib/tech.js` | 256 | 110+ tech catalog + categorization |
| `backend/src/routes/ai.js` | 574 | All AI endpoints |
| `frontend/lib/diagramIntelligence.js` | 866 | Deterministic review engine + trust profiles |
| `frontend/components/diagram/ReviewPanel.js` | 599 | Architecture review UI |
| `frontend/app/diagram/[id]/page.js` | ~2550 | Main diagram editor |
