import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { create } from 'ember-cli-page-object-qunit';
import hbs from 'htmlbars-inline-precompile';

const page = create({
    screen: {
        scope: '.screen',
        result: {
            scope: 'result',
        }
    }
});

module('basic test', function(hooks) {
    setupRenderingTest(hooks);

    test('1', async function(assert) {
        await render(hbs`
<div class="screen">
</div>`);

        page.screen.as(s => {
            assert.po(s).isPresent();
            assert.po(s).isVisible();
            assert.po(s).isNotHidden();

            s.result.as(r => {
                assert.po(r).hasText('91');
                assert.po(r).contains('91');
                assert.po(r).doesNotContain('99');
            })
        });
    });
})
