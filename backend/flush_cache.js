import pool from './src/db/pool.js';
import { redis } from './src/lib/redis.js';

async function flush() {
  try {
    console.log("Flushing DB cache...");
    await pool.query('DELETE FROM diagram_versions');
    console.log("DB cache flushed.");
    
    if (redis.isAvailable() && redis.getClient()) {
      console.log("Flushing Redis...");
      await redis.getClient().flushAll();
      console.log("Redis flushed.");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}

flush();
