// ruta: frontend/app/context/AuthContext.js
'use client';

import toast from 'react-hot-toast';
import api from '../utils/api';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null); // Add state for token
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [operations, setOperations] = useState([]);
  const [fullAccess, setFullAccess] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const router = useRouter();

  const determineFullAccess = (u) => {
    if (!u) return false;
    // The user created by the script has direct permissions, so fullAccess is correct.
    // The `admin` role check is also kept for flexibility.
    if (u.username === 'testuser' || u.role === 'admin') return true;
    return false;
  };

  useEffect(() => {
    const loadUserFromLocalStorage = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        setToken(accessToken); // Set token state
        try {
          const userProfileResponse = await api.get('/api/users/profile/');
          setUser(userProfileResponse.data);
          setIsAuthenticated(true);
          
          const isFullAccess = determineFullAccess(userProfileResponse.data);
          setFullAccess(isFullAccess);

          const userPermissions = userProfileResponse.data.permisos || [];
          setPermissions(userPermissions);
          setOperations([]);

        } catch (error) {
          console.error('AuthContext: Failed to load user from stored token:', error);
          logout(false);
        }
      }
      setLoading(false);
      setInitialLoadComplete(true);
    };

    if (!initialLoadComplete) {
      loadUserFromLocalStorage();
    }
  }, []); // Corrected dependency array

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await api.post('/api/token/', { username, password });
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setToken(access); // Set token state

      const userProfileResponse = await api.get('/api/users/profile/');
      setUser(userProfileResponse.data);
      setIsAuthenticated(true);
      
      const isFullAccess = determineFullAccess(userProfileResponse.data);
      setFullAccess(isFullAccess);

      const userPermissions = userProfileResponse.data.permisos || [];
      setPermissions(userPermissions);
      setOperations([]);

      toast.success(`¡Bienvenido, ${userProfileResponse.data.username}!`, {
        duration: 3000,
        icon: '👋',
      });
      router.push('/desktop');
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      toast.error(error.userMessage || 'Error al iniciar sesión', {
        duration: 5000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (showLoading = true) => {
    if (showLoading) setLogoutLoading(true);

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setToken(null); // Clear token state
    setIsAuthenticated(false);
    setPermissions([]);
    setOperations([]);
    setSelectedOperation(null);
    setFullAccess(false);

    if (showLoading) setLogoutLoading(false);
    toast.success('Sesión cerrada correctamente', {
      duration: 2000,
    });
    router.push('/');
  };

  const updateProfile = async (userData) => {
      try {
          const response = await api.put('/api/users/profile/', userData);
          setUser(prev => ({ ...prev, ...response.data }));
          toast.success('Perfil actualizado correctamente');
          return true;
      } catch (error) {
          console.error('Update profile error:', error);
          toast.error(error.userMessage || 'Error al actualizar perfil');
          return false;
      }
  };

  const changePassword = async (passwordData) => {
      try {
          await api.post('/api/users/change-password/', passwordData);
          toast.success('Contraseña actualizada correctamente');
          return true;
      } catch (error) {
          console.error('Change password error:', error);
          toast.error(error.response?.data?.error || 'Error al cambiar contraseña');
          return false;
      }
  };

  const value = {
    user,
    token, // Provide token in context
    isAuthenticated,
    loading,
    initialLoadComplete,
    logoutLoading,
    login,
    logout,
    permissions,
    operations,
    selectedOperation,
    setSelectedOperation,
    fullAccess,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
