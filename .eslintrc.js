module.exports = {
  extends: 'erb',
  plugins: ['@typescript-eslint'],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-import-module-exports': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/function-component-definition': 'off',
    'react/no-unknown-property': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'no-use-before-define': 'off',
    'no-restricted-syntax': 'off',
    'no-prototype-builtins': 'off',
    'no-promise-executor-return': 'off',
    'no-plusplus': 'off',
    'no-loop-func': 'off',
    'import/prefer-default-export': 'off',
    'default-case': 'off',
    'object-shorthand': 'off',
    'consistent-return': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
      typescript: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
