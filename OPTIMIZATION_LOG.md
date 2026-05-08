# Archflow Optimization Log

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
