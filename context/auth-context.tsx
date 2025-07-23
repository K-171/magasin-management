"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: "admin" | "manager" | "user";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: any) => Promise<any>;
  createInvitation: (email: string, role: "admin" | "manager" | "user") => Promise<any>;
  getInvitations: () => Promise<any[]>;
  revokeInvitation: (id: string) => Promise<any>;
  verifySession: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<any>;
  resetPassword: (token: string, password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })
  const router = useRouter()

  const verifySession = useCallback(async () => {
    if (typeof window === "undefined") {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (data.isAuthenticated) {
        setAuthState({ user: data.user, isAuthenticated: true, isLoading: false });
      } else {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setAuthState({ user: data.user, isAuthenticated: true, isLoading: false });
    router.push('/');
  };

  const register = async (data: any) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Registration failed');
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push('/login');
  };

  const updateProfile = async (data: any) => {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (response.ok) {
      verifySession(); // Re-verify session to get updated user data
    }
    return result;
  };

  const createInvitation = async (email: string, role: "admin" | "manager" | "user") => {
    const response = await fetch('/api/auth/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    return await response.json();
  };

  const getInvitations = async () => {
    const response = await fetch('/api/auth/invitations');
    return await response.json();
  };

  const revokeInvitation = async (id: string) => {
    const response = await fetch(`/api/auth/invitations/${id}`, {
      method: 'DELETE',
    });
    return await response.json();
  };

  const requestPasswordReset = async (email: string) => {
    const response = await fetch('/api/auth/request-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  };

  const resetPassword = async (token: string, password: string) => {
    const response = await fetch('/api/auth/reset-password',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
    return await response.json();
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateProfile,
        createInvitation,
        getInvitations,
        revokeInvitation,
        verifySession,
        requestPasswordReset, 
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
