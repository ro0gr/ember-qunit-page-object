import { assign } from '@ember/polyfills';
import ceibo from 'ceibo';

import {
  decamelize
} from '@ember/string';

import {
  create as upstreamCreate
} from 'ember-cli-page-object';

import dsl from 'ember-cli-page-object/-private/dsl';

const KNOWN_MODIFIERS = ['is', 'has', 'does', 'will'];

const defaultKnownKeys = Object.keys(dsl).filter(k => {
  const [leader] = decamelize(k).split('_');
  return KNOWN_MODIFIERS.includes(leader)
});

// function descriptorBuilder(target, blueprintKey, /* value /*, defaultBuilder */) {
//   const [leader] = decamelize(blueprintKey).split('_');

//   if (KNOWN_MODIFIERS.includes(leader)) {
//     if (!target.__propNames__) {
//       target.__propNames__ = [];
//     }
//     const inverseKey = buildInverseKey(blueprintKey);

//     target.__propNames__ = target.__propNames__.concat([ blueprintKey, inverseKey ])
//   }
// }

// function defaultBuilder(target, blueprintKey, blueprint /*, defaultBuilder */) {
//   if (typeof blueprint !== 'object' && blueprint !== null) {

//     const [leader] = decamelize(blueprintKey).split('_');

//     if (KNOWN_MODIFIERS.includes(leader)) {
//       if (!target.__propNames__) {
//         target.__propNames__ = [];
//       }
//       const inverseKey = buildInverseKey(blueprintKey);

//       target.__propNames__ = target.__propNames__.concat([ blueprintKey, inverseKey ])
//     }
//   }
// }

function propsBuilder(target, blueprintKey, blueprint /*, defaultBuilder */) {
  target[blueprintKey] = {
    __propNames__: defaultKnownKeys
  };

  const knownKeys = Object.keys(blueprint).filter(k => {
    const [leader] = decamelize(k).split('_');
    return KNOWN_MODIFIERS.includes(leader)
  });

  if (knownKeys.length) {
    target[blueprintKey].__propNames__ = target[blueprintKey].__propNames__.concat(knownKeys);
  }

  return [target[blueprintKey], blueprint];
}

function syncPropNames(from, to) {
  to.__propNames__ = from.__propNames__;

  Object.keys(from).forEach(k => {
    if (
      !from.__propNames__.includes(k) // avoid getter property to be executed
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
    object: propsBuilder,
    // default: defaultBuilder,
    // descriptor: descriptorBuilder
  };

  const propNamesTree = ceibo.create(definition, assign({ builder }));

  const page = upstreamCreate(definition);
  syncPropNames(propNamesTree, page)

  return page;
}
