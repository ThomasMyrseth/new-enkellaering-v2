'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const Login = () => {
  const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;
  const { login } = useAuth();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(`${BASEURL}/login`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ "email": email, "password": password }),
      });

      if (response.ok) {
        login();
        setIsAuthenticated(true);
        router.push('/min-side');
      } else {
        const errorData = await response.json();
        alert(`Login failed: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-4 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">Logg inn</h2>
      <form className="my-8" onSubmit={handleLogin}>
        <LabelInputContainer>
          <Label htmlFor="email">Epost</Label>
          <Input
            id="email"
            placeholder="anne@gmail.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </LabelInputContainer>
        <LabelInputContainer>
          <Label htmlFor="password">Passord</Label>
          <Input
            id="password"
            placeholder="*****"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </LabelInputContainer>
        <button
          type="submit"
          className="bg-gradient-to-br from-black to-gray-800 text-white w-full py-2 rounded-md mt-4"
        >
          Logg inn
        </button>
      </form>
    </div>
  );
};

const LabelInputContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};

export default Login;