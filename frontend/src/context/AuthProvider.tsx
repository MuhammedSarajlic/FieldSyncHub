import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  ReactNode,
} from 'react';
import { GetLoggedInUser } from '../services/User';
import { GetWorkspaceById } from '../services/Workspace';
import { TContext } from '../types/Context';
import { TUser } from '../types/User';
import { Logout } from '../services/Auth';
import { getStoredToken, clearStoredToken } from '../utils/AuthHelpers/tokenStorage';

const AuthContext = createContext<TContext | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<TUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    getStoredToken()
  );
  const [loading, setLoading] = useState(true);

  const hydrateUserWorkspace = async (currentUser: TUser) => {
    if (!currentUser.workspace?.id) {
      localStorage.removeItem('workspaceCurrency');
      return currentUser;
    }

    try {
      const workspaceResponse = await GetWorkspaceById(currentUser.workspace.id);
      if (workspaceResponse.status === 200) {
        localStorage.setItem(
          'workspaceCurrency',
          workspaceResponse.data.payload.currency || 'USD'
        );

        return {
          ...currentUser,
          workspace: workspaceResponse.data.payload,
        };
      }
    } catch (error) {
      console.error(error);
    }

    return currentUser;
  };

  const fetchCurrentUser = async () => {
    setLoading(true);
    try {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await GetLoggedInUser(token);

      if (response.status === 200) {
        setUser(await hydrateUserWorkspace(response.data.payload));
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

  // Re-fetches the current user without touching loading/redirect state,
  // used after mutations (e.g. workspace creation) that change data on the
  // user object but shouldn't re-trigger the initial full-page loading spinner.
  const refetchUser = async () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const response = await GetLoggedInUser(token);
      if (response.status === 200) {
        setUser(await hydrateUserWorkspace(response.data.payload));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const logout = async () => {
    await Logout();
    clearStoredToken();
    setUser(null);
    setAccessToken(null);
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        setAccessToken,
        logout,
        loading,
        refetchUser,
      }}
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
