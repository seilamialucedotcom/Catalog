import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser } from '../services/user';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('catalog_jwt') || null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('catalog_jwt');
    setIsLoginModalOpen(false);
  };

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('catalog_jwt');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const storedUser = await getCurrentUser();
        setUser(storedUser);
        setToken(storedToken);
      } catch (error) {
        console.error('Error al restaurar la sesión:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('catalog_jwt', authToken);
    setIsLoginModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
