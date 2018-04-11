import { assign } from '@ember/polyfills';
import ceibo from 'ceibo';

import {
  decamelize
} from '@ember/string';

import {
  create as upstreamCreate
} from 'ember-cli-page-object';

export const KNOWN_LEADERS = ['is', 'has', 'does', 'will'];
const DEFAULT_STRING_PROPS = ['text', 'value'];
const DEFAULT_IS_PROPS = ['isVisible', 'isPresent', 'isHidden'];

export function isKnownLeader(leader) {
  return (KNOWN_LEADERS.includes(leader));
}
function descriptorBuilder(target, blueprintKey, value, defaultBuilder) {
  defaultBuilder(target, blueprintKey, value);

  const [leader] = decamelize(blueprintKey).split('_');
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
      target.__propNames__.push(blueprintKey);
      target.__immediatePropNames__.push(blueprintKey);
    }
  }
}

function objectBuilder(target, blueprintKey, blueprint /*, defaultBuilder */) {
  target[blueprintKey] = {
    __propNames__: DEFAULT_IS_PROPS,
    __immediatePropNames__: DEFAULT_STRING_PROPS
  };

  return [target[blueprintKey], blueprint];
}

function syncPropNames(from, to) {
  to.__propNames__ = from.__propNames__;
  to.__immediatePropNames__ = from.__immediatePropNames__;

  Object.keys(from).forEach(k => {
    if (
      !from.__propNames__.includes(k) // avoid getter property to be executed
      // && !from.__immediatePropNames__.includes(k) // avoid getter property to be executed
      && typeof from[k] === 'object'
      && from[k] !== null
      && typeof from[k].length === 'undefined'
    ) {
      syncPropNames(from[k], to[k]);
    }
  })
}

export function create(definition) {
  const builder = {
    object: objectBuilder,
    descriptor: descriptorBuilder
  };

  const propNamesTree = ceibo.create(definition, assign({ builder }));

  const page = upstreamCreate(definition);
  syncPropNames(propNamesTree, page)

  return page;
}
