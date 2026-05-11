# Improvement Plan

## High Impact — Should Do

### Split page.js (2550 lines → modules)
The main diagram editor file is massive. It combines state, effects, handlers, render, and inline helpers. Extract into:
- `hooks/` — diagram state, AI assistant, review, history, save/load
- `handlers/` — node click, edge click, connect, delete, replace, drag-drop
- The main file stays as the render shell importing these

### Test the Rules Engine
`diagramIntelligence.js` (675 lines) has the core business logic — connection validation, finding generation, suggestion sanitization — with zero tests. This is the most important untested code:
- `buildArchitectureReview()` — validate findings for known edge cases
- `enrichSuggestionConnections()` — confirm invalid connections are dropped
- Connection mode behavior (strict vs guided vs sandbox)

### Add API Integration Tests
Backend routes (diagrams CRUD, AI generation, review) have no tests. At minimum:
- Diagram create/read/update/delete
- AI generation endpoint returns valid structure
- Review endpoint produces correct findings
- Auth middleware blocks unauthenticated requests

### Response Streaming for AI Assistant
The architecture assistant blocks until the full response is ready. Streaming would make it feel responsive instead of hanging on "Thinking..." for 5-15 seconds.

### Undo / Redo
No undo/redo currently. Users can accidentally delete nodes or accept review suggestions with no way to revert beyond version history restore (which is heavy). An in-memory undo stack for canvas operations would be the quickest win.

### Keyboard Shortcuts
No keyboard shortcuts. Basic ones:
- `Delete`/`Backspace` — delete selection (already partially works via React Flow)
- `Cmd+Z` / `Cmd+Shift+Z` — undo/redo
- `Cmd+S` — save
- `Cmd+K` — toggle AI assistant
- `Escape` — close panel / deselect

### Error Boundaries
No React error boundaries. A crash in the diagram canvas or a panel blows up the entire page. Wrap canvas, panels, and sidebar in individual error boundaries.

---

## Medium Impact — Should Consider

### Real-Time Collaboration
Currently "collaboration" is invite + shared diagram access, but there's no real-time sync. Two people editing the same diagram will overwrite each other. WebSocket sync via the backend would make this actually collaborative.

### Dark Mode
The DB schema has a `theme` setting (`light`/`dark`/`system`) but the frontend doesn't implement it. The UI is all hardcoded light colors.

### Onboarding Flow
No guided tour or empty-state tutorial. First-time users see a blank canvas with no direction. A quick walkthrough on first visit would reduce drop-off.

### TypeScript Migration
The entire codebase is `.js` files. No TypeScript anywhere outside config files. This works but loses the safety net that would prevent entire categories of bugs.

### Prompt Versioning
AI generation prompts are hardcoded in the backend. No versioning, no A/B testing, no way to roll back a prompt change that made diagrams worse. The eval harness helps detect regressions but doesn't prevent deploying bad prompts.

### Keyboard-Accessible Panels
Panels and modals don't trap focus, can't be closed with Escape consistently, and don't announce state changes to screen readers. Not critical for current users but matters for accessibility.

### API Documentation
No OpenAPI/Swagger docs. The backend has 5 route files with no documented contract. Frontend calls are spread across `api.js` and inline fetch calls.

---

## Nice to Have — Low Priority

### Template Gallery
Only "blank" template exists. A small gallery of reference architectures (microservices, monolith, event-driven, etc.) would give new users a starting point.

### Image Export Options
PNG export works at 2x but no SVG or PDF export. SVG would be ideal for documentation.

### Search Across Diagrams
Dashboard lists diagrams but no search or filtering. Fine for now, becomes annoying at 20+ diagrams.

### Desktop Auto-Updater
The desktop app requires manual rebuild + reinstall. `electron-updater` would push updates automatically.

### Docker Compose
No Docker setup. Every new contributor needs to install Postgres, Redis, configure env vars manually. A `docker-compose.yml` with postgres + redis + the app would lower the barrier.

### Monitoring / Error Tracking
No Sentry, no logging aggregation. Backend logs to stdout, frontman errors hit `console.error`. When something breaks in production you have to reproduce it manually.

### Lazy Loading / Bundle Splitting
No code splitting on routes or panels. The entire editor bundle loads upfront. For a 390px assistant panel that many users never open, that's wasted bytes.

---

## Summary

| Area | Priority |
|---|---|
| Split page.js | High |
| Test diagramIntelligence.js | High |
| API integration tests | Medium |
| Response streaming | Medium |
| Undo/redo | Medium |
| Keyboard shortcuts | Medium |
| Error boundaries | Medium |
| Real-time collaboration | Low (complex) |
| Dark mode | Low |
| TypeScript | Low (long-term) |
