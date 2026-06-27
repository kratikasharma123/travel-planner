import { useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';
import * as userService from '../services/userService.js';
import { AuthContext } from './authContext.js';

function getErrorMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCurrentUser = useCallback(async () => {
    try {
      const data = await authService.getCurrentUser();
      setUser(data.user);
      return data.user;
    } catch (error) {
      if (error?.response?.status !== 401) {
        console.warn(getErrorMessage(error, 'Unable to refresh user session'));
      }
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    async function bootstrapAuth() {
      setIsLoading(true);
      await refreshCurrentUser();
      setIsLoading(false);
    }

    bootstrapAuth();
  }, [refreshCurrentUser]);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (payload) => {
    const data = await authService.login(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const data = await userService.updateProfile(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const updatePreferences = useCallback(async (payload) => {
    const data = await userService.updatePreferences(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      register,
      login,
      logout,
      refreshCurrentUser,
      updateProfile,
      updatePreferences,
    }),
    [user, isLoading, register, login, logout, refreshCurrentUser, updateProfile, updatePreferences]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
