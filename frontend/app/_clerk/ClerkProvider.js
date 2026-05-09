'use client';

import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import api, { clearToken, setToken, setTokenProvider } from '@/lib/api';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function ClerkTokenBridge({ children }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    setTokenProvider(async () => {
      const token = await getToken();

      if (!token) {
        clearToken();
        return null;
      }

      return token;
    });

    return () => {
      setTokenProvider(null);
    };
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      clearToken();
      return;
    }

    const syncSession = async () => {
      try {
        const token = await getToken();

        if (!token) {
          clearToken();
          return;
        }

        localStorage.setItem('archflow_token', token);
        setToken(token);
        await api.syncUser();
      } catch (err) {
        console.error('Failed to sync user:', err);
      }
    };

    syncSession();
  }, [getToken, isLoaded, isSignedIn]);

  return children;
}

export default function ClerkAuthProvider({ children }) {
  if (!publishableKey) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '32px',
        background: '#f3f0ea'
      }}>
        <div style={{
          maxWidth: '640px',
          width: '100%',
          background: '#ffffff',
          border: '3px solid #000000',
          boxShadow: '8px 8px 0 #000000',
          padding: '28px'
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginBottom: '14px'
          }}>
            AUTH_CONFIG_REQUIRED
          </div>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
          </div>
          <p style={{ lineHeight: 1.6, color: '#333333' }}>
            Archflow cannot initialize authentication until the Clerk publishable key is configured.
            Add the missing variable to your frontend environment and restart the app.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
      <ClerkTokenBridge>
        {children}
      </ClerkTokenBridge>
    </ClerkProvider>
  );
}
