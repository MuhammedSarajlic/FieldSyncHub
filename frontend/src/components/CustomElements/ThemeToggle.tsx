import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type='button'
      role='switch'
      aria-checked={isDark}
      aria-label='Toggle dark mode'
      onClick={toggleTheme}
      className='flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
    >
      {isDark ? (
        <Moon className='w-4 h-4 flex-shrink-0' />
      ) : (
        <Sun className='w-4 h-4 flex-shrink-0' />
      )}
      <span className='flex-1 text-left'>
        {isDark ? 'Dark mode' : 'Light mode'}
      </span>
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          isDark ? 'bg-bg-primary' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isDark ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  );
};

export default ThemeToggle;
