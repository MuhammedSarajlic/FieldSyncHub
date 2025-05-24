import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  ReactNode,
} from 'react';
import { GetLoggedInUser } from '../services/User';
import { TContext } from '../types/Context';
import { TUser } from '../types/User';
import { Logout } from '../services/Auth';

const AuthContext = createContext<TContext | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<TUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  );
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    console.log('This shit fetching again');

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await GetLoggedInUser(token);
      console.log('Fetching...');

      if (response.status === 200) {
        setUser(response.data.payload);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await Logout();
    localStorage.removeItem('accessToken');
    setUser(null);
    setAccessToken(null);
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, accessToken, setAccessToken, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): TContext => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
