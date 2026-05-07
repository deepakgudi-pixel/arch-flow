import { verifyToken } from '@clerk/backend';
import dotenv from 'dotenv';

dotenv.config();

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const CLERK_JWT_KEY = process.env.CLERK_JWT_KEY;

function getVerifyOptions() {
  if (CLERK_JWT_KEY) {
    return { jwtKey: CLERK_JWT_KEY };
  }

  if (CLERK_SECRET_KEY) {
    return { secretKey: CLERK_SECRET_KEY };
  }

  throw new Error('Missing Clerk configuration. Set CLERK_JWT_KEY or CLERK_SECRET_KEY.');
}

async function verifyClerkSessionToken(token) {
  const payload = await verifyToken(token, getVerifyOptions());
  const userId = payload.sub;

  if (!userId) {
    throw new Error('Token payload is missing subject claim.');
  }

  return { userId, payload };
}

export const clerkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { userId, payload } = await verifyClerkSessionToken(token);
    req.auth = payload;
    req.user = {
      id: userId,
      email: payload.email || payload.email_address || null
    };
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid token: ' + err.message });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const { userId, payload } = await verifyClerkSessionToken(token);
    req.auth = payload;
    req.user = {
      id: userId,
      email: payload.email || payload.email_address || null
    };
  } catch (err) {
    console.error('Token verification failed (optional):', err.message);
    req.user = null;
  }

  next();
};
