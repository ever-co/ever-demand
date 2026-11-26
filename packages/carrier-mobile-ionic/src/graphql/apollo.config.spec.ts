import { ApolloClient, ApolloLink, gql } from '@apollo/client';
import { of } from 'rxjs';
import { environment } from '../environments/environment';
import { createApolloOptions, subscriptionParams } from './apollo.config';

describe('createApolloOptions', () => {
	const buildEnv = {
		TENANT: environment.TENANT,
		TENANT_BASE_DOMAIN: environment.TENANT_BASE_DOMAIN,
	};

	beforeEach(() => {
		environment.TENANT = '';
		environment.TENANT_BASE_DOMAIN = '';
	});

	afterEach(() => {
		Object.assign(environment, buildEnv);
		vi.unstubAllGlobals();
		localStorage.clear();
	});

	function clientWithFakeHttp() {
		const seen: { uri?: string; headers?: Record<string, string> } = {};
		const httpLink = {
			create: (options: { uri: string }) => {
				seen.uri = options.uri;
				return new ApolloLink((operation) => {
					seen.headers = operation.getContext().headers as Record<string, string>;
					return of({ data: { ping: 'pong' } });
				});
			},
		};
		const client = new ApolloClient(createApolloOptions(httpLink as any));
		return { client, seen };
	}

	it('sends queries to the GraphQL endpoint with the carrier token', async () => {
		localStorage.setItem('token', 'jwt-1');
		const { client, seen } = clientWithFakeHttp();

		const result = await client.query({ query: gql`query Ping { ping }` });

		expect(result.data).toEqual({ ping: 'pong' });
		expect(seen.uri).toBe('http://localhost:8443/graphql');
		expect(seen.headers.authorization).toBe('Bearer jwt-1');
	});

	it('sends an empty authorization header when logged out', async () => {
		const { client, seen } = clientWithFakeHttp();

		await client.query({ query: gql`query Ping { ping }` });

		expect(seen.headers.authorization).toBe('');
	});

	describe('tenant (docs/multi-tenant/DESIGN.md §3.3, §3.5)', () => {
		const query = gql`query Ping { ping }`;

		async function headersSent() {
			const { client, seen } = clientWithFakeHttp();
			await client.query({ query });
			return seen.headers;
		}

		it('names the tenant of a white-label build before login', async () => {
			environment.TENANT = 'acme';

			expect(await headersSent()).toEqual({ 'Tenant-Id': 'acme', authorization: '' });
		});

		it('names the tenant of a <slug>.<TENANT_BASE_DOMAIN> page host before login', async () => {
			environment.TENANT_BASE_DOMAIN = 'everdemand.co';
			vi.stubGlobal('location', { hostname: 'acme.everdemand.co', search: '' });

			expect(await headersSent()).toEqual({ 'Tenant-Id': 'acme', authorization: '' });
		});

		it('names no tenant when nothing resolves (the carrier login decides)', async () => {
			environment.TENANT_BASE_DOMAIN = 'everdemand.co';
			vi.stubGlobal('location', { hostname: 'localhost', search: '' });

			expect(await headersSent()).toEqual({ authorization: '' });
		});

		it('names no tenant once logged in: the token carries it', async () => {
			environment.TENANT = 'acme';
			localStorage.setItem('token', 'jwt-1');

			expect(await headersSent()).toEqual({ authorization: 'Bearer jwt-1' });
		});

		it('names the tenant in the graphql-ws connection params before login only', () => {
			expect(subscriptionParams()).toEqual({ authorization: '' });

			environment.TENANT = 'acme';
			expect(subscriptionParams()).toEqual({ authorization: '', tenant: 'acme' });

			localStorage.setItem('token', 'jwt-1');
			expect(subscriptionParams()).toEqual({ authorization: 'Bearer jwt-1' });
		});
	});

	it('keeps the Apollo 3 defaults: network-only, no loading emissions on polls', () => {
		const options = createApolloOptions({ create: () => ApolloLink.empty() } as any);

		expect(options.defaultOptions.watchQuery).toMatchObject({
			fetchPolicy: 'network-only',
			errorPolicy: 'ignore',
			notifyOnNetworkStatusChange: false,
		});
		expect(options.defaultOptions.query).toMatchObject({
			fetchPolicy: 'network-only',
			errorPolicy: 'all',
		});
	});
});
