// "Remember me" storage strategy: persist the access token in localStorage
// (survives closing the browser) when remembered, or sessionStorage
// (cleared when the browser closes) otherwise. Reads check both so a page
// reload finds the token regardless of which one holds it.
const TOKEN_KEY = 'accessToken';

export const setStoredToken = (token: string, rememberMe: boolean) => {
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getStoredToken = (): string | null => {
  return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
};

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};
