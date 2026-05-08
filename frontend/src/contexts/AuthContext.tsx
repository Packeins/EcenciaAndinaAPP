import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { API_BASE_URL } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; rol: UserRole; message?: string }>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }

    // Escuchar cambios en localStorage (para cerrar sesión en todas las pestañas)
    const handleStorageChange = (e: StorageEvent) => {
      // Si otra pestaña eliminó el usuario (cerrar sesión)
      if (e.key === 'user' && e.newValue === null) {
        console.log('Sesión cerrada en otra pestaña. Sincronizando...');
        setUser(null);
      }
      // Si otra pestaña actualizó el usuario (como cambio de perfil)
      if (e.key === 'user' && e.newValue !== null) {
        try {
          setUser(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Error parsing storage data:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; rol: UserRole; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identificador: email, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, rol: data.user.rol };
      }
      return { success: false, rol: 'caja', message: data.mensaje || 'Credenciales inválidas' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, rol: 'caja', message: 'Error de conexión con el servidor' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
