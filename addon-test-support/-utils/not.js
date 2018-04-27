export default function not(validator) {
  // create validator inversion with the same arity
  return createFunction(validator.name, validator.length, function() {
    const [expected, actual, result] = validator(...arguments);

    return [expected, actual, !result];
  })
}

const apply = Function.prototype.call.bind(Function.prototype.apply);
const define = Object.defineProperty.bind(Object);

/**
 * Creates a function wrapper with a specified name and arity
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

