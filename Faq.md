# Archflow Interview FAQ

This file is meant to help explain Archflow clearly in interviews, demos, founder conversations, and product discussions.

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
The hardest decision was choosing not to turn the app into a scoring product. A public architecture score sounds attractive at first, but it pushes users to chase a number instead of understanding the system. I decided the app should help people learn, inspect, and refine, not feel graded by a black box.

### 8. Why did you avoid a public scoring system?
Because it creates the wrong behavior. Users start asking why they got 72 instead of 84 instead of thinking about architecture tradeoffs. It also makes the AI feel like it is grading itself. I kept evaluation internal for quality control and made the user-facing experience about findings, assumptions, risks, and clarity instead.

---

## AI and Reliability Questions

### 9. How does the AI generation flow work?
The user gives a product prompt, the backend sends a structured request to the model, the response is normalized into nodes and edges, and then the frontend renders it as a diagram. After generation, the system can auto-arrange the graph, infer or repair connection labels, and surface review notes in the sidebars and review drawer.

### 10. How do you make the output feel trustworthy?
I do it in layers. First, the output is structured into explicit units and flows rather than dumped as raw text. Second, the UI explains why a unit was chosen and what assumptions or risks are attached to it. Third, the user can inspect a single connection, replace one technology without regenerating the full system, and review architecture findings without the canvas getting cluttered.

### 11. What do you do when the model returns bad or malformed output?
I hardened the pipeline so the app is not dependent on perfect model behavior. The parser can recover JSON from noisy outputs, smaller AI calls retry when they return invalid JSON, the diagram generator normalizes and validates nodes and edges, and failures are logged so they can feed back into the internal evaluator instead of just silently breaking the experience.

### 12. How do you evaluate whether the AI is getting better or worse?
I built an internal evaluation harness. It generates prompt sets from a small matrix, can mine real prompts from history, runs prompts repeatedly, scores results with deterministic checks, and writes JSON plus Markdown reports. That gives me a repeatable way to compare quality and stability over time.

### 13. Why did you build an internal eval harness?
Because improving AI by vibes is not sustainable. Once a product depends on generated structure, you need a way to detect regressions without manually reviewing everything. The harness gives me a quality loop so I can tell whether a prompt change, model change, or logic change made the system better or worse.

### 14. Why is internal evaluation better than a user-facing score?
They solve different problems. Internal evaluation is for me to measure consistency, regressions, and output quality. A user-facing score would try to reduce a complex architecture into one number, which is usually misleading. For this product, internal evaluation improves the engine, while user-facing review improves understanding.

### 15. How do you handle inconsistent generations across runs?
I try to contain inconsistency rather than pretend it does not exist. The app normalizes results into a stable shape, uses deterministic post-checks, lets users refine specific parts instead of regenerating the whole thing, and uses the eval harness to measure repeatability across multiple runs.

### 16. What parts are deterministic vs AI-driven?
AI-driven parts include initial architecture generation, technology suggestions, and protocol/flow inference. Deterministic parts include parsing, schema validation, graph normalization, migrations, review checks, autosave/versioning behavior, layout logic, and the internal evaluation scoring rules.

---

## Technical Architecture Questions

### 17. What is your frontend stack and why did you choose it?
The frontend uses Next.js App Router, React 18, React Flow, styled-components, and Framer Motion. That stack gave me a strong combination of application structure, flexible diagram rendering, custom UI styling, and interaction polish without overcomplicating the editor.

### 18. What is your backend stack and why?
The backend uses Node.js, Express, PostgreSQL via Neon, Redis/Upstash, Clerk for auth, and OpenRouter for model access. The goal was to keep the backend simple and pragmatic while supporting persistence, auth, caching, and AI integration cleanly.

### 19. How do diagrams get stored and versioned?
There is a primary diagram record and a version history model. The live diagram keeps the current state, while explicit version entries capture snapshots over time. That allows the app to autosave without creating noise and still lets users restore meaningful saved states later.

### 20. How do you handle autosave and version history without spamming the database?
I separated background persistence from explicit versioning. Autosave keeps the main diagram up to date using snapshot comparison, debouncing, and queued saves, but it does not create a new version entry every time. Manual save flows can still record a deliberate snapshot in history.

### 21. How do you manage auth and protected routes?
Clerk handles identity, and middleware protects non-public routes. The app also now has a dedicated local auth smoke check so I can verify sign-in routes and protected-route behavior consistently in development instead of assuming auth still works after changes.

### 22. How do you prevent schema drift in the database?
I added real numbered migrations, a `schema_migrations` table, and startup compatibility checks for required columns. That moves the app away from fragile "hope the DB matches the code" behavior and toward a repeatable migration process.

### 23. How do you handle connection and protocol inference?
Connections are stored as explicit edges, and protocol or flow labels can be inferred by AI and then normalized. The app also repairs generic labels in the background so users do not need to manually trigger protocol cleanup every time they edit the graph.

### 24. How do you make surgical edits without regenerating the full graph?
Users can replace a selected node with same-category alternatives. That swap updates the chosen tech immediately and only recalculates nearby connection wording rather than regenerating the entire architecture. It keeps the rest of the diagram stable and makes refinement feel controlled.

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
The biggest ones were smarter auto-arrange, replacing ambiguous hover behavior with focused selection, simplifying visible tech names, making connection direction explicit, removing unnecessary buttons, and shifting detailed explanation out of the canvas and into structured side panels.

### 30. What was a feature you removed because it hurt UX?
I removed manual protocol repair as a visible action and made it automatic. I also stepped back from putting too much emphasis on visibility toggles and score-like language. In general, I tried to remove controls that made users manage the product instead of letting the product help them.

### 31. How do you balance power and simplicity in the editor?
The pattern I use is: keep the default interaction simple, but let detail appear when the user focuses. A beginner should be able to generate, inspect, and edit without learning a control surface full of expert toggles. Power should emerge through selection, sidebars, history, review, and replace workflows.

---

## Scale and Production Questions

### 32. What happens if Clerk, Next.js, or OpenRouter changes behavior?
I assume dependencies will drift over time, so I added guardrails instead of assuming permanence. That includes Turbo dev for local stability, auth smoke verification, environment checks, numbered DB migrations, hardened AI parsing, retry logic for JSON responses, and internal eval reports so regressions become visible earlier.

### 33. What are the current failure points in production?
The main remaining risks are dependency changes, long-tail AI weirdness, larger real-world diagram stress cases, and the fact that some production concerns like monitoring and billing systems are still not fully built out. The difference now is that those risks are known and partially guarded, rather than hidden.

### 34. How do you control AI cost?
Right now the main controls are structured prompts, deterministic post-processing, fallback model behavior, and the fact that not every user action triggers a full regeneration. I would still consider usage quotas, per-user limits, and cost dashboards as next-stage production controls rather than something I would claim is already fully mature.

### 35. How would you monitor errors and regressions after launch?
My current quality loop includes builds, auth smoke checks, migration checks, and the internal eval harness. The next production layer would be real error monitoring, request tracing, alerting, and usage analytics. So I have good foundations, but I would not overclaim that full observability is already complete.

### 36. How would you scale this if usage grows a lot?
I would scale in layers: cache smarter, isolate expensive AI paths, add job queues for slower background work, monitor DB hotspots, and measure where the diagram editor becomes heavy with larger graphs. The architecture is organized enough to evolve that way, but it has not yet been proven under very large real-world traffic.

### 37. What security and privacy concerns matter for this product?
Because users may enter real product ideas, auth, data protection, access control, and storage practices matter. Clerk protects user identity, routes are protected, and secrets are separated into environment variables, but formal privacy policy depth, data retention controls, and compliance posture are still areas I would treat as next-stage business hardening.

---

## Business and Founder-Type Questions

### 38. Can this be a real paid product?
Yes. I think it is strong enough to ship as a paid v1. The product has a real use case, a clearer user experience, a stronger trust story than a typical AI wrapper, and enough technical hardening to justify charging early users.

### 39. Who would pay for it first?
The earliest paying users are likely indie founders, startup teams, junior-to-mid engineers learning system design, and small product or engineering teams that need faster architecture communication without buying a heavyweight enterprise platform.

### 40. What would your pricing model be?
I would start simple: a free tier for limited diagrams or generations, a paid individual plan for heavier usage and history/export/review features, and later a team tier for collaboration, shared workspaces, and governance. I would not start with complicated pricing before understanding usage patterns.

### 41. What is the wedge: education, architecture planning, or team collaboration?
The wedge is education plus practical architecture planning. The product is strongest when it helps people understand systems while also producing something useful enough to share with a team. Collaboration can become a larger growth layer later, but it should not be the first identity of the product.

### 42. What would you build next?
The next highest-value work would be stronger production monitoring, deeper large-diagram stress handling, better cost controls, richer modification workflows on existing diagrams, and more real-world validation around what kinds of architectures users come back to most often.

### 43. What would make users come back weekly?
Users will come back if the artifact stays useful over time. That means version history, continuing from an existing system instead of starting from zero, reusable architecture templates, clearer review surfaces, team discussion value, and a feeling that the tool helps them think, not just generate once.

---

## Strong Closing Answers

### 44. What is the one thing you are proudest of in Archflow?
I am proud that the product moved beyond "AI output" and became a trust-oriented workflow. The hard part was not adding generation. The hard part was making the output readable, explainable, editable, and worth returning to.

### 45. What is still not fully solved?
Real production usage will still teach things that local testing cannot. I would not claim full enterprise readiness, complete observability, full compliance posture, or proven large-scale traffic behavior yet. What I can say is that the foundations are strong and the weak points are known.

### 46. Why do you think this project is a strong interview story?
Because it shows product thinking, AI reliability thinking, frontend UX refinement, backend hardening, schema discipline, auth handling, and the ability to make tradeoffs instead of just stacking features. It is a good example of turning an interesting idea into a more defensible product.
