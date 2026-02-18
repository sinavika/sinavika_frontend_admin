import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { loginAdmin } from "@/services/adminAuthService";
import { STORAGE_KEYS, ERROR_MESSAGES } from "@/constants";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isTokenExpired = (token) => {
    try {
      const { exp } = jwtDecode(token);
      return exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    const role = localStorage.getItem(STORAGE_KEYS.ADMIN_ROLE);
    const email = localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL);

    if (token && !isTokenExpired(token)) {
      setUser({ token, role, email });
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_ROLE);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_EMAIL);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const completeLogin = (data) => {
    const { token, email: decodedEmail, role } = data;
    setUser({ token, role, email: decodedEmail });

    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.ADMIN_ROLE, role ?? "Admin");
    localStorage.setItem(STORAGE_KEYS.ADMIN_EMAIL, decodedEmail);
  };

  const login = async (email, password) => {
    const data = await loginAdmin(email, password);
    completeLogin(data);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_ROLE);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_EMAIL);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
