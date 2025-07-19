"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isAdmin?: boolean
  address?: any
  phone?: string
  updatedAt?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Sync NextAuth session with our user state
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    if (session?.user) {
      const userData: User = {
        id: (session.user as any).id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        avatar: session.user.image || (session.user as any).avatar || "",
        isAdmin: (session.user as any).isAdmin || false,
      }
      setUser(userData)
      setIsAuthenticated(true)
    } else {
      setUser(null)
      setIsAuthenticated(false)
    }
    setIsLoading(false)
  }, [session, status])

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        return { success: false, error: result.error }
      }

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Error de conexión' }
    }
  }

  const loginWithGoogle = async () => {
    try {
      const result = await signIn('google', {
        redirect: false,
      })

      if (result?.error) {
        return { success: false, error: result.error }
      }

      // Borra la cookie auth-token antes de pedir el nuevo JWT
      document.cookie = 'auth-token=; Max-Age=0; path=/;';

      // Espera a que la sesión esté disponible
      await new Promise(res => setTimeout(res, 500));
      const session = await import('next-auth/react').then(m => m.getSession());
      if (session?.user?.email) {
        // Solicita el JWT y guarda la cookie
        await fetch('/api/auth/issue-jwt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: session.user.email }),
        });
      }

      return { success: true }
    } catch (error) {
      console.error('Google login error:', error)
      return { success: false, error: 'Error de conexión con Google' }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // After successful registration, sign in with credentials
        const loginResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (loginResult?.error) {
          return { success: false, error: loginResult.error }
        }

        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Error de conexión' }
    }
  }

  const logout = async () => {
    try {
      await signOut({ redirect: false })
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const checkAuth = async () => {
    // This is handled by NextAuth session
    setIsLoading(false)
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Error al actualizar el perfil' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Error de conexión al actualizar el perfil' };
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
    checkAuth,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 