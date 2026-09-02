import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "@/services/auth";

const AuthContext = createContext();

const API = "/api/v1";

/**
 * Validates the stored token against the backend.
 * Returns the fresh profile object if valid, null if expired/invalid.
 */
async function validateStoredToken() {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  // Validate token by calling backend profile endpoint
  // ───────────────────────────────────────────────────────────────────

  try {
    const res = await fetch(`${API}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      // Token expired or revoked — clear storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return null;
    }

    const profile = await res.json();

    // Refresh the stored user object with latest data from server
    const user = {
      id: profile.id,
      email: profile.email,
      name: profile.full_name,
      full_name: profile.full_name,
      phone_number: profile.phone_number || "",
      role: profile.role,
      preferred_language: profile.preferred_language || "en",
      token,
    };

    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (_) {
    // Network error — keep the stored user so app works offline
    // but don't clear their session
    const stored = localStorage.getItem("user");
    if (stored) {
      try { return JSON.parse(stored); } catch (_) {}
    }
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialising, setInitialising] = useState(true); // true while checking stored token

  // ── On mount: validate stored token with backend ──────────────────
  useEffect(() => {
    validateStoredToken()
      .then((validUser) => {
        setUser(validUser);
      })
      .finally(() => {
        setInitialising(false);
      });
  }, []);

  // ── Login ─────────────────────────────────────────────────────────
  const login = async (credentials) => {
    // Use real auth service for login
    // ────────────────────────────────────────────────────────────────
    const res = await authService.login(credentials);  // throws on failure
    if (res.user) setUser(res.user);
    return res;
  };

  // ── Register ──────────────────────────────────────────────────────
  const register = async (userData) => {
    const res = await authService.register(userData);  // throws on failure
    if (res.user) setUser(res.user);
    return res;
  };

  // Google login removed — only email/password flows supported

  // ── Update profile ─────────────────────────────────────────────────
  const updateUser = async (newData) => {
    const updatedUser = await authService.updateProfile(newData);
    setUser(updatedUser);
    return updatedUser;
  };

  // ── Logout ────────────────────────────────────────────────────────
  const logout = async () => {
    // Always call backend logout to revoke tokens, then clear local state
    try {
      await authService.logout();
    } catch (_) {
      // If backend unreachable, still clear local state
    }
    setUser(null);
  };

  // ── Refresh user from backend (e.g. after profile edit) ───────────
  const refreshUser = useCallback(async () => {
    const fresh = await validateStoredToken();
    if (fresh) setUser(fresh);
    return fresh;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        initialising,
        login,
        register,
        
        updateUser,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
