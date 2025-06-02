import React, { createContext, useState, ReactNode, useEffect } from 'react';

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

  // Si el token no es válido, lo eliminamos y forzamos logout
  useEffect(() => {
    if (token && token.length < 10) {
      setToken(null);
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  // Recuperar usuario si hay token en localStorage
  useEffect(() => {
    const fetchUser = async () => {
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
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    fetchUser();
  }, [token]);

  // Nueva función de login que llama a la API real
  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    try {
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
      if (!response.ok) return false;
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        // Obtener usuario tras login
        try {
          const userRes = await fetch('http://localhost:8080/api/users/page', {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser({ name: userData.name });
          }
        } catch {
          setUser(null);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setUser(null);
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, token, user }}>
      {children}
    </AuthContext.Provider>
  );
};
