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
  const existing = await pool.query(
    'SELECT id, email FROM users WHERE id = $1',
    [user.id]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const email = await resolveUserEmail(user.id, user.email);

  if (!email) {
    throw new Error('Unable to resolve user email');
  }

  const inserted = await pool.query(
    'INSERT INTO users (id, email) VALUES ($1, $2) RETURNING id, email',
    [user.id, email]
  );

  return inserted.rows[0];
}
