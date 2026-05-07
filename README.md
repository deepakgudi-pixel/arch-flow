![Archflow Banner](file:///Users/deepak/.gemini/antigravity/brain/e74b4819-9eee-4bd7-a3d8-a5103c499123/archflow_banner_1778131157150.png)

# 🌌 Archflow

**The Ultimate Neo-Brutalist System Design Sandbox.**

Archflow is a high-fidelity visual canvas designed for architects and developers to blueprint, simulate, and generate complex system architectures with the power of AI. Built with a focus on aesthetics and developer experience, it transforms technical planning into a creative process.

---

## ✨ Key Features

- 🎨 **Neo-Brutalist UI**: A bold, high-contrast interface designed for the modern developer.
- ⚡ **Visual Canvas**: Drag-and-drop node-based editor powered by **React Flow**.
- 🤖 **AI Generation**: Generate entire system architectures from simple prompts using **OpenRouter (DeepSeek)**.
- 📦 **Tech Inventory**: A pre-built library of cloud components, databases, and microservices.
- 📋 **Templates**: Start instantly with SaaS, E-commerce, Realtime, or Microservices blueprints.
- 🔐 **Secure Auth**: Enterprise-grade authentication powered by **Clerk**.
- 💾 **Persistence**: Real-time auto-save to **Neon PostgreSQL**.
- 📤 **Export**: Download your designs as high-resolution PNGs or raw JSON data.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Styled Components](https://styled-components.com/) & [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Diagramming**: [React Flow](https://reactflow.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [Neon](https://neon.tech/) (PostgreSQL)
- **Auth**: [Clerk](https://clerk.com/)
- **AI Engine**: [OpenRouter](https://openrouter.ai/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Accounts for Neon DB, Clerk, and OpenRouter.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/archflow.git
   cd archflow
   ```

2. **Environment Setup**:
   Create a `.env` in the `backend` folder and a `.env.local` in the `frontend` folder using the templates below:

   **Backend (`backend/.env`)**
   ```env
   PORT=4000
   NEON_DB_URL=postgresql://user:password@host.neon.tech/archflow?sslmode=require
   CLERK_SECRET_KEY=sk_test_xxx
   CLERK_JWT_KEY=your_clerk_jwt_public_key
   OPENROUTER_API_KEY=sk-or-v1-xxx
   ```

   **Frontend (`frontend/.env.local`)**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```

3. **Database Setup**:
   1. Create a [Neon](https://neon.tech/) database.
   2. Execute the schema found in `backend/src/db/schema.sql` against your database.

4. **Install Dependencies**:
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```

5. **Run Locally**:
   ```bash
   # Terminal 1 (Backend)
   cd backend && npm run dev
   
   # Terminal 2 (Frontend)
   cd frontend && npm run dev
   ```

---

## ⚙️ Service Configuration

### Clerk Authentication
1. Get your keys from the [Clerk Dashboard](https://dashboard.clerk.com/).
2. Configure your redirect URLs to `http://localhost:3000/dashboard`.
3. (Optional) Copy the JWT public key into `CLERK_JWT_KEY` for faster verification.

### OpenRouter (AI Engine)
1. Sign up at [OpenRouter](https://openrouter.ai/).
2. Generate an API key.
3. DeepSeek models are recommended for free, high-quality generation.

Open [http://localhost:3000](http://localhost:3000) to start designing!

---

## 📂 Project Structure

```text
archflow/
├── frontend/          # Next.js Application
│   ├── app/           # Routes and Pages
│   ├── components/    # Reusable UI Components
│   ├── lib/           # Logic, API Clients, Registry
│   └── styles/        # Global Styles
└── backend/           # Express.js API
    ├── src/
    │   ├── db/        # Schema and DB Connection
    │   ├── routes/    # API Endpoints
    │   └── middleware/# Auth & Utilities
```

---

## 📄 License

This project is licensed under the MIT License.

---


