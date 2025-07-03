import { useState, useEffect, useCallback } from 'react';

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Función para actualizar el estado de autenticación
  const updateAuth = useCallback(() => {
    const newToken = localStorage.getItem('token');
    const newUser = localStorage.getItem('user');
    
    if (newToken !== token) {
      setToken(newToken);
    }
    
    const parsedUser = newUser ? JSON.parse(newUser) : null;
    if (JSON.stringify(parsedUser) !== JSON.stringify(user)) {
      setUser(parsedUser);
    }
  }, [token, user]);

  // Función para hacer logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // Escuchar cambios en localStorage
  useEffect(() => {
    // Escuchar eventos de storage para cambios en otras pestañas
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        updateAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Revisar cambios en la misma pestaña con menor frecuencia
    const interval = setInterval(updateAuth, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [updateAuth]);

  return {
    token,
    user,
    isAuthenticated: !!(token && user),
    updateAuth,
    logout
  };
}
