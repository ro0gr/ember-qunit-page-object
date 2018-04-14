import {
  camelize,
  decamelize
} from '@ember/string';

import {
  parseKey,
  buildFullPath
} from './-utils';

import {
  is,
  equal,
  contains
} from './-utils/validators';

import not from './-utils/not';

export class Assertions {
  constructor(pageObject, testContext) {
    const getterNames = pageObject.__getterNames__;
    const readMethodNames = pageObject.__readMethodNames__;

    this.__po__ = pageObject;
    this.__testContext__ = testContext;

    this.not = {};

    getterNames.forEach(key => {
      const { leader, rest } = parseKey(key);

      if (rest && rest.length) {
        if (['is', 'has'].includes(leader)) {
          this._addAssertion(key, key, is);
        } else {
          this._addAssertion(key, addPrefix('has', key), equal);
        }
      }
    });

    readMethodNames.forEach(key => {
      const { leader, rest } = parseKey(key);

      if (rest && rest.length) {
        if (['is', 'has'].includes(leader)) {
          this._addAssertion(key, key, is);
        }
      }
    });

    this._addAssertion('text', 'contains', contains);
  }

  _addAssertion(propName, assertionName, validator) {
    this[assertionName] = this._buildAssertion(...arguments);

    let { leader, rest } = parseKey(assertionName);

    const inversedAssetionName = (leader || '') + 'Not ' + rest.join('');
    this.not[assertionName] = this._buildAssertion(propName, inversedAssetionName, not(validator));
  }

  _buildAssertion(propName, assertionName, validator) {
    return (...assertionArgs) => {
      const arity = validator.length;
      const methodArgs = Array.prototype.slice.call(assertionArgs, 0, arity);

      let value = this.__po__[propName];
      if (typeof value === 'function') {
        value = value.apply(this.__po__, methodArgs);
      }

      let message = assertionArgs[arity] || `${humanizeString(assertionName)}`;
      if (methodArgs.length) {
        message += ` ${pretifyList(methodArgs)}`;
      }

      message = `${buildFullPath(this.__po__)}: ${message}`;

      let [expected, actual, result] = validator(value, ...assertionArgs)

      this.__pushResult({
        result,
        message,
        actual,
        expected
      });

      return this;
    }
  }

  __pushResult({
    result,
    message,
    actual,
    expected
  }) {
    if (typeof result !== 'boolean') {
      throw new Error('test result must be a boolean');
    }

    this.__testContext__.pushResult({
      result,
      actual,
      expected,
      message
    });
  }
}

function addPrefix(prefix, tail)  {
  return camelize(`${prefix} ${tail}`);
}

function humanizeString(input) {
  return decamelize(input).replace(/_/g, ' ');
}

function pretifyList(args) {
  return args.map(a => typeof a === 'string' ? `"${a}"` : a).join(', ')
}
