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
          <div className="flex h-full">
              <MenuBarMobile setter={setShowSidebar}/>
                <Sidebar show={showSidebar} setter={setShowSidebar} />
                <div className='my-[60px]'>
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