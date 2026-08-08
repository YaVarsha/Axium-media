import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

const getStoredToken = () =>
  localStorage.getItem("accessToken") || localStorage.getItem("token");

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(getStoredToken);

  useEffect(() => {
    const syncStoredToken = () => setAccessToken(getStoredToken());

    window.addEventListener("storage", syncStoredToken);
    window.addEventListener("auth:logout", syncStoredToken);

    return () => {
      window.removeEventListener("storage", syncStoredToken);
      window.removeEventListener("auth:logout", syncStoredToken);
    };
  }, []);

  const runAuthAction = useCallback(async (action) => {
    setLoading(true);

    try {
      const response = await action();
      setAccessToken(getStoredToken());
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    loading,
    isAuthenticated: Boolean(accessToken),
    register: (data) => runAuthAction(() => authService.register(data)),
    setPassword: (data) => runAuthAction(() => authService.setPassword(data)),
    login: (data) => runAuthAction(() => authService.login(data)),
    forgotPassword: (data) => runAuthAction(() => authService.forgotPassword(data)),
    resetPassword: (data) => runAuthAction(() => authService.resetPassword(data)),
    logout: () => {
      authService.logout();
      setAccessToken(null);
      window.dispatchEvent(new Event("auth:logout"));
    }
  }), [accessToken, loading, runAuthAction]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// A context provider and its consumer hook intentionally share this module.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
