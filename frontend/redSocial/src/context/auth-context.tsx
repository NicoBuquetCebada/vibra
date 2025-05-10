import React, { createContext, useState, ReactNode } from 'react';
import { mockUsers, generateToken, validateToken } from '../mocks/mockAuth';

interface MockUser {
  id: number;
  email: string;
  username: string;
  password: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  login: (emailOrUsername: string, password: string) => boolean;
  logout: () => void;
  token: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  const login = (emailOrUsername: string, password: string): boolean => {
    const user = mockUsers.find((u: MockUser) =>
      (u.email === emailOrUsername || u.username === emailOrUsername) &&
      u.password === password
    );

    if (user) {
      const newToken = generateToken({ id: user.id, username: user.username });
      setToken(newToken);
      localStorage.setItem('token', newToken);
      console.log('Token generado:', newToken);
      return true;
    }

    return false;
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const isLoggedIn = !!token && !!validateToken(token);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};
