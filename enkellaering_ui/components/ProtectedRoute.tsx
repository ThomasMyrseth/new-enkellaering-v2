// components/ProtectedRoute.tsx
'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      router.push('/login'); // Redirect to login page
    }
    return <p>Redirecting...</p>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;