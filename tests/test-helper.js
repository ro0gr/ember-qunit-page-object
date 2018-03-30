import QUnit from 'qunit';
import { start } from 'ember-qunit';
import { setApplication } from '@ember/test-helpers';

import Application from '../app';
import config from '../config/environment';

import { Assertions } from './helpers';

QUnit.extend(QUnit.assert, {
    po(node) {
        return new Assertions(node, this);
    }
});

setApplication(Application.create(config.APP));

start();
