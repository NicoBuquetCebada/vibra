import React, { createContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  completeLogin: () => void;
  logout: () => void;
  token: string | null;
  user: { name: string } | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [allowAutoLogin, setAllowAutoLogin] = useState(true); // ✅ AGREGAR: Control de auto-login

  // Si el token no es válido, lo eliminamos y forzamos logout
  useEffect(() => {
    if (token && token.length < 10) {
      setToken(null);
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  // ✅ MODIFICAR: Solo auto-cargar usuario si allowAutoLogin es true
  useEffect(() => {
    const fetchUser = async () => {
      if (token && allowAutoLogin) { // ✅ AGREGAR: Verificar allowAutoLogin
        try {
          const response = await fetch('http://localhost:8080/api/users/page', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUser({ name: data.name });
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else if (!allowAutoLogin) {
        setUser(null); // ✅ Limpiar usuario si no se permite auto-login
      }
    };
    fetchUser();
  }, [token, allowAutoLogin]); // ✅ AGREGAR: allowAutoLogin como dependencia

  // ✅ MODIFICAR: Login que temporalmente desactiva auto-login
  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    try {
      // ✅ Temporalmente desactivar auto-login
      setAllowAutoLogin(false);
      
      const response = await fetch('http://localhost:8080/api/users/login', {
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
        setAllowAutoLogin(true); // ✅ Reactivar si falla
        return false;
      }
      
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        // ✅ NO cargar usuario aún
        return true;
      }
      
      setAllowAutoLogin(true); // ✅ Reactivar si falla
      return false;
    } catch {
      setAllowAutoLogin(true); // ✅ Reactivar si falla
      return false;
    }
  };

  // ✅ MODIFICAR: completeLogin que activa el auto-login y carga usuario
  const completeLogin = async () => {
    setAllowAutoLogin(true); // ✅ Reactivar auto-login
    
    // ✅ Cargar usuario manualmente
    if (token) {
      try {
        const response = await fetch('http://localhost:8080/api/users/page', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser({ name: data.name });
        }
      } catch {
        setUser(null);
      }
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setUser(null);
    setAllowAutoLogin(true); // ✅ Reactivar auto-login para futuros logins
  };

  // ✅ isLoggedIn se calcula del token y usuario
  const isLoggedIn = !!token && !!user;

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, completeLogin, logout, token, user }}>
      {children}
    </AuthContext.Provider>
  );
};
