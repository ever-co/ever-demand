import React from 'react';
import { renderToString } from 'react-dom/server';
import { render, screen } from '@testing-library/react';
import { useHydrated } from './hydrated';

function Probe() {
	return <span>{useHydrated() ? 'browser' : 'static'}</span>;
}

describe('useHydrated', () => {
	it('is false in the static HTML that Gatsby renders', () => {
		expect(renderToString(<Probe />)).toContain('static');
	});

	it('is true in the browser', () => {
		render(<Probe />);

		expect(screen.getByText('browser')).toBeTruthy();
	});
});
