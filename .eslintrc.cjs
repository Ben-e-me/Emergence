/**
 * @file .eslintrc.cjs
 * @description ESLint configuration for the Emergence project.
 * @architecture
 * - Enforces React best practices and hooks rules.
 * - Integrates with Prettier by deferring stylistic concerns where necessary.
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
  ignorePatterns: ['dist', 'node_modules'],
};

