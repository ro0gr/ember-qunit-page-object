const apply = Function.prototype.call.bind(Function.prototype.apply);
const define = Object.defineProperty.bind(Object);

export default function not(validator) {
  return createFunction(validator.name, validator.length, function() {
    const [expected, actual, result] = validator(...arguments);

    return [expected, actual, !result];
  })
}

/**
 * Creates a function wrapper with a specified name and arity
 *
 * This is useful for `not()` predicate
 *
 * @param {String} name
 * @param {Number} arity
 * @param {Function} behaviour
 */
export function createFunction(name, arity, behaviour) {
  function f(){ return apply(behaviour, this, arguments); }

  define(f, "name", {
    value: name,
    writable: false,
    enumerable: false,
    configurable: true
  });

  define(f, "length", {
    value: arity,
    writable: false,
    enumerable: false,
    configurable: true
  });

  return f;
}

