import Ceibo from 'ceibo';
import {
  camelize,
  decamelize
} from '@ember/string';

const KNOWN_LEADERS = ['is', 'has', 'does'];

export class Assertions {
  constructor(pageObject, testContext) {
    this.po = pageObject;
    this.testContext = testContext;

    this.po.__propNames__.forEach(key => {
      let [leader, ...restWords] = extractWords(key);
      if (isKnownLeader(leader)) {
        if (restWords && restWords.length ) {
          let inverseKey = buildInverse(leader, restWords);

          this[key] = this.__wrap__(key, true, humanizeString(key))
          this[inverseKey] = this.__wrap__(key, false, humanizeString(inverseKey));
        }
      } else {
        const withHas = addPrefix('has', key);
        const withDoesntHave = addPrefix('doesNotHave', key);

        this[withHas] = this.__wrapImmediateProp__(key, true, humanizeString(withHas))
        this[withDoesntHave] = this.__wrapImmediateProp__(key, false, humanizeString(withDoesntHave))
      }
    });
  }

  __wrap__(k, isPositive = true, defaultMessage = undefined) {
    return (...assertionArgs) => {
      let message,
        actual;

      if (typeof this.po[k] === 'function') {
        const poMethod = this.po[k];
        const arity = poMethod.length;
        const methodArgs = Array.prototype.slice.call(assertionArgs, 0, arity);

        message = assertionArgs[arity] || (defaultMessage + ' ' + pretifyList(methodArgs));
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
      message =  message || `${defaultMessage} ${pretifyList([expected])}`;

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

function addPrefix(prefix, tail)  {
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

function pretifyList(args) {
  return args.map(a => typeof a === 'string' ? `"${a}"` : a).join(', ')
}

function buildInverse(leader, restWords) {
  let inverse;
  switch (leader) {
    case 'is': inverse = 'isNot'; break;
    case 'has': inverse = 'doesNotHave'; break;
    case 'have': inverse = 'doesNotHave'; break;
  }

  if (restWords && restWords.length) {
    inverse = [inverse, ...restWords].join(' ');
  }

  return camelize(inverse);
}

function extractWords(key) {
  return decamelize(key).split('_');
}

function isKnownLeader(leader) {
  return (KNOWN_LEADERS.includes(leader));
}
