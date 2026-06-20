import express from 'express';
import { builtInTech } from '../lib/tech.js';

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    builtIn: builtInTech
  });
});

export default router;
