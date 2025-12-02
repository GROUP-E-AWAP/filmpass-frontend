import React, { createContext, useContext, useState } from "react";
import {
  loginUser,
  registerUser,
  saveAuth,
  clearAuth,
  getStoredUser
} from "./auth";

// Global auth context: stores current user + actions (login/logout/register)
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Load user from localStorage on initialization
  const [user, setUser] = useState(() => getStoredUser());
  // Controls UI feedback during login/register
  const [loading, setLoading] = useState(false);
  // Error state for auth forms
  const [error, setError] = useState("");

  // Login flow: calls backend, stores token+user locally
  async function login(email, password) {
    setLoading(true);
    setError("");
    try {
      const { token, user: u } = await loginUser({ email, password });
      saveAuth(token, u);      // persist to localStorage
      setUser(u);              // update in React state
      return u;
    } catch (e) {
      setError(e.message || "Login failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  // Register flow: similar to login, backend returns token + user
  async function register(name, email, password) {
    setLoading(true);
    setError("");
    try {
      const { token, user: u } = await registerUser({ name, email, password });
      saveAuth(token, u);
      setUser(u);
      return u;
    } catch (e) {
      setError(e.message || "Registration failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  // Logout clears token and user profile
  function logout() {
    clearAuth();
    setUser(null);
  }

  // Context value shared across the app
  const value = { user, loading, error, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to access auth context easily
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
