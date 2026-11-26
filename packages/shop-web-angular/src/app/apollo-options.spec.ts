import { TestBed } from '@angular/core/testing';
import { ApolloClient, ApolloLink, gql } from '@apollo/client';
import { HttpLink } from 'apollo-angular/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { createApolloOptions, subscriptionParams } from './apollo-options';
import { Store } from './services/store';

describe('createApolloOptions', () => {
	let sentHeaders: Record<string, string> | undefined;
	let createdWith: { uri: string } | undefined;
	let token: string | null;

	const buildEnv = {
		TENANT: environment.TENANT,
		TENANT_BASE_DOMAIN: environment.TENANT_BASE_DOMAIN,
	};

	afterEach(() => {
		Object.assign(environment, buildEnv);
		vi.unstubAllGlobals();
		localStorage.clear();
	});

	beforeEach(() => {
		sentHeaders = undefined;
		token = null;
		environment.TENANT = '';
		environment.TENANT_BASE_DOMAIN = '';
		localStorage.clear();

		const httpLink = {
			create: (options: { uri: string }) => {
				createdWith = options;
				return new ApolloLink(
					(operation) =>
						new Observable((observer) => {
							sentHeaders = operation.getContext().headers as Record<
								string,
								string
							>;
							observer.next({ data: { ping: 'pong' } });
							observer.complete();
						})
				);
			},
		};

		TestBed.configureTestingModule({
			providers: [
				{ provide: HttpLink, useValue: httpLink },
				{
					provide: Store,
					useValue: {
						get token() {
							return token;
						},
					},
				},
			],
		});
	});

	const query = gql`
		query Ping {
			ping
		}
	`;

	function client() {
		return new ApolloClient(
			TestBed.runInInjectionContext(() => createApolloOptions())
		);
	}

	it('sends queries to the GraphQL endpoint of the environment', async () => {
		const result = await client().query({ query });

		expect(createdWith).toEqual({ uri: environment.GQL_ENDPOINT });
		expect(result.data).toEqual({ ping: 'pong' });
	});

	it('adds the bearer token of the customer', async () => {
		token = 'jwt-1';

		await client().query({ query });

		expect(sentHeaders).toEqual({ authorization: 'Bearer jwt-1' });
	});

	it('sends no authorization header without a token', async () => {
		await client().query({ query });

		expect(sentHeaders?.authorization).toBeUndefined();
	});

	describe('tenant (docs/multi-tenant/DESIGN.md §3.3)', () => {
		it('sends the Tenant-Id of a white-label build', async () => {
			environment.TENANT = 'acme';

			await client().query({ query });

			expect(sentHeaders).toEqual({ 'Tenant-Id': 'acme' });
		});

		it('sends the tenant of a <slug>.<TENANT_BASE_DOMAIN> page host', async () => {
			environment.TENANT_BASE_DOMAIN = 'everdemand.co';
			vi.stubGlobal('location', {
				hostname: 'acme.everdemand.co',
				search: '',
			});

			await client().query({ query });

			expect(sentHeaders).toEqual({ 'Tenant-Id': 'acme' });
		});

		it('sends the tenant of a ?tenant= link, and keeps it for later visits', async () => {
			vi.stubGlobal('location', { hostname: 'localhost', search: '?tenant=beta' });
			await client().query({ query });
			expect(sentHeaders).toEqual({ 'Tenant-Id': 'beta' });

			vi.stubGlobal('location', { hostname: 'localhost', search: '' });
			await client().query({ query });
			expect(sentHeaders).toEqual({ 'Tenant-Id': 'beta' });
		});

		it('sends the tenant next to the customer token', async () => {
			environment.TENANT = 'acme';
			token = 'jwt-1';

			await client().query({ query });

			expect(sentHeaders).toEqual({
				'Tenant-Id': 'acme',
				authorization: 'Bearer jwt-1',
			});
		});

		it('sends no Tenant-Id when nothing names a tenant (single-tenant API)', async () => {
			environment.TENANT_BASE_DOMAIN = 'everdemand.co';
			vi.stubGlobal('location', { hostname: 'app.everdemand.co', search: '' });

			await client().query({ query });

			expect(sentHeaders?.['Tenant-Id']).toBeUndefined();
		});

		it('names the tenant in the graphql-ws connection params', () => {
			expect(subscriptionParams(null)).toEqual({});

			environment.TENANT = 'acme';

			expect(subscriptionParams(null)).toEqual({ tenant: 'acme' });
			expect(subscriptionParams('jwt-1')).toEqual({
				tenant: 'acme',
				authorization: 'Bearer jwt-1',
			});
		});
	});

	it('loads every query from the network, as before', () => {
		const options = TestBed.runInInjectionContext(() =>
			createApolloOptions()
		);

		expect(options.defaultOptions).toEqual({
			watchQuery: { fetchPolicy: 'network-only', errorPolicy: 'ignore' },
			query: { fetchPolicy: 'network-only', errorPolicy: 'all' },
			mutate: { errorPolicy: 'all' },
		});
	});
});
