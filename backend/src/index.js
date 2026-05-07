import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import usersRouter from './routes/users.js';
import diagramsRouter from './routes/diagrams.js';
import inventoryRouter from './routes/inventory.js';
import settingsRouter from './routes/settings.js';
import aiRouter from './routes/ai.js';
import { initializeDatabase } from './db/init.js';

dotenv.config();

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

await initializeDatabase();

app.listen(PORT, () => {
  console.log(`Archflow API running on http://localhost:${PORT}`);
});
