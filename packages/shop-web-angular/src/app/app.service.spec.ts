import { AppState } from './app.service';

describe('AppState', () => {
	it('stores values and returns them by name', () => {
		const state = new AppState();

		state.set('city', 'Sofia');

		expect(state.get('city')).toBe('Sofia');
		expect(state.get()).toEqual({ city: 'Sofia' });
	});

	it('keeps only JSON values (the state is cloned through JSON)', () => {
		const state = new AppState();
		state.set('when', new Date('2026-01-01T00:00:00Z'));
		state.set('fn', () => 1);

		expect(state.get('when')).toBe('2026-01-01T00:00:00.000Z');
		expect(state.get()).toEqual({ when: '2026-01-01T00:00:00.000Z' });
	});

	it('refuses a direct assignment of the state', () => {
		const state = new AppState();

		expect(() => (state.state = {})).toThrow(/do not mutate/);
	});
});
