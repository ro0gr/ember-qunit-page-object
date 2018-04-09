import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';

import {
  hasClass,
  text,
  clickable
} from 'ember-cli-page-object';

import { create } from 'ember-cli-page-object-qunit';
import hbs from 'htmlbars-inline-precompile';

const page = create({
    screen: {
      scope: '.screen',
      // isVeryDisabled: is(':disabled'),
      result: {
        click: clickable(),
        scope: '.result'
      },
      form: {
        name: {
          scope: '[name="name"]'
        }
      }
    }
});

module('smoke test', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    await render(hbs`<div class="screen">
  <div class="result">91</div>
  <form>
    <input name="name" />
  </form>
</div>`);
  });

  test('supports default "is" props', async function(assert) {
    page.screen.as(s => {
      assert.po(s).isPresent();
      assert.po(s).isVisible();
    });
  });

  test('supports inverted default "is" props', async function(assert) {
    assert.po(page.screen.result).isNotHidden();
  });

  test('supports default hasText', async function(assert) {
    assert.po(page.screen.result).hasText('91');
    assert.po(page.screen.result).doesNotHaveText('non-existing');
  });

  test('supports default hasValue', async function(assert) {
    assert.po(page.screen.form.name).hasValue('1');
    assert.po(page.screen.form.name).doesNotHaveValue('blabla');
  });

  test('supports chaining', async function(assert) {
    assert.po(page.screen)
      .isPresent()
      .isVisible();
  });

  skip('supports not', async function(assert) {
    assert.po(page.screen).not.isHidden();
  });

  skip('supports contains', async function(assert) {
    assert.po(page.screen.result).contains('91');

    assert.po(page.screen.result).doesNotContain('91');
    assert.po(page.screen.result).not.contains('91');
  });
})
