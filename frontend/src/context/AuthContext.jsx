import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  authAPI,
  adminAPI,
  clearTokens,
  getAccessToken,
  setTokens,
} from "../api/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  // True during the first render — prevents guards from redirecting before
  // auth state has been read from localStorage.
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Mark initialization complete after the first synchronous render.
    // localStorage reads are synchronous so user/token are already populated
    // by the time this effect fires.
    setIsInitializing(false);
  }, []);

  // Listen for forced logouts (e.g. refresh token expired)
  useEffect(() => {
    const handler = () => {
      setUser(null);
    };
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  const persistUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const customerLogin = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.customerLogin({ email, password });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      setTokens(data.accessToken, data.refreshToken);
      persistUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const dealerLogin = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.dealerLogin({ email, password });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      setTokens(data.accessToken, data.refreshToken);
      persistUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const customerSignup = useCallback(
    async (name, email, phone, password) => {
      setLoading(true);
      try {
        const res = await authAPI.customerSignup({ name, email, phone, password });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Signup failed");
        setTokens(data.accessToken, data.refreshToken);
        persistUser(data.user);
        return data;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const dealerSignup = useCallback(async (formData) => {
    setLoading(true);
    try {
      const res = await authAPI.dealerSignup(formData);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      setTokens(data.accessToken, data.refreshToken);
      persistUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) await authAPI.logout(refreshToken);
    } catch {
      /* best-effort */
    }
    clearTokens();
    setUser(null);
  }, []);

  const adminLogin = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await adminAPI.login({ email, password });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      setTokens(data.accessToken, data.refreshToken);
      persistUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const isDealer = user?.userTypeId === 3;
  const isCustomer = user?.userTypeId === 2;
  const isAdmin = user?.userTypeId === 1;
  const isAuthenticated = !!user && !!getAccessToken();

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isInitializing,
        isAuthenticated,
        isDealer,
        isCustomer,
        isAdmin,
        customerLogin,
        dealerLogin,
        adminLogin,
        customerSignup,
        dealerSignup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
