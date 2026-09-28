import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { STORAGE_KEYS } from "../config/app";
import { isAdmin as roleIsAdmin, isOperator as roleIsOperator } from "../constants/roles";
import queryClient from "../lib/queryClient";

const AuthContext = createContext(null);

function readUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.token),
  );
  const [user, setUser] = useState(readUser);

  const login = useCallback((nextToken, nextUser) => {
    localStorage.setItem(STORAGE_KEYS.token, nextToken);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    setToken(null);
    setUser(null);
    queryClient.clear();
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((current) => {
      const next = { ...current, ...patch };
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isAdmin: roleIsAdmin(user?.role),
      isOperator: roleIsOperator(user?.role),
      login,
      logout,
      updateUser,
    }),
    [token, user, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>.");
  return ctx;
}
