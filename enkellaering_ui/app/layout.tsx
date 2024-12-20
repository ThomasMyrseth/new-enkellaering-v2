'use client';

import { usePathname } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { useState } from 'react';
import './globals.css'; // Make sure this path is correct
import MenuBarMobile from '@/components/ui/menubarMobile';
import Sidebar from '@/components/ui/sidebar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const protectedPaths = ['/min-side', '/min-side-laerer', '/profil', '/admin'];

  const isProtected = protectedPaths.includes(pathname);

    // Mobile sidebar visibility state
    const [showSidebar, setShowSidebar] = useState(false);  

  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-full w-screen">
            {/* Render MenuBarMobile only on mobile screens */}
            <div className="md:hidden">
              <MenuBarMobile setter={setShowSidebar} />
            </div>

            {/* Sidebar for both desktop and mobile */}
            <Sidebar show={showSidebar} setter={setShowSidebar} />

            {/* Main content area */}
            <div className="flex-1 flex mt-[60px] md:mt-0">
              <AuthProvider>
                {isProtected ? <ProtectedRoute>{children}</ProtectedRoute> : children}
              </AuthProvider>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}