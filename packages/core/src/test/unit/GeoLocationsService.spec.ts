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

	it('still returns null without calling the network when credentials are missing', async () => {
		(service as any).arcgisClientSecret = '';

		const result = await service.getAddressByCoordinatesUsingArcGIS(42, 23);

		expect(result).toBeNull();
		expect(mockedAxios.post).not.toHaveBeenCalled();
		expect(mockedAxios.get).not.toHaveBeenCalled();
	});
});
