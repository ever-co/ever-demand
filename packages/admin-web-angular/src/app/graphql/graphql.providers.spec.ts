import { ApolloLink } from '@apollo/client';
import { gql } from 'apollo-angular';
import { firstValueFrom, Observable } from 'rxjs';
import {
	createAuthLink,
	DEFAULT_OPTIONS,
	isSubscription,
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
					context: { headers: { 'x-app': 'admin' } },
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
