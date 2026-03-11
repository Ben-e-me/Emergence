/**
 * @file eslint.config.cjs
 * @description Flat ESLint configuration for the Emergence project (ESLint v9+).
 * @architecture
 * - Mirrors the legacy .eslintrc rules in the new flat config format.
 * - Enables React and hooks linting across the src tree.
 */
const eslintPluginReact = require('eslint-plugin-react');
const eslintPluginReactHooks = require('eslint-plugin-react-hooks');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    ignores: ['dist', 'node_modules'],
  },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...eslintPluginReact.configs.recommended.rules,
      ...eslintPluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
];

