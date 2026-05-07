
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

### 👥 Collaborative Blueprinting
- **Invite Terminal**: Generate secure invite codes to bring collaborators into your workspace.
- **Real-time Sync**: Collaborative editing with persistence powered by **Neon PostgreSQL**.
- **Community Inventory**: Automated discovery and registration of new technical modules to a shared global registry.

### 📦 Production Templates
- **SaaS Stack**: Next.js, Clerk, Express, PostgreSQL, Redis.
- **Mobile Native**: FastAPI, PostgreSQL, Firebase Auth, S3.
- **Microservices**: API Gateway, gRPC services, Kafka, PostgreSQL.
- **Real-time Engine**: Socket.io, Redis Pub/Sub, Express.

---

## 🛠️ Tech Stack

### Frontend (Industrial Component Architecture)
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **State & Logic**: Component-driven architecture (Header, Sidebar, Inventory, PromptBar)
- **Styling**: [Styled Components](https://styled-components.com/) with Neo-Brutalist tokens
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Diagramming**: [React Flow](https://reactflow.dev/)

### Backend (Robust API Infrastructure)
- **Runtime**: [Node.js](https://nodejs.org/) / [Express.js](https://expressjs.com/)
- **Validation**: Schema-based input hardening for all write operations
- **Database**: [Neon](https://neon.tech/) (Serverless PostgreSQL)
- **Auth**: [Clerk](https://clerk.com/) Enterprise-grade authentication
- **AI Engine**: [OpenRouter](https://openrouter.ai/) (DeepSeek-R1 / Free Fallbacks)

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


