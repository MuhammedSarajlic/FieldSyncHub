import { TUser } from './User';

export type TContext = {
  user?: TUser | null;
  setUser?: React.Dispatch<React.SetStateAction<TUser | null>>;
  accessToken: string | null;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  logout: () => void;
  loading?: boolean;
  refetchUser: () => Promise<void>;
};
