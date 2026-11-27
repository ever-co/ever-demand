import { ApolloLink } from '@apollo/client';
import { gql } from 'apollo-angular';
import { firstValueFrom, Observable } from 'rxjs';
import { Store } from '../@core/data/store.service';
import {
	createAuthLink,
	createTenantLink,
	DEFAULT_OPTIONS,
	isSubscription,
	OWN_TENANT_CONTEXT,
	wsConnectionParams,
} from './graphql.providers';

describe('GraphQL client setup', () => {
	it('routes only subscriptions to graphql-ws', () => {
		expect(
			isSubscription(gql`
				subscription OnOrder {
					order {
						id
					}
				}
			`),
		).toBe(true);
		expect(
			isSubscription(gql`
				query Stores {
					getAllStores {
						id
					}
				}
			`),
		).toBe(false);
		expect(
			isSubscription(gql`
				mutation Remove($id: String!) {
					removeWarehouse(id: $id)
				}
			`),
		).toBe(false);
		// documents with several operations are matched by name
		const doc = gql`
			query A {
				a
			}
			subscription B {
				b
			}
		`;
		expect(isSubscription(doc, 'B')).toBe(true);
		expect(isSubscription(doc, 'A')).toBe(false);
	});

	async function headersSeenBy(
		link: ApolloLink,
		context: Record<string, unknown> = {},
	): Promise<Record<string, string>> {
		let seen: Record<string, string> = {};
		const terminating = new ApolloLink(
			(operation) =>
				new Observable((observer) => {
					seen = operation.getContext().headers as Record<
						string,
						string
					>;
					observer.next({ data: { ok: true } });
					observer.complete();
				}) as any,
		);
		const chain = ApolloLink.from([link, terminating]);
		const client: any = { queryDeduplication: false };
		await firstValueFrom(
			ApolloLink.execute(
				chain,
				{
					query: gql`
						query Ping {
							ok
						}
					`,
					context: { headers: { 'x-app': 'admin' }, ...context },
				},
				{ client },
			) as any,
		);
		return seen;
	}

	it('adds the bearer token from the store and keeps other headers', async () => {
		const headers = await headersSeenBy(createAuthLink(() => 'jwt-token'));
		expect(headers).toEqual({
			'x-app': 'admin',
			authorization: 'Bearer jwt-token',
		});
	});

	it('sends an empty authorization header when signed out', async () => {
		const headers = await headersSeenBy(createAuthLink(() => null));
		expect(headers.authorization).toBe('');
	});

	describe('Tenant-Id (multi-tenant, DESIGN.md §3.3)', () => {
		let store: Store;
		const chain = () =>
			ApolloLink.from([
				createAuthLink(() => store.token),
				// what provideGraphQL wires: only a super-admin's switch names a tenant
				createTenantLink(() => store.switchedTenant),
			]);

		beforeEach(() => {
			localStorage.clear();
			store = new Store();
			store.token = 'jwt';
		});

		afterEach(() => localStorage.clear());

		it('a normal admin never sends Tenant-Id (the token carries the tenant)', async () => {
			const headers = await headersSeenBy(chain());
			expect(headers).toEqual({
				'x-app': 'admin',
				authorization: 'Bearer jwt',
			});
			expect('Tenant-Id' in headers).toBe(false);
		});

		it('not even with a switch left from a super-admin session in the storage', async () => {
			store.isSuperAdmin = true;
			store.switchedTenant = 'tenant-b';
			store.isSuperAdmin = false;

			const headers = await headersSeenBy(chain());
			expect('Tenant-Id' in headers).toBe(false);
		});

		it('a super-admin on the platform tenant sends none', async () => {
			store.isSuperAdmin = true;
			const headers = await headersSeenBy(chain());
			expect('Tenant-Id' in headers).toBe(false);
		});

		it('a super-admin who switched sends Tenant-Id: <slug> on every operation', async () => {
			store.isSuperAdmin = true;
			store.switchedTenant = 'tenant-a';

			const headers = await headersSeenBy(chain());
			expect(headers).toEqual({
				'x-app': 'admin',
				authorization: 'Bearer jwt',
				'Tenant-Id': 'tenant-a',
			});
		});

		it("the admin's own record goes to its own tenant (OWN_TENANT_CONTEXT)", async () => {
			store.isSuperAdmin = true;
			store.switchedTenant = 'tenant-a';

			const headers = await headersSeenBy(chain(), OWN_TENANT_CONTEXT);
			expect('Tenant-Id' in headers).toBe(false);
			expect(headers.authorization).toBe('Bearer jwt');
		});

		it('graphql-ws connects with the token and the switched tenant', () => {
			expect(
				wsConnectionParams(
					() => null,
					() => null,
				),
			).toEqual({});
			expect(
				wsConnectionParams(
					() => 'jwt',
					() => null,
				),
			).toEqual({
				authorization: 'Bearer jwt',
			});
			expect(
				wsConnectionParams(
					() => 'jwt',
					() => 'tenant-a',
				),
			).toEqual({
				authorization: 'Bearer jwt',
				tenant: 'tenant-a',
			});
		});
	});

	it('keeps the defaults the screens were written for', () => {
		expect(DEFAULT_OPTIONS.watchQuery).toMatchObject({
			fetchPolicy: 'network-only',
			errorPolicy: 'ignore',
			notifyOnNetworkStatusChange: false,
		});
		expect(DEFAULT_OPTIONS.query).toMatchObject({
			fetchPolicy: 'network-only',
			errorPolicy: 'all',
		});
		expect(DEFAULT_OPTIONS.mutate).toMatchObject({ errorPolicy: 'all' });
	});
});
