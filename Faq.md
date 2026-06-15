# Archflow FAQ

This file is meant to help explain Archflow clearly in product discussions.

The best way to use it:

- answer directly
- stay honest about what is shipped vs what is planned
- emphasize why each product decision was made
- avoid pretending the product is "finished forever"

---

## Core Product Questions

### 1. What is Archflow in one sentence?
Archflow is an AI-assisted system architecture workspace that helps people turn product ideas into understandable software diagrams, inspect why parts were chosen, and iteratively improve the architecture without needing to be an expert system designer from day one.

### 2. What problem were you trying to solve?
I built Archflow because system design is hard to learn in a practical way. Most people either stare at a blank canvas, get overwhelmed by architecture choices, or receive AI output that looks clever but is hard to trust. I wanted a product that helps users generate a starting point, understand the logic behind it, and then refine it without losing control.

### 3. Why did you build this instead of using existing diagram tools?
Traditional diagram tools are good at drawing but weak at thinking. They help you place boxes and arrows, but they do not help you reason about what technologies make sense, how the pieces connect, or what to verify. Archflow tries to bridge that gap by combining generation, explanation, review, and editing in one architecture-focused workflow.

### 4. Who is the ideal user?
The ideal user is someone who needs to understand or communicate software architecture but does not want to start from scratch every time. That includes developers learning system design, startup founders mapping their first technical plan, small teams discussing architecture options, and engineers who want a faster way to sketch and iterate on system structure.

### 5. What makes this product different from "just another AI wrapper"?
The difference is that I treated trust as the main problem, not just generation. A lot of AI products stop at "call an API and show output." Archflow focuses on whether the result feels understandable, editable, and dependable. That is why the product includes structured diagrams, review surfaces, connection details, versioning, surgical replacement, and internal evaluation instead of just text generation.

### 6. What did you learn about users from building it?
The biggest thing I learned is that users judge architecture output emotionally before they judge it technically. If the diagram looks messy, unclear, or random, trust drops immediately. Readability, control, and explanation matter as much as the raw generation quality.

### 7. What was the hardest product decision you made?
The hardest decision was deciding how much scoring to expose. A score is useful because it gives users a fast health signal, but it can also make people chase a number instead of understanding architecture. I kept the score transparent and tied it to findings, lessons, and "how to fix" guidance so it supports learning instead of replacing judgment.

### 8. How do you prevent the score from becoming a gimmick?
The score is not the product. It is a summary of deterministic review signals. The real value is in the linked findings, clickable canvas focus, "Why this matters" explanations, "How to fix" guidance, and architecture narrative. The score tells users where to look; the review explains what to learn.

---

## AI and Reliability Questions

### 9. How does the AI generation flow work?
The user gives a product prompt, the backend sends a structured request to the model, the response is normalized into nodes and edges, and then deterministic hardening runs before the diagram reaches the canvas. Domain blueprints can tune generic outputs into more specific systems, such as food delivery, stock trading, and travel marketplaces. After generation, the system can auto-arrange the graph, repair connection labels, and surface review notes in the sidebars and review drawer.

### 10. How do you make the output feel trustworthy?
I do it in layers. First, the output is structured into explicit units and flows rather than dumped as raw text. Second, the generation pipeline normalizes, domain-tunes, and hardens the diagram before users see it. Third, the backend review gate only accepts generated diagrams that pass the deterministic quality target. Fourth, the UI explains why a unit was chosen and what assumptions or risks are attached to it. Fifth, users can click review findings to focus the exact node or edge involved instead of hunting through the canvas.

### 11. What do you do when the model returns bad or malformed output?
I hardened the pipeline so the app is not dependent on perfect model behavior. The parser can recover JSON from noisy outputs, wrapped arrays, and recoverable truncated wrappers; AI calls retry with repair instructions when they return invalid JSON; the diagram generator normalizes and validates nodes and edges; and failures are logged so they can feed back into the internal evaluator instead of just silently breaking the experience.

### 12. How do you evaluate whether the AI is getting better or worse?
I built an internal evaluation harness. It generates prompt sets from a small matrix, can mine real prompts from history, runs prompts repeatedly, scores results with deterministic checks, and writes JSON plus Markdown reports. That gives me a repeatable way to compare quality and stability over time.

### 13. Why did you build an internal eval harness?
Because improving AI by vibes is not sustainable. Once a product depends on generated structure, you need a way to detect regressions without manually reviewing everything. The harness gives me a quality loop so I can tell whether a prompt change, model change, or logic change made the system better or worse.

### 14. Why is internal evaluation better than a user-facing score?
They solve different problems. Internal evaluation is for me to measure consistency, regressions, and output quality. A user-facing score would try to reduce a complex architecture into one number, which is usually misleading. For this product, internal evaluation improves the engine, while user-facing review improves understanding.

### 15. How do you handle inconsistent generations across runs?
I try to contain inconsistency rather than pretend it does not exist. The app normalizes results into a stable shape, uses deterministic post-checks, applies domain blueprints when the prompt clearly matches a known product category, lets users refine specific parts instead of regenerating the whole thing, and uses the eval harness to measure repeatability across multiple runs.

### 16. What parts are deterministic vs AI-driven?
AI-driven parts include initial architecture generation, technology suggestions, and protocol/flow inference. Deterministic parts include parsing, schema validation, graph normalization, domain blueprint tuning, migrations, review checks, autosave/versioning behavior, layout logic, and the internal evaluation scoring rules.

---

## Technical Architecture Questions

### 17. What is your frontend stack and why did you choose it?
The frontend uses Next.js App Router, React 19, React Flow, styled-components, Framer Motion, and incremental TypeScript helpers. That stack gave me a strong combination of application structure, flexible diagram rendering, custom UI styling, interaction polish, and typed contracts without forcing a risky full migration.

### 18. What is your backend stack and why?
The backend uses Node.js, Express, PostgreSQL via Neon, Redis/Upstash, Clerk for auth, and OpenRouter for model access. The goal was to keep the backend simple and pragmatic while supporting persistence, auth, caching, and AI integration cleanly.

### 19. How do diagrams get stored and versioned?
There is a primary diagram record and a version history model. The live diagram keeps the current state, while explicit version entries capture snapshots over time. Diagram updates and manual history writes now run transactionally, so the app does not claim a save succeeded if the related history write failed.

### 20. How do you handle autosave and version history without spamming the database?
I separated background persistence from explicit versioning. Autosave keeps the main diagram up to date using snapshot comparison, debouncing, and queued saves, but it does not create a new version entry every time. Manual save flows can still record a deliberate snapshot in history.

### 21. How do you manage auth and protected routes?
Clerk handles identity, and middleware protects non-public routes. The app also has dedicated smoke routes for auth/editor checks so I can verify critical flows consistently in development. The editor smoke probe bypasses Clerk intentionally so local UI regression tests do not fail because of auth key drift. Backend tests also cover owner/collaborator boundaries around diagram updates, version access, and deletion behavior.

### 22. How do you prevent schema drift in the database?
I added real numbered migrations, a `schema_migrations` table, and startup compatibility checks for required columns. That moves the app away from fragile "hope the DB matches the code" behavior and toward a repeatable migration process.

### 23. How do you handle connection and protocol inference?
Connections are stored as explicit edges, and protocol or flow labels can be inferred by AI and then normalized. The app also repairs generic labels in the background so users do not need to manually trigger protocol cleanup every time they edit the graph.

### 24. How do you make surgical edits without regenerating the full graph?
Users can replace a selected node with same-category alternatives. That swap updates the chosen tech immediately and only recalculates nearby connection wording rather than regenerating the entire architecture. It keeps the rest of the diagram stable and makes refinement feel controlled.

### 24a. How do you test persistence, generation reliability, and version history?
I extracted the core route behaviors into testable handlers and added integration-style tests around diagram update, manual version creation, AI generation persistence, non-owner permission denial, version listing, transactional deletes, rollback behavior, JSON repair, provider error handling, and domain blueprint tuning. These tests mock the database boundary where appropriate but verify the SQL intent and payloads that matter for product behavior. The current backend suite has 43 passing tests.

### 24b. What makes the backend feel production-minded?
The backend now has transaction-safe diagram update/delete handlers, structured logging through a shared logger, environment validation, migration checks, rate limiting on AI endpoints, and CI audit gates for high-severity production dependency issues. It is not enterprise-complete, but it is much more than a demo API.

---

## UX and Design Questions

### 25. How did you improve readability for dense diagrams?
I attacked the problem from both layout and interaction. Auto-arrange spaces nodes into better category lanes, dense groups use smarter packing, flow labels are no longer forced to always be visible, and the main reading surfaces moved into sidebars so the canvas does not have to carry all the meaning at once.

### 26. Why did you move away from hover-heavy interactions?
Because hover discovery is fragile and confusing in dense graphs. Users should not have to pixel-hunt to understand architecture. I moved the product toward click and focus based inspection so the meaning is more deliberate and easier to follow.

### 27. How do users inspect flow and protocol details now?
The canvas provides focused context, but the deeper reading happens in the connection sidebar. When a user selects a node, they see all related flows in readable form. When they select a specific connection, they see source, target, flow label, trust signals, and review context.

### 28. Why did you choose sidebars for trust and review details?
Because the canvas should stay readable. Reasons, assumptions, risks, and connection details are important, but putting all of that directly on the diagram would destroy clarity. The sidebar keeps inspection rich without turning the diagram into a wall of labels.

### 29. What UX choices had the biggest impact on clarity?
The biggest ones were smarter auto-arrange, replacing ambiguous hover behavior with focused selection, simplifying visible tech names, making connection direction explicit, removing unnecessary buttons, keeping demos inside a calm accordion instead of an always-open list, making long review panels scroll, and shifting detailed explanation out of the canvas and into structured side panels.

### 30. What was a feature you removed because it hurt UX?
I removed manual protocol repair as a visible action and made it automatic. I also stepped back from putting too much emphasis on visibility toggles and score-like language. In general, I tried to remove controls that made users manage the product instead of letting the product help them.

### 31. How do you balance power and simplicity in the editor?
The pattern I use is: keep the default interaction simple, but let detail appear when the user focuses. A beginner should be able to generate, inspect, and edit without learning a control surface full of expert toggles. Power should emerge through selection, sidebars, history, review, and replace workflows.

### 31a. How do beginners learn the workflow?
The editor supports beginners without forcing a tutorial. The empty canvas offers realistic quick-start prompts for food delivery, trading, and travel marketplace systems, and Guided Mode is available when the user wants a three-step walkthrough. The Review Panel also teaches through "Why this matters," "How to fix," a System Walkthrough, and a "Why this architecture works" narrative.

### 31b. What changed in the latest UX pass?
The latest UX pass reduced first-use overwhelm. Guided Mode no longer opens automatically, the empty canvas now gives useful prompt starters, the synthesis modal uses calmer product language, and assistant labels are less mechanical. The goal is progressive disclosure: help is immediately available, but the editor stays quiet until the user asks for depth.

---

## Scale and Production Questions

### 32. What happens if Clerk, Next.js, or OpenRouter changes behavior?
I assume dependencies will drift over time, so I added guardrails instead of assuming permanence. That includes auth smoke verification, environment checks, numbered DB migrations, hardened AI parsing, retry logic for JSON responses, high-severity dependency audit gates, and internal eval reports so regressions become visible earlier.

### 33. What are the current failure points in production?
The main remaining risks are long-tail AI weirdness, larger real-world diagram stress cases, and the fact that some production concerns like monitoring and billing systems are still not fully built out. Dependency risk is better guarded now through package upgrades and CI audit checks, but long-term maintenance still matters.

### 34. How do you control AI cost?
Right now the main controls are structured prompts, deterministic post-processing, fallback model behavior, and the fact that not every user action triggers a full regeneration. I would still consider usage quotas, per-user limits, and cost dashboards as next-stage production controls rather than something I would claim is already fully mature.

### 35. How would you monitor errors and regressions after launch?
My current quality loop includes builds, CI on Ubuntu and macOS, dependency audit gates, auth/editor smoke checks, migration checks, structured backend logs, and the internal eval harness. The next production layer would be real error monitoring, request tracing, alerting, and usage analytics. So I have good foundations, but I would not overclaim that full observability is already complete.

### 36. How would you scale this if usage grows a lot?
I would scale in layers: cache smarter, isolate expensive AI paths, add job queues for slower background work, monitor DB hotspots, and measure where the diagram editor becomes heavy with larger graphs. The architecture is organized enough to evolve that way, but it has not yet been proven under very large real-world traffic.

### 37. What security and privacy concerns matter for this product?
Because users may enter real product ideas, auth, data protection, access control, and storage practices matter. Clerk protects user identity, routes are protected, secrets are separated into environment variables, high-severity dependency audits run in CI, and backend tests cover important access-control paths. Formal privacy policy depth, data retention controls, and compliance posture are still next-stage business hardening.

---

## Business and Founder-Type Questions

### 38. Can this be a real paid product?
Yes, but the current priority is using it as a job-winning showcase project. After getting a job, I would productize it over a 1-3 month MVP timeline: public demo mode, billing, usage limits, better onboarding, shareable diagrams, and early user feedback loops.

### 39. Who would pay for it first?
The earliest paying users are likely indie founders, startup teams, junior-to-mid engineers learning system design, and small product or engineering teams that need faster architecture communication without buying a heavyweight enterprise platform.

### 40. What would your pricing model be?
I would start simple: a free tier for limited diagrams or generations, a paid individual plan for heavier usage and history/export/review features, and later a team tier for collaboration, shared workspaces, and governance. I would not start with complicated pricing before understanding usage patterns.

### 41. What is the wedge: education, architecture planning, or team collaboration?
The wedge is education plus practical architecture planning. The product is strongest when it helps people understand systems while also producing something useful enough to share with a team. Collaboration can become a larger growth layer later, but it should not be the first identity of the product.

### 42. What would you build next?
The next highest-value product work would be a public beta path, billing/usage limits, shareable public diagrams, richer example templates, production monitoring, deeper large-diagram stress handling, better cost controls, and more real-world validation around what kinds of architectures users come back to most often.

### 42a. What would make the codebase feel perfect?
For hiring, the final polish is a sharper public story: a short demo video, a clean case study, architecture docs, and consistently green CI. For a real SaaS, the missing perfection layer is production operations: observability, quotas, cost tracking, billing, privacy/retention controls, and more real integration tests against a real test database.

### 43. What would make users come back weekly?
Users will come back if the artifact stays useful over time. That means version history, continuing from an existing system instead of starting from zero, reusable architecture templates, clearer review surfaces, team discussion value, and a feeling that the tool helps them think, not just generate once.

---

## Strong Closing Answers

### 44. What is the one thing you are proudest of in Archflow?
I am proud that the product moved beyond "AI output" and became a trust-oriented workflow. The hard part was not adding generation. The hard part was making the output readable, explainable, editable, and worth returning to.

### 45. What is still not fully solved?
Real production usage will still teach things that local testing cannot. I would not claim full enterprise readiness, complete observability, full compliance posture, billing operations, or proven large-scale traffic behavior yet. What I can say is that the foundations are strong, the codebase has real guardrails, and the weak points are known.

### 46. Why do you think this project is a strong interview story?
Because it shows product thinking, AI reliability thinking, frontend UX refinement, backend hardening, schema discipline, auth handling, TypeScript/lint/CI discipline, integration-style testing, and the ability to make tradeoffs instead of just stacking features. It is a good example of turning an interesting idea into a more defensible product.

### 47. Is the codebase professionally maintained?
Yes, for a showcase product. The codebase has focused commits, separated components/styles, extracted hooks, modular generation/review logic, shared rule knowledge, backend tests, frontend smoke coverage, lint/typecheck checks, CI guardrails, and documentation that tracks what changed. For a paid SaaS, the next maturity layer would be production observability, quotas, billing operations, security/privacy policy depth, and real customer feedback loops.
