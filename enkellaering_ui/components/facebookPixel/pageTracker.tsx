'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { pageview } from './fpixel';

export default function PixelTracker() {
  const pathname = usePathname();
  useEffect(() => {
    pageview();
  }, [pathname]);
  return null;
}