import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('catalog_jwt') || null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check current token on initial mount
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('catalog_jwt');
      if (storedToken) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setToken(storedToken);
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (err) {
          console.error('Error al verificar sesión:', err);
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
