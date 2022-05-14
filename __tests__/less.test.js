'use strict';

const { getTestRule } = require('jest-preset-stylelint');

const testRule = getTestRule({ plugins: ['./'] });

const {
  rule: { messages, ruleName }
} = require('..');

testRule({
  ruleName,
  customSyntax: 'postcss-less',
  config: ['a > .foo', '.foo-bar', /\[data-.+\]/],
  accept: [
    {
      code: 'a {}'
    },
    {
      code: '.foo {}'
    },
    {
      code: '.foo { a {} }'
    },
    {
      code: '.data-auto {}'
    },
    {
      code: 'a[href] {}'
    }
  ],
  reject: [
    {
      description: '是否能够解析 less 嵌套语法',
      code: 'a { & > .foo {} }',
      message: messages.rejected('& > .foo'),
      line: 1,
      column: 5
    },
    {
      code: '.bar > a > .foo {}',
      message: messages.rejected('.bar > a > .foo'),
      line: 1,
      column: 1
    },
    {
      code: 'a > .foo,.bar {}',
      message: messages.rejected('a > .foo,.bar'),
      line: 1,
      column: 1
    },
    {
      code: '.foo{&-bar{}}',
      message: messages.rejected('&-bar'),
      line: 1,
      column: 6
    },
    {
      code: '.foo, [data-auto="1"] {}',
      message: messages.rejected('.foo, [data-auto="1"]'),
      line: 1,
      column: 1
    }
  ]
});
