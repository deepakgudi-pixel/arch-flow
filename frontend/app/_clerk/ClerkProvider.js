'use client';

import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import api, { clearToken, setToken, setTokenProvider } from '@/lib/api';

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
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <ClerkTokenBridge>
        {children}
      </ClerkTokenBridge>
    </ClerkProvider>
  );
}
