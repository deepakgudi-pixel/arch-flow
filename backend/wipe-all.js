import 'dotenv/config';
import pool from './src/db/pool.js';
import { execSync } from 'child_process';

async function masterWipe() {
  console.log('🌌 --- ARCHFLOW MASTER WIPE INITIATED --- 🌌');

  // 1. Clear NeonDB (ALL TABLES)
  try {
    console.log('⌛ Clearing ALL tables in NeonDB...');
    
    // Get all table names in the public schema
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const tables = tablesRes.rows.map(r => r.table_name);
    
    if (tables.length > 0) {
      // Truncate all tables with CASCADE to handle foreign keys
      const truncateQuery = `TRUNCATE TABLE ${tables.join(', ')} RESTART IDENTITY CASCADE`;
      await pool.query(truncateQuery);
      console.log(`✅ NeonDB Fully Purged (${tables.length} tables cleared).`);
    } else {
      console.log('ℹ️ No tables found to clear.');
    }
  } catch (err) {
    console.error('❌ NeonDB Wipe Failed:', err.message);
  }

  // 2. Clear Local Redis
  try {
    console.log('⌛ Clearing Local Redis...');
    execSync('redis-cli flushall');
    console.log('✅ Local Redis Cleared.');
  } catch (err) {
    console.warn('⚠️ Local Redis Wipe Failed (Is it running?):', err.message);
  }

  // 3. Clear Upstash Redis
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      console.log('⌛ Clearing Upstash Redis...');
      const response = await fetch(`${url}/flushdb`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        console.log('✅ Upstash Redis Cleared.');
      } else {
        console.error('❌ Upstash Wipe Failed:', await response.text());
      }
    } catch (err) {
      console.error('❌ Upstash Network Error:', err.message);
    }
  }

  console.log('✨ --- SYSTEM RESET COMPLETE --- ✨');
  process.exit(0);
}

masterWipe();
