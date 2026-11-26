import { TestBed } from '@angular/core/testing';
import { ApolloClient, ApolloLink, gql } from '@apollo/client';
import { HttpLink } from 'apollo-angular/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { createApolloOptions } from './apollo-options';
import { Store } from './services/store';

describe('createApolloOptions', () => {
	let sentHeaders: Record<string, string> | undefined;
	let createdWith: { uri: string } | undefined;
	let token: string | null;

	beforeEach(() => {
		sentHeaders = undefined;
		token = null;

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
