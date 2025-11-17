import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';
import { type User, getCurrentUser, logout as logoutApi, updatePreferences as updatePreferencesApi } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  updateLanguage: (language: 'ka' | 'en') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'buildapp_auth_token';
const USER_KEY = 'buildapp_user';

interface JWTPayload {
  userId: string;
  phone: string;
  userType?: string;
  exp: number;
  iat: number;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { i18n } = useTranslation();

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          // Check if token is expired
          if (isTokenExpired(storedToken)) {
            // Token expired, clear storage
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setIsLoading(false);
            return;
          }

          // Verify token with server
          try {
            const response = await getCurrentUser(storedToken);
            setToken(storedToken);
            setUser(response.user);
            // Update stored user with fresh data
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));
            // Sync language with i18next
            if (response.user.language && response.user.language !== i18n.language) {
              i18n.changeLanguage(response.user.language);
            }
          } catch (error) {
            // Token invalid, clear storage
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear storage on error
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Check token expiry periodically
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    // Sync language with i18next
    if (newUser.language && newUser.language !== i18n.language) {
      i18n.changeLanguage(newUser.language);
    }
  };

  const logout = async () => {
    if (token) {
      // Call logout API (silently fails if error)
      await logoutApi(token);
    }

    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  const updateLanguage = async (language: 'ka' | 'en') => {
    if (!token) {
      // Just update i18next if not logged in
      i18n.changeLanguage(language);
      return;
    }

    try {
      // Update on server
      const response = await updatePreferencesApi(token, { language });

      // Update local state
      setUser(response.user);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));

      // Update i18next
      i18n.changeLanguage(language);
    } catch (error) {
      console.error('Failed to update language:', error);
      // Still update i18next locally
      i18n.changeLanguage(language);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    updateUser,
    updateLanguage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
