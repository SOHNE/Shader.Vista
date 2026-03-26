import antfu from '@antfu/eslint-config'

export default await antfu(
  {
    // Enable core features
    type: 'app',
    typescript: true,
    vue: true,
    unocss: true,
    formatters: true,
    pnpm: true,

    // Stylistic rules
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: false,
    },

    regexp: {
      overrides: {
        'regexp/no-empty-capturing-group': 'off',
        'regexp/no-empty-group': 'off',
      },
    },

    ignores: [
      '.pnpm-store/**',
      'docs/.vitepress/cache/**',

      // CSS
      'playground/src/main.css',
    ],
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

      'antfu/no-top-level-await': 'off',
      'pnpm/yaml-enforce-settings': 'off',
      'pnpm/yaml-no-unused-catalog-item': 'off',
      'unicorn/filename-case': ['error', {
        case: 'pascalCase',
        ignore: ['^[^/]+$'],
      }],

      'style/jsx-child-element-spacing': 'off',
      'ts/no-invalid-void-type': 'off',
    },
  },
  {
    files: [
      'playground/**/*.?([mc])ts',
    ],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: [
      '*.d.ts',
    ],
    rules: {
      'unused-imports/no-unused-vars': 'off',
      'eslint-comments/no-unlimited-disable': 'off',
    },
  },
  {
    files: [
      '**/*.md/*.[jt]s',
    ],
    rules: {
      'no-restricted-imports': 'off',
      'no-restricted-syntax': 'off',
      'no-labels': 'off',
      'ts/no-unused-vars': 'off',
      'ts/no-var-requires': 'off',
    },
  },
  {
    files: [
      'pnpm-workspace.yaml',
    ],
    rules: {
      'pnpm/yaml-enforce-settings': 'off',
    },
  },
  {
    files: [
      'docs/index.md',
    ],
    rules: {
      'markdown/no-space-in-emphasis': 'off',
    },
  },
)
