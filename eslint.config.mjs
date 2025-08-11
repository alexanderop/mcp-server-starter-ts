// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import sonarjs from 'eslint-plugin-sonarjs';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['tests/*.ts', 'tests/*.test.ts', 'tests/helpers/*.ts'],
          maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 10,
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      import: importPlugin,
      sonarjs: sonarjs,
    },
    rules: {
      // Type Safety Rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-non-null-assertion': 'error',
      
      // Require type imports to be separate
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
        disallowTypeAnnotations: true
      }],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      
      // Prevent enums - use const assertions or literal types
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Use const assertions or literal types instead of enums. See: https://www.typescriptlang.org/docs/handbook/enums.html#const-enums'
        }
      ],
      
      // Array type syntax - use generic syntax
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
      
      // Function Rules
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
        allowDirectConstAssertionInArrowFunctions: true,
      }],
      
      // Prefer single object parameter for functions with multiple arguments
      'max-params': ['warn', { max: 3 }],
      
      // Complexity rule - limit cyclomatic complexity
      'complexity': ['error', { max: 10, variant: 'classic' }],
      
      // Naming Conventions
      '@typescript-eslint/naming-convention': [
        'error',
        // Variables - camelCase
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'forbid'
        },
        // Constants - UPPER_CASE
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow'
        },
        // Functions - camelCase
        {
          selector: 'function',
          format: ['camelCase'],
          leadingUnderscore: 'allow'
        },
        // Types/Interfaces - PascalCase
        {
          selector: 'typeLike',
          format: ['PascalCase']
        },
        // Type parameters - T followed by PascalCase
        {
          selector: 'typeParameter',
          format: ['PascalCase'],
          prefix: ['T']
        },
        // Enum members would be PascalCase (but we're preventing enums)
        {
          selector: 'enumMember',
          format: ['UPPER_CASE']
        }
      ],
      
      // Import/Export Rules
      'import/no-default-export': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'object',
            'type'
          ],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ],
      'import/no-duplicates': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
      
      // Error suppression - ban @ts-ignore, allow @ts-expect-error with description
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': true,
          'ts-expect-error': 'allow-with-description',
          'ts-nocheck': true,
          'ts-check': false,
          minimumDescriptionLength: 10
        }
      ],
      
      // Disallow all comments
      'no-warning-comments': 'error',
      'no-inline-comments': 'error',
      'multiline-comment-style': ['error', 'starred-block'],
      'spaced-comment': 'error',
      
      // Additional type safety rules
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      
      // Exhaustiveness and correctness
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-confusing-void-expression': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'consistent-return': 'error',
      
      // Immutability
      'no-param-reassign': ['error', { props: true }],
      
      // Type style preferences
      '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
      
      // Code quality and complexity
      'sonarjs/no-duplicate-string': 'error',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/cognitive-complexity': ['error', 15],
      '@typescript-eslint/strict-boolean-expressions': ['error', {
        allowString: false,
        allowNumber: false,
        allowNullableObject: false,
        allowNullableBoolean: false,
        allowNullableString: false,
        allowNullableNumber: false,
        allowAny: false
      }],
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        args: 'all',
        argsIgnorePattern: '^_',
        vars: 'all',
        varsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: false,
        reportUsedIgnorePattern: true,
      }],
      
      // Prefer const assertions
      '@typescript-eslint/prefer-as-const': 'error',
      
      // Require using `type` keyword for type-only exports
      '@typescript-eslint/consistent-type-exports': ['error', {
        fixMixedExportsWithInlineTypeSpecifier: true
      }],
      
      // Disallow unnecessary type arguments
      '@typescript-eslint/no-unnecessary-type-arguments': 'error',
      
      // Enforce template literal types where applicable
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      
      // Enforce using unknown instead of any
      '@typescript-eslint/no-unsafe-declaration-merging': 'error',
      
      // Disable some rules that conflict with the style guide
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
    },
  },
  {
    // Apply different rules for test files
    files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*.ts'],
    rules: {
      // Relax some rules for tests
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'off',
      'max-params': 'off',
      // Duplicate strings are common in tests
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-identical-functions': 'off',
    }
  },
  {
    // Allow default exports for registerable modules
    files: ['src/tools/*.ts', 'src/resources/*.ts', 'src/prompts/*.ts', 'examples/*.ts'],
    rules: {
      'import/no-default-export': 'off',
    }
  },
  {
    // Ignore build output and common directories
    ignores: ['build/**', 'dist/**', 'node_modules/**', 'coverage/**', 'docs/**', 'examples/**', 'eslint.config.mjs', 'dev.js', '_templates/**'],
  }
);