import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

  const queryClient = useQueryClient();
  const currentUserQuery = useQuery({
    queryKey: ['auth', 'current-user', accessToken],
    enabled: Boolean(accessToken),
    staleTime: 60_000,
    retry: false,
    queryFn: async () => {
      const response = await GetLoggedInUser(accessToken!);
      if (response.status !== 200) return null;
      return hydrateUserWorkspace(response.data.payload);
    },
  });

  useEffect(() => {
    setUser(currentUserQuery.data ?? null);
  }, [currentUserQuery.data]);

  // Use the query result immediately so route guards do not see a false
  // unauthenticated frame while the mirrored user state catches up.
  const resolvedUser = currentUserQuery.data ?? user;

  // Re-fetches the current user without touching loading/redirect state,
  // used after mutations (e.g. workspace creation) that change data on the
  // user object but shouldn't re-trigger the initial full-page loading spinner.
  const refetchUser = async () => {
    await currentUserQuery.refetch();
  };

  const logout = async () => {
    await Logout();
    clearStoredToken();
    setUser(null);
    setAccessToken(null);
    queryClient.removeQueries({ queryKey: ['auth', 'current-user'] });
  };

  useEffect(() => {
    const handleSessionExpired = () => {
      clearStoredToken();
      setAccessToken(null);
      setUser(null);
      queryClient.removeQueries({ queryKey: ['auth', 'current-user'] });
    };

    window.addEventListener('fieldsync:session-expired', handleSessionExpired);
    return () =>
      window.removeEventListener('fieldsync:session-expired', handleSessionExpired);
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user: resolvedUser,
        setUser,
        accessToken,
        setAccessToken,
        logout,
        loading: Boolean(accessToken) && currentUserQuery.isLoading,
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
