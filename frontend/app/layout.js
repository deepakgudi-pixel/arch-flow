import StyledComponentsRegistry from '@/lib/registry';
import ClerkAuthProvider from '@/app/_clerk/ClerkProvider';
import GlobalStyles from '@/components/layout/GlobalStyles';

export const metadata = {
  title: 'Archflow - System Design Sandbox',
  description: 'AI-powered system design tool for developers'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StyledComponentsRegistry>
          <GlobalStyles />
          <ClerkAuthProvider>
            {children}
          </ClerkAuthProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
