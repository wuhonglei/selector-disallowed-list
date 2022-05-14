// @ts-nocheck

'use strict';

const stylelint = require('stylelint');
const normalizeSelector = require('normalize-selector');
const resolveNestedSelector = require('postcss-resolve-nested-selector');

const isStandardSyntaxRule = require('./utils/isStandardSyntaxRule');
const isStandardSyntaxSelector = require('./utils/isStandardSyntaxSelector');
const { isString, isRegExp } = require('./utils/validateTypes');
const { report, validateOptions, ruleMessages } = stylelint.utils;

const { name: ruleName } = require('./package.json');

const messages = ruleMessages(ruleName, {
  rejected: (selector) => `Unexpected AdBlock selector "${selector}"`
});

function rule(pattern) {
  const list = [].concat(pattern);

  return (root, result) => {
    const validOptions = validateOptions(result, ruleName, {
      actual: list,
      possible: [isRegExp, isString]
    });

    if (!validOptions) {
      return;
    }

    root.walkRules((ruleNode) => {
      if (!isStandardSyntaxRule(ruleNode)) {
        return;
      }
      // when use .foo,.bar{}, the selectors will be ['.foo', '.bar']
      ruleNode.selectors.forEach((selector) => {
        resolveNestedSelector(selector, ruleNode).forEach((nestedSelector) => {
          if (!isStandardSyntaxSelector(nestedSelector)) {
            return;
          }

          checkSelector(nestedSelector, ruleNode);
        });
      });
    });

    function checkSelector(fullSelector, ruleNode) {
      if (!matchesStringOrRegExp(fullSelector, list)) {
        return;
      }
      report({
        result,
        ruleName,
        message: messages.rejected(ruleNode.selector),
        node: ruleNode
      });
    }
  };
}

function matchesStringOrRegExp(selector, list) {
  const newSelector = normalizeSelector(selector);

  return list.some((comparison) => {
    if (isString(comparison)) {
      return newSelector.endsWith(comparison);
    }

    if (isRegExp(comparison)) {
      return comparison.test(newSelector);
    }

    return false;
  });
}

rule.primaryOptionArray = true;
rule.ruleName = ruleName;
rule.messages = messages;

module.exports = stylelint.createPlugin(ruleName, rule);
