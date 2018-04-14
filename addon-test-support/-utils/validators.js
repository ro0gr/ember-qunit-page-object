import { trimWhitespace } from './trim-whitespace';

export function is(value) {
  return [true, value, true === value];
}

export function equal(value, expected) {
  const actual = trimWhitespace(value);

  return [expected, actual, expected === actual];
}

export function contains(value, expected) {
  const actual = trimWhitespace(value);

  return [expected, actual, actual.includes(expected)];
}
