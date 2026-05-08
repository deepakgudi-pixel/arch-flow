
# 🌌 Archflow: The Industrial System Design Sandbox

**Archflow** is a high-fidelity, industrial-grade visual canvas designed for architects and developers to blueprint, simulate, and generate complex system architectures. Built with a bold **Neo-Brutalist** aesthetic and powered by state-of-the-art AI, it transforms technical planning into a high-performance creative process.

---

## ✨ Key Features

### 🛠️ Industrial Workspace
- **Neo-Brutalist UI**: A high-contrast, production-focused interface designed for clarity and speed.
- **Visual Canvas**: Drag-and-drop node editor powered by **React Flow** with specialized industrial node types.
- **System Snapshots**: Download high-resolution PNGs or raw JSON blueprints for documentation.

### 🤖 AI-Driven Synthesis
- **DeepSeek-R1 Architecture**: Generate complete system designs from natural language prompts.
- **Mobile-First Intelligence**: Native support for Android (Kotlin), iOS (Swift), and cross-platform (Flutter/React Native) architectures.
- **Technical Sourcing**: Automated technical module generation with deep-dives into specific product stacks.

- **Invite Terminal**: Generate secure invite codes to bring collaborators into your workspace.
- **Real-time Sync**: Collaborative editing with persistence powered by **Neon PostgreSQL**.
- **Design History**: Integrated **Architectural Versioning** system for time-travel navigation through previous system snapshots.
- **Community Inventory**: Automated discovery and registration of new technical modules to a shared global registry.

### 📦 Production Templates
- **SaaS Stack**: Next.js, Clerk, Express, PostgreSQL, Redis.
- **Mobile Native**: FastAPI, PostgreSQL, Firebase Auth, S3.
- **Microservices**: API Gateway, gRPC services, Kafka, PostgreSQL.
- **Real-time Engine**: Socket.io, Redis Pub/Sub, Express.

---

## 🛠️ Tech Stack

### Frontend (Industrial Component Architecture)
- **Framework**: [Next.js 14](https://nextjs.org/) — Chosen for its **App Router** orchestration and superior **SEO/Performance** profile in complex SPAs.
- **Diagramming**: [React Flow](https://reactflow.dev/) — The gold standard for node-based UIs; chosen for its high-performance rendering and deep extensibility for custom industrial nodes.
- **Styling**: [Styled Components](https://styled-components.com/) — Allows for strict **Neo-Brutalist design tokens** and dynamic, state-driven styling without the bloat of utility classes.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) — Handles the high-fidelity micro-interactions that make the industrial UI feel "alive."

### Backend (Robust API Infrastructure)
- **Runtime**: [Node.js](https://nodejs.org/) / [Express.js](https://expressjs.com/) — Provides a lightweight, high-concurrency event loop perfect for streaming AI responses via SSE.
- **AI Orchestration**: [OpenRouter](https://openrouter.ai/) — Integrated with **Auto-routing** to ensure model-agnostic resilience. It dynamically selects the best LLM to prevent vendor lock-in and downtime.
- **Multi-Layer Cache**: **Redis (Upstash)** — Implemented for its serverless-optimized REST API, providing cross-server state persistence and global rate limiting without connection bottlenecks.
- **Database**: [Neon](https://neon.tech/) — A serverless PostgreSQL choice that provides **ACID compliance** for architectural snapshots while scaling down to zero when idle.
- **Auth**: [Clerk](https://clerk.com/) — Managed identity with **JWT-based verification**, offloading the security burden while providing a premium user onboarding experience.

### ⚡ Universal Redis Architecture
Archflow uses a specialized "Dual-Protocol" Redis strategy to ensure zero-latency development and production-grade stability:
- **Local (Native TCP)**: Uses standard `redis://` protocol for sub-millisecond performance on persistent local connections.
- **Production (Serverless REST)**: Switches to **Upstash REST API** when deployed to Vercel. This bypasses the TCP connection limits of serverless environments, ensuring high availability and eliminating "cold start" connection bottlenecks.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Accounts: Neon DB, Clerk, OpenRouter

### Installation

1. **Clone & Enter**:
   ```bash
   git clone https://github.com/your-username/archflow.git
   cd archflow
   ```

2. **Industrial Environment Setup**:
   Configure your secrets in both layers:

   **Backend (`backend/.env`)**
   ```env
   PORT=4000
   NEON_DB_URL=postgresql://user:password@host.neon.tech/archflow?sslmode=require
   CLERK_SECRET_KEY=sk_test_xxx
   CLERK_JWT_KEY=your_clerk_jwt_public_key # Optional: For faster token verification
   OPENROUTER_API_KEY=sk-or-v1-xxx
   
   # Redis Configuration (Local & Production)
   REDIS_URL=redis://localhost:6379
   UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token
   ```

   **Frontend (`frontend/.env.local`)**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```

3. **Database Initialization**:
   Execute the schema found in `backend/src/db/schema.sql` against your Neon PostgreSQL instance to set up the industrial registry.

4. **Dependency Injection**:
   ```bash
   # Build Backend
   cd backend && npm install
   
   # Build Frontend
   cd ../frontend && npm install
   ```

4. **Boot Sequence**:
   ```bash
   # Terminal 1: API Layer
   cd backend && npm run dev
   
   # Terminal 2: UI Layer
   cd frontend && npm run dev
   ```

---

## 📂 Project Architecture

```text
archflow/
├── frontend/                # Next.js UI Layer
│   ├── app/                 # App Router & Orchestration
│   ├── components/
│   │   ├── diagram/         # Extracted Editor Modules (Header, Sidebar, Prompt)
│   │   └── ui/              # Shared Industrial UI Tokens
│   └── lib/                 # Registry & API Clients
└── backend/                 # Express API Layer
    ├── src/
    │   ├── db/              # Schema & Pool Management
    │   ├── routes/          # AI, Diagrams, Inventory, Collaborators
    │   └── middleware/      # Hardened Validation & Auth
```

---

## 📄 License

MIT License - Blueprint the future, responsibly.

---

Open [http://localhost:3000](http://localhost:3000) to start your next architectural masterwork.


