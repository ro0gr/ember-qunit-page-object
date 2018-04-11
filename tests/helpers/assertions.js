import Ceibo from 'ceibo';
import {
  camelize,
  decamelize
} from '@ember/string';

const KNOWN_LEADERS = ['is', 'has', 'does'];

const VALIDATORS = {
  equal(value, expected) {
    const actual = trimWhitespace(value);

    return [expected, actual, expected === actual];
  },

  notEqual() {
    const [expected, actual, result] = VALIDATORS.equal(...arguments);

    return [expected, actual, !result];
  },

  is(value) {
    return [true, value, true === value];
  },

  isNot(value) {
    return [false, value, false === value];
  }
}

export class Assertions {
  constructor(pageObject, testContext) {
    this.po = pageObject;
    this.testContext = testContext;

    this.po.__propNames__.forEach(key => {
      let [leader, ...restWords] = extractWords(key);
      if (isKnownLeader(leader)) {
        if (restWords && restWords.length ) {
          this._addAssertion(key, key, VALIDATORS.is);
          this._addAssertion(key, buildInverse(leader, restWords), VALIDATORS.isNot);
        }
      } else {
        this._addAssertion(key, addPrefix('has', key), VALIDATORS.equal);
        this._addAssertion(key, addPrefix('doesNotHave', key), VALIDATORS.notEqual);
      }
    });
  }

  _addAssertion(propName, assertionName, validator) {
    const humanAssertionName = humanizeString(assertionName);

    return this[assertionName] = (...assertionArgs) => {
      let message,
        value;

      if (typeof this.po[propName] === 'function') {
        const poMethod = this.po[propName];
        const arity = poMethod.length;
        const methodArgs = Array.prototype.slice.call(assertionArgs, 0, arity);

        message = assertionArgs[arity] || (humanAssertionName + ' ' + pretifyList(methodArgs));
        value = poMethod.apply(this.po, methodArgs);
      } else {
        message = assertionArgs[0] || humanAssertionName;
        value = this.po[propName];
      }

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

    if (!message) {
      throw new Error('no message provided for the test result');
    }

    message = `${buildFullPath(this.po)}: ${message}`;

    this.testContext.pushResult({
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
    inverse = addPrefix(inverse, restWords.join(' '));
  }

  return camelize(inverse);
}

function extractWords(key) {
  return decamelize(key).split('_');
}

function isKnownLeader(leader) {
  return (KNOWN_LEADERS.includes(leader));
}
