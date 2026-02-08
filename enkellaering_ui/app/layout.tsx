'use client';

import { usePathname } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { useState } from 'react';
import './globals.css'; // Make sure this path is correct
import Head from 'next/head';
import MenuBarMobile from '@/components/ui/menubarMobile';
import Sidebar from '@/components/ui/sidebar';
import { Toaster } from "@/components/ui/sonner"
import FacebookPixel from "@/components/facebookPixel/facebookPixel"
import PixelTracker from '@/components/facebookPixel/pageTracker';
import GoogleAds from '@/components/googleAds/googleAds';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const protectedPaths = ['/min-side', '/min-side-laerer', '/profil', '/admin'];

  const isProtected = protectedPaths.includes(pathname);

    // Mobile sidebar visibility state
    const [showSidebar, setShowSidebar] = useState(false);  

  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>Enkel Laering</title>
        <meta 
          name="Velkommen til Enkel Læring. Vi tilbyr privatundervisning av øverste klasse til deg og dine barn"
         content="Enkel Læring tilbyr privatundervisning til elever ved grunnskolen og videregående" />
      </Head>
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
                <FacebookPixel/>
                <PixelTracker/>
                <GoogleAds />
              </AuthProvider>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}