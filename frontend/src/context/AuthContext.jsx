import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";
import { getAccessToken, removeTokens } from "../utils/tokenStorage";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const initializeAuth = async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getProfile();
      if (response && response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        removeTokens();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      removeTokens();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response && response.success) {
        const profileResponse = await authService.getProfile();
        if (profileResponse && profileResponse.success) {
          setUser(profileResponse.data);
          setIsAuthenticated(true);
          return profileResponse.data;
        }
      }
      return null;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      removeTokens();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getProfile();
      if (response && response.success) {
        setUser(response.data);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
