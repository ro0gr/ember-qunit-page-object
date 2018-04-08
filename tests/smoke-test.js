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

const defaultTemplate = hbs`<div class="screen">
  <div class="result">91</div>
</div>`;

const page = create({
    screen: {
      scope: '.screen',
      isDisabled: hasClass('disabled'),
      // isVeryDisabled: is(':disabled'),
      result: {
        text: text(),
        click: clickable(),
        scope: '.result'
      }
    }
});

module('smoke test', function(hooks) {
  setupRenderingTest(hooks);

  test('supports default "is" props', async function(assert) {
    await render(defaultTemplate);

    page.screen.as(s => {
      assert.po(s).isPresent();
      assert.po(s).isVisible();
    });
  });

  test('supports inverted default "is" props', async function(assert) {
    await render(defaultTemplate);

    assert.po(page.screen.result).isNotHidden();
  });


  test('supports chaining', async function(assert) {
    await render(defaultTemplate);

    assert.po(page.screen)
      .isPresent()
      .isVisible();
  });

  test('supports hasText', async function(assert) {
    await render(defaultTemplate);

    assert.po(page.screen.result).hasText('91');
  });

  skip('supports not', async function(assert) {
    await render(defaultTemplate);

    assert.po(page.screen).not.isHidden();
  });


  skip('supports contains', async function(assert) {
    await render(defaultTemplate);

    assert.po(page.screen.result).contains('91');

    assert.po(page.screen.result).doesNotContain('91');
    assert.po(page.screen.result).not.contains('91');
  });
})
