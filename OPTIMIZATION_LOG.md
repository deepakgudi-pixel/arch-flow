# Archflow Optimization Log

**log:** 2026-05-12 14:00:00 IST (+0530)

## Overview
High-Fidelity Polish and AI Stability Pass. Focus areas: completing the premium flat aesthetic, hardening the OpenRouter API streaming integration, and protecting the token window with a new Context Budget Guard.

---

## 1. Excising Shadows for a Premium "Flat" Aesthetic
**Why:** The UI was straddling the line between a modern flat interface and legacy "webby" card styles with various box shadows. For a "Premium Technical" and cyberpunk-inspired aesthetic, the design language needs to be brutally flat, crisp, and shadowless, relying on contrast, borders, and typography instead of elevation.

**What changed:**
- scoured all frontend component files (`Card`, `Button`, `Modal`, `DiagramAssistantPanel`, `ReviewPanel`, etc.)
- globally set all instances of `box-shadow` and `drop-shadow` to `none`
- removed secondary, visually distracting buttons from the landing page hero

**How this helps Archflow:**
- achieves absolute visual consistency across the app
- creates an industrial, premium "workstation" feel rather than a typical SaaS dashboard

---

## 2. Hardening the Streaming Stability Engine
**Why:** When users requested massive distributed system topologies (e.g., "Netflix architecture"), the OpenRouter API took longer than 60 seconds to stream the massive JSON response. This caused the internal `AbortController` to forcefully kill the stream midway, resulting in a cryptic `[CRITICAL_FAILURE]: This operation was aborted` error on the frontend.

**What changed:**
- increased the primary `AbortController` timeout in `backend/src/lib/openRouter.js` from 60,000ms (1 minute) to 180,000ms (3 minutes)
- increased the fallback model timeout from 45,000ms to 120,000ms

**How this helps Archflow:**
- allows complex, high-node-count systems to generate successfully without timing out
- drastically improves user trust in the AI's generation capabilities

---

## 3. The Context Budget Guard
**Why:** With the ability to generate massive diagrams, users naturally wanted to chat with the AI Architectural Consultant about them. However, passing a massive 100+ node diagram into the chat context would blow up the token window, causing silent model failures or exorbitant costs.

**What changed:**
- added a Context Budget Guard in `backend/src/routes/ai.js` specifically for the `/review-diagram` endpoint
- the guard intercepts serialized diagram payloads and throws a clean 400 error if the context exceeds 28,000 characters
- the frontend now catches this specific 400 error and surfaces a human-readable toast `DIAGRAM_TOO_LARGE_FOR_REVIEW`

**How this helps Archflow:**
- protects against LLM token limits and system crashes
- provides immediate, actionable feedback to the user ("simplify the diagram") instead of hanging or returning a vague error
- clearly separates the *generation* capability (which is unaffected) from the *review* context limits

---

**log:** 2026-05-11 02:05:00 IST (+0530)

## Overview
Mac Desktop App Ergonomics and Platform-Specific UX Pass. Focus area: removing "web-only" visual artifacts from the native Mac experience, specifically the custom crosshair cursor, to ensure the desktop app feels like a first-class industrial workstation.

---

## 1. Custom Cursors Felt "Webby" on Desktop
**Why:** While a `crosshair` cursor can feel technical and "tool-like" in a browser-based diagramming tool, it feels non-standard and distracting in a native Mac application. For a premium desktop experience, the app should respect the system's default cursor behavior (the standard arrow) unless explicitly interacting with a tool.

**What changed:**
- introduced a more robust desktop detection engine that checks both for the `ArchflowDesktop` user agent and the presence of the `archflowDesktopStorage` preload bridge
- moved the global `*` selector cursor to a conditional state
- desktop app now defaults to `auto` (system-normal) cursor behavior
- web version preserves the `crosshair` aesthetic as requested, maintaining its distinct technical identity
- applied the same conditional logic to the diagram editor nodes

**How this helps Archflow:**
- improves the "native" feel of the Mac application
- reduces visual fatigue for desktop power users
- maintains platform-specific identities (technical/web vs. industrial/desktop)
- ensures that future UI components in the desktop app inherit standard OS behaviors by default

---

## 2. Robust Desktop Detection via Preload Bridge
**Why:** Relying solely on `userAgent` strings for platform detection can be fragile, especially if users are running older versions of the desktop shell or if the UA is stripped by middle-boxes.

**What changed:**
- updated detection logic to check for the `window.archflowDesktopStorage` object
- this object is explicitly injected by the Electron `preload.js` script, making it a "guaranteed" signal that the frontend is running inside the Archflow shell
- detection is now "normal-first," ensuring that if detection fails or is uncertain, the app falls back to standard (normal) behavior rather than forcing a custom one

**How this helps Archflow:**
- eliminates "false negatives" where the Mac app would show web-only UI elements (like "Download for Mac" buttons)
- makes the frontend more resilient to variation in the desktop shell version
- provides a cleaner path for future desktop-only feature toggles

---

## 3. Product-Level Reasoning
The broader conclusion from this pass:

- "Native" is a feeling, not just a packaging format
- respect for system defaults (like the cursor) is a key differentiator between a "site in a box" and a "desktop application"
- platform-specific ergonomics should be handled via reliable capability detection (like the preload bridge) rather than just string-matching

This pass makes the Archflow Mac app feel more invisible and effortless to use, allowing the user to focus on the architecture rather than the interface.

---

**log:** 2026-05-10 21:10:00 IST (+0530)

## Overview
Architecture Assistant Review Flow and Reliability Hardening Pass. Focus areas: making the new assistant feel calm instead of overwhelming, ensuring staged review work survives refreshes, preparing draft persistence for Electron, and grounding the assistant in stronger deterministic architecture checks.

---

## 1. The Assistant Needed Review Staging, Not Silent Canvas Mutation
**Why:** The assistant became much more useful once it could identify missing technologies, but that power created a UX risk. If suggestions immediately hijack the UI or alter the diagram before the user understands the answer, the product feels chaotic instead of trustworthy.

**What changed:**
- introduced an AI architecture assistant panel for diagram-specific chat
- the assistant now stages missing technologies into `ARCHITECTURAL_REVIEW` instead of mutating the diagram directly
- review items can be accepted or declined one by one
- the assistant no longer auto-switches the user into the review panel after a response

**How this helps Archflow:**
- keeps the assistant conversational first
- preserves user control over architecture changes
- makes the review flow feel collaborative instead of pushy

---

## 2. Accept-and-Connect Needed to Feel Safe, Not Surprising
**Why:** Once staged suggestions could be accepted into the live diagram, the next risk was correctness and focus. A good flow should wire the technology into the diagram, but it should not explode into invalid edges, open extra detail panels, or otherwise overwhelm the user.

**What changed:**
- `Accept and connect` now adds approved technologies directly into the diagram with rule-aware connection sanitization
- invalid AI-suggested edges can be reversed or dropped before they are committed
- the accept flow no longer opens `UNIT_DETAILS`
- signed storage patterns are now treated more carefully so valid `SIGNED_URL` client flows can survive when a backend control plane exists

**How this helps Archflow:**
- reduces immediate `RULE_VIOLATION` noise after accepting a suggestion
- keeps the edit flow calmer and easier to follow
- makes assistant-driven diagram updates feel more trustworthy

---

## 3. Pending Review Work Needed to Survive Refreshes
**Why:** Losing staged assistant output or pending review suggestions after a browser refresh would feel like the product dropped the user's work on the floor. For this feature, that kind of loss would burn trust faster than almost any cosmetic bug.

**What changed:**
- assistant chat history and pending review suggestions are now persisted per `user + diagram`
- refresh restores in-progress review drafts instead of resetting them
- draft persistence was moved behind a storage abstraction instead of hard-coding direct browser `localStorage` calls

**How this helps Archflow:**
- protects in-progress architecture review from accidental refreshes
- reduces fear around exploring multiple assistant suggestions
- gives the feature a much more durable feel without forcing draft data into the backend

---

## 4. Electron Compatibility Needed to Be Planned Early
**Why:** Browser `localStorage` is acceptable for the web version, but the product is expected to ship as an Electron Mac app. Waiting too long to separate storage concerns would make that transition messier than it needs to be.

**What changed:**
- introduced a review-draft storage abstraction in the frontend
- web continues to use browser-backed storage
- the Electron shell now exposes a preload bridge and app-owned local JSON storage for the same draft data

**How this helps Archflow:**
- keeps the web and desktop flows aligned
- avoids turning draft persistence into backend-only complexity
- prepares Archflow for a desktop packaging path without changing the user-facing behavior

---

## 5. Reliability Needed Stronger Local Signals, Not Just Better Prompts
**Why:** If Archflow is going to position the architecture assistant as dependable, it cannot rely on the language model alone. The product needs deterministic checks that stay grounded even when the model is uncertain or overconfident.

**What changed:**
- strengthened the local review engine with deeper architecture checks
- added better handling for signed storage access patterns and missing signing control planes
- added queue topology checks for missing producers or consumers
- added complexity-aware warnings for missing observability, async-scaling gaps, and central backend choke points
- passed structured review summaries and findings into the assistant prompt as authoritative context

**How this helps Archflow:**
- gives the assistant a more reliable floor for complex diagrams
- reduces the chance of confidently wrong review language
- keeps the product aligned with its trust-first positioning

---

## 6. Product-Level Reasoning
The broader conclusion from this pass:

- a good architecture assistant is not just "chat on top of a diagram"
- review staging, persistence, and deterministic checks are part of the feature, not optional polish
- reliability comes from layered product behavior, not from asking the model to sound smarter

This pass made the assistant feel more real because it now behaves like a careful copilot:

- it answers
- it stages
- it waits for approval
- it connects safely
- and it remembers unfinished work

That is the kind of behavior users can build trust around.

---

**log:** 2026-05-09 15:59:46 IST (+0530)

## Overview
Migration Discipline and Frontend Dev Stability Pass. Focus areas: replacing fragile schema backfill habits with real migrations, and permanently removing the recurring Next dev-loop instability by moving the frontend onto a supported framework stack.

---

## 1. Partial Backfill Logic Was Helpful, But Not Enough
**Why:** Earlier, some database safety came from patch-style startup fixes. That meant if a column like `raw_response` or `prompt_text` was missing, the app could sometimes add it on boot and keep going.

That approach helps in emergencies, but it is not a strong long-term schema strategy because:

- it reacts to missing pieces instead of tracking schema history
- it is easy for environments to drift apart
- it becomes harder to know which database is on which schema shape
- every new structural change risks becoming another custom patch

**What changed:**
- added real numbered SQL migrations
- added a `schema_migrations` tracking table
- added required-column compatibility checks at startup
- added a dedicated migration runner instead of relying on one-off schema rescue logic

**How this helps Archflow:**
- makes schema evolution explicit
- keeps different environments more consistent
- reduces the chance of “works locally, breaks in another DB” problems
- gives the backend a cleaner long-term foundation

---

## 2. Proper Migrations Became the Permanent Fix
**Why:** A product that stores diagrams, versions, AI outputs, and settings needs a repeatable DB history, not just a current schema snapshot.

**What changed:**
- introduced `backend/src/db/migrate.js`
- introduced numbered files in `backend/src/db/migrations/`
- added `npm run db:migrate`
- wired startup to use migration execution plus schema verification

**How this helps Archflow:**
- new environments can be brought to the right schema predictably
- old environments can catch up safely
- database changes now have a visible history instead of being hidden in startup logic

---

## 3. The Old Frontend Dev Stack Was the Real Source of the Crash Loop
**Why:** The recurring `.next/server/middleware/middleware-manifest.json` errors were not caused by the diagram features themselves. They were coming from an unstable old dev-tooling combination.

What made this important:

- the issue showed up repeatedly after edits
- it interrupted normal frontend work
- it created fake fear around unrelated UI changes

This was the wrong kind of instability because it attacked developer confidence, not just runtime behavior.

**What changed:**
- moved the frontend off the older Next 14 line
- settled on a supported stack:
  - `next@15.5.18`
  - `@clerk/nextjs@6.31.9`
  - `react@19.2.0`
  - `react-dom@19.2.0`
- kept the default dev workflow on `next dev`
- kept a `dev:webpack` escape hatch

**How this helps Archflow:**
- removes the old manifest crash loop from normal editing
- gives the project a much saner local development experience
- makes frontend iteration feel reliable again

---

## 4. Dependency Upgrades Needed a Matching Auth Update
**Why:** Moving the frontend stack forward exposed an auth middleware API change. That was expected and much healthier than the previous hidden bundler failure, because this kind of break is clear and fixable.

**What changed:**
- updated Clerk middleware usage from the old shape to the v6-compatible shape
- kept the auth smoke verification flow in place and re-ran it on the new stack
- confirmed protected-route checks still passed after real hot reloads

**How this helps Archflow:**
- keeps auth aligned with the supported framework stack
- makes the dev stability fix real, not just theoretical
- preserves confidence that the new local setup still protects routes correctly

---

## 5. Product-Level Reasoning
The deeper conclusion from this pass:

- product stability is not just runtime correctness
- maintainer experience matters because broken local loops slow down every future improvement
- schema discipline and framework discipline are both part of product quality

This pass did not make the app visibly flashier for users.
It made the app safer to maintain and safer to keep growing.

That matters because Archflow is no longer just a prototype. Once a product starts becoming real, the boring infrastructure decisions become part of the moat too.

---

**log:** 2026-05-09 13:42:14 IST (+0530)

## Overview
Auth Smoke Verification Hardening Pass. Focus areas: removing manual auth-check friction, making protected-route verification reproducible in local development, and keeping the bypass safe enough that it improves confidence without weakening the actual auth model.

---

## 1. Manual Auth Smoke Checks Were Too Fragile
**Why:** The previous smoke script could verify `/sign-in` and `/sign-up`, but the protected-route side still depended on either:

- guessing a route that happened to be protected
- or manually copying a live Clerk session cookie

That made the verification story weak. The product could still be working, but the maintainer check was not dependable enough to trust as part of a normal workflow.

**What changed:**
- the auth smoke flow no longer depends on a manually copied browser cookie by default
- the verification target is now a deliberate built-in protected page instead of a guessed route

**How this helps Archflow:**
- makes auth verification repeatable
- removes unnecessary maintainer friction
- turns auth checking into a real workflow instead of an ad hoc spot check

---

## 2. A Dedicated Protected Probe Was the Cleanest Fix
**Why:** To verify protected-route behavior reliably, the app needed one path whose purpose was explicitly "help us test auth behavior locally."

**What changed:**
- added `frontend/app/auth-smoke-probe/page.js`
- the page is intentionally simple and returns a clear `ARCHFLOW_AUTH_SMOKE_OK` marker
- it exists only as a development verification surface, not as a user-facing product feature

**How this helps Archflow:**
- gives the smoke script a stable protected target
- avoids coupling verification to dashboard content or a specific diagram ID
- reduces false failures caused by route assumptions

---

## 3. The Bypass Needed to Be Extremely Narrow
**Why:** A local verification shortcut is useful only if it does not accidentally become a broad auth escape hatch.

**What changed:**
- updated `frontend/middleware.js`
- the bypass only works when all of the following are true:
  - the app is not running in production
  - the route is exactly `/auth-smoke-probe`
  - the hostname is local
  - the request includes the expected smoke header token

**How this helps Archflow:**
- preserves confidence in the real auth model
- gives maintainers a controlled way to verify protected rendering
- keeps the "test helper" separate from normal user traffic

---

## 4. The Script Now Matches Real Clerk Behavior
**Why:** During verification, Clerk did not always respond to logged-out protected access with a sign-in redirect. For this probe flow, the real blocked response showed up as `404`.

That matters because a smoke test should reflect actual protection behavior, not an assumed response shape.

**What changed:**
- updated `frontend/scripts/auth-smoke.mjs`
- the script now treats a logged-out `404` on the protected probe as a valid blocked-access result
- it then rechecks the same route with the local smoke header and expects a successful render

**How this helps Archflow:**
- makes the smoke test truthful instead of overly rigid
- avoids false negatives when Clerk blocks access in a different but still valid way
- improves trust in the verification output

---

## 5. Product-Level Reasoning
The deeper product conclusion from this pass:

- auth verification should feel boring and dependable
- maintainers should not have to manually harvest browser state just to prove protected routes still work
- local verification helpers are fine when they are narrowly scoped, explicit, and impossible to confuse with the real user path

This change does not make the user-facing product flashier. It makes the product safer to evolve.

That is important because Archflow now depends on:

- Clerk middleware behavior
- protected dashboard and diagram routes
- a more polished, trust-oriented frontend

When auth breaks, everything can look broken. So a cheap, repeatable, local verification loop is worth having.

---

**log:** 2026-05-09 11:11:21 IST (+0530)

## Overview
Connection Clarity, Review Language, and Flow Inspection Pass. Focus areas: reducing protocol confusion, making connection meaning obvious, avoiding overlapping label overload, and making review surfaces feel explanatory instead of empty or score-like.

---

## 1. Protocols Needed Better Access, Not Just Better Placement
**Why:** The original protocol labels created the wrong user experience in two ways:

- the label text was ambiguous on its own
- the interaction model made users hunt for meaning

For example, a label like `UPDATE_RIDER_LOCATION` or `PUBLISH_INVENTORY` is not useful if the user cannot immediately tell:

- where the flow starts
- where it ends
- whether it belongs to the unit they are currently inspecting

Hover-based reveal made this worse because it rewarded pixel-perfect discovery instead of clear reading. Even when the labels were technically present, the product still felt confusing.

**What changed:**
- flow chips now carry route context in the form `SOURCE → TARGET`
- connection understanding now uses a focused interaction model instead of hover discovery
- selecting a node reveals that node's related flows
- selecting a specific flow opens `CONNECTION_DETAILS`

**How this helps Archflow:**
- connection meaning is easier to understand without guessing
- users can inspect Kafka-style hubs without decoding a dense mesh manually
- flow context now behaves like product information instead of visual noise

---

## 2. Focus Model Instead of Label Spam
**Why:** Trying to keep every visible label readable on the canvas is the wrong default for complex diagrams. Even with improved chips and better positioning, too many simultaneous labels still push the interface toward clutter.

The right product decision was not "pack more labels smarter." It was:

- show less by default
- show more when the user focuses
- always preserve a readable backup surface outside the canvas

**What changed:**
- `FLOW_CONTEXT` became the default protocol visibility mode
- in context mode, related edges are highlighted and unrelated edges are dimmed
- only the selected connection gets a full on-canvas flow chip
- the selected unit sidebar now includes a `Connected Flows` list with:
  - route text
  - flow label
  - incoming/outgoing direction
  - review signal
- those flow items are clickable and promote a flow into the dedicated connection details state
- `FLOW_ALL` still exists for people who want every label visible at once
- `FLOW_HIDE` still exists for a cleaner canvas

**How this helps Archflow:**
- reduces overlap at the root instead of endlessly reacting to it
- gives users a predictable inspection pattern
- makes the canvas calmer while keeping the relationship data accessible

---

## 3. Collision-Aware Label Placement as a Secondary Safety Net
**Why:** Even with a focus-first model, a "show all" mode still needs graceful handling for dense diagrams.

**What changed:**
- added `frontend/lib/edgeLabelLayout.js`
- label positions now estimate chip dimensions before render
- visible flow chips try nearby slots when they would otherwise overlap
- selected labels are prioritized during placement

**How this helps Archflow:**
- `FLOW_ALL` is more usable for broad inspection
- overlapping labels are reduced without breaking edge ownership
- the canvas degrades more gracefully in dense diagrams

---

## 4. Visual Emphasis for Selected Connections
**Why:** Once users select a flow, the product should make that connection unmistakable. Without a strong visual target, users still need to scan too much.

**What changed:**
- selected flows now get a subtle breathing pulse on the edge path
- the selected flow chip also pulses gently
- related edges in context mode receive softer highlight treatment

**How this helps Archflow:**
- makes the selected connection feel active and obvious
- reduces search time when moving between sidebar and canvas
- improves the "follow this exact path" experience without resorting to loud effects

---

## 5. Review Language Needed to Feel Human
**Why:** Labels like `HIGH`, `MEDIUM`, and `LOW` felt abstract and score-like. That is exactly the kind of language that can make the product feel judgey or opaque.

**What changed:**
- `HIGH` became `SOLID`
- `MEDIUM` became `CHECK`
- `LOW` became `RISK`
- these labels now appear in both unit and connection details
- `VIEW_REVIEW` was renamed to `ARCH_REVIEW`

**How this helps Archflow:**
- makes review signals feel like guidance instead of grading
- aligns better with the product principle of learning over scoring
- reduces confusion about whether the app is assigning a hidden quality score

---

## 6. Architecture Review Drawer Needed an "All Clear" State
**Why:** A review drawer that opens to almost nothing feels broken, even if the real meaning is "no current issues found." That is a UX failure because the product is technically correct but emotionally unclear.

**What changed:**
- when there are no review findings, `ARCH_REVIEW` now shows:
  - a clear all-clear/pass state
  - number of units reviewed
  - number of flows checked
  - a short explanation of what the review logic covers
- the footer text now adapts based on whether findings exist

**How this helps Archflow:**
- the review panel always feels informative
- users understand that the system actually checked something
- the absence of warnings no longer looks like an empty or broken feature

---

## 7. Product Conclusion / Advice
The important product conclusion from this pass:

- protocol readability is mostly an interaction problem, not just a styling problem
- relationship meaning should be revealed through focus, not forced into constant simultaneous visibility
- review language should sound like guidance
- a good "no issues found" state is as important as a good error state

Archflow gets stronger when connection information is treated as first-class product knowledge:

- the canvas gives directional context
- the sidebar gives readable detail
- selection creates certainty
- review surfaces explain what the system checked

That is a more durable UX direction than trying to make every protocol visible all the time.

**log:** 2026-05-09 03:27:27 IST (+0530)

## Overview
Trust, Review, and Internal Evaluation Direction Pass. Focus areas: diagram readability, inspectability, surgical edits, architecture review language, and internal quality control without turning the product into a public scoring system.

---

## 1. Product Direction: Internal Evaluator, Not Public Score
**Why:** A user-facing architecture score would push Archflow toward rigid grading behavior. That works against the actual value of this product, which is helping people understand systems, inspect tradeoffs, and improve their diagrams over time.

**Decision:**
- Keep evaluation harnesses internal for model QA, regression detection, and consistency checks.
- Keep user-facing review surfaces descriptive, not judgmental.
- Prefer findings, assumptions, and risks over a single magic number.

**How this helps Archflow:**
- Preserves the learning-oriented feel of the product.
- Avoids score obsession and "why did I get 72?" behavior.
- Makes the app feel more credible because the UI explains instead of judging.

---

## 2. Internal Evaluator Harness
**Why:** Improving AI quality by vibes is not sustainable. The app needed a repeatable way to check whether outputs are getting better or worse without manually reviewing everything.

**What was added:**
- `backend/src/lib/openRouter.js`
  - shared OpenRouter call and JSON parsing utilities
- `backend/src/lib/diagramGenerator.js`
  - reusable diagram generation core shared by the product and the evaluator
- `backend/src/lib/evalHarness.js`
  - prompt-matrix generation
  - history prompt mining
  - deterministic checks
  - run-to-run stability logic
- `backend/src/scripts/eval-harness.js`
  - CLI runner for prompt generation and evaluation
- `backend/evals/matrix.json`
  - small prompt-building matrix instead of hand-writing 25-50 prompts
- `backend/evals/latest-report.md`
  - compact human-readable scoreboard output

**How this helps Archflow:**
- Gives us a practical quality loop for AI changes.
- Makes regressions visible earlier.
- Turns prompt evaluation into a process instead of a guess.

---

## 3. User-Facing Review Without Scoring
**Why:** Users still need help understanding the architecture, but that help should feel like guidance, not a game.

**What was added:**
- Review panel for architecture findings instead of a numeric grade.
- Node trust surface with:
  - why this was chosen
  - assumptions
  - review risks
- Deduped risk aggregation so repeated edge notes do not spam the same warning multiple times.

**How this helps Archflow:**
- Keeps the canvas clean while still surfacing useful critique.
- Improves trust because findings are inspectable.
- Makes review feel educational rather than punitive.

---

## 4. Surgical Editing Instead of Full Regeneration
**Why:** The best editing experience is not "generate again." Users need to change one part of the architecture without losing the rest of the diagram.

**What was added:**
- Same-category node replacement from the node sidebar.
- Replacement updates only the selected node and its adjacent edge labels.
- The rest of the graph remains intact.

**How this helps Archflow:**
- Makes the product feel controllable instead of random.
- Supports learning by modification.
- Reduces frustration when refining a mostly-good diagram.

---

## 5. Diagram Readability and Presentation
**Why:** If the AI output looks messy, users will distrust it even when the technical shape is acceptable. Architecture credibility is partly visual.

**What changed:**
- Auto-arrange now groups nodes into better-spaced category lanes.
- Dense categories use more balanced packing for 15-20+ nodes.
- Node cards use more predictable sizing and better wrapping.
- Reorder action icon and editor controls were polished.
- System menu alignment, centering, and transitions were refined.

**How this helps Archflow:**
- Makes first impressions stronger.
- Reduces manual cleanup work after generation.
- Improves perceived quality of the architecture itself.

---

## 6. Architecture Review Logic and Rules
**Why:** If review findings are going to help users, the rules underneath them need to be more consistent than the old mixed state.

**What changed:**
- Canonical connection rules added in `backend/src/lib/connectionRules.js`
- Backend settings validation aligned with actual UI modes: `strict`, `guided`, `sandbox`
- Review logic now flags issues like:
  - direct client-to-database paths
  - missing application layer
  - missing auth
  - generic protocol labels
  - isolated nodes
  - weak async scaling paths
  - missing observability on larger systems
- History panel now shows diff-aware context for snapshots.

**How this helps Archflow:**
- Makes the review system more defensible.
- Gives users actionable feedback without pretending to know everything.
- Improves consistency between settings, validation, and review language.

---

## 7. Conclusion / Advice
The important product conclusion from this pass:

- internal scoring is valuable
- user-facing scoring is not necessary
- user-facing review is valuable

Archflow becomes stronger when it behaves like a trustworthy architecture copilot:

- AI generates and edits
- rules keep outputs sane
- UI explains the system
- internal evaluation helps us improve quality quietly in the background

That is the direction worth compounding.

**log:** 2026-05-08

## Overview
Infrastructure Hardening & Production Scaling Pass. Focus areas: persistent caching, architectural versioning, and industrial observability.

---

## 1. Triple-Tier Caching System
**Why:** Transitioned from a volatile, instance-local cache to a globally shared persistent system to support horizontal scaling and server resilience.

**Architecture:**
- **L1 (Local Memory):** High-speed LRU cache for sub-microsecond retrieval of recent requests on the active instance.
- **L2 (Global Redis):** Shared cache layer using the native Redis protocol for local development and Upstash REST API for serverless production stability (Vercel).
- **L3 (PostgreSQL Persistence):** Long-term storage of prompt hashes and results in the database to ensure cache hits even after global infrastructure restarts.

---

## 2. Architectural Versioning & History
**Why:** System design is an iterative process. Users needed a way to navigate design history, recover from failed AI streams, and manually snapshot their progress.

**Implementation:**
- **`diagram_versions` table:** Stores nodes, edges, and the raw AI response for every generation and manual save.
- **History Panel:** A new frontend sidebar that allows "Time Travel" navigation through previous system states.
- **Partial Persistence:** The backend now captures and saves `raw_response` even if the stream is aborted or JSON parsing fails, preventing data loss.

---

## 3. Industrial Observability & Logging
**Why:** Production AI applications require high-fidelity tracking of latency, costs, and failure modes.

**Implementation:**
- **Structured JSON Logging:** Created `backend/src/lib/logger.js` to output machine-readable logs compatible with Datadog/ELK.
- **AI Performance Metrics:** Automatically logs model names, duration (ms), cache status (HIT/MISS), and success rates for every orchestration event.
- **Dynamic Routing:** Integrated `openrouter/auto` to leverage real-time model selection and fallback logic.

---

## 4. UI/UX Refinements (Precision Pass)
**Why:** The Neo-Brutalist design requires extreme typographic precision to maintain its "industrial" feel without looking broken.

**Changes:**
- **Dynamic Font Scaling:** Implemented `$isLong` logic for technology labels to prevent horizontal scrolling.
- **Orphan Prevention:** Tuned `overflow-wrap` and `word-break` rules to ensure technical terms like `DATADOG_MONITORING` wrap as cohesive units.
- **Synthesis Resilience:** Added a terminal-style error state with a dedicated `RETRY_SYNTHESIS` path.

---

**log:** 2026-05-07

## Overview
Refactoring and hardening pass on the Archflow codebase. Focus areas: code structure, input validation, style consistency.
