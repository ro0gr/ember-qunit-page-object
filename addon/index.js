import { assign } from '@ember/polyfills';

import {
  create as upstreamCreate
} from 'ember-cli-page-object';

function buildDescriptor(node, keyName, descriptor /*, descriptorBuilder*/) {
  descriptor = assign({
    configurable: true,
    enumerable: true,
  }, descriptor);

  if (descriptor.value) {
    descriptor.writable = false;
  } else {
    descriptor.get = function() {
      return descriptor.get.call(this, keyName);
    };
  }

  if (typeof node.__propertyNames__ === 'undefined') {
    node.__propertyNames__ = [];
  }

  node.__propertyNames__.push(keyName);

  Object.defineProperty(node, keyName, descriptor);
}

export function create(definition/* , options = {} */) {
  // options = assign({
  //   builder: {
  //     descriptor: buildDescriptor
  //   }
  // }, options);

  // return upstreamCreate(definition, options);
  return upstreamCreate(definition);
}
