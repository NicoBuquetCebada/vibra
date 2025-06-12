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
  const [allowAutoLogin, setAllowAutoLogin] = useState(true);

  // Si el token no es válido, lo eliminamos y forzamos logout
  useEffect(() => {
    if (token && token.length < 10) {
      setToken(null);
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    const fetchUser = async () => {
      if (token && allowAutoLogin) { 
        try {
          const response = await fetch('http://vibra/api/users/page', {
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
        setUser(null);
      }
    };
    fetchUser();
  }, [token, allowAutoLogin]); 


  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    try {
     
      setAllowAutoLogin(false);
      
      const response = await fetch('http://vibra/api/users/login', {
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
        setAllowAutoLogin(true);
        return false;
      }
      
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        return true;
      }
      
      setAllowAutoLogin(true);
      return false;
    } catch {
      setAllowAutoLogin(true);
      return false;
    }
  };

  const completeLogin = async () => {
    setAllowAutoLogin(true);
    
    if (token) {
      try {
        const response = await fetch('http://vibra/api/users/page', {
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
    setAllowAutoLogin(true);
  };

  const isLoggedIn = !!token && !!user;

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, completeLogin, logout, token, user }}>
      {children}
    </AuthContext.Provider>
  );
};
