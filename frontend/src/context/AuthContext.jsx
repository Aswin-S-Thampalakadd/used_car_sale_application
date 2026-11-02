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
import { signInWithPopup, signOut } from "firebase/auth";
import { firebaseAuth, googleProvider } from "../firebase";

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

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setIsInitializing(false);
  }, []);

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

  const googleSignIn = useCallback(async (userType, dealershipName) => {
    if (!firebaseAuth) {
      throw new Error(
        "Google sign-in is not configured. Add the Firebase web app settings.",
      );
    }

    setLoading(true);
    try {
      const credential = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await credential.user.getIdToken();
      const res = await authAPI.googleSignIn(userType, {
        idToken,
        ...(dealershipName ? { dealershipName } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google sign-in failed");
      setTokens(data.accessToken, data.refreshToken);
      persistUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const customerSignup = useCallback(async (name, email, phone, password) => {
    setLoading(true);
    try {
      const res = await authAPI.customerSignup({
        name,
        email,
        phone,
        password,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      setTokens(data.accessToken, data.refreshToken);
      persistUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

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
    } catch {}
    if (firebaseAuth) {
      try {
        await signOut(firebaseAuth);
      } catch {}
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
        googleSignIn,
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
