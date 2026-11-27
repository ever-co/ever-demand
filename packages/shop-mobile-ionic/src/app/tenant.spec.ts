import { TestBed } from '@angular/core/testing';
import { ApolloClient, ApolloLink, gql } from '@apollo/client';
import { HttpLink } from 'apollo-angular/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { apolloOptionsFactory } from './app.module';
import { Store } from './services/store.service';
import { subscriptionParams } from './tenant';

// Tenant resolution of the shop (docs/multi-tenant/DESIGN.md §3.3): every
// GraphQL request names the shop's tenant, customers belong to one tenant.
describe('shop tenant', () => {
	const buildEnv = {
		TENANT: environment.TENANT,
		TENANT_BASE_DOMAIN: environment.TENANT_BASE_DOMAIN,
	};

	let sentHeaders: Record<string, string> | undefined;
	let token: string | null;

	beforeEach(() => {
		sentHeaders = undefined;
		token = null;
		environment.TENANT = '';
		environment.TENANT_BASE_DOMAIN = '';

		const httpLink = {
			create: () =>
				new ApolloLink(
					(operation) =>
						new Observable((observer) => {
							sentHeaders = operation.getContext()
								.headers as Record<string, string>;
							observer.next({ data: { ping: 'pong' } });
							observer.complete();
						}),
				),
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

	afterEach(() => {
		Object.assign(environment, buildEnv);
	});

	const query = gql`
		query Ping {
			ping
		}
	`;

	async function send() {
		const client = new ApolloClient(
			TestBed.runInInjectionContext(() => apolloOptionsFactory()),
		);
		await client.query({ query });
		return sentHeaders;
	}

	it('sends the Tenant-Id of a white-label build', async () => {
		environment.TENANT = 'acme';

		expect(await send()).toEqual({
			'Tenant-Id': 'acme',
			authorization: '',
		});
	});

	it('sends the tenant of a <slug>.<TENANT_BASE_DOMAIN> page host (web build)', async () => {
		environment.TENANT_BASE_DOMAIN = 'everdemand.co';
		vi.stubGlobal('location', {
			hostname: 'acme.everdemand.co',
			search: '',
		});

		expect(await send()).toEqual({
			'Tenant-Id': 'acme',
			authorization: '',
		});
	});

	it('prefers the build-time tenant over the page host', async () => {
		environment.TENANT = 'beta';
		environment.TENANT_BASE_DOMAIN = 'everdemand.co';
		vi.stubGlobal('location', {
			hostname: 'acme.everdemand.co',
			search: '',
		});

		expect((await send())['Tenant-Id']).toBe('beta');
	});

	it('sends the tenant of a ?tenant= link, and keeps it for later visits', async () => {
		vi.stubGlobal('location', {
			hostname: 'localhost',
			search: '?tenant=beta',
		});
		expect((await send())['Tenant-Id']).toBe('beta');

		vi.stubGlobal('location', { hostname: 'localhost', search: '' });
		expect((await send())['Tenant-Id']).toBe('beta');
	});

	it('sends the tenant next to the customer token', async () => {
		environment.TENANT = 'acme';
		token = 'jwt-1';

		expect(await send()).toEqual({
			'Tenant-Id': 'acme',
			authorization: 'Bearer jwt-1',
		});
	});

	it('sends no Tenant-Id when nothing names a tenant (single-tenant API)', async () => {
		environment.TENANT_BASE_DOMAIN = 'everdemand.co';
		vi.stubGlobal('location', {
			hostname: 'app.everdemand.co',
			search: '',
		});

		expect(await send()).toEqual({ authorization: '' });
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
