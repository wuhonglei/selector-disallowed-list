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
      const selector = ruleNode.selector;

      if (!isStandardSyntaxRule(ruleNode)) {
        return;
      }

      // Only bother resolving selectors that have an interpolating &
      if (hasInterpolatingAmpersand(selector)) {
        resolveNestedSelector(selector, ruleNode).forEach((nestedSelector) => {
          if (!isStandardSyntaxSelector(nestedSelector)) {
            return;
          }

          checkSelector(nestedSelector, ruleNode);
        });
      } else {
        checkSelector(selector, ruleNode);
      }
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

// An "interpolating ampersand" means an "&" used to interpolate
// within another simple selector, rather than an "&" that
// stands on its own as a simple selector
function hasInterpolatingAmpersand(selector) {
  for (let i = 0, l = selector.length; i < l; i++) {
    if (selector[i] !== '&') {
      continue;
    }

    if (selector[i - 1] !== undefined && !isCombinator(selector[i - 1])) {
      return true;
    }

    if (selector[i + 1] !== undefined && !isCombinator(selector[i + 1])) {
      return true;
    }
  }

  return false;
}

function isCombinator(x) {
  return /[\s+>~]/.test(x);
}

function matchesStringOrRegExp(selector, list) {
  const newSelector = normalizeSelector(selector);
  return list.some((comparison) => newSelector.endsWith(comparison));
}

rule.primaryOptionArray = true;
rule.ruleName = ruleName;
rule.messages = messages;

module.exports = stylelint.createPlugin(ruleName, rule);
