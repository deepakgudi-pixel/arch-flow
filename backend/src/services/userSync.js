import dotenv from 'dotenv';
import { createClerkClient } from '@clerk/backend';
import pool from '../db/pool.js';

dotenv.config();

const clerkClient = process.env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

export async function resolveUserEmail(userId, fallbackEmail) {
  if (fallbackEmail) {
    return fallbackEmail;
  }

  if (!clerkClient) {
    return null;
  }

  const clerkUser = await clerkClient.users.getUser(userId);
  const primaryEmail =
    clerkUser.emailAddresses.find(
      emailAddress => emailAddress.id === clerkUser.primaryEmailAddressId
    ) || clerkUser.emailAddresses[0];

  return primaryEmail?.emailAddress || null;
}

export async function ensureUserExists(user) {
  // 1. Try to find by ID (standard path)
  const byId = await pool.query(
    'SELECT id, email FROM users WHERE id = $1',
    [user.id]
  );

  if (byId.rows.length > 0) {
    return byId.rows[0];
  }

  // 2. ID not found, let's resolve the email
  const email = await resolveUserEmail(user.id, user.email);
  if (!email) {
    throw new Error('Unable to resolve user email');
  }

  // 3. Try to find by EMAIL (migration path)
  const byEmail = await pool.query(
    'SELECT id, email FROM users WHERE email = $1',
    [email]
  );

  if (byEmail.rows.length > 0) {
    // Identity Migration: Update the old ID to the new one
    console.log(`🔄 Migrating identity for ${email}: ${byEmail.rows[0].id} -> ${user.id}`);
    const updated = await pool.query(
      'UPDATE users SET id = $1 WHERE email = $2 RETURNING id, email',
      [user.id, email]
    );
    return updated.rows[0];
  }

  // 4. Truly new user: INSERT
  const inserted = await pool.query(
    'INSERT INTO users (id, email) VALUES ($1, $2) RETURNING id, email',
    [user.id, email]
  );

  return inserted.rows[0];
}
