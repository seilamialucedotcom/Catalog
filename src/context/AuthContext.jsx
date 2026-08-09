import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockStore } from '../data/mockStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('catalog_jwt') || null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check current token on initial mount
  useEffect(() => {
    const verifyToken = () => {
      const storedToken = localStorage.getItem('catalog_jwt');
      if (storedToken) {
        try {
          const storedUser = mockStore.getSession(storedToken);
          if (!storedUser) {
            logout();
          } else {
            setUser(storedUser);
            setToken(storedToken);
          }
        } catch (err) {
          console.error('Error al restaurar la sesión local:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('catalog_jwt', authToken);
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('catalog_jwt');
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
