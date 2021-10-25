import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import { HttpLink, HttpLinkHandler } from 'apollo-angular/http';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { Store } from '../services/store.service';
import { environment } from '../environments/environment';

@NgModule({
	exports: [
		HttpClientModule
	]
})
export class GraphQLModule {
	constructor(
		private readonly apollo: Apollo,
		private readonly httpLink: HttpLink,
		private readonly store: Store
	) {
		const uri = environment.GQL_ENDPOINT;
		const http: HttpLinkHandler = httpLink.create({ uri });

		const authLink: ApolloLink = setContext((_, { headers }) => {
			// get the authentication token from local storage if it exists
			const token = store.token;
			// return the headers to the context so httpLink can read them
			return {
				headers: {
					...headers,
					authorization: token ? `Bearer ${token}` : '',
				},
			};
		});

		apollo.create({
			link: authLink.concat(http),
			defaultOptions: {
				watchQuery: {
					fetchPolicy: 'network-only',
					errorPolicy: 'ignore',
				},
				query: {
					fetchPolicy: 'network-only',
					errorPolicy: 'all',
				},
				mutate: {
					errorPolicy: 'all',
				},
			},
			cache: new InMemoryCache(),
		});
	}
}
