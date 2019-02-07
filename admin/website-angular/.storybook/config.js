import { configure } from '@storybook/angular';

function loadStories() {
	require('../src/stories/index.ts');
}

configure(loadStories, module);
