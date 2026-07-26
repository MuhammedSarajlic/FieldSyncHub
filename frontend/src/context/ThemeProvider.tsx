import { createContext, useContext, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

// Dark mode is disabled for now: only the sidebar/navbar shell has dark
// styling, so switching to dark left every page's content still light,
// which looked broken. Forcing 'light' here (and no-op-ing the setters)
// turns it off app-wide without ripping out the groundwork - re-enable by
// restoring the state/localStorage/workspace-sync logic once real
// per-page dark styling exists.
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme: Theme = 'light';

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  const setTheme = () => {};
  const toggleTheme = () => {};

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
