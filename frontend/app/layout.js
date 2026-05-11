import StyledComponentsRegistry from '@/lib/registry';
import ClerkAuthProvider from '@/app/_clerk/ClerkProvider';
import GlobalStyles from '@/components/layout/GlobalStyles';
import MobileGate from '@/components/layout/MobileGate';
import { assertFrontendEnv } from '@/lib/runtimeEnv';
import { headers } from 'next/headers';

export const metadata = {
  title: 'Archflow - System Design Sandbox',
  description: 'AI-powered system design tool for developers'
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children }) {
  assertFrontendEnv();
  const headerStore = await headers();
  const isSmokeRoute = headerStore.get('x-archflow-smoke-route') === '1';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StyledComponentsRegistry>
          <GlobalStyles />
          <MobileGate />
          {isSmokeRoute ? children : (
            <ClerkAuthProvider>
              {children}
            </ClerkAuthProvider>
          )}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
