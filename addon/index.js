import { assign } from '@ember/polyfills';
import ceibo from 'ceibo';

import {
  decamelize
} from '@ember/string';

import {
  create as upstreamCreate
} from 'ember-cli-page-object';

const DEFAULT_PROPS = [
  'text',
  'value',
  'isVisible',
  'isPresent',
  'isHidden'
];

const KNOWN_LEADERS = ['is', 'has', 'does'];

export function create(definition) {
  const builder = {
    object: objectBuilder,
    descriptor: descriptorBuilder
  };

  const propNamesTree = ceibo.create(definition, assign({ builder }));

  const page = upstreamCreate(definition);
  copyMetas(propNamesTree, page)

  return page;
}

function isKnownLeader(leader) {
  return (KNOWN_LEADERS.includes(leader));
}

function descriptorBuilder(target, blueprintKey, value, defaultBuilder) {
  defaultBuilder(target, blueprintKey, value);

  const [leader] = extractWords(blueprintKey);
  if (isKnownLeader(leader)) {
    target[blueprintKey].__propNames__.push(blueprintKey);
  } else {
    // Currently ember-cli-page-object doesn't provide an API for detecting
    // if the property is a getter like `text` or a function like a `clickable`
    //
    // It's a kind of dirty hack. We assume page `create` is called before
    // markup is rendered or an application is visited. So when we access a plain property
    // it immediatelly tries to find a parent scope which would throw an exception.
    try {
      target[blueprintKey]
    } catch (e) {
      target[blueprintKey].__propNames__.push(blueprintKey);
    }
  }
}

function objectBuilder(target, blueprintKey, blueprint /*, defaultBuilder */) {
  target[blueprintKey] = {
    __propNames__: DEFAULT_PROPS
  };

  return [target[blueprintKey], blueprint];
}

function copyMetas(from, to) {
  to.__propNames__ = from.__propNames__;

  Object.keys(from).forEach(k => {
    var isUnknown = !from.__propNames__.includes(k);

    if (isUnknown && isObject(from[k])
    ) {
      copyMetas(from[k], to[k]);
    }
  })
}

function isObject(o) {
  return !Array.isArray(o)
      && typeof o === 'object'
      && o !== null;
}

function extractWords(key) {
  return decamelize(key).split('_');
}
