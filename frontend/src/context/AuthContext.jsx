import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setTheme } from "../store/themeSlice";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    return saved && token ? JSON.parse(saved) : null;
  });
  const [isLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    if (userData?.preferences?.theme) {
      dispatch(setTheme(userData.preferences.theme));
    }
  };

  const logout = () => {
    setUser(null);
    dispatch(setTheme("system"));
  };

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      setUser,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
