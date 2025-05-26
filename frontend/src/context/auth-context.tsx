import React, { createContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  logout: () => void;
  token: string | null;
  user: { name: string} | null; // Añadido para almacenar información del usuario
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<{ name: string } | null>(null); // Añadido para almacenar información del usuario

  // Si el token no es válido, lo eliminamos y forzamos logout
  React.useEffect(() => {
    if (token && token.length < 10) { // Comprobación simple, puedes mejorarla
      setToken(null);
      localStorage.removeItem('token');
    }
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
        return true;
      }
      return false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, token, user }}>
      {children}
    </AuthContext.Provider>
  );
};
