import Ceibo from 'ceibo';

import {
  camelize,
  decamelize
} from '@ember/string';

export class Assertions {
  constructor(pageObject, testContext) {
    this.po = pageObject;
    this.testContext = testContext;

    this.po.__propNames__.forEach(key => {
      let inverseKey = buildInverseKey(key);

      this[key] = this.__wrap__(key, true, humanizeString(key))
      this[inverseKey] = this.__wrap__(key, false, humanizeString(inverseKey));
    });

    this.po.__immediatePropNames__ && this.po.__immediatePropNames__.forEach(key => {
      const withHas = __prefix('has', key);
      this[withHas] = this.__wrapImmediateProp__(key, true, humanizeString(withHas))

      const withDoesntHave = __prefix('doesNotHave', key);
      this[withDoesntHave] = this.__wrapImmediateProp__(key, false, humanizeString(withDoesntHave))
    });
  }

  __wrap__(k, isPositive = true, defaultMessage = undefined) {
    return (...assertionArgs) => {
      let message,
        actual;

      if (typeof this.po[k] === 'function') {
        const poMethod = this.po[k];
        const methodArgs = Array.prototype.slice.call(assertionArgs, 0, poMethod.length);

        message = assertionArgs[poMethod.length] || (defaultMessage + ' ' + argsToString(methodArgs));
        actual = poMethod.apply(this.po, methodArgs);
      } else {
        message = assertionArgs[0] || defaultMessage;
        actual = this.po[k];
      }

      this._pushResult(actual === (isPositive === true), message)

      return this;
    }
  }

  __wrapImmediateProp__(k, isPositive = true, defaultMessage = undefined) {
    return (expected, message) => {
      message =  message || `${defaultMessage} ${argsToString([expected])}`;

      const actual = trimWhitespace(this.po[k]);

      const result = expected === actual;

      this._pushResult(result === (isPositive === true), message, {
        expected,
        actual
      });

      return this;
    }
  }

  _pushResult(result, message, options = {}) {
    if (!message) {
      throw new Error('no message provided for the test result');
    }

    if (typeof result !== 'boolean') {
      throw new Error('test result must be a boolean');
    }

    let {
      actual = result,
      expected = true
    } = options;

    let prefix = `${buildFullPath(this.po)}`;

    message = `${prefix}: ${message}`;

    this.testContext.pushResult({
      result,
      actual,
      expected,
      message
    });
  }
}

function __prefix(prefix, tail)  {
  return camelize(`${prefix} ${tail.replace(/s$/, '')}`);
}

function trimWhitespace(string) {
  return string
    .replace(/[\t\r\n]/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/^ /, '')
    .replace(/ $/, '');
}

export function buildFullPath(node) {
  let path = [];
  let current = node;

  do {
    path.unshift(Ceibo.meta(current).key);
    current = Ceibo.parent(current)
  } while (Ceibo.parent(current));

  return path.join('/');
}

function humanizeString(input) {
  return decamelize(input).replace(/_/g, ' ');
}

function argsToString(args) {
  return args.map(a => typeof a === 'string' ? `"${a}"` : a).join(', ')
}

function buildInverseKey(key) {
  const [leader, ...restWords] = decamelize(key).split('_');

  if (restWords.length === 0) {
    return false;
    // return camelize(`doesNot ${leader.replace(/s$/, '')}`);
  }

  let inverseLeader;
  switch (leader) {
    case 'is': inverseLeader = 'isNot'; break;
    case 'has': inverseLeader = 'doesNotHave'; break;
    case 'have': inverseLeader = 'doesNotHave'; break;
  }

  return camelize([inverseLeader, ...restWords].join(' '));
}
