import Ceibo from 'ceibo';
import { decamelize } from '@ember/string';

const KNOWN_LEADERS = ['is', 'has'];

export function isKnownLeader(leader) {
  return (KNOWN_LEADERS.includes(leader));
}

export function parseKey(key) {
  const [ leader, ...rest] = decamelize(key).split('_');

  if (isKnownLeader(leader)) {
    return {
      key,
      leader,
      rest
    };
  } else if (leader) {
    if (rest && rest.length) {
      return {
        key,
        rest: key
      };
    }
  } else {
    return {
      key,
      rest: key
    };
  }
}

export function parseKey2(key) {
  const [ leader, ...rest ] = decamelize(key).split('_');

  if (leader) {
    if (isKnownLeader(leader)) {
      return {
        leader,
        rest
      };
    } else if (rest && rest.length) {
      return {
        rest: key
      };
    }
  }
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
