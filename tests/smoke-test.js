import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import {
  notHasClass,
  clickable,
  // collection
} from 'ember-cli-page-object';

import { create } from 'ember-cli-page-object-qunit/test-support';

// create({
//   scope: 'form',
//   name: '[name="name"]',
//   password: 'Password:',
//   gender: collection('[data-test=gender]'),
// });

const page = create({
  scope: '.screen',
  doesNotHaveNonExistingClass: notHasClass('non-existing-class-name'),
  // isVeryDisabled: is(':disabled'),
  result: {
    // ensure create doesn't fail with evaluated action
    click: clickable(),
    scope: '.result'
  },
  form: {
    name: {
      scope: '[name="name"]'
    }
  }
});

module('smoke test', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    await render(hbs`<div class="screen">
  <form>
    <input name="name">
    <input type="submit">
  </form>

  <div class="result">91</div>
</div>`);
  });

  test('supports default "is" props', async function(assert) {
    page.as(s => {
      assert.po(s).isPresent();
      assert.po(s).isVisible();
    });

    assert.equal(assert.test.assertions[0].message, 'root: is present');
    assert.equal(assert.test.assertions[1].message, 'root: is visible');
  });

  test('supports chaining', async function(assert) {
    assert.po(page)
      .isPresent()
      .isVisible();

    assert.equal(assert.test.assertions[0].message, 'root: is present');
    assert.equal(assert.test.assertions[1].message, 'root: is visible');
  });

  test('supports inverted default "is" props', async function(assert) {
    assert.po(page.result).not.isHidden();

    assert.equal(assert.test.assertions[0].message, 'result: is not hidden');
  });

  test('supports default hasText', async function(assert) {
    assert.po(page.result)
      .hasText('91')
      .not.hasText('non-existing')
      .hasText('91')
      .not.hasText('non-existing')
      .not.hasText('non-existing');

    assert.equal(assert.test.assertions[0].message, 'result: has text "91"');
    assert.equal(assert.test.assertions[1].message, 'result: has not text "non-existing"');
    assert.equal(assert.test.assertions[2].message, 'result: has text "91"');
    assert.equal(assert.test.assertions[3].message, 'result: has not text "non-existing"');
    assert.equal(assert.test.assertions[4].message, 'result: has not text "non-existing"');
  });

  test('supports default hasValue', async function(assert) {
    assert.po(page.form.name).hasValue('');
    assert.po(page.form.name).not.hasValue('blabla');

    assert.equal(assert.test.assertions[0].message, 'form/name: has value ""');
    assert.equal(assert.test.assertions[1].message, 'form/name: has not value "blabla"');
  });

  test('supports "not"', async function(assert) {
    assert.po(page).not.isHidden();
  });

  test('supports contains', async function(assert) {
    assert.po(page.result).contains('91');
    assert.po(page.result).not.contains('99');

    assert.equal(assert.test.assertions[0].message, 'result: contains "91"');
    assert.equal(assert.test.assertions[1].message, 'result: not contains "99"');
  });
});
