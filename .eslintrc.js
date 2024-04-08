module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: 'standard',
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'import/no-unresolved': 0,
    'no-restricted-globals': 0,
    'import/extensions': 0,
    'no-prototype-builtins': 0,
    'semi': 1,
    'quotes': 2
  },
  globals: {
    "__ENV": "readonly"
  },
}
