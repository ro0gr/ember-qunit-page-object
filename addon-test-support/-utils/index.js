import Ceibo from 'ceibo';
import { decamelize } from '@ember/string';

const KNOWN_LEADERS = ['is', 'has'];

export function isKnownLeader(leader) {
  return (KNOWN_LEADERS.includes(leader));
}

export function parseKey(key) {
  const words = decamelize(key).split('_');

  if (isKnownLeader(words[0])) {
    const [ leader, ...rest] = words;
    return {
      leader,
      rest
    };
  } else {
    return {
      leader: null,
      rest: words
    };
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
