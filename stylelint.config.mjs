/** Block, block__element, block--modifier, block__element--modifier; words joined by `-`. */
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
    // Font family names keep their usual spelling.
    'value-keyword-case': [
      'lower',
      { ignoreProperties: ['$font-family-inter', '$font-family-base'] },
    ],
    'declaration-no-important': true,
    'color-no-hex': true,
    // Colors, type and layers come from the tokens in shared/styles/abstracts.
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
      // The tokens themselves.
      files: ['src/shared/styles/abstracts/**'],
      rules: { 'color-no-hex': null, 'scale-unlimited/declaration-strict-value': null },
    },
    {
      // Reaches into MAX UI's generated markup, which only `!important` can override.
      files: ['src/shared/styles/base/_max-ui-overrides.scss'],
      rules: { 'declaration-no-important': null, 'selector-class-pattern': null },
    },
  ],
};
