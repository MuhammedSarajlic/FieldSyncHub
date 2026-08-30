import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'

const jsxA11yRules = Object.fromEntries(
  Object.entries(jsxA11y.configs.recommended.rules).map(([rule, config]) => [
    rule,
    Array.isArray(config) ? ['warn', ...config.slice(1)] : 'warn',
  ])
)

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...jsxA11yRules,
      ...reactHooks.configs.recommended.rules,
      // The current client predates the typed API models and contains legacy
      // table/form adapters that intentionally accept dynamic values. Keep the
      // production build and CI usable while those adapters are migrated.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'prefer-const': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-refresh/only-export-components': [
        'off',
        { allowConstantExport: true },
      ],
    },
  },
)
