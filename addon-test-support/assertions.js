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

    var getters = getterNames.reduce((props, propName) => {
      const { leader, rest } = parseKey(propName);

      const humanizedPropName = humanizeString(rest.join(''));
      props = props.concat([
        [leader, humanizedPropName]
      ]);

      return props;
    }, []);

    var methods = readMethodNames.reduce((props, propName) => {
      const property = parseKey(propName);

      if (property) {
        const { leader, rest } = property;

        humanizeString(rest.join(''));
        props = props.concat([
          [leader, rest]
        ]);
      }

      return props;
    }, []);

    getters.forEach(({ key, leader, rest }) => {
      if (rest && rest.length) {
        if (['is', 'has'].includes(leader)) {
          this._addAssertion(key, key, is, testContext);
        } else {
          this._addAssertion(key, addPrefix('has', key), equal, testContext);
        }
      }
    });

    methods.concat(getters).forEach(( { key, rest, leader } ) => {
      if (rest && rest.length) {
        if (['is', 'has'].includes(leader)) {
          this._addAssertion(key, key, is, testContext);
        }
      }
    });

    [].concat(getters, methods).forEach((prop) => {
      const { propName, assertionName, validator, leader, rest } = prop;

      this._buildAssertion(propName, assertionName, validator, testContext);

      const inversedAssetionName = (leader || '') + 'Not ' + rest.join('');
      this._buildAssertion(propName, inversedAssetionName, not(validator), testContext);
    }, []);

    this.this._buildAssertion('text', 'contains', contains, testContext);
  }

  _addAssertion(propName, assertionName, validator, testContext) {
    this[assertionName] = this._buildAssertion(...arguments);

    let { leader, rest } = parseKey(assertionName);

    const inversedAssetionName = (leader || '') + 'Not ' + rest.join('');
    this.not[assertionName] = this._buildAssertion(propName, inversedAssetionName, not(validator), testContext);
  }

  _buildAssertion(propName, assertionName, validator, testContext) {
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
      if (typeof result !== 'boolean') {
        throw new Error('test result must be a boolean');
      }

      testContext.pushResult({
        result,
        actual,
        expected,
        message
      });

      return this;
    }
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
