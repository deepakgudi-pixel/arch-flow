# Archflow Optimization Log

**log:** 2026-05-07

## Overview
Refactoring and hardening pass on the Archflow codebase. Focus areas: code structure, input validation, style consistency.

---

## 1. Monolith Diagram Page Split

**File:** `frontend/app/diagram/[id]/page.js`

**Before:** 1481-line single component containing all styled components, state, logic, and JSX for the entire diagram editor page.

**After:** 706-line orchestrator component that delegates to 7 specialized sub-components.

**Why:** A single file of that size is difficult to navigate, maintain, and reason about. Splitting into focused components with clear responsibilities makes the codebase more approachable and reduces cognitive load when making changes.

**What was extracted:**

| File | Purpose |
|------|---------|
| `components/diagram/editorStyles.js` | All shared styled-components definitions |
| `components/diagram/CustomNode.js` | React Flow custom node renderer |
| `components/diagram/EditorHeader.js` | Header bar with actions, export menu |
| `components/diagram/NodeDetailsSidebar.js` | Left sidebar showing selected node details |
| `components/diagram/TechInventoryPanel.js` | Right panel with tech inventory browser |
| `components/diagram/PromptBar.js` | Bottom bar with AI prompt input |
| `components/diagram/InviteModal.js` | Invite collaborators modal |

**Bug fixed:** The original code called `deleteFromInventory()` in the JSX but the function was never defined. Added the implementation that calls `api.deleteFromInventory()`.

---

## 2. Input Validation (Backend)

**File created:** `backend/src/middleware/validate.js`

**Why:** Request bodies were used as-is without any validation. This meant malformed or malicious input could reach the database, causing SQL/JSON issues, or unexpected errors. Adding server-side validation is a basic security and reliability practice.

**What was done:**
- Created a schema-based validation middleware that checks:
  - Required fields
  - Type correctness (string, number, array, object)
  - String length limits
  - Enum values
  - Numeric min/max bounds
- Applied to all 8 write endpoints across 4 route files

**Routes validated:**

| Route | Validated Fields |
|-------|-----------------|
| `POST /api/diagrams` | `name` (string, max 200), `template` (enum) |
| `PUT /api/diagrams/:id` | `name`, `nodes` (array), `edges` (array) |
| `POST /api/inventory` | `name` (required), `category` (required), `description`, `icon`, `products` |
| `POST /api/ai/generate-diagram` | `description` (required, max 2000), `template` |
| `POST /api/ai/generate-tech` | `description` (required, max 500) |
| `POST /api/ai/infer-connection` | `source` (object), `target` (object) |
| `PUT /api/settings` | `connection_mode` (enum), `default_template`, `autosave_interval` (number 5-300), `theme` (enum) |

---

## 3. Toast Consolidation

**Before:** Two Toast implementations existed:
1. `components/ui/Toast.js` — shared component using `$tone` prop (success/error/warning/info)
2. Inline styled Toast in `components/diagram/editorStyles.js` — using `$error`/`$warning` boolean props

**After:** Single Toast — `components/ui/Toast.js`. The editorStyles duplicate was removed and page.js now maps its toast state to the shared component's `$tone` prop.

**Why:** Duplicate components with different APIs for the same visual concept lead to inconsistency and maintenance burden. Consolidating ensures all toasts look and behave the same.

---

## 4. Inline Styles → Styled-Components

**Why:** The codebase uses styled-components for theming and consistent styling. Inline styles bypass this system, making it harder to maintain visual consistency, support theming, and debug styling issues.

**What was converted:**

| Component | Inline Styles Replaced |
|-----------|----------------------|
| `EditorHeader` | Action group containers, export dropdown menu, dividers, ID label |
| `NodeDetailsSidebar` | Detail header layout, node label, role label |
| `TechInventoryPanel` | Generate section wrapper, AI badge, delete button, empty state, full-width action buttons |
| `PromptBar` | Generate button (was using ActionButton with inline style overrides) |
| `InviteModal` | Body padding, invite code row/layout, hint text, collaborator rows, remove button |

**Remaining inline styles (intentional):** The CONNECT/LIVE_FLOW/SYNTH_ALL buttons in `EditorHeader` use dynamic `style` props to toggle background/color based on `connectMode`/`simulateFlow` state. These are state-driven visual variants that would require either a more complex styled-component API or additional transient props.
