module.exports = {
  root: true,
  defaultSeverity: 'error',
  plugins: ['stylelint-order', 'stylelint-less'],
  extends: [
    'stylelint-config-standard',
    'stylelint-config-html/html',
    'stylelint-config-html/vue',
    'stylelint-config-recess-order',
  ],
  rules: {
    'import-notation': 'string', // 要求 @import './common.less'; 后面必须是字符串，而不是 url('xxx')
    'block-opening-brace-newline-after': 'always', // 要求在块的开大括号之后必须有换行符。
    'block-closing-brace-newline-before': 'always', // 要求在块的关闭大括号之前必须有换行符。
    'no-descending-specificity': null, // 禁止在覆盖高特异性选择器之后出现低特异性选择器
    'no-empty-source': null, // 禁止空源码
    'font-family-no-missing-generic-family-keyword': null, // 禁止字体族中缺少泛型族关键字
    'at-rule-no-unknown': [
      true, // 禁止未知的@规则
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen', 'function', 'if', 'each', 'include', 'mixin'],
      },
    ],
    'function-no-unknown': null, // 不允许未知函数
    'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }], // 不允许未知单位
    'selector-no-vendor-prefix': null, // 不允许选择器使用供应商前缀
    'keyframes-name-pattern': null, // 指定关键帧名称的模式
    'selector-class-pattern': null, // 指定类选择器的模式
    'value-no-vendor-prefix': null, // 不允许值使用供应商前缀
    'rule-empty-line-before': ['always', { ignore: ['after-comment', 'first-nested'] }], // 要求或禁止在规则之前的空行
    'string-quotes': 'single', // 指定字符串使用单引号
    'at-rule-name-case': 'lower', // 指定@规则名的大小写
    'indentation': [2, { severity: 'warning' }], // 指定缩进
  },
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts'],
  overrides: [
    {
      files: ['*.vue', '**/*.vue', '*.html', '**/*.html'],
      customSyntax: 'postcss-html',
      rules: {
        'keyframes-name-pattern': null,
        'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['deep', 'v-bind', 'global'] }], // 禁止未知的伪类选择器
        'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: ['v-deep', 'v-global', 'v-slotted'] }], // 禁止未知的伪元素选择器
      },
      extends: ['stylelint-config-recommended-vue'],

    },
    {
      files: ['*.less', '**/*.less'],
      customSyntax: 'postcss-less',
      rules: {
        'less/color-no-invalid-hex': true,
        'less/no-duplicate-variables': true,
      },
    },
  ],
}
