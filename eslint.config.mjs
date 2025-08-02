// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      import: importPlugin,
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
        // Boolean variables - prefixed with is/has/should/can/did/will
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['camelCase'],
          prefix: ['is', 'has', 'should', 'can', 'did', 'will', 'was', 'are', 'were'],
          leadingUnderscore: 'allow'
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
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ],
      'import/no-duplicates': 'error',
      
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
      
      // Additional type safety rules
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
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
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
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
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      // Relax some rules for tests
      '@typescript-eslint/no-explicit-any': 'warn',
      'max-params': 'off',
    }
  },
  {
    // Ignore build output and common directories
    ignores: ['build/**', 'dist/**', 'node_modules/**', 'coverage/**', 'eslint.config.mjs'],
  }
);