import React, { createContext, useState, ReactNode, useEffect } from 'react';

// Obtener la URL de la API desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://vibra';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  logout: () => void;
  token: string | null;
  user: { name: string } | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Debug en desarrollo
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔐 AuthContext - Token inicial:', !!token);
      console.log('🌐 AuthContext - API_URL:', API_URL);
    }
  }, []);

  // Auto-cargar usuario cuando hay token válido
  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user && !isLoadingUser) {
        setIsLoadingUser(true);
        
        if (import.meta.env.DEV) {
          console.log('👤 Cargando datos de usuario...');
        }
        
        try {
          const response = await fetch(`${API_URL}/api/users/page`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser({ name: data.name });
            
            if (import.meta.env.DEV) {
              console.log('✅ Usuario cargado:', data.name);
            }
          } else {
            // Token inválido, limpiar
            console.error('🚫 Token inválido, limpiando sesión');
            setToken(null);
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('🔥 Error al cargar usuario:', error);
          // Error de red, mantener token pero limpiar usuario
          setUser(null);
        }
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, [token, user, isLoadingUser]);

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    try {
      if (import.meta.env.DEV) {
        console.log('🔑 Intentando login...');
      }
      
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: emailOrUsername,
          pass: password,
        }),
      });
      
      if (!response.ok) {
        console.error('❌ Login fallido:', response.status);
        return false;
      }
      
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        
        if (import.meta.env.DEV) {
          console.log('✅ Token guardado, cargando usuario...');
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('🔥 Error en login:', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setUser(null);
    
    if (import.meta.env.DEV) {
      console.log('🚪 Usuario desconectado');
    }
  };

  // isLoggedIn basado solo en el token - más confiable en producción
  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, token, user }}>
      {children}
    </AuthContext.Provider>
  );
};
