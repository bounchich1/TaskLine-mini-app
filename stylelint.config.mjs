const BEM = '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$';

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  plugins: ['stylelint-declaration-strict-value'],
  ignoreFiles: ['dist/**', 'node_modules/**', 'test-results/**', 'playwright-report/**'],
  rules: {
    'selector-class-pattern': [
      BEM,
      { message: 'Class names follow BEM: block__element--modifier.' },
    ],
    'max-nesting-depth': 3,
    'selector-max-compound-selectors': 3,
    'selector-max-id': 0,
    'value-keyword-case': [
      'lower',
      { ignoreProperties: ['$font-family-base', '$font-family-mono'] },
    ],
    'declaration-no-important': true,
    'color-no-hex': true,
    'scale-unlimited/declaration-strict-value': [
      ['/color$/', 'fill', 'stroke', 'z-index', 'font-size', 'font-family', 'font-weight'],
      {
        ignoreValues: ['currentcolor', 'transparent', 'inherit', 'initial', 'unset', 'none', '0'],
        expandShorthand: true,
      },
    ],
  },
  overrides: [
    {
      files: ['src/shared/styles/abstracts/**'],
      rules: { 'color-no-hex': null, 'scale-unlimited/declaration-strict-value': null },
    },
    {
      files: ['src/shared/styles/base/_max-ui-overrides.scss'],
      rules: { 'declaration-no-important': null, 'selector-class-pattern': null },
    },
  ],
};
