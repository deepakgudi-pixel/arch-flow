import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import usersRouter from './routes/users.js';
import diagramsRouter from './routes/diagrams.js';
import inventoryRouter from './routes/inventory.js';
import settingsRouter from './routes/settings.js';
import aiRouter from './routes/ai.js';
import { initializeDatabase } from './db/init.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/diagrams', diagramsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/ai', aiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel
export default app;

// Call DB initialization
initializeDatabase().then(() => {
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`Archflow API running on http://localhost:${PORT}`);
    });
  }
}).catch(err => {
  console.error('Failed to initialize DB:', err);
});
