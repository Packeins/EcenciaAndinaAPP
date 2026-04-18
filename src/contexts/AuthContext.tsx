import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; rol: UserRole };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): { success: boolean; rol: UserRole } => {
    if (email && password) {
      const rol: UserRole = email.toLowerCase().includes('admin') ? 'administrador' : 'caja';
      setUser({
        id: '1',
        nombre: rol === 'administrador' ? 'Administrador' : 'Cajero',
        email,
        rol,
      });
      return { success: true, rol };
    }
    return { success: false, rol: 'caja' };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
