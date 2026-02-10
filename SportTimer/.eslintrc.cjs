module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Disable the base ESLint rule as it can report incorrect errors with TypeScript
    'no-unused-vars': 'off',
    // Enable the TypeScript-specific rule with more precise configuration
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'after-used', // Don't check arguments that are used
        vars: 'all',       // Check all variables
        varsIgnorePattern: '^_', // Ignore variables that start with _
        argsIgnorePattern: '^_', // Ignore arguments that start with _
        caughtErrors: 'all', // Check caught errors
        caughtErrorsIgnorePattern: '^_', // Ignore caught errors that start with _
        ignoreRestSiblings: true, // Ignore rest siblings in object destructuring
      },
    ],
  },
}

