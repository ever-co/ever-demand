const SECRET = 'test-secret-value-9f8e7d';
const CLIENT_ID = 'test-client-id-123';

const mockLog = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

jest.mock('inversify', () => ({ injectable: () => (target: any) => target }));
jest.mock('@pyro/io', () => ({
	routerName: () => (target: any) => target,
	asyncListener: () => () => undefined,
}));
jest.mock('../../helpers/Log', () => ({
	createEverLogger: () => mockLog,
}));
jest.mock('../../env', () => ({
	env: {
		ARCGIS_CLIENT_ID: 'test-client-id-123',
		ARCGIS_CLIENT_SECRET: 'test-secret-value-9f8e7d',
	},
}));
jest.mock('axios', () => ({
	__esModule: true,
	default: { get: jest.fn(), post: jest.fn() },
}));

import axios from 'axios';
import { GeoLocationsService } from '../../services/geo-locations/GeoLocationsService';

const mockedAxios = axios as any;

const loggedText = () =>
	[mockLog.info, mockLog.warn, mockLog.error]
		.map((fn) => fn.mock.calls.map((args) => args.map(String).join(' ')))
		.reduce((all, calls) => all.concat(calls), [])
		.join('\n');

const requestedUrls = () =>
	[...mockedAxios.get.mock.calls, ...mockedAxios.post.mock.calls].map(
		(args: any[]) => String(args[0])
	);

describe('GeoLocationsService.getAddressByCoordinatesUsingArcGIS', () => {
	let service: GeoLocationsService;

	beforeEach(() => {
		jest.clearAllMocks();
		service = new GeoLocationsService();
	});

	it('sends the client secret in the POST body, never in a URL', async () => {
		mockedAxios.post.mockResolvedValue({
			status: 200,
			data: { access_token: 'tok' },
		});
		mockedAxios.get.mockResolvedValue({
			data: { address: { City: 'Sofia', Address: '12 Main St' } },
		});

		const result = await service.getAddressByCoordinatesUsingArcGIS(42, 23);

		expect(result).toEqual({ locality: 'Sofia', thoroughfare: 'Main St' });

		expect(mockedAxios.post).toHaveBeenCalledTimes(1);
		const [url, body] = mockedAxios.post.mock.calls[0];
		expect(url).toBe('https://www.arcgis.com/sharing/oauth2/token');
		const params = new URLSearchParams(String(body));
		expect(params.get('client_secret')).toBe(SECRET);
		expect(params.get('client_id')).toBe(CLIENT_ID);
		expect(params.get('grant_type')).toBe('client_credentials');

		for (const requestedUrl of requestedUrls()) {
			expect(requestedUrl).not.toContain(SECRET);
			expect(requestedUrl).not.toContain('client_secret');
		}
	});

	it('does not log the secret when no token is returned', async () => {
		mockedAxios.post.mockResolvedValue({
			status: 200,
			data: { error: { code: 400, message: 'Invalid client' } },
		});

		const result = await service.getAddressByCoordinatesUsingArcGIS(42, 23);

		expect(result).toBeNull();
		expect(mockedAxios.get).not.toHaveBeenCalled();
		expect(loggedText()).not.toContain(SECRET);
		expect(loggedText()).toContain('status 200');
	});

	it('redacts credentials echoed in the provider error message', async () => {
		mockedAxios.post.mockResolvedValue({
			status: 200,
			data: {
				error: {
					code: 400,
					message: `Invalid client_secret=${SECRET} for ${CLIENT_ID}`,
				},
			},
		});

		const result = await service.getAddressByCoordinatesUsingArcGIS(42, 23);

		expect(result).toBeNull();
		expect(loggedText()).not.toContain(SECRET);
		expect(loggedText()).not.toContain(CLIENT_ID);
		expect(loggedText()).toContain('[redacted]');
	});

	it('does not log the secret when the request throws an axios-like error', async () => {
		const err: any = new Error(
			`Request failed with status code 401 (client_secret=${SECRET})`
		);
		err.response = { status: 401 };
		err.config = {
			url: 'https://www.arcgis.com/sharing/oauth2/token',
			data: `client_secret=${SECRET}`,
		};
		mockedAxios.post.mockRejectedValue(err);

		const result = await service.getAddressByCoordinatesUsingArcGIS(42, 23);

		expect(result).toBeNull();
		expect(loggedText()).not.toContain(SECRET);
		expect(loggedText()).toContain('status 401');
	});

	it('sends the access token only in a header, never in the reverse-geocode URL', async () => {
		mockedAxios.post.mockResolvedValue({
			status: 200,
			data: { access_token: 'tok-abc/123' },
		});
		mockedAxios.get.mockResolvedValue({
			data: { address: { City: 'Sofia' } },
		});

		await service.getAddressByCoordinatesUsingArcGIS(42, 23);

		expect(mockedAxios.get).toHaveBeenCalledTimes(1);
		const [url, config] = mockedAxios.get.mock.calls[0];
		expect(String(url)).not.toContain('token=');
		expect(String(url)).not.toContain('tok-abc');
		expect(config.headers['X-Esri-Authorization']).toBe(
			'Bearer tok-abc/123'
		);
		const query = new URL(String(url)).searchParams;
		expect(query.get('forStorage')).toBe('true');
		expect(query.get('location')).toBe('23,42');
		expect(query.get('distance')).toBe('200');
		expect(query.get('f')).toBe('json');
	});

	describe('redaction of encoded credentials and the access token', () => {
		const SPECIAL_SECRET = 'se cret/&=+é';
		const URL_ENCODED = encodeURIComponent(SPECIAL_SECRET);
		const FORM_ENCODED = URL_ENCODED.replace(/%20/g, '+');

		beforeEach(() => {
			(service as any).arcgisClientSecret = SPECIAL_SECRET;
		});

		it.each([
			['URL-encoded', URL_ENCODED],
			['form-encoded', FORM_ENCODED],
		])('redacts the %s client secret in a provider error', async (_n, v) => {
			expect(v).not.toBe(SPECIAL_SECRET);
			mockedAxios.post.mockResolvedValue({
				status: 200,
				data: { error: { code: 400, message: `Bad request: ${v}` } },
			});

			await service.getAddressByCoordinatesUsingArcGIS(42, 23);

			expect(loggedText()).not.toContain(v);
			expect(loggedText()).toContain('[redacted]');
		});

		it('redacts the URLSearchParams-encoded secret and lowercase-hex forms', async () => {
			const tricky = "p!w'(d)~*/é x";
			(service as any).arcgisClientSecret = tricky;
			const body = new URLSearchParams({ client_secret: tricky }).toString();
			const echoed = body.slice('client_secret='.length);
			const lower = echoed.replace(/%[0-9A-F]{2}/g, (m) => m.toLowerCase());
			expect(echoed).toContain('%21'); // differs from encodeURIComponent
			mockedAxios.post.mockResolvedValue({
				status: 200,
				data: { error: { code: 400, message: `${echoed} ${lower}` } },
			});

			await service.getAddressByCoordinatesUsingArcGIS(42, 23);

			expect(loggedText()).not.toContain(echoed);
			expect(loggedText()).not.toContain(lower);
			expect(loggedText()).toContain('[redacted]');
		});

		it('redacts the access token in an empty-response log line', async () => {
			mockedAxios.post.mockResolvedValue({
				status: 200,
				data: { access_token: 'tok-echo-777' },
			});
			mockedAxios.get.mockResolvedValue({
				data: { echoed: 'tok-echo-777' },
			});

			const result = await service.getAddressByCoordinatesUsingArcGIS(
				42,
				23
			);

			expect(result).toBeNull();
			expect(loggedText()).not.toContain('tok-echo-777');
			expect(loggedText()).toContain('[redacted]');
		});

		it('redacts the access token echoed by a failing reverse-geocode request', async () => {
			const token = 'tok en/abc+123';
			mockedAxios.post.mockResolvedValue({
				status: 200,
				data: { access_token: token },
			});
			const variants = [
				token,
				encodeURIComponent(token),
				encodeURIComponent(token).replace(/%20/g, '+'),
			];
			const err: any = new Error(
				`Request failed: ${variants.join(' | ')}`
			);
			err.response = { status: 498 };
			mockedAxios.get.mockRejectedValue(err);

			const result = await service.getAddressByCoordinatesUsingArcGIS(
				42,
				23
			);

			expect(result).toBeNull();
			for (const variant of variants) {
				expect(loggedText()).not.toContain(variant);
			}
			expect(loggedText()).toContain('[redacted]');
			expect(loggedText()).toContain('status 498');
		});

		it('keeps the 200-character cap and leaves unrelated text intact', () => {
			const redact = (service as any).redact.bind(service);
			expect(redact('plain message')).toBe('plain message');
			expect(redact('x'.repeat(300)).length).toBe(203);
		});
	});

	it('still returns null without calling the network when credentials are missing', async () => {
		(service as any).arcgisClientSecret = '';

		const result = await service.getAddressByCoordinatesUsingArcGIS(42, 23);

		expect(result).toBeNull();
		expect(mockedAxios.post).not.toHaveBeenCalled();
		expect(mockedAxios.get).not.toHaveBeenCalled();
	});
});
