import axios from 'axios';
import {
  getStoredToken,
  clearStoredToken,
  setStoredToken,
} from '../utils/AuthHelpers/tokenStorage';
import toast from 'react-hot-toast';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '/api',
  withCredentials: true,
});

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL || '/api'}/auth/refresh`,
      null,
      {
        withCredentials: true,
      }
    );
    const { accessToken } = response.data;

    // Whichever storage already held a token for this session is the one
    // that should keep holding it - a silent refresh shouldn't change
    // whether the session persists across browser restarts.
    const rememberMe = !!localStorage.getItem('accessToken');
    setStoredToken(accessToken, rememberMe);
    return accessToken;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    return null;
  }
};

const handleRefreshFailure = () => {
  clearStoredToken();
  const returnTo = `${window.location.pathname}${window.location.search}`;
  sessionStorage.setItem('sessionExpiredReturnTo', returnTo);
  window.dispatchEvent(new Event('fieldsync:session-expired'));
  toast.error('Your session expired. Please sign in again.');
  if (!window.location.pathname.startsWith('/signin')) {
    window.location.assign(`/signin?returnTo=${encodeURIComponent(returnTo)}`);
  }
};

// The refresh endpoint now rotates and revokes the presented refresh token,
// so two 401s that each independently call refreshAccessToken() race it:
// whichever loses is told its (already-rotated) token is revoked and signs
// the user out mid-session. Every concurrent caller instead awaits this one
// in-flight promise, so exactly one request ever reaches /auth/refresh, and
// - because a promise's .then only ever runs once no matter how many places
// await it - handleRefreshFailure() (and its toast) fires at most once too.
let refreshPromise: Promise<string | null> | null = null;

const ensureAccessToken = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
      .then((accessToken) => {
        if (!accessToken) {
          handleRefreshFailure();
        }
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccessToken = await ensureAccessToken();

      if (newAccessToken) {
        // Re-read from storage instead of trusting the value this call of
        // ensureAccessToken() resolved with - by the time a queued request
        // actually retries, a later refresh cycle may have already replaced it.
        const currentToken = getStoredToken();
        originalRequest.headers.Authorization = `Bearer ${currentToken}`;
        return instance(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

let proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null;
let proactiveRefreshScheduledForToken: string | null = null;

const decodeTokenExpiryMs = (token: string): number | null => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

// Purely reactive refresh means every user eats a 401 on the first request
// that lands after the access token's ~15 minute lifetime - once per token
// per user, several times an hour. Refreshing proactively at ~80% of that
// lifetime keeps the reactive path a rare fallback instead of the common case.
const scheduleProactiveRefresh = (token: string) => {
  if (token === proactiveRefreshScheduledForToken) return;
  proactiveRefreshScheduledForToken = token;

  if (proactiveRefreshTimer) {
    clearTimeout(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
  }

  const expiresAt = decodeTokenExpiryMs(token);
  if (expiresAt == null) return;

  const delay = (expiresAt - Date.now()) * 0.8;
  if (delay <= 0) return;

  proactiveRefreshTimer = setTimeout(() => {
    ensureAccessToken();
  }, delay);
};

instance.interceptors.request.use(
  (config) => {
    const accessToken = getStoredToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      scheduleProactiveRefresh(accessToken);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
