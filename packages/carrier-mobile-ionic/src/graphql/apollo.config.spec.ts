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

	// The tenant rules (common-angular tenantBeforeLogin) are tested in the merchant app's
	// apollo.config.spec.ts; here only that the carrier app sends them.
	it('names the tenant before login only, in requests and graphql-ws params', async () => {
		environment.TENANT = 'acme';
		const { client, seen } = clientWithFakeHttp();

		await client.query({ query: gql`query Ping { ping }` });
		expect(seen.headers).toEqual({ 'Tenant-Id': 'acme', authorization: '' });
		expect(subscriptionParams()).toEqual({ authorization: '', tenant: 'acme' });

		localStorage.setItem('token', 'jwt-1');
		expect(subscriptionParams()).toEqual({ authorization: 'Bearer jwt-1' });
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
