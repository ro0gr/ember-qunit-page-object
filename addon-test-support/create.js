import { assign } from '@ember/polyfills';

import ceibo from 'ceibo';

// loading ember-cli-page-object API via import API from addon-test-support directory
// leads to magic ESLint failures
const { require } = window;
const upstreamCreate = require('ember-cli-page-object').create;
import { isKnownLeader, parseKey } from './-utils';

const DEFAULT_PROPS = [
  'text',
  'value',
  'isVisible',
  'isPresent',
  'isHidden'
];

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

function descriptorBuilder(target, blueprintKey, value, defaultBuilder) {
  defaultBuilder(target, blueprintKey, value);

  try {
    // Currently ember-cli-page-object doesn't provide an API for detecting
    // if the property is a getter like `text` or a function like a `clickable`
    //
    // It's a kind of dirty hack. We assume page `create` is called before
    // markup is rendered or an application is visited. So when we access a plain property
    // it immediatelly tries to find a parent scope which would throw an exception.
    // This allows us to detect if the property is a getter.
    const isMethod = typeof target[blueprintKey] === 'function';

    // if we reached this code path it means the property is not a getter
    const { leader } = parseKey(blueprintKey);
    if (isMethod && isKnownLeader(leader)) {
      target.__readMethodNames__.push(blueprintKey);
    }
  } catch (e) {
    target.__getterNames__.push(blueprintKey);
  }
}

function objectBuilder(target, blueprintKey, blueprint /*, defaultBuilder */) {
  target[blueprintKey] = {
    __getterNames__: DEFAULT_PROPS,
    __readMethodNames__: []
  };

  return [target[blueprintKey], blueprint];
}

function copyMetas(from, to) {
  to.__getterNames__ = from.__getterNames__;
  to.__readMethodNames__ = from.__readMethodNames__;


  Object.keys(from).forEach(k => {
    const isAGetter = from.__getterNames__.includes(k);

    if (!isAGetter && isObject(from[k])) {
      copyMetas(from[k], to[k]);
    }
  })
}

function isObject(o) {
  return !Array.isArray(o)
      && typeof o === 'object'
      && o !== null;
}
