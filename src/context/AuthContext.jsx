import { createContext, useContext, useState, useEffect } from "react";
import { api, getStoredToken, setStoredToken } from "../lib/api.js";
const AuthContext = createContext(void 0);
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const refreshUser = async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.auth.me();
      setUser(data.user);
    } catch (err) {
      console.error("Failed to load user session:", err);
      setStoredToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    refreshUser();
  }, []);
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await api.auth.login({ email, password });
      setStoredToken(data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };
  const googleLogin = async (email, name, avatar) => {
    setIsLoading(true);
    try {
      const data = await api.auth.googleLogin({ email, name, avatar });
      setStoredToken(data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };
  const register = async (payload) => {
    setIsLoading(true);
    try {
      const data = await api.auth.register(payload);
      setStoredToken(data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };
  const logout = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };
  const updateProfile = async (data) => {
    const res = await api.auth.updateProfile(data);
    setUser(res.user);
  };
  const quickLoginAs = async (email) => {
    if (email.includes("admin")) {
      await login("admin@timecapsule.com", "admin123");
    } else {
      await login(email, "password123");
    }
  };
  return <AuthContext.Provider
    value={{
      user,
      token,
      isLoading,
      login,
      googleLogin,
      register,
      logout,
      updateProfile,
      refreshUser,
      quickLoginAs
    }}
  >
      {children}
    </AuthContext.Provider>;
};
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
export {
  AuthProvider,
  useAuth
};
