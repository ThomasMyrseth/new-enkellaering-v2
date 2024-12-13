'use client';

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/theme-provider';



export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Get the current path
  const protectedPaths = ['/min-side', '/profil', '/admin']; // Add paths that require authentication

  return (
  <html lang="en" >
      <body>
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        <AuthProvider>
          {protectedPaths.includes(pathname) ? (
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