import React, { useContext } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { navigate } from 'gatsby';
import { AppContext, Provider, locate } from './Context';
import { config } from '../config';

describe('locate', () => {
	const settings = { ...config, defaultLatitude: null, defaultLongitude: null };

	it('uses the fixed location of the env', () => {
		const onLocation = vi.fn();

		locate(onLocation, {
			...settings,
			defaultLatitude: 1,
			defaultLongitude: 2,
		});

		expect(onLocation).toHaveBeenCalledWith([1, 2]);
	});

	it('asks the browser for the location', () => {
		const onLocation = vi.fn();
		const geolocation = {
			getCurrentPosition: (success: PositionCallback) =>
				success({
					coords: { latitude: 40, longitude: 20 },
				} as GeolocationPosition),
		} as Geolocation;

		locate(onLocation, settings, geolocation);

		expect(onLocation).toHaveBeenCalledWith([40, 20]);
	});

	it('falls back to Sofia when the browser refuses', () => {
		const onLocation = vi.fn();
		vi.spyOn(console, 'log').mockImplementation(() => {});
		const geolocation = {
			getCurrentPosition: (
				_: PositionCallback,
				failure: PositionErrorCallback,
			) => failure({ code: 1 } as GeolocationPositionError),
		} as Geolocation;

		locate(onLocation, settings, geolocation);

		expect(onLocation).toHaveBeenCalledWith([
			config.fallbackLatitude,
			config.fallbackLongitude,
		]);
		vi.restoreAllMocks();
	});

	it('falls back without a geolocation API', () => {
		const onLocation = vi.fn();

		locate(onLocation, settings, undefined);

		expect(onLocation).toHaveBeenCalledWith([
			config.fallbackLatitude,
			config.fallbackLongitude,
		]);
	});
});

describe('Provider', () => {
	function Probe() {
		const context = useContext(AppContext)!;
		return (
			<span>
				{context.coordinates ? context.coordinates.join(',') : 'none'}
			</span>
		);
	}

	it('sends a visitor without an account to the sign-up', async () => {
		render(
			<Provider>
				<Probe />
			</Provider>,
		);

		await waitFor(() => expect(navigate).toHaveBeenCalledWith('/login'));
	});

	it('lets a signed-up customer stay and provides the location', async () => {
		localStorage.setItem('user', JSON.stringify({ id: 'u1' }));

		render(
			<Provider>
				<Probe />
			</Provider>,
		);

		await waitFor(() =>
			expect(screen.getByText(/\d+(\.\d+)?,\d+/)).toBeTruthy(),
		);
		expect(navigate).not.toHaveBeenCalled();
	});
});
