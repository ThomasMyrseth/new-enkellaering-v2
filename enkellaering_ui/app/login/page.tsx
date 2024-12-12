// app/login/page.tsx
'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

const Login = () => {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    login(); // Set isAuthenticated to true
    router.push('/dashboard'); // Redirect to dashboard
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleLogin}>Log In</button>
    </div>
  );
};

export default Login;