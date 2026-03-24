import antfu from '@antfu/eslint-config'

export default await antfu(
  {
    // Enable core features
    type: 'app',
    typescript: true,

    formatters: true,
    pnpm: true,

    // Stylistic rules
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: false,
    },

    ignores: ['.pnpm-store/**'],
  },

  {
    rules: {
      'ts/no-redeclare': 'off',
      'ts/consistent-type-definitions': ['error', 'type'],
      'no-console': ['warn'],

      'n/prefer-global/process': 'error',
      'node/prefer-global/process': 'off',

      'n/no-process-env': 'error',
      'node/no-process-env': 'off',

      'antfu/no-top-level-await': ['off'],
      'unicorn/filename-case': ['error', {
        case: 'pascalCase',
        ignore: ['^[^/]+$'],
      }],
    },
  },
)
