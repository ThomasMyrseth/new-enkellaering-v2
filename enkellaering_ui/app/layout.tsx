'use client';

import { usePathname } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css'; // Make sure this path is correct

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const protectedPaths = ['/min-side', '/min-side-laerer', '/profil', '/admin'];

  const isProtected = protectedPaths.includes(pathname);

  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {isProtected ? (
              <ProtectedRoute>{children}</ProtectedRoute>
            ) : (
              children
            )}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}