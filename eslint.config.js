// @ts-check
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import prettier from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import boundaries from 'eslint-plugin-boundaries';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const publicApi = (/** @type {string} */ type) => ({
    element: { type, fileInternalPath: 'index.ts' },
});

const SPACED_STATEMENTS = [
    'multiline-const',
    'multiline-let',
    'multiline-expression',
    'multiline-export',
    'multiline-type',
    'block-like',
    'class',
    'interface',
];

const jsxNewline = stylistic.rules['jsx-newline'];

const hasInlineText = (node) =>
    node.parent.children.some((child) => child.type === 'JSXText' && child.value.trim() !== '');

const jsxBlockNewline = {
    ...jsxNewline,
    create: (context) =>
        jsxNewline.create(
            Object.create(context, {
                report: {
                    value: (descriptor) => {
                        if (!hasInlineText(descriptor.node)) {
                            context.report(descriptor);
                        }
                    },
                },
            }),
        ),
};

export default tseslint.config(
    {
        ignores: ['dist/**', 'node_modules/**', 'test-results/**', 'playwright-report/**'],
    },
    js.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    react.configs.flat.recommended,
    react.configs.flat['jsx-runtime'],
    reactHooks.configs.flat.recommended,
    jsxA11y.flatConfigs.recommended,
    {
        languageOptions: {
            globals: globals.browser,
            parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
        },
        settings: {
            react: { version: 'detect' },
            'jsx-a11y': { components: { Select: 'select', DictionarySelect: 'select' } },
        },
    },
    prettier,

    {
        plugins: {
            '@stylistic': stylistic,
            local: { rules: { 'jsx-block-newline': jsxBlockNewline } },
            'import-x': importX,
            unicorn,
            'react-refresh': reactRefresh,
        },
        settings: {
            'import-x/resolver-next': [createTypeScriptImportResolver()],
        },
        rules: {
            'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
            'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
            complexity: ['error', 12],
            'max-depth': ['error', 3],
            'max-nested-callbacks': ['error', 3],
            '@typescript-eslint/max-params': ['error', { max: 4 }],
            '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
            'max-statements-per-line': ['error', { max: 1 }],
            'max-len': [
                'error',
                {
                    code: 120,
                    ignoreUrls: true,
                    ignoreRegExpLiterals: true,
                    ignoreTemplateLiterals: true,
                    ignoreStrings: false,
                    ignorePattern: String.raw`^\s*<path d="`,
                },
            ],
            curly: ['error', 'all'],
            'no-nested-ternary': 'error',
            '@stylistic/padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: '*', next: 'return' },
                { blankLine: 'always', prev: ['const', 'let'], next: '*' },
                {
                    blankLine: 'any',
                    prev: ['singleline-const', 'singleline-let'],
                    next: ['singleline-const', 'singleline-let'],
                },
                { blankLine: 'always', prev: '*', next: SPACED_STATEMENTS },
                { blankLine: 'always', prev: SPACED_STATEMENTS, next: '*' },
            ],
            '@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
            'local/jsx-block-newline': ['error', { prevent: true, allowMultilines: true }],
            'id-length': ['error', { min: 2, exceptions: ['_', 'i', 'j', 'x', 'y'], properties: 'never' }],
            '@typescript-eslint/consistent-type-definitions': 'off',
            '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
            '@typescript-eslint/consistent-type-exports': 'error',
            'import-x/no-cycle': 'error',
            'import-x/no-self-import': 'error',
            'import-x/no-duplicates': ['error', { 'prefer-inline': true }],
            'import-x/no-useless-path-segments': 'error',
            'import-x/no-default-export': 'error',
            'import-x/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', ['sibling', 'index']],
                    pathGroups: [{ pattern: '@/**', group: 'internal' }],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true },
                },
            ],
            'no-restricted-imports': [
                'error',
                { patterns: [{ group: ['../../*'], message: 'Use the @/ alias instead of ../../.' }] },
            ],
            'unicorn/filename-case': ['error', { cases: { kebabCase: true, pascalCase: true } }],
            'react/no-multi-comp': 'error',
            'react/jsx-max-depth': ['error', { max: 6 }],
            'react/jsx-no-leaked-render': 'error',
            'react/jsx-no-useless-fragment': 'error',
            'react-refresh/only-export-components': 'error',
            'react-hooks/incompatible-library': 'off',
        },
    },
    {
        files: ['**/*.tsx'],
        rules: {
            'max-lines-per-function': ['error', { max: 120, skipBlankLines: true, skipComments: true }],
        },
    },

    {
        files: ['src/**/*.{ts,tsx}'],
        plugins: { boundaries },
        settings: {
            'import/resolver': { typescript: { alwaysTryTypes: true } },
            'boundaries/include': ['src/**/*.{ts,tsx}'],
            'boundaries/ignore': ['src/vite-env.d.ts'],
            'boundaries/elements': [
                { type: 'app', pattern: 'src/app', partialMatch: false },
                { type: 'feature', pattern: 'src/features/*', capture: ['name'], partialMatch: false },
                { type: 'shared', pattern: 'src/shared', partialMatch: false },
            ],
        },
        rules: {
            'boundaries/no-unknown-files': 'error',
            'boundaries/dependencies': [
                'error',
                {
                    default: 'disallow',
                    message:
                        'Architecture boundary: features are importable only via their index.ts, shared ' +
                        'code never imports features, and features never import the app. See ARCHITECTURE.md.',
                    policies: [
                        { allow: { to: { module: { origin: ['external', 'core'] } } } },
                        { allow: { dependency: { relationship: { to: 'internal' } } } },
                        {
                            from: { element: { type: 'shared' } },
                            allow: { to: { element: { type: 'shared' } } },
                        },
                        {
                            from: { element: { type: 'feature' } },
                            allow: { to: [{ element: { type: 'shared' } }, publicApi('feature')] },
                        },
                        {
                            from: { element: { type: 'app' } },
                            allow: {
                                to: [{ element: { type: 'shared' } }, publicApi('feature')],
                            },
                        },
                    ],
                },
            ],
        },
    },

    {
        files: ['tests/**/*.ts'],
        rules: {
            'max-lines-per-function': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            'react-hooks/rules-of-hooks': 'off',
        },
    },
    {
        files: ['**/*.{js,mjs}'],
        extends: [tseslint.configs.disableTypeChecked],
    },
    {
        files: ['eslint.config.js', 'vite.config.ts', 'playwright.config.ts', 'stylelint.config.mjs'],
        rules: { 'import-x/no-default-export': 'off' },
    },
);
